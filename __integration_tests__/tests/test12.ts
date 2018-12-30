import chunk from 'lodash/chunk';
import {
  drawLinesOfText,
  drawText,
  PDFDocumentFactory,
  PDFDocumentWriter,
  StandardFonts,
} from '../../src';

import PDFEmbeddedFontFactory from 'core/pdf-structures/factories/PDFEmbeddedFontFactory';
import PDFStandardFontFactory from 'core/pdf-structures/factories/PDFStandardFontFactory';
import { ITestAssets } from '../models';

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
  font: PDFEmbeddedFontFactory | PDFStandardFontFactory,
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
  return chunk(lines, linesPerGroup);
};

// Define the test kernel using the above content stream functions.
const kernel = (assets: ITestAssets) => {
  const pdfDoc = PDFDocumentFactory.create();

  const [helveticaRef, helveticaFont] = pdfDoc.embedStandardFont(
    StandardFonts.Helvetica,
  );
  const [helveticaBoldRef, helveticaBoldFont] = pdfDoc.embedStandardFont(
    StandardFonts.HelveticaBold,
  );

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
  const titlePageContentStreamRef = pdfDoc.register(
    pdfDoc.createContentStream(
      drawText(helveticaBoldFont.encodeText(title), {
        font: 'HelveticaBold',
        size: 35,
        y: 700 - 100,
        x: 650 / 2 - helveticaBoldFont.widthOfTextAtSize(title, 35) / 2,
      }),
      drawLinesOfText(descriptionLines.map(helveticaFont.encodeText), {
        font: 'Helvetica',
        size: 16,
        y: 525,
        x: 25,
      }),
    ),
  );
  const titlePage = pdfDoc
    .createPage([650, 700])
    .addFontDictionary('Helvetica', helveticaRef)
    .addFontDictionary('HelveticaBold', helveticaBoldRef)
    .addContentStreams(titlePageContentStreamRef);
  pdfDoc.addPage(titlePage);

  const [sourceHanRef, sourceHanFont] = pdfDoc.embedNonstandardFont(
    assets.fonts.otf.source_hans_jp,
  );

  const sourceHanFontSize = 20;
  const sourceHanString = String.fromCodePoint(
    ...sourceHanFont.font.characterSet.reverse(),
  );
  const sourceHanLines = breakTextIntoLines(
    sourceHanString,
    sourceHanFontSize,
    sourceHanFont,
    600,
  );
  const sourceHanLineGroups = breakLinesIntoGroups(
    sourceHanLines,
    sourceHanFont.heightOfFontAtSize(sourceHanFontSize) + 10,
    675,
  );

  sourceHanLineGroups.forEach((lines) => {
    const sourceHanContentStreamRef = pdfDoc.register(
      pdfDoc.createContentStream(
        drawLinesOfText(lines.map(sourceHanFont.encodeText), {
          font: 'SourceHan',
          size: sourceHanFontSize,
          x: 25,
          y: 700 - 25 - sourceHanFontSize,
          lineHeight: sourceHanFont.heightOfFontAtSize(sourceHanFontSize) + 10,
        }),
      ),
    );
    const page = pdfDoc
      .createPage([650, 700])
      .addFontDictionary('SourceHan', sourceHanRef)
      .addContentStreams(sourceHanContentStreamRef);
    pdfDoc.addPage(page);
  });

  return PDFDocumentWriter.saveToBytes(pdfDoc);
};

export default {
  kernel,
  title: 'Embedded Font with UTF-8 and UTF-16 Characters Test',
  description:
    'This tests that fonts containing characters outside the "standard" WinAnsi character set can be embedded, and their glyphs rendered correctly.',
  checklist: [
    'the PDF contains 34 pages.',
    `the first page is titled "Embedded UTF-16 Font Demo".`,
    `the first page contains a description of the document.`,
    `the remaining 33 pages contain all glyphs from the Source Han Serif Japanese Regular font.`,
    `the first 1.25 pages contain no unknown glyph markers (usually displayed as boxes with "x"s in them)`,
  ],
};
