import PDFDocument from "../PDFDocument";
import PDFField from "./PDFField";
import { PDFRef, PDFAcroSignature } from "../../core";
/**
 * Represents a signature field of a [[PDFForm]].
 *
 * [[PDFSignature]] fields are digital signatures. `pdf-lib` does not
 * currently provide any specialized APIs for creating digital signatures or
 * reading the contents of existing digital signatures.
 */
export default class PDFSignature extends PDFField {
    /**
     * > **NOTE:** You probably don't want to call this method directly. Instead,
     * > consider using the [[PDFForm.getSignature]] method, which will create an
     * > instance of [[PDFSignature]] for you.
     *
     * Create an instance of [[PDFSignature]] from an existing acroSignature and
     * ref
     *
     * @param acroSignature The underlying `PDFAcroSignature` for this signature.
     * @param ref The unique reference for this signature.
     * @param doc The document to which this signature will belong.
     */
    static of: (acroSignature: PDFAcroSignature, ref: PDFRef, doc: PDFDocument) => PDFSignature;
    /** The low-level PDFAcroSignature wrapped by this signature. */
    readonly acroField: PDFAcroSignature;
    private constructor();
    needsAppearancesUpdate(): boolean;
}
//# sourceMappingURL=PDFSignature.d.ts.map