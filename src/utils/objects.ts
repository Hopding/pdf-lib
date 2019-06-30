import { FontNames } from '@pdf-lib/standard-fonts';

export const values = (obj: any) => Object.keys(obj).map((k) => obj[k]);

export const StandardFontValues = values(FontNames);

export const isStandardFont = (input: any): input is FontNames =>
  StandardFontValues.includes(input);
