# pdf-lib

[![NPM Version](https://img.shields.io/npm/v/pdf-lib.svg?style=flat-square)](https://www.npmjs.com/package/pdf-lib)
[![CircleCI Build Status](https://img.shields.io/circleci/project/github/Hopding/pdf-lib/master.svg?style=flat-square&label=CircleCI)](https://circleci.com/gh/Hopding/pdf-lib)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://prettier.io/)

> **Create** and **modify** PDF documents in any JavaScript environment.
>
> `pdf-lib` is designed to work in any modern JavaScript runtime (both **server-side** and **client-side**) and has been tested in Node, Browser, and React Native environments.

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

There are other good open source JavaScript PDF libraries available. However, most of them can only _create_ documents, they cannot _modify_ existing ones (e.g. [`pdfkit`](https://github.com/devongovett/pdfkit), [`jspdf`](https://github.com/MrRio/jsPDF), [`pdfmake`](https://github.com/bpampuch/pdfmake)). ([`hummus`](https://github.com/galkahana/HummusJS)) is a NodeJS library capable of both creating and modifying PDF documents. However, `hummus` is a Node wrapper around a [C++ library](https://github.com/galkahana/PDF-Writer). This means that it cannot run in _all_ JavaScript environments. For example, you cannot use `hummus` in the Browser or in React Native.

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
import { drawText } from 'pdf-lib/helpers/pdf-operators/composite';

const pdfDoc = PDFDocumentFactory.create();
const [timesRomanFont] = pdfDoc.embedStandardFont('Times-Roman');

const contentStream = pdfDoc.register(
  pdfDoc.createContentStream(
    drawText('Creating PDFs in JavaScript is awesome!', {
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
import { drawText } from 'pdf-lib/helpers/pdf-operators/composite';

// This should be a Uint8Array.
// This data can be obtained in a number of different ways.
// If your running in a Node environment, you could use fs.readFile().
// In the browser, you could make a fetch() call and use res.arrayBuffer().
const existingPdfDocBytes = ...

const pdfDoc = PDFDocumentFactory.load(existingPdfDocBytes);
const [helveticaFont] = pdfDoc.embedStandardFont('Helvetica');

const contentStream = pdfDoc.register(
  pdfDoc.createContentStream(
    drawText('This text was added to the PDF with JavaScript!', {
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

## API Documentation
This project's API documentation is written as [TypeDoc](http://typedoc.org/) comments. The generated markdown documentation is placed in the [`docs/`](https://github.com/Hopding/pdf-lib/tree/AddDocumentation/docs) directory of this repo.

## Prior Art
* [`pdfkit`](https://github.com/devongovett/pdfkit) is a PDF generation library for Node and the Browser. This library was immensely helpful as a reference and existence proof when creating `pdf-lib`. `pdfkit`'s code for [font embedding](https://github.com/Hopding/pdf-lib/blob/AddDocumentation/src/core/pdf-structures/factories/PDFFontFactory.ts#L64-L68), [PNG embedding](https://github.com/Hopding/pdf-lib/blob/AddDocumentation/src/core/pdf-structures/factories/PNGXObjectFactory.ts#L19-L23), and [JPG embedding](https://github.com/Hopding/pdf-lib/blob/AddDocumentation/src/core/pdf-structures/factories/JPEGXObjectFactory.ts#L32-L36) was especially useful.
* [`jspdf`](https://github.com/MrRio/jsPDF) is a PDF generation library for the browser.
* [`pdfmake`](https://github.com/bpampuch/pdfmake) is a PDF generation library for the browser.
* [`hummus`](https://github.com/galkahana/HummusJS) is a PDF generation and modification library for Node environments. `hummus` is a Node wrapper around a [C++ library](https://github.com/galkahana/PDF-Writer).
* [`react-native-pdf-lib`](https://github.com/Hopding/react-native-pdf-lib) is a PDF generation and modification library for React Native environments. `react-native-pdf-lib` is a wrapper around [C++](https://github.com/galkahana/PDF-Writer) and [Java](https://github.com/TomRoush/PdfBox-Android) libraries.

## License
[MIT](https://choosealicense.com/licenses/mit/)
