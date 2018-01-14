'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

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
Set the text font, Tf, to font and the text font size, Tfs, to size. font shall
be the name of a font resource in the Font subdictionary of the current resource
dictionary; size shall be a number representing a scale factor. There is no
initial value for either font or size; they shall be specified explicitly by
using Tf before any text is shown.
*/
var Tf = function (_PDFOperator) {
  _inherits(Tf, _PDFOperator);

  function Tf(font, size) {
    _classCallCheck(this, Tf);

    var _this = _possibleConstructorReturn(this, (Tf.__proto__ || Object.getPrototypeOf(Tf)).call(this));

    _initialiseProps.call(_this);

    console.log('FONT: ' + font);
    console.log('SIZE: ' + size);
    (0, _validate.validate)(font, _lodash2.default.isString, 'Tf operator arg "font" must be a string.');
    (0, _validate.validate)(size, _validate.isNumber, 'Tf operator arg "size" must be a number.');
    _this.font = font;
    _this.size = size;
    return _this;
  } // TODO: Should this be a PDFName?


  return Tf;
}(_PDFOperator3.default);

Tf.of = function (font, size) {
  return new Tf(font, size);
};

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.toString = function () {
    return _this2.font + ' ' + _this2.size + ' Tf\n';
  };

  this.bytesSize = function () {
    return _this2.toString().length;
  };

  this.copyBytesInto = function (buffer) {
    return (0, _utils.addStringToBuffer)(_this2.toString(), buffer);
  };
};

exports.default = Tf;