import PDFDict from "../objects/PDFDict";
import PDFAcroChoice from "./PDFAcroChoice";
import PDFContext from "../PDFContext";
import PDFRef from "../objects/PDFRef";
declare class PDFAcroListBox extends PDFAcroChoice {
    static fromDict: (dict: PDFDict, ref: PDFRef) => PDFAcroListBox;
    static create: (context: PDFContext) => PDFAcroListBox;
}
export default PDFAcroListBox;
//# sourceMappingURL=PDFAcroListBox.d.ts.map