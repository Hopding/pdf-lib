import PDFRef from "../objects/PDFRef";
import PDFContext from "../PDFContext";
/**
 * A note of thanks to the developers of https://github.com/foliojs/pdfkit, as
 * this class borrows from:
 *   https://github.com/devongovett/pdfkit/blob/e71edab0dd4657b5a767804ba86c94c58d01fbca/lib/image/png.coffee
 */
declare class PngEmbedder {
    static for(imageData: Uint8Array): Promise<PngEmbedder>;
    readonly bitsPerComponent: number;
    readonly height: number;
    readonly width: number;
    readonly colorSpace: 'DeviceRGB';
    private readonly image;
    private constructor();
    embedIntoContext(context: PDFContext, ref?: PDFRef): Promise<PDFRef>;
    private embedAlphaChannel;
}
export default PngEmbedder;
//# sourceMappingURL=PngEmbedder.d.ts.map