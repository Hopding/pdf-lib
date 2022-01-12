import PDFObject from "./PDFObject";
declare class PDFBool extends PDFObject {
    static readonly True: PDFBool;
    static readonly False: PDFBool;
    private readonly value;
    private constructor();
    asBoolean(): boolean;
    clone(): PDFBool;
    toString(): string;
    sizeInBytes(): number;
    copyBytesInto(buffer: Uint8Array, offset: number): number;
}
export default PDFBool;
//# sourceMappingURL=PDFBool.d.ts.map