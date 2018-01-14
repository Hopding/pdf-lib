"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PDFObject = function PDFObject() {
  var _this = this;

  _classCallCheck(this, PDFObject);

  this.is = function (obj) {
    return _this instanceof obj;
  };

  this.toString = function () {
    throw new Error("toString() is not implemented on " + _this.constructor.name);
  };

  this.bytesSize = function () {
    throw new Error("bytesSize() is not implemented on " + _this.constructor.name);
  };

  this.copyBytesInto = function (buffer) {
    throw new Error("copyBytesInto() is not implemented on " + _this.constructor.name);
  };
};

exports.default = PDFObject;