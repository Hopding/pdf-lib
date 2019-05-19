// tslint:disable: max-classes-per-file
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

export class ReparseError extends Error {
  constructor() {
    const msg = `Cannot call PDFParser.parseDocument() more than once`;
    super(msg);
  }
}

/***** Parser Errors ******/

interface Position {
  line: number;
  column: number;
  offset: number;
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
