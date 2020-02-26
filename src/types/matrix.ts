/**
 * A transformation matrix according to section `8.3.3 Common Transformations`
 * of the PDF specification (page 117).
 *
 * To cite from the spec:
 *
 *   * Translations shall be specified as `[1 0 0 1 tx ty]`, where `tx` and
 *     `ty` shall be the distances to translate the origin of the coordinate
 *     system in the horizontal and vertical dimensions, respectively.
 *   * Scaling shall be obtained by `[sx 0 0 sy 0 0]`. This scales the
 *     coordinates so that 1 unit in the horizontal and vertical dimensions of
 *     the new coordinate system is the same size as `sx` and `sy` units,
 *     respectively, in the previous coordinate system.
 *   * Rotations shall be produced by `[cos(q) sin(q) -sin(q) cos(q) 0 0]`,
 *     which has the effect of rotating the coordinate system axes by an angle
 *     `q` counter clockwise.
 *   * Skew shall be specified by `[1 tan(a) tan(b) 1 0 0]`, which skews the
 *     x-axis by an angle `a` and the y axis by an angle `b`.
 */
export type TransformationMatrix = [
  number,
  number,
  number,
  number,
  number,
  number,
];

export const identityMatrix: TransformationMatrix = [1, 0, 0, 1, 0, 0];
