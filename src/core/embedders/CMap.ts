import { Glyph } from 'src/types/fontkit';

import { toHexString, toHexStringOfMinLength } from 'src/utils';
import {
  hasSurrogates,
  highSurrogate,
  isWithinBMP,
  lowSurrogate,
} from 'src/utils/unicode';

/** [[start, end], mappings] */
type BfRange = [[string, string], string[]];

/** `glyphs` should be an array of unique glyphs sorted by their ID */
export const createCmap = (glyphs: Glyph[], glyphId: (g?: Glyph) => number) => {
  const bfRanges: BfRange[] = [];

  let first: number = glyphId(glyphs[0]);
  let mappings: string[] = [];

  for (let idx = 0, len = glyphs.length; idx < len; idx++) {
    const currGlyph = glyphs[idx];
    const nextGlyph = glyphs[idx + 1];

    const currGlyphId = glyphId(currGlyph);
    const nextGlyphId = glyphId(nextGlyph);

    const { codePoints } = currGlyph;
    mappings.push(cmapHexFormat(...codePoints.map(cmapCodePointFormat)));

    if (idx !== 0 && nextGlyphId - currGlyphId !== 1) {
      const last = currGlyphId;
      const delimiters: [string, string] = [
        cmapHexFormat(cmapHexString(first)),
        cmapHexFormat(cmapHexString(last)),
      ];
      bfRanges.push([delimiters, mappings]);

      first = nextGlyphId;
      mappings = [];
    }
  }

  return fillCmapTemplate(bfRanges);
};

/* =============================== Templates ================================ */

// prettier-ignore
const fillBfrangeTemplate = ([[start, end], mappings]: BfRange) => `
${mappings.length} beginbfrange
${start} ${end} [${mappings.join(' ')}]
endbfrange
`.trim();

// prettier-ignore
const fillCmapTemplate = (bfRanges: BfRange[]) => `
/CIDInit /ProcSet findresource begin
12 dict begin
begincmap
/CIDSystemInfo <<
  /Registry (Adobe)
  /Ordering (UCS)
  /Supplement 0
>> def
/CMapName /Adobe-Identity-UCS def
/CMapType 2 def
1 begincodespacerange
<0000><ffff>
endcodespacerange
${bfRanges.map(fillBfrangeTemplate).join('\n')}
endcmap
CMapName currentdict /CMap defineresource pop
end
end
`.trim();

/* =============================== Utilities ================================ */

const cmapHexFormat = (...values: string[]) => `<${values.join('')}>`;

const cmapHexString = (value: number) => toHexStringOfMinLength(value, 4);

const cmapCodePointFormat = (codePoint: number) => {
  if (isWithinBMP(codePoint)) return cmapHexString(codePoint);

  if (hasSurrogates(codePoint)) {
    const hs = highSurrogate(codePoint);
    const ls = lowSurrogate(codePoint);
    return `${cmapHexString(hs)}${cmapHexString(ls)}`;
  }

  const hex = toHexString(codePoint);
  const msg = `0x${hex} is not a valid UTF-8 or UTF-16 codepoint.`;
  throw new Error(msg);
};
