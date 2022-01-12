import PDFRef from "../objects/PDFRef";
import PDFContext from "../PDFContext";
declare enum ColorSpace {
    DeviceGray = "DeviceGray",
    DeviceRGB = "DeviceRGB",
    DeviceCMYK = "DeviceCMYK"
}
/**
 * A note of thanks to the developers of https://github.com/foliojs/pdfkit, as
 * this class borrows from:
 *   https://github.com/foliojs/pdfkit/blob/a6af76467ce06bd6a2af4aa7271ccac9ff152a7d/lib/image/jpeg.js
 */
declare class JpegEmbedder {
    static for(imageData: Uint8Array): Promise<JpegEmbedder>;
    readonly bitsPerComponent: number;
    readonly height: number;
    readonly width: number;
    readonly colorSpace: ColorSpace;
    private readonly imageData;
    private constructor();
    embedIntoContext(context: PDFContext, ref?: PDFRef): Promise<PDFRef>;
}
export default JpegEmbedder;
//# sourceMappingURL=JpegEmbedder.d.ts.map