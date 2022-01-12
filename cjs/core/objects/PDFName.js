"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var errors_1 = require("../errors");
var PDFObject_1 = tslib_1.__importDefault(require("./PDFObject"));
var CharCodes_1 = tslib_1.__importDefault(require("../syntax/CharCodes"));
var Irregular_1 = require("../syntax/Irregular");
var utils_1 = require("../../utils");
var decodeName = function (name) {
    return name.replace(/#([\dABCDEF]{2})/g, function (_, hex) { return utils_1.charFromHexCode(hex); });
};
var isRegularChar = function (charCode) {
    return charCode >= CharCodes_1.default.ExclamationPoint &&
        charCode <= CharCodes_1.default.Tilde &&
        !Irregular_1.IsIrregular[charCode];
};
var ENFORCER = {};
var pool = new Map();
var PDFName = /** @class */ (function (_super) {
    tslib_1.__extends(PDFName, _super);
    function PDFName(enforcer, name) {
        var _this = this;
        if (enforcer !== ENFORCER)
            throw new errors_1.PrivateConstructorError('PDFName');
        _this = _super.call(this) || this;
        var encodedName = '/';
        for (var idx = 0, len = name.length; idx < len; idx++) {
            var character = name[idx];
            var code = utils_1.toCharCode(character);
            encodedName += isRegularChar(code) ? character : "#" + utils_1.toHexString(code);
        }
        _this.encodedName = encodedName;
        return _this;
    }
    PDFName.prototype.asBytes = function () {
        var bytes = [];
        var hex = '';
        var escaped = false;
        var pushByte = function (byte) {
            if (byte !== undefined)
                bytes.push(byte);
            escaped = false;
        };
        for (var idx = 1, len = this.encodedName.length; idx < len; idx++) {
            var char = this.encodedName[idx];
            var byte = utils_1.toCharCode(char);
            var nextChar = this.encodedName[idx + 1];
            if (!escaped) {
                if (byte === CharCodes_1.default.Hash)
                    escaped = true;
                else
                    pushByte(byte);
            }
            else {
                if ((byte >= CharCodes_1.default.Zero && byte <= CharCodes_1.default.Nine) ||
                    (byte >= CharCodes_1.default.a && byte <= CharCodes_1.default.f) ||
                    (byte >= CharCodes_1.default.A && byte <= CharCodes_1.default.F)) {
                    hex += char;
                    if (hex.length === 2 ||
                        !((nextChar >= '0' && nextChar <= '9') ||
                            (nextChar >= 'a' && nextChar <= 'f') ||
                            (nextChar >= 'A' && nextChar <= 'F'))) {
                        pushByte(parseInt(hex, 16));
                        hex = '';
                    }
                }
                else {
                    pushByte(byte);
                }
            }
        }
        return new Uint8Array(bytes);
    };
    // TODO: This should probably use `utf8Decode()`
    // TODO: Polyfill Array.from?
    PDFName.prototype.decodeText = function () {
        var bytes = this.asBytes();
        return String.fromCharCode.apply(String, Array.from(bytes));
    };
    PDFName.prototype.asString = function () {
        return this.encodedName;
    };
    /** @deprecated in favor of [[PDFName.asString]] */
    PDFName.prototype.value = function () {
        return this.encodedName;
    };
    PDFName.prototype.clone = function () {
        return this;
    };
    PDFName.prototype.toString = function () {
        return this.encodedName;
    };
    PDFName.prototype.sizeInBytes = function () {
        return this.encodedName.length;
    };
    PDFName.prototype.copyBytesInto = function (buffer, offset) {
        offset += utils_1.copyStringIntoBuffer(this.encodedName, buffer, offset);
        return this.encodedName.length;
    };
    PDFName.of = function (name) {
        var decodedValue = decodeName(name);
        var instance = pool.get(decodedValue);
        if (!instance) {
            instance = new PDFName(ENFORCER, decodedValue);
            pool.set(decodedValue, instance);
        }
        return instance;
    };
    /* tslint:disable member-ordering */
    PDFName.Length = PDFName.of('Length');
    PDFName.FlateDecode = PDFName.of('FlateDecode');
    PDFName.Resources = PDFName.of('Resources');
    PDFName.Font = PDFName.of('Font');
    PDFName.XObject = PDFName.of('XObject');
    PDFName.ExtGState = PDFName.of('ExtGState');
    PDFName.Contents = PDFName.of('Contents');
    PDFName.Type = PDFName.of('Type');
    PDFName.Parent = PDFName.of('Parent');
    PDFName.MediaBox = PDFName.of('MediaBox');
    PDFName.Page = PDFName.of('Page');
    PDFName.Annots = PDFName.of('Annots');
    PDFName.TrimBox = PDFName.of('TrimBox');
    PDFName.ArtBox = PDFName.of('ArtBox');
    PDFName.BleedBox = PDFName.of('BleedBox');
    PDFName.CropBox = PDFName.of('CropBox');
    PDFName.Rotate = PDFName.of('Rotate');
    PDFName.Title = PDFName.of('Title');
    PDFName.Author = PDFName.of('Author');
    PDFName.Subject = PDFName.of('Subject');
    PDFName.Creator = PDFName.of('Creator');
    PDFName.Keywords = PDFName.of('Keywords');
    PDFName.Producer = PDFName.of('Producer');
    PDFName.CreationDate = PDFName.of('CreationDate');
    PDFName.ModDate = PDFName.of('ModDate');
    return PDFName;
}(PDFObject_1.default));
exports.default = PDFName;
//# sourceMappingURL=PDFName.js.map