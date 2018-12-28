import chunk from 'lodash/chunk';
import {
  drawLinesOfText,
  PDFDocument,
  PDFDocumentFactory,
  PDFDocumentWriter,
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
  title: 'PDF with Missing "endstream" EOL-Marker and Modified CTM Test',
  description:
    'This tests that PDFs with missing EOL markers before their "endstream" keywords and a modified CTM can be parsed and modified with the default CTM.\nhttps://github.com/Hopding/pdf-lib/issues/12',
  checklist: [
    // 'the background of the PDF is a WaveOC USA, Inc. refund receipt.',
    // 'an image of Mario running is drawn on top of the receipt.',
    // 'the same image of Mario is drawn upside down and skewed.',
    // 'a box with solarized text is drawn underneath Mario.',
    // 'this box of text is angled upwards and skewed to the right.',
  ],
};
