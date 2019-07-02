# parcel-plugin-subresource-integrity

Adds [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) attributes to any CSS and JS bundled files referenced from your [Parcel Bundler](https://parceljs.org/) entry HTML asset (index.html).

## Usage

No configuration is needed. Install the package using yarn or npm and build using Parcel.

The integrity attribute will be added to any asset referenced from a HTML parcel entry point. Specifically, the plugin scans the output HTML (typically your index.html) and inserts the integrity attribute on any link or script tags that reference local assets.

If you're using the publicURL option, the crossorigin="anonymous" attribute is also added.

Integrity attributes are only added in production (i.e. when running parcel build) as it tends to get out of sync easily in watch mode. By default, the SHA-384 hash algorithm will be used.
