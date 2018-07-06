<h1 align="center">pdf-lib</h1>

<div align="center">
  <strong>Create and modify PDF documents in any JavaScript environment.</strong>
</div>
<div align="center">
  Designed to work in any modern JavaScript runtime. Tested in Node, Browser, and React Native environments.
</div>

<br />

<div align="center">
  <!-- NPM version -->
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
  <!-- Build Status -->
  <a href="https://prettier.io/">
    <img
      src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square"
      alt="Build Status"
    />
  </a>
</div>

<div align="center">
  <h3>
    <a href="https://github.com/Hopding/pdf-lib/tree/master/docs">
      Documentation
    </a>
    <span> | </span>
    <a href="https://github.com/Hopding/pdf-lib/tree/master/examples">
      Examples
    </a>
  </h3>
</div>

## Table of Contents
* [Motivation](#motivation)
* [Features](#features)
* [Usage Examples](#usage-examples)
  * [Document Creation](#document-creation)
  * [Document Modification](#document-modification)
* [Installation](#installation)
* [API Documentation](#api-documentation)
* [Prior Art](#prior-art)
* [License](#license)

## Motivation
`pdf-lib` was created to address the JavaScript ecosystem's lack of robust support for PDF manipulation (especially for PDF _modification_).

Two of `pdf-lib`'s design requirements since its inception are to:
1. Support modification (editing) of existing documents.
2. Work in all JavaScript environments - not just in Node or the browser.

There are other good open source JavaScript PDF libraries available. However, most of them can only _create_ documents, they cannot _modify_ existing ones (e.g. [`pdfkit`](https://github.com/devongovett/pdfkit), [`jspdf`](https://github.com/MrRio/jsPDF), [`pdfmake`](https://github.com/bpampuch/pdfmake)). [`hummus`](https://github.com/galkahana/HummusJS) is a NodeJS library capable of both creating and modifying PDF documents. However, `hummus` is a Node wrapper around a [C++ library](https://github.com/galkahana/PDF-Writer). This means that it cannot run in _all_ JavaScript environments. For example, you cannot use `hummus` in the Browser or in React Native.

## Features
* Create new PDFs
* Modify existing PDFs
* Add Pages
* Insert Pages
* Remove Pages
* Draw Text
* Draw Images
* Draw Vector Graphics
* Embed Fonts
* Embed Images

## Usage Examples
More detailed examples are available [here](https://github.com/Hopding/pdf-lib/tree/master/examples).

### Document Creation
```javascript
import { PDFDocumentFactory, PDFDocumentWriter, drawText } from 'pdf-lib';

const pdfDoc = PDFDocumentFactory.create();
const [timesRomanFont] = pdfDoc.embedStandardFont('Times-Roman');

const page = pdfDoc
  .createPage([350, 500])
  .addFontDictionary('Times-Roman', timesRomanFont);

const contentStream = pdfDoc.createContentStream(
  drawText('Creating PDFs in JavaScript is awesome!', {
    x: 50,
    y: 450,
    size: 15,
    font: 'Times-Roman',
    colorRgb: [0, 0.53, 0.71],
  }),
);

page.addContentStreams(pdfDoc.register(contentStream));

pdfDoc.addPage(page);

const pdfBytes = PDFDocumentWriter.saveToBytes(pdfDoc);
```

### Document Modification
```javascript
import { PDFDocumentFactory, PDFDocumentWriter, drawText } from 'pdf-lib';

// This should be a Uint8Array.
// This data can be obtained in a number of different ways.
// If your running in a Node environment, you could use fs.readFile().
// In the browser, you could make a fetch() call and use res.arrayBuffer().
const existingPdfDocBytes = ...

const pdfDoc = PDFDocumentFactory.load(existingPdfDocBytes);
const [helveticaFont] = pdfDoc.embedStandardFont('Helvetica');

const pages = pdfDoc.getPages();
const page  = pages[0];

page.addFontDictionary('Helvetica', helveticaFont);

const contentStream = pdfDoc.createContentStream(
  drawText('This text was added to the PDF with JavaScript!', {
    x: 25,
    y: 25,
    size: 24,
    font: 'Helvetica',
    colorRgb: [0.95, 0.26, 0.21],
  }),
);

page.addContentStreams(pdfDoc.register(contentStream));

const pdfBytes = PDFDocumentWriter.saveToBytes(pdfDoc);
```

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

* https://unpkg.com/pdf-lib/dist/pdf-lib.js
* https://unpkg.com/pdf-lib/dist/pdf-lib.min.js

When using a UMD build, you will have access to a global `window.PDFLib` variable. This variable contains all of the classes and functions exported by `pdf-lib`. For example:

```javascript
// NPM module
import { PDFDocumentFactory, drawText } from 'pdf-lib';

// UMD module
var PDFDocumentFactory = PDFLib.PDFDocumentFactory;
var drawText = PDFLib.drawText;
```

## API Documentation
API documentation is available [here](https://github.com/Hopding/pdf-lib/tree/master/docs).

## Prior Art
* [`pdfkit`](https://github.com/devongovett/pdfkit) is a PDF generation library for Node and the Browser. This library was immensely helpful as a reference and existence proof when creating `pdf-lib`. `pdfkit`'s code for [font embedding](https://github.com/Hopding/pdf-lib/blob/AddDocumentation/src/core/pdf-structures/factories/PDFFontFactory.ts#L64-L68), [PNG embedding](https://github.com/Hopding/pdf-lib/blob/AddDocumentation/src/core/pdf-structures/factories/PNGXObjectFactory.ts#L19-L23), and [JPG embedding](https://github.com/Hopding/pdf-lib/blob/AddDocumentation/src/core/pdf-structures/factories/JPEGXObjectFactory.ts#L32-L36) was especially useful.
* [`jspdf`](https://github.com/MrRio/jsPDF) is a PDF generation library for the browser.
* [`pdfmake`](https://github.com/bpampuch/pdfmake) is a PDF generation library for the browser.
* [`hummus`](https://github.com/galkahana/HummusJS) is a PDF generation and modification library for Node environments. `hummus` is a Node wrapper around a [C++ library](https://github.com/galkahana/PDF-Writer).
* [`react-native-pdf-lib`](https://github.com/Hopding/react-native-pdf-lib) is a PDF generation and modification library for React Native environments. `react-native-pdf-lib` is a wrapper around [C++](https://github.com/galkahana/PDF-Writer) and [Java](https://github.com/TomRoush/PdfBox-Android) libraries.
* [`pdfassembler`](https://github.com/DevelopingMagic/pdfassembler) is a PDF generation and modification library for Node and the browser. It requires some knowledge about the logical structure of PDF document to use.

## License
[MIT](https://choosealicense.com/licenses/mit/)
