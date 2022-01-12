import PDFRef from "../objects/PDFRef";
import PDFContext from "../PDFContext";
import PDFPageLeaf from "../structures/PDFPageLeaf";
import { TransformationMatrix } from "../../types/matrix";
/**
 * Represents a page bounding box.
 * Usually `left` and `bottom` are 0 and right, top are equal
 * to width, height if you want to clip to the whole page.
 *
 *       y
 *       ^
 *       | +--------+ (width,height)
 *       | |        |
 *       | |  Page  |
 *       | |        |
 *       | |        |
 * (0,0) | +--------+
 *       +----------> x
 */
export interface PageBoundingBox {
    left: number /** The left of the bounding box */;
    bottom: number /** The bottom of the bounding box */;
    right: number /** The right of the bounding box */;
    top: number /** The top of the bounding box */;
}
declare class PDFPageEmbedder {
    static for(page: PDFPageLeaf, boundingBox?: PageBoundingBox, transformationMatrix?: TransformationMatrix): Promise<PDFPageEmbedder>;
    readonly width: number;
    readonly height: number;
    readonly boundingBox: PageBoundingBox;
    readonly transformationMatrix: TransformationMatrix;
    private readonly page;
    private constructor();
    embedIntoContext(context: PDFContext, ref?: PDFRef): Promise<PDFRef>;
    private decodeContents;
}
export default PDFPageEmbedder;
//# sourceMappingURL=PDFPageEmbedder.d.ts.map