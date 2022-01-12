import PDFContext from "../PDFContext";
import PDFRef from "../objects/PDFRef";
/**
 * From the PDF-A3 specification, section **3.1. Requirements - General**.
 * See:
 * * https://www.pdfa.org/wp-content/uploads/2018/10/PDF20_AN002-AF.pdf
 */
export declare enum AFRelationship {
    Source = "Source",
    Data = "Data",
    Alternative = "Alternative",
    Supplement = "Supplement",
    EncryptedPayload = "EncryptedPayload",
    FormData = "EncryptedPayload",
    Schema = "Schema",
    Unspecified = "Unspecified"
}
export interface EmbeddedFileOptions {
    mimeType?: string;
    description?: string;
    creationDate?: Date;
    modificationDate?: Date;
    afRelationship?: AFRelationship;
}
declare class FileEmbedder {
    static for(bytes: Uint8Array, fileName: string, options?: EmbeddedFileOptions): FileEmbedder;
    private readonly fileData;
    readonly fileName: string;
    readonly options: EmbeddedFileOptions;
    private constructor();
    embedIntoContext(context: PDFContext, ref?: PDFRef): Promise<PDFRef>;
}
export default FileEmbedder;
//# sourceMappingURL=FileEmbedder.d.ts.map