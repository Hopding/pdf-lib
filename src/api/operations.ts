import { Color, setFillingColor, setStrokingColor } from 'src/api/colors';
import {
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
  rotateDegrees,
  setGraphicsState,
  setDashPattern,
  beginMarkedContent,
  endMarkedContent,
  clip,
  endPath,
  appendBezierCurve,
} from 'src/api/operators';
import { Rotation, degrees, toRadians } from 'src/api/rotations';
import { svgPathToOperators } from 'src/api/svgPath';
import { PDFHexString, PDFName, PDFNumber, PDFOperator } from 'src/core';
import { asNumber } from 'src/api/objects';

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
  borderLineCap?: LineCapStyle;
  borderDashArray?: (number | PDFNumber)[];
  borderDashPhase?: number | PDFNumber;
  graphicsState?: string | PDFName;
}) =>
  [
    pushGraphicsState(),
    options.graphicsState && setGraphicsState(options.graphicsState),
    options.color && setFillingColor(options.color),
    options.borderColor && setStrokingColor(options.borderColor),
    setLineWidth(options.borderWidth),
    options.borderLineCap && setLineCap(options.borderLineCap),
    setDashPattern(options.borderDashArray ?? [], options.borderDashPhase ?? 0),
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

/** @deprecated */
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

const drawEllipseCurves = (config: {
  x: number | PDFNumber;
  y: number | PDFNumber;
  xScale: number | PDFNumber;
  yScale: number | PDFNumber;
  rotate: Rotation;
}): PDFOperator[] => {
  const centerX = asNumber(config.x);
  const centerY = asNumber(config.y);
  const xScale = asNumber(config.xScale);
  const yScale = asNumber(config.yScale);

  const x = -xScale;
  const y = -yScale;

  const ox = xScale * KAPPA;
  const oy = yScale * KAPPA;
  const xe = x + xScale * 2;
  const ye = y + yScale * 2;
  const xm = x + xScale;
  const ym = y + yScale;

  return [
    translate(centerX, centerY),
    rotateRadians(toRadians(config.rotate)),
    moveTo(x, ym),
    appendBezierCurve(x, ym - oy, xm - ox, y, xm, y),
    appendBezierCurve(xm + ox, y, xe, ym - oy, xe, ym),
    appendBezierCurve(xe, ym + oy, xm + ox, ye, xm, ye),
    appendBezierCurve(xm - ox, ye, x, ym + oy, x, ym),
  ];
};

export const drawEllipse = (options: {
  x: number | PDFNumber;
  y: number | PDFNumber;
  xScale: number | PDFNumber;
  yScale: number | PDFNumber;
  rotate?: Rotation;
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

    // The `drawEllipsePath` branch is only here for backwards compatibility.
    // See https://github.com/Hopding/pdf-lib/pull/511#issuecomment-667685655.
    ...(options.rotate === undefined
      ? drawEllipsePath({
          x: options.x,
          y: options.y,
          xScale: options.xScale,
          yScale: options.yScale,
        })
      : drawEllipseCurves({
          x: options.x,
          y: options.y,
          xScale: options.xScale,
          yScale: options.yScale,
          rotate: options.rotate ?? degrees(0),
        })),

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
    rotate?: Rotation;
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
    rotateRadians(toRadians(options.rotate ?? degrees(0))),

    // SVG path Y axis is opposite pdf-lib's
    options.scale ? scale(options.scale, -options.scale) : scale(1, -1),

    options.color && setFillingColor(options.color),
    options.borderColor && setStrokingColor(options.borderColor),
    options.borderWidth && setLineWidth(options.borderWidth),
    options.borderLineCap && setLineCap(options.borderLineCap),

    setDashPattern(options.borderDashArray ?? [], options.borderDashPhase ?? 0),

    ...svgPathToOperators(path),

    // prettier-ignore
    options.color && options.borderWidth ? fillAndStroke()
  : options.color                      ? fill()
  : options.borderColor                ? stroke()
  : closePath(),

    popGraphicsState(),
  ].filter(Boolean) as PDFOperator[];

export const drawCheckMark = (options: {
  x: number | PDFNumber;
  y: number | PDFNumber;
  size: number | PDFNumber;
  thickness: number | PDFNumber;
  color: Color | undefined;
}) => {
  const size = asNumber(options.size);

  /*********************** Define Check Mark Points ***************************/
  // A check mark is defined by three points in some coordinate space. Here, we
  // define these points in a unit coordinate system, where the range of the x
  // and y axis are both [-1, 1].
  //
  // Note that we do not hard code `p1y` in case we wish to change the
  // size/shape of the check mark in the future. We want the check mark to
  // always form a right angle. This means that the dot product between (p1-p2)
  // and (p3-p2) should be zero:
  //
  //   (p1x-p2x) * (p3x-p2x) + (p1y-p2y) * (p3y-p2y) = 0
  //
  // We can now rejigger this equation to solve for `p1y`:
  //
  //   (p1y-p2y) * (p3y-p2y) = -((p1x-p2x) * (p3x-p2x))
  //   (p1y-p2y) = -((p1x-p2x) * (p3x-p2x)) / (p3y-p2y)
  //   p1y = -((p1x-p2x) * (p3x-p2x)) / (p3y-p2y) + p2y
  //
  // Thanks to my friend Joel Walker (https://github.com/JWalker1995) for
  // devising the above equation and unit coordinate system approach!

  // (x, y) coords of the check mark's bottommost point
  const p2x = -1 + 0.75;
  const p2y = -1 + 0.51;

  // (x, y) coords of the check mark's topmost point
  const p3y = 1 - 0.525;
  const p3x = 1 - 0.31;

  // (x, y) coords of the check mark's center (vertically) point
  const p1x = -1 + 0.325;
  const p1y = -((p1x - p2x) * (p3x - p2x)) / (p3y - p2y) + p2y;
  /****************************************************************************/

  return [
    pushGraphicsState(),
    options.color && setStrokingColor(options.color),
    setLineWidth(options.thickness),

    translate(options.x, options.y),
    moveTo(p1x * size, p1y * size),
    lineTo(p2x * size, p2y * size),
    lineTo(p3x * size, p3y * size),

    stroke(),
    popGraphicsState(),
  ].filter(Boolean) as PDFOperator[];
};

// prettier-ignore
export const rotateInPlace = (options: {
  width: number | PDFNumber;
  height: number | PDFNumber;
  rotation: 0 | 90 | 180 | 270;
}) =>
    options.rotation === 0 ? [
      translate(0, 0), 
      rotateDegrees(0) 
    ]
  : options.rotation === 90 ? [
      translate(options.width, 0), 
      rotateDegrees(90)
    ]
  : options.rotation === 180 ? [
      translate(options.width, options.height), 
      rotateDegrees(180)
    ]
  : options.rotation === 270 ? [
      translate(0, options.height), 
      rotateDegrees(270)
    ]
  : []; // Invalid rotation - noop

export const drawCheckBox = (options: {
  x: number | PDFNumber;
  y: number | PDFNumber;
  width: number | PDFNumber;
  height: number | PDFNumber;
  thickness: number | PDFNumber;
  borderWidth: number | PDFNumber;
  markColor: Color | undefined;
  color: Color | undefined;
  borderColor: Color | undefined;
  filled: boolean;
}) => {
  const outline = drawRectangle({
    x: options.x,
    y: options.y,
    width: options.width,
    height: options.height,
    borderWidth: options.borderWidth,
    color: options.color,
    borderColor: options.borderColor,
    rotate: degrees(0),
    xSkew: degrees(0),
    ySkew: degrees(0),
  });

  if (!options.filled) return outline;

  const width = asNumber(options.width);
  const height = asNumber(options.height);

  const checkMarkSize = Math.min(width, height) / 2;

  const checkMark = drawCheckMark({
    x: width / 2,
    y: height / 2,
    size: checkMarkSize,
    thickness: options.thickness,
    color: options.markColor,
  });

  return [pushGraphicsState(), ...outline, ...checkMark, popGraphicsState()];
};

export const drawRadioButton = (options: {
  x: number | PDFNumber;
  y: number | PDFNumber;
  width: number | PDFNumber;
  height: number | PDFNumber;
  borderWidth: number | PDFNumber;
  dotColor: Color | undefined;
  color: Color | undefined;
  borderColor: Color | undefined;
  filled: boolean;
}) => {
  const width = asNumber(options.width);
  const height = asNumber(options.height);

  const outlineScale = Math.min(width, height) / 2;

  const outline = drawEllipse({
    x: options.x,
    y: options.y,
    xScale: outlineScale,
    yScale: outlineScale,
    color: options.color,
    borderColor: options.borderColor,
    borderWidth: options.borderWidth,
  });

  if (!options.filled) return outline;

  const dot = drawEllipse({
    x: options.x,
    y: options.y,
    xScale: outlineScale * 0.45,
    yScale: outlineScale * 0.45,
    color: options.dotColor,
    borderColor: undefined,
    borderWidth: 0,
  });

  return [pushGraphicsState(), ...outline, ...dot, popGraphicsState()];
};

export const drawButton = (options: {
  x: number | PDFNumber;
  y: number | PDFNumber;
  width: number | PDFNumber;
  height: number | PDFNumber;
  borderWidth: number | PDFNumber;
  color: Color | undefined;
  borderColor: Color | undefined;
  textLines: { encoded: PDFHexString; x: number; y: number }[];
  textColor: Color;
  font: string | PDFName;
  fontSize: number | PDFNumber;
}) => {
  const x = asNumber(options.x);
  const y = asNumber(options.y);
  const width = asNumber(options.width);
  const height = asNumber(options.height);

  const background = drawRectangle({
    x,
    y,
    width,
    height,
    borderWidth: options.borderWidth,
    color: options.color,
    borderColor: options.borderColor,
    rotate: degrees(0),
    xSkew: degrees(0),
    ySkew: degrees(0),
  });

  const lines = drawTextLines(options.textLines, {
    color: options.textColor,
    font: options.font,
    size: options.fontSize,
    rotate: degrees(0),
    xSkew: degrees(0),
    ySkew: degrees(0),
  });

  return [pushGraphicsState(), ...background, ...lines, popGraphicsState()];
};

export interface DrawTextLinesOptions {
  color: Color;
  font: string | PDFName;
  size: number | PDFNumber;
  rotate: Rotation;
  xSkew: Rotation;
  ySkew: Rotation;
}

export const drawTextLines = (
  lines: { encoded: PDFHexString; x: number; y: number }[],
  options: DrawTextLinesOptions,
): PDFOperator[] => {
  const operators = [
    beginText(),
    setFillingColor(options.color),
    setFontAndSize(options.font, options.size),
  ];

  for (let idx = 0, len = lines.length; idx < len; idx++) {
    const { encoded, x, y } = lines[idx];
    operators.push(
      rotateAndSkewTextRadiansAndTranslate(
        toRadians(options.rotate),
        toRadians(options.xSkew),
        toRadians(options.ySkew),
        x,
        y,
      ),
      showText(encoded),
    );
  }

  operators.push(endText());

  return operators;
};

export const drawTextField = (options: {
  x: number | PDFNumber;
  y: number | PDFNumber;
  width: number | PDFNumber;
  height: number | PDFNumber;
  borderWidth: number | PDFNumber;
  color: Color | undefined;
  borderColor: Color | undefined;
  textLines: { encoded: PDFHexString; x: number; y: number }[];
  textColor: Color;
  font: string | PDFName;
  fontSize: number | PDFNumber;
  padding: number | PDFNumber;
}) => {
  const x = asNumber(options.x);
  const y = asNumber(options.y);
  const width = asNumber(options.width);
  const height = asNumber(options.height);
  const borderWidth = asNumber(options.borderWidth);
  const padding = asNumber(options.padding);

  const clipX = x + borderWidth / 2 + padding;
  const clipY = y + borderWidth / 2 + padding;
  const clipWidth = width - (borderWidth / 2 + padding) * 2;
  const clipHeight = height - (borderWidth / 2 + padding) * 2;

  const clippingArea = [
    moveTo(clipX, clipY),
    lineTo(clipX, clipY + clipHeight),
    lineTo(clipX + clipWidth, clipY + clipHeight),
    lineTo(clipX + clipWidth, clipY),
    closePath(),
    clip(),
    endPath(),
  ];

  const background = drawRectangle({
    x,
    y,
    width,
    height,
    borderWidth: options.borderWidth,
    color: options.color,
    borderColor: options.borderColor,
    rotate: degrees(0),
    xSkew: degrees(0),
    ySkew: degrees(0),
  });

  const lines = drawTextLines(options.textLines, {
    color: options.textColor,
    font: options.font,
    size: options.fontSize,
    rotate: degrees(0),
    xSkew: degrees(0),
    ySkew: degrees(0),
  });

  const markedContent = [
    beginMarkedContent('Tx'),
    pushGraphicsState(),
    ...lines,
    popGraphicsState(),
    endMarkedContent(),
  ];

  return [
    pushGraphicsState(),
    ...background,
    ...clippingArea,
    ...markedContent,
    popGraphicsState(),
  ];
};

export const drawOptionList = (options: {
  x: number | PDFNumber;
  y: number | PDFNumber;
  width: number | PDFNumber;
  height: number | PDFNumber;
  borderWidth: number | PDFNumber;
  color: Color | undefined;
  borderColor: Color | undefined;
  textLines: { encoded: PDFHexString; x: number; y: number; height: number }[];
  textColor: Color;
  font: string | PDFName;
  fontSize: number | PDFNumber;
  lineHeight: number | PDFNumber;
  selectedLines: number[];
  selectedColor: Color;
  padding: number | PDFNumber;
}) => {
  const x = asNumber(options.x);
  const y = asNumber(options.y);
  const width = asNumber(options.width);
  const height = asNumber(options.height);
  const lineHeight = asNumber(options.lineHeight);
  const borderWidth = asNumber(options.borderWidth);
  const padding = asNumber(options.padding);

  const clipX = x + borderWidth / 2 + padding;
  const clipY = y + borderWidth / 2 + padding;
  const clipWidth = width - (borderWidth / 2 + padding) * 2;
  const clipHeight = height - (borderWidth / 2 + padding) * 2;

  const clippingArea = [
    moveTo(clipX, clipY),
    lineTo(clipX, clipY + clipHeight),
    lineTo(clipX + clipWidth, clipY + clipHeight),
    lineTo(clipX + clipWidth, clipY),
    closePath(),
    clip(),
    endPath(),
  ];

  const background = drawRectangle({
    x,
    y,
    width,
    height,
    borderWidth: options.borderWidth,
    color: options.color,
    borderColor: options.borderColor,
    rotate: degrees(0),
    xSkew: degrees(0),
    ySkew: degrees(0),
  });

  const highlights: PDFOperator[] = [];
  for (let idx = 0, len = options.selectedLines.length; idx < len; idx++) {
    const line = options.textLines[options.selectedLines[idx]];
    highlights.push(
      ...drawRectangle({
        x: line.x - padding,
        y: line.y - (lineHeight - line.height) / 2,
        width: width - borderWidth,
        height: line.height + (lineHeight - line.height) / 2,
        borderWidth: 0,
        color: options.selectedColor,
        borderColor: undefined,
        rotate: degrees(0),
        xSkew: degrees(0),
        ySkew: degrees(0),
      }),
    );
  }

  const lines = drawTextLines(options.textLines, {
    color: options.textColor,
    font: options.font,
    size: options.fontSize,
    rotate: degrees(0),
    xSkew: degrees(0),
    ySkew: degrees(0),
  });

  const markedContent = [
    beginMarkedContent('Tx'),
    pushGraphicsState(),
    ...lines,
    popGraphicsState(),
    endMarkedContent(),
  ];

  return [
    pushGraphicsState(),
    ...background,
    ...highlights,
    ...clippingArea,
    ...markedContent,
    popGraphicsState(),
  ];
};
