<h1 align="center">
<img alt="pdf-lib" height="300" src="https://raw.githubusercontent.com/Hopding/pdf-lib-docs/master/assets/logo-full.svg?sanitize=true">
</h1>

<div align="center">
  <strong>Create and modify PDF documents in any JavaScript environment.</strong>
</div>
<div align="center">
  Designed to work in any modern JavaScript runtime. Tested in Node, Browser, and React Native environments.
</div>

<br />

<div align="center">
  <!-- NPM Version -->
  <a href="https://www.npmjs.com/package/pdf-lib">
    <img
      src="https://img.shields.io/npm/v/pdf-lib.svg?style=flat-square"
      alt="NPM Version"
    />
  </a>
  <!-- Build Status -->
  <a href="https://circleci.com/gh/Hopding/pdf-lib">
    <img
      src="https://img.shields.io/circleci/project/github/Hopding/pdf-lib/master.svg?style=flat-square&label=CircleCI"
      alt="CircleCI Build Status"
    />
  </a>
  <!-- Prettier Badge -->
  <a href="https://prettier.io/">
    <img
      src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square"
      alt="Prettier Badge"
    />
  </a>
</div>

## Table of Contents

- [Features](#features)
- [Motivation](#motivation)
- [Usage Examples](#usage-examples)
  - [Create Document](#create-document)
  - [Modify Document](#modify-document)
  - [Copy Pages](#copy-pages)
  - [Embed PNG and JPEG Images](#embed-png-and-jpeg-images)
  - [Embed Font and Measure Text](#embed-font-and-measure-text)
- [Complete Examples](#complete-examples)
- [Installation](#installation)
- [Encryption Handling](#encryption-handling)
- [Prior Art](#prior-art)
- [License](#license)

## Features

- Create new PDFs
- Modify existing PDFs
- Add Pages
- Insert Pages
- Remove Pages
- Copy pages between PDFs
- Draw Text
- Draw Images
- Draw Vector Graphics
- Measure width and height of text
- Embed Fonts (supports UTF-8 and UTF-16 character sets)

## Motivation

`pdf-lib` was created to address the JavaScript ecosystem's lack of robust support for PDF manipulation (especially for PDF _modification_).

Two of `pdf-lib`'s distinguishing features are:

1. Supporting modification (editing) of existing documents.
2. Working in all JavaScript environments - not just in Node or the Browser.

There are [other](#prior-art) good open source JavaScript PDF libraries available. However, most of them can only _create_ documents, they cannot _modify_ existing ones. And many of them only work in particular environments.

## Usage Examples

### Create Document

_This example produces [this PDF](assets/pdfs/examples/create_document.pdf)._

<!-- prettier-ignore -->
```js
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

// Create a new PDFDocument
const pdfDoc = await PDFDocument.create()

// Embed the Times Roman font
const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)

// Add a blank page to the document
const page = pdfDoc.addPage()

// Get the width and height of the page
const { width, height } = page.getSize()

// Draw a string of text toward the top of the page
const fontSize = 30
page.drawText('Creating PDFs in JavaScript is awesome!', {
  x: 50,
  y: height - 4 * fontSize,
  size: fontSize,
  font: timesRomanFont,
  color: rgb(0, 0.53, 0.71),
})

// Serialize the PDFDocument to bytes (a Uint8Array)
const pdfBytes = await pdfDoc.save()

// For example, `pdfBytes` can be:
//   • Written to a file in Node
//   • Downloaded from the browser
//   • Rendered in an <iframe>
```

### Modify Document

_This example produces [this PDF](assets/pdfs/examples/modify_document.pdf)_ (when [this PDF](assets/pdfs/with_update_sections.pdf) is used for the `existingPdfBytes` variable).

<!-- prettier-ignore -->
```js
import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// This should be a Uint8Array or ArrayBuffer
// This data can be obtained in a number of different ways
// If your running in a Node environment, you could use fs.readFile()
// In the browser, you could make a fetch() call and use res.arrayBuffer()
const existingPdfBytes = ...

// Load a PDFDocument from the existing PDF bytes
const pdfDoc = await PDFDocument.load(existingPdfBytes)

// Embed the Helvetica font
const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

// Get the first page of the document
const pages = pdfDoc.getPages()
const firstPage = pages[0]

// Get the width and height of the first page
const { width, height } = firstPage.getSize()

// Draw a string of text diagonally across the first page
firstPage.drawText('This text was added with JavaScript!', {
  x: 5,
  y: height / 2 + 300,
  size: 50,
  font: helveticaFont,
  color: rgb(0.95, 0.1, 0.1),
  rotate: degrees(-45),
})


// Serialize the PDFDocument to bytes (a Uint8Array)
const pdfBytes = await pdfDoc.save()

// For example, `pdfBytes` can be:
//   • Written to a file in Node
//   • Downloaded from the browser
//   • Rendered in an <iframe>
```

### Copy Pages

_This example produces [this PDF](assets/pdfs/examples/copy_pages.pdf)_ (when [this PDF](assets/pdfs/with_update_sections.pdf) is used for the `firstDonorPdfBytes` variable and [this PDF](assets/pdfs/with_large_page_count.pdf) is used for the `secondDonorPdfBytes` variable).

<!-- prettier-ignore -->
```js
import { PDFDocument } from 'pdf-lib'

// Create a new PDFDocument
const pdfDoc = await PDFDocument.create();

// These should be Uint8Arrays or ArrayBuffers
// This data can be obtained in a number of different ways
// If your running in a Node environment, you could use fs.readFile()
// In the browser, you could make a fetch() call and use res.arrayBuffer()
const firstDonorPdfBytes = ...
const secondDonorPdfBytes = ...

// Load a PDFDocument from each of the existing PDFs
const firstDonorPdfDoc = await PDFDocument.load(firstDonorPdfBytes)
const secondDonorPdfDoc = await PDFDocument.load(secondDonorPdfBytes)

// Copy the 1st page from the first donor document, and 
// the 743rd page from the second donor document
const [firstDonorPage] = await pdfDoc.copyPages(firstDonorPdfDoc, [0])
const [secondDonorPage] = await pdfDoc.copyPages(secondDonorPdfDoc, [742])

// Add the first copied page
pdfDoc.addPage(firstDonorPage)

// Insert the second copied page to index 0, so it will be the 
// first page in `pdfDoc`
pdfDoc.insertPage(0, secondDonorPage)

// Serialize the PDFDocument to bytes (a Uint8Array)
const pdfBytes = await pdfDoc.save()

// For example, `pdfBytes` can be:
//   • Written to a file in Node
//   • Downloaded from the browser
//   • Rendered in an <iframe>
```

### Embed PNG and JPEG Images

_This example produces [this PDF](assets/pdfs/examples/embed_png_and_jpeg_images.pdf)_ (when [this image](assets/images/cat_riding_unicorn.jpg) is used for the `jpgImageBytes` variable and [this image](assets/images/minions_banana_alpha.png) is used for the `pngImageBytes` variable).

<!-- prettier-ignore -->
```js
import { PDFDocument } from 'pdf-lib'

// These should be Uint8Arrays or ArrayBuffers
// This data can be obtained in a number of different ways
// If your running in a Node environment, you could use fs.readFile()
// In the browser, you could make a fetch() call and use res.arrayBuffer()
const jpgImageBytes = ...
const pngImageBytes = ...

// Create a new PDFDocument
const pdfDoc = await PDFDocument.create()

// Embed the JPG image bytes and PNG image bytes
const jpgImage = await pdfDoc.embedJpg(jpgImageBytes)
const pngImage = await pdfDoc.embedPng(pngImageBytes)

// Get the width/height of the JPG image scaled down to 25% of its original size
const jpgDims = jpgImage.scale(0.25)

// Get the width/height of the PNG image scaled down to 50% of its original size
const pngDims = pngImage.scale(0.5)

// Add a blank page to the document
const page = pdfDoc.addPage()

// Draw the JPG image in the center of the page
page.drawImage(jpgImage, {
  x: page.getWidth() / 2 - jpgDims.width / 2,
  y: page.getHeight() / 2 - jpgDims.height / 2,
  width: jpgDims.width,
  height: jpgDims.height,
})

// Draw the PNG image near the lower right corner of the JPG image
page.drawImage(pngImage, {
  x: page.getWidth() / 2 - pngDims.width / 2 + 75,
  y: page.getHeight() / 2 - pngDims.height,
  width: pngDims.width,
  height: pngDims.height,
})

// Serialize the PDFDocument to bytes (a Uint8Array)
const pdfBytes = await pdfDoc.save()

// For example, `pdfBytes` can be:
//   • Written to a file in Node
//   • Downloaded from the browser
//   • Rendered in an <iframe>
```

### Embed Font and Measure Text

`pdf-lib` relies on a sister module to support embedding custom fonts: [`@pdf-lib/fontkit`](https://www.npmjs.com/package/@pdf-lib/fontkit). You must add the `@pdf-lib/fontkit` module to your project and register it using `pdfDoc.registerFontkit(...)` before embedding custom fonts.

> **[See below for detailed installation instructions on installing `@pdf-lib/fontkit` as a UMD or NPM module.](#fontkit-installation)**

_This example produces [this PDF](assets/pdfs/examples/embed_font_and_measure_text.pdf)_ (when [this font](assets/fonts/ubuntu/Ubuntu-R.ttf) is used for the `fontBytes` variable).

<!-- prettier-ignore -->
```js
import { PDFDocument, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'

// This should be a Uint8Array or ArrayBuffer
// This data can be obtained in a number of different ways
// If your running in a Node environment, you could use fs.readFile()
// In the browser, you could make a fetch() call and use res.arrayBuffer()
const fontBytes = ...

// Create a new PDFDocument
const pdfDoc = await PDFDocument.create()

// Register the `fontkit` instance
pdfDoc.registerFontkit(fontkit)

// Embed our custom font in the document
const customFont = await pdfDoc.embedFont(fontBytes)

// Add a blank page to the document
const page = pdfDoc.addPage()

// Create a string of text and measure its width and height in our custom font
const text = 'This is text in an embedded font!'
const textSize = 35
const textWidth = customFont.widthOfTextAtSize(text, textSize)
const textHeight = customFont.heightAtSize(textSize)

// Draw the string of text on the page
page.drawText(text, {
  x: 40,
  y: 450,
  size: textSize,
  font: customFont,
  color: rgb(0, 0.53, 0.71),
})

// Draw a box around the string of text
page.drawRectangle({
  x: 40,
  y: 450,
  width: textWidth,
  height: textHeight,
  borderColor: rgb(1, 0, 0),
  borderWidth: 1.5,
})

// Serialize the PDFDocument to bytes (a Uint8Array)
const pdfBytes = await pdfDoc.save()

// For example, `pdfBytes` can be:
//   • Written to a file in Node
//   • Downloaded from the browser
//   • Rendered in an <iframe>
```

## Complete Examples

The [usage examples](#usage-examples) provide code that is brief and to the point, demonstrating the different features of `pdf-lib`. You can find complete working examples in the [`apps/`](apps/) directory. These apps are used to do manual testing of `pdf-lib` before every release (in addition to the [automated tests](tests/)).

There are currently three apps:

- [**`node`**](apps/node/) - contains [tests](apps/node/tests/) for `pdf-lib` in Node environments. These tests are a handy reference when trying to save/load PDFs, fonts, or images with `pdf-lib` from the filesystem. They also allow you to quickly open your PDFs in different viewers (Acrobat, Preview, Foxit, Chrome, Firefox, etc...) to ensure compatibility.
- [**`web`**](apps/web/) - contains [tests](apps/web/) for `pdf-lib` in browser environments. These tests are a handy reference when trying to save/load PDFs, fonts, or images with `pdf-lib` in a browser environment.
- [**`rn`**](apps/rn) - contains [tests](apps/rn/src/tests/) for `pdf-lib` in React Native environments. These tests are a handy reference when trying to save/load PDFs, fonts, or images with `pdf-lib` in a React Native environment.

## Installation

### NPM Module

To install the latest stable version:

```bash
# With npm
npm install --save pdf-lib

# With yarn
yarn add pdf-lib
```

This assumes you're using [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/lang/en/) as your package manager.

### UMD Module

You can also download `pdf-lib` as a UMD module from [unpkg](https://unpkg.com/#/). The UMD builds have been compiled to ES5, so they should work [in any modern browser](https://caniuse.com/#feat=es5). UMD builds are useful if you aren't using a package manager or module bundler. For example, you can use them directly in the `<script>` tag of an HTML page.

The following builds are available:

- https://unpkg.com/pdf-lib/dist/pdf-lib.js
- https://unpkg.com/pdf-lib/dist/pdf-lib.min.js

When using a UMD build, you will have access to a global `window.PDFLib` variable. This variable contains all of the classes and functions exported by `pdf-lib`. For example:

```javascript
// NPM module
import { PDFDocument, rgb } from 'pdf-lib';

// UMD module
var PDFDocument = PDFLib.PDFDocument;
var rgb = PDFLib.rgb;
```

## Fontkit Installation

`pdf-lib` relies upon a sister module to support embedding custom fonts: [`@pdf-lib/fontkit`](https://www.npmjs.com/package/@pdf-lib/fontkit). You must add the `@pdf-lib/fontkit` module to your project and register it using `pdfDoc.registerFontkit(...)` before embedding custom fonts (see the [font embedding example](#embed-font-and-measure-text)). This module is not included by default because not all users need it, and it increases bundle size.

Installing this module is easy. Just like `pdf-lib` itself, `@pdf-lib/fontkit` can be installed with `npm`/`yarn` or as a UMD module.

### Fontkit NPM Module

```bash
# With npm
npm install --save @pdf-lib/fontkit

# With yarn
yarn add @pdf-lib/fontkit
```

To register the `fontkit` instance:

```js
import { PDFDocument } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

const pdfDoc = await PDFDocument.create();
pdfDoc.registerFontkit(fontkit);
```

### Fontkit UMD Module

The following builds are available:

- https://unpkg.com/@pdf-lib/fontkit/dist/fontkit.umd.js
- https://unpkg.com/@pdf-lib/fontkit/dist/fontkit.umd.min.js

When using a UMD build, you will have access to a global `window.fontkit` variable. To register the `fontkit` instance:

```js
var pdfDoc = await PDFLib.PDFDocument.create();
pdfDoc.registerFontkit(fontkit);
```

## Encryption Handling

`pdf-lib` does not currently support modification of encrypted documents. In general, it is not advised to use `pdf-lib` with encrypted documents. However, this is a feature that could be added to `pdf-lib`. Please [create an issue](https://github.com/Hopding/pdf-lib/issues/new) if you would find this feature helpful!

When an encrypted document is passed to `PDFDocument.load(...)`, an error will be thrown:

<!-- prettier-ignore -->
```js
import { PDFDocument, EncryptedPDFError } from 'pdf-lib'

const encryptedPdfBytes = ...

// Assignment fails. Throws an `EncryptedPDFError`.
const pdfDoc = PDFDocument.load(encryptedPdfBytes)
```

This default behavior is usually what you want. It allows you to easily detect if a given document is encrypted, and it prevents you from trying to modify it. However, if you really want to load the document, you can use the `{ ignoreEncryption: true }` option:

```js
import { PDFDocument } from 'pdf-lib'

const encryptedPdfBytes = ...

// Assignment succeeds. Does not throw an error.
const pdfDoc = PDFDocument.load(encryptedPdfBytes, { ignoreEncryption: true })
```

Note that **using this option does not decrypt the document**. This means that any modifications you attempt to make on the returned `PDFDocument` may fail, or have unexpected results.

## Prior Art

- [`pdfkit`](https://github.com/devongovett/pdfkit) is a PDF generation library for Node and the Browser. This library was immensely helpful as a reference and existence proof when creating `pdf-lib`. `pdfkit`'s code for [font embedding](src/core/embedders/CustomFontEmbedder.ts#L17-L21), [PNG embedding](src/core/embedders/PngEmbedder.ts#L7-L11), and [JPG embedding](src/core/embedders/JpegEmbedder.ts#L25-L29) was especially useful.
- [`pdf.js`](https://github.com/mozilla/pdf.js) is a PDF rendering library for the Browser. This library was helpful as a reference when writing `pdf-lib`'s parser. Some of the code for stream decoding was [ported directly to TypeScript](src/core/streams) for use in `pdf-lib`.
- [`jspdf`](https://github.com/MrRio/jsPDF) is a PDF generation library for the browser.
- [`pdfmake`](https://github.com/bpampuch/pdfmake) is a PDF generation library for the browser.
- [`hummus`](https://github.com/galkahana/HummusJS) is a PDF generation and modification library for Node environments. `hummus` is a Node wrapper around a [C++ library](https://github.com/galkahana/PDF-Writer), so it doesn't work in many JavaScript environments - like the Browser or React Native.
- [`react-native-pdf-lib`](https://github.com/Hopding/react-native-pdf-lib) is a PDF generation and modification library for React Native environments. `react-native-pdf-lib` is a wrapper around [C++](https://github.com/galkahana/PDF-Writer) and [Java](https://github.com/TomRoush/PdfBox-Android) libraries.
- [`pdfassembler`](https://github.com/DevelopingMagic/pdfassembler) is a PDF generation and modification library for Node and the browser. It requires some knowledge about the logical structure of PDF documents to use.

## License

[MIT](LICENSE.md)
