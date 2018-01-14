'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _pako = require('pako');

var _pako2 = _interopRequireDefault(_pako);

var _pdfObjects = require('../../pdf-objects');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var decodeStream = function decodeStream(data, _ref) {
  var filter = _ref.key;

  if (filter === 'FlateDecode') return _pako2.default.inflate(data);

  // TODO: Implement support for all other filter types
  if (filter === 'DCTDecode') return data;

  throw new Error('Unknown stream filter type: ' + filter);
};

exports.default = function (dict, contents) {
  var filters = dict.get('Filter');
  if (filters) {
    var filtersArr = filters instanceof _pdfObjects.PDFArray ? filters.array : [filters];
    return filtersArr.reduce(decodeStream, contents);
  }
  return contents;
};