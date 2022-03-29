import PDFFont from 'src/api/PDFFont';
import { CombedTextLayoutError } from 'src/api/errors';
import { TextAlignment } from 'src/api/text/alignment';

import { PDFHexString } from 'src/core';
import {
  cleanText,
  lineSplit,
  mergeLines,
  charAtIndex,
  charSplit,
} from 'src/utils';

export interface TextPosition {
  text: string;
  encoded: PDFHexString;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LayoutBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

const MIN_FONT_SIZE = 4;
const MAX_FONT_SIZE = 500;

const computeFontSize = (
  lines: string[],
  font: PDFFont,
  bounds: LayoutBounds,
  multiline: boolean = false,
) => {
  let fontSize = MIN_FONT_SIZE;

  while (fontSize < MAX_FONT_SIZE) {
    let linesUsed = 0;

    for (
      let lineIdx = 0, lineLen = lines.length;
      lineIdx < lineLen;
      lineIdx++
    ) {
      linesUsed += 1;

      const line = lines[lineIdx];
      const words = line.split(' ');

      // Layout the words using the current `fontSize`, line wrapping
      // whenever we reach the end of the current line.
      let spaceInLineRemaining = bounds.width;
      for (let idx = 0, len = words.length; idx < len; idx++) {
        const isLastWord = idx === len - 1;
        const word = isLastWord ? words[idx] : words[idx] + ' ';
        const widthOfWord = font.widthOfTextAtSize(word, fontSize);
        spaceInLineRemaining -= widthOfWord;
        if (spaceInLineRemaining <= 0) {
          linesUsed += 1;
          spaceInLineRemaining = bounds.width - widthOfWord;
        }
      }
    }

    // Return if we exceeded the allowed width
    if (!multiline && linesUsed > lines.length) return fontSize - 1;

    const height = font.heightAtSize(fontSize);
    const lineHeight = height + height * 0.2;
    const totalHeight = lineHeight * linesUsed;

    // Return if we exceeded the allowed height
    if (totalHeight > Math.abs(bounds.height)) return fontSize - 1;

    fontSize += 1;
  }

  return fontSize;
};

const computeCombedFontSize = (
  line: string,
  font: PDFFont,
  bounds: LayoutBounds,
  cellCount: number,
) => {
  const cellWidth = bounds.width / cellCount;
  const cellHeight = bounds.height;

  let fontSize = MIN_FONT_SIZE;

  const chars = charSplit(line);
  while (fontSize < MAX_FONT_SIZE) {
    for (let idx = 0, len = chars.length; idx < len; idx++) {
      const c = chars[idx];
      const tooLong = font.widthOfTextAtSize(c, fontSize) > cellWidth * 0.75;
      if (tooLong) return fontSize - 1;
    }

    const height = font.heightAtSize(fontSize, { descender: false });
    if (height > cellHeight) return fontSize - 1;

    fontSize += 1;
  }

  return fontSize;
};

export interface LayoutTextOptions {
  alignment: TextAlignment;
  fontSize?: number;
  font: PDFFont;
  bounds: LayoutBounds;
}

export interface MultilineTextLayout {
  bounds: LayoutBounds;
  lines: TextPosition[];
  fontSize: number;
  lineHeight: number;
}

const splitOutLines = (
  input: string,
  maxWidth: number,
  font: PDFFont,
  fontSize: number,
) => {
  if (font.widthOfTextAtSize(input, fontSize) > maxWidth) {
    const tokens: string[] = [''];
    const whitespaces: string[] = [];
    let width = 0;

    for (let i = 0; i < input.length; i++) {
      const s = input[i];

      // If this character puts us over then we're done.
      if (width + font.widthOfTextAtSize(s, fontSize) >= maxWidth) {
        let line = '';
        let remainder;
        if (/\s/.test(s)) {
          line = tokens.map((token, i) => token + (whitespaces[i] ?? '')).join('');
          remainder = input.substring(i) || undefined;
        } else {
          // We're in the middle of a token so go back to the last token and 
          // adjust remainder based on the length of the current incomplete token
          line = tokens.slice(0, tokens.length - 1).map((token, i) => token + (whitespaces[i] ?? '')).join('');
          
          const whitespaceLength = (whitespaces[whitespaces.length - 1] || '').length;
          const tokenLength = (tokens[tokens.length - 1] || '').length;
          if (whitespaceLength === 0) {
              // Not able to layout this input within the maxWidth.
              break;
          }
          const remainderIndex = i - whitespaceLength - tokenLength;
          remainder = input.substring(remainderIndex) || undefined;
        }

        return {
          line,
          encoded: font.encodeText(line),
          width: font.widthOfTextAtSize(line, fontSize),
          remainder
        };
      }

      if (/\s/.test(s)) {
        // Found a word boundary. 
        // We will add each subsequent character to the current token until we find another word boundary.
        whitespaces.push(s);
        tokens.push('');
      } else {
        tokens[tokens.length - 1] += s;
      }

      width += font.widthOfTextAtSize(s, fontSize);
    }
  }

  // We were unable to split the input enough to get a chunk that would fit
  // within the specified `maxWidth` so we'll just return everything
  return {
    line: input,
    encoded: font.encodeText(input),
    width: font.widthOfTextAtSize(input, fontSize),
    remainder: undefined,
  };
};

export const layoutMultilineText = (
  text: string,
  { alignment, fontSize, font, bounds }: LayoutTextOptions,
): MultilineTextLayout => {
  const lines = lineSplit(cleanText(text));

  if (fontSize === undefined || fontSize === 0) {
    fontSize = computeFontSize(lines, font, bounds, true);
  }
  const height = font.heightAtSize(fontSize);
  const lineHeight = height + height * 0.2;

  const textLines: TextPosition[] = [];

  let minX = bounds.x;
  let minY = bounds.y;
  let maxX = bounds.x + bounds.width;
  let maxY = bounds.y + bounds.height;

  let y = bounds.y + bounds.height;
  for (let idx = 0, len = lines.length; idx < len; idx++) {
    let prevRemainder: string | undefined = lines[idx];
    while (prevRemainder !== undefined) {
      const { line, encoded, width, remainder } = splitOutLines(
        prevRemainder,
        bounds.width,
        font,
        fontSize,
      );

      // prettier-ignore
      const x = (
          alignment === TextAlignment.Left   ? bounds.x
        : alignment === TextAlignment.Center ? bounds.x + (bounds.width / 2) - (width / 2)
        : alignment === TextAlignment.Right  ? bounds.x + bounds.width - width
        : bounds.x
      );

      y -= lineHeight;

      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x + width > maxX) maxX = x + width;
      if (y + height > maxY) maxY = y + height;

      textLines.push({ text: line, encoded, width, height, x, y });

      // Only trim lines that we had to split ourselves. So we won't trim lines
      // that the user provided themselves with whitespace.
      prevRemainder = remainder?.trim();
    }
  }

  return {
    fontSize,
    lineHeight,
    lines: textLines,
    bounds: {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    },
  };
};

export interface LayoutCombedTextOptions {
  fontSize?: number;
  font: PDFFont;
  bounds: LayoutBounds;
  cellCount: number;
}

export interface CombedTextLayout {
  bounds: LayoutBounds;
  cells: TextPosition[];
  fontSize: number;
}

export const layoutCombedText = (
  text: string,
  { fontSize, font, bounds, cellCount }: LayoutCombedTextOptions,
): CombedTextLayout => {
  const line = mergeLines(cleanText(text));

  if (line.length > cellCount) {
    throw new CombedTextLayoutError(line.length, cellCount);
  }

  if (fontSize === undefined || fontSize === 0) {
    fontSize = computeCombedFontSize(line, font, bounds, cellCount);
  }

  const cellWidth = bounds.width / cellCount;

  const height = font.heightAtSize(fontSize, { descender: false });
  const y = bounds.y + (bounds.height / 2 - height / 2);

  const cells: TextPosition[] = [];

  let minX = bounds.x;
  let minY = bounds.y;
  let maxX = bounds.x + bounds.width;
  let maxY = bounds.y + bounds.height;

  let cellOffset = 0;
  let charOffset = 0;
  while (cellOffset < cellCount) {
    const [char, charLength] = charAtIndex(line, charOffset);

    const encoded = font.encodeText(char);
    const width = font.widthOfTextAtSize(char, fontSize);

    const cellCenter = bounds.x + (cellWidth * cellOffset + cellWidth / 2);
    const x = cellCenter - width / 2;

    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x + width > maxX) maxX = x + width;
    if (y + height > maxY) maxY = y + height;

    cells.push({ text: line, encoded, width, height, x, y });

    cellOffset += 1;
    charOffset += charLength;
  }

  return {
    fontSize,
    cells,
    bounds: {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    },
  };
};

export interface LayoutSinglelineTextOptions {
  alignment: TextAlignment;
  fontSize?: number;
  font: PDFFont;
  bounds: LayoutBounds;
}

export interface SinglelineTextLayout {
  bounds: LayoutBounds;
  line: TextPosition;
  fontSize: number;
}

export const layoutSinglelineText = (
  text: string,
  { alignment, fontSize, font, bounds }: LayoutSinglelineTextOptions,
): SinglelineTextLayout => {
  const line = mergeLines(cleanText(text));

  if (fontSize === undefined || fontSize === 0) {
    fontSize = computeFontSize([line], font, bounds);
  }

  const encoded = font.encodeText(line);
  const width = font.widthOfTextAtSize(line, fontSize);
  const height = font.heightAtSize(fontSize, { descender: false });

  // prettier-ignore
  const x = (
      alignment === TextAlignment.Left   ? bounds.x
    : alignment === TextAlignment.Center ? bounds.x + (bounds.width / 2) - (width / 2)
    : alignment === TextAlignment.Right  ? bounds.x + bounds.width - width
    : bounds.x
  );

  const y = bounds.y + (bounds.height / 2 - height / 2);

  return {
    fontSize,
    line: { text: line, encoded, width, height, x, y },
    bounds: { x, y, width, height },
  };
};
