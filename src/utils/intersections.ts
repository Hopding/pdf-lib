import Arc from './elements/Arc';
import Circle from './elements/Circle';
import Ellipse from './elements/Ellipse';
import Line from './elements/Line';
import Plot from './elements/Plot';
import Point from './elements/Point';
import Rectangle from './elements/Rectangle';
import Segment from './elements/Segment';
import { Coordinates, GraphicElement } from '../types';
import {
  distance,
  isColinear,
  isEqual,
  norm,
  orthogonal,
  times,
  unitVector,
  vector,
  rotate,
} from './maths';

export function intersections(
  A: GraphicElement,
  B: GraphicElement,
): Coordinates[] {
  if (A instanceof Point || B instanceof Point) return [];
  else if (A instanceof Text || B instanceof Text) return [];
  else if (A instanceof Image || B instanceof Image) return [];
  // TODO: calculate the coords of the intersection: https://www.emathzone.com/tutorials/geometry/intersection-of-line-and-ellipse.html
  else if (A instanceof Line) return intersectionsLine(A, B);
  else if (A instanceof Segment) {
    return intersectionsLine(A.getLine(), B).filter((P) =>
      A.includes(new Point(P)),
    );
  } else if (A instanceof Circle) return intersectionsCircle(A, B);
  else if (A instanceof Arc) {
    return intersectionsCircle(A.getCircle(), B).filter((P) =>
      A.includes(new Point(P)),
    );
  } else if (A instanceof Plot) return intersectionsPlot(A, B);
  else if (A instanceof Rectangle) return intersectionsRectangle(A, B);
  else if (A instanceof Ellipse) return intersectionsEllipse(A, B);
  return A;
}

export function intersection(
  A: GraphicElement,
  B: GraphicElement,
): Coordinates | undefined {
  return intersections(A, B)[0];
}

function intersectionsLine(
  A: Line,
  B: Exclude<GraphicElement, Text | Point>,
): Coordinates[] {
  if (B instanceof Line) return intersectionLine(A, B);
  else if (B instanceof Segment) {
    return intersectionLine(A, B.getLine()).filter((P) =>
      B.includes(new Point(P)),
    );
  } else if (B instanceof Circle) return intersectionCircleLine(B, A);
  else if (B instanceof Arc) {
    return intersectionsCircle(B.getCircle(), A).filter((P) =>
      B.includes(new Point(P)),
    );
  } else if (B instanceof Plot) return intersectionsPlot(B, A);
  else if (B instanceof Rectangle) return intersectionsRectangle(B, A);
  else if (B instanceof Ellipse) return intersectionsEllipse(B, A);
  return B;
}

function intersectionsEllipse(
  A: Ellipse,
  B: Exclude<GraphicElement, Text | Point>,
): Coordinates[] {
  if (B instanceof Line) return intersectionsLineAndEllipse(A, B);
  else if (B instanceof Segment) {
    return intersectionsEllipse(A, B.getLine()).filter((P) =>
      B.includes(new Point(P)),
    );
  }
  // TODO:
  // else if (B instanceof Circle) return intersectionEllipseCircle(B, A)
  else if (B instanceof Circle) return [];
  // TODO:
  // else if (B instanceof Ellipse) return intersectionEllipseEllipse(B, A)
  else if (B instanceof Ellipse) return [];
  else if (B instanceof Arc) {
    return intersectionsEllipse(A, B.getCircle()).filter((P) =>
      B.includes(new Point(P)),
    );
  } else if (B instanceof Plot) return intersectionsPlot(B, A);
  else if (B instanceof Rectangle) return intersectionsRectangle(B, A);
  return B;
}

function intersectionsLineAndEllipse(A: Ellipse, B: Line): Coordinates[] {
  const center = A.center().toCoords();
  const a = A.a();
  const b = A.b();
  const rotation = A.rotation();
  const isLineParallel2YAxis = isEqual(B.dirVect().x, 0);

  // this is a dummy value to represent a point on the line
  const p1Y = isLineParallel2YAxis ? 1 : B.y(1);
  const p1X = isLineParallel2YAxis ? B.origin().toCoords().x : 1;
  const p1 = { x: p1X, y: p1Y };

  // this is a dummy value to represent a point on the line
  const p2Y = isLineParallel2YAxis ? 2 : B.y(2);
  const p2X = isLineParallel2YAxis ? B.origin().toCoords().x : 2;
  const p2 = { x: p2X, y: p2Y };

  const p1Normalized = rotate(
    { x: p1.x - center.x, y: p1.y - center.y },
    -rotation,
  );
  const p2Normalized = rotate(
    { x: p2.x - center.x, y: p2.y - center.y },
    -rotation,
  );

  const angular =
    (p1Normalized.y - p2Normalized.y) / (p1Normalized.x - p2Normalized.x);
  const linear = p1Normalized.y - angular * p1Normalized.x;

  const lineY = (x: number) => angular * x + linear;
  const denormalize = (coord: Coordinates) => {
    const rotated = rotate(coord, rotation);
    return {
      x: rotated.x + center.x,
      y: rotated.y + center.y,
    };
  };

  // Intersection with vertical line
  if (isEqual(p1Normalized.x - p2Normalized.x, 0)) {
    const x = p1Normalized.x;
    const delta = b ** 2 - (x ** 2 * b ** 2) / a ** 2;
    if (delta < 0) return [];
    else if (delta === 0) {
      return [{ x, y: 0 }].map(denormalize);
    } else {
      const y1 = Math.sqrt((b ** 2 * (a ** 2 - x ** 2)) / a ** 2);
      const y2 = -y1;
      return [
        { x, y: y1 },
        { x, y: y2 },
      ].map(denormalize);
    }
  }

  // Intersection with any line

  // the quadratic equation is:
  // alpha * x ** 2 + beta * x + gamma = 0
  const alpha = a ** 2 * angular ** 2 + b ** 2;
  const beta = 2 * a ** 2 * (angular * linear);
  const gamma = a ** 2 * (linear ** 2 - b ** 2);

  const delta = beta ** 2 - 4 * alpha * gamma;
  if (delta < 0) return [];
  else if (delta === 0) {
    const x = -(beta ** 2) / (2 * alpha);
    const y = lineY(x);
    return [{ x, y }].map(denormalize);
  } else {
    const x1 = (-beta + Math.sqrt(delta)) / (2 * alpha);
    const y1 = lineY(x1);
    const x2 = (-beta - Math.sqrt(delta)) / (2 * alpha);
    const y2 = lineY(x2);
    return [
      { x: x1, y: y1 },
      { x: x2, y: y2 },
    ].map(denormalize);
  }
}

export function intersectionLine(A: Line, B: Line): Coordinates[] {
  if (isColinear(A.dirVect(), B.dirVect())) return [];
  else {
    const { x: ux, y: uy } = A.dirVect();
    const { x: vx, y: vy } = B.dirVect();
    const { x: xA, y: yA } = A.origin().toCoords();
    const { x: xB, y: yB } = B.origin().toCoords();
    const x =
      (ux * (vx * (yA - yB) + vy * xB) - uy * vx * xA) / (ux * vy - uy * vx);
    const y =
      (uy * (vy * (xA - xB) + vx * yB) - ux * vy * yA) / (uy * vx - ux * vy);
    return [{ x, y }];
  }
}

function intersectionsPlot(A: Plot, B: GraphicElement): Coordinates[] {
  const points = A.getPoints().map((pt) => new Point(pt));
  const head = points.pop();
  const segments = points.map(
    (pt, i) => new Segment(pt, points[i + 1] || head),
  );
  // @ts-ignore
  const inters = segments.map((s) => intersections(s, B)).flat();
  return inters;
}

function intersectionsRectangle(
  A: Rectangle,
  B: GraphicElement,
): Coordinates[] {
  const P1 = A.getCoords();
  const P3 = A.getEnd();
  const P2 = { x: P1.x, y: P3.y };
  const P4 = { x: P3.x, y: P1.y };
  return intersections(new Plot([P1, P2, P3, P4, P1]), B);
}

export function intersectionCircleLine(A: Circle, B: Line): Coordinates[] {
  const rA = A.ray();
  const O = A.center();
  const H = B.orthoProjection(O);
  const OH = distance(O, H);
  // The line is tangeant
  if (isEqual(OH, rA)) return [H];
  // The line is too far from the circle
  else if (OH > A.ray()) return [];
  // The line cut the circle in 2 points
  else {
    // Pythagore
    const HP = Math.sqrt(rA * rA - OH * OH);
    const vect = unitVector(B.dirVect());
    return [H.plus(times(vect, HP)), H.plus(times(vect, -HP))];
  }
}

export function intersectionCircle(A: Circle, B: Circle): Coordinates[] {
  const oA = A.center();
  const oB = B.center();
  const rA = A.ray();
  const rB = B.ray();
  const axis = vector(oA, oB);
  const CC = norm(axis);
  // The circles are tangeant
  if (isEqual(CC, rA + rB)) return [A.orthoProjection(oB).toCoords()];
  // The circles are too far from eachother
  else if (CC > rA + rB) return [];
  // The intersections belong to an orthogonal axis
  else {
    const ratio = 1 / 2 + (rA * rA - rB * rB) / (CC * CC) / 2;
    const H = oA.plus(times(axis, ratio));
    return intersectionCircleLine(A, new Line(H, H.plus(orthogonal(axis))));
  }
}

function intersectionsCircle(
  A: Circle,
  B: Exclude<GraphicElement, Text | Point>,
): Coordinates[] {
  if (B instanceof Circle) return intersectionCircle(A, B);
  else if (B instanceof Line) return intersectionCircleLine(A, B);
  else if (B instanceof Segment) {
    return intersectionCircleLine(A, B.getLine()).filter((P) =>
      B.includes(new Point(P)),
    );
  } else if (B instanceof Arc) {
    return intersectionCircle(A, B.getCircle()).filter((P) =>
      B.includes(new Point(P)),
    );
  } else if (B instanceof Plot) return intersectionsPlot(B, A);
  else if (B instanceof Rectangle) return intersectionsRectangle(B, A);
  else if (B instanceof Ellipse) return intersectionsEllipse(B, A);
  return B;
}

export function getIntersections(elements: GraphicElement[]) {
  const checked: GraphicElement[] = [];
  const inters: Coordinates[] = [];
  elements.forEach((elt) => {
    checked.forEach((e) => inters.push(...intersections(e, elt)));
    checked.push(elt);
  });
  return inters;
}
