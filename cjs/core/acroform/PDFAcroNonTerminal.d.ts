import PDFDict from "../objects/PDFDict";
import PDFRef from "../objects/PDFRef";
import PDFContext from "../PDFContext";
import PDFAcroField from "./PDFAcroField";
declare class PDFAcroNonTerminal extends PDFAcroField {
    static fromDict: (dict: PDFDict, ref: PDFRef) => PDFAcroNonTerminal;
    static create: (context: PDFContext) => PDFAcroNonTerminal;
    addField(field: PDFRef): void;
    normalizedEntries(): {
        Kids: import("../objects/PDFArray").default;
    };
}
export default PDFAcroNonTerminal;
//# sourceMappingURL=PDFAcroNonTerminal.d.ts.map