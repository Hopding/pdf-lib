

Options object with named parameters for the [drawSquare](../modules/_pdf_operators_helpers_composite_rectangle_.md#drawsquare) operator helper.

# Hierarchy

**IDrawSquareOptions**

# Properties

<a id="bordercolorrgb"></a>

## `<Optional>` borderColorRgb

**● borderColorRgb**: *`number`[]*

*Defined in [pdf-operators/helpers/composite/rectangle.ts:207](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-operators/helpers/composite/rectangle.ts#L207)*

Default value is `[0, 0, 0]` (black).

Array of 3 values between `0.0` and `1.0` representing a point in the RGB color space. E.g. `borderColorRgb: [1, 0.2, 1]` will draw the border in a shade of pink - it's equivalent to `rgb(255, 50, 255)` in CSS.

RGB values are usually expressed in numbers from `0`-`255`, not `0.0`-`1.0` as used here. You can simply divide by 255 to do the conversion. E.g. we could achieve the same shade of pink with `borderColorRgb: [255 / 255, 50 / 255, 255 / 255]`.

___
<a id="borderwidth"></a>

## `<Optional>` borderWidth

**● borderWidth**: *`number`*

*Defined in [pdf-operators/helpers/composite/rectangle.ts:181](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-operators/helpers/composite/rectangle.ts#L181)*

Default value is `15`.

`borderWidth` of the square.

___
<a id="colorrgb"></a>

## `<Optional>` colorRgb

**● colorRgb**: *`number`[]*

*Defined in [pdf-operators/helpers/composite/rectangle.ts:194](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-operators/helpers/composite/rectangle.ts#L194)*

Default value is `[0, 0, 0]` (black).

Array of 3 values between `0.0` and `1.0` representing a point in the RGB color space. E.g. `colorRgb: [1, 0.2, 1]` will draw the square in a shade of pink - it's equivalent to `rgb(255, 50, 255)` in CSS.

RGB values are usually expressed in numbers from `0`-`255`, not `0.0`-`1.0` as used here. You can simply divide by 255 to do the conversion. E.g. we could achieve the same shade of pink with `colorRgb: [255 / 255, 50 / 255, 255 / 255]`.

___
<a id="size"></a>

## `<Optional>` size

**● size**: *`number`*

*Defined in [pdf-operators/helpers/composite/rectangle.ts:175](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-operators/helpers/composite/rectangle.ts#L175)*

Default value is `100`.

`size` of the square.

___
<a id="x"></a>

## `<Optional>` x

**● x**: *`number`*

*Defined in [pdf-operators/helpers/composite/rectangle.ts:163](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-operators/helpers/composite/rectangle.ts#L163)*

Default value is `0`.

`x` coordinate to position the lower left corner of the square.

___
<a id="y"></a>

## `<Optional>` y

**● y**: *`number`*

*Defined in [pdf-operators/helpers/composite/rectangle.ts:169](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-operators/helpers/composite/rectangle.ts#L169)*

Default value is `0`.

`y` coordinate to position the lower left corner of the square.

___

