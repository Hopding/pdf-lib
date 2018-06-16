

This Factory supports TrueType and OpenType fonts. Note that the apparent hardcoding of values for OpenType fonts does not actually affect TrueType fonts.

A note of thanks to the developers of [https://github.com/devongovett/pdfkit](https://github.com/devongovett/pdfkit), as this class borrows heavily from: [https://github.com/devongovett/pdfkit/blob/e71edab0dd4657b5a767804ba86c94c58d01fbca/lib/font/embedded.coffee](https://github.com/devongovett/pdfkit/blob/e71edab0dd4657b5a767804ba86c94c58d01fbca/lib/font/embedded.coffee)

# Hierarchy

**PDFFontFactory**

# Constructors

<a id="constructor"></a>

##  constructor

⊕ **new PDFFontFactory**(fontData: *`Uint8Array`*, flagOptions: *[IFontFlagOptions](../interfaces/_core_pdf_structures_factories_pdffontfactory_.ifontflagoptions.md)*): [PDFFontFactory](_core_pdf_structures_factories_pdffontfactory_.pdffontfactory.md)

*Defined in [core/pdf-structures/factories/PDFFontFactory.ts:73](https://github.com/Hopding/pdf-lib/blob/41c216d/src/core/pdf-structures/factories/PDFFontFactory.ts#L73)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| fontData | `Uint8Array` |
| flagOptions | [IFontFlagOptions](../interfaces/_core_pdf_structures_factories_pdffontfactory_.ifontflagoptions.md) |

**Returns:** [PDFFontFactory](_core_pdf_structures_factories_pdffontfactory_.pdffontfactory.md)

___

# Properties

<a id="flagoptions"></a>

##  flagOptions

**● flagOptions**: *[IFontFlagOptions](../interfaces/_core_pdf_structures_factories_pdffontfactory_.ifontflagoptions.md)*

*Defined in [core/pdf-structures/factories/PDFFontFactory.ts:73](https://github.com/Hopding/pdf-lib/blob/41c216d/src/core/pdf-structures/factories/PDFFontFactory.ts#L73)*

___
<a id="font"></a>

##  font

**● font**: *`any`*

*Defined in [core/pdf-structures/factories/PDFFontFactory.ts:70](https://github.com/Hopding/pdf-lib/blob/41c216d/src/core/pdf-structures/factories/PDFFontFactory.ts#L70)*

___
<a id="fontdata"></a>

##  fontData

**● fontData**: *`Uint8Array`*

*Defined in [core/pdf-structures/factories/PDFFontFactory.ts:72](https://github.com/Hopding/pdf-lib/blob/41c216d/src/core/pdf-structures/factories/PDFFontFactory.ts#L72)*

___
<a id="scale"></a>

##  scale

**● scale**: *`number`*

*Defined in [core/pdf-structures/factories/PDFFontFactory.ts:71](https://github.com/Hopding/pdf-lib/blob/41c216d/src/core/pdf-structures/factories/PDFFontFactory.ts#L71)*

___

# Methods

<a id="embedfontin"></a>

##  embedFontIn

▸ **embedFontIn**(pdfDoc: *[PDFDocument](_core_pdf_document_pdfdocument_.pdfdocument.md)*, name?: *`string`*): `PDFIndirectReference`<`PDFDictionary`>

*Defined in [core/pdf-structures/factories/PDFFontFactory.ts:99](https://github.com/Hopding/pdf-lib/blob/41c216d/src/core/pdf-structures/factories/PDFFontFactory.ts#L99)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| pdfDoc | [PDFDocument](_core_pdf_document_pdfdocument_.pdfdocument.md) |
| `Optional` name | `string` |

**Returns:** `PDFIndirectReference`<`PDFDictionary`>

___
<a id="getcodepointwidth"></a>

##  getCodePointWidth

▸ **getCodePointWidth**(code: *`number`*): `number`

*Defined in [core/pdf-structures/factories/PDFFontFactory.ts:190](https://github.com/Hopding/pdf-lib/blob/41c216d/src/core/pdf-structures/factories/PDFFontFactory.ts#L190)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| code | `number` |

**Returns:** `number`

___
<a id="getwidths"></a>

##  getWidths

▸ **getWidths**(index: *`PDFObjectIndex`*): `PDFArray`<`PDFNumber`>

*Defined in [core/pdf-structures/factories/PDFFontFactory.ts:182](https://github.com/Hopding/pdf-lib/blob/41c216d/src/core/pdf-structures/factories/PDFFontFactory.ts#L182)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| index | `PDFObjectIndex` |

**Returns:** `PDFArray`<`PDFNumber`>

___
<a id="for"></a>

## `<Static>` for

▸ **for**(fontData: *`Uint8Array`*, flagOptions: *[IFontFlagOptions](../interfaces/_core_pdf_structures_factories_pdffontfactory_.ifontflagoptions.md)*): [PDFFontFactory](_core_pdf_structures_factories_pdffontfactory_.pdffontfactory.md)

*Defined in [core/pdf-structures/factories/PDFFontFactory.ts:67](https://github.com/Hopding/pdf-lib/blob/41c216d/src/core/pdf-structures/factories/PDFFontFactory.ts#L67)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| fontData | `Uint8Array` |
| flagOptions | [IFontFlagOptions](../interfaces/_core_pdf_structures_factories_pdffontfactory_.ifontflagoptions.md) |

**Returns:** [PDFFontFactory](_core_pdf_structures_factories_pdffontfactory_.pdffontfactory.md)

___

