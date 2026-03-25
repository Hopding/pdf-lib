import { Color } from './colors';
import PDFFont from './PDFFont';
import { Rotation } from './rotations';
import { FillRule, LineCapStyle, TextRenderingMode } from './operators';
import type { Space, TransformationMatrix } from '../types';

interface SvgOptions {
  matrix?: TransformationMatrix;
  clipSpaces?: Space[];
}

export enum BlendMode {
  Normal = 'Normal',
  Multiply = 'Multiply',
  Screen = 'Screen',
  Overlay = 'Overlay',
  Darken = 'Darken',
  Lighten = 'Lighten',
  ColorDodge = 'ColorDodge',
  ColorBurn = 'ColorBurn',
  HardLight = 'HardLight',
  SoftLight = 'SoftLight',
  Difference = 'Difference',
  Exclusion = 'Exclusion',
}

export interface PDFPageDrawTextOptions extends SvgOptions {
  color?: Color;
  opacity?: number;
  blendMode?: BlendMode;
  font?: PDFFont;
  size?: number;
  rotate?: Rotation;
  xSkew?: Rotation;
  ySkew?: Rotation;
  x?: number;
  y?: number;
  lineHeight?: number;
  maxWidth?: number;
  wordBreaks?: string[];
  strokeWidth?: number;
  strokeColor?: Color;
  renderMode?: TextRenderingMode;
}

export interface PDFPageDrawImageOptions extends SvgOptions {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotate?: Rotation;
  xSkew?: Rotation;
  ySkew?: Rotation;
  opacity?: number;
  blendMode?: BlendMode;
}

export interface PDFPageDrawPageOptions {
  x?: number;
  y?: number;
  xScale?: number;
  yScale?: number;
  width?: number;
  height?: number;
  rotate?: Rotation;
  xSkew?: Rotation;
  ySkew?: Rotation;
  opacity?: number;
  blendMode?: BlendMode;
}

export interface PDFPageDrawSVGOptions extends SvgOptions {
  x?: number;
  y?: number;
  scale?: number;
  rotate?: Rotation;
  borderWidth?: number;
  color?: Color;
  opacity?: number;
  borderColor?: Color;
  borderOpacity?: number;
  borderDashArray?: number[];
  borderDashPhase?: number;
  borderLineCap?: LineCapStyle;
  blendMode?: BlendMode;
  fillRule?: FillRule;
}

export interface PDFPageDrawLineOptions extends SvgOptions {
  start: { x: number; y: number };
  end: { x: number; y: number };
  thickness?: number;
  color?: Color;
  opacity?: number;
  lineCap?: LineCapStyle;
  dashArray?: number[];
  dashPhase?: number;
  blendMode?: BlendMode;
}

export interface PDFPageDrawRectangleOptions extends SvgOptions {
  x?: number;
  y?: number;
  rx?: number;
  ry?: number;
  width?: number;
  height?: number;
  rotate?: Rotation;
  xSkew?: Rotation;
  ySkew?: Rotation;
  borderWidth?: number;
  color?: Color;
  opacity?: number;
  borderColor?: Color;
  borderOpacity?: number;
  borderDashArray?: number[];
  borderDashPhase?: number;
  borderLineCap?: LineCapStyle;
  blendMode?: BlendMode;
}

export interface PDFPageDrawSquareOptions extends SvgOptions {
  x?: number;
  y?: number;
  size?: number;
  rotate?: Rotation;
  xSkew?: Rotation;
  ySkew?: Rotation;
  borderWidth?: number;
  color?: Color;
  opacity?: number;
  borderColor?: Color;
  borderOpacity?: number;
  borderDashArray?: number[];
  borderDashPhase?: number;
  borderLineCap?: LineCapStyle;
  blendMode?: BlendMode;
}

export interface PDFPageDrawEllipseOptions extends SvgOptions {
  x?: number;
  y?: number;
  xScale?: number;
  yScale?: number;
  rotate?: Rotation;
  color?: Color;
  opacity?: number;
  borderColor?: Color;
  borderOpacity?: number;
  borderWidth?: number;
  borderDashArray?: number[];
  borderDashPhase?: number;
  borderLineCap?: LineCapStyle;
  blendMode?: BlendMode;
}

export interface PDFPageDrawCircleOptions extends SvgOptions {
  x?: number;
  y?: number;
  size?: number;
  color?: Color;
  opacity?: number;
  borderColor?: Color;
  borderOpacity?: number;
  borderWidth?: number;
  borderDashArray?: number[];
  borderDashPhase?: number;
  borderLineCap?: LineCapStyle;
  blendMode?: BlendMode;
}

export interface PDFPageDrawSVGElementOptions {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fontSize?: number;
  fonts?: { [fontName: string]: PDFFont };
  blendMode?: BlendMode;
}
