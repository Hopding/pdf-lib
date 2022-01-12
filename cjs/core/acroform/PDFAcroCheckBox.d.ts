import PDFContext from "../PDFContext";
import PDFRef from "../objects/PDFRef";
import PDFDict from "../objects/PDFDict";
import PDFName from "../objects/PDFName";
import PDFAcroButton from "./PDFAcroButton";
declare class PDFAcroCheckBox extends PDFAcroButton {
    static fromDict: (dict: PDFDict, ref: PDFRef) => PDFAcroCheckBox;
    static create: (context: PDFContext) => PDFAcroCheckBox;
    setValue(value: PDFName): void;
    getValue(): PDFName;
    getOnValue(): PDFName | undefined;
}
export default PDFAcroCheckBox;
//# sourceMappingURL=PDFAcroCheckBox.d.ts.map