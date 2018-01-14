'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _PDFDictionary2 = require('../pdf-objects/PDFDictionary');

var _PDFDictionary3 = _interopRequireDefault(_PDFDictionary2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PDFLinearizationParams = function (_PDFDictionary) {
  _inherits(PDFLinearizationParams, _PDFDictionary);

  function PDFLinearizationParams() {
    _classCallCheck(this, PDFLinearizationParams);

    return _possibleConstructorReturn(this, (PDFLinearizationParams.__proto__ || Object.getPrototypeOf(PDFLinearizationParams)).apply(this, arguments));
  }

  return PDFLinearizationParams;
}(_PDFDictionary3.default);

PDFLinearizationParams.validKeys = Object.freeze(['L', 'H', 'O', 'E', 'N', 'T', 'P']);

PDFLinearizationParams.from = function (object) {
  return new PDFLinearizationParams(object, PDFLinearizationParams.validKeys);
};

exports.default = PDFLinearizationParams;