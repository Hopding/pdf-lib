import PDFObject from "./PDFObject";
declare class PDFHexString extends PDFObject {
    static of: (value: string) => PDFHexString;
    static fromText: (value: string) => PDFHexString;
    private readonly value;
    constructor(value: string);
    asBytes(): Uint8Array;
    decodeText(): string;
    decodeDate(): Date;
    asString(): string;
    clone(): PDFHexString;
    toString(): string;
    sizeInBytes(): number;
    copyBytesInto(buffer: Uint8Array, offset: number): number;
}
export default PDFHexString;
//# sourceMappingURL=PDFHexString.d.ts.map