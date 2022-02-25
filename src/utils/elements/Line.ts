import { Coordinates } from '../../types';
import { intersectionLine } from '../intersections';
import { isColinear, isEqual, orthogonal, vector } from '../maths';

import GraphElement from './GraphElement';
import Point from './Point';

export default class Line extends GraphElement {
  origin(): Point {
    return this.A;
  }

  dirVect(): Coordinates {
    return vector(this.A, this.B);
  }

  A: Point;
  B: Point;

  constructor(A: Point = new Point(), B: Point = new Point()) {
    super();
    this.A = A;
    this.B = B;
  }

  /** Line equation */
  y(x: number) {
    const a = this.a();
    const b = this.b();
    return a * x + b;
  }

  /** The slope */
  a() {
    const dirVect = this.dirVect();
    return dirVect.y / dirVect.x;
  }

  /** Origin y coordinate */
  b() {
    const O = this.origin().toCoords();
    const a = this.a();
    return O.y - a * O.x;
  }

  isEqual(element: GraphElement): boolean {
    const vect = this.dirVect();
    return (
      element instanceof Line &&
      isColinear(vect, element.dirVect()) &&
      (isEqual(vect.x, 0)
        ? // We need to take care of the case of the vertical line
          isEqual(this.origin().toCoords().x, element.origin().toCoords().x)
        : isEqual(this.b(), element.b()))
    );
  }

  /** Reversed line equation */
  x(y: number) {
    const dirVect = this.dirVect();
    return ((y - this.b()) * dirVect.x) / dirVect.y;
  }

  includes(P: Point) {
    const { x, y } = P.toCoords();
    const vect = this.dirVect();
    return isEqual(vect.x, 0)
      ? isEqual(this.origin().toCoords().x, x)
      : isEqual(this.y(x), y);
  }

  /** This is used to standarsize type Segment | HalfLine | Line */
  getLine() {
    const line = new Line(this.origin(), this.B);
    return line;
  }

  orthoProjection(P: Point): Point {
    const vectOrtho = orthogonal(this.dirVect());
    const A = new Point(P.toCoords());
    const ortho = new Line(A, A.plus(vectOrtho));
    const H = intersectionLine(this, ortho)[0];
    return new Point(H);
  }
}
