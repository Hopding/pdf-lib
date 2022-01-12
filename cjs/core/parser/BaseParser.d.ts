import ByteStream from "./ByteStream";
declare class BaseParser {
    protected readonly bytes: ByteStream;
    protected readonly capNumbers: boolean;
    constructor(bytes: ByteStream, capNumbers?: boolean);
    protected parseRawInt(): number;
    protected parseRawNumber(): number;
    protected skipWhitespace(): void;
    protected skipLine(): void;
    protected skipComment(): boolean;
    protected skipWhitespaceAndComments(): void;
    protected matchKeyword(keyword: number[]): boolean;
}
export default BaseParser;
//# sourceMappingURL=BaseParser.d.ts.map