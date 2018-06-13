import _ from 'lodash';

import { PDFName } from 'core/pdf-objects';
import PDFOperator from 'core/pdf-operators/PDFOperator';
import PDFTextObject from 'core/pdf-operators/text/PDFTextObject';
import { isInRange, validate } from 'utils/validate';

import {
  appendBezierCurve,
  clip,
  closePath,
  dashPattern,
  endPath,
  fill,
  fillAndStroke,
  fillingRgbColor,
  fontAndSize,
  image,
  lineHeight,
  lineWidth,
  moveTo,
  nextLine,
  popGraphicsState,
  pushGraphicsState,
  rectangle,
  scale,
  square,
  stroke,
  strokingRgbColor,
  text,
  textPosition,
  translate,
} from 'core/pdf-operators/helpers/simple';

// Based on: http://spencermortensen.com/articles/bezier-circle/
//   P_0 = (0,1),  P_1 = (c,1),   P_2 = (1,c),   P_3 = (1,0)
//   P_0 = (1,0),  P_1 = (1,-c),  P_2 = (c,-1),  P_3 = (0,-1)
//   P_0 = (0,-1), P_1 = (-c,-1), P_3 = (-1,-c), P_4 = (-1,0)
//   P_0 = (-1,0), P_1 = (-1,c),  P_2 = (-c,1),  P_3 = (0,1)
//     with c = 0.551915024494
const C_VAL = 0.551915024494;
const drawEllipsePath = ({
  x = 0,
  y = 0,
  xScale = 100,
  yScale = 100,
}: {
  x?: number;
  y?: number;
  xScale?: number;
  yScale?: number;
}): PDFOperator[] => [
  pushGraphicsState(),
  translate(x, y),
  scale(xScale, yScale),
  moveTo(0, 1),
  appendBezierCurve(C_VAL, 1, 1, C_VAL, 1, 0),
  appendBezierCurve(1, -C_VAL, C_VAL, -1, 0, -1),
  appendBezierCurve(-C_VAL, -1, -1, -C_VAL, -1, 0),
  appendBezierCurve(-1, C_VAL, -C_VAL, 1, 0, 1),
  popGraphicsState(),
];

// TODO: Implement borderStyle option.
export const drawEllipse = ({
  x = 0,
  y = 0,
  xScale = 100,
  yScale = 100,
  borderWidth = 15,
  colorRgb = [],
  borderColorRgb = [],
}: {
  x?: number;
  y?: number;
  xScale?: number;
  yScale?: number;
  borderWidth?: number;
  colorRgb?: number[];
  borderColorRgb?: number[];
}): PDFOperator[] => [
  pushGraphicsState(),
  fillingRgbColor(colorRgb[0] || 0, colorRgb[1] || 0, colorRgb[2] || 0),
  strokingRgbColor(
    borderColorRgb[0] || 0,
    borderColorRgb[1] || 0,
    borderColorRgb[2] || 0,
  ),
  lineWidth(borderWidth),
  ...drawEllipsePath({ x, y, xScale, yScale }),
  // prettier-ignore
  !_.isEmpty(colorRgb) && !_.isEmpty(borderColorRgb) ? fillAndStroke()
  : !_.isEmpty(colorRgb)                             ? fill()
  : !_.isEmpty(borderColorRgb)                           ? stroke()
  : closePath(),
  popGraphicsState(),
];

export const drawCircle = ({
  x = 0,
  y = 0,
  size = 100,
  borderWidth = 15,
  colorRgb = [],
  borderColorRgb = [],
}: {
  x?: number;
  y?: number;
  size?: number;
  borderWidth?: number;
  colorRgb?: number[];
  borderColorRgb?: number[];
}): PDFOperator[] =>
  drawEllipse({
    x,
    y,
    xScale: size,
    yScale: size,
    borderWidth,
    colorRgb,
    borderColorRgb,
  });

// TODO: Implement cornerStyle option
export const drawRectangle = ({
  x = 0,
  y = 0,
  width = 100,
  height = 100,
  borderWidth = 15,
  colorRgb = [],
  borderColorRgb = [],
}: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  borderWidth?: number;
  colorRgb?: number[];
  borderColorRgb?: number[];
}): PDFOperator[] => [
  pushGraphicsState(),
  fillingRgbColor(colorRgb[0] || 0, colorRgb[1] || 0, colorRgb[2] || 0),
  strokingRgbColor(
    borderColorRgb[0] || 0,
    borderColorRgb[1] || 0,
    borderColorRgb[2] || 0,
  ),
  lineWidth(borderWidth),
  rectangle(x, y, width, height),
  // prettier-ignore
  !_.isEmpty(colorRgb) && !_.isEmpty(borderColorRgb) ? fillAndStroke()
  : !_.isEmpty(colorRgb)                             ? fill()
  : !_.isEmpty(borderColorRgb)                           ? stroke()
  : closePath(),
  popGraphicsState(),
];

export const drawSquare = ({
  x = 0,
  y = 0,
  size = 100,
  borderWidth = 15,
  colorRgb = [],
  borderColorRgb = [],
}: {
  x?: number;
  y?: number;
  size?: number;
  borderWidth?: number;
  colorRgb?: number[];
  borderColorRgb?: number[];
}): PDFOperator[] =>
  drawRectangle({
    x,
    y,
    width: size,
    height: size,
    borderWidth,
    colorRgb,
    borderColorRgb,
  });

// TODO: Implement the border* options
export const drawText = (
  textStr: string,
  {
    x = 0,
    y = 0,
    font,
    size = 12,
    // borderWidth = 15,
    colorRgb = [],
  }: // borderRgbColor = [],
  {
    x?: number;
    y?: number;
    font: string; // | PDFName
    size?: number;
    // borderWidth?: number;
    colorRgb?: number[];
    // borderRgbColor?: number[];
  },
): PDFOperator[] => [
  PDFTextObject.of(
    fillingRgbColor(colorRgb[0] || 0, colorRgb[1] || 0, colorRgb[2] || 0),
    fontAndSize(font, size),
    textPosition(x, y),
    text(textStr),
  ),
];

// TODO: Implement the border* options
export const drawLinesOfText = (
  lines: string[],
  {
    x = 0,
    y = 0,
    font,
    size = 12,
    lineHeight: lineHeightParam,
    // borderWidth = 15,
    colorRgb = [],
  }: // borderRgbColor = [],
  {
    x?: number;
    y?: number;
    font: string | PDFName;
    size?: number;
    lineHeight?: number;
    // borderWidth?: number;
    colorRgb?: number[];
    // borderRgbColor?: number[];
  },
): PDFOperator[] => [
  PDFTextObject.of(
    fillingRgbColor(colorRgb[0] || 0, colorRgb[1] || 0, colorRgb[2] || 0),
    fontAndSize(font, size),
    lineHeight(lineHeightParam || size),
    textPosition(x, y),
    ..._.flatMap(lines, (line) => [text(line), nextLine()]),
  ),
];

export const drawImage = (
  name: string | PDFName,
  {
    x = 0,
    y = 0,
    width = 100,
    height = 100,
  }: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  },
): PDFOperator[] => [
  pushGraphicsState(),
  translate(x, y),
  scale(width, height),
  image(name),
  popGraphicsState(),
];

// TODO: Make a "drawPolygon" function
