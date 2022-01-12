"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rectanglesAreEqual = exports.isStandardFont = exports.StandardFontValues = exports.values = void 0;
var standard_fonts_1 = require("@pdf-lib/standard-fonts");
exports.values = function (obj) { return Object.keys(obj).map(function (k) { return obj[k]; }); };
exports.StandardFontValues = exports.values(standard_fonts_1.FontNames);
exports.isStandardFont = function (input) {
    return exports.StandardFontValues.includes(input);
};
exports.rectanglesAreEqual = function (a, b) { return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height; };
//# sourceMappingURL=objects.js.map