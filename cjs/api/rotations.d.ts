export declare enum RotationTypes {
    Degrees = "degrees",
    Radians = "radians"
}
export interface Radians {
    type: RotationTypes.Radians;
    angle: number;
}
export interface Degrees {
    type: RotationTypes.Degrees;
    angle: number;
}
export declare type Rotation = Radians | Degrees;
export declare const radians: (radianAngle: number) => Radians;
export declare const degrees: (degreeAngle: number) => Degrees;
export declare const degreesToRadians: (degree: number) => number;
export declare const radiansToDegrees: (radian: number) => number;
export declare const toRadians: (rotation: Rotation) => number;
export declare const toDegrees: (rotation: Rotation) => number;
export declare const reduceRotation: (degreeAngle?: number) => 0 | 180 | 90 | 270;
export declare const adjustDimsForRotation: (dims: {
    width: number;
    height: number;
}, degreeAngle?: number) => {
    width: number;
    height: number;
};
export declare const rotateRectangle: (rectangle: {
    x: number;
    y: number;
    width: number;
    height: number;
}, borderWidth?: number, degreeAngle?: number) => {
    x: number;
    y: number;
    width: number;
    height: number;
};
//# sourceMappingURL=rotations.d.ts.map