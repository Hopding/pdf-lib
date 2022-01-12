import PDFRef from "../objects/PDFRef";
import PDFDict from "../objects/PDFDict";
import PDFName from "../objects/PDFName";
import PDFAcroButton from "./PDFAcroButton";
import PDFContext from "../PDFContext";
declare class PDFAcroRadioButton extends PDFAcroButton {
    static fromDict: (dict: PDFDict, ref: PDFRef) => PDFAcroRadioButton;
    static create: (context: PDFContext) => PDFAcroRadioButton;
    setValue(value: PDFName): void;
    getValue(): PDFName;
    getOnValues(): PDFName[];
}
export default PDFAcroRadioButton;
//# sourceMappingURL=PDFAcroRadioButton.d.ts.map