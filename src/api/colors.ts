import {
  setFillingCmykColor,
  setFillingGrayscaleColor,
  setFillingRgbColor,
  setStrokingCmykColor,
  setStrokingGrayscaleColor,
  setStrokingRgbColor,
} from 'src/api/operators';
import { assertRange, error } from 'src/utils';

export enum ColorTypes {
  Grayscale = 'Grayscale',
  RGB = 'RGB',
  CMYK = 'CMYK',
}

export interface Grayscale {
  type: ColorTypes.Grayscale;
  gray: number;
}

export interface RGB {
  type: ColorTypes.RGB;
  red: number;
  green: number;
  blue: number;
}

export interface CMYK {
  type: ColorTypes.CMYK;
  cyan: number;
  magenta: number;
  yellow: number;
  key: number;
}

export type Color = Grayscale | RGB | CMYK;

export const grayscale = (gray: number): Grayscale => {
  assertRange(gray, 'gray', 0.0, 1.0);
  return { type: ColorTypes.Grayscale, gray };
};

export const rgb = (red: number, green: number, blue: number): RGB => {
  assertRange(red, 'red', 0, 1);
  assertRange(green, 'green', 0, 1);
  assertRange(blue, 'blue', 0, 1);
  return { type: ColorTypes.RGB, red, green, blue };
};

export const cmyk = (
  cyan: number,
  magenta: number,
  yellow: number,
  key: number,
): CMYK => {
  assertRange(cyan, 'cyan', 0, 1);
  assertRange(magenta, 'magenta', 0, 1);
  assertRange(yellow, 'yellow', 0, 1);
  assertRange(key, 'key', 0, 1);
  return { type: ColorTypes.CMYK, cyan, magenta, yellow, key };
};

const { Grayscale, RGB, CMYK } = ColorTypes;

// prettier-ignore
export const setFillingColor = (color: Color) => 
    color.type === Grayscale ? setFillingGrayscaleColor(color.gray)
  : color.type === RGB       ? setFillingRgbColor(color.red, color.green, color.blue)
  : color.type === CMYK      ? setFillingCmykColor(color.cyan, color.magenta, color.yellow, color.key)
  : error(`Invalid color: ${JSON.stringify(color)}`);

// prettier-ignore
export const setStrokingColor = (color: Color) => 
    color.type === Grayscale ? setStrokingGrayscaleColor(color.gray)
  : color.type === RGB       ? setStrokingRgbColor(color.red, color.green, color.blue)
  : color.type === CMYK      ? setStrokingCmykColor(color.cyan, color.magenta, color.yellow, color.key)
  : error(`Invalid color: ${JSON.stringify(color)}`);
