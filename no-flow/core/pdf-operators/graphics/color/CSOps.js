'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cs = exports.CS = undefined;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _PDFOperator3 = require('../../PDFOperator');

var _PDFOperator4 = _interopRequireDefault(_PDFOperator3);

var _utils = require('../../../../utils');

var _validate = require('../../../../utils/validate');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
/* eslint-disable new-cap */


/**
Set the current colour space to use for stroking operations. The operand name
shall be a name object. If the colour space is one that can be specified by a
name and no additional parameters (DeviceGray, DeviceRGB, DeviceCMYK, and
certain cases of Pattern), the name may be specified directly. Otherwise, it
shall be a name defined in the ColorSpace subdictionary of the current resource
dictionary; the associated value shall be an array describing the colour space.

The names DeviceGray, DeviceRGB, DeviceCMYK, and Pattern always identify the
corresponding colour spaces directly; they never refer to resources in the
ColorSpace subdictionary.

The CS operator shall also set the current stroking colour to its initial value,
which depends on the colour space:

In a DeviceGray, DeviceRGB, CalGray, or CalRGB colour space, the initial colour
shall have all components equal to 0.0.

In a DeviceCMYK colour space, the initial colour shall be [0.0 0.0 0.0 1.0].

In a Lab or ICCBased colour space, the initial colour shall have all components
equal to 0.0 unless that falls outside the intervals specified by the space’s
Range entry, in which case the nearest valid value shall be substituted.

In an Indexed colour space, the initial colour value shall be 0.

In a Separation or DeviceN colour space, the initial tint value shall be 1.0 for
all colorants.

In a Pattern colour space, the initial colour shall be a pattern object that
causes nothing to be painted.
*/
var CS = exports.CS = function (_PDFOperator) {
  _inherits(CS, _PDFOperator);

  function CS(name) {
    _classCallCheck(this, CS);

    var _this = _possibleConstructorReturn(this, (CS.__proto__ || Object.getPrototypeOf(CS)).call(this));

    _initialiseProps.call(_this);

    (0, _validate.validate)(name, _lodash2.default.isString, 'CS operator arg "name" must be a string.');
    _this.name = name;
    return _this;
  }

  return CS;
}(_PDFOperator4.default);

/**
Same as CS but used for nonstroking operations.
*/


CS.of = function (name) {
  return new CS(name);
};

var _initialiseProps = function _initialiseProps() {
  var _this3 = this;

  this.toString = function () {
    return _this3.name + ' CS\n';
  };

  this.bytesSize = function () {
    return _this3.toString().length;
  };

  this.copyBytesInto = function (buffer) {
    return (0, _utils.addStringToBuffer)(_this3.toString(), buffer);
  };
};

var cs = exports.cs = function (_PDFOperator2) {
  _inherits(cs, _PDFOperator2);

  function cs(name) {
    _classCallCheck(this, cs);

    var _this2 = _possibleConstructorReturn(this, (cs.__proto__ || Object.getPrototypeOf(cs)).call(this));

    _initialiseProps2.call(_this2);

    (0, _validate.validate)(name, _lodash2.default.isString, 'cs operator arg "name" must be a string.');
    _this2.name = name;
    return _this2;
  }

  return cs;
}(_PDFOperator4.default);

cs.of = function (name) {
  return new cs(name);
};

var _initialiseProps2 = function _initialiseProps2() {
  var _this4 = this;

  this.toString = function () {
    return _this4.name + ' cs\n';
  };

  this.bytesSize = function () {
    return _this4.toString().length;
  };

  this.copyBytesInto = function (buffer) {
    return (0, _utils.addStringToBuffer)(_this4.toString(), buffer);
  };
};