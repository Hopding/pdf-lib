// tslint:disable-next-line:no-unused-variable
import { IPDFOperatorSingleton } from 'core/pdf-operators/PDFOperator';

import W from './graphics/clipping-path/W';

import { CS, cs } from './graphics/color/CSOps';
import { G, g } from './graphics/color/GOps';
import { K, k } from './graphics/color/KOps';
import { RG, rg } from './graphics/color/RGOps';
import { SCN, scn } from './graphics/color/SCNOps';
import { SC, sc } from './graphics/color/SCOps';

import cm from './graphics/graphics-state/cm';
import d from './graphics/graphics-state/d';
import gs from './graphics/graphics-state/gs';
import i from './graphics/graphics-state/i';
import { J, j } from './graphics/graphics-state/JOps';
import M from './graphics/graphics-state/M';
import QOps from './graphics/graphics-state/QOps';
import ri from './graphics/graphics-state/ri';
import w from './graphics/graphics-state/w';

import c from './graphics/path-construction/c';
import h from './graphics/path-construction/h';
import l from './graphics/path-construction/l';
import m from './graphics/path-construction/m';
import re from './graphics/path-construction/re';
import v from './graphics/path-construction/v';
import y from './graphics/path-construction/y';

import * as pathPaintingOps from 'core/pdf-operators/graphics/path-painting';

import TAsterisk from './text/text-positioning/T-asterisk';
import { TD, Td } from './text/text-positioning/TDOps';
import Tm from './text/text-positioning/Tm';

import { DoubleQuote, SingleQuote } from './text/text-showing/QuoteOps';
import { TJ, Tj } from './text/text-showing/TJOps';

import Tc from './text/text-state/Tc';
import Tf from './text/text-state/Tf';
import TL from './text/text-state/TL';
import Tr from './text/text-state/Tr';
import Ts from './text/text-state/Ts';
import Tw from './text/text-state/Tw';
import Tz from './text/text-state/Tz';

import Do from './Do';

/*
 * These operator categories are defined in the
 * "Table 51 – Operator Categories" table in the PDF specification document
 */

export const generalGraphicsStateOperators = [w, J, j, M, d, ri, i, gs];

export const colorOperators = [CS, cs, SC, SCN, sc, scn, G, g, RG, rg, K, k];

export const textStateOperators = [Tc, Tw, Tz, TL, Tf, Tr, Ts];

export const textShowingOperators = [Tj, TJ, SingleQuote, DoubleQuote];

export const textPositioningOperators = [Td, TD, Tm, TAsterisk];

// TODO: These are valid in TextObjects, but they aren't implemented in
//       pdf-lib yet.
// export const markedContentOperators =
//   [MP, DP, BMC, BDC, EMC]

const PDFOperators = {
  W,
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
  T: { asterisk: TAsterisk },
  TD,
  Td,
  Tm,
  quote: { single: SingleQuote, double: DoubleQuote },
  TJ,
  Tj,
  Tc,
  Tf,
  TL,
  Tr,
  Ts,
  Tw,
  Tz,
  Do,
};

export default PDFOperators;
