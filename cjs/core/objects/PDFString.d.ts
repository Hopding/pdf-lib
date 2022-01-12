import PDFObject from "./PDFObject";
declare class PDFString extends PDFObject {
    static of: (value: string) => PDFString;
    static fromDate: (date: Date) => PDFString;
    private readonly value;
    private constructor();
    asBytes(): Uint8Array;
    decodeText(): string;
    decodeDate(): Date;
    asString(): string;
    clone(): PDFString;
    toString(): string;
    sizeInBytes(): number;
    copyBytesInto(buffer: Uint8Array, offset: number): number;
}
export default PDFString;
//# sourceMappingURL=PDFString.d.ts.map