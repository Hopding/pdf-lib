import { Font, Fontkit, Glyph, TypeFeatures } from "../../types/fontkit";
import PDFHexString from "../objects/PDFHexString";
import PDFRef from "../objects/PDFRef";
import PDFContext from "../PDFContext";
import { Cache } from "../../utils";
/**
 * A note of thanks to the developers of https://github.com/foliojs/pdfkit, as
 * this class borrows from:
 *   https://github.com/devongovett/pdfkit/blob/e71edab0dd4657b5a767804ba86c94c58d01fbca/lib/image/jpeg.coffee
 */
declare class CustomFontEmbedder {
    static for(fontkit: Fontkit, fontData: Uint8Array, customName?: string, fontFeatures?: TypeFeatures): Promise<CustomFontEmbedder>;
    readonly font: Font;
    readonly scale: number;
    readonly fontData: Uint8Array;
    readonly fontName: string;
    readonly customName: string | undefined;
    readonly fontFeatures: TypeFeatures | undefined;
    protected baseFontName: string;
    protected glyphCache: Cache<Glyph[]>;
    protected constructor(font: Font, fontData: Uint8Array, customName?: string, fontFeatures?: TypeFeatures);
    /**
     * Encode the JavaScript string into this font. (JavaScript encodes strings in
     * Unicode, but embedded fonts use their own custom encodings)
     */
    encodeText(text: string): PDFHexString;
    widthOfTextAtSize(text: string, size: number): number;
    heightOfFontAtSize(size: number, options?: {
        descender?: boolean;
    }): number;
    sizeOfFontAtHeight(height: number): number;
    embedIntoContext(context: PDFContext, ref?: PDFRef): Promise<PDFRef>;
    protected embedFontDict(context: PDFContext, ref?: PDFRef): Promise<PDFRef>;
    protected isCFF(): boolean;
    protected embedCIDFontDict(context: PDFContext): Promise<PDFRef>;
    protected embedFontDescriptor(context: PDFContext): Promise<PDFRef>;
    protected serializeFont(): Promise<Uint8Array>;
    protected embedFontStream(context: PDFContext): Promise<PDFRef>;
    protected embedUnicodeCmap(context: PDFContext): PDFRef;
    protected glyphId(glyph?: Glyph): number;
    protected computeWidths(): (number | number[])[];
    private allGlyphsInFontSortedById;
}
export default CustomFontEmbedder;
//# sourceMappingURL=CustomFontEmbedder.d.ts.map