

Options object with named parameters for the [drawCircle](../modules/_helpers_pdf_operators_composite_ellipse_.md#drawcircle) operator helper.

# Hierarchy

**IDrawCircleOptions**

# Properties

<a id="bordercolorrgb"></a>

## `<Optional>` borderColorRgb

**● borderColorRgb**: *`number`[]*

*Defined in [helpers/pdf-operators/composite/ellipse.ts:290](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/helpers/pdf-operators/composite/ellipse.ts#L290)*

Default value is `[0, 0, 0]` (black).

Array of 3 values between `0.0` and `1.0` representing a point in the RGB color space. E.g. `borderColorRgb: [1, 0.2, 1]` will draw the border in a shade of pink - it's equivalent to `rgb(255, 50, 255)` in CSS.

RGB values are usually expressed in numbers from `0`-`255`, not `0.0`-`1.0` as used here. You can simply divide by 255 to do the conversion. E.g. we could achieve the same shade of pink with `borderColorRgb: [255 / 255, 50 / 255, 255 / 255]`.

___
<a id="borderwidth"></a>

## `<Optional>` borderWidth

**● borderWidth**: * `undefined` &#124; `number`
*

*Defined in [helpers/pdf-operators/composite/ellipse.ts:264](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/helpers/pdf-operators/composite/ellipse.ts#L264)*

Default value is `15`.

`borderWidth` of the circle.

___
<a id="colorrgb"></a>

## `<Optional>` colorRgb

**● colorRgb**: *`number`[]*

*Defined in [helpers/pdf-operators/composite/ellipse.ts:277](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/helpers/pdf-operators/composite/ellipse.ts#L277)*

Default value is `[0, 0, 0]` (black).

Array of 3 values between `0.0` and `1.0` representing a point in the RGB color space. E.g. `colorRgb: [1, 0.2, 1]` will draw the circle in a shade of pink - it's equivalent to `rgb(255, 50, 255)` in CSS.

RGB values are usually expressed in numbers from `0`-`255`, not `0.0`-`1.0` as used here. You can simply divide by 255 to do the conversion. E.g. we could achieve the same shade of pink with `colorRgb: [255 / 255, 50 / 255, 255 / 255]`.

___
<a id="rotatedegrees"></a>

## `<Optional>` rotateDegrees

**● rotateDegrees**: * `undefined` &#124; `number`
*

*Defined in [helpers/pdf-operators/composite/ellipse.ts:297](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/helpers/pdf-operators/composite/ellipse.ts#L297)*

Default value is `0`.

Degrees to rotate the circle clockwise. If defined as a negative number, the circle will be rotated counter-clockwise.

___
<a id="rotateradians"></a>

## `<Optional>` rotateRadians

**● rotateRadians**: * `undefined` &#124; `number`
*

*Defined in [helpers/pdf-operators/composite/ellipse.ts:304](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/helpers/pdf-operators/composite/ellipse.ts#L304)*

Default value is `0`.

Radians to rotate the circle clockwise. If defined as a negative number, the circle will be rotated counter-clockwise.

___
<a id="size"></a>

## `<Optional>` size

**● size**: * `undefined` &#124; `number`
*

*Defined in [helpers/pdf-operators/composite/ellipse.ts:258](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/helpers/pdf-operators/composite/ellipse.ts#L258)*

Default value is `100`.

Scale of the circle.

___
<a id="skewdegrees"></a>

## `<Optional>` skewDegrees

**● skewDegrees**: * `undefined` &#124; `object`
*

*Defined in [helpers/pdf-operators/composite/ellipse.ts:312](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/helpers/pdf-operators/composite/ellipse.ts#L312)*

Default value is `{ xAxis: 0, yAxis: 0 }`.

Degrees to skew the x and y axes of the circle. Positive values will skew the axes into Quadrant 1. Negative values will skew the axes away from Quadrant 1.

___
<a id="skewradians"></a>

## `<Optional>` skewRadians

**● skewRadians**: * `undefined` &#124; `object`
*

*Defined in [helpers/pdf-operators/composite/ellipse.ts:320](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/helpers/pdf-operators/composite/ellipse.ts#L320)*

Default value is `{ xAxis: 0, yAxis: 0 }`.

Radians to skew the x and y axes of the circle. Positive values will skew the axes into Quadrant 1. Negative values will skew the axes away from Quadrant 1.

___
<a id="x"></a>

## `<Optional>` x

**● x**: * `undefined` &#124; `number`
*

*Defined in [helpers/pdf-operators/composite/ellipse.ts:246](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/helpers/pdf-operators/composite/ellipse.ts#L246)*

Default value is `0`.

`x` coordinate to position the center of the circle.

___
<a id="y"></a>

## `<Optional>` y

**● y**: * `undefined` &#124; `number`
*

*Defined in [helpers/pdf-operators/composite/ellipse.ts:252](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/helpers/pdf-operators/composite/ellipse.ts#L252)*

Default value is `0`.

`y` coordinate to position the center of the circle.

___

