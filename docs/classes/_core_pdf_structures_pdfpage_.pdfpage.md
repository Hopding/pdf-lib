

# Hierarchy

 `PDFDictionary`

**↳ PDFPage**

# Constructors

<a id="constructor"></a>

##  constructor

⊕ **new PDFPage**(object: * `object` &#124; `Map`<`PDFName`, `any`>*, index: *`PDFObjectIndex`*, validKeys?: *`ReadonlyArray`<`string`>*): [PDFPage](_core_pdf_structures_pdfpage_.pdfpage.md)

*Inherited from PDFDictionary.__constructor*

*Defined in [core/pdf-objects/PDFDictionary.ts:23](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/core/pdf-objects/PDFDictionary.ts#L23)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| object |  `object` &#124; `Map`<`PDFName`, `any`>|
| index | `PDFObjectIndex` |
| `Optional` validKeys | `ReadonlyArray`<`string`> |

**Returns:** [PDFPage](_core_pdf_structures_pdfpage_.pdfpage.md)

___

# Properties

<a id="autonormalizectm"></a>

##  autoNormalizeCTM

**● autoNormalizeCTM**: *`boolean`* = true

*Defined in [core/pdf-structures/PDFPage.ts:99](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/core/pdf-structures/PDFPage.ts#L99)*

___
<a id="index"></a>

##  index

**● index**: *`PDFObjectIndex`*

*Inherited from PDFDictionary.index*

*Defined in [core/pdf-objects/PDFDictionary.ts:22](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/core/pdf-objects/PDFDictionary.ts#L22)*

___
<a id="map"></a>

##  map

**● map**: *`Map`<`PDFName`, `any`>*

*Inherited from PDFDictionary.map*

*Defined in [core/pdf-objects/PDFDictionary.ts:21](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/core/pdf-objects/PDFDictionary.ts#L21)*

___
<a id="validkeys"></a>

## `<Optional>` validKeys

**● validKeys**: *`ReadonlyArray`<`string`>*

*Inherited from PDFDictionary.validKeys*

*Defined in [core/pdf-objects/PDFDictionary.ts:23](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/core/pdf-objects/PDFDictionary.ts#L23)*

___

# Methods

<a id="addcontentstreams"></a>

##  addContentStreams

▸ **addContentStreams**(...contentStreams: *`Array`<`PDFIndirectReference`<`PDFContentStream`>>*): `this`

*Defined in [core/pdf-structures/PDFPage.ts:201](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/core/pdf-structures/PDFPage.ts#L201)*

Add one or more content streams to the page.

Note that this method does **not** directly accept [\[PDFContentStream\]](s) as its arguments. Instead, it accepts references to the content streams in the form of \[\[PDFIndirectReference\]\] objects. To obtain a reference for a \[\[PDFContentStream\]\], you must call the [PDFDocument.register](_core_pdf_document_pdfdocument_.pdfdocument.md#register) method with the \[\[PDFContentStream\]\].

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Rest` contentStreams | `Array`<`PDFIndirectReference`<`PDFContentStream`>> |  The content stream(s) to be added to the page. |

**Returns:** `this`

___
<a id="addfontdictionary"></a>

##  addFontDictionary

▸ **addFontDictionary**(key: *`string`*, fontDict: *`PDFIndirectReference`<`PDFDictionary`>*): `this`

*Defined in [core/pdf-structures/PDFPage.ts:237](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/core/pdf-structures/PDFPage.ts#L237)*

Adds a font dictionary to the page.

Note that this method does **not** directly accept font [\[PDFDictionary\]](s) as its arguments. Instead, it accepts references to the font dictionaries in the form of \[\[PDFIndirectReference\]\] objects.

The first element of the tuples returned by the [PDFDocument.embedStandardFont](_core_pdf_document_pdfdocument_.pdfdocument.md#embedstandardfont) and [PDFDocument.embedFont](_core_pdf_document_pdfdocument_.pdfdocument.md#embedfont) methods is a \[\[PDFIndirectReference\]\] to a font dictionary that can be passed as the `fontDict` parameter of this method.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| key | `string` |  The name by which the font dictionary will be referenced. |
| fontDict | `PDFIndirectReference`<`PDFDictionary`> |  The font dictionary to be added to the page. |

**Returns:** `this`

___
<a id="addimageobject"></a>

##  addImageObject

▸ **addImageObject**(key: *`string`*, imageObject: *`PDFIndirectReference`<`PDFStream`>*): `this`

*Defined in [core/pdf-structures/PDFPage.ts:273](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/core/pdf-structures/PDFPage.ts#L273)*

**Note:** This method is an alias for [addXObject](_core_pdf_structures_pdfpage_.pdfpage.md#addxobject). It exists because its name is more descriptive and familiar than `addXObject` is.

Adds an image object to the page.

Note that this method does **not** directly accept a \[\[PDFStream\]\] object as its argument. Instead, it accepts a reference to the \[\[PDFStream\]\] in the form of a \[\[PDFIndirectReference\]\] object.

The first element of the tuples returned by the [PDFDocument.embedPNG](_core_pdf_document_pdfdocument_.pdfdocument.md#embedpng) and [PDFDocument.embedJPG](_core_pdf_document_pdfdocument_.pdfdocument.md#embedjpg) methods is a \[\[PDFIndirectReference\]\] to a \[\[PDFStream\]\] that can be passed as the `imageObject` parameter of this method.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| key | `string` |  The name by which the image object will be referenced. |
| imageObject | `PDFIndirectReference`<`PDFStream`> |  The image object to be added to the page. |

**Returns:** `this`

___
<a id="addxobject"></a>

##  addXObject

▸ **addXObject**(key: *`string`*, xObject: *`PDFIndirectReference`<`PDFStream`>*): `this`

*Defined in [core/pdf-structures/PDFPage.ts:291](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/core/pdf-structures/PDFPage.ts#L291)*

Adds an XObject to the page.

Note that this method does **not** directly accept a \[\[PDFStream\]\] object as its argument. Instead, it accepts a reference to the \[\[PDFStream\]\] in the form of a \[\[PDFIndirectReference\]\] object.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| key | `string` |  The name by which the XObject will be referenced. |
| xObject | `PDFIndirectReference`<`PDFStream`> |  The XObject to be added to the page. |

**Returns:** `this`

___
<a id="bytessize"></a>

##  bytesSize

▸ **bytesSize**(): `number`

*Inherited from (Anonymous function)*

*Overrides PDFObject.bytesSize*

*Defined in [core/pdf-objects/PDFDictionary.ts:102](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/core/pdf-objects/PDFDictionary.ts#L102)*

**Returns:** `number`

___
<a id="copybytesinto"></a>

##  copyBytesInto

▸ **copyBytesInto**(buffer: *`Uint8Array`*): `Uint8Array`

*Inherited from (Anonymous function)*

*Overrides PDFObject.copyBytesInto*

*Defined in [core/pdf-objects/PDFDictionary.ts:117](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/core/pdf-objects/PDFDictionary.ts#L117)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| buffer | `Uint8Array` |

**Returns:** `Uint8Array`

___
<a id="filter"></a>

##  filter

▸ **filter**(predicate: *`function`*): `Object`[]

*Inherited from (Anonymous function)*

*Defined in [core/pdf-objects/PDFDictionary.ts:53](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/core/pdf-objects/PDFDictionary.ts#L53)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| predicate | `function` |

**Returns:** `Object`[]

___
<a id="get"></a>

##  get

▸ **get**T(key: * `string` &#124; `PDFName`*): `T`

*Inherited from (Anonymous function)*

*Defined in [core/pdf-objects/PDFDictionary.ts:67](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/core/pdf-objects/PDFDictionary.ts#L67)*

**Type parameters:**

#### T :  `PDFObject`
**Parameters:**

| Param | Type |
| ------ | ------ |
| key |  `string` &#124; `PDFName`|

**Returns:** `T`

___
<a id="getmaybe"></a>

##  getMaybe

▸ **getMaybe**T(key: * `string` &#124; `PDFName`*):  `T` &#124; `void`

*Inherited from (Anonymous function)*

*Defined in [core/pdf-objects/PDFDictionary.ts:56](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/core/pdf-objects/PDFDictionary.ts#L56)*

**Type parameters:**

#### T :  `PDFObject`
**Parameters:**

| Param | Type |
| ------ | ------ |
| key |  `string` &#124; `PDFName`|

**Returns:**  `T` &#124; `void`

___
<a id="normalizectm"></a>

##  normalizeCTM

▸ **normalizeCTM**(): [PDFPage](_core_pdf_structures_pdfpage_.pdfpage.md)

*Defined in [core/pdf-structures/PDFPage.ts:147](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/core/pdf-structures/PDFPage.ts#L147)*

Ensures that content streams added to the [PDFPage](_core_pdf_structures_pdfpage_.pdfpage.md) after calling [normalizeCTM](_core_pdf_structures_pdfpage_.pdfpage.md#normalizectm) will be working in the default Content Transformation Matrix.

This can be useful in cases where PDFs are being modified that have existing content streams which modify the CTM outside without resetting their changes (with the Q and q operators).

Works by wrapping any existing content streams for this page in two new content streams that contain a single operator each: `q` and `Q`, respectively.

Note that the `Contents` entry in this [PDFPage](_core_pdf_structures_pdfpage_.pdfpage.md) must be a PDFArray. Calling \[\[normalizeContents\]\] first will ensure that this is the case.

**Returns:** [PDFPage](_core_pdf_structures_pdfpage_.pdfpage.md)
Returns this [[PDFPage]] instance.

___
<a id="set"></a>

##  set

▸ **set**(key: * `string` &#124; `PDFName`*, val: *`PDFObject`*, validateKeys?: *`boolean`*): `this`

*Inherited from (Anonymous function)*

*Defined in [core/pdf-objects/PDFDictionary.ts:71](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/core/pdf-objects/PDFDictionary.ts#L71)*

**Parameters:**

| Param | Type | Default value |
| ------ | ------ | ------ |
| key |  `string` &#124; `PDFName`| - |
| val | `PDFObject` | - |
| `Default value` validateKeys | `boolean` | true |

**Returns:** `this`

___
<a id="tostring"></a>

##  toString

▸ **toString**(): `string`

*Inherited from (Anonymous function)*

*Overrides PDFObject.toString*

*Defined in [core/pdf-objects/PDFDictionary.ts:96](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/core/pdf-objects/PDFDictionary.ts#L96)*

**Returns:** `string`

___
<a id="create"></a>

## `<Static>` create

▸ **create**(index: *`PDFObjectIndex`*, size: *[`number`, `number`]*, resources?: *`PDFDictionary`*): [PDFPage](_core_pdf_structures_pdfpage_.pdfpage.md)

*Defined in [core/pdf-structures/PDFPage.ts:65](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/core/pdf-structures/PDFPage.ts#L65)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| index | `PDFObjectIndex` |
| size | [`number`, `number`] |
| `Optional` resources | `PDFDictionary` |

**Returns:** [PDFPage](_core_pdf_structures_pdfpage_.pdfpage.md)

___
<a id="from"></a>

## `<Static>` from

▸ **from**(object: * `object` &#124; `Map`<`PDFName`, `any`>*, index: *`PDFObjectIndex`*): `PDFDictionary`

*Inherited from (Anonymous function)*

*Defined in [core/pdf-objects/PDFDictionary.ts:16](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/core/pdf-objects/PDFDictionary.ts#L16)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| object |  `object` &#124; `Map`<`PDFName`, `any`>|
| index | `PDFObjectIndex` |

**Returns:** `PDFDictionary`

___
<a id="fromdict"></a>

## `<Static>` fromDict

▸ **fromDict**(dict: *`PDFDictionary`*): [PDFPage](_core_pdf_structures_pdfpage_.pdfpage.md)

*Defined in [core/pdf-structures/PDFPage.ts:94](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/core/pdf-structures/PDFPage.ts#L94)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| dict | `PDFDictionary` |

**Returns:** [PDFPage](_core_pdf_structures_pdfpage_.pdfpage.md)

___

