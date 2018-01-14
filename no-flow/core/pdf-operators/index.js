'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _clippingPath = require('./graphics/clipping-path');

var _clippingPath2 = _interopRequireDefault(_clippingPath);

var _CSOps = require('./graphics/color/CSOps');

var _SCOps = require('./graphics/color/SCOps');

var _SCNOps = require('./graphics/color/SCNOps');

var _GOps = require('./graphics/color/GOps');

var _RGOps = require('./graphics/color/RGOps');

var _KOps = require('./graphics/color/KOps');

var _QOps = require('./graphics/graphics-state/QOps');

var _QOps2 = _interopRequireDefault(_QOps);

var _cm = require('./graphics/graphics-state/cm');

var _cm2 = _interopRequireDefault(_cm);

var _w = require('./graphics/graphics-state/w');

var _w2 = _interopRequireDefault(_w);

var _M = require('./graphics/graphics-state/M');

var _M2 = _interopRequireDefault(_M);

var _d = require('./graphics/graphics-state/d');

var _d2 = _interopRequireDefault(_d);

var _ri = require('./graphics/graphics-state/ri');

var _ri2 = _interopRequireDefault(_ri);

var _i = require('./graphics/graphics-state/i');

var _i2 = _interopRequireDefault(_i);

var _gs = require('./graphics/graphics-state/gs');

var _gs2 = _interopRequireDefault(_gs);

var _lineCap = require('./graphics/graphics-state/lineCap');

var _lineCap2 = _interopRequireDefault(_lineCap);

var _lineJoin = require('./graphics/graphics-state/lineJoin');

var _lineJoin2 = _interopRequireDefault(_lineJoin);

var _c = require('./graphics/path-construction/c');

var _c2 = _interopRequireDefault(_c);

var _h = require('./graphics/path-construction/h');

var _h2 = _interopRequireDefault(_h);

var _l = require('./graphics/path-construction/l');

var _l2 = _interopRequireDefault(_l);

var _m = require('./graphics/path-construction/m');

var _m2 = _interopRequireDefault(_m);

var _re = require('./graphics/path-construction/re');

var _re2 = _interopRequireDefault(_re);

var _v = require('./graphics/path-construction/v');

var _v2 = _interopRequireDefault(_v);

var _y = require('./graphics/path-construction/y');

var _y2 = _interopRequireDefault(_y);

var _pathPainting = require('./graphics/path-painting');

var _pathPainting2 = _interopRequireDefault(_pathPainting);

var _TAsterisk = require('./text/text-positioning/T-asterisk');

var _TAsterisk2 = _interopRequireDefault(_TAsterisk);

var _TDOps = require('./text/text-positioning/TDOps');

var _Tm = require('./text/text-positioning/Tm');

var _Tm2 = _interopRequireDefault(_Tm);

var _QuoteOps = require('./text/text-showing/QuoteOps');

var _TJOps = require('./text/text-showing/TJOps');

var _Tc = require('./text/text-state/Tc');

var _Tc2 = _interopRequireDefault(_Tc);

var _Tf = require('./text/text-state/Tf');

var _Tf2 = _interopRequireDefault(_Tf);

var _TL = require('./text/text-state/TL');

var _TL2 = _interopRequireDefault(_TL);

var _Tr = require('./text/text-state/Tr');

var _Tr2 = _interopRequireDefault(_Tr);

var _Ts = require('./text/text-state/Ts');

var _Ts2 = _interopRequireDefault(_Ts);

var _Tw = require('./text/text-state/Tw');

var _Tw2 = _interopRequireDefault(_Tw);

var _Tz = require('./text/text-state/Tz');

var _Tz2 = _interopRequireDefault(_Tz);

var _Do = require('./Do');

var _Do2 = _interopRequireDefault(_Do);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PDFOperators = _extends({}, _clippingPath2.default, {
  CS: _CSOps.CS,
  cs: _CSOps.cs,
  SC: _SCOps.SC,
  sc: _SCOps.sc,
  SCN: _SCNOps.SCN,
  scn: _SCNOps.scn,
  G: _GOps.G,
  g: _GOps.g,
  RG: _RGOps.RG,
  rg: _RGOps.rg,
  K: _KOps.K,
  k: _KOps.k
}, _QOps2.default, {
  cm: _cm2.default,
  w: _w2.default,
  M: _M2.default,
  d: _d2.default,
  ri: _ri2.default,
  i: _i2.default,
  gs: _gs2.default,
  J: _lineCap2.default,
  j: _lineJoin2.default,
  c: _c2.default,
  h: _h2.default,
  l: _l2.default,
  m: _m2.default,
  re: _re2.default,
  v: _v2.default,
  y: _y2.default
}, _pathPainting2.default, {
  T: { asterisk: _TAsterisk2.default },
  TD: _TDOps.TD,
  Td: _TDOps.Td,
  Tm: _Tm2.default,
  quote: { single: _QuoteOps.SingleQuote, double: _QuoteOps.DoubleQuote },
  TJ: _TJOps.TJ,
  Tj: _TJOps.Tj,
  Tc: _Tc2.default,
  Tf: _Tf2.default,
  TL: _TL2.default,
  Tr: _Tr2.default,
  Ts: _Ts2.default,
  Tw: _Tw2.default,
  Tz: _Tz2.default,
  Do: _Do2.default
});

exports.default = PDFOperators;