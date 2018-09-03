import round from 'lodash/round';

import { G, g } from 'core/pdf-operators/graphics/color/GOps';
import { K, k } from 'core/pdf-operators/graphics/color/KOps';
import { RG, rg } from 'core/pdf-operators/graphics/color/RGOps';

import cm from 'core/pdf-operators/graphics/graphics-state/cm';
import d from 'core/pdf-operators/graphics/graphics-state/d';
import { J, j } from 'core/pdf-operators/graphics/graphics-state/JOps';
import w from 'core/pdf-operators/graphics/graphics-state/w';

import c from 'core/pdf-operators/graphics/path-construction/c';
import h from 'core/pdf-operators/graphics/path-construction/h';
import l from 'core/pdf-operators/graphics/path-construction/l';
import m from 'core/pdf-operators/graphics/path-construction/m';
import re from 'core/pdf-operators/graphics/path-construction/re';

import { Td } from 'core/pdf-operators/text/text-positioning/TDOps';
import Tm from 'core/pdf-operators/text/text-positioning/Tm';

import { Tj } from 'core/pdf-operators/text/text-showing/TJOps';

import Tc from 'core/pdf-operators/text/text-state/Tc';
import Tf from 'core/pdf-operators/text/text-state/Tf';
import TL from 'core/pdf-operators/text/text-state/TL';
import Tr from 'core/pdf-operators/text/text-state/Tr';
import Ts from 'core/pdf-operators/text/text-state/Ts';
import Tw from 'core/pdf-operators/text/text-state/Tw';
import Tz from 'core/pdf-operators/text/text-state/Tz';

import Do from 'core/pdf-operators/Do';

import PDFOperators from 'core/pdf-operators';
import PDFOperator from 'core/pdf-operators/PDFOperator';

// tslint:disable-next-line:no-unused-variable
import { PDFHexString, PDFName, PDFString } from 'core/pdf-objects';

/* ======== Clipping path operators ======== */
const { W } = PDFOperators;

export const clip = () => W.operator;

export const clipEvenOdd = () => W.asterisk!.operator;

/* ======== Graphics state operators ======== */
const { Q, q } = PDFOperators;
const { cos, sin, tan } = Math;
export const degreesToRadians = (degrees: number) => degrees * Math.PI / 180;

export const translate = (xPos: number, yPos: number) =>
  cm.of(1, 0, 0, 1, xPos, yPos);

export const scale = (xPos: number, yPos: number) =>
  cm.of(xPos, 0, 0, yPos, 0, 0);

// Round to the 6th decimal place to avoid JavaScript exponential notation
// being used, which starts at the 7th decimal place, e.g.
//   0.0000001 => 1e-7
//   0.000001  => 0.000001
export const rotateRadians = (angle: number) =>
  cm.of(
    round(cos(angle), 6),
    round(sin(angle), 6),
    round(-sin(angle), 6),
    round(cos(angle), 6),
    0,
    0,
  );

export const rotateDegrees = (angle: number) =>
  rotateRadians(degreesToRadians(angle));

// Round to the 6th decimal place to avoid JavaScript exponential notation
// being used, which starts at the 7th decimal place, e.g.
//   0.0000001 => 1e-7
//   0.000001  => 0.000001
export const skewRadians = (xSkewAngle: number, ySkewAngle: number) =>
  cm.of(1, round(tan(xSkewAngle), 6), round(tan(ySkewAngle), 6), 1, 0, 0);

export const skewDegrees = (xSkewAngle: number, ySkewAngle: number) =>
  skewRadians(degreesToRadians(xSkewAngle), degreesToRadians(ySkewAngle));

export const dashPattern = d.of;

export const restoreDashPattern = () => d.of([], 0);

export const lineCap = (style: 'butt' | 'round' | 'projecting') =>
  J.of({ butt: 0, round: 1, projecting: 2 }[style]);

export const lineJoin = (style: 'miter' | 'round' | 'bevel') =>
  j.of({ miter: 0, round: 1, bevel: 2 }[style]);

export const popGraphicsState = () => Q.operator;

export const pushGraphicsState = () => q.operator;

export const lineWidth = w.of;

/* ======== Path construction operators ======== */

export const appendBezierCurve = c.of;

export const closePath = () => h.operator;

export const moveTo = m.of;

export const lineTo = l.of;

export const rectangle = re.of;

export const square = (xPos: number, yPos: number, size: number) =>
  rectangle(xPos, yPos, size, size);

/* ======== Path painting operators ======== */
const { S, f, B, n } = PDFOperators;

export const stroke = () => S.operator;

export const fill = () => f.operator;

export const fillAndStroke = () => B.operator;

export const endPath = () => n.operator;

/* ======== Test positioning operators ======== */
const { T } = PDFOperators;

// TODO: Allow an optional number to move more/less than the default line height.
export const nextLine = () => T.asterisk.operator;

export const textPosition = Td.of;

/* ======== Text showing operators ======== */

export const text = Tj.of;

/* ======== Text state operators ======== */

export const fontAndSize = Tf.of;

export const charSpacing = Tc.of;

export const wordSpacing = Tw.of;

// Compresses glyphs horizontally - not vertically.
export const charSqueeze = Tz.of;

export const lineHeight = TL.of;

export const textRise = Ts.of;

export const textRenderingMode = (
  style:
    | 'fill'
    | 'outline'
    | 'fillAndOutline'
    | 'invisible'
    | 'fillAndClip'
    | 'outlineAndClip'
    | 'fillAndOutlineAndClip'
    | 'clip',
) =>
  Tr.of(
    {
      fill: 0,
      outline: 1,
      fillAndOutline: 2,
      invisible: 3,
      fillAndClip: 4,
      outlineAndClip: 5,
      fillAndOutlineAndClip: 6,
      clip: 7,
    }[style],
  );

export const textMatrix = Tm.of;

// Round to the 6th decimal place to avoid JavaScript exponential notation
// being used, which starts at the 7th decimal place, e.g.
//   0.0000001 => 1e-7
//   0.000001  => 0.000001
export const rotateAndSkewTextRadiansAndTranslate = (
  rotationAngle: number,
  xSkewAngle: number,
  ySkewAngle: number,
  x: number,
  y: number,
) =>
  Tm.of(
    round(cos(rotationAngle), 6),
    round(sin(rotationAngle) + tan(xSkewAngle), 6),
    round(-sin(rotationAngle) + tan(ySkewAngle), 6),
    round(cos(rotationAngle), 6),
    x,
    y,
  );

export const rotateAndSkewTextDegreesAndTranslate = (
  rotationAngle: number,
  xSkewAngle: number,
  ySkewAngle: number,
  x: number,
  y: number,
) =>
  rotateAndSkewTextRadiansAndTranslate(
    degreesToRadians(rotationAngle),
    degreesToRadians(xSkewAngle),
    degreesToRadians(ySkewAngle),
    x,
    y,
  );

/* ======== XObject operator ======== */

export const image = Do.of;

/* ======== Color operators ======== */

export const fillingGrayscaleColor = g.of;

export const strokingGrayscaleColor = G.of;

export const fillingRgbColor = rg.of;

export const strokingRgbColor = RG.of;

export const fillingCmykColor = k.of;

export const strokingCmykColor = K.of;
