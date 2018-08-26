

Options object with named parameters for the [drawRectangle](../modules/_helpers_pdf_operators_composite_rectangle_.md#drawrectangle) operator helper.

# Hierarchy

**IDrawRectangleOptions**

# Properties

<a id="bordercolorrgb"></a>

## `<Optional>` borderColorRgb

**● borderColorRgb**: *`number`[]*

*Defined in [helpers/pdf-operators/composite/rectangle.ts:103](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/helpers/pdf-operators/composite/rectangle.ts#L103)*

Default value is `[0, 0, 0]` (black).

Array of 3 values between `0.0` and `1.0` representing a point in the RGB color space. E.g. `borderColorRgb: [1, 0.2, 1]` will draw the border in a shade of pink - it's equivalent to `rgb(255, 50, 255)` in CSS.

RGB values are usually expressed in numbers from `0`-`255`, not `0.0`-`1.0` as used here. You can simply divide by 255 to do the conversion. E.g. we could achieve the same shade of pink with `borderColorRgb: [255 / 255, 50 / 255, 255 / 255]`.

___
<a id="borderwidth"></a>

## `<Optional>` borderWidth

**● borderWidth**: * `undefined` &#124; `number`
*

*Defined in [helpers/pdf-operators/composite/rectangle.ts:77](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/helpers/pdf-operators/composite/rectangle.ts#L77)*

Default value is `15`.

`borderWidth` of the rectangle.

___
<a id="colorrgb"></a>

## `<Optional>` colorRgb

**● colorRgb**: *`number`[]*

*Defined in [helpers/pdf-operators/composite/rectangle.ts:90](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/helpers/pdf-operators/composite/rectangle.ts#L90)*

Default value is `[0, 0, 0]` (black).

Array of 3 values between `0.0` and `1.0` representing a point in the RGB color space. E.g. `colorRgb: [1, 0.2, 1]` will draw the rectangle in a shade of pink - it's equivalent to `rgb(255, 50, 255)` in CSS.

RGB values are usually expressed in numbers from `0`-`255`, not `0.0`-`1.0` as used here. You can simply divide by 255 to do the conversion. E.g. we could achieve the same shade of pink with `colorRgb: [255 / 255, 50 / 255, 255 / 255]`.

___
<a id="height"></a>

## `<Optional>` height

**● height**: * `undefined` &#124; `number`
*

*Defined in [helpers/pdf-operators/composite/rectangle.ts:71](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/helpers/pdf-operators/composite/rectangle.ts#L71)*

Default value is `100`.

`height` of the rectangle.

___
<a id="rotatedegrees"></a>

## `<Optional>` rotateDegrees

**● rotateDegrees**: * `undefined` &#124; `number`
*

*Defined in [helpers/pdf-operators/composite/rectangle.ts:110](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/helpers/pdf-operators/composite/rectangle.ts#L110)*

Default value is `0`.

Degrees to rotate the rectangle clockwise. If defined as a negative number, the rectangle will be rotated counter-clockwise.

___
<a id="rotateradians"></a>

## `<Optional>` rotateRadians

**● rotateRadians**: * `undefined` &#124; `number`
*

*Defined in [helpers/pdf-operators/composite/rectangle.ts:117](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/helpers/pdf-operators/composite/rectangle.ts#L117)*

Default value is `0`.

Radians to rotate the rectangle clockwise. If defined as a negative number, the rectangle will be rotated counter-clockwise.

___
<a id="skewdegrees"></a>

## `<Optional>` skewDegrees

**● skewDegrees**: * `undefined` &#124; `object`
*

*Defined in [helpers/pdf-operators/composite/rectangle.ts:125](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/helpers/pdf-operators/composite/rectangle.ts#L125)*

Default value is `{ xAxis: 0, yAxis: 0 }`.

Degrees to skew the x and y axes of the rectangle. Positive values will skew the axes into Quadrant 1. Negative values will skew the axes away from Quadrant 1.

___
<a id="skewradians"></a>

## `<Optional>` skewRadians

**● skewRadians**: * `undefined` &#124; `object`
*

*Defined in [helpers/pdf-operators/composite/rectangle.ts:133](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/helpers/pdf-operators/composite/rectangle.ts#L133)*

Default value is `{ xAxis: 0, yAxis: 0 }`.

Radians to skew the x and y axes of the rectangle. Positive values will skew the axes into Quadrant 1. Negative values will skew the axes away from Quadrant 1.

___
<a id="width"></a>

## `<Optional>` width

**● width**: * `undefined` &#124; `number`
*

*Defined in [helpers/pdf-operators/composite/rectangle.ts:65](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/helpers/pdf-operators/composite/rectangle.ts#L65)*

Default value is `150`.

`width` of the rectangle.

___
<a id="x"></a>

## `<Optional>` x

**● x**: * `undefined` &#124; `number`
*

*Defined in [helpers/pdf-operators/composite/rectangle.ts:53](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/helpers/pdf-operators/composite/rectangle.ts#L53)*

Default value is `0`.

`x` coordinate to position the lower left corner of the rectangle.

___
<a id="y"></a>

## `<Optional>` y

**● y**: * `undefined` &#124; `number`
*

*Defined in [helpers/pdf-operators/composite/rectangle.ts:59](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/helpers/pdf-operators/composite/rectangle.ts#L59)*

Default value is `0`.

`y` coordinate to position the lower left corner of the rectangle.

___

