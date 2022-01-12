import PDFObject from "./PDFObject";
declare class PDFNull extends PDFObject {
    asNull(): null;
    clone(): PDFNull;
    toString(): string;
    sizeInBytes(): number;
    copyBytesInto(buffer: Uint8Array, offset: number): number;
}
declare const _default: PDFNull;
export default _default;
//# sourceMappingURL=PDFNull.d.ts.map