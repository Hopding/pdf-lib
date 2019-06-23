import { degreesToRadians } from 'src/api/operators';
import { error } from 'src/utils';

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

export const radians = (radianAngle: number): Radians => ({
  type: RotationTypes.Radians,
  angle: radianAngle,
});

export const degrees = (degreeAngle: number): Degrees => ({
  type: RotationTypes.Degrees,
  angle: degreeAngle,
});

const { Radians, Degrees } = RotationTypes;

// prettier-ignore
export const toRadians = (rotation: Rotation) => 
    rotation.type === Radians ? rotation.angle
  : rotation.type === Degrees ? degreesToRadians(rotation.angle)
  : error(`Invalid rotation: ${JSON.stringify(rotation)}`);
