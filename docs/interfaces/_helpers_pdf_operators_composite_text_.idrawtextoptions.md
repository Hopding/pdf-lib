

Options object with named parameters for the [drawText](../modules/_helpers_pdf_operators_composite_text_.md#drawtext) operator helper.

# Hierarchy

**IDrawTextOptions**

# Properties

<a id="colorrgb"></a>

## `<Optional>` colorRgb

**● colorRgb**: *`number`[]*

*Defined in [helpers/pdf-operators/composite/text.ts:77](https://github.com/Hopding/pdf-lib/blob/dd3a0e3/src/helpers/pdf-operators/composite/text.ts#L77)*

Default value is `[0, 0, 0]` (black).

Array of 3 values between `0.0` and `1.0` representing a point in the RGB color space. E.g. `colorRgb: [1, 0.2, 1]` will draw the text in a shade of pink - it's equivalent to `rgb(255, 50, 255)` in CSS.

RGB values are usually expressed in numbers from `0`-`255`, not `0.0`-`1.0` as used here. You can simply divide by 255 to do the conversion. E.g. we could achieve the same shade of pink with `colorRgb: [255 / 255, 50 / 255, 255 / 255]`.

___
<a id="font"></a>

##  font

**● font**: * `string` &#124; `PDFName`
*

*Defined in [helpers/pdf-operators/composite/text.ts:58](https://github.com/Hopding/pdf-lib/blob/dd3a0e3/src/helpers/pdf-operators/composite/text.ts#L58)*

Name of the font to use when drawing the line of text. Should be present in the Font Dictionary of the page to which the content stream containing the `drawText` operator is applied.

___
<a id="size"></a>

## `<Optional>` size

**● size**: *`number`*

*Defined in [helpers/pdf-operators/composite/text.ts:64](https://github.com/Hopding/pdf-lib/blob/dd3a0e3/src/helpers/pdf-operators/composite/text.ts#L64)*

Default value is `12`.

Size to draw the text. Can be any number.

___
<a id="x"></a>

## `<Optional>` x

**● x**: *`number`*

*Defined in [helpers/pdf-operators/composite/text.ts:46](https://github.com/Hopding/pdf-lib/blob/dd3a0e3/src/helpers/pdf-operators/composite/text.ts#L46)*

Default value is `0`.

`x` coordinate to position the starting point of the line of text.

___
<a id="y"></a>

## `<Optional>` y

**● y**: *`number`*

*Defined in [helpers/pdf-operators/composite/text.ts:52](https://github.com/Hopding/pdf-lib/blob/dd3a0e3/src/helpers/pdf-operators/composite/text.ts#L52)*

Default value is `0`.

`y` coordinate to position the bottom of the line of text.

___

