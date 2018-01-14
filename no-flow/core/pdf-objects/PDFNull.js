'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _PDFObject2 = require('./PDFObject');

var _PDFObject3 = _interopRequireDefault(_PDFObject2);

var _utils = require('../../utils');

var _validate = require('../../utils/validate');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PDF_NULL_ENFORCER = Symbol('PDF_NULL_ENFORCER');

var PDFNull = function (_PDFObject) {
  _inherits(PDFNull, _PDFObject);

  function PDFNull(enforcer) {
    _classCallCheck(this, PDFNull);

    var _this = _possibleConstructorReturn(this, (PDFNull.__proto__ || Object.getPrototypeOf(PDFNull)).call(this));

    _this.toString = function () {
      return 'null';
    };

    _this.bytesSize = function () {
      return 4;
    };

    _this.copyBytesInto = function (buffer) {
      return (0, _utils.addStringToBuffer)('null', buffer);
    };

    (0, _validate.validate)(enforcer, (0, _validate.isIdentity)(PDF_NULL_ENFORCER), 'Cannot create new PDFNull objects - use PDFNull.instance');
    return _this;
  }

  return PDFNull;
}(_PDFObject3.default);

PDFNull.instance = new PDFNull(PDF_NULL_ENFORCER);
exports.default = PDFNull;