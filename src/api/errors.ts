// tslint:disable: max-classes-per-file

// TODO: Include link to documentation with example
export class EncryptedPDFError extends Error {
  constructor() {
    const msg =
      'Input document to `PDFDocument.load` is encrypted. You can use `PDFDocument.load(..., { ignoreEncryption: true })` if you wish to load the document anyways.';
    super(msg);
  }
}

// TODO: Include link to documentation with example
export class FontkitNotRegisteredError extends Error {
  constructor() {
    const msg =
      'Input to `PDFDocument.embedFont` was a custom font, but no `fontkit` instance was found. You must register a `fontkit` instance with `PDFDocument.registerFontkit(...)` before embedding custom fonts.';
    super(msg);
  }
}

// TODO: Include link to documentation with example
export class ForeignPageError extends Error {
  constructor() {
    const msg =
      'A `page` passed to `PDFDocument.addPage` or `PDFDocument.insertPage` was from a different (foreign) PDF document. If you want to copy pages from one PDFDocument to another, you must use `PDFDocument.copyPages(...)` to copy the pages before adding or inserting them.';
    super(msg);
  }
}

// TODO: Include link to documentation with example
export class RemovePageFromEmptyDocumentError extends Error {
  constructor() {
    const msg =
      'PDFDocument has no pages so `PDFDocument.removePage` cannot be called';
    super(msg);
  }
}

export class NoSuchFieldError extends Error {
  constructor(name: string) {
    const msg = `PDFDocument has no form field with the name "${name}"`;
    super(msg);
  }
}

export class UnexpectedFieldTypeError extends Error {
  constructor(name: string, expected: any, actual: any) {
    const expectedType = expected?.name;
    const actualType = actual?.constructor?.name ?? actual;
    const msg =
      `Expected field "${name}" to be of type ${expectedType}, ` +
      `but it is actually of type ${actualType}`;
    super(msg);
  }
}

export class MissingOnValueCheckError extends Error {
  constructor(onValue: any) {
    const msg = `Failed to select check box due to missing onValue: "${onValue}"`;
    super(msg);
  }
}

export class FieldAlreadyExistsError extends Error {
  constructor(name: string) {
    const msg = `A field already exists with the specified name: "${name}"`;
    super(msg);
  }
}

export class InvalidFieldNamePartError extends Error {
  constructor(namePart: string) {
    const msg = `Field name contains invalid component: "${namePart}"`;
    super(msg);
  }
}

export class FieldExistsAsNonTerminalError extends Error {
  constructor(name: string) {
    const msg = `A non-terminal field already exists with the specified name: "${name}"`;
    super(msg);
  }
}

export class RichTextFieldReadError extends Error {
  constructor(fieldName: string) {
    const msg = `Reading rich text fields is not supported: Attempted to read rich text field: ${fieldName}`;
    super(msg);
  }
}

export class CombedTextLayoutError extends Error {
  constructor(lineLength: number, cellCount: number) {
    const msg = `Failed to layout combed text as lineLength=${lineLength} is greater than cellCount=${cellCount}`;
    super(msg);
  }
}

export class ExceededMaxLengthError extends Error {
  constructor(textLength: number, maxLength: number, name: string) {
    const msg = `Attempted to set text with length=${textLength} for TextField with maxLength=${maxLength} and name=${name}`;
    super(msg);
  }
}

export class InvalidMaxLengthError extends Error {
  constructor(textLength: number, maxLength: number, name: string) {
    const msg = `Attempted to set maxLength=${maxLength}, which is less than ${textLength}, the length of this field's current value (name=${name})`;
    super(msg);
  }
}
