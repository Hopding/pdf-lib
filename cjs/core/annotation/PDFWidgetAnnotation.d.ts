import PDFDict from "../objects/PDFDict";
import PDFName from "../objects/PDFName";
import PDFRef from "../objects/PDFRef";
import PDFString from "../objects/PDFString";
import PDFHexString from "../objects/PDFHexString";
import PDFContext from "../PDFContext";
import BorderStyle from "./BorderStyle";
import PDFAnnotation from "./PDFAnnotation";
import AppearanceCharacteristics from "./AppearanceCharacteristics";
declare class PDFWidgetAnnotation extends PDFAnnotation {
    static fromDict: (dict: PDFDict) => PDFWidgetAnnotation;
    static create: (context: PDFContext, parent: PDFRef) => PDFWidgetAnnotation;
    MK(): PDFDict | undefined;
    BS(): PDFDict | undefined;
    DA(): PDFString | PDFHexString | undefined;
    P(): PDFRef | undefined;
    setP(page: PDFRef): void;
    setDefaultAppearance(appearance: string): void;
    getDefaultAppearance(): string | undefined;
    getAppearanceCharacteristics(): AppearanceCharacteristics | undefined;
    getOrCreateAppearanceCharacteristics(): AppearanceCharacteristics;
    getBorderStyle(): BorderStyle | undefined;
    getOrCreateBorderStyle(): BorderStyle;
    getOnValue(): PDFName | undefined;
}
export default PDFWidgetAnnotation;
//# sourceMappingURL=PDFWidgetAnnotation.d.ts.map