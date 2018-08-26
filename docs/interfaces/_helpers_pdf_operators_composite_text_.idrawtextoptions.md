

Options object with named parameters for the [drawText](../modules/_helpers_pdf_operators_composite_text_.md#drawtext) operator helper.

# Hierarchy

**IDrawTextOptions**

# Properties

<a id="colorrgb"></a>

## `<Optional>` colorRgb

**● colorRgb**: *`number`[]*

*Defined in [helpers/pdf-operators/composite/text.ts:80](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/helpers/pdf-operators/composite/text.ts#L80)*

Default value is `[0, 0, 0]` (black).

Array of 3 values between `0.0` and `1.0` representing a point in the RGB color space. E.g. `colorRgb: [1, 0.2, 1]` will draw the text in a shade of pink - it's equivalent to `rgb(255, 50, 255)` in CSS.

RGB values are usually expressed in numbers from `0`-`255`, not `0.0`-`1.0` as used here. You can simply divide by 255 to do the conversion. E.g. we could achieve the same shade of pink with `colorRgb: [255 / 255, 50 / 255, 255 / 255]`.

___
<a id="font"></a>

##  font

**● font**: * `string` &#124; `PDFName`
*

*Defined in [helpers/pdf-operators/composite/text.ts:61](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/helpers/pdf-operators/composite/text.ts#L61)*

Name of the font to use when drawing the line of text. Should be present in the Font Dictionary of the page to which the content stream containing the `drawText` operator is applied.

___
<a id="rotatedegrees"></a>

## `<Optional>` rotateDegrees

**● rotateDegrees**: * `undefined` &#124; `number`
*

*Defined in [helpers/pdf-operators/composite/text.ts:89](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/helpers/pdf-operators/composite/text.ts#L89)*

Default value is `0`.

Degrees to rotate the text clockwise. If defined as a negative number, the text will be rotated counter-clockwise.

___
<a id="rotateradians"></a>

## `<Optional>` rotateRadians

**● rotateRadians**: * `undefined` &#124; `number`
*

*Defined in [helpers/pdf-operators/composite/text.ts:96](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/helpers/pdf-operators/composite/text.ts#L96)*

Default value is `0`.

Radians to rotate the text clockwise. If defined as a negative number, the text will be rotated counter-clockwise.

___
<a id="size"></a>

## `<Optional>` size

**● size**: * `undefined` &#124; `number`
*

*Defined in [helpers/pdf-operators/composite/text.ts:67](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/helpers/pdf-operators/composite/text.ts#L67)*

Default value is `12`.

Size to draw the text. Can be any number.

___
<a id="skewdegrees"></a>

## `<Optional>` skewDegrees

**● skewDegrees**: * `undefined` &#124; `object`
*

*Defined in [helpers/pdf-operators/composite/text.ts:104](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/helpers/pdf-operators/composite/text.ts#L104)*

Default value is `{ xAxis: 0, yAxis: 0 }`.

Degrees to skew the x and y axes of the text. Positive values will skew the axes into Quadrant 1. Negative values will skew the axes away from Quadrant 1.

___
<a id="skewradians"></a>

## `<Optional>` skewRadians

**● skewRadians**: * `undefined` &#124; `object`
*

*Defined in [helpers/pdf-operators/composite/text.ts:112](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/helpers/pdf-operators/composite/text.ts#L112)*

Default value is `{ xAxis: 0, yAxis: 0 }`.

Radians to skew the x and y axes of the text. Positive values will skew the axes into Quadrant 1. Negative values will skew the axes away from Quadrant 1.

___
<a id="x"></a>

## `<Optional>` x

**● x**: * `undefined` &#124; `number`
*

*Defined in [helpers/pdf-operators/composite/text.ts:49](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/helpers/pdf-operators/composite/text.ts#L49)*

Default value is `0`.

`x` coordinate to position the starting point of the line of text.

___
<a id="y"></a>

## `<Optional>` y

**● y**: * `undefined` &#124; `number`
*

*Defined in [helpers/pdf-operators/composite/text.ts:55](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/helpers/pdf-operators/composite/text.ts#L55)*

Default value is `0`.

`y` coordinate to position the bottom of the line of text.

___

