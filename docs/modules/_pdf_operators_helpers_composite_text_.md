

# Functions

<a id="drawlinesoftext"></a>

## `<Const>` drawLinesOfText

▸ **drawLinesOfText**(lines: *`string`[]*, options: *[IDrawLinesOfTextOptions](../interfaces/_pdf_operators_helpers_composite_text_.idrawlinesoftextoptions.md)*): `PDFOperator`[]

*Defined in [pdf-operators/helpers/composite/text.ts:202](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-operators/helpers/composite/text.ts#L202)*

Draws multiple lines of text in a content stream.

```javascript
const [timesRomanFont] = pdfDoc.embedStandardFont('Times-Roman');
const contentStream = pdfDoc.register(
  pdfDoc.createContentStream(
    ...drawLinesOfText(
      ['First line of text.', 'Second line of text.'], {
      x: 25,
      y: 50,
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
| lines | `string`[] |  An array of strings to be drawn. |
| options | [IDrawLinesOfTextOptions](../interfaces/_pdf_operators_helpers_composite_text_.idrawlinesoftextoptions.md) |  An options object with named parameters. |

**Returns:** `PDFOperator`[]

___
<a id="drawtext"></a>

## `<Const>` drawText

▸ **drawText**(line: *`string`*, options: *[IDrawTextOptions](../interfaces/_pdf_operators_helpers_composite_text_.idrawtextoptions.md)*): `PDFOperator`[]

*Defined in [pdf-operators/helpers/composite/text.ts:106](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-operators/helpers/composite/text.ts#L106)*

Draws a line of text in a content stream.

```javascript
const [timesRomanFont] = pdfDoc.embedStandardFont('Times-Roman');
const contentStream = pdfDoc.register(
  pdfDoc.createContentStream(
    ...drawText('This is a line of text!', {
      x: 25,
      y: 50,
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
| line | `string` |  A string of text to draw. |
| options | [IDrawTextOptions](../interfaces/_pdf_operators_helpers_composite_text_.idrawtextoptions.md) |  An options object with named parameters. |

**Returns:** `PDFOperator`[]

___

