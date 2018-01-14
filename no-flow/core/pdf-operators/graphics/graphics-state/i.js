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
Set the flatness tolerance in the graphics state. flatness is a number in the
range 0 to 100; a value of 0 shall specify the output device’s default flatness
tolerance.
*/
var i = function (_PDFOperator) {
  _inherits(i, _PDFOperator);

  function i(flatness) {
    _classCallCheck(this, i);

    var _this = _possibleConstructorReturn(this, (i.__proto__ || Object.getPrototypeOf(i)).call(this));

    _initialiseProps.call(_this);

    (0, _validate.validate)(flatness, (0, _validate.isInRange)(0, 101), 'i operator arg "flatness" must be a number from 0 to 100.');
    _this.flatness = flatness;
    return _this;
  }

  return i;
}(_PDFOperator3.default);

i.of = function (flatness) {
  return new i(flatness);
};

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.toString = function () {
    return _this2.flatness + ' i\n';
  };

  this.bytesSize = function () {
    return _this2.toString().length;
  };

  this.copyBytesInto = function (buffer) {
    return (0, _utils.addStringToBuffer)(_this2.toString(), buffer);
  };
};

exports.default = i;