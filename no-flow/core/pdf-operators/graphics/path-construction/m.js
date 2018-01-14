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
Begin a new subpath by moving the current point to coordinates (x, y), omitting
any connecting line segment. If the previous path construction operator in the
current path was also m, the new m overrides it; no vestige of the previous m
operation remains in the path.
*/
var m = function (_PDFOperator) {
  _inherits(m, _PDFOperator);

  function m(x, y) {
    _classCallCheck(this, m);

    var _this = _possibleConstructorReturn(this, (m.__proto__ || Object.getPrototypeOf(m)).call(this));

    _initialiseProps.call(_this);

    (0, _validate.validate)(x, _validate.isNumber, 'm operator arg "x" must be a number.');
    (0, _validate.validate)(y, _validate.isNumber, 'm operator arg "y" must be a number.');
    _this.x = x;
    _this.y = y;
    return _this;
  }

  return m;
}(_PDFOperator3.default);

m.of = function (x, y) {
  return new m(x, y);
};

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.toString = function () {
    return _this2.x + ' ' + _this2.y + ' m\n';
  };

  this.bytesSize = function () {
    return _this2.toString().length;
  };

  this.copyBytesInto = function (buffer) {
    return (0, _utils.addStringToBuffer)(_this2.toString(), buffer);
  };
};

exports.default = m;