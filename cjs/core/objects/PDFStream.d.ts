import PDFDict from "./PDFDict";
import PDFObject from "./PDFObject";
import PDFContext from "../PDFContext";
declare class PDFStream extends PDFObject {
    readonly dict: PDFDict;
    constructor(dict: PDFDict);
    clone(_context?: PDFContext): PDFStream;
    getContentsString(): string;
    getContents(): Uint8Array;
    getContentsSize(): number;
    updateDict(): void;
    sizeInBytes(): number;
    toString(): string;
    copyBytesInto(buffer: Uint8Array, offset: number): number;
}
export default PDFStream;
//# sourceMappingURL=PDFStream.d.ts.map