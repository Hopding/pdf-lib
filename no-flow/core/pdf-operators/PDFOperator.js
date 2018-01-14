'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = require('../../utils');

var _validate = require('../../utils/validate');

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PDFOperator = function PDFOperator() {
  var _this = this;

  _classCallCheck(this, PDFOperator);

  this.is = function (obj) {
    return _this instanceof obj;
  };

  this.toString = function () {
    return (0, _utils.error)('toString() is not implemented on ' + _this.constructor.name);
  };

  this.bytesSize = function () {
    return (0, _utils.error)('bytesSize() is not implemented on ' + _this.constructor.name);
  };

  this.copyBytesInto = function (buffer) {
    return (0, _utils.error)('copyBytesInto() is not implemented on ' + _this.constructor.name);
  };
};

PDFOperator.createSingletonOp = function (op) {
  var ENFORCER = Symbol(op + '_ENFORCER');

  var Singleton = function (_PDFOperator) {
    _inherits(Singleton, _PDFOperator);

    function Singleton(enforcer) {
      _classCallCheck(this, Singleton);

      var _this2 = _possibleConstructorReturn(this, (Singleton.__proto__ || Object.getPrototypeOf(Singleton)).call(this));

      _this2.toString = function () {
        return op + '\n';
      };

      _this2.bytesSize = function () {
        return 2;
      };

      _this2.copyBytesInto = function (buffer) {
        return (0, _utils.addStringToBuffer)(_this2.toString(), buffer);
      };

      (0, _validate.validate)(enforcer, (0, _validate.isIdentity)(ENFORCER), 'Cannot instantiate PDFOperator.' + op + ' - use "' + op + '.operator" instead');
      return _this2;
    }

    return Singleton;
  }(PDFOperator);

  Singleton.operator = new Singleton(ENFORCER);

  return Singleton;
};

exports.default = PDFOperator;