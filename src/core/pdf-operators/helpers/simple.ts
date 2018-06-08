import PDFOperators from 'core/pdf-operators';
import PDFOperator from 'core/pdf-operators/PDFOperator';
import PDFTextObject from 'core/pdf-operators/text/PDFTextObject';
import { isInRange, validate } from 'utils/validate';

/* ======== Clipping path operators ======== */
const { W } = PDFOperators;

export const clip = () => W.operator;

export const clipEvenOdd = () => W.asterisk.operator;

/* ======== Graphics state operators ======== */
const { cm, d, J, j, Q, q, w } = PDFOperators;
const { cos, sin, tan } = Math;

export const translate = (xPos: number, yPos: number) =>
  cm.of(1, 0, 0, 1, xPos, yPos);

export const scale = (xPos: number, yPos: number) =>
  cm.of(xPos, 0, 0, yPos, 0, 0);

// TODO: TEST THIS THING: [cos(q) sin(q) -sin(q) cos(q) 0 0]
export const rotate = (angle: number) =>
  cm.of(cos(angle), sin(angle), -sin(angle), cos(angle), 0, 0);

// TODO: TEST THIS THING: [1 tana tanb 1 0 0]
export const skew = (xSkewAngle: number, ySkewAngle: number) =>
  cm.of(1, tan(xSkewAngle), tan(ySkewAngle), 1, 0, 0);

export const dashPattern = d.of;

export const restoreDashPattern = () => d.of([], 0);

// TODO: Update this to accept a string enum instead of integers.
export const lineCap = J.of;

// TODO: Update this to accept a string enum instead of integers.
export const lineJoin = j.of;

export const popGraphicsState = () => Q.operator;

export const pushGraphicsState = () => q.operator;

export const lineWidth = w.of;

/* ======== Path construction operators ======== */
const { c, h, m, l, re } = PDFOperators;

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

// TODO: Make sure don't need B and b operators because they can be implemented
//       from lower level operations.

/* ======== Test positioning operators ======== */
const { T, Td } = PDFOperators;

// TODO: See if it makes sense to have a Td operator helper. Probably to in
//       order to move the current text position in more ways than just going
//       to the next line. Might also be able to make a helper for the "Tm"
//       operator.

// TODO: Allow an optional number to move more/less than the default line height.
export const nextLine = () => T.asterisk.operator;

export const textPosition = Td.of;

/* ======== Text showing operators ======== */
const { Tj } = PDFOperators;

export const text = Tj.of;

/* ======== Text state operators ======== */
const { Tf, Tc, Tw, Tz, TL, Ts, Tr } = PDFOperators;

export const fontAndSize = Tf.of;

export const charSpacing = Tc.of;

export const wordSpacing = Tw.of;

// Compresses glyphs horizontally - not vertically.
export const charSqueeze = Tz.of;

export const lineHeight = TL.of;

export const textRise = Ts.of;

// TODO: Update this to accept a string enum instead of integers.
//       See this table for reference: "Table 106 – Text rendering modes"
export const textRenderingMode = Tr.of;

/* ======== XObject operator ======== */
const { Do } = PDFOperators;

// TODO: See if this would make more sense as a composite helper, so that
//       the dims can be passed to the operator as well.
export const image = Do.of;

/* ======== Color operators ======== */
const { G, g, K, k, RG, rg } = PDFOperators;

export const fillingGrayscaleColor = g.of;

export const strokingGrayscaleColor = G.of;

export const fillingRgbColor = rg.of;

export const strokingRgbColor = RG.of;

export const fillingCmykColor = k.of;

export const strokingCmykColor = K.of;
