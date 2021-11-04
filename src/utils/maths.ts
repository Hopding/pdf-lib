import Point from './elements/Point'
import { Coordinates } from '../types'

/** This value represents the precision we accept for float values */
export const FLOAT_APPROXIMATION = 0.000001

/** Calculates the distance between 2 points */
export function distance(A: Point, B: Point) {
  return norm(vector(A, B))
}

export function distanceCoords(A: Coordinates, B: Coordinates) {
  return norm(minus(B, A))
}

/** Calculates the distance denoted by a vector */
export function norm(vect: Coordinates) {
  return Math.sqrt(vect.x * vect.x + vect.y * vect.y)
}

/** Calculates the orthogonal vector of provided vector */
export function orthogonal({ x, y }: Coordinates): Coordinates {
  return { x: -y, y: x }
}

/** Check if 2 vectors are proportional */
export function isColinear(
  { x: ux, y: uy }: Coordinates,
  { x: vx, y: vy }: Coordinates
): boolean {
  return isEqual(ux * vy, uy * vx)
}

/** Check if 2 floating values can be considered equals */
export function isEqual(a: number, b: number): boolean {
  // TODO(fbillioud) Should be improved to handle small space values (xMin: 0.000001, xMax: 0.000010)
  return Math.round(Math.abs(a - b) / FLOAT_APPROXIMATION) === 0
}

/** Return true if a is proportional to b: (a = kb), considering float imprecision */
export function isProportional(a: number, b: number): boolean {
  return isEqual((Math.abs(a) + FLOAT_APPROXIMATION / 10) % b, 0)
}

/** Calculate the scalar product between 2 vectors */
export function scalar(
  { x: ux, y: uy }: Coordinates,
  { x: vx, y: vy }: Coordinates
): number {
  return ux * vx + uy * vy
}

/** Calculate the sum of 2 vectors */
export function plus(
  { x: ux, y: uy }: Coordinates,
  { x: vx, y: vy }: Coordinates
): Coordinates {
  return { x: ux + vx, y: uy + vy }
}

/** Calculate the vector multiplied by a scalar */
export function times({ x, y }: Coordinates, k = 1): Coordinates {
  return { x: k * x, y: k * y }
}

/** Calculate the difference of 2 vectors */
export function minus(u: Coordinates, v: Coordinates): Coordinates {
  return plus(u, times(v, -1))
}

/** Returns the vector between 2 points. */
export function vector(A: Point, B: Point): Coordinates {
  return minus(B.toCoords(), A.toCoords())
}

/**
 * Returns the angle between the vector and the horizontal axis (Ox).
 * The return value is between -PI and PI.
 * @returns {number} angle in radian between -Pi and Pi
 */
export function orientation({ x, y }: Coordinates): number {
  const angle = Math.acos(x / Math.sqrt(x * x + y * y))
  return y > 0 ? angle : -angle
}

/** Returns the unit vector associated to the provided vector,
 * or the Null vector (0, 0) if the vector is null **/
export function unitVector(u: Coordinates): Coordinates {
  const l = norm(u)
  return l > 0 ? times(u, 1 / l) : u
}

/** Returns the angle from u to v in radian **/
export function angle(u: Coordinates, v: Coordinates, previousAngle = 0) {
  let sweep = orientation(v) - orientation(u)
  // If the angle has the same sign as the arc orientation, we return the angle as is
  // Otherwise, we need to correct the value, adding or removing 2π
  while (Math.abs(previousAngle - sweep) > Math.PI)
    sweep += Math.sign(previousAngle - sweep) * 2 * Math.PI
  return sweep
}

/** Returns the angle between the lines (BA) and (BC) in radian
 * @returns {number} the angle in radian, between -Pi and Pi
 */
export function angleABC(A: Point, B: Point, C: Point, previousAngle = 0): number {
  return angle(vector(B, A), vector(B, C), previousAngle)
}

/** Rotate the vector by an angle in radian */
export function rotate(vector: Coordinates, angle: number): Coordinates {
  const { x, y } = vector
  const nx = x * Math.cos(angle) - y * Math.sin(angle)
  const ny = y * Math.cos(angle) + x * Math.sin(angle)
  return { x: nx, y: ny }
}
