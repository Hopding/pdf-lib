import { assertIs, error } from 'src/utils';

export enum RotationTypes {
  Degrees = 'degrees',
  Radians = 'radians',
}

export interface Radians {
  type: RotationTypes.Radians;
  angle: number;
}

export interface Degrees {
  type: RotationTypes.Degrees;
  angle: number;
}

export type Rotation = Radians | Degrees;

export const radians = (radianAngle: number): Radians => {
  assertIs(radianAngle, 'radianAngle', ['number']);
  return { type: RotationTypes.Radians, angle: radianAngle };
};

export const degrees = (degreeAngle: number): Degrees => {
  assertIs(degreeAngle, 'degreeAngle', ['number']);
  return { type: RotationTypes.Degrees, angle: degreeAngle };
};

const { Radians, Degrees } = RotationTypes;

export const degreesToRadians = (degree: number) => (degree * Math.PI) / 180;
export const radiansToDegrees = (radian: number) => (radian * 180) / Math.PI;

// prettier-ignore
export const toRadians = (rotation: Rotation) => 
    rotation.type === Radians ? rotation.angle
  : rotation.type === Degrees ? degreesToRadians(rotation.angle)
  : error(`Invalid rotation: ${JSON.stringify(rotation)}`);

// prettier-ignore
export const toDegrees = (rotation: Rotation) => 
    rotation.type === Radians ? radiansToDegrees(rotation.angle)
  : rotation.type === Degrees ? rotation.angle
  : error(`Invalid rotation: ${JSON.stringify(rotation)}`);
