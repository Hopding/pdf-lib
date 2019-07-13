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
