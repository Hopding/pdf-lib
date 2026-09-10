/**
 * Minimal structural types for a fontkit-compatible engine registered via
 * `PDFDocument.registerFontkit`. Compatible with `@cantoo/fontkit` (preferred),
 * upstream `fontkit` v2+, and `@pdf-lib/fontkit`. Not a full mirror of any
 * package's typings — intentionally a structural subset so these engines
 * (and their typings) are assignable to `Fontkit`.
 */

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export interface Glyph {
  id: number;
  codePoints: number[];
  advanceWidth: number;
}

export interface GlyphRun {
  glyphs: Glyph[];
}

export interface SubsetStream {
  on: (
    eventType: 'data' | 'end',
    callback: (data: Uint8Array) => any,
  ) => SubsetStream;
}

export interface Subset {
  /**
   * `@cantoo/fontkit` / upstream fontkit return a subset glyph id (`number`).
   * Older typings / engines may report `boolean`; callers must still treat a
   * non-number as an error.
   */
  includeGlyph(glyph: number | Glyph): number | boolean;
  /** `@cantoo/fontkit` / upstream fontkit v2+ */
  encode?(): Uint8Array;
  /** `@pdf-lib/fontkit` Node-style stream API */
  encodeStream?(): SubsetStream;
}

/** OpenType / AAT feature flags passed to `font.layout`. */
export type TypeFeatures = Record<string, boolean>;

export interface Font {
  postscriptName: string | null;
  unitsPerEm: number;
  ascent: number;
  descent: number;
  italicAngle: number;
  capHeight: number;
  xHeight: number;
  bbox: BoundingBox;
  characterSet: number[];
  /** Present on CFF/OTF fonts; often absent on TrueType. */
  cff?: any;
  'OS/2'?: { sFamilyClass: number };
  head?: { macStyle?: { italic?: boolean } };
  post?: { isFixedPitch?: boolean | number };

  glyphForCodePoint(codePoint: number): Glyph | null;
  layout(str: string, features?: TypeFeatures | string[]): GlyphRun;
  createSubset(): Subset;
}

/** TrueType / DFont collection returned by fontkit for some buffers. */
export interface FontCollection {
  type?: string;
  fonts: Font[];
  getFont?(name: string): Font | null;
}

export type FontkitCreateResult =
  | Font
  | FontCollection
  | null
  | Promise<Font | FontCollection | null>;

export interface Fontkit {
  /**
   * Load a font (or font collection) from raw bytes.
   * Accepts `Uint8Array` / `Buffer` (Buffer is a Uint8Array subclass in Node).
   * For collections (`.ttc` / `.dfont`), pass `postscriptName` to select a face.
   * May return `null` when a collection face cannot be resolved.
   */
  create(buffer: Uint8Array, postscriptName?: string): FontkitCreateResult;
}

export const isFontCollection = (
  font: Font | FontCollection,
): font is FontCollection => {
  if (!font || typeof font !== 'object') return false;
  const candidate = font as FontCollection & Partial<Font>;
  // fontkit collections expose `.fonts`; faces expose layout/glyph APIs instead.
  return (
    Array.isArray(candidate.fonts) &&
    typeof candidate.glyphForCodePoint !== 'function' &&
    typeof candidate.layout !== 'function'
  );
};

/** Narrow `fontkit.create()` result to a single face (rejects TTC/DFont collections). */
export const asFont = (font: Font | FontCollection | null): Font => {
  if (!font) {
    throw new Error(
      'fontkit.create() returned null. Check the font bytes, or pass EmbedFontOptions.postscriptName to select a face from a collection.',
    );
  }
  if (isFontCollection(font)) {
    throw new Error(
      'fontkit.create() returned a font collection (e.g. .ttc/.dfont). Pass EmbedFontOptions.postscriptName to select a face, or embed a single-font file.',
    );
  }
  return font;
};
