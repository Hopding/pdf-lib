'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.scn = exports.SCN = undefined;

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
Same as SC but also supports Pattern, Separation, DeviceN and ICCBased colour
spaces.

If the current stroking colour space is a Separation, DeviceN, or ICCBased
colour space, the operands c1...cn shall be numbers. The number of operands and
their interpretation depends on the colour space.

If the current stroking colour space is a Pattern colour space, name shall be
the name of an entry in the Pattern subdictionary of the current resource
dictionary. For an uncoloured tiling pattern
(PatternType = 1 and PaintType = 2), c1...cn
shall be component values specifying a colour in the pattern’s underlying colour
space. For other types of patterns, these operands shall not be specified.
*/
var SCN = exports.SCN = function (_PDFOperator) {
  _inherits(SCN, _PDFOperator);

  function SCN(c, name) {
    _classCallCheck(this, SCN);

    var _this = _possibleConstructorReturn(this, (SCN.__proto__ || Object.getPrototypeOf(SCN)).call(this));

    _initialiseProps.call(_this);

    (0, _validate.validateArr)(c, _validate.isNumber, 'SCN operator args "c" must be all be numbers.');
    (0, _validate.validate)(name, (0, _utils.and)(_lodash2.default.isString, (0, _utils.not)(_lodash2.default.isNil)), 'SCN operator args "c" must be all be numbers.');
    _this.c = c;
    _this.name = name;
    return _this;
  }

  return SCN;
}(_PDFOperator4.default);

/**
Same as SCN but used for nonstroking operations.
*/


SCN.of = function (c, name) {
  return new SCN(c, name);
};

var _initialiseProps = function _initialiseProps() {
  var _this3 = this;

  this.toString = function () {
    return _this3.c.join(' ') + ' ' + (_this3.name ? _this3.name + ' ' : '') + ' SCN\n';
  };

  this.bytesSize = function () {
    return _this3.toString().length;
  };

  this.copyBytesInto = function (buffer) {
    return (0, _utils.addStringToBuffer)(_this3.toString(), buffer);
  };
};

var scn = exports.scn = function (_PDFOperator2) {
  _inherits(scn, _PDFOperator2);

  function scn(c, name) {
    _classCallCheck(this, scn);

    var _this2 = _possibleConstructorReturn(this, (scn.__proto__ || Object.getPrototypeOf(scn)).call(this));

    _initialiseProps2.call(_this2);

    (0, _validate.validateArr)(c, _validate.isNumber, 'scn operator args "c" must be all be numbers.');
    (0, _validate.validate)(name, (0, _utils.and)(_lodash2.default.isString, (0, _utils.not)(_lodash2.default.isNil)), 'scn operator args "c" must be all be numbers.');
    _this2.c = c;
    _this2.name = name;
    return _this2;
  }

  return scn;
}(_PDFOperator4.default);

scn.of = function (c, name) {
  return new scn(c, name);
};

var _initialiseProps2 = function _initialiseProps2() {
  var _this4 = this;

  this.toString = function () {
    return _this4.c.join(' ') + ' ' + (_this4.name ? _this4.name + ' ' : '') + ' scn\n';
  };

  this.bytesSize = function () {
    return _this4.toString().length;
  };

  this.copyBytesInto = function (buffer) {
    return (0, _utils.addStringToBuffer)(_this4.toString(), buffer);
  };
};