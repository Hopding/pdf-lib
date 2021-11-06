import fontkit from '@pdf-lib/fontkit';
import fs from 'fs';
import {
  EncryptedPDFError,
  ParseSpeeds,
  PDFArray,
  PDFDict,
  PDFDocument,
  PDFHexString,
  PDFName,
  PDFPage,
  Duplex,
  NonFullScreenPageMode,
  PrintScaling,
  ReadingDirection,
  ViewerPreferences,
} from 'src/index';

const examplePngImage =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABhGlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9TxaoVBzuIdMhQnSyIijhKFYtgobQVWnUwufQLmjQkKS6OgmvBwY/FqoOLs64OroIg+AHi5uak6CIl/i8ptIjx4Lgf7+497t4BQqPCVLNrAlA1y0jFY2I2tyr2vKIfAgLoRVhipp5IL2bgOb7u4ePrXZRneZ/7cwwoeZMBPpF4jumGRbxBPLNp6Zz3iUOsJCnE58TjBl2Q+JHrsstvnIsOCzwzZGRS88QhYrHYwXIHs5KhEk8TRxRVo3wh67LCeYuzWqmx1j35C4N5bSXNdZphxLGEBJIQIaOGMiqwEKVVI8VEivZjHv4Rx58kl0yuMhg5FlCFCsnxg//B727NwtSkmxSMAd0vtv0xCvTsAs26bX8f23bzBPA/A1da219tALOfpNfbWuQIGNwGLq7bmrwHXO4Aw0+6ZEiO5KcpFArA+xl9Uw4YugX61tzeWvs4fQAy1NXyDXBwCIwVKXvd492Bzt7+PdPq7wcdn3KFLu4iBAAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAlFJREFUeNrt289r02AYB/Dvk6Sl4EDKpllTlFKsnUdBHXgUBEHwqHj2IJ72B0zwKHhxJ08i/gDxX/AiRfSkBxELXTcVxTa2s2xTsHNN8ngQbQL70RZqG/Z9b29JnvflkydP37whghG3ZaegoxzfwB5vBCAAAQhAAAIQgAAEIAABCEAAAhCAAAQgwB5rstWPtnP0LqBX/vZNyLF6vVrpN/hucewhb4g+B2AyAwiwY7NGOXijviS9vBeYh6CEP4edBLDADCAAAQhAAAIQgAAEIAABCDAUAFF/GIN1DM+PBYCo/ohMXDQ1WPjoeUZH1mMBEEh0oqLGvsHCy0S4NzWVWotJBogbvZB+brDwQT7UWSmXy5sxyQB9HQEROdVv4HQ+vx+QmS4iXsWmCK7Usu8AhOqAXMzlcn3VgWTbugQgEYrxMkZ/gyUPgnuhe2C6/Stxvdeg2ezMJERvhOuoZ+JBrNYBRuDdBtDuXkDM25nCHLbZSv9X6A4VHU+DpwCcbvbjcetLtTaOANtuirrux08HM0euisjDEMKC7RQuq+C+pVJqpzx3NZ3+eeBza9I0rWJgyHnxg2sAJrqnaHUzFcyN60Jox13hprv8aNopZBS4GcqWWVHM+lAkN0zY7ncgkYBukRoKLPpiXVj9UFkfV4Bdl8Jf60u3IMZZAG/6iLuhkDvaSZ74VqtUx3kp3NN7gUZt8RmA43a2eEY1OCfQ04AcBpAGkAKwpkBLIG8BfQE/eNJsvG/G4VlARj0BfjDBx2ECEIAABCAAAQhAAAIQgAAE+P/tN8YvpvbTDBOlAAAAAElFTkSuQmCC';

const unencryptedPdfBytes = fs.readFileSync('assets/pdfs/normal.pdf');
const oldEncryptedPdfBytes1 = fs.readFileSync('assets/pdfs/encrypted_old.pdf');

// Had to remove this file due to DMCA complaint, so commented this line out
// along with the 2 tests that depend on it. Would be nice to find a new file
// that we could drop in here, but the tests are for non-critical functionality,
// so this solution is okay for now.
// const oldEncryptedPdfBytes2 = fs.readFileSync('pdf_specification.pdf');

const newEncryptedPdfBytes = fs.readFileSync('assets/pdfs/encrypted_new.pdf');
const invalidObjectsPdfBytes = fs.readFileSync(
  'assets/pdfs/with_invalid_objects.pdf',
);
const justMetadataPdfbytes = fs.readFileSync('assets/pdfs/just_metadata.pdf');
const normalPdfBytes = fs.readFileSync('assets/pdfs/normal.pdf');
const withViewerPrefsPdfBytes = fs.readFileSync(
  'assets/pdfs/with_viewer_prefs.pdf',
);

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

    // it(`throws an error for old encrypted PDFs (2)`, async () => {
    //   await expect(
    //     PDFDocument.load(oldEncryptedPdfBytes2, {
    //       parseSpeed: ParseSpeeds.Fastest,
    //     }),
    //   ).rejects.toThrow(new EncryptedPDFError());
    // });

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

    // it(`does not throw an error for old encrypted PDFs when ignoreEncryption=true (2)`, async () => {
    //   const pdfDoc = await PDFDocument.load(oldEncryptedPdfBytes2, {
    //     ignoreEncryption: true,
    //     parseSpeed: ParseSpeeds.Fastest,
    //   });
    //   expect(pdfDoc).toBeInstanceOf(PDFDocument);
    //   expect(pdfDoc.isEncrypted).toBe(true);
    // });

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
    it(`serializes the same value on every save`, async () => {
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

  describe(`ViewerPreferences`, () => {
    it(`defaults to an undefined ViewerPreferences dict`, async () => {
      const pdfDoc = await PDFDocument.create();

      expect(
        pdfDoc.catalog.lookupMaybe(PDFName.of('ViewerPreferences'), PDFDict),
      ).toBeUndefined();
    });

    it(`can get/set HideToolbar, HideMenubar, HideWindowUI, FitWindow, CenterWindow, DisplayDocTitle, NonFullScreenPageMode, Direction, PrintScaling, Duplex, PickTrayByPDFSize, PrintPageRange, NumCopies from a new document`, async () => {
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

    it(`they can be retrieved from an existing document`, async () => {
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

  describe(`setTitle() method with options`, () => {
    it(`does not set the ViewerPreferences dict if the option is not set`, async () => {
      const pdfDoc = await PDFDocument.create();

      pdfDoc.setTitle('Testing setTitle Title');

      expect(
        pdfDoc.catalog.lookupMaybe(PDFName.of('ViewerPreferences'), PDFDict),
      ).toBeUndefined();

      expect(pdfDoc.getTitle()).toBe('Testing setTitle Title');
    });

    it(`creates the ViewerPreferences dict when the option is set`, async () => {
      const pdfDoc = await PDFDocument.create();

      pdfDoc.setTitle('ViewerPrefs Test Creation', {
        showInWindowTitleBar: true,
      });

      expect(
        pdfDoc.catalog.lookupMaybe(PDFName.of('ViewerPreferences'), PDFDict),
      );
    });
  });

  describe(`addJavaScript() method`, () => {
    it(`adds the script to the catalog`, async () => {
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

    it(`does not overwrite scripts`, async () => {
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
  });

  describe(`embedPng() method`, () => {
    it(`does not prevent the PDFDocument from being modified after embedding an image`, async () => {
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

  describe(`save() method`, () => {
    it(`can called multiple times on the same PDFDocument with different changes`, async () => {
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
  });

  describe(`copy() method`, () => {
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

    it(`Returns a pdf with the same number of pages`, async () => {
      expect(pdfDoc.getPageCount()).toBe(srcDoc.getPageCount());
    });

    it(`Can copy author, creationDate, creator, producer, subject, title, defaultWordBreaks`, async () => {
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
});
