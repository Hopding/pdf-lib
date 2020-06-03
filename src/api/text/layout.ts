import PDFFont from 'src/api/PDFFont';
import { PDFHexString } from 'src/core';
import { cleanText, lineSplit, mergeLines, charAtIndex } from 'src/utils';

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
) => {
  let fontSize = MIN_FONT_SIZE;

  while (fontSize < MAX_FONT_SIZE) {
    for (let idx = 0, len = lines.length; idx < len; idx++) {
      const line = lines[idx];
      const tooLong = font.widthOfTextAtSize(line, fontSize) > bounds.width;
      if (tooLong) return fontSize - 1;
    }

    const lineHeight = font.heightAtSize(fontSize);
    const height = lines.length * lineHeight;
    if (height > bounds.height) return fontSize - 1;

    fontSize += 1;
  }

  return fontSize;
};

export interface LayoutTextOptions {
  alignment: 'left' | 'center' | 'right';
  fontSize?: number;
  font: PDFFont;
  bounds: LayoutBounds;
}

export interface MultilineTextLayout {
  bounds: LayoutBounds;
  lines: TextPosition[];
  fontSize: number;
}

export const layoutMultilineText = (
  text: string,
  { alignment, fontSize, font, bounds }: LayoutTextOptions,
): MultilineTextLayout => {
  const lines = lineSplit(cleanText(text));

  if (fontSize === undefined || fontSize === 0) {
    fontSize = computeFontSize(lines, font, bounds);
  }

  const textLines: TextPosition[] = [];

  let minX = bounds.width;
  let minY = bounds.height;
  let maxX = bounds.x;
  let maxY = bounds.y;

  let y = bounds.height;
  for (let idx = 0, len = lines.length; idx < len; idx++) {
    const line = lines[idx];

    const encoded = font.encodeText(line);
    const width = font.widthOfTextAtSize(line, fontSize);
    const height = font.heightAtSize(fontSize);

    // prettier-ignore
    const x = (
        alignment === 'left'   ? bounds.x
      : alignment === 'center' ? bounds.x + (bounds.width / 2) - (width / 2)
      : alignment === 'right'  ? bounds.x + bounds.width - width
      : bounds.x
    );

    y -= height;

    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x + width > maxX) maxX = x + width;
    if (y + height > maxY) maxY = y + height;

    textLines.push({ text: line, encoded, width, height, x, y });
  }

  return {
    fontSize,
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
    throw new Error('TODO: FIX ME!!! length mismatch');
  }

  if (fontSize === undefined || fontSize === 0) {
    fontSize = computeFontSize([line], font, bounds);
  }

  const cellWidth = bounds.width / cellCount;

  const height = font.heightAtSize(fontSize);
  const y = bounds.height / 2 - height / 2;

  const cells: TextPosition[] = [];

  let minX = bounds.width;
  let minY = bounds.height;
  let maxX = bounds.x;
  let maxY = bounds.y;

  let cellOffset = 0;
  let charOffset = 0;
  while (cellOffset < cellCount) {
    const [char, charLength] = charAtIndex(line, charOffset);

    const encoded = font.encodeText(char);
    const width = font.widthOfTextAtSize(char, fontSize);

    const cellCenter = cellWidth * cellOffset + cellWidth / 2;
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
  alignment: 'left' | 'center' | 'right';
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
  const height = font.heightAtSize(fontSize);

  // prettier-ignore
  const x = (
      alignment === 'left'   ? bounds.x
    : alignment === 'center' ? bounds.x + (bounds.width / 2) - (width / 2)
    : alignment === 'right'  ? bounds.x + bounds.width - width
    : bounds.x
  );

  const y = bounds.height / 2 - height / 2;

  return {
    fontSize,
    line: { text: line, encoded, width, height, x, y },
    bounds: { x, y, width, height },
  };
};
