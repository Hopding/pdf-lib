import PDFObject from "./PDFObject";
declare class PDFNumber extends PDFObject {
    static of: (value: number) => PDFNumber;
    private readonly numberValue;
    private readonly stringValue;
    private constructor();
    asNumber(): number;
    /** @deprecated in favor of [[PDFNumber.asNumber]] */
    value(): number;
    clone(): PDFNumber;
    toString(): string;
    sizeInBytes(): number;
    copyBytesInto(buffer: Uint8Array, offset: number): number;
}
export default PDFNumber;
//# sourceMappingURL=PDFNumber.d.ts.map