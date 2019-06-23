import { Color, setFillingColor } from 'src/api/colors';
import {
  beginText,
  endText,
  nextLine,
  rotateAndSkewTextRadiansAndTranslate,
  setFontAndSize,
  setLineHeight,
  showText,
} from 'src/api/operators';
import { Rotation, toRadians } from 'src/api/rotations';
import { PDFHexString, PDFName, PDFNumber } from 'src/core';

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
) => [
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
) => {
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
