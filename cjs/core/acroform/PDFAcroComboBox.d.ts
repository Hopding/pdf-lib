import PDFDict from "../objects/PDFDict";
import PDFAcroChoice from "./PDFAcroChoice";
import PDFContext from "../PDFContext";
import PDFRef from "../objects/PDFRef";
declare class PDFAcroComboBox extends PDFAcroChoice {
    static fromDict: (dict: PDFDict, ref: PDFRef) => PDFAcroComboBox;
    static create: (context: PDFContext) => PDFAcroComboBox;
}
export default PDFAcroComboBox;
//# sourceMappingURL=PDFAcroComboBox.d.ts.map