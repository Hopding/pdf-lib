# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- Prefer Cantoo's maintained [`@cantoo/fontkit`](https://www.npmjs.com/package/@cantoo/fontkit)
  (≥2.0.9) for custom font embedding (devDependency, docs, web/Deno demos). It
  ships TypeScript types, a default export, and UMD builds
  (`dist/fontkit.umd.js` / `dist/fontkit.umd.min.js`). Upstream `fontkit` and
  `@pdf-lib/fontkit` remain supported via `registerFontkit`. Dropped the
  `@types/fontkit` devDependency.

## [2.9.2]

- Decrypt PDFs whose `/Encrypt` crypt filters (`/CF`, `/StdCF`, …) are
  indirect objects (e.g. iText 2.x). `CipherTransformFactory` now resolves
  those entries with `lookup` instead of `get`.

## [2.9.1]

- `PDFDocument.encrypt()` defaults to AES-256 (`/V 5`, `/R 6`, ISO 32000-2
  Algorithm 2.B) and accepts `algorithm` (`'AES-256'`, `'AES-128'`,
  `'RC4-128'`, `'RC4-40'`). RC4 requires `allowWeakCryptography: true`. The
  PDF header is raised to the minimum version the chosen cipher needs, and
  AES-256 on PDF 1.7 declares Adobe extension level 8. On Node 20.16+/22.3+,
  Algorithm 2.B uses the built-in `crypto` module when available (with a
  JavaScript fallback).
- `PDFDocument.encrypt()` no longer selects the cipher from the PDF header
  version (1.4 → RC4, 1.7 → AES-128, `1.7ext3` → AES-256 R5). It always
  defaults to AES-256 revision 6; pass `algorithm` for the older handlers.

## [2.9.0]

- `embedFacturX()` writes Factur-X `fx:ConformanceLevel` as `BASIC WL` (with a
  space), matching the profile URN. `'BASIC_WL'` is still accepted and
  normalised to the spaced form.
- `PDFDocument.convertToPDFA()` now Flate-compresses the OutputIntent ICC
  profile (`/Filter /FlateDecode`). PDF/A permits this on ICC streams; the XMP
  packet stays uncompressed.
- Drop the discontinued `crypto-js` dependency (and `@types/crypto-js`).
  Document encryption now uses the AES / RC4 / MD5 / SHA-256 implementations
  already vendored in `src/core/crypto.ts` for decryption, plus the Web Crypto
  API (`crypto.getRandomValues`) for secure randomness. No public API changed,
  and output is byte-for-byte identical given the same randomness.
- **`PDFDocument.encrypt()` now requires `crypto.getRandomValues`** — available
  in modern browsers, Node >= 18, Deno, and Bun. On Node < 18, or in React
  Native without a polyfill such as `react-native-get-random-values`,
  `encrypt()` throws a descriptive error instead of silently working (`crypto-js`
  4.2 fell back to `require('crypto')`). Nothing else in `pdf-lib` is affected.

## [2.8.4]

- `EmbedFontOptions.postscriptName` to select a face from TrueType/DFont
  collections (`.ttc` / `.dfont`) when embedding with fontkit.
- Harden custom-font / fontkit interop for upstream `fontkit` v2 and
  `@types/fontkit` (font collections, optional font tables, subset
  `includeGlyph` return values).
- Document the Node ESM `import * as fontkit from 'fontkit'` form for
  `registerFontkit` (upstream `fontkit` v2 has no default export).

## [2.8.2]

- Optional content (PDF layers) helpers: `PDFDocument.getOptionalContentGroups()`
  and `PDFDocument.setOptionalContentGroupVisibility()` update the default
  `/OCProperties` `/D` configuration (`/ON`, `/OFF`, `/BaseState`) so viewers
  open layers in the requested state. Also available via
  `catalog.getOCProperties()`.

## [2.8.1]

- `PDFPage.extractContents()` returns typed `PdfAsset[]` (text, images, and
  approximate vector `graphics` as SVG) from page content streams. Text is
  decoded via ToUnicode / WinAnsi and includes `x`, `y`, `fontSize`, and
  `fontFamily`. Image XObjects become JPEG or PNG bytes with page-space
  position. Painted paths become `kind: 'graphics'` with `getSvg()`. Form
  XObjects are traversed. Path-outlined text is not extracted as text.
- Keep catalog name trees for embedded files and document JavaScript in PDF
  lexical order by re-sorting flat `/Names` entries on insert (required by
  ISO 32000). Existing `/Kids` trees and other incompatible name-tree shapes
  are left untouched instead of creating an invalid sibling `/Names` array.
- `PDFForm.flatten()` now also flattens orphaned widget annotations that carry
  field properties (`/FT`, `/V`, …) on the page `Annots` entry but are not
  registered in `AcroForm.Fields` (text fields and stateful checkboxes / radios).
- Prefer maintained upstream [`fontkit`](https://www.npmjs.com/package/fontkit) v2 for custom
  font embedding. Subsetting now supports both `subset.encode()` (fontkit v2+) and
  `subset.encodeStream()` (`@pdf-lib/fontkit`), so existing registrations keep working.
- Upgrade direct `pako` dependency from v1 to v2, and force transitive
  `pako` installs to `^2.2.0` via Yarn `resolutions` / npm `overrides`
  (consumers should mirror this in their own root `package.json`).

### Notes

- Register upstream `fontkit` v2 in Node ESM with `import * as fontkit from 'fontkit'`.
  The package has no default export under the `node/import` condition, so
  `import fontkit from 'fontkit'` throws (`Missing 'default' export`). Bundlers
  and CommonJS still apply interop. `registerFontkit` needs the namespace object
  (it calls `.create`).

## [2.8.0]

- Convert documents to PDF/A-1/2/3 (`1B`, `2B`, `2U`, `3B`, `3U`) with
  `PDFDocument.convertToPDFA()` — OutputIntent (bundled sRGB), `/ID`, and XMP
  kept in sync with the Info dictionary on save.
- Embed Factur-X / ZUGFeRD invoice XML with `embedFacturX()` (PDF/A-3 hybrid +
  required XMP).
- Work with XFA forms: read signature fields, scripts, and related helpers on
  `PDFForm`.
- HTML closing tags that span multiple lines are parsed correctly.
- Saved PDFs keep their original `%PDF-x.y` header (writers no longer always
  force 1.7). Object streams on older files bump the header to 1.7 when needed.

### Notes

- PDF/A / Factur-X helpers add the structural pieces only — they do not rewrite
  page content or generate/validate invoice XML. Use embedded fonts and validate
  with veraPDF (and a Factur-X checker for e-invoices).

[2.9.1]: https://github.com/cantoo-scribe/pdf-lib/compare/v2.9.0...HEAD
[2.9.0]: https://github.com/cantoo-scribe/pdf-lib/compare/v2.8.4...v2.9.0
[2.8.4]: https://github.com/cantoo-scribe/pdf-lib/compare/v2.8.2...v2.8.4
[2.8.2]: https://github.com/cantoo-scribe/pdf-lib/compare/v2.8.1...v2.8.2
[2.8.1]: https://github.com/cantoo-scribe/pdf-lib/compare/v2.8.0...v2.8.1
[2.8.0]: https://github.com/cantoo-scribe/pdf-lib/compare/v2.7.4...v2.8.0
