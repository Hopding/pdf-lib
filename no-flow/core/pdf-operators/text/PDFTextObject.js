'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _PDFOperator2 = require('../PDFOperator');

var _PDFOperator3 = _interopRequireDefault(_PDFOperator2);

var _utils = require('../../../utils');

var _validate = require('../../../utils/validate');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
/* eslint-disable class-methods-use-this */
/* eslint-disable getter-return */


// TODO: Validate that only valid text operators are passed to this object.
var PDFTextObject = function (_PDFOperator) {
  _inherits(PDFTextObject, _PDFOperator);

  function PDFTextObject() {
    _classCallCheck(this, PDFTextObject);

    var _this = _possibleConstructorReturn(this, (PDFTextObject.__proto__ || Object.getPrototypeOf(PDFTextObject)).call(this));

    _initialiseProps.call(_this);

    for (var _len = arguments.length, operators = Array(_len), _key = 0; _key < _len; _key++) {
      operators[_key] = arguments[_key];
    }

    PDFTextObject.validateOperators(operators);
    _this.operators = operators;
    return _this;
  } // "ET\n"

  return PDFTextObject;
}(_PDFOperator3.default);

PDFTextObject.of = function () {
  for (var _len2 = arguments.length, operators = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    operators[_key2] = arguments[_key2];
  }

  return new (Function.prototype.bind.apply(PDFTextObject, [null].concat(_toConsumableArray(operators))))();
};

PDFTextObject.validateOperators = function (elements) {
  return (0, _validate.validateArr)(elements, (0, _validate.isInstance)(_PDFOperator3.default), 'only PDFOperators can be pushed to a PDFTextObject');
};

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.operatorsBytesSize = function () {
    return (0, _lodash2.default)(_this2.operators).filter(Boolean).map(function (op) {
      return op.bytesSize();
    }).sum();
  };

  this.bytesSize = function () {
    return 3 + // "BT\n"
    _this2.operatorsBytesSize() + 3;
  };

  this.copyBytesInto = function (buffer) {
    var remaining = (0, _utils.addStringToBuffer)('BT\n', buffer);

    remaining = _this2.operators.filter(Boolean).reduce(function (remBytes, op) {
      return op.copyBytesInto(remBytes);
    }, remaining);

    remaining = (0, _utils.addStringToBuffer)('ET\n', remaining);
    return remaining;
  };
};

exports.default = PDFTextObject;