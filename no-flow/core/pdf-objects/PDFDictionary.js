'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _PDFObject2 = require('./PDFObject');

var _PDFObject3 = _interopRequireDefault(_PDFObject2);

var _2 = require('.');

var _utils = require('../../utils');

var _validate = require('../../utils/validate');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PDFDictionary = function (_PDFObject) {
  _inherits(PDFDictionary, _PDFObject);

  function PDFDictionary(object, validKeys) {
    _classCallCheck(this, PDFDictionary);

    var _this = _possibleConstructorReturn(this, (PDFDictionary.__proto__ || Object.getPrototypeOf(PDFDictionary)).call(this));

    _initialiseProps.call(_this);

    (0, _validate.validate)(object, (0, _utils.or)(_lodash2.default.isObject, _lodash2.default.isNil, (0, _validate.isInstance)(PDFDictionary)), 'PDFDictionary can only be constructed from an Object, nil, or a PDFDictionary');

    _this.validKeys = validKeys;

    if (!object) return _possibleConstructorReturn(_this);

    if (object instanceof PDFDictionary) {
      _this.map = object.map;
    } else {
      (0, _lodash2.default)(object).forEach(function (val, key) {
        return _this.set(key, val, false);
      });
    }
    return _this;
  } // ">>"

  return PDFDictionary;
}(_PDFObject3.default);

PDFDictionary.from = function (object) {
  return new PDFDictionary(object);
};

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.map = new Map();

  this.filter = function (predicate) {
    return Array.from(_this2.map.entries()).filter(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          key = _ref2[0],
          val = _ref2[1];

      return predicate(val, key);
    });
  };

  this.set = function (key, val) {
    var validateKeys = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

    (0, _validate.validate)(key, (0, _utils.or)(_lodash2.default.isString, (0, _validate.isInstance)(_2.PDFName)), 'PDFDictionary.set() requires keys to be strings or PDFNames');
    (0, _validate.validate)(val, (0, _validate.isInstance)(_PDFObject3.default), 'PDFDictionary.set() requires values to be PDFObjects');

    var keyName = key instanceof _2.PDFName ? key : _2.PDFName.from(key);
    if (validateKeys && _this2.validKeys && !_this2.validKeys.includes(keyName.key)) {
      (0, _utils.error)('Invalid key: "' + keyName.key + '"');
    }
    _this2.map.set(keyName, val);

    return _this2;
  };

  this.get = function (key) {
    (0, _validate.validate)(key, (0, _utils.or)(_lodash2.default.isString, (0, _validate.isInstance)(_2.PDFName)), 'PDFDictionary.set() requires keys to be strings or PDFNames');

    var keyName = key instanceof _2.PDFName ? key : _2.PDFName.from(key);
    return _this2.map.get(keyName);
  };

  this.dereference = function (indirectObjects) {
    var failures = [];
    _this2.filter((0, _validate.isInstance)(_2.PDFIndirectReference)).forEach(function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2),
          key = _ref4[0],
          val = _ref4[1];

      var indirectObj = indirectObjects.get(val);
      if (indirectObj) _this2.set(key, indirectObj, false);else {
        var msg = 'Failed to dereference: (' + key.toString() + ', ' + val + ')';
        // For an unknown reason, '/Obj' values somtimes fail to dereference...
        // if (
        //   [
        //     PDFName.from('Obj'),
        //     PDFName.from('Annots'),
        //     PDFName.from('Info'),
        //   ].includes(key)
        // ) {
        //   console.warn(msg);
        // } else error(msg);
        failures.push([key.toString(), val.toString()]);
      }
    });
    return failures;
  };

  this.toString = function () {
    var buffer = new Uint8Array(_this2.bytesSize());
    _this2.copyBytesInto(buffer);
    return (0, _utils.arrayToString)(buffer);
  };

  this.bytesSize = function () {
    return 3 + // "<<\n"
    (0, _lodash2.default)(Array.from(_this2.map.entries())).map(function (_ref5) {
      var _ref6 = _slicedToArray(_ref5, 2),
          key = _ref6[0],
          val = _ref6[1];

      var keySize = (key.toString() + ' ').length;
      if (val instanceof _2.PDFIndirectObject) {
        return keySize + val.toReference().length + 1;
      } else if (val instanceof _PDFObject3.default) {
        return keySize + val.bytesSize() + 1;
      }
      throw new Error('Not a PDFObject: ' + val.constructor.name);
    }).sum() + 2;
  };

  this.copyBytesInto = function (buffer) {
    var remaining = (0, _utils.addStringToBuffer)('<<\n', buffer);
    _this2.map.forEach(function (val, key) {
      remaining = (0, _utils.addStringToBuffer)(key.toString() + ' ', remaining);
      if (val instanceof _2.PDFIndirectObject) {
        remaining = (0, _utils.addStringToBuffer)(val.toReference(), remaining);
      } else if (val instanceof _PDFObject3.default) {
        remaining = val.copyBytesInto(remaining);
      } else {
        throw new Error('Not a PDFObject: ' + val.constructor.name);
      }
      remaining = (0, _utils.addStringToBuffer)('\n', remaining);
    });
    remaining = (0, _utils.addStringToBuffer)('>>', remaining);
    return remaining;
  };
};

exports.default = PDFDictionary;