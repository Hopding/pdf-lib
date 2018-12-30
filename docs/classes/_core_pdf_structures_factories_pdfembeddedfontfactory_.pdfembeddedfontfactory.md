

This Factory supports embedded fonts.

A note of thanks to the developers of [https://github.com/devongovett/pdfkit](https://github.com/devongovett/pdfkit), as this class borrows heavily from: [https://github.com/devongovett/pdfkit/blob/e71edab0dd4657b5a767804ba86c94c58d01fbca/lib/font/embedded.coffee](https://github.com/devongovett/pdfkit/blob/e71edab0dd4657b5a767804ba86c94c58d01fbca/lib/font/embedded.coffee)

# Hierarchy

**PDFEmbeddedFontFactory**

# Constructors

<a id="constructor"></a>

##  constructor

⊕ **new PDFEmbeddedFontFactory**(fontData: *`Uint8Array`*): [PDFEmbeddedFontFactory](_core_pdf_structures_factories_pdfembeddedfontfactory_.pdfembeddedfontfactory.md)

*Defined in [core/pdf-structures/factories/PDFEmbeddedFontFactory.ts:77](https://github.com/Hopding/pdf-lib/blob/21a2bec/src/core/pdf-structures/factories/PDFEmbeddedFontFactory.ts#L77)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| fontData | `Uint8Array` |

**Returns:** [PDFEmbeddedFontFactory](_core_pdf_structures_factories_pdfembeddedfontfactory_.pdfembeddedfontfactory.md)

___

# Properties

<a id="font"></a>

##  font

**● font**: *`Font`*

*Defined in [core/pdf-structures/factories/PDFEmbeddedFontFactory.ts:74](https://github.com/Hopding/pdf-lib/blob/21a2bec/src/core/pdf-structures/factories/PDFEmbeddedFontFactory.ts#L74)*

___
<a id="fontdata"></a>

##  fontData

**● fontData**: *`Uint8Array`*

*Defined in [core/pdf-structures/factories/PDFEmbeddedFontFactory.ts:76](https://github.com/Hopding/pdf-lib/blob/21a2bec/src/core/pdf-structures/factories/PDFEmbeddedFontFactory.ts#L76)*

___
<a id="scale"></a>

##  scale

**● scale**: *`number`*

*Defined in [core/pdf-structures/factories/PDFEmbeddedFontFactory.ts:75](https://github.com/Hopding/pdf-lib/blob/21a2bec/src/core/pdf-structures/factories/PDFEmbeddedFontFactory.ts#L75)*

___

# Methods

<a id="embedfontin"></a>

##  embedFontIn

▸ **embedFontIn**(pdfDoc: *[PDFDocument](_core_pdf_document_pdfdocument_.pdfdocument.md)*): `PDFIndirectReference`<`PDFDictionary`>

*Defined in [core/pdf-structures/factories/PDFEmbeddedFontFactory.ts:104](https://github.com/Hopding/pdf-lib/blob/21a2bec/src/core/pdf-structures/factories/PDFEmbeddedFontFactory.ts#L104)*

Embeds the font into a [PDFDocument](_core_pdf_document_pdfdocument_.pdfdocument.md).

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| pdfDoc | [PDFDocument](_core_pdf_document_pdfdocument_.pdfdocument.md) |  A \`PDFDocument\` object into which the font will be embedded. |

**Returns:** `PDFIndirectReference`<`PDFDictionary`>
A `PDFIndirectReference` to the font dictionary that was
         embedded in the `PDFDocument`.

___
<a id="encodetext"></a>

##  encodeText

▸ **encodeText**(text: *`string`*): `PDFHexString`

*Defined in [core/pdf-structures/factories/PDFEmbeddedFontFactory.ts:124](https://github.com/Hopding/pdf-lib/blob/21a2bec/src/core/pdf-structures/factories/PDFEmbeddedFontFactory.ts#L124)*

Encode the JavaScript string into this font. JavaScript encodes strings in Unicode, but embedded fonts use their own custom encodings. So this method should be used to encode text before passing the encoded text to one of the text showing operators, such as [drawText](../modules/_helpers_pdf_operators_composite_text_.md#drawtext) or [drawLinesOfText](../modules/_helpers_pdf_operators_composite_text_.md#drawlinesoftext).

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| text | `string` |  The string of text to be encoded. |

**Returns:** `PDFHexString`
A `PDFHexString` of the encoded text.

___
<a id="heightoffontatsize"></a>

##  heightOfFontAtSize

▸ **heightOfFontAtSize**(size: *`number`*): `number`

*Defined in [core/pdf-structures/factories/PDFEmbeddedFontFactory.ts:158](https://github.com/Hopding/pdf-lib/blob/21a2bec/src/core/pdf-structures/factories/PDFEmbeddedFontFactory.ts#L158)*

Measures the height of this font at a particular size. Note that the height of the font is independent of the particular glyphs being displayed, so this method does not accept a `text` param, like [PDFStandardFontFactory.widthOfTextAtSize](_core_pdf_structures_factories_pdfstandardfontfactory_.pdfstandardfontfactory.md#widthoftextatsize) does.

**Parameters:**

| Param | Type |
| ------ | ------ |
| size | `number` |

**Returns:** `number`

___
<a id="widthoftextatsize"></a>

##  widthOfTextAtSize

▸ **widthOfTextAtSize**(text: *`string`*, size: *`number`*): `number`

*Defined in [core/pdf-structures/factories/PDFEmbeddedFontFactory.ts:140](https://github.com/Hopding/pdf-lib/blob/21a2bec/src/core/pdf-structures/factories/PDFEmbeddedFontFactory.ts#L140)*

Measures the width of the JavaScript string when displayed as glyphs of this font of a particular `size`.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| text | `string` |  The string of text to be measured. |
| size | `number` |  The size to be used when calculating the text's width. |

**Returns:** `number`
A `number` representing the width of the text.

___
<a id="for"></a>

## `<Static>` for

▸ **for**(fontData: *`Uint8Array`*): [PDFEmbeddedFontFactory](_core_pdf_structures_factories_pdfembeddedfontfactory_.pdfembeddedfontfactory.md)

*Defined in [core/pdf-structures/factories/PDFEmbeddedFontFactory.ts:72](https://github.com/Hopding/pdf-lib/blob/21a2bec/src/core/pdf-structures/factories/PDFEmbeddedFontFactory.ts#L72)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| fontData | `Uint8Array` |

**Returns:** [PDFEmbeddedFontFactory](_core_pdf_structures_factories_pdfembeddedfontfactory_.pdfembeddedfontfactory.md)

___

