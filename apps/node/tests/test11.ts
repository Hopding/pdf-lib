import fontkit from '@pdf-lib/fontkit';
import { Assets } from '..';
import { last, PDFDocument, PDFFont, StandardFonts } from '../../..';

// JavaScript's String.charAt() method doesn work on strings containing UTF-16
// characters (with high and low surrogate pairs), such as 💩 (poo emoji). This
// `glyphAtIndex()` function does.
//
// Credit: https://github.com/mathiasbynens/String.prototype.at/blob/master/at.js#L14-L48
const glyphAtIndex = (text: string, index: number) => {
  // Get the first code unit and code unit value
  const cuFirst = text.charCodeAt(index);
  let cuSecond;
  const nextIndex = index + 1;
  let len = 1;
  if (
    // Check if it’s the start of a surrogate pair.
    cuFirst >= 0xd800 &&
    cuFirst <= 0xdbff && // high surrogate
    text.length > nextIndex // there is a next code unit
  ) {
    cuSecond = text.charCodeAt(nextIndex);
    if (cuSecond >= 0xdc00 && cuSecond <= 0xdfff) {
      // low surrogate
      len = 2;
    }
  }
  return text.slice(index, index + len);
};

const breakTextIntoLines = (
  text: string,
  size: number,
  font: PDFFont,
  maxWidth: number,
) => {
  const lines: string[] = [];
  let textIdx = 0;
  while (textIdx < text.length) {
    let line = '';
    while (textIdx < text.length) {
      if (text.charAt(textIdx) === '\n') {
        lines.push(line);
        textIdx += 1;
        line = '';
        continue;
      }
      const glyph = glyphAtIndex(text, textIdx);
      const newLine = line + glyph;
      if (font.widthOfTextAtSize(newLine, size) > maxWidth) break;
      line = newLine;
      textIdx += glyph.length;
    }
    lines.push(line);
  }
  return lines;
};

const breakLinesIntoGroups = (
  lines: string[],
  lineHeight: number,
  maxHeight: number,
) => {
  const linesPerGroup = Math.floor(maxHeight / lineHeight);
  const groups: string[][] = [[]];
  for (let idx = 0, len = lines.length; idx < len; idx++) {
    const line = lines[idx];
    if (last(groups).length === linesPerGroup) {
      groups.push([]);
    }
    last(groups).push(line);
  }
  return groups;
};

export default async (assets: Assets) => {
  const { fonts } = assets;

  const pdfDoc = await PDFDocument.create();

  pdfDoc.registerFontkit(fontkit);

  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const title = 'Embedded UTF-16 Font Demo';
  const description = `
    In addition to the standard 14 fonts provided by PDF readers, the PDF
    specification allows PDF documents to embed their own fonts. The standard
    14 fonts only support a very limited latin and symbolic character set, but
    embedded fonts can support arbitrary character sets and glyphs.
    
    This document is a demonstration of an embedded font. Specifically, the
    Source Han Serif Japanese Regular font. The following pages render all
    characters supported by this font.

    The characters are rendered from greatest to least (ordered by their
    code points). Take special note of the first 1.25 pages of glyphs, as these
    glyphs represent UTF-16 code points (the rest of the glyphs in this document
    are UTF-8).`;

  const descriptionLines = breakTextIntoLines(
    description,
    16,
    helveticaFont,
    600,
  );

  const titlePage = pdfDoc.addPage([650, 700]);
  titlePage.drawText(title, {
    font: helveticaBoldFont,
    size: 35,
    y: 700 - 100,
    x: 650 / 2 - helveticaBoldFont.widthOfTextAtSize(title, 35) / 2,
  });
  titlePage.drawText(descriptionLines.join('\n'), {
    font: helveticaFont,
    size: 16,
    y: 525,
    x: 25,
  });

  const sourceHanFont = await pdfDoc.embedFont(fonts.otf.source_hans_jp);

  const sourceHanFontSize = 20;
  const sourceHanString = String.fromCodePoint(
    ...sourceHanFont.getCharacterSet().reverse(),
  );
  const sourceHanLines = breakTextIntoLines(
    sourceHanString,
    sourceHanFontSize,
    sourceHanFont,
    600,
  );
  const sourceHanLineGroups = breakLinesIntoGroups(
    sourceHanLines,
    sourceHanFont.heightAtSize(sourceHanFontSize) + 10,
    675,
  );

  sourceHanLineGroups.forEach((lines) => {
    const page = pdfDoc.addPage([650, 700]);
    page.drawText(lines.join('\n'), {
      font: sourceHanFont,
      size: sourceHanFontSize,
      x: 25,
      y: 700 - 25 - sourceHanFontSize,
      lineHeight: sourceHanFont.heightAtSize(sourceHanFontSize) + 10,
    });
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};
