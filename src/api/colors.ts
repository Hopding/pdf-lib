import {
  setFillingCmykColor,
  setFillingGrayscaleColor,
  setFillingRgbColor,
  setStrokingCmykColor,
  setStrokingGrayscaleColor,
  setStrokingRgbColor,
} from 'src/api/operators';
import { error } from 'src/utils';

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

// TODO: Add validation!
export const grayscale = (gray: number): Grayscale => ({
  type: ColorTypes.Grayscale,
  gray,
});

// TODO: Add validation!
export const rgb = (red: number, green: number, blue: number): RGB => ({
  type: ColorTypes.RGB,
  red,
  green,
  blue,
});

// TODO: Add validation!
export const cmyk = (
  cyan: number,
  magenta: number,
  yellow: number,
  key: number,
): CMYK => ({
  type: ColorTypes.CMYK,
  cyan,
  magenta,
  yellow,
  key,
});

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
