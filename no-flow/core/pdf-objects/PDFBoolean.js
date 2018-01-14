'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _PDFObject2 = require('./PDFObject');

var _PDFObject3 = _interopRequireDefault(_PDFObject2);

var _utils = require('../../utils');

var _validate = require('../../utils/validate');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PDFBoolean = function (_PDFObject) {
  _inherits(PDFBoolean, _PDFObject);

  function PDFBoolean(boolean) {
    _classCallCheck(this, PDFBoolean);

    var _this = _possibleConstructorReturn(this, (PDFBoolean.__proto__ || Object.getPrototypeOf(PDFBoolean)).call(this));

    _this.toString = function () {
      return _this.boolean.toString();
    };

    _this.bytesSize = function () {
      return _this.toString().length;
    };

    _this.copyBytesInto = function (buffer) {
      return (0, _utils.addStringToBuffer)(_this.toString(), buffer);
    };

    (0, _validate.validate)(boolean, _lodash2.default.isBoolean, 'Can only construct PDFBooleans from Booleans');
    _this.boolean = boolean;
    return _this;
  }

  return PDFBoolean;
}(_PDFObject3.default);

PDFBoolean.fromBool = function (bool) {
  return new PDFBoolean(bool);
};

PDFBoolean.fromString = function (boolStr) {
  return new PDFBoolean((0, _utils.toBoolean)(boolStr));
};

exports.default = PDFBoolean;