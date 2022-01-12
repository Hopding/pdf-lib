export declare enum PngType {
    Greyscale = "Greyscale",
    Truecolour = "Truecolour",
    IndexedColour = "IndexedColour",
    GreyscaleWithAlpha = "GreyscaleWithAlpha",
    TruecolourWithAlpha = "TruecolourWithAlpha"
}
export declare class PNG {
    static load: (pngData: Uint8Array) => PNG;
    readonly rgbChannel: Uint8Array;
    readonly alphaChannel?: Uint8Array;
    readonly type: PngType;
    readonly width: number;
    readonly height: number;
    readonly bitsPerComponent: number;
    private constructor();
}
//# sourceMappingURL=png.d.ts.map