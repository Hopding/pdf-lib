"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var errors_1 = require("../errors");
var PDFObject_1 = tslib_1.__importDefault(require("./PDFObject"));
var CharCodes_1 = tslib_1.__importDefault(require("../syntax/CharCodes"));
var ENFORCER = {};
var PDFBool = /** @class */ (function (_super) {
    tslib_1.__extends(PDFBool, _super);
    function PDFBool(enforcer, value) {
        var _this = this;
        if (enforcer !== ENFORCER)
            throw new errors_1.PrivateConstructorError('PDFBool');
        _this = _super.call(this) || this;
        _this.value = value;
        return _this;
    }
    PDFBool.prototype.asBoolean = function () {
        return this.value;
    };
    PDFBool.prototype.clone = function () {
        return this;
    };
    PDFBool.prototype.toString = function () {
        return String(this.value);
    };
    PDFBool.prototype.sizeInBytes = function () {
        return this.value ? 4 : 5;
    };
    PDFBool.prototype.copyBytesInto = function (buffer, offset) {
        if (this.value) {
            buffer[offset++] = CharCodes_1.default.t;
            buffer[offset++] = CharCodes_1.default.r;
            buffer[offset++] = CharCodes_1.default.u;
            buffer[offset++] = CharCodes_1.default.e;
            return 4;
        }
        else {
            buffer[offset++] = CharCodes_1.default.f;
            buffer[offset++] = CharCodes_1.default.a;
            buffer[offset++] = CharCodes_1.default.l;
            buffer[offset++] = CharCodes_1.default.s;
            buffer[offset++] = CharCodes_1.default.e;
            return 5;
        }
    };
    PDFBool.True = new PDFBool(ENFORCER, true);
    PDFBool.False = new PDFBool(ENFORCER, false);
    return PDFBool;
}(PDFObject_1.default));
exports.default = PDFBool;
//# sourceMappingURL=PDFBool.js.map