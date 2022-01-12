import PDFDict from "../objects/PDFDict";
import PDFArray from "../objects/PDFArray";
import PDFRef from "../objects/PDFRef";
import PDFAcroField from "./PDFAcroField";
export declare const createPDFAcroFields: (kidDicts?: PDFArray | undefined) => [PDFAcroField, PDFRef][];
export declare const createPDFAcroField: (dict: PDFDict, ref: PDFRef) => PDFAcroField;
//# sourceMappingURL=utils.d.ts.map