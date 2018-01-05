/* @flow */
import WAsterisk from './clipping-path/W-asterisk';
import W from './clipping-path/W';

import c from './path-construction/c';
import h from './path-construction/h';
import l from './path-construction/l';
import m from './path-construction/m';
import re from './path-construction/re';
import v from './path-construction/v';
import y from './path-construction/y';

import lowerBAsterisk from './path-painting/lower-b-asterisk';
import lowerB from './path-painting/lower-b';
import lowerFAsterisk from './path-painting/lower-f-asterisk';
import lowerF from './path-painting/lower-f';
import s from './path-painting/lower-s';
import n from './path-painting/n';
import upperBAsterisk from './path-painting/upper-B-asterisk';
import upperB from './path-painting/upper-B';
import F from './path-painting/upper-F';
import S from './path-painting/upper-S';

const PDFOperators = {
  W: {
    ...W,
    asterisk: WAsterisk,
  },
  c,
  h,
  l,
  m,
  re,
  v,
  y,
  b: {
    ...lowerB,
    asterisk: lowerBAsterisk,
  },
  f: {
    ...lowerF,
    asterisk: lowerFAsterisk,
  },
  s,
  n,
  B: {
    ...upperB,
    asterisk: upperBAsterisk,
  },
  F,
  S,
};

export default PDFOperators;
