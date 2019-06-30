import fs from 'fs';
import { EncryptedPDFError, PDFDocument } from 'src/index';

const unencryptedPdfBytes = fs.readFileSync('assets/pdfs/normal.pdf');
const oldEncryptedPdfBytes1 = fs.readFileSync('assets/pdfs/encrypted_old.pdf');
const oldEncryptedPdfBytes2 = fs.readFileSync('pdf_specification.pdf');
const newEncryptedPdfBytes = fs.readFileSync('assets/pdfs/encrypted_new.pdf');

describe(`PDFDocument`, () => {
  describe(`load() method`, () => {
    it(`does not throw an error for unencrypted PDFs`, () => {
      const pdfDoc = PDFDocument.load(unencryptedPdfBytes);
      expect(pdfDoc).toBeInstanceOf(PDFDocument);
      expect(pdfDoc.isEncrypted).toBe(false);
    });

    it(`throws an error for old encrypted PDFs (1)`, () => {
      expect(() => PDFDocument.load(oldEncryptedPdfBytes1)).toThrow(
        new EncryptedPDFError(),
      );
    });

    it(`throws an error for old encrypted PDFs (2)`, () => {
      expect(() => PDFDocument.load(oldEncryptedPdfBytes2)).toThrow(
        new EncryptedPDFError(),
      );
    });

    it(`throws an error for new encrypted PDFs`, () => {
      expect(() => PDFDocument.load(newEncryptedPdfBytes)).toThrow(
        new EncryptedPDFError(),
      );
    });

    it(`does not throw an error for old encrypted PDFs when ignoreEncryption=true (1)`, () => {
      const pdfDoc = PDFDocument.load(oldEncryptedPdfBytes1, {
        ignoreEncryption: true,
      });
      expect(pdfDoc).toBeInstanceOf(PDFDocument);
      expect(pdfDoc.isEncrypted).toBe(true);
    });

    it(`does not throw an error for old encrypted PDFs when ignoreEncryption=true (2)`, () => {
      const pdfDoc = PDFDocument.load(oldEncryptedPdfBytes2, {
        ignoreEncryption: true,
      });
      expect(pdfDoc).toBeInstanceOf(PDFDocument);
      expect(pdfDoc.isEncrypted).toBe(true);
    });

    it(`does not throw an error for new encrypted PDFs when ignoreEncryption=true`, () => {
      const pdfDoc = PDFDocument.load(newEncryptedPdfBytes, {
        ignoreEncryption: true,
      });
      expect(pdfDoc).toBeInstanceOf(PDFDocument);
      expect(pdfDoc.isEncrypted).toBe(true);
    });
  });
});
