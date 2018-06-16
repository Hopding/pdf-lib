

# Functions

<a id="drawimage"></a>

## `<Const>` drawImage

▸ **drawImage**(name: * `string` &#124; `PDFName`*, options: *[IDrawImageOptions](../interfaces/_pdf_operators_helpers_composite_image_.idrawimageoptions.md)*): `PDFOperator`[]

*Defined in [pdf-operators/helpers/composite/image.ts:96](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-operators/helpers/composite/image.ts#L96)*

Draws an image object in a content stream. PNG and JPG image objects are supported.

```javascript
// Should be a Uint8Array containing a PNG image
const pngBytes = ...

const [pngImage, pngDims] = pdfDoc.embedPNG(pngBytes);
const contentStream = pdfDoc.register(
  pdfDoc.createContentStream(
    ...drawImage('MyPngImage', {
      x: 25,
      y: 50,
      width: pngDims.width * 0.5,   // Make the image 50% smaller
      height: pngDims.height * 0.5, // Make the image 50% smaller
    }),
  ),
);
const page = pdfDoc
  .createPage([250, 500])
  .addImageObject('MyPngImage', pngImage)
  .addContentStreams(contentStream);
```

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| name |  `string` &#124; `PDFName`|  Name of the image XObject to be drawn. Should be present in the XObject Dictionary of the page to which the content stream is applied. |
| options | [IDrawImageOptions](../interfaces/_pdf_operators_helpers_composite_image_.idrawimageoptions.md) |  An options object with named parameters. |

**Returns:** `PDFOperator`[]

___

