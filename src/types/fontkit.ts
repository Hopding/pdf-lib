/**
 * Represents a glyph bounding box
 */
export interface BoundingBox {
  minX: number /** The minimum X position in the bounding box */;
  minY: number /** The minimum Y position in the bounding box */;
  maxX: number /** The maxmimum X position in the bounding box */;
  maxY: number /** The maxmimum Y position in the bounding box */;
  width: number /** The width of the bounding box */;
  height: number /** The height of the bounding box */;
}

/**
 * Path objects are returned by glyphs and represent the actual vector outlines
 * for each glyph in the font. Paths can be converted to SVG path data strings,
 * or to functions that can be applied to render the path to a graphics context.
 */
export interface Path {
  /**
   * This property represents the path’s bounding box, i.e. the smallest
   * rectangle that contains the entire path shape. This is the exact
   * bounding box, taking into account control points that may be outside the
   * visible shape.
   */
  bbox: BoundingBox;

  /**
   * This property represents the path’s control box. It is like the
   * bounding box, but it includes all points of the path, including control
   * points of bezier segments. It is much faster to compute than the real
   * bounding box, but less accurate if there are control points outside of the
   * visible shape.
   */
  cbox: BoundingBox;

  /**
   * Moves the virtual pen to the given x, y coordinates.
   */
  moveTo(x: number, y: number): void;

  /**
   * Adds a line to the path from the current point to the
   * given x, y coordinates.
   */
  lineTo(x: number, y: number): void;

  /**
   * Adds a quadratic curve to the path from the current point to the
   * given x, y coordinates using cpx, cpy as a control point.
   */
  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;

  /**
   * Adds a bezier curve to the path from the current point to the
   * given x, y coordinates using cp1x, cp1y and cp2x, cp2y as control points.
   */
  bezierCurveTo(
    cp1x: number,
    cp1y: number,
    cp2x: number,
    cp2y: number,
    x: number,
    y: number,
  ): void;

  /**
   * Closes the current sub-path by drawing a straight line back to the
   * starting point.
   */
  closePath(): void;

  /**
   * Compiles the path to a JavaScript function that can be applied with a
   * graphics context in order to render the path.
   */
  toFunction(): Function; // tslint:disable-line ban-types

  /**
   * Converts the path to an SVG path data string.
   */
  toSVG(): string;
}

/**
 * Glyph objects represent a glyph in the font. They have various properties for
 * accessing metrics and the actual vector path the glyph represents, and
 * methods for rendering the glyph to a graphics context.
 *
 * You do not create glyph objects directly. They are created by various methods
 * on the Font object. There are several subclasses of the base Glyph class
 * internally that may be returned depending on the font format, but they all
 * include the following API.
 */
export interface Glyph {
  // Properties
  id: number /** The glyph's id in the font */;
  /**
   * An array of unicode code points that are represented by this glyph. There
   * can be multiple code points in the case of ligatures and other glyphs that
   * represent multiple visual characters.
   */
  codePoints: number[];
  path: Path /** Vector Path object representing the glyph */;
  /**
   * The Glyph’s bounding box, i.e. the rectangle that encloses the glyph
   * outline as tightly as possible.
   */
  bbox: BoundingBox;
  /**
   * The Glyph’s control box. This is often the same as the bounding box, but is
   * faster to compute. Because of the way bezier curves are defined, some of
   * the control points can be outside of the bounding box. Where bbox takes
   * this into account, cbox does not. Thus, cbox is less accurate, but faster
   * to compute.
   */
  cbox: BoundingBox;
  advanceWidth: number /** The Glyph's advance width */;

  /**
   * For COLR glyphs, which are vector based, this returns an array of objects
   * representing the glyphs and colors for each layer in render order.
   */
  layers: any[];

  // Methods
  /**
   * Renders the glyph to the given graphics context, at the specified
   * font size.
   */
  render(context: any, size: number): void;

  // Color Glyph Properties/Methods
  /**
   * For SBIX glyphs, which are bitmap based, this returns an object containing
   * some properties about the image, along with the image data itself
   * (usually PNG).
   */
  getImageForSize(size: number): Uint8Array;
}

/**
 * Represents positioning information for a glyph in a GlyphRun.
 */
export interface GlyphPosition {
  /**
   * The amount to move the virtual pen in the X direction after rendering
   * this glyph.
   */
  xAdvance: number;

  /**
   * The amount to move the virtual pen in the Y direction after rendering
   * this glyph.
   */
  yAdvance: number;

  /**
   * The offset from the pen position in the X direction at which to render
   * this glyph.
   */
  xOffset: number;

  /**
   * The offset from the pen position in the Y direction at which to render
   * this glyph.
   */
  yOffset: number;
}

/**
 * Represents a run of Glyph and GlyphPosition objects.
 * Returned by the Font.layout method.
 */
export interface GlyphRun {
  /**
   * An array of Glyph objects in the run
   */
  glyphs: Glyph[];

  /**
   * An array of GlyphPosition objects for each glyph in the run
   */
  positions: GlyphPosition[];

  /**
   * The script that was requested for shaping. This was either passed in or detected automatically.
   */
  script: string;

  /**
   * The language requested for shaping, as passed in. If `null`, the default language for the
   * script was used.
   */
  language: string | null;

  /**
   * The direction requested for shaping, as passed in (either ltr or rtl).
   * If `null`, the default direction of the script is used.
   */
  direction: 'ltr' | 'rtl' | null;

  /**
   * The features requested during shaping. This is a combination of user
   * specified features and features chosen by the shaper.
   */
  features: object;

  /**
   * The total advance width of the run.
   */
  advanceWidth: number;

  /**
   * The total advance height of the run.
   */
  advanceHeight: number;

  /**
   * The bounding box containing all glyphs in the run.
   */
  bbox: BoundingBox;
}

export interface SubsetStream {
  on: (
    eventType: 'data' | 'end',
    callback: (data: Uint8Array) => any,
  ) => SubsetStream;
}

export interface Subset {
  /**
   * Includes the given glyph object or glyph ID in the subset.
   * Returns the glyph's new ID in the subset.
   */
  includeGlyph(glyph: number | Glyph): number;

  /**
   * Returns a stream containing the encoded font file that can be piped to a
   * destination, such as a file.
   */
  encodeStream(): SubsetStream;
}

/**
 * A map of OpenType features as described in OpenType's spec:
 * https://docs.microsoft.com/en-gb/typography/opentype/spec/featurelist.
 */
export interface OpenTypeFeatures {
  aalt?: boolean;
  abvf?: boolean;
  abvm?: boolean;
  abvs?: boolean;
  afrc?: boolean;
  akhn?: boolean;
  blwf?: boolean;
  blwm?: boolean;
  blws?: boolean;
  calt?: boolean;
  case?: boolean;
  ccmp?: boolean;
  cfar?: boolean;
  cjct?: boolean;
  clig?: boolean;
  cpct?: boolean;
  cpsp?: boolean;
  cswh?: boolean;
  curs?: boolean;
  cv01?: boolean;
  cv02?: boolean;
  cv03?: boolean;
  cv04?: boolean;
  cv05?: boolean;
  cv06?: boolean;
  cv07?: boolean;
  cv08?: boolean;
  cv09?: boolean;
  cv10?: boolean;
  cv11?: boolean;
  cv22?: boolean;
  cv23?: boolean;
  cv24?: boolean;
  cv25?: boolean;
  cv26?: boolean;
  cv27?: boolean;
  cv28?: boolean;
  cv29?: boolean;
  cv30?: boolean;
  cv31?: boolean;
  cv32?: boolean;
  cv33?: boolean;
  cv34?: boolean;
  cv35?: boolean;
  cv36?: boolean;
  cv37?: boolean;
  cv38?: boolean;
  cv39?: boolean;
  cv40?: boolean;
  cv41?: boolean;
  cv42?: boolean;
  cv43?: boolean;
  cv44?: boolean;
  cv45?: boolean;
  cv46?: boolean;
  cv47?: boolean;
  cv48?: boolean;
  cv49?: boolean;
  cv50?: boolean;
  cv51?: boolean;
  cv52?: boolean;
  cv53?: boolean;
  cv54?: boolean;
  cv55?: boolean;
  cv56?: boolean;
  cv57?: boolean;
  cv58?: boolean;
  cv59?: boolean;
  cv60?: boolean;
  cv61?: boolean;
  cv62?: boolean;
  cv63?: boolean;
  cv64?: boolean;
  cv65?: boolean;
  cv66?: boolean;
  cv67?: boolean;
  cv68?: boolean;
  cv69?: boolean;
  cv70?: boolean;
  cv71?: boolean;
  cv72?: boolean;
  cv73?: boolean;
  cv74?: boolean;
  cv75?: boolean;
  cv76?: boolean;
  cv77?: boolean;
  cv78?: boolean;
  cv79?: boolean;
  cv80?: boolean;
  cv81?: boolean;
  cv82?: boolean;
  cv83?: boolean;
  cv84?: boolean;
  cv85?: boolean;
  cv86?: boolean;
  cv87?: boolean;
  cv88?: boolean;
  cv89?: boolean;
  cv90?: boolean;
  cv91?: boolean;
  cv92?: boolean;
  cv93?: boolean;
  cv94?: boolean;
  cv95?: boolean;
  cv96?: boolean;
  cv97?: boolean;
  cv98?: boolean;
  cv99?: boolean;
  c2pc?: boolean;
  c2sc?: boolean;
  dist?: boolean;
  dlig?: boolean;
  dnom?: boolean;
  dtls?: boolean;
  expt?: boolean;
  falt?: boolean;
  fin2?: boolean;
  fin3?: boolean;
  fina?: boolean;
  flac?: boolean;
  frac?: boolean;
  fwid?: boolean;
  half?: boolean;
  haln?: boolean;
  halt?: boolean;
  hist?: boolean;
  hkna?: boolean;
  hlig?: boolean;
  hngl?: boolean;
  hojo?: boolean;
  hwid?: boolean;
  init?: boolean;
  isol?: boolean;
  ital?: boolean;
  jalt?: boolean;
  jp78?: boolean;
  jp83?: boolean;
  jp90?: boolean;
  jp04?: boolean;
  kern?: boolean;
  lfbd?: boolean;
  liga?: boolean;
  ljmo?: boolean;
  lnum?: boolean;
  locl?: boolean;
  ltra?: boolean;
  ltrm?: boolean;
  mark?: boolean;
  med2?: boolean;
  medi?: boolean;
  mgrk?: boolean;
  mkmk?: boolean;
  mset?: boolean;
  nalt?: boolean;
  nlck?: boolean;
  nukt?: boolean;
  numr?: boolean;
  onum?: boolean;
  opbd?: boolean;
  ordn?: boolean;
  ornm?: boolean;
  palt?: boolean;
  pcap?: boolean;
  pkna?: boolean;
  pnum?: boolean;
  pref?: boolean;
  pres?: boolean;
  pstf?: boolean;
  psts?: boolean;
  pwid?: boolean;
  qwid?: boolean;
  rand?: boolean;
  rclt?: boolean;
  rkrf?: boolean;
  rlig?: boolean;
  rphf?: boolean;
  rtbd?: boolean;
  rtla?: boolean;
  rtlm?: boolean;
  ruby?: boolean;
  rvrn?: boolean;
  salt?: boolean;
  sinf?: boolean;
  size?: boolean;
  smcp?: boolean;
  smpl?: boolean;
  ss01?: boolean;
  ss02?: boolean;
  ss03?: boolean;
  ss04?: boolean;
  ss05?: boolean;
  ss06?: boolean;
  ss07?: boolean;
  ss08?: boolean;
  ss09?: boolean;
  ss10?: boolean;
  ss11?: boolean;
  ss12?: boolean;
  ss13?: boolean;
  ss14?: boolean;
  ss15?: boolean;
  ss16?: boolean;
  ss17?: boolean;
  ss18?: boolean;
  ss19?: boolean;
  ss20?: boolean;
  ssty?: boolean;
  stch?: boolean;
  subs?: boolean;
  sups?: boolean;
  swsh?: boolean;
  titl?: boolean;
  tjmo?: boolean;
  tnam?: boolean;
  tnum?: boolean;
  trad?: boolean;
  twid?: boolean;
  unic?: boolean;
  valt?: boolean;
  vatu?: boolean;
  vert?: boolean;
  vhal?: boolean;
  vjmo?: boolean;
  vkna?: boolean;
  vkrn?: boolean;
  vpal?: boolean;
  vrt2?: boolean;
  vrtr?: boolean;
  zero?: boolean;
}
/**
 * A map of Apple Advanced Typography (AAT) as decribed by Apple’s TrueType
 * Reference manual:
 * https://developer.apple.com/fonts/TrueType-Reference-Manual/RM06/Chap6AATIntro.html
 */
export interface AATFeatures {
  acnt?: boolean;
  ankr?: boolean;
  avar?: boolean;
  bdat?: boolean;
  bhed?: boolean;
  bloc?: boolean;
  bsln?: boolean;
  cmap?: boolean;
  cvar?: boolean;
  cvt?: boolean;
  EBSC?: boolean;
  fdsc?: boolean;
  feat?: boolean;
  fmtx?: boolean;
  fond?: boolean;
  fpgm?: boolean;
  fvar?: boolean;
  gasp?: boolean;
  gcid?: boolean;
  glyf?: boolean;
  gvar?: boolean;
  hdmx?: boolean;
  head?: boolean;
  hhea?: boolean;
  hmtx?: boolean;
  just?: boolean;
  kern?: boolean;
  kerx?: boolean;
  lcar?: boolean;
  loca?: boolean;
  ltag?: boolean;
  maxp?: boolean;
  meta?: boolean;
  mort?: boolean;
  morx?: boolean;
  name?: boolean;
  opbd?: boolean;
  'OS/2'?: boolean;
  post?: boolean;
  prep?: boolean;
  prop?: boolean;
  sbix?: boolean;
  trak?: boolean;
  vhea?: boolean;
  vmtx?: boolean;
  xref?: boolean;
  Zapf?: boolean;
}

/**
 * The features is an object mapping OpenType features to a boolean
 * enabling or disabling each. If this is an AAT font,
 * the OpenType feature tags are mapped to AAT features.
 */
export interface TypeFeatures extends OpenTypeFeatures, AATFeatures {
  [key: string]: boolean | undefined;
}

/**
 * There are several different types of font objects that are returned by
 * fontkit depending on the font format. They all inherit from the TTFFont class
 * and have the same public API.
 */
export interface Font {
  // Metadata properties
  postscriptName: string | null;
  fullName: string | null;
  familyName: string | null;
  subfamilyName: string | null;
  copyright: string | null;
  version: string | null;

  // Metrics properties
  unitsPerEm: number /** Size of the font’s internal coordinate grid */;
  ascent: number /** The font’s ascender */;
  descent: number /** The font’s descender */;
  lineGap: number /** Amount of space that should be included between lines */;
  underlinePosition: number /** Offset from the normal underline position that should be used */;
  underlineThickness: number /** Weight of the underline that should be used */;
  italicAngle: number /** If this is an italic font, the angle the cursor should be drawn at to match the font design */;
  capHeight: number /** Height of capital letters above the baseline. */;
  xHeight: number /** Height of lower case letters. */;
  bbox: BoundingBox /** Font’s bounding box, i.e. the box that encloses all glyphs in the font */;

  // Other properties
  numGlyphs: number /** Number of glyphs in the font */;
  characterSet: number[] /** Array of all of the unicode code points supported by the font */;
  availableFeatures: (keyof TypeFeatures)[] /** Array of all OpenType feature tags (or mapped AAT tags) supported by the font */;
  cff: any;
  'OS/2': { sFamilyClass: number };
  head: { macStyle: { italic: boolean } };
  post: { isFixedPitch: boolean };

  // Character to Glyph Mapping Methods

  /**
   * Maps a single unicode code point (number) to a Glyph object.
   * Does not perform any advanced substitutions (there is no context to do so).
   */
  glyphForCodePoint(codePoint: number): Glyph;

  /**
   * Returns whether there is glyph in the font for the given
   * unicode code point.
   */
  hasGlyphForCodePoint(codePoint: number): boolean;

  /**
   * This method returns an array of Glyph objects for the given string.
   * This is only a one-to-one mapping from characters to glyphs. For most uses,
   * you should use Font.layout, which provides a much more advanced mapping
   * supporting AAT and OpenType shaping.
   */
  glyphsForString(str: string): Glyph[];

  // Glyph Metrics and Layout Methods

  /**
   * Returns the advance width (described above) for a single glyph id.
   */
  widthOfGlyph(glyphId: number): number;

  /**
   * This method returns a GlyphRun object, which includes an array of Glyphs
   * and GlyphPositions for the given string. Glyph objects are described below.
   * GlyphPosition objects include 4 properties: xAdvance, yAdvance, xOffset,
   * and yOffset.
   *
   * The features parameter is an array of OpenType feature tags to be applied
   * in addition to the default set. If this is an AAT font, the OpenType
   * feature tags are mapped to AAT features.
   */
  layout(
    str: string,
    features?: TypeFeatures | (keyof TypeFeatures)[],
  ): GlyphRun;

  // Other Methods

  /**
   * Returns a glyph object for the given glyph id. You can pass the array of
   * code points this glyph represents for your use later, and it will be
   * stored in the glyph object.
   */
  getGlyph(glyphId: number, codePoints?: number[]): Glyph;

  /**
   * Returns a Subset object for this font.
   */
  createSubset(): Subset;
}

export interface Fontkit {
  create(buffer: Uint8Array, postscriptName?: string): Font;
}
