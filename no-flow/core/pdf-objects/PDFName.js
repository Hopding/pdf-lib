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

var pdfNameEnforcer = Symbol('PDF_NAME_ENFORCER');
var pdfNamePool = new Map();

var PDFName = function (_PDFObject) {
  _inherits(PDFName, _PDFObject);

  function PDFName(enforcer, key) {
    _classCallCheck(this, PDFName);

    var _this = _possibleConstructorReturn(this, (PDFName.__proto__ || Object.getPrototypeOf(PDFName)).call(this));

    _this.toString = function () {
      return ('/' + _this.key).replace('#', '#23').split('').map(function (char) {
        return PDFName.isRegularChar(char) ? char : '#' + (0, _utils.charCode)(char).toString(16);
      }).join('');
    };

    _this.bytesSize = function () {
      return _this.toString().length;
    };

    _this.copyBytesInto = function (buffer) {
      return (0, _utils.addStringToBuffer)(_this.toString(), buffer);
    };

    (0, _validate.validate)(enforcer, (0, _validate.isIdentity)(pdfNameEnforcer), 'Cannot create PDFName via constructor');
    (0, _validate.validate)(key.charAt(0), (0, _utils.and)((0, _validate.isNotIdentity)(' '), (0, _validate.isNotIdentity)('/')), 'PDF Name objects may not begin with a space character.');
    _this.key = key;
    return _this;
  }

  return PDFName;
}(_PDFObject3.default);

PDFName.isRegularChar = function (char) {
  return (0, _utils.charCode)(char) >= (0, _utils.charCode)('!') && (0, _utils.charCode)(char) <= (0, _utils.charCode)('~');
};

PDFName.from = function (str) {
  (0, _validate.validate)(str, _lodash2.default.isString, 'PDFName.from() requires string as argument');

  if (str.charCodeAt(0) === '/') console.log('str: "' + str.charCodeAt(0) + '"');

  var pdfName = pdfNamePool.get(str);
  if (!pdfName) {
    pdfName = new PDFName(pdfNameEnforcer, str);
    pdfNamePool.set(str, pdfName);
  }
  return pdfName;
};

exports.default = PDFName;