/** Rectangle describing an APNG frame region. */
export interface ImageFrameRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** One APNG frame (decoded pixel data is optional until decompress). */
export interface ImageFrame {
  rect: ImageFrameRect;
  delay: number;
  dispose: number;
  blend: number;
  data?: Uint8Array;
}

export interface ImageTabACTL {
  num_frames: number;
  num_plays: number;
}

export interface ImageTabText {
  [key: string]: string;
}

export interface ImageTabs {
  acTL?: ImageTabACTL;
  pHYs?: number[];
  cHRM?: number[];
  tEXt?: ImageTabText;
  zTXt?: ImageTabText;
  iTXt?: ImageTabText;
  PLTE?: number[];
  hIST?: number[];
  /** Indexed: alpha bytes; grayscale: single sample; RGB: [r,g,b] samples. */
  tRNS?: number | number[];
  gAMA?: number;
  sRGB?: number;
  bKGD?: number | number[];
  CgBI?: Uint8Array;
  /** Animation loop count for encode: 0 = forever, 1 = play once, … */
  loop?: number;
}

/** Decoded PNG / APNG image. `data` is raw unfiltered samples (not RGBA). */
export interface Image {
  width: number;
  height: number;
  depth: number;
  ctype: number;
  frames: ImageFrame[];
  tabs: ImageTabs;
  data: Uint8Array;
}

/** Internal IHDR fields kept only while decompressing. */
export interface DecodeState extends Image {
  compress: number;
  filter: number;
  interlace: number;
}

/** Palette entry produced by `quantize`; `est.rgba` is the packed color. */
export interface QuantizeLeaf {
  est: { rgba: number };
}

export interface QuantizeResult {
  abuf: ArrayBuffer;
  inds: Uint8Array;
  plte: QuantizeLeaf[];
}

/** Compressed frame ready for IDAT / fdAT. */
export interface EncodeFrame {
  rect: ImageFrameRect;
  img: Uint8Array;
  blend: number;
  dispose: number;
  bpp: number;
  bpl: number;
  cimg?: Uint8Array;
}

export interface EncodeImage {
  ctype: number;
  depth: number;
  frames: EncodeFrame[];
  plte?: number[];
}
