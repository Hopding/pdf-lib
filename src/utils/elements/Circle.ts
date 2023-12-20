import {
  distance,
  distanceCoords,
  isEqual,
  minus,
  plus,
  times,
  unitVector,
} from '../maths';

import GraphElement from './GraphElement';
import Point from './Point';
export default class Circle extends GraphElement {
  O: Point;
  r: number;

  constructor(O: Point = new Point(), r = 1) {
    super();
    this.O = O;
    this.r = r;
  }

  ray() {
    return this.r;
  }

  center() {
    return this.O;
  }

  /** This is used to standardize type Circle | Arc */
  getCircle() {
    return this;
  }

  isEqual(element: GraphElement): boolean {
    return (
      element instanceof Circle &&
      this.center().isEqual(element.center()) &&
      isEqual(this.ray(), element.ray())
    );
  }

  includes(P: Point) {
    return isEqual(distance(this.center(), P), this.ray());
  }

  orthoProjection(P: Point) {
    const center = this.center().toCoords();
    const coords = P.toCoords();
    if (distanceCoords(coords, center) < this.ray()) return P;
    const vect = times(unitVector(minus(coords, center)), this.ray());
    return new Point(plus(center, vect));
  }
}
