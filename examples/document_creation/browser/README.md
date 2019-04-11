# Browser - Document Creation
This directory is a self-contained example of how to create a PDF document
using `pdf-lib` in a browser environment. It is implemented as a simple NPM module
that uses a version of `pdf-lib` published to NPM.

This example will produce the [this PDF](https://github.com/Hopding/pdf-lib/tree/master/examples/pdf_results/document_creation.pdf).

The example script ([`index.js`](https://github.com/Hopding/pdf-lib/tree/master/examples/document_creation/node/index.js)) contains detailed comments explaining each step in the process.

## Purpose of this Example
This example script demonstrates how to:
* Create a new PDF document.
* Draw text with a standard font.
* Draw text with an embedded font.
* Draw pictures of embedded PNG and JPG images.
* Draw vector graphics (shapes likes ellipses and rectangles).

It also shows how you load and save assets using the browser.

## Running the Example
You can download and run this example yourself with just a few commands:
```bash
git clone https://github.com/Hopding/pdf-lib.git
cd pdf-lib/examples/document_creation/browser
npm install
npm start
```

This will open a webserver [running on port 8080](http://localhost:8080). 
When you press the button on the website the pdf will be generated and
subsequently opened in your browser.

