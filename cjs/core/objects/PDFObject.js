"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var errors_1 = require("../errors");
var PDFObject = /** @class */ (function () {
    function PDFObject() {
    }
    PDFObject.prototype.clone = function (_context) {
        throw new errors_1.MethodNotImplementedError(this.constructor.name, 'clone');
    };
    PDFObject.prototype.toString = function () {
        throw new errors_1.MethodNotImplementedError(this.constructor.name, 'toString');
    };
    PDFObject.prototype.sizeInBytes = function () {
        throw new errors_1.MethodNotImplementedError(this.constructor.name, 'sizeInBytes');
    };
    PDFObject.prototype.copyBytesInto = function (_buffer, _offset) {
        throw new errors_1.MethodNotImplementedError(this.constructor.name, 'copyBytesInto');
    };
    return PDFObject;
}());
exports.default = PDFObject;
//# sourceMappingURL=PDFObject.js.map