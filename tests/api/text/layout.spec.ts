import { PDFDocument, StandardFonts, TextAlignment } from 'src/index';

import { layoutMultilineText } from 'src/api/text/layout';

const MIN_FONT_SIZE = 4;
const MAX_FONT_SIZE = 500;

describe(`layoutMultilineText`, () => {
  it('should layout the text on one line when it fits near-perfectly', async () => {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const alignment = TextAlignment.Left;
    const padding = 0;
    const borderWidth = 0;
    const text = 'Super Mario Bros.';

    for (let fontSize = MIN_FONT_SIZE; fontSize <= MAX_FONT_SIZE; fontSize++) {
      const height = font.heightAtSize(fontSize) - (borderWidth + padding) * 2;

      const width =
        font.widthOfTextAtSize(text, fontSize) - (borderWidth + padding) * 2;

      const bounds = {
        x: borderWidth + padding,
        y: borderWidth + padding,
        width,
        height,
      };

      const multilineTextLayout = layoutMultilineText(text, {
        alignment,
        bounds,
        font,
      });

      expect(multilineTextLayout.lines.length).toStrictEqual(1);
    }
  });

  it('should layout the text on one line when it fits comfortably', async () => {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const alignment = TextAlignment.Left;
    const padding = 0;
    const borderWidth = 0;
    const text = 'Super Mario Bros.';
    const fontSize = 12;
    const height = font.heightAtSize(fontSize) - (borderWidth + padding) * 2;

    // Bounds width twice that of the text
    const width =
      (font.widthOfTextAtSize(text, fontSize) - (borderWidth + padding) * 2) *
      2;

    const bounds = {
      x: borderWidth + padding,
      y: borderWidth + padding,
      width,
      height,
    };

    const multilineTextLayout = layoutMultilineText(text, {
      alignment,
      bounds,
      font,
    });

    expect(multilineTextLayout.lines.length).toStrictEqual(1);
  });

  it('should layout the text on multiple lines when it does not fit horizontally but there is space vertically', async () => {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const alignment = TextAlignment.Left;
    const padding = 0;
    const borderWidth = 0;
    const text = 'Super Mario Bros.';

    for (let fontSize = MIN_FONT_SIZE; fontSize <= MAX_FONT_SIZE; fontSize++) {
      // Height twice that of the text
      const height =
        (font.heightAtSize(fontSize) - (borderWidth + padding) * 2) * 2;

      // Width half that of the text
      const width =
        (font.widthOfTextAtSize(text, fontSize) - (borderWidth + padding) * 2) /
        2;

      const bounds = {
        x: borderWidth + padding,
        y: borderWidth + padding,
        width,
        height,
      };

      const multilineTextLayout = layoutMultilineText(text, {
        alignment,
        bounds,
        font,
      });

      expect(multilineTextLayout.lines.length).toStrictEqual(2);
    }
  });

  it('should never exceed the maximum font size', async () => {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const alignment = TextAlignment.Left;
    const padding = 0;
    const borderWidth = 0;
    const text = 'Super Mario Bros.';

    const height = Number.MAX_VALUE;
    const width = Number.MAX_VALUE;

    const bounds = {
      x: borderWidth + padding,
      y: borderWidth + padding,
      width,
      height,
    };

    const multilineTextLayout = layoutMultilineText(text, {
      alignment,
      bounds,
      font,
    });

    expect(multilineTextLayout.lines.length).toStrictEqual(1);
    expect(multilineTextLayout.fontSize).toStrictEqual(MAX_FONT_SIZE);
  });

  it('should respect empty lines', async () => {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const alignment = TextAlignment.Left;
    const padding = 0;
    const borderWidth = 0;
    const lines = ['Super Mario Bros.', '', 'Boop'];
    const text = lines.join('\n');

    for (let fontSize = MIN_FONT_SIZE; fontSize <= MAX_FONT_SIZE; fontSize++) {
      const height = font.heightAtSize(fontSize) - (borderWidth + padding) * 2;

      const width =
        font.widthOfTextAtSize(lines[0], fontSize) -
        (borderWidth + padding) * 2;

      const bounds = {
        x: borderWidth + padding,
        y: borderWidth + padding,
        width,
        height,
      };

      const multilineTextLayout = layoutMultilineText(text, {
        alignment,
        bounds,
        font,
      });

      expect(multilineTextLayout.lines.length).toStrictEqual(3);
    }
  });
});
