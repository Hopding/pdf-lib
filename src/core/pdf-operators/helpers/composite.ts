import _ from 'lodash';

import { PDFName } from 'core/pdf-objects';
import PDFOperator from 'core/pdf-operators/PDFOperator';
import PDFTextObject from 'core/pdf-operators/text/PDFTextObject';
import { isInRange, validate } from 'utils/validate';

import {
  appendBezierCurve,
  clip,
  endPath,
  fill,
  fillAndStroke,
  fillingRgbColor,
  image,
  lineWidth,
  moveTo,
  popGraphicsState,
  pushGraphicsState,
  rectangle,
  scale,
  square,
  stroke,
  strokingRgbColor,
  translate,
} from 'core/pdf-operators/helpers/simple';

// Based on: http://spencermortensen.com/articles/bezier-circle/
//   P_0 = (0,1),  P_1 = (c,1),   P_2 = (1,c),   P_3 = (1,0)
//   P_0 = (1,0),  P_1 = (1,-c),  P_2 = (c,-1),  P_3 = (0,-1)
//   P_0 = (0,-1), P_1 = (-c,-1), P_3 = (-1,-c), P_4 = (-1,0)
//   P_0 = (-1,0), P_1 = (-1,c),  P_2 = (-c,1),  P_3 = (0,1)
//     with c = 0.551915024494
const C_VAL = 0.551915024494;
export const drawEllipsePath = ({
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

export const drawEllipse = ({
  x = 0,
  y = 0,
  xScale = 100,
  yScale = 100,
  strokeWidth = 15,
  fillRgbColor = [],
  strokeRgbColor = [],
}: {
  x?: number;
  y?: number;
  xScale?: number;
  yScale?: number;
  strokeWidth?: number;
  fillRgbColor?: number[];
  strokeRgbColor?: number[];
}): PDFOperator[] => [
  pushGraphicsState(),
  fillingRgbColor(
    fillRgbColor[0] || 0,
    fillRgbColor[1] || 0,
    fillRgbColor[2] || 0,
  ),
  strokingRgbColor(
    strokeRgbColor[0] || 0,
    strokeRgbColor[1] || 0,
    strokeRgbColor[2] || 0,
  ),
  lineWidth(strokeWidth),
  ...drawEllipsePath({ x, y, xScale, yScale }),
  // prettier-ignore
  _.isEmpty(fillRgbColor) && _.isEmpty(strokeRgbColor)     ? fill()
  : !_.isEmpty(fillRgbColor) && !_.isEmpty(strokeRgbColor) ? fillAndStroke()
  : !_.isEmpty(fillRgbColor)                               ? fill()
  : !_.isEmpty(strokeRgbColor)                             ? stroke()
  : endPath(),
  popGraphicsState(),
];

export const drawCircle = ({
  x = 0,
  y = 0,
  scale: scaleVal = 100,
}: {
  x?: number;
  y?: number;
  scale?: number;
}): PDFOperator[] => drawEllipse({ x, y, xScale: scaleVal, yScale: scaleVal });

export const drawRectangle = ({
  x = 0,
  y = 0,
  width = 100,
  height = 50,
}: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}): PDFOperator[] => [
  pushGraphicsState(),
  rectangle(x, y, width, height),
  popGraphicsState(),
];

export const drawSquare = ({
  x = 0,
  y = 0,
  size = 100,
}: {
  x?: number;
  y?: number;
  size?: number;
}): PDFOperator[] => [
  pushGraphicsState(),
  square(x, y, size),
  popGraphicsState(),
];

export const drawImage = ({
  name,
  x = 0,
  y = 0,
  width = 100,
  height = 100,
}: {
  name: string; // | PDFName;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}): PDFOperator[] => [
  pushGraphicsState(),
  translate(x, y),
  scale(width, height),
  image(name),
  popGraphicsState(),
];

// TODO: Composite operator to draw text and move to newline.
// TODO: Composite operator to draw multiline text? Looks like the behaviour
//       "by default" is that newlines translate to spaces...
