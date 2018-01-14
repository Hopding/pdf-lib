'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = require('../../utils');

var _validate = require('../../utils/validate');

var _PDFObject2 = require('./PDFObject');

var _PDFObject3 = _interopRequireDefault(_PDFObject2);

var _2 = require('.');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PDFArray = function (_PDFObject) {
  _inherits(PDFArray, _PDFObject);

  function PDFArray(array) {
    _classCallCheck(this, PDFArray);

    var _this = _possibleConstructorReturn(this, (PDFArray.__proto__ || Object.getPrototypeOf(PDFArray)).call(this));

    _initialiseProps.call(_this);

    (0, _validate.validateArr)(array, (0, _validate.isInstance)(_PDFObject3.default), 'Cannot construct PDFArray from array whose elements are not PDFObjects');
    _this.array = array.slice();
    return _this;
  }

  // TODO: Remove this unused dereferencing code
  // "]";

  return PDFArray;
}(_PDFObject3.default);

PDFArray.fromArray = function (array) {
  return new PDFArray(array);
};

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.push = function () {
    var _array;

    for (var _len = arguments.length, val = Array(_len), _key = 0; _key < _len; _key++) {
      val[_key] = arguments[_key];
    }

    (0, _validate.validateArr)(val, (0, _validate.isInstance)(_PDFObject3.default), 'PDFArray.push() requires arguments to be PDFObjects');

    (_array = _this2.array).push.apply(_array, _toConsumableArray(val));
    return _this2;
  };

  this.set = function (idx, val) {
    (0, _validate.validate)(idx, _lodash2.default.isNumber, 'PDFArray.set() requires indexes to be numbers');
    (0, _validate.validate)(val, (0, _validate.isInstance)(_PDFObject3.default), 'PDFArray.set() requires values to be PDFObjects');

    _this2.array[idx] = val;
    return _this2;
  };

  this.get = function (idx) {
    (0, _validate.validate)(idx, _lodash2.default.isNumber, 'PDFArray.set() requires indexes to be numbers');
    return _this2.array[idx];
  };

  this.forEach = function () {
    var _array2;

    return (_array2 = _this2.array).forEach.apply(_array2, arguments);
  };

  this.map = function () {
    var _array3;

    return (_array3 = _this2.array).map.apply(_array3, arguments);
  };

  this.splice = function () {
    var _array4;

    return (_array4 = _this2.array).splice.apply(_array4, arguments);
  };

  this.dereference = function (indirectObjects) {
    var failures = [];
    _this2.array.forEach(function (val, idx) {
      if (val instanceof _2.PDFIndirectReference) {
        var obj = indirectObjects.get(val);
        // if (!obj) error(`Failed to dereference: ${val.toString()}`);
        if (!obj) failures.push(['ARRAY_KEY', val.toString()]);else _this2.array[idx] = obj;
      }
    });
    return failures;
  };

  this.toString = function () {
    var bufferSize = _this2.bytesSize();
    var buffer = new Uint8Array(bufferSize);
    _this2.copyBytesInto(buffer);
    return (0, _utils.arrayToString)(buffer);
  };

  this.bytesSize = function () {
    return 2 + // "[ "
    (0, _lodash2.default)(_this2.array).map(function (e) {
      if (e.is(_2.PDFIndirectObject)) return e.toReference().length + 1;else if (e.is(_PDFObject3.default)) return e.bytesSize() + 1;
      return (0, _utils.error)('Not a PDFObject: ' + e.constructor.name);
    }).sum() + 1;
  };

  this.copyBytesInto = function (buffer) {
    var remaining = (0, _utils.addStringToBuffer)('[ ', buffer);

    _this2.array.forEach(function (e, idx) {
      if (e.is(_2.PDFIndirectObject)) {
        remaining = (0, _utils.addStringToBuffer)(e.toReference(), remaining);
      } else if (e.is(_PDFObject3.default)) {
        remaining = e.copyBytesInto(remaining);
      } else {
        (0, _utils.error)('Not a PDFObject: ' + e.constructor.name);
      }
      remaining = (0, _utils.addStringToBuffer)(' ', remaining);
    });

    remaining = (0, _utils.addStringToBuffer)(']', remaining);
    return remaining;
  };
};

exports.default = PDFArray;