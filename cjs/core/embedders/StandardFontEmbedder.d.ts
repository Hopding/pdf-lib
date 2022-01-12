import { Font, FontNames, EncodingType } from '@pdf-lib/standard-fonts';
import PDFHexString from "../objects/PDFHexString";
import PDFRef from "../objects/PDFRef";
import PDFContext from "../PDFContext";
export interface Glyph {
    code: number;
    name: string;
}
/**
 * A note of thanks to the developers of https://github.com/foliojs/pdfkit, as
 * this class borrows from:
 *   https://github.com/foliojs/pdfkit/blob/f91bdd61c164a72ea06be1a43dc0a412afc3925f/lib/font/afm.coffee
 */
declare class StandardFontEmbedder {
    static for: (fontName: FontNames, customName?: string | undefined) => StandardFontEmbedder;
    readonly font: Font;
    readonly encoding: EncodingType;
    readonly fontName: string;
    readonly customName: string | undefined;
    private constructor();
    /**
     * Encode the JavaScript string into this font. (JavaScript encodes strings in
     * Unicode, but standard fonts use either WinAnsi, ZapfDingbats, or Symbol
     * encodings)
     */
    encodeText(text: string): PDFHexString;
    widthOfTextAtSize(text: string, size: number): number;
    heightOfFontAtSize(size: number, options?: {
        descender?: boolean;
    }): number;
    sizeOfFontAtHeight(height: number): number;
    embedIntoContext(context: PDFContext, ref?: PDFRef): PDFRef;
    private widthOfGlyph;
    private encodeTextAsGlyphs;
}
export default StandardFontEmbedder;
//# sourceMappingURL=StandardFontEmbedder.d.ts.map