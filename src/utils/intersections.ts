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
import { isPDFInstance, PDFClasses } from '../api/objects';

export const intersections = (
  A: GraphicElement,
  B: GraphicElement,
): Coordinates[] => {
  if (isPDFInstance(A, PDFClasses.Point) || isPDFInstance(B, PDFClasses.Point))
    return [];
  else if (A instanceof Text || B instanceof Text) return [];
  else if (A instanceof Image || B instanceof Image) return [];
  // TODO: calculate the coords of the intersection: https://www.emathzone.com/tutorials/geometry/intersection-of-line-and-ellipse.html
  else if (isPDFInstance(A, PDFClasses.Line))
    return intersectionsLine(
      A as Line,
      B as Arc | Circle | Ellipse | Line | Plot | Rectangle | Segment,
    );
  else if (isPDFInstance(A, PDFClasses.Segment)) {
    return intersectionsLine(
      (A as Segment).getLine(),
      B as Arc | Circle | Ellipse | Line | Plot | Rectangle | Segment,
    ).filter((P) => (A as Segment).includes(new Point(P)));
  } else if (isPDFInstance(A, PDFClasses.Circle))
    return intersectionsCircle(
      A as Circle,
      B as Arc | Circle | Ellipse | Line | Plot | Rectangle | Segment,
    );
  else if (isPDFInstance(A, PDFClasses.Arc)) {
    return intersectionsCircle(
      (A as Arc).getCircle(),
      B as Arc | Circle | Ellipse | Line | Plot | Rectangle | Segment,
    ).filter((P) => (A as Arc).includes(new Point(P)));
  } else if (isPDFInstance(A, PDFClasses.Plot))
    return intersectionsPlot(A as Plot, B);
  else if (isPDFInstance(A, PDFClasses.Rectangle))
    return intersectionsRectangle(A as Rectangle, B);
  else if (isPDFInstance(A, PDFClasses.Ellipse))
    return intersectionsEllipse(
      A as Ellipse,
      B as Arc | Circle | Ellipse | Line | Plot | Rectangle | Segment,
    );
  return A as never;
};

export const intersection = (
  A: GraphicElement,
  B: GraphicElement,
): Coordinates | undefined => intersections(A, B)[0];

const intersectionsLine = (
  A: Line,
  B: Exclude<GraphicElement, Text | Point>,
): Coordinates[] => {
  if (isPDFInstance(B, PDFClasses.Line)) return intersectionLine(A, B as Line);
  else if (isPDFInstance(B, PDFClasses.Segment)) {
    return intersectionLine(A, (B as Segment).getLine()).filter((P) =>
      (B as Segment).includes(new Point(P)),
    );
  } else if (isPDFInstance(B, PDFClasses.Circle))
    return intersectionCircleLine(B as Circle, A);
  else if (isPDFInstance(B, PDFClasses.Arc)) {
    return intersectionsCircle((B as Arc).getCircle(), A).filter((P) =>
      (B as Arc).includes(new Point(P)),
    );
  } else if (isPDFInstance(B, PDFClasses.Plot))
    return intersectionsPlot(B as Plot, A);
  else if (isPDFInstance(B, PDFClasses.Rectangle))
    return intersectionsRectangle(B as Rectangle, A);
  else if (isPDFInstance(B, PDFClasses.Ellipse))
    return intersectionsEllipse(B as Ellipse, A);
  return B as never;
};

const intersectionsEllipse = (
  A: Ellipse,
  B: Exclude<GraphicElement, Text | Point>,
): Coordinates[] => {
  if (isPDFInstance(B, PDFClasses.Line))
    return intersectionsLineAndEllipse(A, B as Line);
  else if (isPDFInstance(B, PDFClasses.Segment)) {
    return intersectionsEllipse(A, (B as Segment).getLine()).filter((P) =>
      (B as Segment).includes(new Point(P)),
    );
  }
  // TODO:
  // else if (isPDFInstnace(B, PDFClasses.Circle)) return intersectionEllipseCircle(B as Circle, A);
  else if (isPDFInstance(B, PDFClasses.Circle)) return [];
  // TODO:
  // else if (isPDFInstance(B, PDFClasses.Ellipse)) return intersectionEllipseEllipse(B as Ellipse, A);
  else if (isPDFInstance(B, PDFClasses.Ellipse)) return [];
  else if (isPDFInstance(B, PDFClasses.Arc)) {
    return intersectionsEllipse(A, (B as Arc).getCircle()).filter((P) =>
      (B as Arc).includes(new Point(P)),
    );
  } else if (isPDFInstance(B, PDFClasses.Plot))
    return intersectionsPlot(B as Plot, A);
  else if (isPDFInstance(B, PDFClasses.Rectangle))
    return intersectionsRectangle(B as Rectangle, A);
  return B as never;
};

const intersectionsLineAndEllipse = (A: Ellipse, B: Line): Coordinates[] => {
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
    const vDelta = b ** 2 - (x ** 2 * b ** 2) / a ** 2;
    if (vDelta < 0) return [];
    else if (vDelta === 0) {
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
};

export const intersectionLine = (A: Line, B: Line): Coordinates[] => {
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
};

const intersectionsPlot = (A: Plot, B: GraphicElement): Coordinates[] => {
  const points = A.getPoints().map((pt) => new Point(pt));
  const head = points.pop();
  const segments = points.map(
    (pt, i) => new Segment(pt, points[i + 1] || head),
  );
  // @ts-ignore
  const inters = segments.map((s) => intersections(s, B)).flat();
  return inters;
};

const intersectionsRectangle = (
  A: Rectangle,
  B: GraphicElement,
): Coordinates[] => {
  const P1 = A.getCoords();
  const P3 = A.getEnd();
  const P2 = { x: P1.x, y: P3.y };
  const P4 = { x: P3.x, y: P1.y };
  return intersections(new Plot([P1, P2, P3, P4, P1]), B);
};

export const intersectionCircleLine = (A: Circle, B: Line): Coordinates[] => {
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
};

export const intersectionCircle = (A: Circle, B: Circle): Coordinates[] => {
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
};

const intersectionsCircle = (
  A: Circle,
  B: Exclude<GraphicElement, Text | Point>,
): Coordinates[] => {
  if (isPDFInstance(B, PDFClasses.Circle))
    return intersectionCircle(A, B as Circle);
  else if (isPDFInstance(B, PDFClasses.Line))
    return intersectionCircleLine(A, B as Line);
  else if (isPDFInstance(B, PDFClasses.Segment)) {
    return intersectionCircleLine(A, (B as Segment).getLine()).filter((P) =>
      (B as Segment).includes(new Point(P)),
    );
  } else if (isPDFInstance(B, PDFClasses.Arc)) {
    return intersectionCircle(A, (B as Arc).getCircle()).filter((P) =>
      (B as Arc).includes(new Point(P)),
    );
  } else if (isPDFInstance(B, PDFClasses.Plot))
    return intersectionsPlot(B as Plot, A);
  else if (isPDFInstance(B, PDFClasses.Rectangle))
    return intersectionsRectangle(B as Rectangle, A);
  else if (isPDFInstance(B, PDFClasses.Ellipse))
    return intersectionsEllipse(B as Ellipse, A);
  return B as never;
};

export const getIntersections = (elements: GraphicElement[]) => {
  const checked: GraphicElement[] = [];
  const inters: Coordinates[] = [];
  elements.forEach((elt) => {
    checked.forEach((e) => inters.push(...intersections(e, elt)));
    checked.push(elt);
  });
  return inters;
};
