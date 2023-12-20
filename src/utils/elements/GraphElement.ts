import { distance } from '../maths';

import Point from './Point';

export default abstract class GraphElement {
  abstract isEqual(element: GraphElement): boolean;

  abstract orthoProjection(P: Point): Point;

  distance(P: Point) {
    const H = this.orthoProjection(P);
    return distance(H, P);
  }
}
