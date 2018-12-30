

This Factory supports Standard fonts.

A note of thanks to the developers of [https://github.com/foliojs/pdfkit](https://github.com/foliojs/pdfkit), as this class borrows from: [https://github.com/foliojs/pdfkit/blob/f91bdd61c164a72ea06be1a43dc0a412afc3925f/lib/font/afm.coffee](https://github.com/foliojs/pdfkit/blob/f91bdd61c164a72ea06be1a43dc0a412afc3925f/lib/font/afm.coffee)

# Hierarchy

**PDFStandardFontFactory**

# Constructors

<a id="constructor"></a>

##  constructor

⊕ **new PDFStandardFontFactory**(fontName: *`IFontNames`*): [PDFStandardFontFactory](_core_pdf_structures_factories_pdfstandardfontfactory_.pdfstandardfontfactory.md)

*Defined in [core/pdf-structures/factories/PDFStandardFontFactory.ts:35](https://github.com/Hopding/pdf-lib/blob/21a2bec/src/core/pdf-structures/factories/PDFStandardFontFactory.ts#L35)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| fontName | `IFontNames` |

**Returns:** [PDFStandardFontFactory](_core_pdf_structures_factories_pdfstandardfontfactory_.pdfstandardfontfactory.md)

___

# Properties

<a id="encoding"></a>

##  encoding

**● encoding**: *`IStandardEncoding`*

*Defined in [core/pdf-structures/factories/PDFStandardFontFactory.ts:35](https://github.com/Hopding/pdf-lib/blob/21a2bec/src/core/pdf-structures/factories/PDFStandardFontFactory.ts#L35)*

___
<a id="font"></a>

##  font

**● font**: *`Font`*

*Defined in [core/pdf-structures/factories/PDFStandardFontFactory.ts:33](https://github.com/Hopding/pdf-lib/blob/21a2bec/src/core/pdf-structures/factories/PDFStandardFontFactory.ts#L33)*

___
<a id="fontname"></a>

##  fontName

**● fontName**: *`IFontNames`*

*Defined in [core/pdf-structures/factories/PDFStandardFontFactory.ts:34](https://github.com/Hopding/pdf-lib/blob/21a2bec/src/core/pdf-structures/factories/PDFStandardFontFactory.ts#L34)*

___

# Methods

<a id="embedfontin"></a>

##  embedFontIn

▸ **embedFontIn**(pdfDoc: *[PDFDocument](_core_pdf_document_pdfdocument_.pdfdocument.md)*): `PDFIndirectReference`<`PDFDictionary`>

*Defined in [core/pdf-structures/factories/PDFStandardFontFactory.ts:62](https://github.com/Hopding/pdf-lib/blob/21a2bec/src/core/pdf-structures/factories/PDFStandardFontFactory.ts#L62)*

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

*Defined in [core/pdf-structures/factories/PDFStandardFontFactory.ts:97](https://github.com/Hopding/pdf-lib/blob/21a2bec/src/core/pdf-structures/factories/PDFStandardFontFactory.ts#L97)*

Encode the JavaScript string into this font. JavaScript encodes strings in Unicode, but standard fonts use either WinAnsi, ZapfDingbats, or Symbol encodings. This method should be used to encode text before passing the encoded text to one of the text showing operators, such as [drawText](../modules/_helpers_pdf_operators_composite_text_.md#drawtext) or [drawLinesOfText](../modules/_helpers_pdf_operators_composite_text_.md#drawlinesoftext).

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

*Defined in [core/pdf-structures/factories/PDFStandardFontFactory.ts:135](https://github.com/Hopding/pdf-lib/blob/21a2bec/src/core/pdf-structures/factories/PDFStandardFontFactory.ts#L135)*

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

*Defined in [core/pdf-structures/factories/PDFStandardFontFactory.ts:114](https://github.com/Hopding/pdf-lib/blob/21a2bec/src/core/pdf-structures/factories/PDFStandardFontFactory.ts#L114)*

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

▸ **for**(fontName: *`IFontNames`*): [PDFStandardFontFactory](_core_pdf_structures_factories_pdfstandardfontfactory_.pdfstandardfontfactory.md)

*Defined in [core/pdf-structures/factories/PDFStandardFontFactory.ts:30](https://github.com/Hopding/pdf-lib/blob/21a2bec/src/core/pdf-structures/factories/PDFStandardFontFactory.ts#L30)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| fontName | `IFontNames` |

**Returns:** [PDFStandardFontFactory](_core_pdf_structures_factories_pdfstandardfontfactory_.pdfstandardfontfactory.md)

___

