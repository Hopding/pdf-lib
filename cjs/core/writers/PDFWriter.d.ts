import PDFCrossRefSection from "../document/PDFCrossRefSection";
import PDFHeader from "../document/PDFHeader";
import PDFTrailer from "../document/PDFTrailer";
import PDFTrailerDict from "../document/PDFTrailerDict";
import PDFDict from "../objects/PDFDict";
import PDFObject from "../objects/PDFObject";
import PDFRef from "../objects/PDFRef";
import PDFContext from "../PDFContext";
export interface SerializationInfo {
    size: number;
    header: PDFHeader;
    indirectObjects: [PDFRef, PDFObject][];
    xref?: PDFCrossRefSection;
    trailerDict?: PDFTrailerDict;
    trailer: PDFTrailer;
}
declare class PDFWriter {
    static forContext: (context: PDFContext, objectsPerTick: number) => PDFWriter;
    protected readonly context: PDFContext;
    protected readonly objectsPerTick: number;
    private parsedObjects;
    protected constructor(context: PDFContext, objectsPerTick: number);
    serializeToBuffer(): Promise<Uint8Array>;
    protected computeIndirectObjectSize([ref, object]: [PDFRef, PDFObject]): number;
    protected createTrailerDict(): PDFDict;
    protected computeBufferSize(): Promise<SerializationInfo>;
    protected shouldWaitForTick: (n: number) => boolean;
}
export default PDFWriter;
//# sourceMappingURL=PDFWriter.d.ts.map