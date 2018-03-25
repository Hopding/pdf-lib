import PDFOperators from '../dist/src/core/pdf-operators';
import PDFTextObject from '../dist/src/core/pdf-operators/text/PDFTextObject';
import { PDFContentStream } from '../dist/src/core/pdf-structures';
import { PDFDictionary } from '../dist/src/core/pdf-objects';

const { Q, q, cm, m, l, S, w, d, re, g, c, b, B, RG, rg, Do } = PDFOperators;
const { Tf, Tj, Td, Tr } = PDFOperators;

export const createSpecGraphic = (lookup, x = 0, y = 0, scale = 1) =>
  PDFContentStream.of(
    PDFDictionary.from(new Map(), lookup),
    Q.operator,
    cm.of(scale, 0, 0, scale, x, y),

    // Draw black line segment
    m.of(0, 0),
    l.of(250, 250),
    S.operator,

    // Draw a thicker, dashed line segment
    w.of(4),
    d.of([4, 6], 0),
    m.of(0, 125),
    l.of(275, 125),
    S.operator,
    d.of([], 0),
    w.of(1),

    // Draw a rectangle with a 1-unit red border, filled with light blue.
    RG.of(1.0, 0.0, 0.0),
    rg.of(0.5, 0.75, 1.0),
    re.of(50, 150, 50, 75),
    B.operator,

    // Draw a curve filled with gray and with a colored border.
    RG.of(0.5, 0.1, 0.2),
    g.of(0.7),
    m.of(150, 150),
    c.of(150, 250, 250, 250, 250, 150),
    b.operator,

    q.operator,
  );

export const createTextGraphic = (
  lookup,
  fontOneName,
  fontTwoName,
  fontThreeName,
) =>
  PDFContentStream.of(
    PDFDictionary.from(new Map(), lookup),
    PDFTextObject.of(
      // Draw red colored text at x-y coordinates (50, 500)
      rg.of(1.0, 0.0, 0.0),
      Tf.of(fontOneName, 50),
      Td.of(20, 500),
      Tj.of('This Is A Test Of The...'),

      // Draw a new line of text in a different font
      Tf.of(fontTwoName, 50),
      Td.of(0, -75),
      Tj.of('Embedded Fonts!'),

      // Draw dark-cyan colored text at x-y coordinates (50, 425)
      Tf.of(fontThreeName, 50),
      Td.of(0, -75),
      Tr.of(2),
      w.of(2), // line width
      rg.of(0.0, 0.5, 0.5),
      RG.of(1.0, 0.75, 1.0),
      Tj.of('This Is ALSO A Test...'),
    ),
  );

export const createImageGraphic = (
  lookup,
  firstImgName,
  secondImgName,
  thirdImgName,
  fourthImgName,
) =>
  PDFContentStream.of(
    PDFDictionary.from(new Map(), lookup),
    // Draw a rectangle with a 1-unit red border, filled with light blue.
    q.operator,
    RG.of(1.0, 0.0, 0.0),
    rg.of(0.5, 0.75, 1.0),
    re.of(0, 0, 500, 500),
    B.operator,
    Q.operator,

    q.operator,
    cm.of(250, 0, 0, 250, 0, 250),
    Do.of(firstImgName),
    Q.operator,

    q.operator,
    cm.of(250, 0, 0, 125, 250, 250),
    Do.of(secondImgName),
    Q.operator,

    q.operator,
    cm.of(250, 0, 0, 250, 0, 0),
    Do.of(thirdImgName),
    Q.operator,

    q.operator,
    cm.of(250, 0, 0, 250, 250, 0),
    Do.of(fourthImgName),
    Q.operator,
  );
