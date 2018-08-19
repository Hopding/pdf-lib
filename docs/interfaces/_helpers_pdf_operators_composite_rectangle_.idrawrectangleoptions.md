

Options object with named parameters for the [drawRectangle](../modules/_helpers_pdf_operators_composite_rectangle_.md#drawrectangle) operator helper.

# Hierarchy

**IDrawRectangleOptions**

# Properties

<a id="bordercolorrgb"></a>

## `<Optional>` borderColorRgb

**● borderColorRgb**: *`number`[]*

*Defined in [helpers/pdf-operators/composite/rectangle.ts:98](https://github.com/Hopding/pdf-lib/blob/4875209/src/helpers/pdf-operators/composite/rectangle.ts#L98)*

Default value is `[0, 0, 0]` (black).

Array of 3 values between `0.0` and `1.0` representing a point in the RGB color space. E.g. `borderColorRgb: [1, 0.2, 1]` will draw the border in a shade of pink - it's equivalent to `rgb(255, 50, 255)` in CSS.

RGB values are usually expressed in numbers from `0`-`255`, not `0.0`-`1.0` as used here. You can simply divide by 255 to do the conversion. E.g. we could achieve the same shade of pink with `borderColorRgb: [255 / 255, 50 / 255, 255 / 255]`.

___
<a id="borderwidth"></a>

## `<Optional>` borderWidth

**● borderWidth**: * `undefined` &#124; `number`
*

*Defined in [helpers/pdf-operators/composite/rectangle.ts:72](https://github.com/Hopding/pdf-lib/blob/4875209/src/helpers/pdf-operators/composite/rectangle.ts#L72)*

Default value is `15`.

`borderWidth` of the rectangle.

___
<a id="colorrgb"></a>

## `<Optional>` colorRgb

**● colorRgb**: *`number`[]*

*Defined in [helpers/pdf-operators/composite/rectangle.ts:85](https://github.com/Hopding/pdf-lib/blob/4875209/src/helpers/pdf-operators/composite/rectangle.ts#L85)*

Default value is `[0, 0, 0]` (black).

Array of 3 values between `0.0` and `1.0` representing a point in the RGB color space. E.g. `colorRgb: [1, 0.2, 1]` will draw the rectangle in a shade of pink - it's equivalent to `rgb(255, 50, 255)` in CSS.

RGB values are usually expressed in numbers from `0`-`255`, not `0.0`-`1.0` as used here. You can simply divide by 255 to do the conversion. E.g. we could achieve the same shade of pink with `colorRgb: [255 / 255, 50 / 255, 255 / 255]`.

___
<a id="height"></a>

## `<Optional>` height

**● height**: * `undefined` &#124; `number`
*

*Defined in [helpers/pdf-operators/composite/rectangle.ts:66](https://github.com/Hopding/pdf-lib/blob/4875209/src/helpers/pdf-operators/composite/rectangle.ts#L66)*

Default value is `100`.

`height` of the rectangle.

___
<a id="width"></a>

## `<Optional>` width

**● width**: * `undefined` &#124; `number`
*

*Defined in [helpers/pdf-operators/composite/rectangle.ts:60](https://github.com/Hopding/pdf-lib/blob/4875209/src/helpers/pdf-operators/composite/rectangle.ts#L60)*

Default value is `150`.

`width` of the rectangle.

___
<a id="x"></a>

## `<Optional>` x

**● x**: * `undefined` &#124; `number`
*

*Defined in [helpers/pdf-operators/composite/rectangle.ts:48](https://github.com/Hopding/pdf-lib/blob/4875209/src/helpers/pdf-operators/composite/rectangle.ts#L48)*

Default value is `0`.

`x` coordinate to position the lower left corner of the rectangle.

___
<a id="y"></a>

## `<Optional>` y

**● y**: * `undefined` &#124; `number`
*

*Defined in [helpers/pdf-operators/composite/rectangle.ts:54](https://github.com/Hopding/pdf-lib/blob/4875209/src/helpers/pdf-operators/composite/rectangle.ts#L54)*

Default value is `0`.

`y` coordinate to position the lower left corner of the rectangle.

___

