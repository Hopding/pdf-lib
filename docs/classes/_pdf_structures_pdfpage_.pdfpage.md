

# Hierarchy

 `PDFDictionary`

**↳ PDFPage**

# Constructors

<a id="constructor"></a>

##  constructor

⊕ **new PDFPage**(object: * `object` &#124; `Map`<`PDFName`, `any`>*, index: *`PDFObjectIndex`*, validKeys?: *`ReadonlyArray`<`string`>*): [PDFPage](_pdf_structures_pdfpage_.pdfpage.md)

*Inherited from PDFDictionary.__constructor*

*Defined in [pdf-objects/PDFDictionary.ts:19](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-objects/PDFDictionary.ts#L19)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| object |  `object` &#124; `Map`<`PDFName`, `any`>|
| index | `PDFObjectIndex` |
| `Optional` validKeys | `ReadonlyArray`<`string`> |

**Returns:** [PDFPage](_pdf_structures_pdfpage_.pdfpage.md)

___

# Properties

<a id="index"></a>

##  index

**● index**: *`PDFObjectIndex`*

*Inherited from PDFDictionary.index*

*Defined in [pdf-objects/PDFDictionary.ts:18](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-objects/PDFDictionary.ts#L18)*

___
<a id="map"></a>

##  map

**● map**: *`Map`<`PDFName`, `any`>*

*Inherited from PDFDictionary.map*

*Defined in [pdf-objects/PDFDictionary.ts:17](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-objects/PDFDictionary.ts#L17)*

___
<a id="validkeys"></a>

##  validKeys

**● validKeys**: *`ReadonlyArray`<`string`>*

*Inherited from PDFDictionary.validKeys*

*Defined in [pdf-objects/PDFDictionary.ts:19](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-objects/PDFDictionary.ts#L19)*

___
<a id="validkeys-1"></a>

## `<Static>` validKeys

**● validKeys**: *`ReadonlyArray`<`string`>* =  VALID_KEYS

*Defined in [pdf-structures/PDFPage.ts:56](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-structures/PDFPage.ts#L56)*

___

# Accessors

<a id="contents"></a>

##  Contents

getContents(): `PDFArray`< `PDFContentStream` &#124; `PDFIndirectReference`<`PDFContentStream`>>

*Defined in [pdf-structures/PDFPage.ts:96](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-structures/PDFPage.ts#L96)*

**Returns:** `PDFArray`< `PDFContentStream` &#124; `PDFIndirectReference`<`PDFContentStream`>>

___
<a id="resources"></a>

##  Resources

getResources(): `PDFDictionary`

*Defined in [pdf-structures/PDFPage.ts:92](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-structures/PDFPage.ts#L92)*

**Returns:** `PDFDictionary`

___

# Methods

<a id="addcontentstreams"></a>

##  addContentStreams

▸ **addContentStreams**(...contentStreams: *`Array`<`PDFIndirectReference`<`PDFContentStream`>>*): `this`

*Defined in [pdf-structures/PDFPage.ts:134](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-structures/PDFPage.ts#L134)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| `Rest` contentStreams | `Array`<`PDFIndirectReference`<`PDFContentStream`>> |

**Returns:** `this`

___
<a id="addfontdictionary"></a>

##  addFontDictionary

▸ **addFontDictionary**(key: *`string`*, fontDict: *`PDFIndirectReference`<`PDFDictionary`>*): `this`

*Defined in [pdf-structures/PDFPage.ts:153](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-structures/PDFPage.ts#L153)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| key | `string` |
| fontDict | `PDFIndirectReference`<`PDFDictionary`> |

**Returns:** `this`

___
<a id="addimageobject"></a>

##  addImageObject

▸ **addImageObject**(key: *`string`*, imageObject: *`PDFIndirectReference`<`PDFStream`>*): `this`

*Defined in [pdf-structures/PDFPage.ts:171](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-structures/PDFPage.ts#L171)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| key | `string` |
| imageObject | `PDFIndirectReference`<`PDFStream`> |

**Returns:** `this`

___
<a id="addxobject"></a>

##  addXObject

▸ **addXObject**(key: *`string`*, xObject: *`PDFIndirectReference`<`PDFStream`>*): `this`

*Defined in [pdf-structures/PDFPage.ts:179](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-structures/PDFPage.ts#L179)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| key | `string` |
| xObject | `PDFIndirectReference`<`PDFStream`> |

**Returns:** `this`

___
<a id="bytessize"></a>

##  bytesSize

▸ **bytesSize**(): `number`

*Inherited from (Anonymous function)*

*Overrides PDFObject.bytesSize*

*Defined in [pdf-objects/PDFDictionary.ts:98](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-objects/PDFDictionary.ts#L98)*

**Returns:** `number`

___
<a id="copybytesinto"></a>

##  copyBytesInto

▸ **copyBytesInto**(buffer: *`Uint8Array`*): `Uint8Array`

*Inherited from (Anonymous function)*

*Overrides PDFObject.copyBytesInto*

*Defined in [pdf-objects/PDFDictionary.ts:113](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-objects/PDFDictionary.ts#L113)*

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

*Defined in [pdf-objects/PDFDictionary.ts:49](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-objects/PDFDictionary.ts#L49)*

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

*Defined in [pdf-objects/PDFDictionary.ts:63](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-objects/PDFDictionary.ts#L63)*

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

*Defined in [pdf-objects/PDFDictionary.ts:52](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-objects/PDFDictionary.ts#L52)*

**Type parameters:**

#### T :  `PDFObject`
**Parameters:**

| Param | Type |
| ------ | ------ |
| key |  `string` &#124; `PDFName`|

**Returns:**  `T` &#124; `void`

___
<a id="normalizecontents"></a>

##  normalizeContents

▸ **normalizeContents**(): `void`

*Defined in [pdf-structures/PDFPage.ts:104](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-structures/PDFPage.ts#L104)*

Convert "Contents" to array if it exists and is not already

**Returns:** `void`

___
<a id="normalizeresources"></a>

##  normalizeResources

▸ **normalizeResources**(__namedParameters: *`object`*): `void`

*Defined in [pdf-structures/PDFPage.ts:114](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-structures/PDFPage.ts#L114)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `void`

___
<a id="set"></a>

##  set

▸ **set**(key: * `string` &#124; `PDFName`*, val: *`PDFObject`*, validateKeys?: *`boolean`*): `this`

*Inherited from (Anonymous function)*

*Defined in [pdf-objects/PDFDictionary.ts:67](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-objects/PDFDictionary.ts#L67)*

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

*Defined in [pdf-objects/PDFDictionary.ts:92](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-objects/PDFDictionary.ts#L92)*

**Returns:** `string`

___
<a id="create"></a>

## `<Static>` create

▸ **create**(index: *`PDFObjectIndex`*, size: *[`number`, `number`]*, resources?: *`PDFDictionary`*): [PDFPage](_pdf_structures_pdfpage_.pdfpage.md)

*Defined in [pdf-structures/PDFPage.ts:58](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-structures/PDFPage.ts#L58)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| index | `PDFObjectIndex` |
| size | [`number`, `number`] |
| `Optional` resources | `PDFDictionary` |

**Returns:** [PDFPage](_pdf_structures_pdfpage_.pdfpage.md)

___
<a id="from"></a>

## `<Static>` from

▸ **from**(object: * `object` &#124; `Map`<`PDFName`, `any`>*, index: *`PDFObjectIndex`*): `PDFDictionary`

*Inherited from (Anonymous function)*

*Defined in [pdf-objects/PDFDictionary.ts:12](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-objects/PDFDictionary.ts#L12)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| object |  `object` &#124; `Map`<`PDFName`, `any`>|
| index | `PDFObjectIndex` |

**Returns:** `PDFDictionary`

___
<a id="fromdict"></a>

## `<Static>` fromDict

▸ **fromDict**(dict: *`PDFDictionary`*): [PDFPage](_pdf_structures_pdfpage_.pdfpage.md)

*Defined in [pdf-structures/PDFPage.ts:87](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-structures/PDFPage.ts#L87)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| dict | `PDFDictionary` |

**Returns:** [PDFPage](_pdf_structures_pdfpage_.pdfpage.md)

___

