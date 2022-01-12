import PDFDict from "../objects/PDFDict";
import PDFAcroButton from "./PDFAcroButton";
import PDFContext from "../PDFContext";
import PDFRef from "../objects/PDFRef";
declare class PDFAcroPushButton extends PDFAcroButton {
    static fromDict: (dict: PDFDict, ref: PDFRef) => PDFAcroPushButton;
    static create: (context: PDFContext) => PDFAcroPushButton;
}
export default PDFAcroPushButton;
//# sourceMappingURL=PDFAcroPushButton.d.ts.map