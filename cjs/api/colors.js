"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.colorToComponents = exports.componentsToColor = exports.setStrokingColor = exports.setFillingColor = exports.cmyk = exports.rgb = exports.grayscale = exports.ColorTypes = void 0;
var operators_1 = require("./operators");
var utils_1 = require("../utils");
var ColorTypes;
(function (ColorTypes) {
    ColorTypes["Grayscale"] = "Grayscale";
    ColorTypes["RGB"] = "RGB";
    ColorTypes["CMYK"] = "CMYK";
})(ColorTypes = exports.ColorTypes || (exports.ColorTypes = {}));
exports.grayscale = function (gray) {
    utils_1.assertRange(gray, 'gray', 0.0, 1.0);
    return { type: ColorTypes.Grayscale, gray: gray };
};
exports.rgb = function (red, green, blue) {
    utils_1.assertRange(red, 'red', 0, 1);
    utils_1.assertRange(green, 'green', 0, 1);
    utils_1.assertRange(blue, 'blue', 0, 1);
    return { type: ColorTypes.RGB, red: red, green: green, blue: blue };
};
exports.cmyk = function (cyan, magenta, yellow, key) {
    utils_1.assertRange(cyan, 'cyan', 0, 1);
    utils_1.assertRange(magenta, 'magenta', 0, 1);
    utils_1.assertRange(yellow, 'yellow', 0, 1);
    utils_1.assertRange(key, 'key', 0, 1);
    return { type: ColorTypes.CMYK, cyan: cyan, magenta: magenta, yellow: yellow, key: key };
};
var Grayscale = ColorTypes.Grayscale, RGB = ColorTypes.RGB, CMYK = ColorTypes.CMYK;
// prettier-ignore
exports.setFillingColor = function (color) {
    return color.type === Grayscale ? operators_1.setFillingGrayscaleColor(color.gray)
        : color.type === RGB ? operators_1.setFillingRgbColor(color.red, color.green, color.blue)
            : color.type === CMYK ? operators_1.setFillingCmykColor(color.cyan, color.magenta, color.yellow, color.key)
                : utils_1.error("Invalid color: " + JSON.stringify(color));
};
// prettier-ignore
exports.setStrokingColor = function (color) {
    return color.type === Grayscale ? operators_1.setStrokingGrayscaleColor(color.gray)
        : color.type === RGB ? operators_1.setStrokingRgbColor(color.red, color.green, color.blue)
            : color.type === CMYK ? operators_1.setStrokingCmykColor(color.cyan, color.magenta, color.yellow, color.key)
                : utils_1.error("Invalid color: " + JSON.stringify(color));
};
// prettier-ignore
exports.componentsToColor = function (comps, scale) {
    if (scale === void 0) { scale = 1; }
    return ((comps === null || comps === void 0 ? void 0 : comps.length) === 1 ? exports.grayscale(comps[0] * scale)
        : (comps === null || comps === void 0 ? void 0 : comps.length) === 3 ? exports.rgb(comps[0] * scale, comps[1] * scale, comps[2] * scale)
            : (comps === null || comps === void 0 ? void 0 : comps.length) === 4 ? exports.cmyk(comps[0] * scale, comps[1] * scale, comps[2] * scale, comps[3] * scale)
                : undefined);
};
// prettier-ignore
exports.colorToComponents = function (color) {
    return color.type === Grayscale ? [color.gray]
        : color.type === RGB ? [color.red, color.green, color.blue]
            : color.type === CMYK ? [color.cyan, color.magenta, color.yellow, color.key]
                : utils_1.error("Invalid color: " + JSON.stringify(color));
};
//# sourceMappingURL=colors.js.map