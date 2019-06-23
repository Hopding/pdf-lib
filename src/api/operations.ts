import { Color, setFillingColor } from 'src/api/colors';
import {
  beginText,
  drawObject,
  endText,
  nextLine,
  popGraphicsState,
  pushGraphicsState,
  rotateAndSkewTextRadiansAndTranslate,
  rotateRadians,
  scale,
  setFontAndSize,
  setLineHeight,
  showText,
  skewRadians,
  translate,
} from 'src/api/operators';
import { Rotation, toRadians } from 'src/api/rotations';
import { PDFHexString, PDFName, PDFNumber, PDFOperator } from 'src/core';

export const drawText = (
  line: PDFHexString,
  options: {
    color: Color;
    font: string | PDFName;
    size: number | PDFNumber;
    rotate: Rotation;
    xSkew: Rotation;
    ySkew: Rotation;
    x: number | PDFNumber;
    y: number | PDFNumber;
  },
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

export const drawLinesOfText = (
  lines: PDFHexString[],
  options: {
    color: Color;
    font: string | PDFName;
    size: number | PDFNumber;
    rotate: Rotation;
    xSkew: Rotation;
    ySkew: Rotation;
    x: number | PDFNumber;
    y: number | PDFNumber;
    lineHeight: number | PDFNumber;
  },
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
