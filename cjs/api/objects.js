"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asNumber = exports.asPDFNumber = exports.asPDFName = void 0;
var core_1 = require("../core");
exports.asPDFName = function (name) {
    return name instanceof core_1.PDFName ? name : core_1.PDFName.of(name);
};
exports.asPDFNumber = function (num) {
    return num instanceof core_1.PDFNumber ? num : core_1.PDFNumber.of(num);
};
exports.asNumber = function (num) {
    return num instanceof core_1.PDFNumber ? num.asNumber() : num;
};
//# sourceMappingURL=objects.js.map