# pdf-lib

> **Create** and **modify** PDF documents in any JavaScript environment

<a href="https://www.npmjs.com/package/pdf-lib">
  <img alt="npm version" src="https://img.shields.io/npm/v/pdf-lib.svg?style=flat-square">
</a>

<a href="https://circleci.com/gh/Hopding/pdf-lib">
  <img alt="CircleCI Build Status" src="https://img.shields.io/circleci/project/github/Hopding/pdf-lib/master.svg?style=flat-square&label=CircleCI">
</a>

<a href="https://prettier.io/">
  <img alt="code style: prettier" src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square">
</a>  

`pdf-lib` is a library for **creating** and **modifying** PDF documents in JavaScript. It is designed to work in any modern JavaScript runtime (both **server-side** and **client-side**) and has been tested in Node, Browser, and React Native environments.

## Table of Contents
...

## Motivation
There are other open source JavaScript PDF libraries available. But most of them can only _create_ documents, they cannot _modify_ existing ones (e.g. [`pdfkit`](https://github.com/devongovett/pdfkit), [`jspdf`](https://github.com/MrRio/jsPDF), [`pdfmake`](https://github.com/bpampuch/pdfmake)). There is at least one NodeJS library ([`hummus`](https://github.com/galkahana/HummusJS)) capable of both creating and modifying PDF documents. However, `hummus` is a Node wrapper around a [C++ library](https://github.com/galkahana/PDF-Writer). This means that it cannot run in _all_ JavaScript environments. For example, you cannot use `hummus` in the Browser or in React Native.

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
### Document Creation
```javascript
import { PDFDocumentFactory, PDFDocumentWriter } from 'pdf-lib/core/pdf-document';
import { drawText } from 'pdf-lib/core/pdf-operators/helpers/composite';

const pdfDoc = PDFDocumentFactory.create();
const [timesRomanFont] = pdfDoc.embedStandardFont('Times-Roman');

const contentStream = pdfDoc.register(
  pdfDoc.createContentStream(
    ...drawText('Creating PDFs in JavaScript is awesome!', {
      x: 50,
      y: 450,
      size: 15,
      font: 'Times-Roman',
      colorRgb: [0, 0.53, 0.71],
    }),
  ),
);

const page = pdfDoc
  .createPage([350, 500])
  .addFontDictionary('Times-Roman', timesRomanFont)
  .addContentStreams(contentStream);

pdfDoc.addPage(page);

const pdfBytes = PDFDocumentWriter.saveToBytes(pdfDoc);
```

### Document Modification
```javascript
import { PDFDocumentFactory, PDFDocumentWriter } from 'pdf-lib/core/pdf-document';
import { drawText } from 'pdf-lib/core/pdf-operators/helpers/composite';

// This should be a Uint8Array.
// This data can be obtained in a number of different ways.
// If your running in a Node environment, you could use fs.readFile().
// In the browser, you could make a fetch() call and use res.arrayBuffer().
const existingPdfDocBytes = ...

const pdfDoc = PDFDocumentFactory.load(existingPdfDocBytes);
const [helveticaFont] = pdfDoc.embedStandardFont('Helvetica');

const contentStream = pdfDoc.register(
  pdfDoc.createContentStream(
    ...drawText('This text was added to the PDF with JavaScript!', {
      x: 25,
      y: 25,
      size: 24,
      font: 'Helvetica',
      colorRgb: [0.95, 0.26, 0.21],
    }),
  ),
);

const pages = pdfDoc.getPages();

pages[0]
  .addFontDictionary('Helvetica', helveticaFont)
  .addContentStreams(contentStream);

const pdfBytes = PDFDocumentWriter.saveToBytes(pdfDoc);
```

## Installation
```
npm install --save pdf-lib
```
or
```
yarn add pdf-lib
```

...API
...Prior Art
...Thanks

## License
[MIT](https://choosealicense.com/licenses/mit/)
