import PDFObject from "./objects/PDFObject";
import PDFContext from "./PDFContext";
/**
 * PDFObjectCopier copies PDFObjects from a src context to a dest context.
 * The primary use case for this is to copy pages between PDFs.
 *
 * _Copying_ an object with a PDFObjectCopier is different from _cloning_ an
 * object with its [[PDFObject.clone]] method:
 *
 * ```
 *   const src: PDFContext = ...
 *   const dest: PDFContext = ...
 *   const originalObject: PDFObject = ...
 *   const copiedObject = PDFObjectCopier.for(src, dest).copy(originalObject);
 *   const clonedObject = originalObject.clone();
 * ```
 *
 * Copying an object is equivalent to cloning it and then copying over any other
 * objects that it references. Note that only dictionaries, arrays, and streams
 * (or structures build from them) can contain indirect references to other
 * objects. Copying a PDFObject that is not a dictionary, array, or stream is
 * supported, but is equivalent to cloning it.
 */
declare class PDFObjectCopier {
    static for: (src: PDFContext, dest: PDFContext) => PDFObjectCopier;
    private readonly src;
    private readonly dest;
    private readonly traversedObjects;
    private constructor();
    copy: <T extends PDFObject>(object: T) => T;
    private copyPDFPage;
    private copyPDFDict;
    private copyPDFArray;
    private copyPDFStream;
    private copyPDFIndirectObject;
}
export default PDFObjectCopier;
//# sourceMappingURL=PDFObjectCopier.d.ts.map