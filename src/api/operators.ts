import { asPDFName, asPDFNumber } from 'src/api/objects';
import {
  PDFHexString,
  PDFName,
  PDFNumber,
  PDFOperator,
  PDFOperatorNames as Ops,
} from 'src/core';

export const beginText = () => PDFOperator.of(Ops.BeginText);
export const endText = () => PDFOperator.of(Ops.EndText);

export const setFontAndSize = (
  name: string | PDFName,
  size: number | PDFNumber,
) => PDFOperator.of(Ops.SetFontAndSize, [asPDFName(name), asPDFNumber(size)]);

export const moveText = (x: number | PDFNumber, y: number | PDFNumber) =>
  PDFOperator.of(Ops.MoveText, [asPDFNumber(x), asPDFNumber(y)]);

export const showText = (text: PDFHexString) =>
  PDFOperator.of(Ops.ShowText, [text]);

export const pushGraphicsState = () => PDFOperator.of(Ops.PushGraphicsState);
export const popGraphicsState = () => PDFOperator.of(Ops.PopGraphicsState);

export const concatTransformationMatrix = (
  a: number | PDFNumber,
  b: number | PDFNumber,
  c: number | PDFNumber,
  d: number | PDFNumber,
  e: number | PDFNumber,
  f: number | PDFNumber,
) =>
  PDFOperator.of(Ops.ConcatTransformationMatrix, [
    asPDFNumber(a),
    asPDFNumber(b),
    asPDFNumber(c),
    asPDFNumber(d),
    asPDFNumber(e),
    asPDFNumber(f),
  ]);

export const scale = (xScale: number | PDFNumber, yScale: number | PDFNumber) =>
  concatTransformationMatrix(xScale, 0, 0, yScale, 0, 0);

export const translate = (xPos: number, yPos: number) =>
  concatTransformationMatrix(1, 0, 0, 1, xPos, yPos);

export const drawObject = (name: string | PDFName) =>
  PDFOperator.of(Ops.DrawObject, [asPDFName(name)]);
