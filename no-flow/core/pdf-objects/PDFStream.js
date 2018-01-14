'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ = require('.');

var _utils = require('../../utils');

var _validate = require('../../utils/validate');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PDFStream = function (_PDFObject) {
  _inherits(PDFStream, _PDFObject);

  function PDFStream() {
    var dictionary = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new _.PDFDictionary();

    _classCallCheck(this, PDFStream);

    var _this = _possibleConstructorReturn(this, (PDFStream.__proto__ || Object.getPrototypeOf(PDFStream)).call(this));

    _this.validateDictionary = function () {
      if (!_this.dictionary.get('Length')) {
        (0, _utils.error)('"Length" is a required field for PDFStream dictionaries');
      }
    };

    (0, _validate.validate)(dictionary, (0, _validate.isInstance)(_.PDFDictionary), 'PDFStream.dictionary must be of type PDFDictionary');
    _this.dictionary = dictionary;
    return _this;
  }

  return PDFStream;
}(_.PDFObject);

exports.default = PDFStream;