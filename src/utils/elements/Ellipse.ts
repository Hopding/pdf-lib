import { Size } from '../../types';
import {
  angle,
  distance,
  isEqual,
  orientation,
  orthogonal,
  times,
  unitVector,
  vector,
} from '../maths';

import GraphElement from './GraphElement';
import Point from './Point';
import Segment from './Segment';

export default class Ellipse extends GraphElement {
  A: Point;
  B: Point;
  C: Point;

  constructor(
    A: Point = new Point(),
    B: Point = new Point(),
    C: Point = new Point(),
  ) {
    super();
    this.A = A;
    this.B = B;
    this.C = C;
  }

  center(): Point {
    const center = this.axis().middle();
    return center;
  }

  axis(): Segment {
    const axis = new Segment(this.A, this.B);
    return axis;
  }

  a(): number {
    const axis = this.axis();
    return Math.max(axis.length() / 2, axis.distance(this.C));
  }

  b(): number {
    const axis = this.axis();
    return Math.min(axis.length() / 2, axis.distance(this.C));
  }

  rotation(): number {
    const axis = this.axis();
    return axis.length() / 2 > axis.distance(this.C)
      ? orientation(axis.dirVect())
      : orientation(orthogonal(axis.dirVect()));
  }

  getSize(): Size {
    return { width: 2 * this.a(), height: 2 * this.b() };
  }

  isEqual(element: GraphElement): boolean {
    if (!(element instanceof Ellipse)) return false;
    const a = this.a();
    const b = this.b();
    const rotation = this.rotation();
    const eltA = element.a();
    const eltB = element.b();
    const eltRotation = element.rotation();
    // If the main axis is the same on both ellipse
    if (eltA < eltB === a < b) {
      // The rotation is equivalent module PI as the element is symetrical
      return (
        isEqual(eltA, a) &&
        isEqual(eltB, b) &&
        isEqual(
          rotation + (Math.PI % Math.PI),
          eltRotation + (Math.PI % Math.PI),
        )
      );
    }
    // If the small axis is different
    else {
      // We add a rotation of PI / 2 to emulate the fact that the main axis are actually orthogonal
      return (
        isEqual(eltA, b) &&
        isEqual(eltB, a) &&
        isEqual(
          rotation + (Math.PI % Math.PI),
          eltRotation + (((3 * Math.PI) / 2) % Math.PI),
        )
      );
    }
  }

  includes(P: Point) {
    const { x, y } = P.toCoords();
    const { x: cx, y: cy } = this.center().toCoords();
    const teta = this.rotation();
    return isEqual(
      Math.pow(
        ((x - cx) * Math.cos(teta) + (y - cy) * Math.sin(teta)) / this.a(),
        2,
      ) +
        Math.pow(
          ((x - cx) * Math.sin(teta) - (y - cy) * Math.cos(teta)) / this.b(),
          2,
        ),
      1,
    );
  }

  orthoProjection(P: Point) {
    // We will consider that the parametric projection is a correct approximation of the distance for the current case, even if it is not orthogonal
    const C = this.center();
    const axis = this.axis();
    const CP = vector(C, P);
    const teta = angle(axis.dirVect(), vector(C, P));
    const ray = this.polarRay(teta);
    if (distance(P, this.center()) < ray) return P;
    const vect = times(unitVector(CP), ray);
    return new Point(this.center().plus(vect).toCoords());
  }

  polarRay(teta: number) {
    const a = this.a();
    const b = this.b();
    const excentricity = Math.sqrt(Math.abs(a * a - b * b)) / Math.max(a, b);
    return (
      Math.min(a, b) / Math.sqrt(1 - Math.pow(excentricity * Math.cos(teta), 2))
    );
  }
}
