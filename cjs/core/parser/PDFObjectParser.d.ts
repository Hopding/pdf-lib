import { Position } from "../errors";
import PDFArray from "../objects/PDFArray";
import PDFDict from "../objects/PDFDict";
import PDFHexString from "../objects/PDFHexString";
import PDFName from "../objects/PDFName";
import PDFNumber from "../objects/PDFNumber";
import PDFObject from "../objects/PDFObject";
import PDFRef from "../objects/PDFRef";
import PDFStream from "../objects/PDFStream";
import PDFString from "../objects/PDFString";
import BaseParser from "./BaseParser";
import ByteStream from "./ByteStream";
import PDFContext from "../PDFContext";
declare class PDFObjectParser extends BaseParser {
    static forBytes: (bytes: Uint8Array, context: PDFContext, capNumbers?: boolean | undefined) => PDFObjectParser;
    static forByteStream: (byteStream: ByteStream, context: PDFContext, capNumbers?: boolean) => PDFObjectParser;
    protected readonly context: PDFContext;
    constructor(byteStream: ByteStream, context: PDFContext, capNumbers?: boolean);
    parseObject(): PDFObject;
    protected parseNumberOrRef(): PDFNumber | PDFRef;
    protected parseHexString(): PDFHexString;
    protected parseString(): PDFString;
    protected parseName(): PDFName;
    protected parseArray(): PDFArray;
    protected parseDict(): PDFDict;
    protected parseDictOrStream(): PDFDict | PDFStream;
    protected findEndOfStreamFallback(startPos: Position): number;
}
export default PDFObjectParser;
//# sourceMappingURL=PDFObjectParser.d.ts.map