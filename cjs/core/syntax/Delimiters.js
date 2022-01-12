"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsDelimiter = void 0;
var tslib_1 = require("tslib");
var CharCodes_1 = tslib_1.__importDefault(require("./CharCodes"));
exports.IsDelimiter = new Uint8Array(256);
exports.IsDelimiter[CharCodes_1.default.LeftParen] = 1;
exports.IsDelimiter[CharCodes_1.default.RightParen] = 1;
exports.IsDelimiter[CharCodes_1.default.LessThan] = 1;
exports.IsDelimiter[CharCodes_1.default.GreaterThan] = 1;
exports.IsDelimiter[CharCodes_1.default.LeftSquareBracket] = 1;
exports.IsDelimiter[CharCodes_1.default.RightSquareBracket] = 1;
exports.IsDelimiter[CharCodes_1.default.LeftCurly] = 1;
exports.IsDelimiter[CharCodes_1.default.RightCurly] = 1;
exports.IsDelimiter[CharCodes_1.default.ForwardSlash] = 1;
exports.IsDelimiter[CharCodes_1.default.Percent] = 1;
//# sourceMappingURL=Delimiters.js.map