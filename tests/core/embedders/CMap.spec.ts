import fontkit from '@cantoo/fontkit';
import { Font, Glyph, asFont } from '../../../src/types/fontkit';
import fs from 'fs';

import { createCmap } from '../../../src/core/embedders/CMap';
import { byAscendingId, sortedUniq } from '../../../src/utils';

const ubuntuFont = fs.readFileSync('./assets/fonts/ubuntu/Ubuntu-R.ttf');
const sourceHansJpFont = fs.readFileSync(
  './assets/fonts/source_hans_jp/SourceHanSerifJP-Regular.otf',
);

const ubuntuFontCmap = fs.readFileSync(
  './tests/core/embedders/data/Ubuntu-R.ttf.cmap',
);
const sourceHansJpFontCmap = fs.readFileSync(
  './tests/core/embedders/data/SourceHanSerifJP-Regular.otf.cmap',
);

const allGlyphsInFontSortedById = (font: Font) => {
  const glyphs: Glyph[] = [];
  for (let idx = 0, len = font.characterSet.length; idx < len; idx++) {
    const glyph = font.glyphForCodePoint(font.characterSet[idx]);
    if (glyph) glyphs.push(glyph);
  }
  return sortedUniq(glyphs.sort(byAscendingId), (g) => g.id);
};

describe('createCmap', () => {
  it('creates CMaps for embedded Ubuntu-R font files', () => {
    const font = asFont(fontkit.create(ubuntuFont));

    const glyphs = allGlyphsInFontSortedById(font);
    const cmap = createCmap(glyphs, (g) => (g ? g.id : -1));

    expect(cmap).toEqual(String(ubuntuFontCmap));
  });

  it('creates CMaps for embedded SourceHanSerifJP-Regular font files', () => {
    const font = asFont(fontkit.create(sourceHansJpFont));

    const glyphs = allGlyphsInFontSortedById(font);
    const cmap = createCmap(glyphs, (g) => (g ? g.id : -1));

    expect(cmap).toEqual(String(sourceHansJpFontCmap));
  });
});
