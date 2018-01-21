'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _validate = require('../../utils/validate');

var _2 = require('.');

var _pdfObjects = require('../pdf-objects');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var VALID_KEYS = Object.freeze(['Type', 'Parent', 'LastModified', 'Resources', 'MediaBox', 'CropBox', 'BleedBox', 'TrimBox', 'ArtBox', 'BoxColorInfo', 'Contents', 'Rotate', 'Group', 'Thumb', 'B', 'Dur', 'Trans', 'Annots', 'AA', 'Metadata', 'PieceInfo', 'StructParents', 'ID', 'PZ', 'SeparationInfo', 'Tabs', 'TemplateInstantiated', 'PresSteps', 'UserUnit', 'VP']);

var PDFPage = function (_PDFDictionary) {
  _inherits(PDFPage, _PDFDictionary);

  function PDFPage() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, PDFPage);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = PDFPage.__proto__ || Object.getPrototypeOf(PDFPage)).call.apply(_ref, [this].concat(args))), _this), _this.normalizeContents = function (lookup) {
      if (_this.get('Contents')) {
        var contents = lookup(_this.get('Contents'));
        if (!contents.is(_pdfObjects.PDFArray)) {
          _this.set('Contents', _pdfObjects.PDFArray.fromArray([_this.get('Contents')]));
        }
      }
    }, _this.normalizeResources = function (lookup, _ref2) {
      var Font = _ref2.Font,
          XObject = _ref2.XObject;

      if (!_this.get('Resources')) _this.set('Resources', _pdfObjects.PDFDictionary.from());

      var Resources = lookup(_this.get('Resources'));
      if (Font && !Resources.get('Font')) {
        Resources.set('Font', _pdfObjects.PDFDictionary.from());
      }
      if (XObject && !Resources.get('XObject')) {
        Resources.set('XObject', _pdfObjects.PDFDictionary.from());
      }
    }, _this.addContentStreams = function (lookup) {
      for (var _len2 = arguments.length, contentStreams = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        contentStreams[_key2 - 1] = arguments[_key2];
      }

      (0, _validate.validate)(lookup, _lodash2.default.isFunction, '"lookup" must be a function');
      (0, _validate.validateArr)(contentStreams, (0, _validate.isInstance)(_pdfObjects.PDFIndirectReference), '"contentStream" must be of type PDFIndirectReference<PDFContentStream>');

      _this.normalizeContents(lookup);
      if (!_this.get('Contents')) {
        _this.set('Contents', _pdfObjects.PDFArray.fromArray(contentStreams));
      } else {
        var Contents = lookup(_this.get('Contents'));
        Contents.push.apply(Contents, _toConsumableArray(contentStreams));
      }

      return _this;
    }, _this.addFontDictionary = function (lookup, key, fontDict // Allow PDFDictionaries as well
    ) {
      (0, _validate.validate)(key, _lodash2.default.isString, '"key" must be a string');
      (0, _validate.validate)(fontDict, (0, _validate.isInstance)(_pdfObjects.PDFIndirectReference), '"fontDict" must be an instance of PDFIndirectReference');

      _this.normalizeResources(lookup, { Font: true });
      var Resources = lookup(_this.get('Resources'));
      var Font = lookup(Resources.get('Font'));
      Font.set(key, fontDict);

      return _this;
    }, _this.addXObject = function (lookup, key, xObject) {
      (0, _validate.validate)(key, _lodash2.default.isString, '"key" must be a string');
      (0, _validate.validate)(xObject, (0, _validate.isInstance)(_pdfObjects.PDFIndirectReference), '"xObject" must be an instance of PDFIndirectReference');

      _this.normalizeResources(lookup, { XObject: true });
      var Resources = lookup(_this.get('Resources'));
      var XObject = lookup(Resources.get('XObject'));
      XObject.set(key, xObject);

      return _this;
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  /**
  There are three possibilities, the page can:
    (1) have no "Contents"
    (2) have an array of indirect objects as its "Contents"
    (3) have a standalone indirect object as its "Contents"
  */
  // get contentStreams(): Array<PDFRawStream | PDFContentStream> {
  //   let streams;
  //   if (!this.get('Contents')) streams = [];
  //   const contents = this.get('Contents').object;
  //   streams = contents.is(PDFArray) ? contents.array : [contents];
  //   return Object.freeze(streams.slice());
  // }

  /** Convert "Contents" to array if it exists and is not already */
  // TODO: See is this is inefficient...


  // TODO: Consider allowing *insertion* of content streams so order can be changed


  return PDFPage;
}(_pdfObjects.PDFDictionary);

PDFPage.create = function (size, resources) {
  (0, _validate.validate)(size.length, (0, _validate.isIdentity)(2), 'size tuple must have two elements');
  (0, _validate.validateArr)(size, _lodash2.default.isNumber, 'size tuple entries must be Numbers.');
  (0, _validate.validate)(resources, (0, _validate.optional)((0, _validate.isInstance)(_pdfObjects.PDFDictionary)), 'resources must be a PDFDictionary');

  var mediaBox = [0, 0, size[0], size[1]];
  var page = new PDFPage({
    Type: _pdfObjects.PDFName.from('Page'),
    // TODO: Convert this to use PDFRectangle
    MediaBox: _pdfObjects.PDFArray.fromArray(mediaBox.map(_pdfObjects.PDFNumber.fromNumber))
  }, PDFPage.validKeys);
  if (resources) page.set('Resources', resources);
  return page;
};

PDFPage.from = function (object) {
  return new PDFPage(object, PDFPage.validKeys);
};

PDFPage.validKeys = VALID_KEYS;
exports.default = PDFPage;