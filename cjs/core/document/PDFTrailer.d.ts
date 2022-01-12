declare class PDFTrailer {
    static forLastCrossRefSectionOffset: (offset: number) => PDFTrailer;
    private readonly lastXRefOffset;
    private constructor();
    toString(): string;
    sizeInBytes(): number;
    copyBytesInto(buffer: Uint8Array, offset: number): number;
}
export default PDFTrailer;
//# sourceMappingURL=PDFTrailer.d.ts.map