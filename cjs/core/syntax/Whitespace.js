"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsWhitespace = void 0;
var tslib_1 = require("tslib");
var CharCodes_1 = tslib_1.__importDefault(require("./CharCodes"));
exports.IsWhitespace = new Uint8Array(256);
exports.IsWhitespace[CharCodes_1.default.Null] = 1;
exports.IsWhitespace[CharCodes_1.default.Tab] = 1;
exports.IsWhitespace[CharCodes_1.default.Newline] = 1;
exports.IsWhitespace[CharCodes_1.default.FormFeed] = 1;
exports.IsWhitespace[CharCodes_1.default.CarriageReturn] = 1;
exports.IsWhitespace[CharCodes_1.default.Space] = 1;
//# sourceMappingURL=Whitespace.js.map