'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _file = require('file');

var _file2 = _interopRequireDefault(_file);

var _utils = require('../src/utils');

var _PDFDocumentFactory = require('../src/core/pdf-document/PDFDocumentFactory');

var _PDFDocumentFactory2 = _interopRequireDefault(_PDFDocumentFactory);

var _PDFParser = require('../src/core/pdf-parser/PDFParser');

var _PDFParser2 = _interopRequireDefault(_PDFParser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } /* eslint-disable no-restricted-syntax */


var testPdfsDir = __dirname + '/../test-pdfs/pdf';

var pdfParser = new _PDFParser2.default();
var testLoadPdf = function testLoadPdf(filePath) {
  var bytes = _fs2.default.readFileSync(filePath);

  var parsedPdf = void 0;
  var time = Date.now();
  try {
    parsedPdf = pdfParser.parse(bytes);
  } catch (e) {
    return [null, {
      path: filePath,
      cause: 'PARSING',
      time: Date.now() - time,
      message: e.message
    }];
  }

  var dereferenceFailures = [];
  try {
    dereferenceFailures.push.apply(dereferenceFailures, _toConsumableArray(_PDFDocumentFactory2.default.normalize(parsedPdf)));
    if (dereferenceFailures.length > 0) {
      return [null, {
        path: filePath,
        CAUSE: 'DEREFERENCE',
        time: Date.now() - time,
        message: 'Failed to dereference one or more references',
        dereferenceFailures: dereferenceFailures
      }];
    }
    return [{ path: filePath, time: Date.now() - time }, null];
  } catch (e) {
    return [null, {
      path: filePath,
      CAUSE: 'NORMALIZE',
      time: Date.now() - time,
      message: e.message
    }];
  }
};

var testAllPdfs = function testAllPdfs() {
  var exclude = [
  // This one has a data compression issue, it seems
  '/Users/user/Desktop/pdf-lib/test-pdfs/pdf/misc/i26_crash_18277.pdf',
  // Don't bother since pdf-lib doesn't support encrypted docs yet
  '/Users/user/Desktop/pdf-lib/test-pdfs/pdf/misc/i43_encrypted.pdf'];
  var allPdfs = [];
  _file2.default.walkSync(testPdfsDir, function (dirPath, dirs, files) {
    files.forEach(function (fileName) {
      return allPdfs.push(dirPath + '/' + fileName);
    });
  });

  var successes = [];
  var errors = [];
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = allPdfs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var pdf = _step.value;

      if (pdf.substring(pdf.length - 4) !== '.pdf' || exclude.includes(pdf)) {
        continue;
      }
      console.log('Parsing file: "' + pdf + '"');

      var _testLoadPdf = testLoadPdf(pdf),
          _testLoadPdf2 = _slicedToArray(_testLoadPdf, 2),
          success = _testLoadPdf2[0],
          error = _testLoadPdf2[1];

      if (success) successes.push(success);else errors.push(error);
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

  (0, _utils.writeToDebugFile)(JSON.stringify(successes, null, ' '), '-succeses');
  (0, _utils.writeToDebugFile)(JSON.stringify(errors, null, ' '), '-errors');
  console.log('TOTAL FILES: ' + allPdfs.length);
};

var successes = JSON.parse(_fs2.default.readFileSync(__dirname + '/../debug-succeses'));
var errors = JSON.parse(_fs2.default.readFileSync(__dirname + '/../debug-errors'));

var total = successes.length + errors.length;
console.log('Total successes: ' + successes.length);
console.log('Total errors: ' + errors.length);
console.log('Total attempts: ' + total);
console.log('Success Rate: ' + successes.length / total);
console.log('Failure Rate: ' + errors.length / total);

var drFailures = {};
errors.forEach(function (error) {
  if (error.dereferenceFailures) {
    (0, _lodash2.default)(error.dereferenceFailures).flattenDeep().filter(function (str) {
      return str.charAt(0) === '/' || str.charAt(0) === 'A';
    }).forEach(function (key) {
      if (!drFailures[key]) drFailures[key] = 1;else drFailures[key] += 1;
    });
  }
});

console.log((0, _lodash2.default)(drFailures).pickBy(function (count) {
  return count < 25;
}).value());
console.log('================================================================');
console.log((0, _lodash2.default)(drFailures).pickBy(function (count) {
  return count > 25;
}).value());

// testAllPdfs();