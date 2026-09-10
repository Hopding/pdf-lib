import fontkit from '@cantoo/fontkit';
import fs from 'fs';
import {
  EncryptedPDFError,
  ParseSpeeds,
  PDFArray,
  PDFDict,
  PDFDocument,
  PDFHexString,
  PDFName,
  PDFNumber,
  PDFPage,
  Duplex,
  NonFullScreenPageMode,
  PrintScaling,
  ReadingDirection,
  ViewerPreferences,
  StandardFonts,
  AFRelationship,
} from '../../src/index';
import { PDFAttachment } from '../../src/api/PDFDocument';
import { PDFHeader } from '../../src/core';

const examplePngImageBase64 =
  'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABhGlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9TxaoVBzuIdMhQnSyIijhKFYtgobQVWnUwufQLmjQkKS6OgmvBwY/FqoOLs64OroIg+AHi5uak6CIl/i8ptIjx4Lgf7+497t4BQqPCVLNrAlA1y0jFY2I2tyr2vKIfAgLoRVhipp5IL2bgOb7u4ePrXZRneZ/7cwwoeZMBPpF4jumGRbxBPLNp6Zz3iUOsJCnE58TjBl2Q+JHrsstvnIsOCzwzZGRS88QhYrHYwXIHs5KhEk8TRxRVo3wh67LCeYuzWqmx1j35C4N5bSXNdZphxLGEBJIQIaOGMiqwEKVVI8VEivZjHv4Rx58kl0yuMhg5FlCFCsnxg//B727NwtSkmxSMAd0vtv0xCvTsAs26bX8f23bzBPA/A1da219tALOfpNfbWuQIGNwGLq7bmrwHXO4Aw0+6ZEiO5KcpFArA+xl9Uw4YugX61tzeWvs4fQAy1NXyDXBwCIwVKXvd492Bzt7+PdPq7wcdn3KFLu4iBAAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAlFJREFUeNrt289r02AYB/Dvk6Sl4EDKpllTlFKsnUdBHXgUBEHwqHj2IJ72B0zwKHhxJ08i/gDxX/AiRfSkBxELXTcVxTa2s2xTsHNN8ngQbQL70RZqG/Z9b29JnvflkydP37whghG3ZaegoxzfwB5vBCAAAQhAAAIQgAAEIAABCEAAAhCAAAQgwB5rstWPtnP0LqBX/vZNyLF6vVrpN/hucewhb4g+B2AyAwiwY7NGOXijviS9vBeYh6CEP4edBLDADCAAAQhAAAIQgAAEIAABCDAUAFF/GIN1DM+PBYCo/ohMXDQ1WPjoeUZH1mMBEEh0oqLGvsHCy0S4NzWVWotJBogbvZB+brDwQT7UWSmXy5sxyQB9HQEROdVv4HQ+vx+QmS4iXsWmCK7Usu8AhOqAXMzlcn3VgWTbugQgEYrxMkZ/gyUPgnuhe2C6/Stxvdeg2ezMJERvhOuoZ+JBrNYBRuDdBtDuXkDM25nCHLbZSv9X6A4VHU+DpwCcbvbjcetLtTaOANtuirrux08HM0euisjDEMKC7RQuq+C+pVJqpzx3NZ3+eeBza9I0rWJgyHnxg2sAJrqnaHUzFcyN60Jox13hprv8aNopZBS4GcqWWVHM+lAkN0zY7ncgkYBukRoKLPpiXVj9UFkfV4Bdl8Jf60u3IMZZAG/6iLuhkDvaSZ74VqtUx3kp3NN7gUZt8RmA43a2eEY1OCfQ04AcBpAGkAKwpkBLIG8BfQE/eNJsvG/G4VlARj0BfjDBx2ECEIAABCAAAQhAAAIQgAAE+P/tN8YvpvbTDBOlAAAAAElFTkSuQmCC';
const examplePngImage = `data:image/png;base64,${examplePngImageBase64}`;

const unencryptedPdfBytes = fs.readFileSync('assets/pdfs/normal.pdf');
const oldEncryptedPdfBytes1 = fs.readFileSync('assets/pdfs/encrypted_old.pdf');

// Had to remove this file due to DMCA complaint, so commented this line out
// along with the 2 tests that depend on it. Would be nice to find a new file
// that we could drop in here, but the tests are for non-critical functionality,
// so this solution is okay for now.
// const oldEncryptedPdfBytes2 = fs.readFileSync('pdf_specification.pdf');

const newEncryptedPdfBytes = fs.readFileSync('assets/pdfs/encrypted_new.pdf');
const encryptedLiteralStringsPdfBytes = fs.readFileSync(
  'assets/pdfs/encrypted_literal_strings.pdf',
);
const invalidObjectsPdfBytes = fs.readFileSync(
  'assets/pdfs/with_invalid_objects.pdf',
);
const justMetadataPdfbytes = fs.readFileSync('assets/pdfs/just_metadata.pdf');
const normalPdfBytes = fs.readFileSync('assets/pdfs/normal.pdf');
const withViewerPrefsPdfBytes = fs.readFileSync(
  'assets/pdfs/with_viewer_prefs.pdf',
);
const hasAttachmentPdfBytes = fs.readFileSync(
  'assets/pdfs/examples/add_attachments.pdf',
);

const simplePdfBytes = fs.readFileSync('assets/pdfs/simple.pdf');
const simpleStreamsPdfBytes = fs.readFileSync('assets/pdfs/simple_streams.pdf');

const v15PdfBytes = fs.readFileSync('assets/pdfs/v15xref.pdf');
const v14PdfBytes = fs.readFileSync('assets/pdfs/bixby_guide.pdf');
const v13PdfBytes = normalPdfBytes;

describe('PDFDocument', () => {
  describe('load() method', () => {
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

    it('does not throw an error for unencrypted PDFs', async () => {
      const pdfDoc = await PDFDocument.load(unencryptedPdfBytes, {
        parseSpeed: ParseSpeeds.Fastest,
      });
      expect(pdfDoc).toBeInstanceOf(PDFDocument);
      expect(pdfDoc.isEncrypted).toBe(false);
    });

    it('throws an error for old encrypted PDFs (1)', async () => {
      await expect(
        PDFDocument.load(oldEncryptedPdfBytes1, {
          parseSpeed: ParseSpeeds.Fastest,
        }),
      ).rejects.toThrow(new EncryptedPDFError());
    });

    // it(`throws an error for old encrypted PDFs (2)`, async () => {
    //   await expect(
    //     PDFDocument.load(oldEncryptedPdfBytes2, {
    //       parseSpeed: ParseSpeeds.Fastest,
    //     }),
    //   ).rejects.toThrow(new EncryptedPDFError());
    // });

    it('throws an error for new encrypted PDFs', async () => {
      await expect(
        PDFDocument.load(newEncryptedPdfBytes, {
          parseSpeed: ParseSpeeds.Fastest,
        }),
      ).rejects.toThrow(new EncryptedPDFError());
    });

    it('does not throw an error for old encrypted PDFs when ignoreEncryption=true (1)', async () => {
      const pdfDoc = await PDFDocument.load(oldEncryptedPdfBytes1, {
        ignoreEncryption: true,
        parseSpeed: ParseSpeeds.Fastest,
      });
      expect(pdfDoc).toBeInstanceOf(PDFDocument);
      expect(pdfDoc.isEncrypted).toBe(true);
    });

    // it(`does not throw an error for old encrypted PDFs when ignoreEncryption=true (2)`, async () => {
    //   const pdfDoc = await PDFDocument.load(oldEncryptedPdfBytes2, {
    //     ignoreEncryption: true,
    //     parseSpeed: ParseSpeeds.Fastest,
    //   });
    //   expect(pdfDoc).toBeInstanceOf(PDFDocument);
    //   expect(pdfDoc.isEncrypted).toBe(true);
    // });

    it('does not throw an error for new encrypted PDFs when ignoreEncryption=true', async () => {
      const pdfDoc = await PDFDocument.load(newEncryptedPdfBytes, {
        ignoreEncryption: true,
        parseSpeed: ParseSpeeds.Fastest,
      });
      expect(pdfDoc).toBeInstanceOf(PDFDocument);
      expect(pdfDoc.isEncrypted).toBe(true);
    });

    it('decrypts literal strings', async () => {
      const pdfDoc = await PDFDocument.load(encryptedLiteralStringsPdfBytes, {
        password: '1234',
        parseSpeed: ParseSpeeds.Fastest,
      });
      expect(pdfDoc).toBeInstanceOf(PDFDocument);
      expect(pdfDoc.isEncrypted).toBe(false);
      expect(pdfDoc.getCreator()).toBe('Acrobat Pro DC 19.10.20069');
      expect(pdfDoc.getCreationDate()).toStrictEqual(
        new Date('2025-12-07T01:14:12Z'),
      );
    });

    it('does not throw an error for invalid PDFs when throwOnInvalidObject=false', async () => {
      await expect(
        PDFDocument.load(invalidObjectsPdfBytes, {
          ignoreEncryption: true,
          parseSpeed: ParseSpeeds.Fastest,
          throwOnInvalidObject: false,
        }),
      ).resolves.toBeInstanceOf(PDFDocument);
    });

    it('throws an error for invalid PDFs when throwOnInvalidObject=true', async () => {
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

  describe('largestObjectNumber detection', () => {
    it('loads pdfs with XREF streams', async () => {
      const pdfDoc = await PDFDocument.load(simpleStreamsPdfBytes);
      expect(pdfDoc.context.largestObjectNumber).toBe(8);
    });

    it('loads pdfs without XREF streams', async () => {
      const pdfDoc = await PDFDocument.load(simplePdfBytes);
      expect(pdfDoc.context.largestObjectNumber).toBe(8);
    });

    it('preserves deleted objects numbers if open for update', async () => {
      const pdfBytes = fs.readFileSync(
        './assets/pdfs/with_update_sections.pdf',
      );
      const pdfDoc = await PDFDocument.load(pdfBytes, {
        forIncrementalUpdate: false,
      });
      expect(pdfDoc.context.largestObjectNumber).toBeGreaterThanOrEqual(131);
      const pdfUpdDoc = await PDFDocument.load(pdfBytes, {
        forIncrementalUpdate: true,
      });
      expect(pdfUpdDoc.context.largestObjectNumber).toBe(334);
    });

    it('keeps largestObjectNumber across linearized sections with smaller final Size', async () => {
      const pdfBytes = fs.readFileSync(
        './assets/pdfs/linearized_with_object_streams.pdf',
      );
      const pdfUpdDoc = await PDFDocument.load(pdfBytes, {
        forIncrementalUpdate: true,
        updateMetadata: false,
      });

      const finalSize = pdfUpdDoc.context.trailerInfo.Size!.asNumber();
      // This fixture's final trailer Size is lower than the true max object number.
      // largestObjectNumber must not be collapsed to that smaller Size-1.
      expect(pdfUpdDoc.context.largestObjectNumber).toBeGreaterThan(
        finalSize - 1,
      );
      expect(pdfUpdDoc.context.largestObjectNumber).toBe(85334);

      // The final XRef stream omits Root/Info/ID; they must be kept from earlier sections.
      expect(pdfUpdDoc.context.trailerInfo.Root).toBeTruthy();
      expect(pdfUpdDoc.context.trailerInfo.Info).toBeTruthy();
      expect(pdfUpdDoc.context.trailerInfo.ID).toBeTruthy();
    }, 30000);
  });

  describe('embedFont() method', () => {
    it('serializes the same value on every save', async () => {
      const customFont = fs.readFileSync('assets/fonts/ubuntu/Ubuntu-B.ttf');
      const pdfDoc1 = await PDFDocument.create({ updateMetadata: false });
      const pdfDoc2 = await PDFDocument.create({ updateMetadata: false });

      pdfDoc1.registerFontkit(fontkit);
      pdfDoc2.registerFontkit(fontkit);

      await pdfDoc1.embedFont(customFont);
      await pdfDoc2.embedFont(customFont);

      const savedDoc1 = await pdfDoc1.save();
      const savedDoc2 = await pdfDoc2.save();

      expect(savedDoc1).toEqual(savedDoc2);
    });
  });

  describe('embedStandardFont() method', () => {
    it('Raises an exception if not a standard font', async () => {
      const pdfDoc1 = await PDFDocument.create({ updateMetadata: false });
      expect(() =>
        pdfDoc1.embedStandardFont('MyCustomFont' as StandardFonts),
      ).toThrow();
    });
  });

  describe('setLanguage() method', () => {
    it('sets the language of the document', async () => {
      const pdfDoc = await PDFDocument.create();
      expect(pdfDoc.getLanguage()).toBeUndefined();

      pdfDoc.setLanguage('fr-FR');
      expect(pdfDoc.getLanguage()).toBe('fr-FR');

      pdfDoc.setLanguage('en');
      expect(pdfDoc.getLanguage()).toBe('en');

      pdfDoc.setLanguage('');
      expect(pdfDoc.getLanguage()).toBe('');
    });
  });

  describe('getPageCount() method', () => {
    let pdfDoc: PDFDocument;
    beforeAll(async () => {
      const parseSpeed = ParseSpeeds.Fastest;
      pdfDoc = await PDFDocument.load(unencryptedPdfBytes, { parseSpeed });
    });

    it('returns the initial page count of the document', () => {
      expect(pdfDoc.getPageCount()).toBe(2);
    });

    it('returns the updated page count after adding pages', () => {
      pdfDoc.addPage();
      pdfDoc.addPage();
      expect(pdfDoc.getPageCount()).toBe(4);
    });

    it('returns the updated page count after inserting pages', () => {
      pdfDoc.insertPage(0);
      pdfDoc.insertPage(4);
      expect(pdfDoc.getPageCount()).toBe(6);
    });

    it('returns the updated page count after removing pages', () => {
      pdfDoc.removePage(5);
      pdfDoc.removePage(0);
      expect(pdfDoc.getPageCount()).toBe(4);
    });

    it('returns 0 for brand new documents', async () => {
      const newDoc = await PDFDocument.create();
      expect(newDoc.getPageCount()).toBe(0);
    });
  });

  describe('addPage() method', () => {
    it('Can insert pages in brand new documents', async () => {
      const pdfDoc = await PDFDocument.create();
      expect(pdfDoc.addPage()).toBeInstanceOf(PDFPage);
    });
  });

  describe('removePage() method', () => {
    it('Raises an exception on empty paged documentas', async () => {
      const pdfDoc = await PDFDocument.create();
      expect(() => pdfDoc.removePage(0)).toThrow();
    });
  });

  describe('metadata getter methods', () => {
    it('they can retrieve the title, author, subject, producer, creator, keywords, creation date, and modification date from a new document', async () => {
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

    it('they can retrieve the title, author, subject, producer, creator, and keywords from an existing document', async () => {
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

    it('they can retrieve the creation date and modification date from an existing document', async () => {
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

  describe('ViewerPreferences', () => {
    it('defaults to an undefined ViewerPreferences dict', async () => {
      const pdfDoc = await PDFDocument.create();

      expect(
        pdfDoc.catalog.lookupMaybe(PDFName.of('ViewerPreferences'), PDFDict),
      ).toBeUndefined();
    });

    it('can get/set HideToolbar, HideMenubar, HideWindowUI, FitWindow, CenterWindow, DisplayDocTitle, NonFullScreenPageMode, Direction, PrintScaling, Duplex, PickTrayByPDFSize, PrintPageRange, NumCopies from a new document', async () => {
      const pdfDoc = await PDFDocument.create();
      const viewerPrefs = pdfDoc.catalog.getOrCreateViewerPreferences();

      // Everything is empty or has its initial value.
      expect(viewerPrefs.getHideToolbar()).toBe(false);
      expect(viewerPrefs.getHideMenubar()).toBe(false);
      expect(viewerPrefs.getHideWindowUI()).toBe(false);
      expect(viewerPrefs.getFitWindow()).toBe(false);
      expect(viewerPrefs.getCenterWindow()).toBe(false);
      expect(viewerPrefs.getDisplayDocTitle()).toBe(false);
      expect(viewerPrefs.getNonFullScreenPageMode()).toBe(
        NonFullScreenPageMode.UseNone,
      );
      expect(viewerPrefs.getReadingDirection()).toBe(ReadingDirection.L2R);
      expect(viewerPrefs.getPrintScaling()).toBe(PrintScaling.AppDefault);
      expect(viewerPrefs.getDuplex()).toBeUndefined();
      expect(viewerPrefs.getPickTrayByPDFSize()).toBeUndefined();
      expect(viewerPrefs.getPrintPageRange()).toEqual([]);
      expect(viewerPrefs.getNumCopies()).toBe(1);

      const pageRanges = [
        { start: 0, end: 0 },
        { start: 2, end: 2 },
        { start: 4, end: 6 },
      ];

      viewerPrefs.setHideToolbar(true);
      viewerPrefs.setHideMenubar(true);
      viewerPrefs.setHideWindowUI(true);
      viewerPrefs.setFitWindow(true);
      viewerPrefs.setCenterWindow(true);
      viewerPrefs.setDisplayDocTitle(true);
      viewerPrefs.setNonFullScreenPageMode(NonFullScreenPageMode.UseOutlines);
      viewerPrefs.setReadingDirection(ReadingDirection.R2L);
      viewerPrefs.setPrintScaling(PrintScaling.None);
      viewerPrefs.setDuplex(Duplex.DuplexFlipLongEdge);
      viewerPrefs.setPickTrayByPDFSize(true);
      viewerPrefs.setPrintPageRange(pageRanges);
      viewerPrefs.setNumCopies(2);

      expect(viewerPrefs.getHideToolbar()).toBe(true);
      expect(viewerPrefs.getHideMenubar()).toBe(true);
      expect(viewerPrefs.getHideWindowUI()).toBe(true);
      expect(viewerPrefs.getFitWindow()).toBe(true);
      expect(viewerPrefs.getCenterWindow()).toBe(true);
      expect(viewerPrefs.getDisplayDocTitle()).toBe(true);
      expect(viewerPrefs.getNonFullScreenPageMode()).toBe(
        NonFullScreenPageMode.UseOutlines,
      );
      expect(viewerPrefs.getReadingDirection()).toBe(ReadingDirection.R2L);
      expect(viewerPrefs.getPrintScaling()).toBe(PrintScaling.None);
      expect(viewerPrefs.getDuplex()).toBe(Duplex.DuplexFlipLongEdge);
      expect(viewerPrefs.getPickTrayByPDFSize()).toBe(true);
      expect(viewerPrefs.getPrintPageRange()).toEqual(pageRanges);
      expect(viewerPrefs.getNumCopies()).toBe(2);

      // Test setting single page range
      const pageRange = { start: 2, end: 4 };
      viewerPrefs.setPrintPageRange(pageRange);
      expect(viewerPrefs.getPrintPageRange()).toEqual([pageRange]);
    });

    it('they can be retrieved from an existing document', async () => {
      const pdfDoc = await PDFDocument.load(withViewerPrefsPdfBytes);
      const viewerPrefs = pdfDoc.catalog.getViewerPreferences()!;

      expect(viewerPrefs).toBeInstanceOf(ViewerPreferences);
      expect(viewerPrefs.getPrintScaling()).toBe(PrintScaling.None);
      expect(viewerPrefs.getDuplex()).toBe(Duplex.DuplexFlipLongEdge);
      expect(viewerPrefs.getPickTrayByPDFSize()).toBe(true);
      expect(viewerPrefs.getPrintPageRange()).toEqual([
        { start: 1, end: 1 },
        { start: 3, end: 4 },
      ]);
      expect(viewerPrefs.getNumCopies()).toBe(2);

      expect(viewerPrefs.getFitWindow()).toBe(true);
      expect(viewerPrefs.getCenterWindow()).toBe(true);
      expect(viewerPrefs.getDisplayDocTitle()).toBe(true);
      expect(viewerPrefs.getHideMenubar()).toBe(true);
      expect(viewerPrefs.getHideToolbar()).toBe(true);

      /*
       * Other presets not tested, but defined in this PDF doc (Acrobat XI v11):
       * Binding: RightEdge
       * Language: EN-NZ
       *
       * NavigationTab: PageOnly
       * PageLayout: TwoUp (facing)
       * Magnification: 50%
       * OpenToPage: 2
       *
       * PageMode: FullScreen
       */
    });
  });

  describe('setTitle() method with options', () => {
    it('does not set the ViewerPreferences dict if the option is not set', async () => {
      const pdfDoc = await PDFDocument.create();

      pdfDoc.setTitle('Testing setTitle Title');

      expect(
        pdfDoc.catalog.lookupMaybe(PDFName.of('ViewerPreferences'), PDFDict),
      ).toBeUndefined();

      expect(pdfDoc.getTitle()).toBe('Testing setTitle Title');
    });

    it('creates the ViewerPreferences dict when the option is set', async () => {
      const pdfDoc = await PDFDocument.create();

      pdfDoc.setTitle('ViewerPrefs Test Creation', {
        showInWindowTitleBar: true,
      });

      expect(
        pdfDoc.catalog.lookupMaybe(PDFName.of('ViewerPreferences'), PDFDict),
      );
    });
  });

  describe('addJavaScript() method', () => {
    it('adds the script to the catalog', async () => {
      const pdfDoc = await PDFDocument.create();
      pdfDoc.addJavaScript(
        'main',
        'console.show(); console.println("Hello World");',
      );
      await pdfDoc.flush();

      expect(pdfDoc.catalog.has(PDFName.of('Names')));
      const Names = pdfDoc.catalog.lookup(PDFName.of('Names'), PDFDict);
      expect(Names.has(PDFName.of('JavaScript')));
      const Javascript = Names.lookup(PDFName.of('JavaScript'), PDFDict);
      expect(Javascript.has(PDFName.of('Names')));
      const JSNames = Javascript.lookup(PDFName.of('Names'), PDFArray);
      expect(JSNames.lookup(0, PDFHexString).decodeText()).toEqual('main');
    });

    it('does not overwrite scripts', async () => {
      const pdfDoc = await PDFDocument.create();
      pdfDoc.addJavaScript(
        'first',
        'console.show(); console.println("First");',
      );
      pdfDoc.addJavaScript(
        'second',
        'console.show(); console.println("Second");',
      );
      await pdfDoc.flush();

      const Names = pdfDoc.catalog.lookup(PDFName.of('Names'), PDFDict);
      const Javascript = Names.lookup(PDFName.of('JavaScript'), PDFDict);
      const JSNames = Javascript.lookup(PDFName.of('Names'), PDFArray);
      expect(JSNames.lookup(0, PDFHexString).decodeText()).toEqual('first');
      expect(JSNames.lookup(2, PDFHexString).decodeText()).toEqual('second');
    });

    it('sorts JavaScript name tree entries lexically', async () => {
      const pdfDoc = await PDFDocument.create();
      pdfDoc.addJavaScript('zebra', 'console.println("z");');
      pdfDoc.addJavaScript('alpha', 'console.println("a");');
      pdfDoc.addJavaScript('middle', 'console.println("m");');
      await pdfDoc.flush();

      const Names = pdfDoc.catalog.lookup(PDFName.of('Names'), PDFDict);
      const Javascript = Names.lookup(PDFName.of('JavaScript'), PDFDict);
      const JSNames = Javascript.lookup(PDFName.of('Names'), PDFArray);
      const names = [0, 2, 4].map((idx) =>
        JSNames.lookup(idx, PDFHexString).decodeText(),
      );

      expect(names).toEqual(['alpha', 'middle', 'zebra']);
    });

    it('does not add Names alongside an existing Kids JavaScript tree', async () => {
      const pdfDoc = await PDFDocument.create();
      const leafRef = pdfDoc.context.register(
        pdfDoc.context.obj({
          Names: [],
        }),
      );
      pdfDoc.catalog.set(
        PDFName.of('Names'),
        pdfDoc.context.obj({
          JavaScript: { Kids: [leafRef] },
        }),
      );

      pdfDoc.addJavaScript('newScript', 'console.println("x");');
      await pdfDoc.flush();

      const Javascript = pdfDoc.catalog
        .lookup(PDFName.of('Names'), PDFDict)
        .lookup(PDFName.of('JavaScript'), PDFDict);
      expect(Javascript.has(PDFName.of('Kids'))).toBe(true);
      expect(Javascript.has(PDFName.of('Names'))).toBe(false);
    });
  });

  describe('embedPng() method', () => {
    it('does not prevent the PDFDocument from being modified after embedding an image', async () => {
      const pdfDoc = await PDFDocument.create();
      const pdfPage = pdfDoc.addPage();

      const noErrorFunc = async () => {
        const embeddedImage = await pdfDoc.embedPng(examplePngImage);
        pdfPage.drawImage(embeddedImage);
        await embeddedImage.embed();

        const pdfPage2 = pdfDoc.addPage();
        pdfPage2.drawImage(embeddedImage);

        pdfDoc.setTitle('Unit Test');
      };

      await expect(noErrorFunc()).resolves.not.toThrowError();
    });
  });

  describe('save() method', () => {
    it('can be called multiple times on the same PDFDocument with different changes', async () => {
      const pdfDoc = await PDFDocument.create();
      const embeddedImage = await pdfDoc.embedPng(examplePngImage);

      const noErrorFunc = async () => {
        const page1 = pdfDoc.addPage();
        page1.drawImage(embeddedImage);

        const pdfBytes1 = await pdfDoc.save();
        expect(pdfBytes1.byteLength).toBeGreaterThan(0);

        const page2 = pdfDoc.addPage();
        page2.drawImage(embeddedImage);

        pdfDoc.setTitle('Unit Test');

        const pdfBytes2 = await pdfDoc.save();
        expect(pdfBytes2.byteLength).toBeGreaterThan(0);
        expect(pdfBytes2.byteLength).not.toEqual(pdfBytes1.byteLength);

        const pdfPage3 = pdfDoc.addPage();
        pdfPage3.drawImage(embeddedImage);

        pdfDoc.setTitle('Unit Test 2. change');

        const pdfBytes3 = await pdfDoc.save();
        expect(pdfBytes3.byteLength).toBeGreaterThan(0);
        expect(pdfBytes3.byteLength).not.toEqual(pdfBytes2.byteLength);
      };

      await expect(noErrorFunc()).resolves.not.toThrowError();
    });

    it('returns the full pdf, when pdf not open for incremental update', async () => {
      const pdfDoc = await PDFDocument.load(simplePdfBytes);
      const snapshot = pdfDoc.takeSnapshot();
      const page = pdfDoc.getPage(0);
      snapshot.markRefForSave(page.ref);
      const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const fontSize = 30;
      page.drawText('Incremental saving is also awesome!', {
        x: 50,
        y: 4 * fontSize,
        size: fontSize,
        font: timesRomanFont,
      });
      const firstFullPDF = await pdfDoc.save();
      expect(firstFullPDF.byteLength).toBeGreaterThan(
        simplePdfBytes.byteLength,
      );
      pdfDoc.takeSnapshot();
      const secondFullPDF = await pdfDoc.save();
      expect(secondFullPDF).toEqual(firstFullPDF);
    });

    it('returns the full pdf when open for incremental update', async () => {
      const pdfDoc = await PDFDocument.load(simplePdfBytes, {
        forIncrementalUpdate: true,
      });
      const snapshot = pdfDoc.takeSnapshot();
      const page = pdfDoc.getPage(0);
      snapshot.markRefForSave(page.ref);
      const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const fontSize = 30;
      page.drawText('Incremental saving is also awesome!', {
        x: 50,
        y: 4 * fontSize,
        size: fontSize,
        font: timesRomanFont,
      });
      const firstFullPDF = await pdfDoc.save();
      expect(firstFullPDF.byteLength).toBeGreaterThan(
        simplePdfBytes.byteLength,
      );
      for (let bi = 0; bi < simplePdfBytes.byteLength; bi++) {
        expect(firstFullPDF[bi]).toBe(simplePdfBytes[bi]);
      }
      pdfDoc.takeSnapshot();
      const secondFullPDF = await pdfDoc.save();
      expect(secondFullPDF).toEqual(firstFullPDF);
    });

    it('respects PDF version when saving incrementally', async () => {
      const getIncrementedLastChunk = async (pdfBytes: Buffer) => {
        const pdfDoc = await PDFDocument.load(pdfBytes, {
          forIncrementalUpdate: true,
        });
        const page = pdfDoc.getPage(0);
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        const fontSize = 30;
        page.drawText('Incremental saving is also awesome!', {
          x: 50,
          y: 4 * fontSize,
          size: fontSize,
          font: timesRomanFont,
        });
        const incrementedPDFBytes = await pdfDoc.save();
        const str = Buffer.from(incrementedPDFBytes).toString();
        return str.substring(str.length - 512);
      };
      // should not use xrefStreams, introduced on v 1.5
      expect(await getIncrementedLastChunk(v13PdfBytes)).toMatch(
        `xref\n0 1\n${''.padEnd(10, '0')} 65535 f \n`,
      );
      // should not use xrefStreams, introduced on v 1.5
      expect(await getIncrementedLastChunk(v14PdfBytes)).toMatch(
        `xref\n0 1\n${''.padEnd(10, '0')} 65535 f \n`,
      );
      // 1.7 should use xrefStreams, introduced on v 1.5
      expect(await getIncrementedLastChunk(simplePdfBytes)).not.toMatch(
        `xref\n0 1\n${''.padEnd(10, '0')} 65535 f \n`,
      );
    }, 15000);

    it('objectStreams usage can be forced', async () => {
      const pdfDoc = await PDFDocument.load(v13PdfBytes, {
        forIncrementalUpdate: true,
      });
      const page = pdfDoc.getPage(0);
      const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const fontSize = 30;
      page.drawText('Incremental saving is also awesome!', {
        x: 50,
        y: 4 * fontSize,
        size: fontSize,
        font: timesRomanFont,
      });
      const incrementedPDFBytes = await pdfDoc.save({ useObjectStreams: true });
      const str = Buffer.from(incrementedPDFBytes).toString();
      expect(str.substring(str.length - 512)).not.toMatch(
        `xref\n0 1\n${''.padEnd(10, '0')} 65535 f \n`,
      );
    }, 15000);

    it('properly handles XRef Streams on full save', async () => {
      const pdfDoc = await PDFDocument.load(v15PdfBytes);
      const savedBytes = await pdfDoc.save();
      const str = Buffer.from(savedBytes).toString();
      expect(str.match(/XRef/g)?.length).toBe(1);

      // Round-trip: the saved bytes must produce a loadable PDF
      const reloaded = await PDFDocument.load(savedBytes);
      expect(reloaded.getPageCount()).toBe(pdfDoc.getPageCount());

      const noStmIB = await pdfDoc.save({ useObjectStreams: false });
      const noStrmStr = Buffer.from(noStmIB).toString();
      expect(noStrmStr.match(/XRef/g)).toBeNull();

      // Round-trip without object streams
      const reloaded2 = await PDFDocument.load(noStmIB);
      expect(reloaded2.getPageCount()).toBe(pdfDoc.getPageCount());
    });
  });

  describe('saveIncremental() method', () => {
    it('can be used with different pages', async () => {
      const noErrorFunc = async (pageIndex: number) => {
        const pdfDoc = await PDFDocument.load(simplePdfBytes);
        const snapshot = pdfDoc.takeSnapshot();
        const page = pdfDoc.getPage(pageIndex);
        snapshot.markRefForSave(page.ref);
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        const fontSize = 30;
        page.drawText('Incremental saving is also awesome!', {
          x: 50,
          y: 4 * fontSize,
          size: fontSize,
          font: timesRomanFont,
        });

        const pdfIncrementalBytes = await pdfDoc.saveIncremental(snapshot);
        expect(pdfIncrementalBytes.byteLength).toBeGreaterThan(0);
      };

      await expect(noErrorFunc(0)).resolves.not.toThrowError();
      await expect(noErrorFunc(1)).resolves.not.toThrowError();
    });

    it('can be used with object-stream PDFs', async () => {
      const noErrorFunc = async () => {
        const pdfDoc = await PDFDocument.load(simpleStreamsPdfBytes);
        const snapshot = pdfDoc.takeSnapshot();
        const page = pdfDoc.getPage(0);
        snapshot.markRefForSave(page.ref);
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        const fontSize = 30;
        page.drawText('Incremental saving is also awesome!', {
          x: 50,
          y: 4 * fontSize,
          size: fontSize,
          font: timesRomanFont,
        });

        const pdfIncrementalBytes = await pdfDoc.saveIncremental(snapshot);
        expect(pdfIncrementalBytes.byteLength).toBeGreaterThan(0);
      };

      await expect(noErrorFunc()).resolves.not.toThrowError();
    });

    it('saves deleted objects', async () => {
      const noErrorFunc = async (pageIndex: number) => {
        const pdfDoc = await PDFDocument.load(simplePdfBytes);
        const snapshot = pdfDoc.takeSnapshot();
        const page = pdfDoc.getPage(pageIndex);
        snapshot.markDeletedRef(page.ref);
        const pdfIncrementalBytes = await pdfDoc.saveIncremental(snapshot, {
          useObjectStreams: false,
        });
        expect(pdfIncrementalBytes.byteLength).toBeGreaterThan(0);
        expect(Buffer.from(pdfIncrementalBytes).toString()).toMatch(
          `xref\n0 1\n${page.ref.objectNumber.toString().padStart(10, '0')} 65535 f \n${page.ref.objectNumber.toString()} 1\n0000000000 00001 f`,
        );
      };

      await expect(noErrorFunc(0)).resolves.not.toThrowError();
      await expect(noErrorFunc(1)).resolves.not.toThrowError();
    });

    it('respects PDF version for XREF generation', async () => {
      const getIncrementedLastChunk = async (pdfBytes: Buffer) => {
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const snapshot = pdfDoc.takeSnapshot();
        const page = pdfDoc.getPage(0);
        snapshot.markRefForSave(page.ref);
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        const fontSize = 30;
        page.drawText('Incremental saving is also awesome!', {
          x: 50,
          y: 4 * fontSize,
          size: fontSize,
          font: timesRomanFont,
        });
        const pdfIncrementalBytes = await pdfDoc.saveIncremental(snapshot);
        const str = Buffer.from(pdfIncrementalBytes).toString();
        return str.substring(str.length - 512);
      };
      // should not use xrefStreams, introduced on v 1.5
      expect(await getIncrementedLastChunk(v13PdfBytes)).toMatch(
        `xref\n0 1\n${''.padEnd(10, '0')} 65535 f \n`,
      );
      // should not use xrefStreams, introduced on v 1.5
      expect(await getIncrementedLastChunk(v14PdfBytes)).toMatch(
        `xref\n0 1\n${''.padEnd(10, '0')} 65535 f \n`,
      );
      // 1.7 should use xrefStreams, introduced on v 1.5
      expect(await getIncrementedLastChunk(simplePdfBytes)).not.toMatch(
        `xref\n0 1\n${''.padEnd(10, '0')} 65535 f \n`,
      );
    }, 15000);

    it('objectStreams usage can be forced', async () => {
      const pdfDoc = await PDFDocument.load(v13PdfBytes);
      const snapshot = pdfDoc.takeSnapshot();
      const page = pdfDoc.getPage(0);
      snapshot.markRefForSave(page.ref);
      const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const fontSize = 30;
      page.drawText('Incremental saving is also awesome!', {
        x: 50,
        y: 4 * fontSize,
        size: fontSize,
        font: timesRomanFont,
      });
      const pdfIncrementalBytes = await pdfDoc.saveIncremental(snapshot, {
        useObjectStreams: true,
      });
      const str = Buffer.from(pdfIncrementalBytes).toString();
      expect(str.substring(str.length - 512)).not.toMatch(
        `xref\n0 1\n${''.padEnd(10, '0')} 65535 f \n`,
      );
    }, 15000);
  });

  describe('commit() method', () => {
    it('allows multiple incremental updates without reloading', async () => {
      const pdfDoc = await PDFDocument.load(simplePdfBytes, {
        forIncrementalUpdate: true,
      });

      const page = pdfDoc.getPage(0);
      const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

      page.drawText('First update', {
        x: 50,
        y: 200,
        size: 30,
        font: timesRomanFont,
      });
      const firstCommit = await pdfDoc.commit();
      expect(firstCommit.byteLength).toBeGreaterThan(simplePdfBytes.byteLength);
      expect(
        Array.from(firstCommit.slice(0, simplePdfBytes.byteLength)),
      ).toEqual(Array.from(simplePdfBytes));

      page.drawText('Second update', {
        x: 50,
        y: 160,
        size: 30,
        font: timesRomanFont,
      });
      const secondCommit = await pdfDoc.commit();
      expect(secondCommit.byteLength).toBeGreaterThan(firstCommit.byteLength);
      expect(Array.from(secondCommit.slice(0, firstCommit.byteLength))).toEqual(
        Array.from(firstCommit),
      );

      page.drawText('Third update', {
        x: 50,
        y: 120,
        size: 30,
        font: timesRomanFont,
      });
      const thirdCommit = await pdfDoc.commit();
      expect(thirdCommit.byteLength).toBeGreaterThan(secondCommit.byteLength);
      expect(Array.from(thirdCommit.slice(0, secondCommit.byteLength))).toEqual(
        Array.from(secondCommit),
      );

      const finalDoc = await PDFDocument.load(thirdCommit);
      expect(finalDoc.getPageCount()).toBe(pdfDoc.getPageCount());
    });

    it('throws error if document was not loaded with forIncrementalUpdate', async () => {
      const pdfDoc = await PDFDocument.load(simplePdfBytes);
      await expect(pdfDoc.commit()).rejects.toThrow(
        'commit() requires the document to be loaded with forIncrementalUpdate: true',
      );
    });

    it('works with newly created documents after first save', async () => {
      const pdfDoc = await PDFDocument.create();
      pdfDoc.addPage();
      const firstSave = await pdfDoc.save();

      const loadedDoc = await PDFDocument.load(firstSave, {
        forIncrementalUpdate: true,
      });
      loadedDoc.getPage(0).drawText('Update after creation');
      const committed = await loadedDoc.commit();

      expect(committed.byteLength).toBeGreaterThan(firstSave.byteLength);
    });

    it('replaces existing context snapshot after commit', async () => {
      const pdfDoc = await PDFDocument.load(simplePdfBytes, {
        forIncrementalUpdate: true,
      });

      const initialSnapshot = pdfDoc.takeSnapshot();
      pdfDoc.context.snapshot = initialSnapshot;

      const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      pdfDoc.getPage(0).drawText('Test using existing snapshot', {
        x: 50,
        y: 200,
        size: 20,
        font: timesRomanFont,
      });

      const originalTakeSnapshot = pdfDoc.takeSnapshot.bind(pdfDoc);
      let takeSnapshotCalled = false;
      pdfDoc.takeSnapshot = function () {
        takeSnapshotCalled = true;
        return originalTakeSnapshot();
      };

      const committed = await pdfDoc.commit();

      expect(takeSnapshotCalled).toBe(true);
      expect(committed.byteLength).toBeGreaterThan(simplePdfBytes.byteLength);
      expect(pdfDoc.context.snapshot).toBeDefined();
      expect(pdfDoc.context.snapshot).not.toBe(initialSnapshot);
    });

    it('does not create duplicate font objects on multiple commits', async () => {
      const pdfDoc = await PDFDocument.load(simplePdfBytes, {
        forIncrementalUpdate: true,
      });

      const page = pdfDoc.getPage(0);
      const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

      page.drawText('First commit', {
        x: 50,
        y: 200,
        size: 20,
        font: timesRomanFont,
      });
      const firstCommit = await pdfDoc.commit();
      const objectCountAfterFirst = pdfDoc.context.largestObjectNumber;

      page.drawText('Second commit', {
        x: 50,
        y: 160,
        size: 20,
        font: timesRomanFont,
      });
      const secondCommit = await pdfDoc.commit();
      const objectCountAfterSecond = pdfDoc.context.largestObjectNumber;

      const newObjectCount = objectCountAfterSecond - objectCountAfterFirst;
      expect(newObjectCount).toBeLessThan(4);
      expect(secondCommit.byteLength).toBeGreaterThan(firstCommit.byteLength);
    });

    it('does not create duplicate image objects on multiple commits', async () => {
      const pdfDoc = await PDFDocument.load(simplePdfBytes, {
        forIncrementalUpdate: true,
      });

      const originalPageCount = pdfDoc.getPageCount();
      const page = pdfDoc.getPage(0);
      const pngImage = await pdfDoc.embedPng(examplePngImage);

      page.drawImage(pngImage, { x: 50, y: 400, width: 50, height: 50 });
      const firstCommit = await pdfDoc.commit();
      const objectCountAfterFirst = pdfDoc.context.largestObjectNumber;

      page.drawImage(pngImage, { x: 150, y: 400, width: 50, height: 50 });
      const secondCommit = await pdfDoc.commit();
      const objectCountAfterSecond = pdfDoc.context.largestObjectNumber;

      const newObjectCount = objectCountAfterSecond - objectCountAfterFirst;
      expect(newObjectCount).toBeLessThan(3);
      expect(secondCommit.byteLength).toBeGreaterThan(firstCommit.byteLength);

      const finalDoc = await PDFDocument.load(secondCommit);
      expect(finalDoc.getPageCount()).toBe(originalPageCount);
    });

    it('handles adding pages between commits', async () => {
      const pdfDoc = await PDFDocument.load(simplePdfBytes, {
        forIncrementalUpdate: true,
      });
      const initialPageCount = pdfDoc.getPageCount();

      pdfDoc.getPage(0).drawText('Before adding page');
      const firstCommit = await pdfDoc.commit();

      const newPage = pdfDoc.addPage();
      newPage.drawText('New page content', { x: 50, y: 700 });
      const secondCommit = await pdfDoc.commit();

      expect(secondCommit.byteLength).toBeGreaterThan(firstCommit.byteLength);

      const finalDoc = await PDFDocument.load(secondCommit);
      expect(finalDoc.getPageCount()).toBe(initialPageCount + 1);
    });

    it('handles removing pages between commits', async () => {
      const createDoc = await PDFDocument.create();
      createDoc.addPage();
      createDoc.addPage();
      createDoc.addPage();
      const multiPagePdfBytes = await createDoc.save();

      const pdfDoc = await PDFDocument.load(multiPagePdfBytes, {
        forIncrementalUpdate: true,
      });
      expect(pdfDoc.getPageCount()).toBe(3);

      pdfDoc.getPage(0).drawText('First page');
      await pdfDoc.commit();

      pdfDoc.removePage(2);
      const secondCommit = await pdfDoc.commit();

      const finalDoc = await PDFDocument.load(secondCommit);
      expect(finalDoc.getPageCount()).toBe(2);
    });

    it('works correctly with PDFs using object streams', async () => {
      const pdfDoc = await PDFDocument.load(simpleStreamsPdfBytes, {
        forIncrementalUpdate: true,
      });

      pdfDoc.getPage(0).drawText('Object streams test', { x: 50, y: 200 });
      const firstCommit = await pdfDoc.commit();

      expect(firstCommit.byteLength).toBeGreaterThan(
        simpleStreamsPdfBytes.byteLength,
      );
      expect(
        Array.from(firstCommit.slice(0, simpleStreamsPdfBytes.byteLength)),
      ).toEqual(Array.from(simpleStreamsPdfBytes));

      pdfDoc
        .getPage(0)
        .drawText('Second object streams update', { x: 50, y: 160 });
      const secondCommit = await pdfDoc.commit();

      expect(secondCommit.byteLength).toBeGreaterThan(firstCommit.byteLength);

      const finalDoc = await PDFDocument.load(secondCommit);
      expect(finalDoc.getPageCount()).toBe(pdfDoc.getPageCount());
    });

    it('produces valid XREF chain after multiple commits', async () => {
      const pdfDoc = await PDFDocument.load(simplePdfBytes, {
        forIncrementalUpdate: true,
      });
      const page = pdfDoc.getPage(0);

      page.drawText('Commit 1', { x: 50, y: 700 });
      const commit1 = await pdfDoc.commit();

      page.drawText('Commit 2', { x: 50, y: 650 });
      const commit2 = await pdfDoc.commit();

      page.drawText('Commit 3', { x: 50, y: 600 });
      const commit3 = await pdfDoc.commit();

      page.drawText('Commit 4', { x: 50, y: 550 });
      const commit4 = await pdfDoc.commit();

      expect(commit2.byteLength).toBeGreaterThan(commit1.byteLength);
      expect(commit3.byteLength).toBeGreaterThan(commit2.byteLength);
      expect(commit4.byteLength).toBeGreaterThan(commit3.byteLength);

      const finalDoc = await PDFDocument.load(commit4);
      expect(finalDoc.getPageCount()).toBe(pdfDoc.getPageCount());

      const doc1 = await PDFDocument.load(commit1);
      const doc2 = await PDFDocument.load(commit2);
      const doc3 = await PDFDocument.load(commit3);
      expect(doc1.getPageCount()).toBe(pdfDoc.getPageCount());
      expect(doc2.getPageCount()).toBe(pdfDoc.getPageCount());
      expect(doc3.getPageCount()).toBe(pdfDoc.getPageCount());
    });

    it('tracks metadata changes between commits', async () => {
      const pdfDoc = await PDFDocument.load(simplePdfBytes, {
        forIncrementalUpdate: true,
      });

      pdfDoc.setTitle('First Title');
      pdfDoc.setAuthor('First Author');
      const firstCommit = await pdfDoc.commit();

      pdfDoc.setTitle('Second Title');
      pdfDoc.setAuthor('Second Author');
      const secondCommit = await pdfDoc.commit();

      const finalDoc = await PDFDocument.load(secondCommit);
      expect(finalDoc.getTitle()).toBe('Second Title');
      expect(finalDoc.getAuthor()).toBe('Second Author');

      const intermediateDoc = await PDFDocument.load(firstCommit);
      expect(intermediateDoc.getTitle()).toBe('First Title');
      expect(intermediateDoc.getAuthor()).toBe('First Author');
    });

    it('does not duplicate custom fonts on multiple commits', async () => {
      const customFontBytes = fs.readFileSync(
        'assets/fonts/ubuntu/Ubuntu-R.ttf',
      );
      const pdfDoc = await PDFDocument.load(simplePdfBytes, {
        forIncrementalUpdate: true,
      });

      pdfDoc.registerFontkit(fontkit);
      const customFont = await pdfDoc.embedFont(customFontBytes);
      const page = pdfDoc.getPage(0);

      page.drawText('Custom font first', {
        x: 50,
        y: 200,
        size: 20,
        font: customFont,
      });
      const firstCommit = await pdfDoc.commit();
      const objectCountAfterFirst = pdfDoc.context.largestObjectNumber;

      page.drawText('Custom font second', {
        x: 50,
        y: 160,
        size: 20,
        font: customFont,
      });
      const secondCommit = await pdfDoc.commit();
      const objectCountAfterSecond = pdfDoc.context.largestObjectNumber;

      const newObjectCount = objectCountAfterSecond - objectCountAfterFirst;
      expect(newObjectCount).toBeLessThan(4);
      expect(secondCommit.byteLength).toBeGreaterThan(firstCommit.byteLength);

      const finalDoc = await PDFDocument.load(secondCommit);
      expect(finalDoc.getPageCount()).toBe(pdfDoc.getPageCount());
    });

    it('handles commit with no changes gracefully', async () => {
      const pdfDoc = await PDFDocument.load(simplePdfBytes, {
        forIncrementalUpdate: true,
      });

      pdfDoc.getPage(0).drawText('Initial change');
      const firstCommit = await pdfDoc.commit();
      const secondCommit = await pdfDoc.commit();

      const doc1 = await PDFDocument.load(firstCommit);
      const doc2 = await PDFDocument.load(secondCommit);
      expect(doc1.getPageCount()).toBe(pdfDoc.getPageCount());
      expect(doc2.getPageCount()).toBe(pdfDoc.getPageCount());
      expect(secondCommit.byteLength).toBeGreaterThanOrEqual(
        firstCommit.byteLength,
      );
    });

    it('save() still works correctly after commit()', async () => {
      const pdfDoc = await PDFDocument.load(simplePdfBytes, {
        forIncrementalUpdate: true,
      });

      pdfDoc.getPage(0).drawText('Before commit');
      await pdfDoc.commit();

      pdfDoc.getPage(0).drawText('After commit', { y: 100 });
      const regularSave = await pdfDoc.save();
      const rewriteSave = await pdfDoc.save({ rewrite: true });

      const doc1 = await PDFDocument.load(regularSave);
      const doc2 = await PDFDocument.load(rewriteSave);
      expect(doc1.getPageCount()).toBe(pdfDoc.getPageCount());
      expect(doc2.getPageCount()).toBe(pdfDoc.getPageCount());
    });

    it('commit() after save() works correctly', async () => {
      const pdfDoc = await PDFDocument.load(simplePdfBytes, {
        forIncrementalUpdate: true,
      });

      pdfDoc.getPage(0).drawText('Before save');
      const savedBytes = await pdfDoc.save();

      pdfDoc.getPage(0).drawText('After save, before commit', { y: 100 });
      const committed = await pdfDoc.commit();

      const doc1 = await PDFDocument.load(savedBytes);
      const doc2 = await PDFDocument.load(committed);
      expect(doc1.getPageCount()).toBe(pdfDoc.getPageCount());
      expect(doc2.getPageCount()).toBe(pdfDoc.getPageCount());
      expect(committed.byteLength).toBeGreaterThan(0);
    });

    it('handles multiple fonts embedded before first commit', async () => {
      const pdfDoc = await PDFDocument.load(simplePdfBytes, {
        forIncrementalUpdate: true,
      });

      const page = pdfDoc.getPage(0);
      const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const courier = await pdfDoc.embedFont(StandardFonts.Courier);

      page.drawText('Times Roman', { x: 50, y: 700, font: timesRoman });
      page.drawText('Helvetica', { x: 50, y: 650, font: helvetica });
      page.drawText('Courier', { x: 50, y: 600, font: courier });
      await pdfDoc.commit();
      const objectCountAfterFirst = pdfDoc.context.largestObjectNumber;

      page.drawText('Times Roman 2', { x: 50, y: 500, font: timesRoman });
      page.drawText('Helvetica 2', { x: 50, y: 450, font: helvetica });
      page.drawText('Courier 2', { x: 50, y: 400, font: courier });
      await pdfDoc.commit();
      const objectCountAfterSecond = pdfDoc.context.largestObjectNumber;

      const newObjectCount = objectCountAfterSecond - objectCountAfterFirst;
      expect(newObjectCount).toBeLessThan(5);

      const finalBytes = await pdfDoc.save();
      const finalDoc = await PDFDocument.load(finalBytes);
      expect(finalDoc.getPageCount()).toBe(pdfDoc.getPageCount());
    });

    it('handles drawing on different pages between commits', async () => {
      const createDoc = await PDFDocument.create();
      createDoc.addPage();
      createDoc.addPage();
      createDoc.addPage();
      const multiPageBytes = await createDoc.save();

      const pdfDoc = await PDFDocument.load(multiPageBytes, {
        forIncrementalUpdate: true,
      });

      pdfDoc.getPage(0).drawText('Page 1 - Commit 1', { x: 50, y: 700 });
      const commit1 = await pdfDoc.commit();

      pdfDoc.getPage(1).drawText('Page 2 - Commit 2', { x: 50, y: 700 });
      const commit2 = await pdfDoc.commit();

      pdfDoc.getPage(2).drawText('Page 3 - Commit 3', { x: 50, y: 700 });
      const commit3 = await pdfDoc.commit();

      expect(commit2.byteLength).toBeGreaterThan(commit1.byteLength);
      expect(commit3.byteLength).toBeGreaterThan(commit2.byteLength);

      const finalDoc = await PDFDocument.load(commit3);
      expect(finalDoc.getPageCount()).toBe(3);
    });

    it('preserves signature field widgets after incremental updates', async () => {
      const signaturePdfBytes = fs.readFileSync(
        'assets/pdfs/with_signature.pdf',
      );
      const pdfDoc = await PDFDocument.load(signaturePdfBytes, {
        forIncrementalUpdate: true,
      });

      const originalLength = signaturePdfBytes.byteLength;

      pdfDoc.getPage(0).drawText('Incremental update preserving signature', {
        x: 50,
        y: 50,
      });
      const committed = await pdfDoc.commit();

      expect(committed.byteLength).toBeGreaterThan(originalLength);
      expect(Array.from(committed.slice(0, originalLength))).toEqual(
        Array.from(signaturePdfBytes),
      );

      const reloadedDoc = await PDFDocument.load(committed);
      expect(reloadedDoc.getPageCount()).toBe(pdfDoc.getPageCount());
    });

    it('preserves bytes exactly for signature validity', async () => {
      const pdfDoc = await PDFDocument.load(simplePdfBytes, {
        forIncrementalUpdate: true,
      });

      pdfDoc.getPage(0).drawText('Update 1', { x: 50, y: 700 });
      const commit1 = await pdfDoc.commit();

      for (let i = 0; i < simplePdfBytes.byteLength; i++) {
        expect(commit1[i]).toBe(simplePdfBytes[i]);
      }

      pdfDoc.getPage(0).drawText('Update 2', { x: 50, y: 650 });
      const commit2 = await pdfDoc.commit();

      for (let i = 0; i < commit1.byteLength; i++) {
        expect(commit2[i]).toBe(commit1[i]);
      }

      expect(commit2.byteLength).toBeGreaterThan(commit1.byteLength);
    });

    it('tracks PDFArray modifications for incremental saves', async () => {
      const pdfDoc = await PDFDocument.load(simplePdfBytes, {
        forIncrementalUpdate: true,
      });

      const page = pdfDoc.getPage(0);
      const pageDict = page.node;
      const context = pdfDoc.context;

      const annotDict = context.obj({
        Type: 'Annot',
        Subtype: 'Text',
        Rect: [100, 100, 200, 200],
        Contents: 'Test annotation',
      });
      const annotRef = context.register(annotDict);

      const annotsArray = context.obj([annotRef]);
      const annotsRef = context.register(annotsArray);
      pageDict.set(PDFName.of('Annots'), annotsRef);

      const committed = await pdfDoc.commit();

      const reloaded = await PDFDocument.load(committed);
      const reloadedPage = reloaded.getPage(0);
      const reloadedAnnots = reloadedPage.node.lookup(
        PDFName.of('Annots'),
        PDFArray,
      );
      expect(reloadedAnnots).toBeDefined();
      expect(reloadedAnnots!.size()).toBe(1);
    });

    it('tracks PDFArray.push() for existing arrays', async () => {
      const createDoc = await PDFDocument.create();
      const createPage = createDoc.addPage();
      const createContext = createDoc.context;

      const initialAnnot = createContext.obj({
        Type: 'Annot',
        Subtype: 'Text',
        Rect: [10, 10, 50, 50],
        Contents: 'Initial',
      });
      const initialRef = createContext.register(initialAnnot);
      const annotsArray = createContext.obj([initialRef]);
      const annotsRef = createContext.register(annotsArray);
      createPage.node.set(PDFName.of('Annots'), annotsRef);

      const initialBytes = await createDoc.save();

      const pdfDoc = await PDFDocument.load(initialBytes, {
        forIncrementalUpdate: true,
      });

      const page = pdfDoc.getPage(0);
      const pageDict = page.node;
      const context = pdfDoc.context;

      const existingAnnots = pageDict.lookup(PDFName.of('Annots'), PDFArray);
      expect(existingAnnots).toBeDefined();
      expect(existingAnnots!.size()).toBe(1);

      const newAnnot = context.obj({
        Type: 'Annot',
        Subtype: 'Text',
        Rect: [100, 100, 150, 150],
        Contents: 'New annotation',
      });
      const newRef = context.register(newAnnot);
      existingAnnots!.push(newRef);

      const committed = await pdfDoc.commit();

      const reloaded = await PDFDocument.load(committed);
      const reloadedAnnots = reloaded
        .getPage(0)
        .node.lookup(PDFName.of('Annots'), PDFArray);
      expect(reloadedAnnots).toBeDefined();
      expect(reloadedAnnots!.size()).toBe(2);
    });

    it('tracks PDFStream content updates for incremental saves', async () => {
      const pdfDoc = await PDFDocument.load(simplePdfBytes, {
        forIncrementalUpdate: true,
      });

      const page = pdfDoc.getPage(0);
      page.drawText('Modified stream content', { x: 50, y: 300 });

      const committed = await pdfDoc.commit();

      expect(committed.byteLength).toBeGreaterThan(simplePdfBytes.byteLength);

      const reloaded = await PDFDocument.load(committed);
      expect(reloaded.getPageCount()).toBe(pdfDoc.getPageCount());
    });

    it('throws error for encrypted PDFs with forIncrementalUpdate', async () => {
      await expect(
        PDFDocument.load(oldEncryptedPdfBytes1, {
          forIncrementalUpdate: true,
        }),
      ).rejects.toThrow();
    });

    it('tracks inline array modifications for incremental saves', async () => {
      // Create a simple PDF
      const createDoc = await PDFDocument.create();
      createDoc.addPage([200, 200]);
      const initialBytes = await createDoc.save();

      // Load for incremental update
      const pdfDoc = await PDFDocument.load(initialBytes, {
        forIncrementalUpdate: true,
      });
      const page = pdfDoc.getPage(0);

      // Get the MediaBox (inline array, not registered as indirect object)
      const mediaBox = page.node.lookup(PDFName.MediaBox, PDFArray);
      expect(mediaBox).toBeDefined();

      // Verify it's NOT registered (inline)
      const ref = pdfDoc.context.getRef(mediaBox!);
      expect(ref).toBeUndefined();

      // Modify it directly
      mediaBox!.set(2, PDFNumber.of(300)); // Change width
      mediaBox!.set(3, PDFNumber.of(400)); // Change height

      // Commit
      const committed = await pdfDoc.commit();

      // Reload and verify changes were saved
      const reloaded = await PDFDocument.load(committed);
      const reloadedMediaBox = reloaded
        .getPage(0)
        .node.lookup(PDFName.MediaBox, PDFArray);
      expect(reloadedMediaBox!.lookup(2, PDFNumber).asNumber()).toBe(300);
      expect(reloadedMediaBox!.lookup(3, PDFNumber).asNumber()).toBe(400);
    });
  });

  describe('copy() method', () => {
    let pdfDoc: PDFDocument;
    let srcDoc: PDFDocument;
    beforeAll(async () => {
      const parseSpeed = ParseSpeeds.Fastest;
      srcDoc = await PDFDocument.load(unencryptedPdfBytes, { parseSpeed });
      const title = '🥚 The Life of an Egg 🍳';
      const author = 'Humpty Dumpty';
      const subject = '📘 An Epic Tale of Woe 📖';
      const keywords = ['eggs', 'wall', 'fall', 'king', 'horses', 'men', '🥚'];
      const producer = 'PDF App 9000 🤖';
      const creator = 'PDF App 8000 🤖';

      // Milliseconds  will not get saved, so these dates do not have milliseconds.
      const creationDate = new Date('1997-08-15T01:58:37Z');
      const modificationDate = new Date('2018-12-21T07:00:11Z');

      srcDoc.setTitle(title);
      srcDoc.setAuthor(author);
      srcDoc.setSubject(subject);
      srcDoc.setKeywords(keywords);
      srcDoc.setProducer(producer);
      srcDoc.setCreator(creator);
      srcDoc.setCreationDate(creationDate);
      srcDoc.setModificationDate(modificationDate);
      pdfDoc = await srcDoc.copy();
    });

    it('Returns a pdf with the same number of pages', async () => {
      expect(pdfDoc.getPageCount()).toBe(srcDoc.getPageCount());
    });

    it('Can copy author, creationDate, creator, producer, subject, title, defaultWordBreaks', async () => {
      expect(pdfDoc.getAuthor()).toBe(srcDoc.getAuthor());
      expect(pdfDoc.getCreationDate()).toStrictEqual(srcDoc.getCreationDate());
      expect(pdfDoc.getCreator()).toBe(srcDoc.getCreator());
      expect(pdfDoc.getModificationDate()).toStrictEqual(
        srcDoc.getModificationDate(),
      );
      expect(pdfDoc.getProducer()).toBe(srcDoc.getProducer());
      expect(pdfDoc.getSubject()).toBe(srcDoc.getSubject());
      expect(pdfDoc.getTitle()).toBe(srcDoc.getTitle());
      expect(pdfDoc.defaultWordBreaks).toEqual(srcDoc.defaultWordBreaks);
    });
  });
  describe('load({forIncrementalUpdate}) cycle', () => {
    it('can be used with different pages', async () => {
      const noErrorFunc = async (pageIndex: number) => {
        const pdfDoc = await PDFDocument.load(simplePdfBytes, {
          forIncrementalUpdate: true,
        });
        const page = pdfDoc.getPage(pageIndex);
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        const fontSize = 30;
        page.drawText('Incremental saving is also awesome!', {
          x: 50,
          y: 4 * fontSize,
          size: fontSize,
          font: timesRomanFont,
        });

        const pdfIncrementalBytes = await pdfDoc.save();
        const rewritedBytes = await pdfDoc.save({ rewrite: true });
        expect(pdfIncrementalBytes.byteLength).toBeGreaterThan(
          simplePdfBytes.byteLength,
        );
        expect(rewritedBytes.byteLength).toBeGreaterThan(0);
        expect(rewritedBytes.byteLength).toBeLessThan(
          pdfIncrementalBytes.byteLength,
        );
      };

      await expect(noErrorFunc(0)).resolves.not.toThrowError();
      await expect(noErrorFunc(1)).resolves.not.toThrowError();
    });

    it('can be used with object-stream PDFs', async () => {
      const noErrorFunc = async () => {
        const pdfDoc = await PDFDocument.load(simpleStreamsPdfBytes, {
          forIncrementalUpdate: true,
        });
        const page = pdfDoc.getPage(0);
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        const fontSize = 30;
        page.drawText('Incremental saving is also awesome!', {
          x: 50,
          y: 4 * fontSize,
          size: fontSize,
          font: timesRomanFont,
        });

        const pdfIncrementalBytes = await pdfDoc.save();
        const pdfRewriteBytes = await pdfDoc.save({ rewrite: true });
        expect(pdfIncrementalBytes.byteLength).toBeGreaterThan(
          simpleStreamsPdfBytes.byteLength,
        );
        expect(pdfRewriteBytes.byteLength).toBeGreaterThan(
          simpleStreamsPdfBytes.byteLength,
        );
      };

      await expect(noErrorFunc()).resolves.not.toThrowError();
    });

    it('registers deleted objects', async () => {
      const pdfDoc = await PDFDocument.load(simplePdfBytes, {
        forIncrementalUpdate: true,
      });
      let page = pdfDoc.getPage(0);
      const delONum = page.ref.objectNumber;
      const delOGen = (page.ref.generationNumber + 1).toString();
      pdfDoc.context.delete(page.ref);
      page = pdfDoc.getPage(1);
      const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const fontSize = 30;
      page.drawText('Incremental saving is also awesome!', {
        x: 50,
        y: 4 * fontSize,
        size: fontSize,
        font: timesRomanFont,
      });

      const pdfIncrementalBytes = await pdfDoc.save({
        useObjectStreams: false,
      });
      const pdfRewriteBytes = await pdfDoc.save({
        rewrite: true,
        useObjectStreams: false,
      });
      expect(pdfIncrementalBytes.byteLength).toBeGreaterThan(
        simpleStreamsPdfBytes.byteLength,
      );
      expect(pdfRewriteBytes.byteLength).toBeGreaterThan(
        simpleStreamsPdfBytes.byteLength,
      );
      // first element in table must point to deleted page, deleted page must have next gen number
      const rex = new RegExp(
        `xref[\n|\r\n]0 .*[\n|\r\n]${delONum.toString().padStart(10, '0')} 65535 f[\\s\\S]*0000000000 ${delOGen.padStart(5, '0')} f`,
      );
      expect(Buffer.from(pdfIncrementalBytes).toString()).toMatch(rex);
    });

    it('produces same output than manual incremental update', async () => {
      const noErrorFunc = async (pageIndex: number) => {
        const pdfDoc = await PDFDocument.load(simplePdfBytes, {
          forIncrementalUpdate: true,
        });
        const snapshot = pdfDoc.takeSnapshot();
        const page = pdfDoc.getPage(pageIndex);
        snapshot.markObjForSave(pdfDoc.catalog);
        snapshot.markRefForSave(page.ref);
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        const fontSize = 30;
        page.drawText('Incremental saving is also awesome!', {
          x: 50,
          y: 4 * fontSize,
          size: fontSize,
          font: timesRomanFont,
        });

        const pdfIncrementalBytes = await pdfDoc.saveIncremental(snapshot, {
          useObjectStreams: false,
        });
        const finalPdfBytes = Buffer.concat([
          Uint8Array.from(simplePdfBytes),
          Uint8Array.from(pdfIncrementalBytes),
        ]);
        const pdfSaveBytes = Buffer.from(
          await pdfDoc.save({ useObjectStreams: false }),
        );
        expect(pdfIncrementalBytes.byteLength).toBeGreaterThan(0);
        expect(finalPdfBytes.byteLength).toBe(pdfSaveBytes.byteLength);
        expect(finalPdfBytes).toEqual(pdfSaveBytes);
      };

      await expect(noErrorFunc(0)).resolves.not.toThrowError();
      await expect(noErrorFunc(1)).resolves.not.toThrowError();
    });
  });

  describe('attach() method', () => {
    it('sorts attachment names lexically', async () => {
      const pdfDoc = await PDFDocument.create();

      await pdfDoc.attach(new Uint8Array(), '1.jpg');
      await pdfDoc.attach(new Uint8Array(), '2.jpg');
      await pdfDoc.attach(new Uint8Array(), '10.jpg');
      await pdfDoc.save();

      const Names = pdfDoc.catalog.lookup(PDFName.of('Names'), PDFDict);
      const EmbeddedFiles = Names.lookup(PDFName.of('EmbeddedFiles'), PDFDict);
      const EFNames = EmbeddedFiles.lookup(PDFName.of('Names'), PDFArray);
      const names = [0, 2, 4].map((idx) =>
        EFNames.lookup(idx, PDFHexString).decodeText(),
      );

      expect(names).toEqual(['1.jpg', '10.jpg', '2.jpg']);
    });

    it('does not add Names alongside an existing Kids EmbeddedFiles tree', async () => {
      const pdfDoc = await PDFDocument.create();
      const leafRef = pdfDoc.context.register(
        pdfDoc.context.obj({
          Names: [],
        }),
      );
      pdfDoc.catalog.set(
        PDFName.of('Names'),
        pdfDoc.context.obj({
          EmbeddedFiles: { Kids: [leafRef] },
        }),
      );

      await pdfDoc.attach(new Uint8Array([1, 2, 3]), 'new.txt');
      await pdfDoc.save();

      const EmbeddedFiles = pdfDoc.catalog
        .lookup(PDFName.of('Names'), PDFDict)
        .lookup(PDFName.of('EmbeddedFiles'), PDFDict);
      expect(EmbeddedFiles.has(PDFName.of('Kids'))).toBe(true);
      expect(EmbeddedFiles.has(PDFName.of('Names'))).toBe(false);

      // File stream is still embedded and listed under AF.
      const AF = pdfDoc.catalog.lookup(PDFName.of('AF'), PDFArray);
      expect(AF.size()).toBe(1);
    });

    it('Saves to the same value after attaching a file', async () => {
      const pdfDoc1 = await PDFDocument.create({ updateMetadata: false });
      const pdfDoc2 = await PDFDocument.create({ updateMetadata: false });

      const jpgAttachmentBytes = fs.readFileSync(
        'assets/images/cat_riding_unicorn.jpg',
      );
      const pdfAttachmentBytes = fs.readFileSync(
        'assets/pdfs/us_constitution.pdf',
      );

      await pdfDoc1.attach(jpgAttachmentBytes, 'cat_riding_unicorn.jpg', {
        mimeType: 'image/jpeg',
        description: 'Cool cat riding a unicorn! 🦄🐈🕶️',
        creationDate: new Date('2019/12/01'),
        modificationDate: new Date('2020/04/19'),
      });

      await pdfDoc1.attach(pdfAttachmentBytes, 'us_constitution.pdf', {
        mimeType: 'application/pdf',
        description: 'Constitution of the United States 🇺🇸🦅',
        creationDate: new Date('1787/09/17'),
        modificationDate: new Date('1992/05/07'),
      });

      await pdfDoc2.attach(jpgAttachmentBytes, 'cat_riding_unicorn.jpg', {
        mimeType: 'image/jpeg',
        description: 'Cool cat riding a unicorn! 🦄🐈🕶️',
        creationDate: new Date('2019/12/01'),
        modificationDate: new Date('2020/04/19'),
      });

      await pdfDoc2.attach(pdfAttachmentBytes, 'us_constitution.pdf', {
        mimeType: 'application/pdf',
        description: 'Constitution of the United States 🇺🇸🦅',
        creationDate: new Date('1787/09/17'),
        modificationDate: new Date('1992/05/07'),
      });

      const savedDoc1 = await pdfDoc1.save();
      const savedDoc2 = await pdfDoc2.save();

      expect(savedDoc1).toEqual(savedDoc2);
    });
  });

  describe('getAttachments() method', () => {
    it('Can read attachments from an existing pdf file', async () => {
      const pdfDoc = await PDFDocument.load(hasAttachmentPdfBytes);
      const attachments = pdfDoc.getAttachments();
      expect(attachments.length).toEqual(2);
      const jpgAttachment = attachments.find(
        (attachment) => attachment.name === 'cat_riding_unicorn.jpg',
      )!;
      const pdfAttachment = attachments.find(
        (attachment) => attachment.name === 'us_constitution.pdf',
      )!;
      expect(pdfAttachment).toBeDefined();
      expect(jpgAttachment).toBeDefined();
      expect(jpgAttachment.description).toBe(
        'Cool cat riding a unicorn! 🦄🐈🕶️',
      );
      expect(pdfAttachment.description).toBe(
        'Constitution of the United States 🇺🇸🦅',
      );
      expect(jpgAttachment.mimeType).toBe('image/jpeg');
      expect(pdfAttachment.mimeType).toBe('application/pdf');
      expect(jpgAttachment.afRelationship).not.toBeDefined();
      expect(pdfAttachment.afRelationship).not.toBeDefined();
      const jpgAttachmentBytes = fs.readFileSync(
        'assets/images/cat_riding_unicorn.jpg',
      );
      const pdfAttachmentBytes = fs.readFileSync(
        'assets/pdfs/us_constitution.pdf',
      );
      expect(jpgAttachmentBytes).toEqual(Buffer.from(jpgAttachment.data));
      expect(pdfAttachmentBytes).toEqual(Buffer.from(pdfAttachment.data));
    });

    it('Can get saved and unsaved attachments', async () => {
      const pdfDoc = await PDFDocument.load(hasAttachmentPdfBytes);
      const haiku = `Cradled in silence,
      sunlight warms the fragile shell —
      breakfast is reborn.`;
      const creationDate = new Date(Date.now() - 60 * 60 * 1000);
      const modificationDate = new Date();
      await pdfDoc.attach(Buffer.from(haiku), 'haiku.txt', {
        mimeType: 'text/plain',
        description: '🥚 Haikus are short. So is the life of an egg. 🍳',
        afRelationship: AFRelationship.Supplement,
        creationDate,
        modificationDate,
      });
      await pdfDoc.attach(examplePngImage, 'example.png', {
        mimeType: 'image/png',
        description: 'An example image',
        afRelationship: AFRelationship.Alternative,
        creationDate,
        modificationDate,
      });

      const attachments = pdfDoc.getAttachments();
      expect(attachments.length).toEqual(4);
      const jpgAttachment = attachments.find(
        (attachment) => attachment.name === 'cat_riding_unicorn.jpg',
      )!;
      const pdfAttachment = attachments.find(
        (attachment) => attachment.name === 'us_constitution.pdf',
      )!;
      const txtAttachment = attachments.find(
        (attachment) => attachment.name === 'haiku.txt',
      )!;
      const pngAttachment = attachments.find(
        (attachment) => attachment.name === 'example.png',
      )!;
      expect(pdfAttachment).toBeDefined();
      expect(jpgAttachment).toBeDefined();
      expect(txtAttachment).toBeDefined();
      expect(jpgAttachment.description).toBe(
        'Cool cat riding a unicorn! 🦄🐈🕶️',
      );
      expect(pdfAttachment.description).toBe(
        'Constitution of the United States 🇺🇸🦅',
      );
      expect(txtAttachment.description).toBe(
        '🥚 Haikus are short. So is the life of an egg. 🍳',
      );
      expect(pngAttachment.description).toBe('An example image');
      expect(jpgAttachment.mimeType).toBe('image/jpeg');
      expect(pdfAttachment.mimeType).toBe('application/pdf');
      expect(txtAttachment.mimeType).toBe('text/plain');
      expect(pngAttachment.mimeType).toBe('image/png');
      expect(jpgAttachment.afRelationship).not.toBeDefined();
      expect(pdfAttachment.afRelationship).not.toBeDefined();
      expect(txtAttachment.afRelationship).toBe(AFRelationship.Supplement);
      expect(pngAttachment.afRelationship).toBe(AFRelationship.Alternative);
      const jpgAttachmentBytes = fs.readFileSync(
        'assets/images/cat_riding_unicorn.jpg',
      );
      const pdfAttachmentBytes = fs.readFileSync(
        'assets/pdfs/us_constitution.pdf',
      );
      expect(jpgAttachmentBytes).toEqual(Buffer.from(jpgAttachment.data));
      expect(pdfAttachmentBytes).toEqual(Buffer.from(pdfAttachment.data));
      expect(new TextDecoder().decode(txtAttachment.data)).toBe(haiku);
      const expectedImageBytes = Uint8Array.from(
        atob(examplePngImageBase64),
        (c) => c.charCodeAt(0),
      );
      expect(pngAttachment.data).toEqual(expectedImageBytes);
      expect(jpgAttachment.creationDate).toBeDefined();
      expect(pdfAttachment.creationDate).toBeDefined();
      expect(txtAttachment.creationDate).toBe(creationDate);
      expect(pngAttachment.creationDate).toBe(creationDate);
      expect(jpgAttachment.modificationDate).toBeDefined();
      expect(pdfAttachment.modificationDate).toBeDefined();
      expect(txtAttachment.modificationDate).toBe(modificationDate);
      expect(pngAttachment.modificationDate).toBe(modificationDate);
    });

    describe('allow attachment data to be passed in different formats', () => {
      let pdfDoc: PDFDocument;
      const mimeType = 'text/plain';
      const description = '🥚 Haikus are short. So is the life of an egg. 🍳';
      const attachment = `Cradled in silence,
  sunlight warms the fragile shell —
  breakfast is reborn.`;
      const afRelationship = AFRelationship.Alternative;
      let attachments: PDFAttachment[];

      beforeAll(async () => {
        const parseSpeed = ParseSpeeds.Fastest;
        pdfDoc = await PDFDocument.load(unencryptedPdfBytes, { parseSpeed });
        const base64 = Buffer.from(attachment).toString('base64');
        const dataUrl = `data:${mimeType};base64,${base64}`;

        await pdfDoc.attach(dataUrl, 'string.txt', {
          mimeType,
          description,
          afRelationship,
        });

        await pdfDoc.attach(
          new TextEncoder().encode(attachment),
          'uint8array.txt',
          {
            mimeType,
            description,
            afRelationship,
          },
        );

        await pdfDoc.attach(Buffer.from(attachment), 'buffer.txt', {
          mimeType,
          description,
          afRelationship,
        });

        const pdfBytes = await pdfDoc.save();
        pdfDoc = await PDFDocument.load(pdfBytes);
        attachments = pdfDoc.getAttachments();
      });

      it('should attach 3 attachments', () => {
        expect(attachments).toHaveLength(3);
      });

      it('should attach data URL attachments', () => {
        const stringAttachments = attachments.filter(
          (a) => a.name === 'string.txt',
        );
        expect(stringAttachments.length).toBe(1);
        const extracted = new TextDecoder().decode(stringAttachments[0].data);
        expect(extracted).toEqual(attachment);
        expect(stringAttachments[0].mimeType).toBe(mimeType);
        expect(stringAttachments[0].afRelationship).toBe(afRelationship);
        expect(stringAttachments[0].description).toBe(description);
      });

      it('should attach Uint8Array attachments', () => {
        const stringAttachments = attachments.filter(
          (a) => a.name === 'uint8array.txt',
        );
        expect(stringAttachments.length).toBe(1);
        const extracted = new TextDecoder().decode(stringAttachments[0].data);
        expect(extracted).toEqual(attachment);
        expect(stringAttachments[0].mimeType).toBe(mimeType);
        expect(stringAttachments[0].afRelationship).toBe(afRelationship);
        expect(stringAttachments[0].description).toBe(description);
      });

      it('should attach buffer attachments', () => {
        const stringAttachments = attachments.filter(
          (a) => a.name === 'buffer.txt',
        );
        expect(stringAttachments.length).toBe(1);
        const extracted = new TextDecoder().decode(stringAttachments[0].data);
        expect(extracted).toEqual(attachment);
        expect(stringAttachments[0].mimeType).toBe(mimeType);
        expect(stringAttachments[0].afRelationship).toBe(afRelationship);
        expect(stringAttachments[0].description).toBe(description);
      });
    });
  });

  describe('detach() method', () => {
    it('removes the specified attachment', async () => {
      const pdfDoc = await PDFDocument.load(hasAttachmentPdfBytes);
      let attachments = pdfDoc.getAttachments();
      expect(attachments.length).toEqual(2);

      pdfDoc.detach('cat_riding_unicorn.jpg');
      attachments = pdfDoc.getAttachments();
      expect(attachments.length).toEqual(1);
      expect(attachments[0].name).toEqual('us_constitution.pdf');

      pdfDoc.detach('us_constitution.pdf');
      attachments = pdfDoc.getAttachments();
      expect(attachments.length).toEqual(0);
    });

    it('removes the attachment after saving', async () => {
      const pdfDoc = await PDFDocument.load(hasAttachmentPdfBytes);
      pdfDoc.attach(examplePngImage, 'example.png', {
        mimeType: 'image/png',
        description: 'An example image',
      });
      await pdfDoc.saveAsBase64();
      let attachments = pdfDoc.getAttachments();
      expect(attachments.length).toEqual(3);
      pdfDoc.detach('example.png');
      attachments = pdfDoc.getAttachments();
      expect(attachments.length).toEqual(2);
    });

    it('does nothing if the specified attachment is not found', async () => {
      const pdfDoc = await PDFDocument.load(hasAttachmentPdfBytes);
      let attachments = pdfDoc.getAttachments();
      expect(attachments.length).toEqual(2);

      pdfDoc.detach('not_existing.txt');
      attachments = pdfDoc.getAttachments();
      expect(attachments.length).toEqual(2);
    });
  });

  describe('load({forIncrementalUpdate}) cycle', () => {
    it('can be used with different pages', async () => {
      const noErrorFunc = async (pageIndex: number) => {
        const pdfDoc = await PDFDocument.load(simplePdfBytes, {
          forIncrementalUpdate: true,
        });
        const page = pdfDoc.getPage(pageIndex);
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        const fontSize = 30;
        page.drawText('Incremental saving is also awesome!', {
          x: 50,
          y: 4 * fontSize,
          size: fontSize,
          font: timesRomanFont,
        });

        const pdfIncrementalBytes = await pdfDoc.save();
        const rewritedBytes = await pdfDoc.save({ rewrite: true });
        expect(pdfIncrementalBytes.byteLength).toBeGreaterThan(
          simplePdfBytes.byteLength,
        );
        expect(rewritedBytes.byteLength).toBeGreaterThan(0);
        expect(rewritedBytes.byteLength).toBeLessThan(
          pdfIncrementalBytes.byteLength,
        );
      };

      await expect(noErrorFunc(0)).resolves.not.toThrowError();
      await expect(noErrorFunc(1)).resolves.not.toThrowError();
    });

    it('can be used with object-stream PDFs', async () => {
      const noErrorFunc = async () => {
        const pdfDoc = await PDFDocument.load(simpleStreamsPdfBytes, {
          forIncrementalUpdate: true,
        });
        const page = pdfDoc.getPage(0);
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        const fontSize = 30;
        page.drawText('Incremental saving is also awesome!', {
          x: 50,
          y: 4 * fontSize,
          size: fontSize,
          font: timesRomanFont,
        });

        const pdfIncrementalBytes = await pdfDoc.save();
        const pdfRewriteBytes = await pdfDoc.save({ rewrite: true });
        expect(pdfIncrementalBytes.byteLength).toBeGreaterThan(
          simpleStreamsPdfBytes.byteLength,
        );
        expect(pdfRewriteBytes.byteLength).toBeGreaterThan(
          simpleStreamsPdfBytes.byteLength,
        );
      };

      await expect(noErrorFunc()).resolves.not.toThrowError();
    });

    it('produces same output than manual incremental update', async () => {
      const noErrorFunc = async (pageIndex: number) => {
        const pdfDoc = await PDFDocument.load(simplePdfBytes, {
          forIncrementalUpdate: true,
        });
        const snapshot = pdfDoc.takeSnapshot();
        const page = pdfDoc.getPage(pageIndex);
        snapshot.markRefForSave(page.ref);
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        const fontSize = 30;
        page.drawText('Incremental saving is also awesome!', {
          x: 50,
          y: 4 * fontSize,
          size: fontSize,
          font: timesRomanFont,
        });

        const pdfIncrementalBytes = await pdfDoc.saveIncremental(snapshot);
        const finalPdfBytes = Buffer.concat([
          Uint8Array.from(simplePdfBytes),
          Uint8Array.from(pdfIncrementalBytes),
        ]);
        const pdfSaveBytes = await pdfDoc.save();
        expect(pdfIncrementalBytes.byteLength).toBeGreaterThan(0);
        expect(finalPdfBytes.byteLength).toBeLessThanOrEqual(
          pdfSaveBytes.byteLength,
        );
      };

      await expect(noErrorFunc(0)).resolves.not.toThrowError();
      await expect(noErrorFunc(1)).resolves.not.toThrowError();
    });
  });

  describe('getDocumentJavaScripts() method', () => {
    it('returns empty array when no JavaScript exists', async () => {
      const pdfDoc = await PDFDocument.create();
      const scripts = pdfDoc.getDocumentJavaScripts();
      expect(scripts).toEqual([]);
    });

    it('can extract document-level JavaScript', async () => {
      const pdfDoc = await PDFDocument.create();
      pdfDoc.addJavaScript('script1', 'console.println("Test 1");');
      pdfDoc.addJavaScript('script2', 'console.println("Test 2");');

      await pdfDoc.flush();

      const scripts = pdfDoc.getDocumentJavaScripts();

      expect(scripts).toHaveLength(2);
      expect(scripts[0].name).toBe('script1');
      expect(scripts[0].script).toBe('console.println("Test 1");');
      expect(scripts[1].name).toBe('script2');
      expect(scripts[1].script).toBe('console.println("Test 2");');
    });

    it('can extract JavaScript from loaded PDF', async () => {
      const pdfDoc1 = await PDFDocument.create();
      pdfDoc1.addJavaScript('test', 'console.show();');
      const savedBytes = await pdfDoc1.save();

      const pdfDoc2 = await PDFDocument.load(savedBytes);
      const scripts = pdfDoc2.getDocumentJavaScripts();

      expect(scripts).toHaveLength(1);
      expect(scripts[0].name).toBe('test');
      expect(scripts[0].script).toBe('console.show();');
    });
  });

  describe('preserveXFA option', () => {
    it('deletes XFA by default', async () => {
      const pdfDoc1 = await PDFDocument.create();
      const form = pdfDoc1.getForm();

      // Manually add XFA data
      form.acroForm.dict.set(
        PDFName.of('XFA'),
        PDFArray.withContext(pdfDoc1.context),
      );

      const savedBytes = await pdfDoc1.save();

      // Load without preserveXFA
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const pdfDoc2 = await PDFDocument.load(savedBytes);
      const form2 = pdfDoc2.getForm();

      expect(form2.hasXFA()).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Removing XFA form data'),
      );

      consoleWarnSpy.mockRestore();
    });

    it('preserves XFA when preserveXFA is true', async () => {
      const pdfDoc1 = await PDFDocument.create();
      const form = pdfDoc1.getForm();

      // Manually add XFA data
      form.acroForm.dict.set(
        PDFName.of('XFA'),
        PDFArray.withContext(pdfDoc1.context),
      );

      const savedBytes = await pdfDoc1.save();

      // Load with preserveXFA
      const pdfDoc2 = await PDFDocument.load(savedBytes, { preserveXFA: true });
      const form2 = pdfDoc2.getForm();

      expect(form2.hasXFA()).toBe(true);
    });
  });

  describe('save() PDF header version', () => {
    it('bumps the header when rewriting a pre-1.5 document with object streams', async () => {
      const pdfDoc = await PDFDocument.create({ updateMetadata: false });
      pdfDoc.context.header = PDFHeader.forVersion(1, 3);
      pdfDoc.addPage();

      const bytes = await pdfDoc.save({ rewrite: true });
      const text = Buffer.from(bytes).toString('latin1');

      // PDFStreamWriter emits a cross-reference stream (PDF 1.5+); the header
      // must be raised to match.
      expect(pdfDoc.context.header.getVersionString()).toBe('1.7');
      expect(text).toContain('%PDF-1.7');
      expect(text).toContain('/Type /XRef');
    });

    it('preserves a pre-1.5 header when object streams are not used', async () => {
      const pdfDoc = await PDFDocument.create({ updateMetadata: false });
      pdfDoc.context.header = PDFHeader.forVersion(1, 4);
      pdfDoc.addPage();

      const bytes = await pdfDoc.save({ useObjectStreams: false });
      const text = Buffer.from(bytes).toString('latin1');

      expect(pdfDoc.context.header.getVersionString()).toBe('1.4');
      expect(text).toContain('%PDF-1.4');
      expect(text).not.toContain('/Type /XRef');
    });
  });
});
