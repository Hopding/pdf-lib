/* @flow */
import clippingPathOps from './graphics/clipping-path';

import { CS, cs } from './graphics/color/CSOps';
import { SC, sc } from './graphics/color/SCOps';
import { SCN, scn } from './graphics/color/SCNOps';
import { G, g } from './graphics/color/GOps';
import { RG, rg } from './graphics/color/RGOps';
import { K, k } from './graphics/color/KOps';

import QOps from './graphics/graphics-state/QOps';
import cm from './graphics/graphics-state/cm';
import w from './graphics/graphics-state/w';
import M from './graphics/graphics-state/M';
import d from './graphics/graphics-state/d';
import ri from './graphics/graphics-state/ri';
import i from './graphics/graphics-state/i';
import gs from './graphics/graphics-state/gs';
import J from './graphics/graphics-state/lineCap';
import j from './graphics/graphics-state/lineJoin';

import c from './graphics/path-construction/c';
import h from './graphics/path-construction/h';
import l from './graphics/path-construction/l';
import m from './graphics/path-construction/m';
import re from './graphics/path-construction/re';
import v from './graphics/path-construction/v';
import y from './graphics/path-construction/y';

import pathPaintingOps from './graphics/path-painting';

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
  J,
  j,
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
