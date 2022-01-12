import PDFObject from "./PDFObject";
declare class PDFRef extends PDFObject {
    static of: (objectNumber: number, generationNumber?: number) => PDFRef;
    readonly objectNumber: number;
    readonly generationNumber: number;
    readonly tag: string;
    private constructor();
    clone(): PDFRef;
    toString(): string;
    sizeInBytes(): number;
    copyBytesInto(buffer: Uint8Array, offset: number): number;
}
export default PDFRef;
//# sourceMappingURL=PDFRef.d.ts.map