# Node - Document Modification
This directory is a self-contained example of how to modify a PDF document
using `pdf-lib` in a Node environment. It is implemented as a simple NPM module
that uses a version of `pdf-lib` published to NPM.

This example will produce the [this PDF](https://github.com/Hopding/pdf-lib/tree/master/examples/pdf_results/document_modification.pdf).

The example script ([`index.js`](https://github.com/Hopding/pdf-lib/tree/master/examples/document_modification/node/index.js)) contains detailed comments explaining each step in the process.

## Purpose of this Example
This example script  demonstrates how to:
* Modify an existing PDF document.
* Draw text with a standard font.
* Draw text with an embedded font.
* Draw pictures of embedded PNG images.
* Draw vector graphics (shapes likes ellipses and rectangles).

## Running the Example
You can download and run this example yourself with just a few commands:
```bash
git clone https://github.com/Hopding/pdf-lib.git
cd pdf-lib/examples/document_modification/node
npm install
node index.js
```

The `index.js` script will modify a tax voucher PDF file using `pdf-lib` and save it to the directory alongside the script as `modified.pdf`. The script will also log the full path to the PDF.

If you're using a Mac, you can open the pdf from the command line with:
```bash
open modified.pdf
```
