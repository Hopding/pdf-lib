import PDFDict from "../objects/PDFDict";
import PDFRef from "../objects/PDFRef";
import PDFContext from "../PDFContext";
import PDFFlateStream from "./PDFFlateStream";
export declare enum EntryType {
    Deleted = 0,
    Uncompressed = 1,
    Compressed = 2
}
export interface DeletedEntry {
    type: EntryType.Deleted;
    ref: PDFRef;
    nextFreeObjectNumber: number;
}
export interface UncompressedEntry {
    type: EntryType.Uncompressed;
    ref: PDFRef;
    offset: number;
}
export interface CompressedEntry {
    type: EntryType.Compressed;
    ref: PDFRef;
    objectStreamRef: PDFRef;
    index: number;
}
export declare type Entry = DeletedEntry | UncompressedEntry | CompressedEntry;
export declare type EntryTuple = [number, number, number];
/**
 * Entries should be added using the [[addDeletedEntry]],
 * [[addUncompressedEntry]], and [[addCompressedEntry]] methods
 * **in order of ascending object number**.
 */
declare class PDFCrossRefStream extends PDFFlateStream {
    static create: (dict: PDFDict, encode?: boolean) => PDFCrossRefStream;
    static of: (dict: PDFDict, entries: Entry[], encode?: boolean) => PDFCrossRefStream;
    private readonly entries;
    private readonly entryTuplesCache;
    private readonly maxByteWidthsCache;
    private readonly indexCache;
    private constructor();
    addDeletedEntry(ref: PDFRef, nextFreeObjectNumber: number): void;
    addUncompressedEntry(ref: PDFRef, offset: number): void;
    addCompressedEntry(ref: PDFRef, objectStreamRef: PDFRef, index: number): void;
    clone(context?: PDFContext): PDFCrossRefStream;
    getContentsString(): string;
    getUnencodedContents(): Uint8Array;
    getUnencodedContentsSize(): number;
    updateDict(): void;
    private computeIndex;
    private computeEntryTuples;
    private computeMaxEntryByteWidths;
}
export default PDFCrossRefStream;
//# sourceMappingURL=PDFCrossRefStream.d.ts.map