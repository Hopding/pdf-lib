'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.typedArrayProxy = undefined;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _validate = require('./validate');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* xxxxxxxxxx */
var EMPTY_ARR = [];

var typedArrayProxy = exports.typedArrayProxy = function typedArrayProxy(obj, type) {
  var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  (0, _lodash2.default)(config.methods).forEach(function (val, key) {
    obj[key] = new Proxy(obj[key], {
      apply: function apply(target, thisArg, elements) {
        return val(function (args) {
          return target.apply(thisArg, args);
        }, elements);
      }
    });
  });

  return new Proxy(obj, {
    set: function set(target, property, value, receiver) {
      if (!(property in EMPTY_ARR)) {
        (0, _validate.validate)(value, (0, _validate.isInstance)(type), 'Typed Array Proxy elements must be of type ' + type.name);
      }
      if (config.set) config.set(property, value);
      target[property] = value;
      return true;
    },
    get: function get(target, property, receiver) {
      if (config.get && config.get[property]) {
        return config.get[property](target[property]);
      }
      return target[property];
    }
  });
};