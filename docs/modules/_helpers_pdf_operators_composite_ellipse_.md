

# Functions

<a id="drawcircle"></a>

## `<Const>` drawCircle

▸ **drawCircle**(options: *[IDrawCircleOptions](../interfaces/_helpers_pdf_operators_composite_ellipse_.idrawcircleoptions.md)*): `PDFOperator`[]

*Defined in [helpers/pdf-operators/composite/ellipse.ts:333](https://github.com/Hopding/pdf-lib/blob/0d3a994/src/helpers/pdf-operators/composite/ellipse.ts#L333)*

Draws a circle in a content stream.

```javascript
const contentStream = pdfDoc.register(
  pdfDoc.createContentStream(
    drawCircle({
      x: 25,
      y: 50,
      size: 50,
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
| options | [IDrawCircleOptions](../interfaces/_helpers_pdf_operators_composite_ellipse_.idrawcircleoptions.md) |  An options object with named parameters. |

**Returns:** `PDFOperator`[]

___
<a id="drawellipse"></a>

## `<Const>` drawEllipse

▸ **drawEllipse**(options: *[IDrawEllipseOptions](../interfaces/_helpers_pdf_operators_composite_ellipse_.idrawellipseoptions.md)*): `PDFOperator`[]

*Defined in [helpers/pdf-operators/composite/ellipse.ts:185](https://github.com/Hopding/pdf-lib/blob/0d3a994/src/helpers/pdf-operators/composite/ellipse.ts#L185)*

Draws an ellipse in a content stream.

```javascript
const contentStream = pdfDoc.register(
  pdfDoc.createContentStream(
    drawEllipse({
      x: 25,
      y: 50,
      xScale: 50,
      yScale: 150,
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
| options | [IDrawEllipseOptions](../interfaces/_helpers_pdf_operators_composite_ellipse_.idrawellipseoptions.md) |  An options object with named parameters. |

**Returns:** `PDFOperator`[]

___

