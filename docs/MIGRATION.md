
## From v1.x.x (>= v1.17.1) to v2.0.0 and above

The latest release of `pdf-lib` (`v2.0.0`) introduced a breaking change in the API for drawSVG, making it asynchronous. You'll also need to manually embed the images that might be contained inside your svg file.

### If your svg doesn't contain images

To update your code, you just need to convert it into synchronous mode:

```js
const svg = `<svg width="100" height="100">
  <rect y="0" x="0" width="100" height="100" fill="none" stroke="black"/>
  <rect y="25" x="25" width="50" height="50" fill="black"/>
</svg>`;
await pdfPage.drawSvg(svg)
```

Will become:

```js
const svg = `<svg width="100" height="100">
  <rect y="0" x="0" width="100" height="100" fill="none" stroke="black"/>
  <rect y="25" x="25" width="50" height="50" fill="black"/>
</svg>`;
pdfPage.drawSvg(svg)
```

### If your svg might contain an image

To update your code, you must call embedSvg first

```js
const svg = '<svg><image href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII="/></svg>'
const pdfSvg = await pdfDoc.embedSvg(svg)
pdfPage.drawSvg(pdfSvg)
```


## From v0.x.x to v1.0.0 and above

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
