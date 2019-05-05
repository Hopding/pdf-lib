

*__deprecated__*: Please use the [PDFEmbeddedFontFactory](_core_pdf_structures_factories_pdfembeddedfontfactory_.pdfembeddedfontfactory.md) instead.

This Factory supports TrueType and OpenType fonts. Note that the apparent hardcoding of values for OpenType fonts does not actually affect TrueType fonts.

A note of thanks to the developers of [https://github.com/devongovett/pdfkit](https://github.com/devongovett/pdfkit), as this class borrows heavily from: [https://github.com/devongovett/pdfkit/blob/e71edab0dd4657b5a767804ba86c94c58d01fbca/lib/font/embedded.coffee](https://github.com/devongovett/pdfkit/blob/e71edab0dd4657b5a767804ba86c94c58d01fbca/lib/font/embedded.coffee)

# Hierarchy

**PDFFontFactory**

# Constructors

<a id="constructor"></a>

##  constructor

⊕ **new PDFFontFactory**(fontData: *`Uint8Array`*, flagOptions: *[IFontFlagOptions](../interfaces/_core_pdf_structures_factories_pdffontfactory_.ifontflagoptions.md)*): [PDFFontFactory](_core_pdf_structures_factories_pdffontfactory_.pdffontfactory.md)

*Defined in [core/pdf-structures/factories/PDFFontFactory.ts:78](https://github.com/Hopding/pdf-lib/blob/20e93f6/src/core/pdf-structures/factories/PDFFontFactory.ts#L78)*

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

*Defined in [core/pdf-structures/factories/PDFFontFactory.ts:78](https://github.com/Hopding/pdf-lib/blob/20e93f6/src/core/pdf-structures/factories/PDFFontFactory.ts#L78)*

___
<a id="font"></a>

##  font

**● font**: *`Font`*

*Defined in [core/pdf-structures/factories/PDFFontFactory.ts:75](https://github.com/Hopding/pdf-lib/blob/20e93f6/src/core/pdf-structures/factories/PDFFontFactory.ts#L75)*

___
<a id="fontdata"></a>

##  fontData

**● fontData**: *`Uint8Array`*

*Defined in [core/pdf-structures/factories/PDFFontFactory.ts:77](https://github.com/Hopding/pdf-lib/blob/20e93f6/src/core/pdf-structures/factories/PDFFontFactory.ts#L77)*

___
<a id="scale"></a>

##  scale

**● scale**: *`number`*

*Defined in [core/pdf-structures/factories/PDFFontFactory.ts:76](https://github.com/Hopding/pdf-lib/blob/20e93f6/src/core/pdf-structures/factories/PDFFontFactory.ts#L76)*

___

# Methods

<a id="embedfontin"></a>

##  embedFontIn

▸ **embedFontIn**(pdfDoc: *[PDFDocument](_core_pdf_document_pdfdocument_.pdfdocument.md)*, name?: * `undefined` &#124; `string`*): `PDFIndirectReference`<`PDFDictionary`>

*Defined in [core/pdf-structures/factories/PDFFontFactory.ts:98](https://github.com/Hopding/pdf-lib/blob/20e93f6/src/core/pdf-structures/factories/PDFFontFactory.ts#L98)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| pdfDoc | [PDFDocument](_core_pdf_document_pdfdocument_.pdfdocument.md) |
| `Optional` name |  `undefined` &#124; `string`|

**Returns:** `PDFIndirectReference`<`PDFDictionary`>

___
<a id="getcodepointwidth"></a>

##  getCodePointWidth

▸ **getCodePointWidth**(code: *`number`*): `number`

*Defined in [core/pdf-structures/factories/PDFFontFactory.ts:187](https://github.com/Hopding/pdf-lib/blob/20e93f6/src/core/pdf-structures/factories/PDFFontFactory.ts#L187)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| code | `number` |

**Returns:** `number`

___
<a id="for"></a>

## `<Static>` for

▸ **for**(fontData: *`Uint8Array`*, flagOptions: *[IFontFlagOptions](../interfaces/_core_pdf_structures_factories_pdffontfactory_.ifontflagoptions.md)*): [PDFFontFactory](_core_pdf_structures_factories_pdffontfactory_.pdffontfactory.md)

*Defined in [core/pdf-structures/factories/PDFFontFactory.ts:72](https://github.com/Hopding/pdf-lib/blob/20e93f6/src/core/pdf-structures/factories/PDFFontFactory.ts#L72)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| fontData | `Uint8Array` |
| flagOptions | [IFontFlagOptions](../interfaces/_core_pdf_structures_factories_pdffontfactory_.ifontflagoptions.md) |

**Returns:** [PDFFontFactory](_core_pdf_structures_factories_pdffontfactory_.pdffontfactory.md)

___

