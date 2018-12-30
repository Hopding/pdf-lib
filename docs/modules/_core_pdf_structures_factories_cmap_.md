

# Type aliases

<a id="bfrange"></a>

##  BfRange

**ΤBfRange**: *[[`string`, `string`], `string`[]]*

*Defined in [core/pdf-structures/factories/CMap.ts:9](https://github.com/Hopding/pdf-lib/blob/0d3a994/src/core/pdf-structures/factories/CMap.ts#L9)*

\[\[start, end\], mappings\]

___

# Functions

<a id="cmapcodepointformat"></a>

## `<Const>` cmapCodePointFormat

▸ **cmapCodePointFormat**(codePoint: *`number`*): `string`

*Defined in [core/pdf-structures/factories/CMap.ts:70](https://github.com/Hopding/pdf-lib/blob/0d3a994/src/core/pdf-structures/factories/CMap.ts#L70)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| codePoint | `number` |

**Returns:** `string`

___
<a id="cmaphexformat"></a>

## `<Const>` cmapHexFormat

▸ **cmapHexFormat**(...values: *`string`[]*): `string`

*Defined in [core/pdf-structures/factories/CMap.ts:66](https://github.com/Hopding/pdf-lib/blob/0d3a994/src/core/pdf-structures/factories/CMap.ts#L66)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| `Rest` values | `string`[] |

**Returns:** `string`

___
<a id="cmaphexstring"></a>

## `<Const>` cmapHexString

▸ **cmapHexString**(value: *`number`*): `string`

*Defined in [core/pdf-structures/factories/CMap.ts:68](https://github.com/Hopding/pdf-lib/blob/0d3a994/src/core/pdf-structures/factories/CMap.ts#L68)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| value | `number` |

**Returns:** `string`

___
<a id="createcmap"></a>

## `<Const>` createCmap

▸ **createCmap**(glyphs: *`Glyph`[]*): `string`

*Defined in [core/pdf-structures/factories/CMap.ts:12](https://github.com/Hopding/pdf-lib/blob/0d3a994/src/core/pdf-structures/factories/CMap.ts#L12)*

`glyphs` should be an array of unique glyphs sorted by their ID

**Parameters:**

| Param | Type |
| ------ | ------ |
| glyphs | `Glyph`[] |

**Returns:** `string`

___
<a id="fillbfrangetemplate"></a>

## `<Const>` fillBfrangeTemplate

▸ **fillBfrangeTemplate**(__namedParameters: *[`any`, `Array`]*): `string`

*Defined in [core/pdf-structures/factories/CMap.ts:36](https://github.com/Hopding/pdf-lib/blob/0d3a994/src/core/pdf-structures/factories/CMap.ts#L36)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | [`any`, `Array`] |

**Returns:** `string`

___
<a id="fillcmaptemplate"></a>

## `<Const>` fillCmapTemplate

▸ **fillCmapTemplate**(bfRanges: *[BfRange](_core_pdf_structures_factories_cmap_.md#bfrange)[]*): `string`

*Defined in [core/pdf-structures/factories/CMap.ts:43](https://github.com/Hopding/pdf-lib/blob/0d3a994/src/core/pdf-structures/factories/CMap.ts#L43)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| bfRanges | [BfRange](_core_pdf_structures_factories_cmap_.md#bfrange)[] |

**Returns:** `string`

___
<a id="highsurrogate"></a>

## `<Const>` highSurrogate

▸ **highSurrogate**(codePoint: *`number`*): `number`

*Defined in [core/pdf-structures/factories/CMap.ts:94](https://github.com/Hopding/pdf-lib/blob/0d3a994/src/core/pdf-structures/factories/CMap.ts#L94)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| codePoint | `number` |

**Returns:** `number`

___
<a id="isutf16codepoint"></a>

## `<Const>` isUtf16CodePoint

▸ **isUtf16CodePoint**(codePoint: *`number`*): `boolean`

*Defined in [core/pdf-structures/factories/CMap.ts:89](https://github.com/Hopding/pdf-lib/blob/0d3a994/src/core/pdf-structures/factories/CMap.ts#L89)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| codePoint | `number` |

**Returns:** `boolean`

___
<a id="isutf8codepoint"></a>

## `<Const>` isUtf8CodePoint

▸ **isUtf8CodePoint**(codePoint: *`number`*): `boolean`

*Defined in [core/pdf-structures/factories/CMap.ts:85](https://github.com/Hopding/pdf-lib/blob/0d3a994/src/core/pdf-structures/factories/CMap.ts#L85)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| codePoint | `number` |

**Returns:** `boolean`

___
<a id="lowsurrogate"></a>

## `<Const>` lowSurrogate

▸ **lowSurrogate**(codePoint: *`number`*): `number`

*Defined in [core/pdf-structures/factories/CMap.ts:99](https://github.com/Hopding/pdf-lib/blob/0d3a994/src/core/pdf-structures/factories/CMap.ts#L99)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| codePoint | `number` |

**Returns:** `number`

___

