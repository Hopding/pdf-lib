import Point from './elements/Point';
import { Coordinates } from '../types';

/** This value represents the precision we accept for float values */
export const FLOAT_APPROXIMATION = 0.000001;

/** Calculates the distance between 2 points */
export const distance = (A: Point, B: Point) => norm(vector(A, B));

export const distanceCoords = (A: Coordinates, B: Coordinates) =>
  norm(minus(B, A));

/** Calculates the distance denoted by a vector */
export const norm = (vect: Coordinates) =>
  Math.sqrt(vect.x * vect.x + vect.y * vect.y);

/** Calculates the orthogonal vector of provided vector */
export const orthogonal = ({ x, y }: Coordinates): Coordinates => ({
  x: -y,
  y: x,
});

/** Check if 2 vectors are proportional */
export const isColinear = (
  { x: ux, y: uy }: Coordinates,
  { x: vx, y: vy }: Coordinates,
): boolean => isEqual(ux * vy, uy * vx);

/** Check if 2 floating values can be considered equals */
export const isEqual = (a: number, b: number): boolean =>
  Math.round(Math.abs(a - b) / FLOAT_APPROXIMATION) === 0;

/** Return true if a is proportional to b: (a = kb), considering float imprecision */
export const isProportional = (a: number, b: number): boolean =>
  isEqual((Math.abs(a) + FLOAT_APPROXIMATION / 10) % b, 0);

/** Calculate the scalar product between 2 vectors */
export const scalar = (
  { x: ux, y: uy }: Coordinates,
  { x: vx, y: vy }: Coordinates,
): number => ux * vx + uy * vy;

/** Calculate the sum of 2 vectors */
export const plus = (
  { x: ux, y: uy }: Coordinates,
  { x: vx, y: vy }: Coordinates,
): Coordinates => ({ x: ux + vx, y: uy + vy });

/** Calculate the vector multiplied by a scalar */
export const times = ({ x, y }: Coordinates, k = 1): Coordinates => ({
  x: k * x,
  y: k * y,
});

/** Calculate the difference of 2 vectors */
export const minus = (u: Coordinates, v: Coordinates): Coordinates =>
  plus(u, times(v, -1));

/** Returns the vector between 2 points. */
export const vector = (A: Point, B: Point): Coordinates =>
  minus(B.toCoords(), A.toCoords());

/**
 * Returns the angle between the vector and the horizontal axis (Ox).
 * The return value is between -PI and PI.
 * @returns {number} angle in radian between -Pi and Pi
 */
export const orientation = ({ x, y }: Coordinates): number => {
  const alpha = Math.acos(x / Math.sqrt(x * x + y * y));
  return y > 0 ? alpha : -alpha;
};

/** Returns the unit vector associated to the provided vector,
 * or the Null vector (0, 0) if the vector is null
 */
export const unitVector = (u: Coordinates): Coordinates => {
  const l = norm(u);
  return l > 0 ? times(u, 1 / l) : u;
};

/** Returns the angle from u to v in radian */
export const angle = (u: Coordinates, v: Coordinates, previousAngle = 0) => {
  let sweep = orientation(v) - orientation(u);
  // If the angle has the same sign as the arc orientation, we return the angle as is
  // Otherwise, we need to correct the value, adding or removing 2π
  while (Math.abs(previousAngle - sweep) > Math.PI) {
    sweep += Math.sign(previousAngle - sweep) * 2 * Math.PI;
  }
  return sweep;
};

/** Returns the angle between the lines (BA) and (BC) in radian
 * @returns {number} the angle in radian, between -Pi and Pi
 */
export const angleABC = (
  A: Point,
  B: Point,
  C: Point,
  previousAngle = 0,
): number => angle(vector(B, A), vector(B, C), previousAngle);

/** Rotate the vector by an angle in radian */
export const rotate = (vect: Coordinates, teta: number): Coordinates => {
  const { x, y } = vect;
  const nx = x * Math.cos(teta) - y * Math.sin(teta);
  const ny = y * Math.cos(teta) + x * Math.sin(teta);
  return { x: nx, y: ny };
};
