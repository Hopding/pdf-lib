import Embeddable from "./Embeddable";
import PDFDocument from "./PDFDocument";
import JavaScriptEmbedder from "../core/embedders/JavaScriptEmbedder";
import { PDFRef } from "../core";
/**
 * Represents JavaScript that has been embedded in a [[PDFDocument]].
 */
export default class PDFJavaScript implements Embeddable {
    /**
     * > **NOTE:** You probably don't want to call this method directly. Instead,
     * > consider using the [[PDFDocument.addJavaScript]] method, which will
     * create instances of [[PDFJavaScript]] for you.
     *
     * Create an instance of [[PDFJavaScript]] from an existing ref and script
     *
     * @param ref The unique reference for this script.
     * @param doc The document to which the script will belong.
     * @param embedder The embedder that will be used to embed the script.
     */
    static of: (ref: PDFRef, doc: PDFDocument, embedder: JavaScriptEmbedder) => PDFJavaScript;
    /** The unique reference assigned to this embedded script within the document. */
    readonly ref: PDFRef;
    /** The document to which this embedded script belongs. */
    readonly doc: PDFDocument;
    private alreadyEmbedded;
    private readonly embedder;
    private constructor();
    /**
     * > **NOTE:** You probably don't need to call this method directly. The
     * > [[PDFDocument.save]] and [[PDFDocument.saveAsBase64]] methods will
     * > automatically ensure all JavaScripts get embedded.
     *
     * Embed this JavaScript in its document.
     *
     * @returns Resolves when the embedding is complete.
     */
    embed(): Promise<void>;
}
//# sourceMappingURL=PDFJavaScript.d.ts.map