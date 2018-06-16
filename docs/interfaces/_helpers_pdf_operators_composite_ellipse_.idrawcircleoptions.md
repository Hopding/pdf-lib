

Options object with named parameters for the [drawCircle](../modules/_helpers_pdf_operators_composite_ellipse_.md#drawcircle) operator helper.

# Hierarchy

**IDrawCircleOptions**

# Properties

<a id="bordercolorrgb"></a>

## `<Optional>` borderColorRgb

**● borderColorRgb**: *`number`[]*

*Defined in [helpers/pdf-operators/composite/ellipse.ts:239](https://github.com/Hopding/pdf-lib/blob/41c216d/src/helpers/pdf-operators/composite/ellipse.ts#L239)*

Default value is `[0, 0, 0]` (black).

Array of 3 values between `0.0` and `1.0` representing a point in the RGB color space. E.g. `borderColorRgb: [1, 0.2, 1]` will draw the border in a shade of pink - it's equivalent to `rgb(255, 50, 255)` in CSS.

RGB values are usually expressed in numbers from `0`-`255`, not `0.0`-`1.0` as used here. You can simply divide by 255 to do the conversion. E.g. we could achieve the same shade of pink with `borderColorRgb: [255 / 255, 50 / 255, 255 / 255]`.

___
<a id="borderwidth"></a>

## `<Optional>` borderWidth

**● borderWidth**: *`number`*

*Defined in [helpers/pdf-operators/composite/ellipse.ts:213](https://github.com/Hopding/pdf-lib/blob/41c216d/src/helpers/pdf-operators/composite/ellipse.ts#L213)*

Default value is `15`.

`borderWidth` of the circle.

___
<a id="colorrgb"></a>

## `<Optional>` colorRgb

**● colorRgb**: *`number`[]*

*Defined in [helpers/pdf-operators/composite/ellipse.ts:226](https://github.com/Hopding/pdf-lib/blob/41c216d/src/helpers/pdf-operators/composite/ellipse.ts#L226)*

Default value is `[0, 0, 0]` (black).

Array of 3 values between `0.0` and `1.0` representing a point in the RGB color space. E.g. `colorRgb: [1, 0.2, 1]` will draw the circle in a shade of pink - it's equivalent to `rgb(255, 50, 255)` in CSS.

RGB values are usually expressed in numbers from `0`-`255`, not `0.0`-`1.0` as used here. You can simply divide by 255 to do the conversion. E.g. we could achieve the same shade of pink with `colorRgb: [255 / 255, 50 / 255, 255 / 255]`.

___
<a id="size"></a>

## `<Optional>` size

**● size**: *`number`*

*Defined in [helpers/pdf-operators/composite/ellipse.ts:207](https://github.com/Hopding/pdf-lib/blob/41c216d/src/helpers/pdf-operators/composite/ellipse.ts#L207)*

Default value is `100`.

Scale of the circle.

___
<a id="x"></a>

## `<Optional>` x

**● x**: *`number`*

*Defined in [helpers/pdf-operators/composite/ellipse.ts:195](https://github.com/Hopding/pdf-lib/blob/41c216d/src/helpers/pdf-operators/composite/ellipse.ts#L195)*

Default value is `0`.

`x` coordinate to position the center of the circle.

___
<a id="y"></a>

## `<Optional>` y

**● y**: *`number`*

*Defined in [helpers/pdf-operators/composite/ellipse.ts:201](https://github.com/Hopding/pdf-lib/blob/41c216d/src/helpers/pdf-operators/composite/ellipse.ts#L201)*

Default value is `0`.

`y` coordinate to position the center of the circle.

___

