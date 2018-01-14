'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setCharAt = exports.findInMap = exports.arrayFindIndexOf = exports.arrayIndexOfReverse = exports.arrayIndexOf = exports.arraysAreEqual = exports.trimArray = exports.arrayCharAt = exports.arrayToString = exports.charCodes = exports.addStringToBuffer = exports.mergeUint8Arrays = exports.isObject = exports.charFromCode = exports.charCode = exports.toBoolean = exports.not = exports.or = exports.and = exports.isString = exports.isInt = exports.error = exports.writeToDebugFile = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _validate = require('./validate');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var writeToDebugFile = exports.writeToDebugFile = function writeToDebugFile(data) {
  var postfix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

  // eslint-disable-next-line
  var fs = require('fs');
  fs.writeFileSync('/Users/user/Desktop/pdf-lib/debug' + postfix, data);
};

var error = exports.error = function error(msg) {
  throw new Error(msg);
};

var isInt = exports.isInt = function isInt(num) {
  return num % 1 === 0;
};

var isString = exports.isString = function isString(val) {
  return typeof val === 'string';
};

var and = exports.and = function and() {
  for (var _len = arguments.length, predicates = Array(_len), _key = 0; _key < _len; _key++) {
    predicates[_key] = arguments[_key];
  }

  return function () {
    for (var _len2 = arguments.length, values = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      values[_key2] = arguments[_key2];
    }

    return predicates.every(function (predicate) {
      return predicate.apply(undefined, _toConsumableArray(values));
    });
  };
};

var or = exports.or = function or() {
  for (var _len3 = arguments.length, predicates = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    predicates[_key3] = arguments[_key3];
  }

  return function () {
    for (var _len4 = arguments.length, values = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      values[_key4] = arguments[_key4];
    }

    return predicates.find(function (predicate) {
      return predicate.apply(undefined, _toConsumableArray(values));
    });
  };
};

var not = exports.not = function not(predicate) {
  return function () {
    return !predicate.apply(undefined, arguments);
  };
};

var toBoolean = exports.toBoolean = function toBoolean(boolStr) {
  if (boolStr === 'true') return true;
  if (boolStr === 'false') return false;
  throw new Error('"' + boolStr + '" cannot be converted to a boolean');
};

var charCode = exports.charCode = function charCode(charStr) {
  if (charStr.length !== 1) {
    throw new Error('"char" must be exactly one character long');
  }
  return charStr.charCodeAt(0);
};

var charFromCode = exports.charFromCode = function charFromCode(code) {
  return String.fromCharCode(code);
};

var isObject = exports.isObject = function isObject(val) {
  return Object.prototype.toString.call(val) === '[object Object]';
};

var mergeUint8Arrays = exports.mergeUint8Arrays = function mergeUint8Arrays() {
  for (var _len5 = arguments.length, arrs = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
    arrs[_key5] = arguments[_key5];
  }

  var totalLength = _lodash2.default.sum(arrs.map(function (a) {
    return a.length;
  }));
  var newArray = new Uint8Array(totalLength);

  var offset = 0;
  arrs.forEach(function (a) {
    newArray.set(a, offset);
    offset += a.length;
  });

  return newArray;
};

/* eslint-disable no-param-reassign */
var addStringToBuffer = exports.addStringToBuffer = function addStringToBuffer(str, buffer) {
  for (var i = 0; i < str.length; i += 1) {
    buffer[i] = str.charCodeAt(i);
  }
  return buffer.subarray(str.length);
};
/* eslint-enable no-param-reassign */

var charCodes = exports.charCodes = function charCodes(str) {
  return str.split('').map(function (c) {
    return c.charCodeAt(0);
  });
};

var arrayToString = exports.arrayToString = function arrayToString(arr) {
  var startAt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var stopAt = arguments[2];

  var stopIdx = stopAt === undefined || stopAt >= arr.length ? arr.length : stopAt;
  var str = '';
  for (var i = startAt; i < stopIdx; i += 1) {
    str += charFromCode(arr[i]);
  }
  return str;
};

var arrayCharAt = exports.arrayCharAt = function arrayCharAt(arr, idx) {
  return String.fromCharCode(arr[idx]);
};

var trimArray = exports.trimArray = function trimArray(arr) {
  var idx = 0;
  while (String.fromCharCode(arr[idx]).match(/^[ \n\r]/)) {
    idx += 1;
  }return arr.subarray(idx);
};

var arraysAreEqual = exports.arraysAreEqual = function arraysAreEqual(arr1, arr1Start, arr1Stop, arr2, arr2Start, arr2Stop) {
  var arr1Length = arr1Stop - arr1Start;
  if (arr1Length !== arr2Stop - arr2Start) return false;
  for (var i = 0; i < arr1Length; i += 1) {
    if (arr1[arr1Start + i] !== arr2[arr2Start + i]) return false;
  }
  return true;
};

var arrayIndexOf = exports.arrayIndexOf = function arrayIndexOf(arr, targetStr) {
  var startFrom = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

  // validate(
  //   startFrom,
  //   and(_.isNumber, not(_.isNaN)),
  //   `startFrom must be a number, found: "${startFrom}"`,
  // );

  var targetArr = targetStr.split('').map(function (c) {
    return c.charCodeAt(0);
  });
  var currIdx = startFrom;

  while (!arraysAreEqual(arr, currIdx, currIdx + targetStr.length, targetArr, 0, targetArr.length)) {
    currIdx += 1;
    if (currIdx >= arr.length) return undefined;
  }

  return currIdx;
};

var arrayIndexOfReverse = exports.arrayIndexOfReverse = function arrayIndexOfReverse(arr, targetStr, startFrom) {
  // validate(
  //   startFrom,
  //   and(_.isNumber, not(_.isNaN)),
  //   `startFrom must be a number, found: "${startFrom}"`,
  // );

  var targetArr = targetStr.split('').map(function (c) {
    return c.charCodeAt(0);
  });
  var currIdx = startFrom;

  while (!arraysAreEqual(arr, currIdx, currIdx + targetStr.length, targetArr, 0, targetArr.length)) {
    currIdx -= 1;
    if (currIdx === -1) return undefined;
  }

  return currIdx;
};

var arrayFindIndexOf = exports.arrayFindIndexOf = function arrayFindIndexOf(arr, predicate) {
  var startFrom = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

  var currIdx = startFrom;

  while (!predicate(arr.subarray(currIdx, currIdx + 1)[0])) {
    currIdx += 1;
    if (currIdx >= arr.length) return undefined;
  }

  return currIdx;
};

/* eslint-disable no-restricted-syntax */
var findInMap = exports.findInMap = function findInMap(map, predicate) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = map[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _step$value = _slicedToArray(_step.value, 2),
          key = _step$value[0],
          val = _step$value[1];

      if (predicate(val, key)) return val;
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return null;
};

var setCharAt = exports.setCharAt = function setCharAt(str, idx, newChar) {
  return str.substring(0, idx) + newChar + str.substring(idx + 1);
};