

This Factory supports Standard fonts. Note that the apparent hardcoding of values for OpenType fonts does not actually affect TrueType fonts.

A note of thanks to the developers of [https://github.com/foliojs/pdfkit](https://github.com/foliojs/pdfkit), as this class borrows from: [https://github.com/foliojs/pdfkit/blob/f91bdd61c164a72ea06be1a43dc0a412afc3925f/lib/font/afm.coffee](https://github.com/foliojs/pdfkit/blob/f91bdd61c164a72ea06be1a43dc0a412afc3925f/lib/font/afm.coffee)

# Hierarchy

**PDFStandardFontFactory**

# Implements

* [IPDFFontEncoder](../interfaces/_core_pdf_structures_factories_pdffontencoder_.ipdffontencoder.md)

# Constructors

<a id="constructor"></a>

##  constructor

⊕ **new PDFStandardFontFactory**(fontName: *[IStandard14FontsUnion](../modules/_core_pdf_document_standard14fonts_.md#istandard14fontsunion)*): [PDFStandardFontFactory](_core_pdf_structures_factories_pdfstandardfontfactory_.pdfstandardfontfactory.md)

*Defined in [core/pdf-structures/factories/PDFStandardFontFactory.ts:60](https://github.com/Hopding/pdf-lib/blob/bdaae3d/src/core/pdf-structures/factories/PDFStandardFontFactory.ts#L60)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| fontName | [IStandard14FontsUnion](../modules/_core_pdf_document_standard14fonts_.md#istandard14fontsunion) |

**Returns:** [PDFStandardFontFactory](_core_pdf_structures_factories_pdfstandardfontfactory_.pdfstandardfontfactory.md)

___

# Properties

<a id="fontname"></a>

##  fontName

**● fontName**: *[IStandard14FontsUnion](../modules/_core_pdf_document_standard14fonts_.md#istandard14fontsunion)*

*Defined in [core/pdf-structures/factories/PDFStandardFontFactory.ts:60](https://github.com/Hopding/pdf-lib/blob/bdaae3d/src/core/pdf-structures/factories/PDFStandardFontFactory.ts#L60)*

___

# Methods

<a id="embedfontin"></a>

##  embedFontIn

▸ **embedFontIn**(pdfDoc: *[PDFDocument](_core_pdf_document_pdfdocument_.pdfdocument.md)*): `PDFIndirectReference`<`PDFDictionary`>

*Defined in [core/pdf-structures/factories/PDFStandardFontFactory.ts:96](https://github.com/Hopding/pdf-lib/blob/bdaae3d/src/core/pdf-structures/factories/PDFStandardFontFactory.ts#L96)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| pdfDoc | [PDFDocument](_core_pdf_document_pdfdocument_.pdfdocument.md) |

**Returns:** `PDFIndirectReference`<`PDFDictionary`>

___
<a id="encodetext"></a>

##  encodeText

▸ **encodeText**(text: *`string`*): `PDFHexString`

*Implementation of [IPDFFontEncoder](../interfaces/_core_pdf_structures_factories_pdffontencoder_.ipdffontencoder.md).[encodeText](../interfaces/_core_pdf_structures_factories_pdffontencoder_.ipdffontencoder.md#encodetext)*

*Defined in [core/pdf-structures/factories/PDFStandardFontFactory.ts:71](https://github.com/Hopding/pdf-lib/blob/bdaae3d/src/core/pdf-structures/factories/PDFStandardFontFactory.ts#L71)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| text | `string` |

**Returns:** `PDFHexString`

___
<a id="getcodepointwidth"></a>

##  getCodePointWidth

▸ **getCodePointWidth**(): `never`

*Defined in [core/pdf-structures/factories/PDFStandardFontFactory.ts:120](https://github.com/Hopding/pdf-lib/blob/bdaae3d/src/core/pdf-structures/factories/PDFStandardFontFactory.ts#L120)*

**Returns:** `never`

___
<a id="for"></a>

## `<Static>` for

▸ **for**(fontName: *[IStandard14FontsUnion](../modules/_core_pdf_document_standard14fonts_.md#istandard14fontsunion)*): [PDFStandardFontFactory](_core_pdf_structures_factories_pdfstandardfontfactory_.pdfstandardfontfactory.md)

*Defined in [core/pdf-structures/factories/PDFStandardFontFactory.ts:57](https://github.com/Hopding/pdf-lib/blob/bdaae3d/src/core/pdf-structures/factories/PDFStandardFontFactory.ts#L57)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| fontName | [IStandard14FontsUnion](../modules/_core_pdf_document_standard14fonts_.md#istandard14fontsunion) |

**Returns:** [PDFStandardFontFactory](_core_pdf_structures_factories_pdfstandardfontfactory_.pdfstandardfontfactory.md)

___

