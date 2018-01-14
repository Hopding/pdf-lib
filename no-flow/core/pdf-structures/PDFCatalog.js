'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _PDFDictionary2 = require('../pdf-objects/PDFDictionary');

var _PDFDictionary3 = _interopRequireDefault(_PDFDictionary2);

var _ = require('.');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PDFCatalog = function (_PDFDictionary) {
  _inherits(PDFCatalog, _PDFDictionary);

  function PDFCatalog() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, PDFCatalog);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = PDFCatalog.__proto__ || Object.getPrototypeOf(PDFCatalog)).call.apply(_ref, [this].concat(args))), _this), _this.getPageTree = function (lookup) {
      return lookup(_this.get('Pages'));
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  return PDFCatalog;
}(_PDFDictionary3.default);

PDFCatalog.validKeys = Object.freeze(['Type', 'Version', 'Extensions', 'Pages', 'PageLabels', 'Names', 'Dests', 'ViewerPreferences', 'PageLayout', 'PageMode', 'Outlines', 'Threads', 'OpenAction', 'AA', 'URI', 'AcroForm', 'Metadata', 'StructTreeRoot', 'MarkInfo', 'Lang', 'SpiderInfo', 'OutputIntents', 'PieceInfo', 'OCProperties', 'Perms', 'Legal', 'Requirements', 'Collection', 'NeedsRendering']);

PDFCatalog.from = function (object) {
  return new PDFCatalog(object, PDFCatalog.validKeys);
};

exports.default = PDFCatalog;