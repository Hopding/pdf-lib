# Node - Measuring Text
This directory is a self-contained example of how to measure text in standard 
and nonstandard fonts using `pdf-lib` in a Node environment. It is implemented
as a simple NPM module that uses a version of `pdf-lib` published to NPM.

This example will produce the [this PDF](https://github.com/Hopding/pdf-lib/tree/master/examples/pdf_results/measuring_text.pdf).

The example script ([`index.js`](https://github.com/Hopding/pdf-lib/tree/master/examples/measuring_text/node/index.js)) 
contains detailed comments explaining each step in the process.

## Purpose of this Example
This example script  demonstrates how to:
* Embed a standard font
* Measure the width of text in a standard font
* Measure the height of text in a standard font
* Embed a nonstandard font
* Measure the width of text in a nonstandard font
* Measure the height of text in a nonstandard font

## Running the Example
You can download and run this example yourself with just a few commands:
```bash
git clone https://github.com/Hopding/pdf-lib.git
cd pdf-lib/examples/measuring_text/node
npm install
node index.js
```

The `index.js` script will create a PDF file using `pdf-lib` and save it to the 
directory alongside the script as `out.pdf`. The script will also log the full 
path to the PDF.

If you're using a Mac, you can open the pdf from the command line with:
```bash
open out.pdf
```
