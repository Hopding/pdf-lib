

Options object with named parameters for the [drawEllipse](../modules/_pdf_operators_helpers_composite_ellipse_.md#drawellipse) operator helper.

# Hierarchy

**IDrawEllipseOptions**

# Properties

<a id="bordercolorrgb"></a>

## `<Optional>` borderColorRgb

**● borderColorRgb**: *`number`[]*

*Defined in [pdf-operators/helpers/composite/ellipse.ts:130](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-operators/helpers/composite/ellipse.ts#L130)*

Default value is `[0, 0, 0]` (black).

Array of 3 values between `0.0` and `1.0` representing a point in the RGB color space. E.g. `borderColorRgb: [1, 0.2, 1]` will draw the border in a shade of pink - it's equivalent to `rgb(255, 50, 255)` in CSS.

RGB values are usually expressed in numbers from `0`-`255`, not `0.0`-`1.0` as used here. You can simply divide by 255 to do the conversion. E.g. we could achieve the same shade of pink with `borderColorRgb: [255 / 255, 50 / 255, 255 / 255]`.

___
<a id="borderwidth"></a>

## `<Optional>` borderWidth

**● borderWidth**: *`number`*

*Defined in [pdf-operators/helpers/composite/ellipse.ts:104](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-operators/helpers/composite/ellipse.ts#L104)*

Default value is `15`.

`borderWidth` of the ellipse.

___
<a id="colorrgb"></a>

## `<Optional>` colorRgb

**● colorRgb**: *`number`[]*

*Defined in [pdf-operators/helpers/composite/ellipse.ts:117](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-operators/helpers/composite/ellipse.ts#L117)*

Default value is `[0, 0, 0]` (black).

Array of 3 values between `0.0` and `1.0` representing a point in the RGB color space. E.g. `colorRgb: [1, 0.2, 1]` will draw the ellipse in a shade of pink - it's equivalent to `rgb(255, 50, 255)` in CSS.

RGB values are usually expressed in numbers from `0`-`255`, not `0.0`-`1.0` as used here. You can simply divide by 255 to do the conversion. E.g. we could achieve the same shade of pink with `colorRgb: [255 / 255, 50 / 255, 255 / 255]`.

___
<a id="x"></a>

## `<Optional>` x

**● x**: *`number`*

*Defined in [pdf-operators/helpers/composite/ellipse.ts:80](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-operators/helpers/composite/ellipse.ts#L80)*

Default value is `0`.

`x` coordinate to position the center of the ellipse.

___
<a id="xscale"></a>

## `<Optional>` xScale

**● xScale**: *`number`*

*Defined in [pdf-operators/helpers/composite/ellipse.ts:92](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-operators/helpers/composite/ellipse.ts#L92)*

Default value is `100`.

Scale of the x dimension.

___
<a id="y"></a>

## `<Optional>` y

**● y**: *`number`*

*Defined in [pdf-operators/helpers/composite/ellipse.ts:86](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-operators/helpers/composite/ellipse.ts#L86)*

Default value is `0`.

`y` coordinate to position the center of the ellipse.

___
<a id="yscale"></a>

## `<Optional>` yScale

**● yScale**: *`number`*

*Defined in [pdf-operators/helpers/composite/ellipse.ts:98](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-operators/helpers/composite/ellipse.ts#L98)*

Default value is `100`.

Scale of the y dimension.

___
