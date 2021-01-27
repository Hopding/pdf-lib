// tslint:disable: max-classes-per-file
import PDFObject from 'src/core/objects/PDFObject';
import { arrayAsString } from 'src/utils';

export class MethodNotImplementedError extends Error {
  constructor(className: string, methodName: string) {
    const msg = `Method ${className}.${methodName}() not implemented`;
    super(msg);
  }
}

export class PrivateConstructorError extends Error {
  constructor(className: string) {
    const msg = `Cannot construct ${className} - it has a private constructor`;
    super(msg);
  }
}

export class UnexpectedObjectTypeError extends Error {
  constructor(expected: any | any[], actual: any) {
    const name = (t: any) => t?.name ?? t?.constructor?.name;

    const expectedTypes = Array.isArray(expected)
      ? expected.map(name)
      : [name(expected)];

    const msg =
      `Expected instance of ${expectedTypes.join(' or ')}, ` +
      `but got instance of ${actual ? name(actual) : actual}`;

    super(msg);
  }
}

export class UnsupportedEncodingError extends Error {
  constructor(encoding: string) {
    const msg = `${encoding} stream encoding not supported`;
    super(msg);
  }
}

export class ReparseError extends Error {
  constructor(className: string, methodName: string) {
    const msg = `Cannot call ${className}.${methodName}() more than once`;
    super(msg);
  }
}

export class MissingCatalogError extends Error {
  constructor(ref?: PDFObject) {
    const msg = `Missing catalog (ref=${ref})`;
    super(msg);
  }
}

export class MissingPageContentsEmbeddingError extends Error {
  constructor() {
    const msg = `Can't embed page with missing Contents`;
    super(msg);
  }
}

export class UnrecognizedStreamTypeError extends Error {
  constructor(stream: any) {
    const streamType = stream?.contructor?.name ?? stream?.name ?? stream;
    const msg = `Unrecognized stream type: ${streamType}`;
    super(msg);
  }
}

export class PageEmbeddingMismatchedContextError extends Error {
  constructor() {
    const msg = `Found mismatched contexts while embedding pages. All pages in the array passed to \`PDFDocument.embedPages()\` must be from the same document.`;
    super(msg);
  }
}

export class PDFArrayIsNotRectangleError extends Error {
  constructor(size: number) {
    const msg = `Attempted to convert PDFArray with ${size} elements to rectangle, but must have exactly 4 elements.`;
    super(msg);
  }
}

export class InvalidPDFDateStringError extends Error {
  constructor(value: string) {
    const msg = `Attempted to convert "${value}" to a date, but it does not match the PDF date string format.`;
    super(msg);
  }
}

export class InvalidTargetIndexError extends Error {
  constructor(targetIndex: number, Count: number) {
    const msg = `Invalid targetIndex specified: targetIndex=${targetIndex} must be less than Count=${Count}`;
    super(msg);
  }
}

export class CorruptPageTreeError extends Error {
  constructor(targetIndex: number, operation: string) {
    const msg = `Failed to ${operation} at targetIndex=${targetIndex} due to corrupt page tree: It is likely that one or more 'Count' entries are invalid`;
    super(msg);
  }
}

export class IndexOutOfBoundsError extends Error {
  constructor(index: number, min: number, max: number) {
    const msg = `index should be at least ${min} and at most ${max}, but was actually ${index}`;
    super(msg);
  }
}

export class InvalidAcroFieldValueError extends Error {
  constructor() {
    const msg = `Attempted to set invalid field value`;
    super(msg);
  }
}

export class MultiSelectValueError extends Error {
  constructor() {
    const msg = `Attempted to select multiple values for single-select field`;
    super(msg);
  }
}

export class MissingDAEntryError extends Error {
  constructor(fieldName: string) {
    const msg = `No /DA (default appearance) entry found for field: ${fieldName}`;
    super(msg);
  }
}

export class MissingTfOperatorError extends Error {
  constructor(fieldName: string) {
    const msg = `No Tf operator found for DA of field: ${fieldName}`;
    super(msg);
  }
}

/***** Parser Errors ******/

export interface Position {
  line: number;
  column: number;
  offset: number;
}

export class NumberParsingError extends Error {
  constructor(pos: Position, value: string) {
    const msg =
      `Failed to parse number ` +
      `(line:${pos.line} col:${pos.column} offset=${pos.offset}): "${value}"`;
    super(msg);
  }
}

export class PDFParsingError extends Error {
  constructor(pos: Position, details: string) {
    const msg =
      `Failed to parse PDF document ` +
      `(line:${pos.line} col:${pos.column} offset=${pos.offset}): ${details}`;
    super(msg);
  }
}

export class NextByteAssertionError extends PDFParsingError {
  constructor(pos: Position, expectedByte: number, actualByte: number) {
    const msg = `Expected next byte to be ${expectedByte} but it was actually ${actualByte}`;
    super(pos, msg);
  }
}

export class PDFObjectParsingError extends PDFParsingError {
  constructor(pos: Position, byte: number) {
    const msg = `Failed to parse PDF object starting with the following byte: ${byte}`;
    super(pos, msg);
  }
}

export class PDFInvalidObjectParsingError extends PDFParsingError {
  constructor(pos: Position) {
    const msg = `Failed to parse invalid PDF object`;
    super(pos, msg);
  }
}

export class PDFStreamParsingError extends PDFParsingError {
  constructor(pos: Position) {
    const msg = `Failed to parse PDF stream`;
    super(pos, msg);
  }
}

export class UnbalancedParenthesisError extends PDFParsingError {
  constructor(pos: Position) {
    const msg = `Failed to parse PDF literal string due to unbalanced parenthesis`;
    super(pos, msg);
  }
}

export class StalledParserError extends PDFParsingError {
  constructor(pos: Position) {
    const msg = `Parser stalled`;
    super(pos, msg);
  }
}

export class MissingPDFHeaderError extends PDFParsingError {
  constructor(pos: Position) {
    const msg = `No PDF header found`;
    super(pos, msg);
  }
}

export class MissingKeywordError extends PDFParsingError {
  constructor(pos: Position, keyword: number[]) {
    const msg = `Did not find expected keyword '${arrayAsString(keyword)}'`;
    super(pos, msg);
  }
}
