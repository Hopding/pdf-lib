export as namespace pngjs;

export default class PNG {
  data: Buffer;
  pos: number;
  palette: Array<number>;
  imgData: Buffer;
  transparency: { indexed: Array<number> };
  text: {};
  width: number;
  height: number;
  bits: number;
  colorType: number;
  compressionMethod: number;
  filterMethod: number;
  interlaceMethod: number;
  colors: number;
  hasAlphaChannel: boolean;
  pixelBitlength: number;
  colorSpace: string;

  constructor(buffer: Array<number> | Uint8Array);

  read(bytes: Array<number>): Array<number>;
  readUInt32(): number;
  readUInt16(): number;

  decodePixels(fn: (p: Uint8Array) => any): void;
  decodePixelsSync(): Uint8Array;
  decodePalette(): Uint8Array;

  copyToImageData(imageData: Uint8Array, pixels: Uint8Array): void;
  decode(fn: (p: Uint8Array) => any): void;
  decodeSync(): Uint8Array;
}
