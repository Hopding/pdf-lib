import PDFDict from "../objects/PDFDict";
declare class PDFTrailerDict {
    static of: (dict: PDFDict) => PDFTrailerDict;
    readonly dict: PDFDict;
    private constructor();
    toString(): string;
    sizeInBytes(): number;
    copyBytesInto(buffer: Uint8Array, offset: number): number;
}
export default PDFTrailerDict;
//# sourceMappingURL=PDFTrailerDict.d.ts.map