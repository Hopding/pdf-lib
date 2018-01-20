declare module 'lodash' {
  declare var exports: any;
}
declare module 'pako' {
  declare var exports: any;
}
declare module 'fontkit' {
  declare var exports: any;
}
declare module 'buffer/' {
  declare var exports: any;
}

/*
This typing may not be totally complete or accurate, please see:
https://github.com/devongovett/png.js/
*/
declare module 'png-js' {
  declare class PNG {
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

    constructor(buffer: Array<number> | Uint8Array): PNG;

    read(bytes: Array<number>): Array<number>;
    readUInt32(): number;
    readUInt16(): number;

    decodePixels((Uint8Array) => any): void;
    decodePixelsSync(): Uint8Array;
    decodePalette(): Uint8Array;

    copyToImageData(imageData: Uint8Array, pixels: Uint8Array): void;
    decode((Uint8Array) => any): void;
    decodeSync(): Uint8Array;
  }
  declare export default typeof PNG
}
