'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _PDFOperator2 = require('../../PDFOperator');

var _PDFOperator3 = _interopRequireDefault(_PDFOperator2);

var _utils = require('../../../../utils');

var _validate = require('../../../../utils/validate');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
/* eslint-disable new-cap */


/**
Set the colour rendering intent in the graphics state. The rendering intent
must be one of the following values:
 * AbsoluteColorimetric
 * RelativeColorimetric
 * Saturation
 * Perceptual
*/
var ri = function (_PDFOperator) {
  _inherits(ri, _PDFOperator);

  function ri(intent) {
    _classCallCheck(this, ri);

    var _this = _possibleConstructorReturn(this, (ri.__proto__ || Object.getPrototypeOf(ri)).call(this));

    _initialiseProps.call(_this);

    (0, _validate.validate)(intent, (0, _validate.oneOf)('AbsoluteColorimetric', 'RelativeColorimetric', 'Saturation', 'Perceptual'), 'ri operator arg "intent" must be one of: "AbsoluteColorimetric", ' + '"RelativeColorimetric", "Saturation", "Perceptual"');
    _this.intent = intent;
    return _this;
  }

  return ri;
}(_PDFOperator3.default);

ri.of = function (intent) {
  return new ri(intent);
};

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.toString = function () {
    return _this2.intent + ' ri\n';
  };

  this.bytesSize = function () {
    return _this2.toString().length;
  };

  this.copyBytesInto = function (buffer) {
    return (0, _utils.addStringToBuffer)(_this2.toString(), buffer);
  };
};

exports.default = ri;