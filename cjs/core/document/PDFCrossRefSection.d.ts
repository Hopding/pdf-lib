import PDFRef from "../objects/PDFRef";
export interface Entry {
    ref: PDFRef;
    offset: number;
    deleted: boolean;
}
/**
 * Entries should be added using the [[addEntry]] and [[addDeletedEntry]]
 * methods **in order of ascending object number**.
 */
declare class PDFCrossRefSection {
    static create: () => PDFCrossRefSection;
    static createEmpty: () => PDFCrossRefSection;
    private subsections;
    private chunkIdx;
    private chunkLength;
    private constructor();
    addEntry(ref: PDFRef, offset: number): void;
    addDeletedEntry(ref: PDFRef, nextFreeObjectNumber: number): void;
    toString(): string;
    sizeInBytes(): number;
    copyBytesInto(buffer: Uint8Array, offset: number): number;
    private copySubsectionsIntoBuffer;
    private copyEntriesIntoBuffer;
    private append;
}
export default PDFCrossRefSection;
//# sourceMappingURL=PDFCrossRefSection.d.ts.map