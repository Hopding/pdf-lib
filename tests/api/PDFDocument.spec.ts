import fs from 'fs';
import { EncryptedPDFError, ParseSpeeds, PDFDocument } from 'src/index';

const unencryptedPdfBytes = fs.readFileSync('assets/pdfs/normal.pdf');
const oldEncryptedPdfBytes1 = fs.readFileSync('assets/pdfs/encrypted_old.pdf');
const oldEncryptedPdfBytes2 = fs.readFileSync('pdf_specification.pdf');
const newEncryptedPdfBytes = fs.readFileSync('assets/pdfs/encrypted_new.pdf');

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
  });
});
