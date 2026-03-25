import Arc from '../utils/elements/Arc';
import Circle from '../utils/elements/Circle';
import Ellipse from '../utils/elements/Ellipse';
import Line from '../utils/elements/Line';
import Plot from '../utils/elements/Plot';
import Point from '../utils/elements/Point';
import Rectangle from '../utils/elements/Rectangle';
import Segment from '../utils/elements/Segment';
export { TransformationMatrix } from './matrix';

export type Size = {
  width: number;
  height: number;
};

export type Coordinates = {
  x: number;
  y: number;
};

export type GraphicElement =
  | Arc
  | Circle
  | Ellipse
  | Line
  | Plot
  | Point
  | Rectangle
  | Segment;

export type Space = {
  topLeft: Coordinates;
  topRight: Coordinates;
  bottomRight: Coordinates;
  bottomLeft: Coordinates;
};

export type LinkElement = Rectangle | Ellipse;
