import Arc from './elements/Arc'
import Circle from './elements/Circle'
import Ellipse from './elements/Ellipse'
import Line from './elements/Line'
import Plot, { PlotFree } from './elements/Plot'
import Point from './elements/Point'
import Rectangle from './elements/Rectangle'
import Segment from './elements/Segment'
import { Coordinates, GraphicElement } from '../types'
import {
  distance,
  isColinear,
  isEqual,
  norm,
  orthogonal,
  times,
  unitVector,
  vector,
} from '../utils/maths'


export function intersections(A: GraphicElement, B: GraphicElement): Coordinates[] {
  if (A instanceof Point || B instanceof Point) return []
  else if (A instanceof Image || B instanceof Image) return []
  // TODO: calculate the coords of the intersection: https://www.emathzone.com/tutorials/geometry/intersection-of-line-and-ellipse.html
  else if (A instanceof Ellipse || B instanceof Ellipse) return []
  else if (A instanceof Line) return intersectionsLine(A, B)
  else if (A instanceof Segment)
    return intersectionsLine(A.getLine(), B).filter(P => A.includes(new Point(P)))
  else if (A instanceof Circle) return intersectionsCircle(A, B)
  else if (A instanceof Arc)
    return intersectionsCircle(A.getCircle(), B).filter(P => A.includes(new Point(P)))
  else if (A instanceof Plot) return intersectionsPlot(A, B)
  else if (A instanceof Rectangle) return intersectionsRectangle(A, B)
  return A
}

export function intersection(
  A: GraphicElement,
  B: GraphicElement
): Coordinates | undefined {
  return intersections(A, B)[0]
}

function intersectionsLine(
  A: Line,
  B: Exclude<GraphicElement, Point | Ellipse>
): Coordinates[] {
  if (B instanceof Line) return intersectionLine(A, B)
  else if (B instanceof Segment)
    return intersectionLine(A, B.getLine()).filter(P => B.includes(new Point(P)))
  else if (B instanceof Circle) return intersectionCircleLine(B, A)
  else if (B instanceof Arc)
    return intersectionsCircle(B.getCircle(), A).filter(P => B.includes(new Point(P)))
  else if (B instanceof Plot) return intersectionsPlot(B, A)
  else if (B instanceof Rectangle) return intersectionsRectangle(B, A)
  return B
}

export function intersectionLine(A: Line, B: Line): Coordinates[] {
  if (isColinear(A.dirVect(), B.dirVect())) return []
  else {
    const { x: ux, y: uy } = A.dirVect()
    const { x: vx, y: vy } = B.dirVect()
    const { x: xA, y: yA } = A.origin().toCoords()
    const { x: xB, y: yB } = B.origin().toCoords()
    const x = (ux * (vx * (yA - yB) + vy * xB) - uy * vx * xA) / (ux * vy - uy * vx)
    const y = (uy * (vy * (xA - xB) + vx * yB) - ux * vy * yA) / (uy * vx - ux * vy)
    return [{ x, y }]
  }
}

function intersectionsPlot(A: Plot, B: GraphicElement): Coordinates[] {
  const points = A.getPoints().map(pt => new Point(pt))
  const head = points.pop()
  const segments = points.map((pt, i) => new Segment(pt, points[i + 1] || head))
  // @ts-ignore
  const inters = segments.map(s => intersections(s, B)).flat()
  return inters
}

function intersectionsRectangle(A: Rectangle, B: GraphicElement): Coordinates[] {
  const P1 = A.getCoords()
  const P3 = A.getEnd()
  const P2 = { x: P1.x, y: P3.y }
  const P4 = { x: P3.x, y: P1.y }
  return intersections(new PlotFree([P1, P2, P3, P4, P1]), B)
}

export function intersectionCircleLine(A: Circle, B: Line): Coordinates[] {
  const rA = A.ray()
  const O = A.center()
  const H = B.orthoProjection(O)
  const OH = distance(O, H)
  // The line is tangeant
  if (isEqual(OH, rA)) return [H]
  // The line is too far from the circle
  else if (OH > A.ray()) return []
  // The line cut the circle in 2 points
  else {
    // Pythagore
    const HP = Math.sqrt(rA * rA - OH * OH)
    const vect = unitVector(B.dirVect())
    return [H.plus(times(vect, HP)), H.plus(times(vect, -HP))]
  }
}

export function intersectionCircle(A: Circle, B: Circle): Coordinates[] {
  const oA = A.center()
  const oB = B.center()
  const rA = A.ray()
  const rB = B.ray()
  const axis = vector(oA, oB)
  const CC = norm(axis)
  // The circles are tangeant
  if (isEqual(CC, rA + rB)) return [A.orthoProjection(oB).toCoords()]
  // The circles are too far from eachother
  else if (CC > rA + rB) return []
  // The intersections belong to an orthogonal axis
  else {
    const ratio = 1 / 2 + (rA * rA - rB * rB) / (CC * CC) / 2
    const H = oA.plus(times(axis, ratio))
    return intersectionCircleLine(A, new Line(H, H.plus(orthogonal(axis))))
  }
}

function intersectionsCircle(
  A: Circle,
  B: Exclude<GraphicElement, Point | Ellipse>
): Coordinates[] {
  if (B instanceof Circle) return intersectionCircle(A, B)
  else if (B instanceof Line) return intersectionCircleLine(A, B)
  else if (B instanceof Segment)
    return intersectionCircleLine(A, B.getLine()).filter(P => B.includes(new Point(P)))
  else if (B instanceof Arc)
    return intersectionCircle(A, B.getCircle()).filter(P => B.includes(new Point(P)))
  else if (B instanceof Plot) return intersectionsPlot(B, A)
  else if (B instanceof Rectangle) return intersectionsRectangle(B, A)
  return B
}

export function getIntersections(elements: GraphicElement[]) {
  const checked: GraphicElement[] = []
  const inters: Coordinates[] = []
  elements.forEach(elt => {
    checked.forEach(e => inters.push(...intersections(e, elt)))
    checked.push(elt)
  })
  return inters
}
