export declare class EncryptedPDFError extends Error {
    constructor();
}
export declare class FontkitNotRegisteredError extends Error {
    constructor();
}
export declare class ForeignPageError extends Error {
    constructor();
}
export declare class RemovePageFromEmptyDocumentError extends Error {
    constructor();
}
export declare class NoSuchFieldError extends Error {
    constructor(name: string);
}
export declare class UnexpectedFieldTypeError extends Error {
    constructor(name: string, expected: any, actual: any);
}
export declare class MissingOnValueCheckError extends Error {
    constructor(onValue: any);
}
export declare class FieldAlreadyExistsError extends Error {
    constructor(name: string);
}
export declare class InvalidFieldNamePartError extends Error {
    constructor(namePart: string);
}
export declare class FieldExistsAsNonTerminalError extends Error {
    constructor(name: string);
}
export declare class RichTextFieldReadError extends Error {
    constructor(fieldName: string);
}
export declare class CombedTextLayoutError extends Error {
    constructor(lineLength: number, cellCount: number);
}
export declare class ExceededMaxLengthError extends Error {
    constructor(textLength: number, maxLength: number, name: string);
}
export declare class InvalidMaxLengthError extends Error {
    constructor(textLength: number, maxLength: number, name: string);
}
//# sourceMappingURL=errors.d.ts.map