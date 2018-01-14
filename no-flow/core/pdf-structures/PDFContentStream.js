'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _PDFOperator = require('../pdf-operators/PDFOperator');

var _PDFOperator2 = _interopRequireDefault(_PDFOperator);

var _pdfObjects = require('../pdf-objects');

var _utils = require('../../utils');

var _proxies = require('../../utils/proxies');

var _validate = require('../../utils/validate');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
/* eslint-disable class-methods-use-this */
/* eslint-disable getter-return */


var PDFContentStream = function (_PDFStream) {
  _inherits(PDFContentStream, _PDFStream);

  function PDFContentStream() {
    _classCallCheck(this, PDFContentStream);

    var _this = _possibleConstructorReturn(this, (PDFContentStream.__proto__ || Object.getPrototypeOf(PDFContentStream)).call(this));

    _initialiseProps.call(_this);

    for (var _len = arguments.length, operators = Array(_len), _key = 0; _key < _len; _key++) {
      operators[_key] = arguments[_key];
    }

    PDFContentStream.validateOperators(operators);

    _this.operators = (0, _proxies.typedArrayProxy)(operators, _PDFOperator2.default, {
      set: function set(property) {
        if (_lodash2.default.isNumber(Number(property))) {
          _this.dictionary.get('Length').number = _this.operatorsBytesSize();
        }
      }
    });

    _this.dictionary.set('Length', _pdfObjects.PDFNumber.fromNumber(_this.operatorsBytesSize()));
    return _this;
  } // \nendstream

  return PDFContentStream;
}(_pdfObjects.PDFStream);

PDFContentStream.of = function () {
  for (var _len2 = arguments.length, operators = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    operators[_key2] = arguments[_key2];
  }

  return new (Function.prototype.bind.apply(PDFContentStream, [null].concat(_toConsumableArray(operators))))();
};

PDFContentStream.validateOperators = function (elements) {
  return (0, _validate.validateArr)(elements, (0, _validate.isInstance)(_PDFOperator2.default), 'only PDFOperators can be pushed to a PDFContentStream');
};

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.operatorsBytesSize = function () {
    return (0, _lodash2.default)(_this2.operators).filter(Boolean).map(function (op) {
      return op.bytesSize();
    }).sum();
  };

  this.bytesSize = function () {
    return _this2.dictionary.bytesSize() + 1 + // "\n"
    7 + // "stream\n"
    _this2.operatorsBytesSize() + 10;
  };

  this.copyBytesInto = function (buffer) {
    _this2.validateDictionary();
    var remaining = _this2.dictionary.copyBytesInto(buffer);
    remaining = (0, _utils.addStringToBuffer)('\nstream\n', remaining);

    remaining = _this2.operators.filter(Boolean).reduce(function (remBytes, op) {
      return op.copyBytesInto(remBytes);
    }, remaining);

    remaining = (0, _utils.addStringToBuffer)('\nendstream', remaining);
    return remaining;
  };
};

exports.default = PDFContentStream;