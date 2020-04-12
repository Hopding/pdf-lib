import { FontNames } from '@pdf-lib/standard-fonts';

export const values = (obj: any) => Object.keys(obj).map((k) => obj[k]);

export const StandardFontValues = values(FontNames);

export const isStandardFont = (input: any): input is FontNames =>
  StandardFontValues.includes(input);

export const rectanglesAreEqual = (
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
) => a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
