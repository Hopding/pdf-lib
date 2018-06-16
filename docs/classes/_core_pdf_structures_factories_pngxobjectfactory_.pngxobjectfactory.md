

A note of thanks to the developers of [https://github.com/devongovett/pdfkit](https://github.com/devongovett/pdfkit), as this class borrows heavily from: [https://github.com/devongovett/pdfkit/blob/e71edab0dd4657b5a767804ba86c94c58d01fbca/lib/image/png.coffee](https://github.com/devongovett/pdfkit/blob/e71edab0dd4657b5a767804ba86c94c58d01fbca/lib/image/png.coffee)

# Hierarchy

**PNGXObjectFactory**

# Constructors

<a id="constructor"></a>

##  constructor

⊕ **new PNGXObjectFactory**(data: *`Uint8Array`*): [PNGXObjectFactory](_core_pdf_structures_factories_pngxobjectfactory_.pngxobjectfactory.md)

*Defined in [core/pdf-structures/factories/PNGXObjectFactory.ts:33](https://github.com/Hopding/pdf-lib/blob/41c216d/src/core/pdf-structures/factories/PNGXObjectFactory.ts#L33)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| data | `Uint8Array` |

**Returns:** [PNGXObjectFactory](_core_pdf_structures_factories_pngxobjectfactory_.pngxobjectfactory.md)

___

# Properties

<a id="alphachannel"></a>

##  alphaChannel

**● alphaChannel**: *`Uint8Array`*

*Defined in [core/pdf-structures/factories/PNGXObjectFactory.ts:30](https://github.com/Hopding/pdf-lib/blob/41c216d/src/core/pdf-structures/factories/PNGXObjectFactory.ts#L30)*

___
<a id="document"></a>

##  document

**● document**: *[PDFDocument](_core_pdf_document_pdfdocument_.pdfdocument.md)*

*Defined in [core/pdf-structures/factories/PNGXObjectFactory.ts:33](https://github.com/Hopding/pdf-lib/blob/41c216d/src/core/pdf-structures/factories/PNGXObjectFactory.ts#L33)*

___
<a id="height"></a>

##  height

**● height**: *`number`*

*Defined in [core/pdf-structures/factories/PNGXObjectFactory.ts:28](https://github.com/Hopding/pdf-lib/blob/41c216d/src/core/pdf-structures/factories/PNGXObjectFactory.ts#L28)*

___
<a id="image"></a>

##  image

**● image**: *`PNG`*

*Defined in [core/pdf-structures/factories/PNGXObjectFactory.ts:26](https://github.com/Hopding/pdf-lib/blob/41c216d/src/core/pdf-structures/factories/PNGXObjectFactory.ts#L26)*

___
<a id="imgdata"></a>

##  imgData

**● imgData**: *`Uint8Array`*

*Defined in [core/pdf-structures/factories/PNGXObjectFactory.ts:29](https://github.com/Hopding/pdf-lib/blob/41c216d/src/core/pdf-structures/factories/PNGXObjectFactory.ts#L29)*

___
<a id="width"></a>

##  width

**● width**: *`number`*

*Defined in [core/pdf-structures/factories/PNGXObjectFactory.ts:27](https://github.com/Hopding/pdf-lib/blob/41c216d/src/core/pdf-structures/factories/PNGXObjectFactory.ts#L27)*

___
<a id="xobjdict"></a>

##  xObjDict

**● xObjDict**: *`PDFDictionary`*

*Defined in [core/pdf-structures/factories/PNGXObjectFactory.ts:32](https://github.com/Hopding/pdf-lib/blob/41c216d/src/core/pdf-structures/factories/PNGXObjectFactory.ts#L32)*

___

# Methods

<a id="embedimagein"></a>

##  embedImageIn

▸ **embedImageIn**(document: *[PDFDocument](_core_pdf_document_pdfdocument_.pdfdocument.md)*): `PDFIndirectReference`<`PDFRawStream`>

*Defined in [core/pdf-structures/factories/PNGXObjectFactory.ts:54](https://github.com/Hopding/pdf-lib/blob/41c216d/src/core/pdf-structures/factories/PNGXObjectFactory.ts#L54)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| document | [PDFDocument](_core_pdf_document_pdfdocument_.pdfdocument.md) |

**Returns:** `PDFIndirectReference`<`PDFRawStream`>

___
<a id="finalize"></a>

##  finalize

▸ **finalize**(): `PDFIndirectReference`<`PDFRawStream`>

*Defined in [core/pdf-structures/factories/PNGXObjectFactory.ts:126](https://github.com/Hopding/pdf-lib/blob/41c216d/src/core/pdf-structures/factories/PNGXObjectFactory.ts#L126)*

**Returns:** `PDFIndirectReference`<`PDFRawStream`>

___
<a id="loadindexedalphachannel"></a>

##  loadIndexedAlphaChannel

▸ **loadIndexedAlphaChannel**(): `PDFIndirectReference`<`PDFRawStream`>

*Defined in [core/pdf-structures/factories/PNGXObjectFactory.ts:177](https://github.com/Hopding/pdf-lib/blob/41c216d/src/core/pdf-structures/factories/PNGXObjectFactory.ts#L177)*

**Returns:** `PDFIndirectReference`<`PDFRawStream`>

___
<a id="splitalphachannel"></a>

##  splitAlphaChannel

▸ **splitAlphaChannel**(): `PDFIndirectReference`<`PDFRawStream`>

*Defined in [core/pdf-structures/factories/PNGXObjectFactory.ts:158](https://github.com/Hopding/pdf-lib/blob/41c216d/src/core/pdf-structures/factories/PNGXObjectFactory.ts#L158)*

**Returns:** `PDFIndirectReference`<`PDFRawStream`>

___
<a id="for"></a>

## `<Static>` for

▸ **for**(data: *`Uint8Array`*): [PNGXObjectFactory](_core_pdf_structures_factories_pngxobjectfactory_.pngxobjectfactory.md)

*Defined in [core/pdf-structures/factories/PNGXObjectFactory.ts:24](https://github.com/Hopding/pdf-lib/blob/41c216d/src/core/pdf-structures/factories/PNGXObjectFactory.ts#L24)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| data | `Uint8Array` |

**Returns:** [PNGXObjectFactory](_core_pdf_structures_factories_pngxobjectfactory_.pngxobjectfactory.md)

___

