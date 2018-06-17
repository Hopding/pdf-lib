

# Functions

<a id="drawcircle"></a>

## `<Const>` drawCircle

▸ **drawCircle**(options: *[IDrawCircleOptions](../interfaces/_helpers_pdf_operators_composite_ellipse_.idrawcircleoptions.md)*): `PDFOperator`[]

*Defined in [helpers/pdf-operators/composite/ellipse.ts:265](https://github.com/Hopding/pdf-lib/blob/d7334b8/src/helpers/pdf-operators/composite/ellipse.ts#L265)*

Draws a circle in a content stream.

```javascript
const contentStream = pdfDoc.register(
  pdfDoc.createContentStream(
    drawCircle({
      x: 25,
      y: 50,
      size: 50,
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

*Defined in [helpers/pdf-operators/composite/ellipse.ts:158](https://github.com/Hopding/pdf-lib/blob/d7334b8/src/helpers/pdf-operators/composite/ellipse.ts#L158)*

Draws an ellipse in a content stream.

```javascript
const contentStream = pdfDoc.register(
  pdfDoc.createContentStream(
    drawEllipse({
      x: 25,
      y: 50,
      xScale: 50,
      yScale: 150,
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

