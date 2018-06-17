

Options object with named parameters for the [drawLinesOfText](../modules/_helpers_pdf_operators_composite_text_.md#drawlinesoftext) operator helper.

# Hierarchy

**IDrawLinesOfTextOptions**

# Properties

<a id="colorrgb"></a>

## `<Optional>` colorRgb

**● colorRgb**: *`number`[]*

*Defined in [helpers/pdf-operators/composite/text.ts:172](https://github.com/Hopding/pdf-lib/blob/d7334b8/src/helpers/pdf-operators/composite/text.ts#L172)*

Default value is `[0, 0, 0]` (black).

Array of 3 values between `0.0` and `1.0` representing a point in the RGB color space. E.g. `colorRgb: [1, 0.2, 1]` will draw the text in a shade of pink - it's equivalent to `rgb(255, 50, 255)` in CSS.

RGB values are usually expressed in numbers from `0`-`255`, not `0.0`-`1.0` as used here. You can simply divide by 255 to do the conversion. E.g. we could achieve the same shade of pink with `colorRgb: [255 / 255, 50 / 255, 255 / 255]`.

___
<a id="font"></a>

##  font

**● font**: * `string` &#124; `PDFName`
*

*Defined in [helpers/pdf-operators/composite/text.ts:147](https://github.com/Hopding/pdf-lib/blob/d7334b8/src/helpers/pdf-operators/composite/text.ts#L147)*

Name of the font to use when drawing the lines of text. Should be present in the Font Dictionary of the page to which the content stream containing the `drawLinesOfText` operator is applied.

___
<a id="lineheight"></a>

## `<Optional>` lineHeight

**● lineHeight**: *`number`*

*Defined in [helpers/pdf-operators/composite/text.ts:159](https://github.com/Hopding/pdf-lib/blob/d7334b8/src/helpers/pdf-operators/composite/text.ts#L159)*

Default value is equal to the value for `size`.

Distance between the lines of text.

___
<a id="size"></a>

## `<Optional>` size

**● size**: *`number`*

*Defined in [helpers/pdf-operators/composite/text.ts:153](https://github.com/Hopding/pdf-lib/blob/d7334b8/src/helpers/pdf-operators/composite/text.ts#L153)*

Default value is `12`.

Size to draw the text. Can be any number.

___
<a id="x"></a>

## `<Optional>` x

**● x**: *`number`*

*Defined in [helpers/pdf-operators/composite/text.ts:135](https://github.com/Hopding/pdf-lib/blob/d7334b8/src/helpers/pdf-operators/composite/text.ts#L135)*

Default value is `0`.

`x` coordinate to position the starting point of the first line of text.

___
<a id="y"></a>

## `<Optional>` y

**● y**: *`number`*

*Defined in [helpers/pdf-operators/composite/text.ts:141](https://github.com/Hopding/pdf-lib/blob/d7334b8/src/helpers/pdf-operators/composite/text.ts#L141)*

Default value is `0`.

`y` coordinate to position the bottom of the first line of text.

___

