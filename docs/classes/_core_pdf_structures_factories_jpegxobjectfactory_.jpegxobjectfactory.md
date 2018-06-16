

A note of thanks to the developers of [https://github.com/devongovett/pdfkit](https://github.com/devongovett/pdfkit), as this class borrows heavily from: [https://github.com/devongovett/pdfkit/blob/e71edab0dd4657b5a767804ba86c94c58d01fbca/lib/image/jpeg.coffee](https://github.com/devongovett/pdfkit/blob/e71edab0dd4657b5a767804ba86c94c58d01fbca/lib/image/jpeg.coffee)

# Hierarchy

**JPEGXObjectFactory**

# Constructors

<a id="constructor"></a>

##  constructor

⊕ **new JPEGXObjectFactory**(data: *`Uint8Array`*): [JPEGXObjectFactory](_core_pdf_structures_factories_jpegxobjectfactory_.jpegxobjectfactory.md)

*Defined in [core/pdf-structures/factories/JPEGXObjectFactory.ts:43](https://github.com/Hopding/pdf-lib/blob/41c216d/src/core/pdf-structures/factories/JPEGXObjectFactory.ts#L43)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| data | `Uint8Array` |

**Returns:** [JPEGXObjectFactory](_core_pdf_structures_factories_jpegxobjectfactory_.jpegxobjectfactory.md)

___

# Properties

<a id="bits"></a>

##  bits

**● bits**: *`number`*

*Defined in [core/pdf-structures/factories/JPEGXObjectFactory.ts:40](https://github.com/Hopding/pdf-lib/blob/41c216d/src/core/pdf-structures/factories/JPEGXObjectFactory.ts#L40)*

___
<a id="colorspace"></a>

##  colorSpace

**● colorSpace**: * "DeviceGray" &#124; "DeviceRGB" &#124; "DeviceCYMK"
*

*Defined in [core/pdf-structures/factories/JPEGXObjectFactory.ts:43](https://github.com/Hopding/pdf-lib/blob/41c216d/src/core/pdf-structures/factories/JPEGXObjectFactory.ts#L43)*

___
<a id="height"></a>

##  height

**● height**: *`number`*

*Defined in [core/pdf-structures/factories/JPEGXObjectFactory.ts:42](https://github.com/Hopding/pdf-lib/blob/41c216d/src/core/pdf-structures/factories/JPEGXObjectFactory.ts#L42)*

___
<a id="imgdata"></a>

##  imgData

**● imgData**: *`Uint8Array`*

*Defined in [core/pdf-structures/factories/JPEGXObjectFactory.ts:39](https://github.com/Hopding/pdf-lib/blob/41c216d/src/core/pdf-structures/factories/JPEGXObjectFactory.ts#L39)*

___
<a id="width"></a>

##  width

**● width**: *`number`*

*Defined in [core/pdf-structures/factories/JPEGXObjectFactory.ts:41](https://github.com/Hopding/pdf-lib/blob/41c216d/src/core/pdf-structures/factories/JPEGXObjectFactory.ts#L41)*

___

# Methods

<a id="embedimagein"></a>

##  embedImageIn

▸ **embedImageIn**(document: *[PDFDocument](_core_pdf_document_pdfdocument_.pdfdocument.md)*): `PDFIndirectReference`<`PDFRawStream`>

*Defined in [core/pdf-structures/factories/JPEGXObjectFactory.ts:80](https://github.com/Hopding/pdf-lib/blob/41c216d/src/core/pdf-structures/factories/JPEGXObjectFactory.ts#L80)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| document | [PDFDocument](_core_pdf_document_pdfdocument_.pdfdocument.md) |

**Returns:** `PDFIndirectReference`<`PDFRawStream`>

___
<a id="for"></a>

## `<Static>` for

▸ **for**(data: *`Uint8Array`*): [JPEGXObjectFactory](_core_pdf_structures_factories_jpegxobjectfactory_.jpegxobjectfactory.md)

*Defined in [core/pdf-structures/factories/JPEGXObjectFactory.ts:37](https://github.com/Hopding/pdf-lib/blob/41c216d/src/core/pdf-structures/factories/JPEGXObjectFactory.ts#L37)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| data | `Uint8Array` |

**Returns:** [JPEGXObjectFactory](_core_pdf_structures_factories_jpegxobjectfactory_.jpegxobjectfactory.md)

___

