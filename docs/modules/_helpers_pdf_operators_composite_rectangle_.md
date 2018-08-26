

# Functions

<a id="drawrectangle"></a>

## `<Const>` drawRectangle

▸ **drawRectangle**(options: *[IDrawRectangleOptions](../interfaces/_helpers_pdf_operators_composite_rectangle_.idrawrectangleoptions.md)*): `PDFOperator`[]

*Defined in [helpers/pdf-operators/composite/rectangle.ts:162](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/helpers/pdf-operators/composite/rectangle.ts#L162)*

Draws a rectangle in a content stream.

```javascript
const contentStream = pdfDoc.register(
  pdfDoc.createContentStream(
    drawRectangle({
      x: 25,
      y: 50,
      width: 1000,
      height: 500,
      rotateDegrees: 45,
      skewDegrees: { xAxis: 30, yAxis: 30 },
      borderWidth: 25,
      colorRgb: [0.25, 1.0, 0.79],
      borderColorRgb: [0.79, 0.25, 1.0],
    }),
  ),
);
const page = pdfDoc
  .createPage([250, 500])
  .addContentStreams(contentStream);
```

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [IDrawRectangleOptions](../interfaces/_helpers_pdf_operators_composite_rectangle_.idrawrectangleoptions.md) |  An options object with named parameters. |

**Returns:** `PDFOperator`[]

___
<a id="drawsquare"></a>

## `<Const>` drawSquare

▸ **drawSquare**(options: *[IDrawSquareOptions](../interfaces/_helpers_pdf_operators_composite_rectangle_.idrawsquareoptions.md)*): `PDFOperator`[]

*Defined in [helpers/pdf-operators/composite/rectangle.ts:310](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/helpers/pdf-operators/composite/rectangle.ts#L310)*

Draws a square in a content stream.

```javascript
const contentStream = pdfDoc.register(
  pdfDoc.createContentStream(
    drawSquare({
      x: 25,
      y: 50,
      size: 500,
      rotateDegrees: 45,
      skewDegrees: { xAxis: 30, yAxis: 30 },
      borderWidth: 25,
      colorRgb: [0.25, 1.0, 0.79],
      borderColorRgb: [0.79, 0.25, 1.0],
    }),
  ),
);
const page = pdfDoc
  .createPage([250, 500])
  .addContentStreams(contentStream);
```

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [IDrawSquareOptions](../interfaces/_helpers_pdf_operators_composite_rectangle_.idrawsquareoptions.md) |  An options object with named parameters. |

**Returns:** `PDFOperator`[]

___

