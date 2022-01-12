import PDFHeader from "../document/PDFHeader";
import PDFTrailer from "../document/PDFTrailer";
import PDFObject from "../objects/PDFObject";
import PDFRef from "../objects/PDFRef";
import PDFContext from "../PDFContext";
import PDFWriter from "./PDFWriter";
declare class PDFStreamWriter extends PDFWriter {
    static forContext: (context: PDFContext, objectsPerTick: number, encodeStreams?: boolean, objectsPerStream?: number) => PDFStreamWriter;
    private readonly encodeStreams;
    private readonly objectsPerStream;
    private constructor();
    protected computeBufferSize(): Promise<{
        size: number;
        header: PDFHeader;
        indirectObjects: [PDFRef, PDFObject][];
        trailer: PDFTrailer;
    }>;
}
export default PDFStreamWriter;
//# sourceMappingURL=PDFStreamWriter.d.ts.map