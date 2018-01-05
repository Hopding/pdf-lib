/* @flow */
import clippingPathOps from './clipping-path';

import { CS, cs } from './color/CSOps';
import { SC, sc } from './color/SCOps';
import { SCN, scn } from './color/SCNOps';
import { G, g } from './color/GOps';
import { RG, rg } from './color/RGOps';
import { K, k } from './color/KOps';

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

import pathPaintingOps from './path-painting';

const PDFOperators = {
  ...clippingPathOps,
  CS,
  cs,
  SC,
  sc,
  SCN,
  scn,
  G,
  g,
  RG,
  rg,
  K,
  k,
  ...QOps,
  cm,
  w,
  M,
  d,
  ri,
  i,
  gs,
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
