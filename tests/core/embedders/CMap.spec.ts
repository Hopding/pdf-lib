import fontkit, { Glyph } from '@pdf-lib/fontkit';
import fs from 'fs';

import { createCmap } from 'src/core/embedders/CMap';
import { byAscendingId, sortedUniq } from 'src/utils';

const ubuntuFont = fs.readFileSync('./assets/fonts/ubuntu/Ubuntu-R.ttf');
const ubuntuFontCmap = fs.readFileSync(
  './tests/core/embedders/data/Ubuntu-R.ttf.cmap',
);

describe(`createCmap`, () => {
  it(`created CMaps for embedded font files`, () => {
    const font = fontkit.create(ubuntuFont);

    const glyphs: Glyph[] = new Array(font.characterSet.length);
    for (let idx = 0, len = glyphs.length; idx < len; idx++) {
      const codePoint = font.characterSet[idx];
      glyphs[idx] = font.glyphForCodePoint(codePoint);
    }

    const allGlyphsInFontSortedById = sortedUniq(
      glyphs.sort(byAscendingId),
      (g) => g.id,
    );
    const cmap = createCmap(allGlyphsInFontSortedById, (g) => (g ? g.id : -1));

    expect(cmap).toEqual(String(ubuntuFontCmap));
  });
});
