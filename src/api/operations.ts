import { Color, setFillingColor, setStrokingColor } from 'src/api/colors';
import { asNumber } from 'src/api/objects';
import {
  appendBezierCurve,
  beginText,
  closePath,
  drawObject,
  endText,
  fill,
  fillAndStroke,
  lineTo,
  moveTo,
  nextLine,
  popGraphicsState,
  pushGraphicsState,
  rotateAndSkewTextRadiansAndTranslate,
  rotateRadians,
  scale,
  setFontAndSize,
  setLineHeight,
  setLineWidth,
  showText,
  skewRadians,
  stroke,
  translate,
} from 'src/api/operators';
import { Rotation, toRadians } from 'src/api/rotations';
import { svgPathToOperators } from 'src/api/svgPath';
import { PDFHexString, PDFName, PDFNumber, PDFOperator } from 'src/core';

export interface DrawTextOptions {
  color: Color;
  font: string | PDFName;
  size: number | PDFNumber;
  rotate: Rotation;
  xSkew: Rotation;
  ySkew: Rotation;
  x: number | PDFNumber;
  y: number | PDFNumber;
}

export const drawText = (
  line: PDFHexString,
  options: DrawTextOptions,
): PDFOperator[] => [
  beginText(),
  setFillingColor(options.color),
  setFontAndSize(options.font, options.size),
  rotateAndSkewTextRadiansAndTranslate(
    toRadians(options.rotate),
    toRadians(options.xSkew),
    toRadians(options.ySkew),
    options.x,
    options.y,
  ),
  showText(line),
  endText(),
];

export interface DrawLinesOfTextOptions extends DrawTextOptions {
  lineHeight: number | PDFNumber;
}

export const drawLinesOfText = (
  lines: PDFHexString[],
  options: DrawLinesOfTextOptions,
): PDFOperator[] => {
  const operators = [
    beginText(),
    setFillingColor(options.color),
    setFontAndSize(options.font, options.size),
    setLineHeight(options.lineHeight),
    rotateAndSkewTextRadiansAndTranslate(
      toRadians(options.rotate),
      toRadians(options.xSkew),
      toRadians(options.ySkew),
      options.x,
      options.y,
    ),
  ];

  for (let idx = 0, len = lines.length; idx < len; idx++) {
    operators.push(showText(lines[idx]), nextLine());
  }

  operators.push(endText());
  return operators;
};

export const drawImage = (
  name: string | PDFName,
  options: {
    x: number | PDFNumber;
    y: number | PDFNumber;
    width: number | PDFNumber;
    height: number | PDFNumber;
    rotate: Rotation;
    xSkew: Rotation;
    ySkew: Rotation;
  },
): PDFOperator[] => [
  pushGraphicsState(),
  translate(options.x, options.y),
  rotateRadians(toRadians(options.rotate)),
  scale(options.width, options.height),
  skewRadians(toRadians(options.xSkew), toRadians(options.ySkew)),
  drawObject(name),
  popGraphicsState(),
];

export const drawPage = (
  name: string | PDFName,
  options: {
    x: number | PDFNumber;
    y: number | PDFNumber;
    xScale: number | PDFNumber;
    yScale: number | PDFNumber;
    rotate: Rotation;
    xSkew: Rotation;
    ySkew: Rotation;
  },
): PDFOperator[] => [
  pushGraphicsState(),
  translate(options.x, options.y),
  rotateRadians(toRadians(options.rotate)),
  scale(options.xScale, options.yScale),
  skewRadians(toRadians(options.xSkew), toRadians(options.ySkew)),
  drawObject(name),
  popGraphicsState(),
];

export const drawLine = (options: {
  start: { x: number | PDFNumber; y: number | PDFNumber };
  end: { x: number | PDFNumber; y: number | PDFNumber };
  thickness: number | PDFNumber;
  color: Color | undefined;
}) =>
  [
    pushGraphicsState(),
    options.color && setStrokingColor(options.color),
    setLineWidth(options.thickness),
    moveTo(options.start.x, options.start.y),
    lineTo(options.end.x, options.end.y),
    stroke(),
    popGraphicsState(),
  ].filter(Boolean) as PDFOperator[];

export const drawRectangle = (options: {
  x: number | PDFNumber;
  y: number | PDFNumber;
  width: number | PDFNumber;
  height: number | PDFNumber;
  borderWidth: number | PDFNumber;
  color: Color | undefined;
  borderColor: Color | undefined;
  rotate: Rotation;
  xSkew: Rotation;
  ySkew: Rotation;
}) =>
  [
    pushGraphicsState(),
    options.color && setFillingColor(options.color),
    options.borderColor && setStrokingColor(options.borderColor),
    setLineWidth(options.borderWidth),
    translate(options.x, options.y),
    rotateRadians(toRadians(options.rotate)),
    skewRadians(toRadians(options.xSkew), toRadians(options.ySkew)),
    moveTo(0, 0),
    lineTo(0, options.height),
    lineTo(options.width, options.height),
    lineTo(options.width, 0),
    closePath(),

    // prettier-ignore
    options.color && options.borderWidth ? fillAndStroke()
  : options.color                      ? fill()
  : options.borderColor                ? stroke()
  : closePath(),

    popGraphicsState(),
  ].filter(Boolean) as PDFOperator[];

const KAPPA = 4.0 * ((Math.sqrt(2) - 1.0) / 3.0);

export const drawEllipsePath = (config: {
  x: number | PDFNumber;
  y: number | PDFNumber;
  xScale: number | PDFNumber;
  yScale: number | PDFNumber;
}): PDFOperator[] => {
  let x = asNumber(config.x);
  let y = asNumber(config.y);
  const xScale = asNumber(config.xScale);
  const yScale = asNumber(config.yScale);

  x -= xScale;
  y -= yScale;

  const ox = xScale * KAPPA;
  const oy = yScale * KAPPA;
  const xe = x + xScale * 2;
  const ye = y + yScale * 2;
  const xm = x + xScale;
  const ym = y + yScale;

  return [
    pushGraphicsState(),
    moveTo(x, ym),
    appendBezierCurve(x, ym - oy, xm - ox, y, xm, y),
    appendBezierCurve(xm + ox, y, xe, ym - oy, xe, ym),
    appendBezierCurve(xe, ym + oy, xm + ox, ye, xm, ye),
    appendBezierCurve(xm - ox, ye, x, ym + oy, x, ym),
    popGraphicsState(),
  ];
};

export const drawEllipse = (options: {
  x: number | PDFNumber;
  y: number | PDFNumber;
  xScale: number | PDFNumber;
  yScale: number | PDFNumber;
  color: Color | undefined;
  borderColor: Color | undefined;
  borderWidth: number | PDFNumber;
}) =>
  [
    pushGraphicsState(),
    options.color && setFillingColor(options.color),
    options.borderColor && setStrokingColor(options.borderColor),
    setLineWidth(options.borderWidth),
    ...drawEllipsePath({
      x: options.x,
      y: options.y,
      xScale: options.xScale,
      yScale: options.yScale,
    }),

    // prettier-ignore
    options.color && options.borderWidth ? fillAndStroke()
  : options.color                      ? fill()
  : options.borderColor                ? stroke()
  : closePath(),

    popGraphicsState(),
  ].filter(Boolean) as PDFOperator[];

export const drawSvgPath = (
  path: string,
  options: {
    x: number | PDFNumber;
    y: number | PDFNumber;
    scale: number | PDFNumber | undefined;
    color: Color | undefined;
    borderColor: Color | undefined;
    borderWidth: number | PDFNumber;
  },
) =>
  [
    pushGraphicsState(),
    translate(options.x, options.y),

    // SVG path Y axis is opposite pdf-lib's
    options.scale ? scale(options.scale, -options.scale) : scale(1, -1),

    options.color && setFillingColor(options.color),
    options.borderColor && setStrokingColor(options.borderColor),
    options.borderWidth && setLineWidth(options.borderWidth),

    ...svgPathToOperators(path),

    // prettier-ignore
    options.color && options.borderWidth ? fillAndStroke()
  : options.color                      ? fill()
  : options.borderColor                ? stroke()
  : closePath(),

    popGraphicsState(),
  ].filter(Boolean) as PDFOperator[];
