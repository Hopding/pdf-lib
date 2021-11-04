import type { Coordinates, GraphicElement } from '../../types'

import {
  isEqual,
  plus,
} from '../maths'
import GraphElement from './GraphElement'
import Segment from './Segment'

export default class Point extends GraphElement {
  static type = 'PointFixed'

  x: number
  y: number

  constructor(coords = { x: 0, y: 0 }) {
    super()
    this.x = coords.x
    this.y = coords.y
  }

  toCoords() {
    return { x: this.x, y: this.y }
  }

  isEqual(element: GraphElement): boolean {
    if (!(element instanceof Point)) return false
    const A = this.toCoords()
    const B = element.toCoords()
    return isEqual(A.x, B.x) && isEqual(A.y, B.y)
  }

  orthoProjection() {
    return new Point(this.toCoords())
  }

  plus(vect: Coordinates) {
    const P = new Point(plus(this.toCoords(), vect))
    return P
  }
}

export class Projected extends Point {
  static type = 'Projected' as const
  support: Exclude<GraphicElement, Point>
  P: Point
  constructor(
    support: Exclude<GraphicElement, Point> = new Segment(),
    P: Point = new Point()
  ) {
    super()
    this.support = support
    this.P = P
  }

  toCoords(): Coordinates {
    return this.support.orthoProjection(this.P).toCoords()
  }
}