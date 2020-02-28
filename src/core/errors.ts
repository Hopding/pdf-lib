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
    const expectedTypes = Array.isArray(expected)
      ? expected.map(({ name }) => name)
      : [expected.name];
    const msg =
      `Expected instance of ${expectedTypes.join(' or ')}, ` +
      `but got instance of ${actual ? actual.constructor.name : actual}`;
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
