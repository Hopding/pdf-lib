import fontkit from '@pdf-lib/fontkit';
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
const justMetadataPdfbytes = fs.readFileSync('assets/pdfs/just_metadata.pdf');
const normalPdfBytes = fs.readFileSync('assets/pdfs/normal.pdf');

describe(`PDFDocument`, () => {
  describe(`load() method`, () => {
    const origConsoleWarn = console.warn;

    beforeAll(() => {
      const ignoredWarnings = [
        'Trying to parse invalid object:',
        'Invalid object ref:',
      ];
      console.warn = jest.fn((...args) => {
        const isIgnored = ignoredWarnings.find((iw) => args[0].includes(iw));
        if (!isIgnored) origConsoleWarn(...args);
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

  describe(`embedFont() method`, () => {
    it(`serializes the same value on every save when using a custom font name`, async () => {
      const customFont = fs.readFileSync('assets/fonts/ubuntu/Ubuntu-B.ttf');
      const customName = 'Custom-Font-Name';
      const pdfDoc1 = await PDFDocument.create({ updateMetadata: false });
      const pdfDoc2 = await PDFDocument.create({ updateMetadata: false });

      pdfDoc1.registerFontkit(fontkit);
      pdfDoc2.registerFontkit(fontkit);

      await pdfDoc1.embedFont(customFont, { customName });
      await pdfDoc2.embedFont(customFont, { customName });

      const savedDoc1 = await pdfDoc1.save();
      const savedDoc2 = await pdfDoc2.save();

      expect(savedDoc1).toEqual(savedDoc2);
    });

    it(`does not serialize the same on save when not using a custom font name`, async () => {
      const customFont = fs.readFileSync('assets/fonts/ubuntu/Ubuntu-B.ttf');
      const pdfDoc1 = await PDFDocument.create();
      const pdfDoc2 = await PDFDocument.create();

      pdfDoc1.registerFontkit(fontkit);
      pdfDoc2.registerFontkit(fontkit);

      await pdfDoc1.embedFont(customFont);
      await pdfDoc2.embedFont(customFont);

      const savedDoc1 = await pdfDoc1.save();
      const savedDoc2 = await pdfDoc2.save();

      expect(savedDoc1).not.toEqual(savedDoc2);
    });
  });

  describe(`setLanguage() method`, () => {
    it(`sets the language of the document`, async () => {
      const pdfDoc = await PDFDocument.create();
      expect(pdfDoc.catalog.get(PDFName.of('Lang'))).toBeUndefined();

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

  describe(`metadata getter methods`, () => {
    it(`they can retrieve the title, author, subject, producer, creator, keywords, creation date, and modification date from a new document`, async () => {
      const pdfDoc = await PDFDocument.create();

      // Everything is empty or has its initial value.
      expect(pdfDoc.getTitle()).toBeUndefined();
      expect(pdfDoc.getAuthor()).toBeUndefined();
      expect(pdfDoc.getSubject()).toBeUndefined();
      expect(pdfDoc.getProducer()).toBe(
        'pdf-lib (https://github.com/Hopding/pdf-lib)',
      );
      expect(pdfDoc.getCreator()).toBe(
        'pdf-lib (https://github.com/Hopding/pdf-lib)',
      );
      expect(pdfDoc.getKeywords()).toBeUndefined();
      // Dates can not be tested since they have the current time as value.

      const title = '🥚 The Life of an Egg 🍳';
      const author = 'Humpty Dumpty';
      const subject = '📘 An Epic Tale of Woe 📖';
      const keywords = ['eggs', 'wall', 'fall', 'king', 'horses', 'men', '🥚'];
      const producer = 'PDF App 9000 🤖';
      const creator = 'PDF App 8000 🤖';

      // Milliseconds  will not get saved, so these dates do not have milliseconds.
      const creationDate = new Date('1997-08-15T01:58:37Z');
      const modificationDate = new Date('2018-12-21T07:00:11Z');

      pdfDoc.setTitle(title);
      pdfDoc.setAuthor(author);
      pdfDoc.setSubject(subject);
      pdfDoc.setKeywords(keywords);
      pdfDoc.setProducer(producer);
      pdfDoc.setCreator(creator);
      pdfDoc.setCreationDate(creationDate);
      pdfDoc.setModificationDate(modificationDate);

      expect(pdfDoc.getTitle()).toBe(title);
      expect(pdfDoc.getAuthor()).toBe(author);
      expect(pdfDoc.getSubject()).toBe(subject);
      expect(pdfDoc.getProducer()).toBe(producer);
      expect(pdfDoc.getCreator()).toBe(creator);
      expect(pdfDoc.getKeywords()).toBe(keywords.join(' '));
      expect(pdfDoc.getCreationDate()).toStrictEqual(creationDate);
      expect(pdfDoc.getModificationDate()).toStrictEqual(modificationDate);
    });

    it(`they can retrieve the title, author, subject, producer, creator, and keywords from an existing document`, async () => {
      const pdfDoc = await PDFDocument.load(justMetadataPdfbytes);

      expect(pdfDoc.getTitle()).toBe(
        'Title metadata (StringType=HexString, Encoding=PDFDocEncoding) with some weird chars ˘•€',
      );
      expect(pdfDoc.getAuthor()).toBe(
        'Author metadata (StringType=HexString, Encoding=UTF-16BE) with some chinese 你怎么敢',
      );
      expect(pdfDoc.getSubject()).toBe(
        'Subject metadata (StringType=LiteralString, Encoding=UTF-16BE) with some chinese 你怎么敢',
      );
      expect(pdfDoc.getProducer()).toBe(
        'pdf-lib (https://github.com/Hopding/pdf-lib)',
      );
      expect(pdfDoc.getKeywords()).toBe(
        'Keywords metadata (StringType=LiteralString, Encoding=PDFDocEncoding) with  some weird  chars ˘•€',
      );
    });

    it(`they can retrieve the creation date and modification date from an existing document`, async () => {
      const pdfDoc = await PDFDocument.load(normalPdfBytes, {
        updateMetadata: false,
      });

      expect(pdfDoc.getCreationDate()).toEqual(
        new Date('2018-01-04T01:05:06.000Z'),
      );
      expect(pdfDoc.getModificationDate()).toEqual(
        new Date('2018-01-04T01:05:06.000Z'),
      );
    });
  });
});
