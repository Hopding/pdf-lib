<a href="https://pdf-lib.js.org">
<h1 align="center">
<img alt="pdf-lib" height="300" src="https://raw.githubusercontent.com/Hopding/pdf-lib-docs/master/assets/logo-full.svg?sanitize=true">
</h1>
</a>

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

<br />

> **Learn more at [pdf-lib.js.org](https://pdf-lib.js.org)**

## Table of Contents

- [Features](#features)
- [Motivation](#motivation)
- [Usage Examples](#usage-examples)
  - [Create Document](#create-document)
  - [Modify Document](#modify-document)
  - [Copy Pages](#copy-pages)
  - [Embed PNG and JPEG Images](#embed-png-and-jpeg-images)
  - [Embed PDF Pages](#embed-pdf-pages)
  - [Embed Font and Measure Text](#embed-font-and-measure-text)
  - [Set Document Metadata](#set-document-metadata)
  - [Draw SVG Paths](#draw-svg-paths)
- [Complete Examples](#complete-examples)
- [Installation](#installation)
- [Documentation](#documentation)
- [Encryption Handling](#encryption-handling)
- [Migrating to v1.0.0](#migrating-to-v1)
- [Contributing](#contributing)
- [Tutorials and Cool Stuff](#tutorials-and-cool-stuff)
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
- Draw PDF Pages
- Draw Vector Graphics
- Draw SVG Paths
- Measure width and height of text
- Embed Fonts (supports UTF-8 and UTF-16 character sets)
- Set document metadata

## Motivation

`pdf-lib` was created to address the JavaScript ecosystem's lack of robust support for PDF manipulation (especially for PDF _modification_).

Two of `pdf-lib`'s distinguishing features are:

1. Supporting modification (editing) of existing documents.
2. Working in all JavaScript environments - not just in Node or the Browser.

There are [other](#prior-art) good open source JavaScript PDF libraries available. However, most of them can only _create_ documents, they cannot _modify_ existing ones. And many of them only work in particular environments.

## Usage Examples

### Create Document

_This example produces [this PDF](assets/pdfs/examples/create_document.pdf)._

[Try the JSFiddle demo](https://jsfiddle.net/Hopding/rxwsc8f5/13/)

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

[Try the JSFiddle demo](https://jsfiddle.net/Hopding/64zajhge/1/)

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

[Try the JSFiddle demo](https://jsfiddle.net/Hopding/ybank8s9/2/)

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

[Try the JSFiddle demo](https://jsfiddle.net/Hopding/bcya43ju/5/)

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

### Embed PDF Pages

_This example produces [this PDF](assets/pdfs/examples/embed_pdf_pages.pdf)_ (when [this PDF](assets/pdfs/american_flag.pdf) is used for the `americanFlagPdfBytes` variable and [this PDF](assets/pdfs/us_constitution.pdf) is used for the `usConstitutionPdfBytes` variable).

[Try the JSFiddle demo](https://jsfiddle.net/Hopding/Lyb16ocj/10/)

<!-- prettier-ignore -->
```js
import { PDFDocument } from 'pdf-lib'

// These should be Uint8Arrays or ArrayBuffers
// This data can be obtained in a number of different ways
// If your running in a Node environment, you could use fs.readFile()
// In the browser, you could make a fetch() call and use res.arrayBuffer()
const americanFlagPdfBytes = ...
const usConstitutionPdfBytes = ...

// Create a new PDFDocument
const pdfDoc = await PDFDocument.create()

// Embed the American flag PDF bytes
const [americanFlag] = await pdfDoc.embedPdf(americanFlagPdfBytes)

// Load the U.S. constitution PDF bytes
const usConstitutionPdf = await PDFDocument.load(usConstitutionPdfBytes)

// Embed the second page of the constitution and clip the preamble
const preamble = await pdfDoc.embedPage(usConstitutionPdf.getPages()[1], {
  left: 55,
  bottom: 485,
  right: 300,
  top: 575,
})

// Get the width/height of the American flag PDF scaled down to 30% of 
// its original size
const americanFlagDims = americanFlag.scale(0.3)

// Get the width/height of the preamble clipping scaled up to 225% of 
// its original size
const preambleDims = preamble.scale(2.25)

// Add a blank page to the document
const page = pdfDoc.addPage()

// Draw the American flag image in the center top of the page
page.drawPage(americanFlag, {
  ...americanFlagDims,
  x: page.getWidth() / 2 - americanFlagDims.width / 2,
  y: page.getHeight() - americanFlagDims.height - 150,
})

// Draw the preamble clipping in the center bottom of the page
page.drawPage(preamble, {
  ...preambleDims,
  x: page.getWidth() / 2 - preambleDims.width / 2,
  y: page.getHeight() / 2 - preambleDims.height / 2 - 50,
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

[Try the JSFiddle demo](https://jsfiddle.net/Hopding/rgu6ca59/2/)

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

### Set Document Metadata

_This example produces [this PDF](assets/pdfs/examples/set_document_metadata.pdf)_.

[Try the JSFiddle demo](https://jsfiddle.net/Hopding/vcwmfnbe/2/)

<!-- prettier-ignore -->
```js
import { PDFDocument, StandardFonts } from 'pdf-lib'

// Create a new PDFDocument
const pdfDoc = await PDFDocument.create()

// Embed the Times Roman font
const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)

// Add a page and draw some text on it
const page = pdfDoc.addPage([500, 600])
page.setFont(timesRomanFont)
page.drawText('The Life of an Egg', { x: 60, y: 500, size: 50 })
page.drawText('An Epic Tale of Woe', { x: 125, y: 460, size: 25 })

// Set all available metadata fields on the PDFDocument. Note that these fields
// are visible in the "Document Properties" section of most PDF readers.
pdfDoc.setTitle('🥚 The Life of an Egg 🍳')
pdfDoc.setAuthor('Humpty Dumpty')
pdfDoc.setSubject('📘 An Epic Tale of Woe 📖')
pdfDoc.setKeywords(['eggs', 'wall', 'fall', 'king', 'horses', 'men'])
pdfDoc.setProducer('PDF App 9000 🤖')
pdfDoc.setCreator('pdf-lib (https://github.com/Hopding/pdf-lib)')
pdfDoc.setCreationDate(new Date('2018-06-24T01:58:37.228Z'))
pdfDoc.setModificationDate(new Date('2019-12-21T07:00:11.000Z'))

// Serialize the PDFDocument to bytes (a Uint8Array)
const pdfBytes = await pdfDoc.save()

// For example, `pdfBytes` can be:
//   • Written to a file in Node
//   • Downloaded from the browser
//   • Rendered in an <iframe>
```

### Draw SVG Paths

_This example produces [this PDF](assets/pdfs/examples/draw_svg_paths.pdf)_.

[Try the JSFiddle demo](https://jsfiddle.net/Hopding/bwaomr9h/2/)

<!-- prettier-ignore -->
```js
import { PDFDocument, rgb } from 'pdf-lib'

// SVG path for a wavy line
const svgPath =
  'M 0,20 L 100,160 Q 130,200 150,120 C 190,-40 200,200 300,150 L 400,90'

// Create a new PDFDocument
const pdfDoc = await PDFDocument.create()

// Add a blank page to the document
const page = pdfDoc.addPage()
page.moveTo(100, page.getHeight() - 5)

// Draw the SVG path as a black line
page.moveDown(25)
page.drawSvgPath(svgPath)

// Draw the SVG path as a thick green line
page.moveDown(200)
page.drawSvgPath(svgPath, { borderColor: rgb(0, 1, 0), borderWidth: 5 })

// Draw the SVG path and fill it with red
page.moveDown(200)
page.drawSvgPath(svgPath, { color: rgb(1, 0, 0) })

// Draw the SVG path at 50% of its original size
page.moveDown(200)
page.drawSvgPath(svgPath, { scale: 0.5 })

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

You can also download `pdf-lib` as a UMD module from [unpkg](https://unpkg.com/#/) or [jsDelivr](https://www.jsdelivr.com/). The UMD builds have been compiled to ES5, so they should work [in any modern browser](https://caniuse.com/#feat=es5). UMD builds are useful if you aren't using a package manager or module bundler. For example, you can use them directly in the `<script>` tag of an HTML page.

The following builds are available:

- https://unpkg.com/pdf-lib/dist/pdf-lib.js
- https://unpkg.com/pdf-lib/dist/pdf-lib.min.js
- https://cdn.jsdelivr.net/npm/pdf-lib/dist/pdf-lib.js
- https://cdn.jsdelivr.net/npm/pdf-lib/dist/pdf-lib.min.js

> **NOTE:** if you are using the CDN scripts in production, you should include a specific version number in the URL, for example:
>
> - https://unpkg.com/pdf-lib@1.4.0/dist/pdf-lib.min.js
> - https://cdn.jsdelivr.net/npm/pdf-lib@1.4.0/dist/pdf-lib.min.js

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
- https://cdn.jsdelivr.net/npm/@pdf-lib/fontkit/dist/fontkit.umd.js
- https://cdn.jsdelivr.net/npm/@pdf-lib/fontkit/dist/fontkit.umd.min.js

> **NOTE:** if you are using the CDN scripts in production, you should include a specific version number in the URL, for example:
>
> - https://unpkg.com/@pdf-lib/fontkit@0.0.4/dist/fontkit.umd.min.js
> - https://cdn.jsdelivr.net/npm/@pdf-lib/fontkit@0.0.4/dist/fontkit.umd.min.js

When using a UMD build, you will have access to a global `window.fontkit` variable. To register the `fontkit` instance:

```js
var pdfDoc = await PDFLib.PDFDocument.create();
pdfDoc.registerFontkit(fontkit);
```

## Documentation

API documentation is available on the project site at https://pdf-lib.js.org/docs/api/.

The repo for the project site (and generated documentation files) is
located here: https://github.com/Hopding/pdf-lib-docs.

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

<h2 id="migrating-to-v1">Migrating to v1.0.0</h2>

The latest release of `pdf-lib` (`v1.0.0`) includes several breaking API changes. If you have code written for older versions of `pdf-lib` (`v0.x.x`), you can use the following instructions to help migrate your code to v1.0.0.

Note that many of the API methods are now asynchronous and return promises, so you'll need to `await` on them (or use promise chaining: `.then(res => ...)`).

- Rename _`PDFDocumentFactory`_ to **`PDFDocument`**. `PDFDocument.create` and `PDFDocument.load` are now async (they return promises), so you'll need to `await` on them.

* To create a new PDF document:

  ```js
  const pdfDoc = await PDFDocument.create();
  ```

* To retrieve and load a PDF where `pdfUrl` points to the PDF to be loaded:
  ```js
  const pdfBuffer = await fetch(pdfUrl).then((res) => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  ```

- The purpose of making these methods asynchronous is to avoid blocking the event loop (especially for browser-based usage). If you aren't running this code client-side and are not concerned about blocking the event loop, you can speed up parsing times with:

  ```js
  PDFDocument.load(..., { parseSpeed: ParseSpeeds.Fastest })
  ```

  You can do a similar thing for save:

  ```js
  PDFDocument.save({ objectsPerTick: Infinity });
  ```

- To draw content on a page in old versions of `pdf-lib`, you needed to create a content stream, invoke some operators, register the content stream, and add it to the document. Something like the following:

  ```js
  const contentStream = pdfDoc.createContentStream(
    drawText(
      timesRomanFont.encodeText('Creating PDFs in JavaScript is awesome!'),
      {
        x: 50,
        y: 450,
        size: 15,
        font: 'TimesRoman',
        colorRgb: [0, 0.53, 0.71],
      },
    ),
  );
  page.addContentStreams(pdfDoc.register(contentStream));
  ```

  However, in new versions of `pdf-lib`, this is much simpler. You simply invoke drawing methods on the page, such as [`PDFPage.drawText`](https://pdf-lib.js.org/docs/api/classes/pdfpage#drawtext), [`PDFPage.drawImage`](https://pdf-lib.js.org/docs/api/classes/pdfpage#drawimage), [`PDFPage.drawRectangle`](https://pdf-lib.js.org/docs/api/classes/pdfpage#drawrectangle), or [`PDFPage.drawSvgPath`](https://pdf-lib.js.org/docs/api/classes/pdfpage#drawsvgpath). So the above example becomes:

  ```js
  page.drawText('Creating PDFs in JavaScript is awesome!', {
    x: 50,
    y: 450,
    size: 15,
    font: timesRomanFont,
    color: rgb(0, 0.53, 0.71),
  });
  ```

  Please see the [Usage Examples](#usage-examples) for more in depth examples of drawing content on a page in the new versions of `pdf-lib`. You may also find the [Complete Examples](#complete-examples) to be a useful reference.

- Change _`getMaybe`_ function calls to **`get`** calls. If a property doesn't exist, then `undefined` will be returned. Note, however, that PDF name strings with need to be wrapped in `PDFName.of(...)`. For example, to look up the AcroForm object you'll need to change _`pdfDoc.catalog.getMaybe('AcroForm')`_ to **`pdfDoc.catalog.get(PDFName.of('AcroForm'))`**.

  ```js
  const acroForm = await pdfDoc.context.lookup(
    pdfDoc.catalog.get(PDFName.of('AcroForm')),
  );
  ```

  > v0.x.x converted the strings passed to `get` and `getMaybe` to `PDFName` objects, but v1.0.0 does not do this conversion for you. So you must always pass actual `PDFName` objects instead of strings.

- To find the AcroForm field references now becomes:
  ```js
  const acroFieldRefs = await pdfDoc.context.lookup(
    acroForm.get(PDFName.of('Fields')),
  );
  ```
- To add a new page replace _`pdfDoc.createPage([width, height])`_ with **`pdfDoc.addPage([width, height])`**
  ```js
  const page = pdfDoc.addPage([500, 750]);
  ```
  or simply:
  ```js
  const page = pdfDoc.addPage();
  ```

* To get the size of the page:

  ```js
  const { width, height } = page.getSize();
  page.getWidth();
  page.getHeight();
  ```

* To add images replace _`pdfDoc.embedPNG`_ with **`pdfDoc.embedPng`** and _`pdfDoc.embedJPG`_ with **`pdfDoc.embedJpg`**

* The `pdfDoc.embedPng` and `pdfDoc.embedJpg` methods now return `PDFImage` objects which have the width and height of the image as properties. You can also scale down the width and height by a constant factor using the `PDFImage.scale` method:
  ```js
  const aBigImage = await pdfDoc.embedPng(aBigImageBytes);
  const { width, height } = aBigImage.scale(0.25);
  ```
  So, `const [image, dims] = pdfDoc.embedJPG(mediaBuffer)` becomes:
  ```js
  const image = await pdfDoc.embedJpg(mediaBuffer);
  // image.width, image.height can be used instead of the dims object.
  ```
* To save the PDF replace _`PDFDocumentWriter.saveToBytes(pdfDoc)`_ with **`pdfDoc.save()`**

  ```js
  const pdfDocBytes = await pdfDoc.save();
  ```

* To display the saved PDF now becomes:

  ```js
  const pdfUrl = URL.createObjectURL(
    new Blob([await pdfDoc.save()], { type: 'application/pdf' }),
  );
  window.open(pdfUrl, '_blank');
  ```

  (note: `URL.revokeObjectURL` should be called later to free up memory)

* To get the PDF page count:

  ```js
  pdfDoc.getPages().length;
  ```

* To copy pages from one document to another you must now call **`destPdf.copyPages(srcPdf, srcPageIndexesArray)`** to copy pages. You can see an example of this in the [Copy Pages](#copy-pages) usage example. Admittedly, this API is slightly less ergonomic than what exists in v0.x.x, but it has two key benefits:

  1. It avoids making PDFDocument.addPage and PDFDocument.insertPage async.
     When copying multiple pages from the source document, the resulting merged document should have a smaller file size. This is because the page copying API that exists in v0.x.x was intended for copying just one or two pages.

  2. When copying large numbers of pages, it could result in redundant objects being created. This new page copying API should eliminate that.

  ```js
  async function mergePdfs(pdfsToMerge: string[]) {
    const mergedPdf = await PDFDocument.create();
    for (const pdfCopyDoc of pdfsToMerge) {
      const pdfBytes = fs.readFileSync(pdfCopyDoc);
      const pdf = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => {
        mergedPdf.addPage(page);
      });
    }
    const mergedPdfFile = await mergedPdf.save();
    return mergedPdfFile;
  }
  ```

* If required, you can retrieve the CropBox or MediaBox of a page like so:
  ```js
  const cropBox = page.node.CropBox() || page.node.MediaBox();
  ```

## Contributing

We welcome contributions from the open source community! If you are interested in contributing to `pdf-lib`, please take a look at the [CONTRIBUTING.md](CONTRIBUTING.md) file. It contains information to help you get `pdf-lib` setup and running on your machine. (We try to make this as simple and fast as possible! :rocket:)

## Tutorials and Cool Stuff

- [Möbius Printing helper](https://shreevatsa.net/mobius-print/) - a tool created by @shreevatsa
- [How to use pdf-lib in AWS Lambdas](https://medium.com/swlh/create-pdf-using-pdf-lib-on-serverless-aws-lambda-e9506246dc88) - a tutorial written by Crespo Wang

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
