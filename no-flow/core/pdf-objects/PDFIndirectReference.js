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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var pdfIndirectRefEnforcer = Symbol('PDF_INDIRECT_REF_ENFORCER');
var pdfIndirectRefPool = new Map();

// TODO: Need to error out if obj or gen numbers are manually set!
// eslint-disable-next-line no-unused-vars

var PDFIndirectReference = function (_PDFObject) {
  _inherits(PDFIndirectReference, _PDFObject);

  function PDFIndirectReference(enforcer, objectNumber, generationNumber) {
    _classCallCheck(this, PDFIndirectReference);

    var _this = _possibleConstructorReturn(this, (PDFIndirectReference.__proto__ || Object.getPrototypeOf(PDFIndirectReference)).call(this));

    _initialiseProps.call(_this);

    (0, _validate.validate)(enforcer, (0, _validate.isIdentity)(pdfIndirectRefEnforcer), 'Cannot create PDFIndirectReference via constructor');
    (0, _validate.validate)(objectNumber, _lodash2.default.isNumber, 'objectNumber must be a Number');
    (0, _validate.validate)(generationNumber, _lodash2.default.isNumber, 'generationNumber must be a Number');

    _this.objectNumber = objectNumber;
    _this.generationNumber = generationNumber;
    return _this;
  }

  return PDFIndirectReference;
}(_PDFObject3.default);

PDFIndirectReference.forNumbers = function (objectNumber, generationNumber) {
  var key = objectNumber + ' ' + generationNumber;
  var indirectRef = pdfIndirectRefPool.get(key);
  if (!indirectRef) {
    indirectRef = new PDFIndirectReference(pdfIndirectRefEnforcer, objectNumber, generationNumber);
    pdfIndirectRefPool.set(key, indirectRef);
  }
  return indirectRef;
};

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.toString = function () {
    return _this2.objectNumber + ' ' + _this2.generationNumber + ' R';
  };

  this.bytesSize = function () {
    return _this2.toString().length;
  };

  this.copyBytesInto = function (buffer) {
    return (0, _utils.addStringToBuffer)(_this2.toString(), buffer);
  };
};

exports.default = PDFIndirectReference;