

Options object with named parameters for the [drawEllipse](../modules/_helpers_pdf_operators_composite_ellipse_.md#drawellipse) operator helper.

# Hierarchy

**IDrawEllipseOptions**

# Properties

<a id="bordercolorrgb"></a>

## `<Optional>` borderColorRgb

**● borderColorRgb**: *`number`[]*

*Defined in [helpers/pdf-operators/composite/ellipse.ts:131](https://github.com/Hopding/pdf-lib/blob/10ef001/src/helpers/pdf-operators/composite/ellipse.ts#L131)*

Default value is `[0, 0, 0]` (black).

Array of 3 values between `0.0` and `1.0` representing a point in the RGB color space. E.g. `borderColorRgb: [1, 0.2, 1]` will draw the border in a shade of pink - it's equivalent to `rgb(255, 50, 255)` in CSS.

RGB values are usually expressed in numbers from `0`-`255`, not `0.0`-`1.0` as used here. You can simply divide by 255 to do the conversion. E.g. we could achieve the same shade of pink with `borderColorRgb: [255 / 255, 50 / 255, 255 / 255]`.

___
<a id="borderwidth"></a>

## `<Optional>` borderWidth

**● borderWidth**: *`number`*

*Defined in [helpers/pdf-operators/composite/ellipse.ts:105](https://github.com/Hopding/pdf-lib/blob/10ef001/src/helpers/pdf-operators/composite/ellipse.ts#L105)*

Default value is `15`.

`borderWidth` of the ellipse.

___
<a id="colorrgb"></a>

## `<Optional>` colorRgb

**● colorRgb**: *`number`[]*

*Defined in [helpers/pdf-operators/composite/ellipse.ts:118](https://github.com/Hopding/pdf-lib/blob/10ef001/src/helpers/pdf-operators/composite/ellipse.ts#L118)*

Default value is `[0, 0, 0]` (black).

Array of 3 values between `0.0` and `1.0` representing a point in the RGB color space. E.g. `colorRgb: [1, 0.2, 1]` will draw the ellipse in a shade of pink - it's equivalent to `rgb(255, 50, 255)` in CSS.

RGB values are usually expressed in numbers from `0`-`255`, not `0.0`-`1.0` as used here. You can simply divide by 255 to do the conversion. E.g. we could achieve the same shade of pink with `colorRgb: [255 / 255, 50 / 255, 255 / 255]`.

___
<a id="x"></a>

## `<Optional>` x

**● x**: *`number`*

*Defined in [helpers/pdf-operators/composite/ellipse.ts:81](https://github.com/Hopding/pdf-lib/blob/10ef001/src/helpers/pdf-operators/composite/ellipse.ts#L81)*

Default value is `0`.

`x` coordinate to position the center of the ellipse.

___
<a id="xscale"></a>

## `<Optional>` xScale

**● xScale**: *`number`*

*Defined in [helpers/pdf-operators/composite/ellipse.ts:93](https://github.com/Hopding/pdf-lib/blob/10ef001/src/helpers/pdf-operators/composite/ellipse.ts#L93)*

Default value is `100`.

Scale of the x dimension.

___
<a id="y"></a>

## `<Optional>` y

**● y**: *`number`*

*Defined in [helpers/pdf-operators/composite/ellipse.ts:87](https://github.com/Hopding/pdf-lib/blob/10ef001/src/helpers/pdf-operators/composite/ellipse.ts#L87)*

Default value is `0`.

`y` coordinate to position the center of the ellipse.

___
<a id="yscale"></a>

## `<Optional>` yScale

**● yScale**: *`number`*

*Defined in [helpers/pdf-operators/composite/ellipse.ts:99](https://github.com/Hopding/pdf-lib/blob/10ef001/src/helpers/pdf-operators/composite/ellipse.ts#L99)*

Default value is `100`.

Scale of the y dimension.

___

