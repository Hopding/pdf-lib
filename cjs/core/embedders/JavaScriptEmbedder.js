"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var PDFHexString_1 = tslib_1.__importDefault(require("../objects/PDFHexString"));
var JavaScriptEmbedder = /** @class */ (function () {
    function JavaScriptEmbedder(script, scriptName) {
        this.script = script;
        this.scriptName = scriptName;
    }
    JavaScriptEmbedder.for = function (script, scriptName) {
        return new JavaScriptEmbedder(script, scriptName);
    };
    JavaScriptEmbedder.prototype.embedIntoContext = function (context, ref) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var jsActionDict;
            return tslib_1.__generator(this, function (_a) {
                jsActionDict = context.obj({
                    Type: 'Action',
                    S: 'JavaScript',
                    JS: PDFHexString_1.default.fromText(this.script),
                });
                if (ref) {
                    context.assign(ref, jsActionDict);
                    return [2 /*return*/, ref];
                }
                else {
                    return [2 /*return*/, context.register(jsActionDict)];
                }
                return [2 /*return*/];
            });
        });
    };
    return JavaScriptEmbedder;
}());
exports.default = JavaScriptEmbedder;
//# sourceMappingURL=JavaScriptEmbedder.js.map