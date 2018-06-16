

# Hierarchy

**PDFDocument**

# Constructors

<a id="constructor"></a>

##  constructor

⊕ **new PDFDocument**(index: *`PDFObjectIndex`*): [PDFDocument](_pdf_document_pdfdocument_.pdfdocument.md)

*Defined in [pdf-document/PDFDocument.ts:36](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-document/PDFDocument.ts#L36)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| index | `PDFObjectIndex` |

**Returns:** [PDFDocument](_pdf_document_pdfdocument_.pdfdocument.md)

___

# Properties

<a id="catalog"></a>

##  catalog

**● catalog**: *`PDFCatalog`*

*Defined in [pdf-document/PDFDocument.ts:34](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-document/PDFDocument.ts#L34)*

___
<a id="header"></a>

##  header

**● header**: *`PDFHeader`* =  PDFHeader.forVersion(1, 7)

*Defined in [pdf-document/PDFDocument.ts:33](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-document/PDFDocument.ts#L33)*

___
<a id="index"></a>

##  index

**● index**: *`PDFObjectIndex`*

*Defined in [pdf-document/PDFDocument.ts:35](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-document/PDFDocument.ts#L35)*

___
<a id="maxobjnum"></a>

##  maxObjNum

**● maxObjNum**: *`number`* = 0

*Defined in [pdf-document/PDFDocument.ts:36](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-document/PDFDocument.ts#L36)*

___

# Methods

<a id="addpage"></a>

##  addPage

▸ **addPage**(page: *[PDFPage](_pdf_structures_pdfpage_.pdfpage.md)*): `this`

*Defined in [pdf-document/PDFDocument.ts:74](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-document/PDFDocument.ts#L74)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| page | [PDFPage](_pdf_structures_pdfpage_.pdfpage.md) |

**Returns:** `this`

___
<a id="createcontentstream"></a>

##  createContentStream

▸ **createContentStream**(...operators: *`PDFOperator`[]*): `PDFContentStream`

*Defined in [pdf-document/PDFDocument.ts:71](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-document/PDFDocument.ts#L71)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| `Rest` operators | `PDFOperator`[] |

**Returns:** `PDFContentStream`

___
<a id="createpage"></a>

##  createPage

▸ **createPage**(size: *[`number`, `number`]*, resources?: *`PDFDictionary`*): [PDFPage](_pdf_structures_pdfpage_.pdfpage.md)

*Defined in [pdf-document/PDFDocument.ts:68](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-document/PDFDocument.ts#L68)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| size | [`number`, `number`] |
| `Optional` resources | `PDFDictionary` |

**Returns:** [PDFPage](_pdf_structures_pdfpage_.pdfpage.md)

___
<a id="embedfont"></a>

##  embedFont

▸ **embedFont**(fontData: *`Uint8Array`*, fontFlags?: *`IFontFlagOptions`*): [`PDFIndirectReference`<`PDFDictionary`>, `PDFFontFactory`]

*Defined in [pdf-document/PDFDocument.ts:184](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-document/PDFDocument.ts#L184)*

**Parameters:**

| Param | Type | Default value |
| ------ | ------ | ------ |
| fontData | `Uint8Array` | - |
| `Default value` fontFlags | `IFontFlagOptions` |  { Nonsymbolic: true } |

**Returns:** [`PDFIndirectReference`<`PDFDictionary`>, `PDFFontFactory`]

___
<a id="embedjpg"></a>

##  embedJPG

▸ **embedJPG**(imageData: *`Uint8Array`*): [`PDFIndirectReference`<`PDFRawStream`>, `JPEGXObjectFactory`]

*Defined in [pdf-document/PDFDocument.ts:199](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-document/PDFDocument.ts#L199)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| imageData | `Uint8Array` |

**Returns:** [`PDFIndirectReference`<`PDFRawStream`>, `JPEGXObjectFactory`]

___
<a id="embedpng"></a>

##  embedPNG

▸ **embedPNG**(imageData: *`Uint8Array`*): [`PDFIndirectReference`<`PDFRawStream`>, `PNGXObjectFactory`]

*Defined in [pdf-document/PDFDocument.ts:192](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-document/PDFDocument.ts#L192)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| imageData | `Uint8Array` |

**Returns:** [`PDFIndirectReference`<`PDFRawStream`>, `PNGXObjectFactory`]

___
<a id="embedstandardfont"></a>

##  embedStandardFont

▸ **embedStandardFont**(fontName: *[IStandard14FontsUnion](../modules/_pdf_document_standard14fonts_.md#istandard14fontsunion)*): [`PDFIndirectReference`<`PDFDictionary`>]

*Defined in [pdf-document/PDFDocument.ts:145](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-document/PDFDocument.ts#L145)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| fontName | [IStandard14FontsUnion](../modules/_pdf_document_standard14fonts_.md#istandard14fontsunion) |

**Returns:** [`PDFIndirectReference`<`PDFDictionary`>]

___
<a id="getpages"></a>

##  getPages

▸ **getPages**(): [PDFPage](_pdf_structures_pdfpage_.pdfpage.md)[]

*Defined in [pdf-document/PDFDocument.ts:60](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-document/PDFDocument.ts#L60)*

**Returns:** [PDFPage](_pdf_structures_pdfpage_.pdfpage.md)[]

___
<a id="insertpage"></a>

##  insertPage

▸ **insertPage**(idx: *`number`*, page: *[PDFPage](_pdf_structures_pdfpage_.pdfpage.md)*): `this`

*Defined in [pdf-document/PDFDocument.ts:119](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-document/PDFDocument.ts#L119)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| idx | `number` |
| page | [PDFPage](_pdf_structures_pdfpage_.pdfpage.md) |

**Returns:** `this`

___
<a id="register"></a>

##  register

▸ **register**T(object: *`T`*): `PDFIndirectReference`<`T`>

*Defined in [pdf-document/PDFDocument.ts:52](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-document/PDFDocument.ts#L52)*

**Type parameters:**

#### T :  `PDFObject`
**Parameters:**

| Param | Type |
| ------ | ------ |
| object | `T` |

**Returns:** `PDFIndirectReference`<`T`>

___
<a id="removepage"></a>

##  removePage

▸ **removePage**(idx: *`number`*): `this`

*Defined in [pdf-document/PDFDocument.ts:94](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-document/PDFDocument.ts#L94)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| idx | `number` |

**Returns:** `this`

___
<a id="fromindex"></a>

## `<Static>` fromIndex

▸ **fromIndex**(index: *`PDFObjectIndex`*): [PDFDocument](_pdf_document_pdfdocument_.pdfdocument.md)

*Defined in [pdf-document/PDFDocument.ts:31](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-document/PDFDocument.ts#L31)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| index | `PDFObjectIndex` |

**Returns:** [PDFDocument](_pdf_document_pdfdocument_.pdfdocument.md)

___

