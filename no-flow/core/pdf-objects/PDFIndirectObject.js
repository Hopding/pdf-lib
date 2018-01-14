'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = require('../../utils');

var _validate = require('../../utils/validate');

var _PDFObject2 = require('./PDFObject');

var _PDFObject3 = _interopRequireDefault(_PDFObject2);

var _PDFIndirectReference = require('./PDFIndirectReference');

var _PDFIndirectReference2 = _interopRequireDefault(_PDFIndirectReference);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// 55 errors
var PDFIndirectObject = function (_PDFObject) {
  _inherits(PDFIndirectObject, _PDFObject);

  function PDFIndirectObject(pdfObject) {
    _classCallCheck(this, PDFIndirectObject);

    var _this = _possibleConstructorReturn(this, (PDFIndirectObject.__proto__ || Object.getPrototypeOf(PDFIndirectObject)).call(this));

    _initialiseProps.call(_this);

    (0, _validate.validate)(pdfObject, (0, _validate.isInstance)(_PDFObject3.default), 'PDFIndirectObject.pdfObject must be of type PDFObject');
    _this.pdfObject = pdfObject;
    return _this;
  } // "\nendobj\n\n"

  return PDFIndirectObject;
}(_PDFObject3.default);

PDFIndirectObject.of = function (pdfObject) {
  return new PDFIndirectObject(pdfObject);
};

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.setReferenceNumbers = function (objectNumber, generationNumber) {
    (0, _validate.validate)(objectNumber, _lodash2.default.isNumber, 'objectNumber must be a Number');
    (0, _validate.validate)(generationNumber, _lodash2.default.isNumber, 'generationNumber must be a Number');

    _this2.reference = _PDFIndirectReference2.default.forNumbers(objectNumber, generationNumber);
    return _this2;
  };

  this.setReference = function (reference) {
    _this2.reference = reference;
    return _this2;
  };

  this.getReference = function () {
    return _this2.reference;
  };

  this.toReference = function () {
    return _this2.reference.toString();
  };

  this.toString = function () {
    var buffer = new Uint8Array(_this2.bytesSize());
    _this2.copyBytesInto(buffer);
    return (0, _utils.arrayToString)(buffer);
  };

  this.bytesSize = function () {
    return (_this2.reference.objectNumber + ' ' + _this2.reference.generationNumber + ' obj\n').length + _this2.pdfObject.bytesSize() + 9;
  };

  this.copyBytesInto = function (buffer) {
    var remaining = (0, _utils.addStringToBuffer)(_this2.reference.objectNumber + ' ' + _this2.reference.generationNumber + ' obj\n', buffer);
    remaining = _this2.pdfObject.copyBytesInto(remaining);
    remaining = (0, _utils.addStringToBuffer)('\nendobj\n\n', remaining);
    return remaining;
  };
};

exports.default = PDFIndirectObject;