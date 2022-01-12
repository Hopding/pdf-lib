"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rotateRectangle = exports.adjustDimsForRotation = exports.reduceRotation = exports.toDegrees = exports.toRadians = exports.radiansToDegrees = exports.degreesToRadians = exports.degrees = exports.radians = exports.RotationTypes = void 0;
var utils_1 = require("../utils");
var RotationTypes;
(function (RotationTypes) {
    RotationTypes["Degrees"] = "degrees";
    RotationTypes["Radians"] = "radians";
})(RotationTypes = exports.RotationTypes || (exports.RotationTypes = {}));
exports.radians = function (radianAngle) {
    utils_1.assertIs(radianAngle, 'radianAngle', ['number']);
    return { type: RotationTypes.Radians, angle: radianAngle };
};
exports.degrees = function (degreeAngle) {
    utils_1.assertIs(degreeAngle, 'degreeAngle', ['number']);
    return { type: RotationTypes.Degrees, angle: degreeAngle };
};
var Radians = RotationTypes.Radians, Degrees = RotationTypes.Degrees;
exports.degreesToRadians = function (degree) { return (degree * Math.PI) / 180; };
exports.radiansToDegrees = function (radian) { return (radian * 180) / Math.PI; };
// prettier-ignore
exports.toRadians = function (rotation) {
    return rotation.type === Radians ? rotation.angle
        : rotation.type === Degrees ? exports.degreesToRadians(rotation.angle)
            : utils_1.error("Invalid rotation: " + JSON.stringify(rotation));
};
// prettier-ignore
exports.toDegrees = function (rotation) {
    return rotation.type === Radians ? exports.radiansToDegrees(rotation.angle)
        : rotation.type === Degrees ? rotation.angle
            : utils_1.error("Invalid rotation: " + JSON.stringify(rotation));
};
exports.reduceRotation = function (degreeAngle) {
    if (degreeAngle === void 0) { degreeAngle = 0; }
    var quadrants = (degreeAngle / 90) % 4;
    if (quadrants === 0)
        return 0;
    if (quadrants === 1)
        return 90;
    if (quadrants === 2)
        return 180;
    if (quadrants === 3)
        return 270;
    return 0; // `degreeAngle` is not a multiple of 90
};
exports.adjustDimsForRotation = function (dims, degreeAngle) {
    if (degreeAngle === void 0) { degreeAngle = 0; }
    var rotation = exports.reduceRotation(degreeAngle);
    return rotation === 90 || rotation === 270
        ? { width: dims.height, height: dims.width }
        : { width: dims.width, height: dims.height };
};
exports.rotateRectangle = function (rectangle, borderWidth, degreeAngle) {
    if (borderWidth === void 0) { borderWidth = 0; }
    if (degreeAngle === void 0) { degreeAngle = 0; }
    var x = rectangle.x, y = rectangle.y, w = rectangle.width, h = rectangle.height;
    var r = exports.reduceRotation(degreeAngle);
    var b = borderWidth / 2;
    // prettier-ignore
    if (r === 0)
        return { x: x - b, y: y - b, width: w, height: h };
    else if (r === 90)
        return { x: x - h + b, y: y - b, width: h, height: w };
    else if (r === 180)
        return { x: x - w + b, y: y - h + b, width: w, height: h };
    else if (r === 270)
        return { x: x - b, y: y - w + b, width: h, height: w };
    else
        return { x: x - b, y: y - b, width: w, height: h };
};
//# sourceMappingURL=rotations.js.map