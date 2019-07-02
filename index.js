const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const posthtml = require("posthtml");

const hashAlgorithm = "sha384";

const plugin = bundler => {
  // Only run when building - the integrity flag often breaks on watched files
  if (!bundler.options.production) return;
  const publicUrl = bundler.options.publicURL;

  bundler.on("bundled", bundle => {
    const bundles = Array.from(bundle.childBundles).concat([bundle]);

    const promises = bundles.map(async bundle => {
      if (!bundle.entryAsset || bundle.entryAsset.type !== "html") return;
      const cwd = bundle.entryAsset.options.outDir;

      const posthtmler = function(tree) {
        tree.match([{ tag: "script" }, { tag: "link" }], node => {
          let src = undefined;
          if (node.tag === "script") {
            src = node.attrs.src || "";
          } else {
            if (node.attrs.rel !== "stylesheet") return node;
            src = node.attrs.href || "";
          }
          src = src.trim();
          if (src.length === 0) return node;

          // Remote publicUrl if it's in use - also detect references to external files
          if (publicUrl) {
            if (!src.startsWith(publicUrl)) return node;
            src = src.substring(publicUrl.length);
          }
          const filename = path.join(cwd, src);
          if (!fs.existsSync(filename)) return node;

          const data = fs.readFileSync(filename, "utf8");
          const hash = crypto.createHash(hashAlgorithm);
          hash.update(data, "utf8");

          node.attrs.integrity = `${hashAlgorithm}-${hash.digest("base64")}`;
          if (publicUrl) node.attrs.crossorigin = "anonymous";
          return node;
        });
      };

      const data = fs.readFileSync(bundle.name, "utf-8");
      const result = await posthtml([posthtmler]).process(data);
      fs.writeFileSync(bundle.name, result.html);
    });

    return Promise.all(promises);
  });
};

module.exports = plugin;
