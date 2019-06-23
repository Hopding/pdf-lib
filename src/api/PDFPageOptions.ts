import { Color } from 'src/api/colors';
import PDFFont from 'src/api/PDFFont';
import { Rotation } from 'src/api/rotations';

export interface DrawTextOptions {
  color?: Color;
  font?: PDFFont;
  size?: number;
  rotate?: Rotation;
  xSkew?: Rotation;
  ySkew?: Rotation;
  x?: number;
  y?: number;
  lineHeight?: number;
}

export interface DrawImageOptions {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotate?: Rotation;
  xSkew?: Rotation;
  ySkew?: Rotation;
}

export interface DrawRectangleOptions {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotate?: Rotation;
  xSkew?: Rotation;
  ySkew?: Rotation;
  borderWidth?: number;
  color?: Color;
  borderColor?: Color;
}

export interface DrawSquareOptions {
  x?: number;
  y?: number;
  size?: number;
  rotate?: Rotation;
  xSkew?: Rotation;
  ySkew?: Rotation;
  borderWidth?: number;
  color?: Color;
  borderColor?: Color;
}

export interface DrawEllipseOptions {
  x?: number;
  y?: number;
  xScale?: number;
  yScale?: number;
  color?: Color;
  borderColor?: Color;
  borderWidth?: number;
}

export interface DrawCircleOptions {
  x?: number;
  y?: number;
  scale?: number;
  color?: Color;
  borderColor?: Color;
  borderWidth?: number;
}
