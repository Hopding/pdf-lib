'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.oneOf = exports.isIndirectObjectOf = exports.isInRange = exports.isNumber = exports.doesMatch = exports.isNotIdentity = exports.isIdentity = exports.isInstance = exports.validateArr = exports.optional = exports.validate = undefined;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _2 = require('.');

var _pdfObjects = require('../core/pdf-objects');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var validate = exports.validate = function validate(value, predicate, msg) {
  if (!predicate(value)) throw new Error(msg);
};
var optional = exports.optional = function optional(predicate) {
  return function (value) {
    return _lodash2.default.isNil(value) || predicate(value);
  };
};

var validateArr = exports.validateArr = function validateArr(value, predicate, msg) {
  value.forEach(function (v) {
    return validate(v, predicate, msg);
  });
};

var isInstance = exports.isInstance = function isInstance(requiredClass) {
  return function (value) {
    return value instanceof requiredClass;
  };
};

var isIdentity = exports.isIdentity = function isIdentity(requiredValue) {
  return function (value) {
    return value === requiredValue;
  };
};

var isNotIdentity = exports.isNotIdentity = function isNotIdentity(requiredValue) {
  return function (value) {
    return value !== requiredValue;
  };
};

var doesMatch = exports.doesMatch = function doesMatch(regex) {
  return function (value) {
    return !!value.match(regex);
  };
};

var isNumber = exports.isNumber = function isNumber(n) {
  return (0, _2.and)(_lodash2.default.isNumber, (0, _2.not)(_lodash2.default.isNaN))(n);
};

var isInRange = exports.isInRange = function isInRange(lower, upper) {
  return function (value) {
    return _lodash2.default.inRange(value, lower, upper);
  };
};

var isIndirectObjectOf = exports.isIndirectObjectOf = function isIndirectObjectOf(requiredClass) {
  return function (value) {
    return isInstance(_pdfObjects.PDFIndirectObject)(value) && isInstance(requiredClass)(value.pdfObject);
  };
};

var oneOf = exports.oneOf = function oneOf() {
  for (var _len = arguments.length, allowed = Array(_len), _key = 0; _key < _len; _key++) {
    allowed[_key] = arguments[_key];
  }

  return function (value) {
    return allowed.some(function (a) {
      return a === value;
    });
  };
};