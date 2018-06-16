

Options object with named parameters for the [drawText](../modules/_pdf_operators_helpers_composite_text_.md#drawtext) operator helper.

# Hierarchy

**IDrawTextOptions**

# Properties

<a id="colorrgb"></a>

## `<Optional>` colorRgb

**● colorRgb**: *`number`[]*

*Defined in [pdf-operators/helpers/composite/text.ts:75](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-operators/helpers/composite/text.ts#L75)*

Default value is `[0, 0, 0]` (black).

Array of 3 values between `0.0` and `1.0` representing a point in the RGB color space. E.g. `colorRgb: [1, 0.2, 1]` will draw the text in a shade of pink - it's equivalent to `rgb(255, 50, 255)` in CSS.

RGB values are usually expressed in numbers from `0`-`255`, not `0.0`-`1.0` as used here. You can simply divide by 255 to do the conversion. E.g. we could achieve the same shade of pink with `colorRgb: [255 / 255, 50 / 255, 255 / 255]`.

___
<a id="font"></a>

##  font

**● font**: * `string` &#124; `PDFName`
*

*Defined in [pdf-operators/helpers/composite/text.ts:56](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-operators/helpers/composite/text.ts#L56)*

Name of the font to use when drawing the line of text. Should be present in the Font Dictionary of the page to which the content stream containing the `drawText` operator is applied.

___
<a id="size"></a>

## `<Optional>` size

**● size**: *`number`*

*Defined in [pdf-operators/helpers/composite/text.ts:62](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-operators/helpers/composite/text.ts#L62)*

Default value is `12`.

Size to draw the text. Can be any number.

___
<a id="x"></a>

## `<Optional>` x

**● x**: *`number`*

*Defined in [pdf-operators/helpers/composite/text.ts:44](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-operators/helpers/composite/text.ts#L44)*

Default value is `0`.

`x` coordinate to position the starting point of the line of text.

___
<a id="y"></a>

## `<Optional>` y

**● y**: *`number`*

*Defined in [pdf-operators/helpers/composite/text.ts:50](https://github.com/Hopding/pdf-lib/blob/ccd5602/src/core/pdf-operators/helpers/composite/text.ts#L50)*

Default value is `0`.

`y` coordinate to position the bottom of the line of text.

___

