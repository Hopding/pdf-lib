import Embeddable from "./Embeddable";
import PDFDocument from "./PDFDocument";
import FileEmbedder from "../core/embedders/FileEmbedder";
import { PDFRef } from "../core";
/**
 * Represents a file that has been embedded in a [[PDFDocument]].
 */
export default class PDFEmbeddedFile implements Embeddable {
    /**
     * > **NOTE:** You probably don't want to call this method directly. Instead,
     * > consider using the [[PDFDocument.attach]] method, which will create
     * instances of [[PDFEmbeddedFile]] for you.
     *
     * Create an instance of [[PDFEmbeddedFile]] from an existing ref and embedder
     *
     * @param ref The unique reference for this file.
     * @param doc The document to which the file will belong.
     * @param embedder The embedder that will be used to embed the file.
     */
    static of: (ref: PDFRef, doc: PDFDocument, embedder: FileEmbedder) => PDFEmbeddedFile;
    /** The unique reference assigned to this embedded file within the document. */
    readonly ref: PDFRef;
    /** The document to which this embedded file belongs. */
    readonly doc: PDFDocument;
    private alreadyEmbedded;
    private readonly embedder;
    private constructor();
    /**
     * > **NOTE:** You probably don't need to call this method directly. The
     * > [[PDFDocument.save]] and [[PDFDocument.saveAsBase64]] methods will
     * > automatically ensure all embeddable files get embedded.
     *
     * Embed this embeddable file in its document.
     *
     * @returns Resolves when the embedding is complete.
     */
    embed(): Promise<void>;
}
//# sourceMappingURL=PDFEmbeddedFile.d.ts.map