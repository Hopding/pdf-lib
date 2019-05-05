

# Functions

<a id="drawlinesoftext"></a>

## `<Const>` drawLinesOfText

▸ **drawLinesOfText**(lines: * `string`[] &#124; `PDFHexString`[]*, options: *[IDrawLinesOfTextOptions](../interfaces/_helpers_pdf_operators_composite_text_.idrawlinesoftextoptions.md)*): `PDFOperator`[]

*Defined in [helpers/pdf-operators/composite/text.ts:263](https://github.com/Hopding/pdf-lib/blob/20e93f6/src/helpers/pdf-operators/composite/text.ts#L263)*

Draws multiple lines of text in a content stream.

```javascript
const [timesRomanFont] = pdfDoc.embedStandardFont('Times-Roman');
const contentStream = pdfDoc.register(
  pdfDoc.createContentStream(
    drawLinesOfText(
      ['First line of text.', 'Second line of text.'], {
      x: 25,
      y: 50,
      rotateDegrees: 180,
      skewDegrees: { xAxis: 15, yAxis: 15 },
      font: 'Times-Roman',
      size: 24,
      lineHeight: 48,
      colorRgb: [0.25, 1.0, 0.79],
    }),
  ),
);
const page = pdfDoc
  .createPage([250, 500])
  .addFontDictionary('Times-Roman', timesRomanFont)
  .addContentStreams(contentStream);
```

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| lines |  `string`[] &#124; `PDFHexString`[]|  An array of strings to be drawn. |
| options | [IDrawLinesOfTextOptions](../interfaces/_helpers_pdf_operators_composite_text_.idrawlinesoftextoptions.md) |  An options object with named parameters. |

**Returns:** `PDFOperator`[]

___
<a id="drawtext"></a>

## `<Const>` drawText

▸ **drawText**(line: * `string` &#124; `PDFHexString`*, options: *[IDrawTextOptions](../interfaces/_helpers_pdf_operators_composite_text_.idrawtextoptions.md)*): `PDFOperator`[]

*Defined in [helpers/pdf-operators/composite/text.ts:121](https://github.com/Hopding/pdf-lib/blob/20e93f6/src/helpers/pdf-operators/composite/text.ts#L121)*

Draws a line of text in a content stream.

```javascript
const [timesRomanFont] = pdfDoc.embedStandardFont('Times-Roman');
const contentStream = pdfDoc.register(
  pdfDoc.createContentStream(
    drawText('This is a line of text!', {
      x: 25,
      y: 50,
      rotateDegrees: 180,
      skewDegrees: { xAxis: 15, yAxis: 15 },
      font: 'Times-Roman',
      size: 24,
      colorRgb: [0.25, 1.0, 0.79],
    }),
  ),
);
const page = pdfDoc
  .createPage([250, 500])
  .addFontDictionary('Times-Roman', timesRomanFont)
  .addContentStreams(contentStream);
```

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| line |  `string` &#124; `PDFHexString`|  A string of text to draw. |
| options | [IDrawTextOptions](../interfaces/_helpers_pdf_operators_composite_text_.idrawtextoptions.md) |  An options object with named parameters. |

**Returns:** `PDFOperator`[]

___

