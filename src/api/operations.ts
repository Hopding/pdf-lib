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
  LineCapStyle,
  setLineCap,
  setGraphicsState,
  setDashPattern,
  setLineJoin,
  LineJoinStyle,
} from 'src/api/operators';
import { Rotation, toRadians, NoRotation } from 'src/api/rotations';
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
  graphicsState?: string | PDFName;
}

export const drawText = (
  line: PDFHexString,
  options: DrawTextOptions,
): PDFOperator[] =>
  [
    pushGraphicsState(),
    options.graphicsState && setGraphicsState(options.graphicsState),
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
    popGraphicsState(),
  ].filter(Boolean) as PDFOperator[];

export interface DrawLinesOfTextOptions extends DrawTextOptions {
  lineHeight: number | PDFNumber;
}

export const drawLinesOfText = (
  lines: PDFHexString[],
  options: DrawLinesOfTextOptions,
): PDFOperator[] => {
  const operators = [
    pushGraphicsState(),
    options.graphicsState && setGraphicsState(options.graphicsState),
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
  ].filter(Boolean) as PDFOperator[];

  for (let idx = 0, len = lines.length; idx < len; idx++) {
    operators.push(showText(lines[idx]), nextLine());
  }

  operators.push(endText(), popGraphicsState());
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
    graphicsState?: string | PDFName;
  },
): PDFOperator[] =>
  [
    pushGraphicsState(),
    options.graphicsState && setGraphicsState(options.graphicsState),
    translate(options.x, options.y),
    rotateRadians(toRadians(options.rotate)),
    scale(options.width, options.height),
    skewRadians(toRadians(options.xSkew), toRadians(options.ySkew)),
    drawObject(name),
    popGraphicsState(),
  ].filter(Boolean) as PDFOperator[];

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
    graphicsState?: string | PDFName;
  },
): PDFOperator[] =>
  [
    pushGraphicsState(),
    options.graphicsState && setGraphicsState(options.graphicsState),
    translate(options.x, options.y),
    rotateRadians(toRadians(options.rotate)),
    scale(options.xScale, options.yScale),
    skewRadians(toRadians(options.xSkew), toRadians(options.ySkew)),
    drawObject(name),
    popGraphicsState(),
  ].filter(Boolean) as PDFOperator[];

export const drawLine = (options: {
  start: { x: number | PDFNumber; y: number | PDFNumber };
  end: { x: number | PDFNumber; y: number | PDFNumber };
  thickness: number | PDFNumber;
  color: Color | undefined;
  dashArray?: (number | PDFNumber)[];
  dashPhase?: number | PDFNumber;
  lineCap?: LineCapStyle;
  graphicsState?: string | PDFName;
}) =>
  [
    pushGraphicsState(),
    options.graphicsState && setGraphicsState(options.graphicsState),
    options.color && setStrokingColor(options.color),
    setLineWidth(options.thickness),
    setDashPattern(options.dashArray ?? [], options.dashPhase ?? 0),
    moveTo(options.start.x, options.start.y),
    options.lineCap && setLineCap(options.lineCap),
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
  borderRadius?: number | PDFNumber;
  borderLineCap?: LineCapStyle;
  borderDashArray?: (number | PDFNumber)[];
  borderDashPhase?: number | PDFNumber;
  graphicsState?: string | PDFName;
}) => {
  const x = asNumber(options.x);
  const y = asNumber(options.y);
  const r = asNumber(options.borderRadius ?? 0);
  const w = asNumber(options.width);
  const h = asNumber(options.height);
  const c = r * (1.0 - KAPPA);
  return [
    pushGraphicsState(),
    options.graphicsState && setGraphicsState(options.graphicsState),
    options.color && setFillingColor(options.color),
    options.borderColor && setStrokingColor(options.borderColor),
    setLineWidth(options.borderWidth),
    options.borderLineCap && setLineCap(options.borderLineCap),
    setDashPattern(options.borderDashArray ?? [], options.borderDashPhase ?? 0),
    translate(x, y),
    rotateRadians(toRadians(options.rotate)),
    skewRadians(toRadians(options.xSkew), toRadians(options.ySkew)),
    moveTo(r, 0),
    lineTo(w - r, 0),
    r > 0 ? appendBezierCurve(w - c, 0, w, c, w, r) : undefined,
    lineTo(w, h - r),
    r > 0 ? appendBezierCurve(w, h - c, w - c, h, w - r, h) : undefined,
    lineTo(r, h),
    r > 0 ? appendBezierCurve(c, h, 0, h - c, 0, h - r) : undefined,
    r > 0 ? lineTo(0, r) : undefined,
    r > 0 ? appendBezierCurve(0, c, c, 0, r, 0) : undefined,
    closePath(),
    // prettier-ignore
    options.color && options.borderWidth ? fillAndStroke()
    : options.color                      ? fill()
    : options.borderColor                ? stroke()
    : undefined,

    popGraphicsState(),
  ].filter(Boolean) as PDFOperator[];
};

export const drawLines = (points: { x: number | PDFNumber; y: number | PDFNumber }[], options: {
  borderWidth?: number | PDFNumber;
  color?: Color;
  borderColor?: Color;
  rotate?: Rotation;
  xSkew?: Rotation;
  ySkew?: Rotation;
  closePath?: boolean;
  lineJoin?: LineJoinStyle;
  lineCap?: LineCapStyle;
  dashArray?: (number | PDFNumber)[];
  dashPhase?: number | PDFNumber;
  graphicsState?: string | PDFName;
}) =>
  [
    pushGraphicsState(),
    options.graphicsState && setGraphicsState(options.graphicsState),
    options.color && setFillingColor(options.color),
    options.borderColor && setStrokingColor(options.borderColor),
    options.borderWidth && setLineWidth(options.borderWidth),
    options.lineCap && setLineCap(options.lineCap),
    options.dashArray && setDashPattern(options.dashArray ?? [], options.dashPhase ?? 0),
    options.lineJoin && setLineJoin(options.lineJoin),
    points?.[0] && translate(points[0].x, points[0].y),
    options.rotate && rotateRadians(toRadians(options.rotate)),
    (options.xSkew || options.ySkew) && skewRadians(
      toRadians(options.xSkew || NoRotation), toRadians(options.ySkew || NoRotation)
    ),
    ...((points ?? []).slice(1).map(p =>
          lineTo(
            asNumber(p.x) - asNumber(points[0].x),
            asNumber(p.y) - asNumber(points[0].y),
    ))),
    // Close only if instructed to
    options.closePath && closePath(),
    // prettier-ignore
    options.color && options.borderWidth ? fillAndStroke()
    : options.color                      ? fill()
    : options.borderColor                ? stroke()
    : undefined,
    popGraphicsState(),
  ].filter(Boolean) as PDFOperator[];

export const drawPolygon = (points: { x: number | PDFNumber; y: number | PDFNumber }[], options: {
  borderWidth?: number | PDFNumber;
  color?: Color;
  borderColor?: Color;
  rotate?: Rotation;
  xSkew?: Rotation;
  ySkew?: Rotation;
  lineJoin?: LineJoinStyle;
  lineCap?: LineCapStyle;
  dashArray?: (number | PDFNumber)[];
  dashPhase?: number | PDFNumber;
  graphicsState?: string | PDFName;
}) => drawLines(points, {closePath: true, ...options});


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
  borderDashArray?: (number | PDFNumber)[];
  borderDashPhase?: number | PDFNumber;
  graphicsState?: string | PDFName;
  borderLineCap?: LineCapStyle;
}) =>
  [
    pushGraphicsState(),
    options.graphicsState && setGraphicsState(options.graphicsState),
    options.color && setFillingColor(options.color),
    options.borderColor && setStrokingColor(options.borderColor),
    setLineWidth(options.borderWidth),
    options.borderLineCap && setLineCap(options.borderLineCap),
    setDashPattern(options.borderDashArray ?? [], options.borderDashPhase ?? 0),
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
    borderDashArray?: (number | PDFNumber)[];
    borderDashPhase?: number | PDFNumber;
    borderLineCap?: LineCapStyle;
    graphicsState?: string | PDFName;
  },
) =>
  [
    pushGraphicsState(),
    options.graphicsState && setGraphicsState(options.graphicsState),

    translate(options.x, options.y),

    // SVG path Y axis is opposite pdf-lib's
    options.scale ? scale(options.scale, -options.scale) : scale(1, -1),

    options.color && setFillingColor(options.color),
    options.borderColor && setStrokingColor(options.borderColor),
    options.borderWidth && setLineWidth(options.borderWidth),
    options.borderLineCap && setLineCap(options.borderLineCap),

    setDashPattern(options.borderDashArray ?? [], options.borderDashPhase ?? 0),

    setDashPattern(options.borderDashArray ?? [], options.borderDashPhase ?? 0),

    ...svgPathToOperators(path),

    // prettier-ignore
    options.color && options.borderWidth ? fillAndStroke()
  : options.color                      ? fill()
  : options.borderColor                ? stroke()
  : closePath(),

    popGraphicsState(),
  ].filter(Boolean) as PDFOperator[];
