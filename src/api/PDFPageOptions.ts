import { Color } from 'src/api/colors';
import PDFFont from 'src/api/PDFFont';
import { Rotation } from 'src/api/rotations';
import { LineCapStyle } from 'src/api/operators';


//export type BlendMode = 'Normal' | 'Multiply' | 'Screen' | 'Overlay' | 'Darken' | 'Lighten' | 'ColorDodge' | 'ColorBurn' | 'HardLight' | 'SoftLight' | 'Difference' | 'Exclusion';

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
  Exclusion = 'Exclusion'
}


// export const knownBlendMode = (mode:string) => mode in BlendModes;

export interface PDFPageDrawTextOptions {
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
}

export interface PDFPageDrawImageOptions {
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

export interface PDFPageDrawSVGOptions {
  x?: number;
  y?: number;
  scale?: number;
  borderWidth?: number;
  color?: Color;
  opacity?: number;
  borderColor?: Color;
  borderOpacity?: number;
  blendMode?: BlendMode;
}

export interface PDFPageDrawLineOptions {
  start: { x: number; y: number };
  end: { x: number; y: number };
  thickness?: number;
  color?: Color;
  lineCap?: LineCapStyle;
  opacity?: number;
  blendMode?: BlendMode;
}

export interface PDFPageDrawRectangleOptions {
  x?: number;
  y?: number;
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
  blendMode?: BlendMode;
}

export interface PDFPageDrawSquareOptions {
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
  blendMode?: BlendMode;
}

export interface PDFPageDrawEllipseOptions {
  x?: number;
  y?: number;
  xScale?: number;
  yScale?: number;
  color?: Color;
  opacity?: number;
  borderColor?: Color;
  borderOpacity?: number;
  borderWidth?: number;
  blendMode?: BlendMode;
}

export interface PDFPageDrawCircleOptions {
  x?: number;
  y?: number;
  size?: number;
  color?: Color;
  opacity?: number;
  borderColor?: Color;
  borderOpacity?: number;
  borderWidth?: number;
  blendMode?: BlendMode;
}
