import PDFDict from "../objects/PDFDict";
import PDFRef from "../objects/PDFRef";
import PDFAcroTerminal from "./PDFAcroTerminal";
declare class PDFAcroSignature extends PDFAcroTerminal {
    static fromDict: (dict: PDFDict, ref: PDFRef) => PDFAcroSignature;
}
export default PDFAcroSignature;
//# sourceMappingURL=PDFAcroSignature.d.ts.map