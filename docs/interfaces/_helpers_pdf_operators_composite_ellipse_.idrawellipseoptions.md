

Options object with named parameters for the [drawEllipse](../modules/_helpers_pdf_operators_composite_ellipse_.md#drawellipse) operator helper.

# Hierarchy

**IDrawEllipseOptions**

# Properties

<a id="bordercolorrgb"></a>

## `<Optional>` borderColorRgb

**● borderColorRgb**: *`number`[]*

*Defined in [helpers/pdf-operators/composite/ellipse.ts:126](https://github.com/Hopding/pdf-lib/blob/bdaae3d/src/helpers/pdf-operators/composite/ellipse.ts#L126)*

Default value is `[0, 0, 0]` (black).

Array of 3 values between `0.0` and `1.0` representing a point in the RGB color space. E.g. `borderColorRgb: [1, 0.2, 1]` will draw the border in a shade of pink - it's equivalent to `rgb(255, 50, 255)` in CSS.

RGB values are usually expressed in numbers from `0`-`255`, not `0.0`-`1.0` as used here. You can simply divide by 255 to do the conversion. E.g. we could achieve the same shade of pink with `borderColorRgb: [255 / 255, 50 / 255, 255 / 255]`.

___
<a id="borderwidth"></a>

## `<Optional>` borderWidth

**● borderWidth**: * `undefined` &#124; `number`
*

*Defined in [helpers/pdf-operators/composite/ellipse.ts:100](https://github.com/Hopding/pdf-lib/blob/bdaae3d/src/helpers/pdf-operators/composite/ellipse.ts#L100)*

Default value is `15`.

`borderWidth` of the ellipse.

___
<a id="colorrgb"></a>

## `<Optional>` colorRgb

**● colorRgb**: *`number`[]*

*Defined in [helpers/pdf-operators/composite/ellipse.ts:113](https://github.com/Hopding/pdf-lib/blob/bdaae3d/src/helpers/pdf-operators/composite/ellipse.ts#L113)*

Default value is `[0, 0, 0]` (black).

Array of 3 values between `0.0` and `1.0` representing a point in the RGB color space. E.g. `colorRgb: [1, 0.2, 1]` will draw the ellipse in a shade of pink - it's equivalent to `rgb(255, 50, 255)` in CSS.

RGB values are usually expressed in numbers from `0`-`255`, not `0.0`-`1.0` as used here. You can simply divide by 255 to do the conversion. E.g. we could achieve the same shade of pink with `colorRgb: [255 / 255, 50 / 255, 255 / 255]`.

___
<a id="rotatedegrees"></a>

## `<Optional>` rotateDegrees

**● rotateDegrees**: * `undefined` &#124; `number`
*

*Defined in [helpers/pdf-operators/composite/ellipse.ts:133](https://github.com/Hopding/pdf-lib/blob/bdaae3d/src/helpers/pdf-operators/composite/ellipse.ts#L133)*

Default value is `0`.

Degrees to rotate the ellipse clockwise. If defined as a negative number, the ellipse will be rotated counter-clockwise.

___
<a id="rotateradians"></a>

## `<Optional>` rotateRadians

**● rotateRadians**: * `undefined` &#124; `number`
*

*Defined in [helpers/pdf-operators/composite/ellipse.ts:140](https://github.com/Hopding/pdf-lib/blob/bdaae3d/src/helpers/pdf-operators/composite/ellipse.ts#L140)*

Default value is `0`.

Radians to rotate the ellipse clockwise. If defined as a negative number, the ellipse will be rotated counter-clockwise.

___
<a id="skewdegrees"></a>

## `<Optional>` skewDegrees

**● skewDegrees**: * `undefined` &#124; `object`
*

*Defined in [helpers/pdf-operators/composite/ellipse.ts:148](https://github.com/Hopding/pdf-lib/blob/bdaae3d/src/helpers/pdf-operators/composite/ellipse.ts#L148)*

Default value is `{ xAxis: 0, yAxis: 0 }`.

Degrees to skew the x and y axes of the ellipse. Positive values will skew the axes into Quadrant 1. Negative values will skew the axes away from Quadrant 1.

___
<a id="skewradians"></a>

## `<Optional>` skewRadians

**● skewRadians**: * `undefined` &#124; `object`
*

*Defined in [helpers/pdf-operators/composite/ellipse.ts:156](https://github.com/Hopding/pdf-lib/blob/bdaae3d/src/helpers/pdf-operators/composite/ellipse.ts#L156)*

Default value is `{ xAxis: 0, yAxis: 0 }`.

Radians to skew the x and y axes of the ellipse. Positive values will skew the axes into Quadrant 1. Negative values will skew the axes away from Quadrant 1.

___
<a id="x"></a>

## `<Optional>` x

**● x**: * `undefined` &#124; `number`
*

*Defined in [helpers/pdf-operators/composite/ellipse.ts:76](https://github.com/Hopding/pdf-lib/blob/bdaae3d/src/helpers/pdf-operators/composite/ellipse.ts#L76)*

Default value is `0`.

`x` coordinate to position the center of the ellipse.

___
<a id="xscale"></a>

## `<Optional>` xScale

**● xScale**: * `undefined` &#124; `number`
*

*Defined in [helpers/pdf-operators/composite/ellipse.ts:88](https://github.com/Hopding/pdf-lib/blob/bdaae3d/src/helpers/pdf-operators/composite/ellipse.ts#L88)*

Default value is `100`.

Scale of the x dimension.

___
<a id="y"></a>

## `<Optional>` y

**● y**: * `undefined` &#124; `number`
*

*Defined in [helpers/pdf-operators/composite/ellipse.ts:82](https://github.com/Hopding/pdf-lib/blob/bdaae3d/src/helpers/pdf-operators/composite/ellipse.ts#L82)*

Default value is `0`.

`y` coordinate to position the center of the ellipse.

___
<a id="yscale"></a>

## `<Optional>` yScale

**● yScale**: * `undefined` &#124; `number`
*

*Defined in [helpers/pdf-operators/composite/ellipse.ts:94](https://github.com/Hopding/pdf-lib/blob/bdaae3d/src/helpers/pdf-operators/composite/ellipse.ts#L94)*

Default value is `100`.

Scale of the y dimension.

___

