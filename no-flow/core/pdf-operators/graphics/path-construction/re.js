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
Append a rectangle to the current path as a complete subpath, with lower-left
corner (x, y) and dimensions width and height in user space. The operation
`x y width height re` is equivalent to
```
x y m
(x + width) y l
(x + width) (y + height) l
x (y + height) l
h
```
*/
var re = function (_PDFOperator) {
  _inherits(re, _PDFOperator);

  function re(x, y, width, height) {
    _classCallCheck(this, re);

    var _this = _possibleConstructorReturn(this, (re.__proto__ || Object.getPrototypeOf(re)).call(this));

    _initialiseProps.call(_this);

    (0, _validate.validate)(x, _validate.isNumber, 're operator arg "x" must be a number.');
    (0, _validate.validate)(y, _validate.isNumber, 're operator arg "y" must be a number.');
    (0, _validate.validate)(width, _validate.isNumber, 're operator arg "width" must be a number.');
    (0, _validate.validate)(height, _validate.isNumber, 're operator arg "height" must be a number.');
    _this.x = x;
    _this.y = y;
    _this.width = width;
    _this.height = height;
    return _this;
  }

  return re;
}(_PDFOperator3.default);

re.of = function (x, y, width, height) {
  return new re(x, y, width, height);
};

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.toString = function () {
    return _this2.x + ' ' + _this2.y + ' ' + _this2.width + ' ' + _this2.height + ' re\n';
  };

  this.bytesSize = function () {
    return _this2.toString().length;
  };

  this.copyBytesInto = function (buffer) {
    return (0, _utils.addStringToBuffer)(_this2.toString(), buffer);
  };
};

exports.default = re;