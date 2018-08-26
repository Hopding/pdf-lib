

A note of thanks to the developers of [https://github.com/devongovett/pdfkit](https://github.com/devongovett/pdfkit), as this class borrows heavily from: [https://github.com/devongovett/pdfkit/blob/e71edab0dd4657b5a767804ba86c94c58d01fbca/lib/image/png.coffee](https://github.com/devongovett/pdfkit/blob/e71edab0dd4657b5a767804ba86c94c58d01fbca/lib/image/png.coffee)

# Hierarchy

**PNGXObjectFactory**

# Constructors

<a id="constructor"></a>

##  constructor

⊕ **new PNGXObjectFactory**(data: *`Uint8Array`*): [PNGXObjectFactory](_core_pdf_structures_factories_pngxobjectfactory_.pngxobjectfactory.md)

*Defined in [core/pdf-structures/factories/PNGXObjectFactory.ts:30](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/core/pdf-structures/factories/PNGXObjectFactory.ts#L30)*

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

*Defined in [core/pdf-structures/factories/PNGXObjectFactory.ts:27](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/core/pdf-structures/factories/PNGXObjectFactory.ts#L27)*

___
<a id="document"></a>

##  document

**● document**: *[PDFDocument](_core_pdf_document_pdfdocument_.pdfdocument.md)*

*Defined in [core/pdf-structures/factories/PNGXObjectFactory.ts:30](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/core/pdf-structures/factories/PNGXObjectFactory.ts#L30)*

___
<a id="height"></a>

##  height

**● height**: *`number`*

*Defined in [core/pdf-structures/factories/PNGXObjectFactory.ts:25](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/core/pdf-structures/factories/PNGXObjectFactory.ts#L25)*

___
<a id="image"></a>

##  image

**● image**: *`PNG`*

*Defined in [core/pdf-structures/factories/PNGXObjectFactory.ts:23](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/core/pdf-structures/factories/PNGXObjectFactory.ts#L23)*

___
<a id="imgdata"></a>

##  imgData

**● imgData**: *`Uint8Array`*

*Defined in [core/pdf-structures/factories/PNGXObjectFactory.ts:26](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/core/pdf-structures/factories/PNGXObjectFactory.ts#L26)*

___
<a id="width"></a>

##  width

**● width**: *`number`*

*Defined in [core/pdf-structures/factories/PNGXObjectFactory.ts:24](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/core/pdf-structures/factories/PNGXObjectFactory.ts#L24)*

___
<a id="xobjdict"></a>

##  xObjDict

**● xObjDict**: *`PDFDictionary`*

*Defined in [core/pdf-structures/factories/PNGXObjectFactory.ts:29](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/core/pdf-structures/factories/PNGXObjectFactory.ts#L29)*

___

# Methods

<a id="embedimagein"></a>

##  embedImageIn

▸ **embedImageIn**(document: *[PDFDocument](_core_pdf_document_pdfdocument_.pdfdocument.md)*): `PDFIndirectReference`<`PDFRawStream`>

*Defined in [core/pdf-structures/factories/PNGXObjectFactory.ts:45](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/core/pdf-structures/factories/PNGXObjectFactory.ts#L45)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| document | [PDFDocument](_core_pdf_document_pdfdocument_.pdfdocument.md) |

**Returns:** `PDFIndirectReference`<`PDFRawStream`>

___
<a id="for"></a>

## `<Static>` for

▸ **for**(data: *`Uint8Array`*): [PNGXObjectFactory](_core_pdf_structures_factories_pngxobjectfactory_.pngxobjectfactory.md)

*Defined in [core/pdf-structures/factories/PNGXObjectFactory.ts:21](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/core/pdf-structures/factories/PNGXObjectFactory.ts#L21)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| data | `Uint8Array` |

**Returns:** [PNGXObjectFactory](_core_pdf_structures_factories_pngxobjectfactory_.pngxobjectfactory.md)

___

