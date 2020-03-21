import fs from 'fs';
import { PDFDocument } from 'src/api';

describe(`PDFMetadata`, () => {
  const updateSectionsPdfBytes = fs.readFileSync(
    'assets/pdfs/with_update_sections.pdf',
  );

  it(`metadata fields can be set and retrieved (Hex String encoded as UTF-16BE)`, async () => {
    const pdfDoc = await PDFDocument.create();

    // Everything is empty or has its initial value.
    expect(pdfDoc.getTitle()).toBe('');
    expect(pdfDoc.getAuthor()).toBe('');
    expect(pdfDoc.getSubject()).toBe('');
    expect(pdfDoc.getProducer()).toBe(
      'pdf-lib (https://github.com/Hopding/pdf-lib)',
    );
    expect(pdfDoc.getCreator()).toBe(
      'pdf-lib (https://github.com/Hopding/pdf-lib)',
    );
    expect(pdfDoc.getKeywords()).toStrictEqual([]);
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
    expect(pdfDoc.getKeywords()).toStrictEqual(keywords);
    expect(pdfDoc.getCreationDate()).toStrictEqual(creationDate);
    expect(pdfDoc.getModificationDate()).toStrictEqual(modificationDate);
  });

  it(`metadata fields can retrieved (Literal String encoded with the PDFDocEncoding)`, async () => {
    const pdfDoc = await PDFDocument.load(updateSectionsPdfBytes);

    expect(pdfDoc.getTitle()).toBe('');
    expect(pdfDoc.getAuthor()).toBe('SE:W:CAR:MP');
    expect(pdfDoc.getSubject()).toBe('Payment Voucher');
    expect(pdfDoc.getProducer()).toBe(
      'pdf-lib (https://github.com/Hopding/pdf-lib)',
    );
    expect(pdfDoc.getCreator()).toBe('Adobe LiveCycle Designer ES 8.2');
    expect(pdfDoc.getKeywords()).toStrictEqual([]);
    expect(pdfDoc.getCreationDate()).toStrictEqual(
      new Date('2014-01-02T13:00:54Z'),
    );
  });
});
