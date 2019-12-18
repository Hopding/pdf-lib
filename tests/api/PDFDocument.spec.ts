import fs from 'fs';
import {
  EncryptedPDFError,
  ParseSpeeds,
  PDFDocument,
  PDFName,
  PDFPage,
} from 'src/index';

const unencryptedPdfBytes = fs.readFileSync('assets/pdfs/normal.pdf');
const oldEncryptedPdfBytes1 = fs.readFileSync('assets/pdfs/encrypted_old.pdf');
const oldEncryptedPdfBytes2 = fs.readFileSync('pdf_specification.pdf');
const newEncryptedPdfBytes = fs.readFileSync('assets/pdfs/encrypted_new.pdf');
const invalidObjectsPdfBytes = fs.readFileSync(
  'assets/pdfs/with_invalid_objects.pdf',
);

describe(`PDFDocument`, () => {
  describe(`load() method`, () => {
    const origConsoleWarn = console.warn;

    beforeAll(() => {
      console.warn = jest.fn((...args) => {
        if (
          !args[0].includes('Trying to parse invalid object:') &&
          !args[0].includes('Invalid object ref:')
        ) {
          origConsoleWarn(...args);
        }
      });
    });

    beforeEach(() => {
      jest.clearAllMocks();
    });

    afterAll(() => {
      console.warn = origConsoleWarn;
    });

    it(`does not throw an error for unencrypted PDFs`, async () => {
      const pdfDoc = await PDFDocument.load(unencryptedPdfBytes, {
        parseSpeed: ParseSpeeds.Fastest,
      });
      expect(pdfDoc).toBeInstanceOf(PDFDocument);
      expect(pdfDoc.isEncrypted).toBe(false);
    });

    it(`throws an error for old encrypted PDFs (1)`, async () => {
      await expect(
        PDFDocument.load(oldEncryptedPdfBytes1, {
          parseSpeed: ParseSpeeds.Fastest,
        }),
      ).rejects.toThrow(new EncryptedPDFError());
    });

    it(`throws an error for old encrypted PDFs (2)`, async () => {
      await expect(
        PDFDocument.load(oldEncryptedPdfBytes2, {
          parseSpeed: ParseSpeeds.Fastest,
        }),
      ).rejects.toThrow(new EncryptedPDFError());
    });

    it(`throws an error for new encrypted PDFs`, async () => {
      await expect(
        PDFDocument.load(newEncryptedPdfBytes, {
          parseSpeed: ParseSpeeds.Fastest,
        }),
      ).rejects.toThrow(new EncryptedPDFError());
    });

    it(`does not throw an error for old encrypted PDFs when ignoreEncryption=true (1)`, async () => {
      const pdfDoc = await PDFDocument.load(oldEncryptedPdfBytes1, {
        ignoreEncryption: true,
        parseSpeed: ParseSpeeds.Fastest,
      });
      expect(pdfDoc).toBeInstanceOf(PDFDocument);
      expect(pdfDoc.isEncrypted).toBe(true);
    });

    it(`does not throw an error for old encrypted PDFs when ignoreEncryption=true (2)`, async () => {
      const pdfDoc = await PDFDocument.load(oldEncryptedPdfBytes2, {
        ignoreEncryption: true,
        parseSpeed: ParseSpeeds.Fastest,
      });
      expect(pdfDoc).toBeInstanceOf(PDFDocument);
      expect(pdfDoc.isEncrypted).toBe(true);
    });

    it(`does not throw an error for new encrypted PDFs when ignoreEncryption=true`, async () => {
      const pdfDoc = await PDFDocument.load(newEncryptedPdfBytes, {
        ignoreEncryption: true,
        parseSpeed: ParseSpeeds.Fastest,
      });
      expect(pdfDoc).toBeInstanceOf(PDFDocument);
      expect(pdfDoc.isEncrypted).toBe(true);
    });

    it(`does not throw an error for invalid PDFs when throwOnInvalidObject=false`, async () => {
      await expect(
        PDFDocument.load(invalidObjectsPdfBytes, {
          ignoreEncryption: true,
          parseSpeed: ParseSpeeds.Fastest,
          throwOnInvalidObject: false,
        }),
      ).resolves.toBeInstanceOf(PDFDocument);
    });

    it(`throws an error for invalid PDFs when throwOnInvalidObject=true`, async () => {
      const expectedError = new Error(
        'Trying to parse invalid object: {"line":20,"column":13,"offset":126})',
      );
      await expect(
        PDFDocument.load(invalidObjectsPdfBytes, {
          ignoreEncryption: true,
          parseSpeed: ParseSpeeds.Fastest,
          throwOnInvalidObject: true,
        }),
      ).rejects.toEqual(expectedError);
    });
  });

  describe(`setLanguage() method`, () => {
    let pdfDoc: PDFDocument;
    beforeAll(async () => {
      const parseSpeed = ParseSpeeds.Fastest;
      pdfDoc = await PDFDocument.load(unencryptedPdfBytes, { parseSpeed });
    });

    it(`sets the language of the document`, () => {
      expect(pdfDoc.catalog.get(PDFName.of('Lang'))).toBe(undefined);
      pdfDoc.setLanguage('fr-FR');
      expect(String(pdfDoc.catalog.get(PDFName.of('Lang')))).toBe('(fr-FR)');
      pdfDoc.setLanguage('en');
      expect(String(pdfDoc.catalog.get(PDFName.of('Lang')))).toBe('(en)');
      pdfDoc.setLanguage('');
      expect(String(pdfDoc.catalog.get(PDFName.of('Lang')))).toBe('()');
    });
  });

  describe(`getPageCount() method`, () => {
    let pdfDoc: PDFDocument;
    beforeAll(async () => {
      const parseSpeed = ParseSpeeds.Fastest;
      pdfDoc = await PDFDocument.load(unencryptedPdfBytes, { parseSpeed });
    });

    it(`returns the initial page count of the document`, () => {
      expect(pdfDoc.getPageCount()).toBe(2);
    });

    it(`returns the updated page count after adding pages`, () => {
      pdfDoc.addPage();
      pdfDoc.addPage();
      expect(pdfDoc.getPageCount()).toBe(4);
    });

    it(`returns the updated page count after inserting pages`, () => {
      pdfDoc.insertPage(0);
      pdfDoc.insertPage(4);
      expect(pdfDoc.getPageCount()).toBe(6);
    });

    it(`returns the updated page count after removing pages`, () => {
      pdfDoc.removePage(5);
      pdfDoc.removePage(0);
      expect(pdfDoc.getPageCount()).toBe(4);
    });

    it(`returns 0 for brand new documents`, async () => {
      const newDoc = await PDFDocument.create();
      expect(newDoc.getPageCount()).toBe(0);
    });
  });

  describe(`addPage() method`, () => {
    it(`Can insert pages in brand new documents`, async () => {
      const pdfDoc = await PDFDocument.create();
      expect(pdfDoc.addPage()).toBeInstanceOf(PDFPage);
    });
  });
});
