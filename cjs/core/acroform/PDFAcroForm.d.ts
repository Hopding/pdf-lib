import PDFContext from "../PDFContext";
import PDFDict from "../objects/PDFDict";
import PDFArray from "../objects/PDFArray";
import PDFRef from "../objects/PDFRef";
import PDFAcroField from "./PDFAcroField";
declare class PDFAcroForm {
    readonly dict: PDFDict;
    static fromDict: (dict: PDFDict) => PDFAcroForm;
    static create: (context: PDFContext) => PDFAcroForm;
    private constructor();
    Fields(): PDFArray | undefined;
    getFields(): [PDFAcroField, PDFRef][];
    getAllFields(): [PDFAcroField, PDFRef][];
    addField(field: PDFRef): void;
    removeField(field: PDFAcroField): void;
    normalizedEntries(): {
        Fields: PDFArray;
    };
}
export default PDFAcroForm;
//# sourceMappingURL=PDFAcroForm.d.ts.map