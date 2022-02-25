import GraphElement from './GraphElement';
import Point from './Point';
import Segment from './Segment';

export default class Rectangle extends GraphElement {
  static type = 'Rectangle';
  start: Point;
  end: Point;
  constructor(start: Point = new Point(), end: Point = new Point()) {
    super();
    this.start = start;
    this.end = end;
  }

  getSize() {
    const start = this.start.toCoords();
    const end = this.end.toCoords();
    return {
      width: Math.abs(start.x - end.x),
      height: Math.abs(start.y - end.y),
    };
  }

  getCoords() {
    const start = this.start.toCoords();
    const end = this.end.toCoords();
    return {
      x: Math.min(start.x, end.x),
      y: Math.max(start.y, end.y),
    };
  }

  getStart() {
    const start = new Point(this.getCoords());
    return start;
  }

  getEnd() {
    const { width, height } = this.getSize();
    const end = new Point(this.getStart()).plus({ x: width, y: -height });
    return end;
  }

  center() {
    const center = new Segment(this.getStart(), this.getEnd()).middle();
    return center;
  }

  isEqual(element: GraphElement): boolean {
    return (
      element instanceof Rectangle &&
      this.getStart().isEqual(element.getStart()) &&
      this.getEnd().isEqual(element.getEnd())
    );
  }

  orthoProjection(P: Point) {
    const { x, y } = this.getCoords();
    const end = this.getEnd().toCoords();
    const { x: Px, y: Py } = P.toCoords();
    const Hx = Px < x ? x : Px > end.x ? end.x : Px;
    const Hy = Py > y ? y : Py < end.y ? end.y : Py;
    return new Point({ x: Hx, y: Hy });
  }
}
