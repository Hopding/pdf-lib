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
Set the word spacing, Tw, to wordSpace, which shall be a number expressed in
unscaled text space units. Word spacing shall be used by the Tj, TJ, and '
operators. Initial value: 0.
*/
var Tw = function (_PDFOperator) {
  _inherits(Tw, _PDFOperator);

  function Tw(wordSpace) {
    _classCallCheck(this, Tw);

    var _this = _possibleConstructorReturn(this, (Tw.__proto__ || Object.getPrototypeOf(Tw)).call(this));

    _initialiseProps.call(_this);

    (0, _validate.validate)(wordSpace, _validate.isNumber, 'Tw operator arg "wordSpace" must be a number.');
    _this.wordSpace = wordSpace;
    return _this;
  }

  return Tw;
}(_PDFOperator3.default);

Tw.of = function (wordSpace) {
  return new Tw(wordSpace);
};

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.toString = function () {
    return _this2.wordSpace + ' Tw\n';
  };

  this.bytesSize = function () {
    return _this2.toString().length;
  };

  this.copyBytesInto = function (buffer) {
    return (0, _utils.addStringToBuffer)(_this2.toString(), buffer);
  };
};

exports.default = Tw;