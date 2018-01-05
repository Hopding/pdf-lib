/* @flow */
import WAsterisk from './clipping-path/W-asterisk';
import W from './clipping-path/W';

import QOps from './graphics-state/QOps';
import cm from './graphics-state/cm';
import w from './graphics-state/w';
import M from './graphics-state/M';
import d from './graphics-state/d';
import ri from './graphics-state/ri';
import i from './graphics-state/i';
import gs from './graphics-state/gs';

import c from './path-construction/c';
import h from './path-construction/h';
import l from './path-construction/l';
import m from './path-construction/m';
import re from './path-construction/re';
import v from './path-construction/v';
import y from './path-construction/y';

// import lowerBAsterisk from './path-painting/lower-b-asterisk';
// import lowerB from './path-painting/lower-b';
// import lowerFAsterisk from './path-painting/lower-f-asterisk';
// import lowerF from './path-painting/lower-f';
// import s from './path-painting/lower-s';
// import n from './path-painting/n';
// import upperBAsterisk from './path-painting/upper-B-asterisk';
// import upperB from './path-painting/upper-B';
// import F from './path-painting/upper-F';
// import S from './path-painting/upper-S';
import pathPaintingOps from './path-painting';

const PDFOperators = {
  W: {
    ...W,
    asterisk: WAsterisk,
  },
  ...QOps,
  cm,
  w,
  M,
  d,
  ri,
  i,
  c,
  h,
  l,
  m,
  re,
  v,
  y,
  ...pathPaintingOps,
};

export default PDFOperators;
