import { Fontkit, Glyph, TypeFeatures } from "../../types/fontkit";
import CustomFontEmbedder from "./CustomFontEmbedder";
import PDFHexString from "../objects/PDFHexString";
/**
 * A note of thanks to the developers of https://github.com/foliojs/pdfkit, as
 * this class borrows from:
 *   https://github.com/devongovett/pdfkit/blob/e71edab0dd4657b5a767804ba86c94c58d01fbca/lib/image/jpeg.coffee
 */
declare class CustomFontSubsetEmbedder extends CustomFontEmbedder {
    static for(fontkit: Fontkit, fontData: Uint8Array, customFontName?: string, fontFeatures?: TypeFeatures): Promise<CustomFontSubsetEmbedder>;
    private readonly subset;
    private readonly glyphs;
    private readonly glyphIdMap;
    private constructor();
    encodeText(text: string): PDFHexString;
    protected isCFF(): boolean;
    protected glyphId(glyph?: Glyph): number;
    protected serializeFont(): Promise<Uint8Array>;
}
export default CustomFontSubsetEmbedder;
//# sourceMappingURL=CustomFontSubsetEmbedder.d.ts.map