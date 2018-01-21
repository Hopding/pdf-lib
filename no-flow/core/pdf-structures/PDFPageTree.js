'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _pdfObjects = require('../pdf-objects');

var _index = require('./index');

var _validate = require('../../utils/validate');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
/* eslint-disable prefer-destructuring, no-param-reassign */


var VALID_KEYS = Object.freeze(['Type', 'Parent', 'Kids', 'Count']);

var PDFPageTree = function (_PDFDictionary) {
  _inherits(PDFPageTree, _PDFDictionary);

  function PDFPageTree() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, PDFPageTree);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = PDFPageTree.__proto__ || Object.getPrototypeOf(PDFPageTree)).call.apply(_ref, [this].concat(args))), _this), _this.addPage = function (lookup, page) {
      (0, _validate.validate)(page, (0, _validate.isInstance)(_pdfObjects.PDFIndirectReference), '"page" arg must be of type PDFIndirectReference<PDFPage>');
      _this.get('Kids').array.push(page);
      _this.ascend(lookup, function (pageTree) {
        pageTree.get('Count').number += 1;
      });
      return _this;
    }, _this.removePage = function (lookup, idx) {
      (0, _validate.validate)(idx, _lodash2.default.isNumber, '"idx" arg must be a Number');
      _this.get('Kids').array.splice(idx, 1);
      _this.ascend(lookup, function (pageTree) {
        pageTree.get('Count').number -= 1;
      });
      return _this;
    }, _this.insertPage = function (lookup, idx, page) {
      (0, _validate.validate)(idx, _lodash2.default.isNumber, '"idx" arg must be a Number');
      (0, _validate.validate)(page, (0, _validate.isInstance)(_pdfObjects.PDFIndirectReference), '"page" arg must be of type PDFIndirectReference<PDFPage>');
      _this.get('Kids').array.splice(idx, 0, page);
      _this.ascend(lookup, function (pageTree) {
        pageTree.get('Count').number += 1;
      });
      return _this;
    }, _this.traverse = function (lookup, visit) {
      if (_this.get('Kids').array.length === 0) return _this;

      _this.get('Kids').forEach(function (kidRef) {
        var kid = lookup(kidRef);
        visit(kid, kidRef);
        if (kid.is(PDFPageTree)) kid.traverse(lookup, visit);
      });
      return _this;
    }, _this.traverseRight = function (lookup, visit) {
      if (_this.get('Kids').array.length === 0) return _this;

      var lastKidRef = _lodash2.default.last(_this.get('Kids').array);
      var lastKid = lookup(lastKidRef);
      visit(lastKid, lastKidRef);
      if (lastKid.is(PDFPageTree)) lastKid.traverseRight(lookup, visit);
      return _this;
    }, _this.ascend = function (lookup, visit) {
      var visitSelf = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

      if (visitSelf) visit(_this);
      if (!_this.get('Parent')) return;
      var parent = lookup(_this.get('Parent'));
      visit(parent);
      parent.ascend(lookup, visit, false);
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  // TODO: Pass a "stop" callback to allow "visit" to end traversal early
  // TODO: Allow for optimized tree search given an index


  return PDFPageTree;
}(_pdfObjects.PDFDictionary);

PDFPageTree.createRootNode = function (kids) {
  (0, _validate.validate)(kids, (0, _validate.isInstance)(_pdfObjects.PDFArray), '"kids" must be a PDFArray');
  return PDFPageTree.from({
    Type: _pdfObjects.PDFName.from('Pages'),
    Kids: kids,
    Count: _pdfObjects.PDFNumber.fromNumber(kids.array.length)
  });
};

PDFPageTree.from = function (object) {
  return new PDFPageTree(object, VALID_KEYS);
};

exports.default = PDFPageTree;