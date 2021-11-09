import { Coordinates } from '../../types';
import { plus } from '../maths';

import GraphElement from './GraphElement';
import Point from './Point';
import Segment from './Segment';
export default class Plot extends GraphElement {
  points: Coordinates[];

  constructor(points: Coordinates[] = []) {
    super();
    this.points = points;
  }

  getPoints() {
    return [...this.points];
  }

  translate(translationVector: Coordinates) {
    this.points = this.points.map((point) => plus(point, translationVector));
  }

  isEqual(element: GraphElement): boolean {
    if (!(element instanceof Plot)) return false;
    const points = this.getPoints().map((coord) => new Point(coord));
    const points2 = element.getPoints().map((coord) => new Point(coord));
    return (
      points.every((point, i) => point.isEqual(points2[i])) ||
      points.reverse().every((point, i) => point.isEqual(points2[i]))
    );
  }

  orthoProjection(P: Point) {
    const points = this.getPoints();
    const orthos = points
      .slice(0, -1)
      .map((pt, i) => new Segment(new Point(pt), new Point(points[i + 1])))
      .map((seg) => seg.orthoProjection(P));
    let min = Number.POSITIVE_INFINITY;
    let closest: Point = new Point(points[0]);
    orthos.forEach((ortho) => {
      const d = ortho.distance(P);
      if (d < min) {
        min = d;
        closest = ortho;
      }
    });
    return closest;
  }
}
