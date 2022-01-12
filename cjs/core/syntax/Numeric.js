"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsNumeric = exports.IsNumericPrefix = exports.IsDigit = void 0;
var tslib_1 = require("tslib");
var CharCodes_1 = tslib_1.__importDefault(require("./CharCodes"));
exports.IsDigit = new Uint8Array(256);
exports.IsDigit[CharCodes_1.default.Zero] = 1;
exports.IsDigit[CharCodes_1.default.One] = 1;
exports.IsDigit[CharCodes_1.default.Two] = 1;
exports.IsDigit[CharCodes_1.default.Three] = 1;
exports.IsDigit[CharCodes_1.default.Four] = 1;
exports.IsDigit[CharCodes_1.default.Five] = 1;
exports.IsDigit[CharCodes_1.default.Six] = 1;
exports.IsDigit[CharCodes_1.default.Seven] = 1;
exports.IsDigit[CharCodes_1.default.Eight] = 1;
exports.IsDigit[CharCodes_1.default.Nine] = 1;
exports.IsNumericPrefix = new Uint8Array(256);
exports.IsNumericPrefix[CharCodes_1.default.Period] = 1;
exports.IsNumericPrefix[CharCodes_1.default.Plus] = 1;
exports.IsNumericPrefix[CharCodes_1.default.Minus] = 1;
exports.IsNumeric = new Uint8Array(256);
for (var idx = 0, len = 256; idx < len; idx++) {
    exports.IsNumeric[idx] = exports.IsDigit[idx] || exports.IsNumericPrefix[idx] ? 1 : 0;
}
//# sourceMappingURL=Numeric.js.map