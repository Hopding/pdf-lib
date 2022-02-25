import { angleABC, distance, distanceCoords, rotate, vector } from '../maths';

import Circle from './Circle';
import GraphElement from './GraphElement';
import Point from './Point';

export default class Arc extends GraphElement {
  O: Point;
  A: Point;
  B: Point;
  /** Last sweep. Used to deduce the angle orientation */
  lastSweep: number;

  constructor(
    O: Point = new Point(),
    A: Point = new Point(),
    B: Point = new Point(),
    lastSweep = 0,
  ) {
    super();
    this.O = O;
    this.A = A;
    this.B = B;
    this.lastSweep = lastSweep;
  }

  center() {
    return this.O;
  }

  origin() {
    return this.A;
  }

  destination() {
    return this.getCircle().orthoProjection(this.B);
  }

  sweep() {
    this.lastSweep = angleABC(
      this.origin(),
      this.center(),
      this.destination(),
      this.lastSweep,
    );
    return this.lastSweep;
  }

  ray() {
    return distance(this.center(), this.origin());
  }

  isEqual(element: GraphElement): boolean {
    if (!(element instanceof Arc)) return false;
    const dest = this.destination();
    const o = this.origin();
    const eDest = element.destination();
    const eO = element.origin();
    return (
      this.getCircle().isEqual(element.getCircle()) &&
      ((dest.isEqual(eDest) && o.isEqual(eO)) ||
        (dest.isEqual(eO) && o.isEqual(eDest)))
    );
  }

  getCircle() {
    const circle = new Circle(this.center(), this.ray());
    return circle;
  }

  originVect() {
    return vector(this.center(), this.origin());
  }

  middle() {
    const halfSweep = this.sweep() / 2;
    const mid = this.center().plus(
      rotate(vector(this.center(), this.origin()), halfSweep),
    );
    return mid;
  }

  includes(P: Point) {
    // As angles are returned between -π and π, we need the middle of the arc
    return (
      this.getCircle().includes(P) &&
      Math.abs(angleABC(this.middle(), this.center(), P)) <=
        Math.abs(this.sweep() / 2)
    );
  }

  orthoProjection(P: Point) {
    const H = this.getCircle().orthoProjection(P);
    if (this.includes(H)) return H;
    else {
      const origin = this.origin().toCoords();
      const destination = this.destination().toCoords();
      // Returns the closest between origin and destination
      const coords =
        distanceCoords(H.toCoords(), origin) <
        distanceCoords(H.toCoords(), destination)
          ? origin
          : destination;
      return new Point(coords);
    }
  }
}
