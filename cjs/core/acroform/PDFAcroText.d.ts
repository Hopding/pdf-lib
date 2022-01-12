import PDFContext from "../PDFContext";
import PDFDict from "../objects/PDFDict";
import PDFNumber from "../objects/PDFNumber";
import PDFString from "../objects/PDFString";
import PDFHexString from "../objects/PDFHexString";
import PDFRef from "../objects/PDFRef";
import PDFAcroTerminal from "./PDFAcroTerminal";
declare class PDFAcroText extends PDFAcroTerminal {
    static fromDict: (dict: PDFDict, ref: PDFRef) => PDFAcroText;
    static create: (context: PDFContext) => PDFAcroText;
    MaxLen(): PDFNumber | undefined;
    Q(): PDFNumber | undefined;
    setMaxLength(maxLength: number): void;
    removeMaxLength(): void;
    getMaxLength(): number | undefined;
    setQuadding(quadding: 0 | 1 | 2): void;
    getQuadding(): number | undefined;
    setValue(value: PDFHexString | PDFString): void;
    removeValue(): void;
    getValue(): PDFString | PDFHexString | undefined;
}
export default PDFAcroText;
//# sourceMappingURL=PDFAcroText.d.ts.map