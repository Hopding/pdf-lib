import { PDFDocument, StandardFonts } from '../../src/api';
import type { EncryptionAlgorithm } from '../../src/core';
import PDFHeader from '../../src/core/document/PDFHeader';
import PDFName from '../../src/core/objects/PDFName';
import PDFDict from '../../src/core/objects/PDFDict';
import PDFNumber from '../../src/core/objects/PDFNumber';
import PDFRawStream from '../../src/core/objects/PDFRawStream';
import { decodePDFRawStream } from '../../src/core/streams/decode';

const SECRET = 'Top secret payload';
const USER_PASSWORD = 'sekret';
const OWNER_PASSWORD = 'owner';

// 'Top secret payload' as it appears in a content stream's hex string operand
const SECRET_HEX = SECRET.split('')
  .map((char) => char.charCodeAt(0).toString(16).padStart(2, '0'))
  .join('')
  .toUpperCase();

const ALGORITHMS: Array<[string, EncryptionAlgorithm, boolean?]> = [
  ['RC4 40-bit (V1/R2)', 'RC4-40', true],
  ['RC4 128-bit (V2/R3)', 'RC4-128', true],
  ['AES-128 (V4/R4)', 'AES-128'],
  ['AES-256 (V5/R6)', 'AES-256'],
];

const buildEncryptedPdf = async (
  algorithm: EncryptionAlgorithm,
  allowWeakCryptography?: boolean,
) => {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  pdfDoc
    .addPage([300, 200])
    .drawText(SECRET, { x: 20, y: 100, size: 14, font });

  pdfDoc.encrypt({
    userPassword: USER_PASSWORD,
    ownerPassword: OWNER_PASSWORD,
    permissions: { printing: 'highResolution' },
    algorithm,
    allowWeakCryptography,
  });

  return pdfDoc.save();
};

const decodedContentStreams = (pdfDoc: PDFDocument) => {
  const streams: string[] = [];
  pdfDoc.context.enumerateIndirectObjects().forEach(([, object]) => {
    if (!(object instanceof PDFRawStream)) return;
    try {
      const decoded = decodePDFRawStream(object).decode();
      const text = String.fromCharCode(...Array.from(decoded));
      if (text.includes('BT')) streams.push(text);
    } catch {
      // Not every raw stream is a flate encoded content stream
    }
  });
  return streams;
};

describe('PDFDocument.encrypt', () => {
  ALGORITHMS.forEach(([name, algorithm, allowWeakCryptography]) => {
    describe(`using ${name}`, () => {
      it('writes an encryption dictionary and no plaintext', async () => {
        const bytes = await buildEncryptedPdf(algorithm, allowWeakCryptography);
        const raw = String.fromCharCode(...Array.from(bytes));

        expect(raw).toContain('/Encrypt');
        expect(raw).not.toContain(SECRET);
      });

      it('round trips through the decrypter with the user password', async () => {
        const bytes = await buildEncryptedPdf(algorithm, allowWeakCryptography);
        const reopened = await PDFDocument.load(bytes, {
          password: USER_PASSWORD,
        });

        const streams = decodedContentStreams(reopened);
        expect(streams.length).toBe(1);
        expect(streams[0]).toContain(SECRET_HEX);
      });

      it('round trips through the decrypter with the owner password', async () => {
        const bytes = await buildEncryptedPdf(algorithm, allowWeakCryptography);
        const reopened = await PDFDocument.load(bytes, {
          password: OWNER_PASSWORD,
        });

        expect(decodedContentStreams(reopened)[0]).toContain(SECRET_HEX);
      });

      it('rejects an incorrect password', async () => {
        const bytes = await buildEncryptedPdf(algorithm, allowWeakCryptography);
        await expect(
          PDFDocument.load(bytes, { password: 'wrong-password' }),
        ).rejects.toThrow();
      });
    });
  });

  it('defaults to AES-256 and raises an older header', async () => {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.context.header = PDFHeader.forVersion(1, 3);
    pdfDoc.addPage();
    pdfDoc.encrypt({ userPassword: USER_PASSWORD });

    expect(pdfDoc.context.header.getVersionString()).toBe('1.7');
    const encryptDict = pdfDoc.context.lookup(
      pdfDoc.context.trailerInfo.Encrypt,
      PDFDict,
    );
    expect(encryptDict.lookup(PDFName.of('V'), PDFNumber).asNumber()).toBe(5);
    expect(encryptDict.lookup(PDFName.of('R'), PDFNumber).asNumber()).toBe(6);
    expect(
      pdfDoc.catalog
        .lookup(PDFName.of('Extensions'), PDFDict)
        .lookup(PDFName.of('ADBE'), PDFDict)
        .lookup(PDFName.of('ExtensionLevel'), PDFNumber)
        .asNumber(),
    ).toBe(8);
  });

  it('refuses RC4 unless allowWeakCryptography is set', async () => {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.addPage();
    expect(() =>
      pdfDoc.encrypt({ userPassword: USER_PASSWORD, algorithm: 'RC4-128' }),
    ).toThrow(/allowWeakCryptography/);
  });

  it('round trips a Unicode password with AES-256', async () => {
    const password = 'clé 🔒';
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    pdfDoc
      .addPage([300, 200])
      .drawText(SECRET, { x: 20, y: 100, size: 14, font });
    pdfDoc.encrypt({ userPassword: password });

    const reopened = await PDFDocument.load(await pdfDoc.save(), { password });
    expect(decodedContentStreams(reopened)[0]).toContain(SECRET_HEX);
  });

  it('decrypts when the crypt filters are indirect objects', async () => {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    pdfDoc
      .addPage([300, 200])
      .drawText(SECRET, { x: 20, y: 100, size: 14, font });
    pdfDoc.encrypt({ userPassword: '', ownerPassword: OWNER_PASSWORD });

    // Some producers (e.g. iText 2.x) write /CF and each crypt filter as
    // indirect objects instead of inline dictionaries.
    const encrypted = await PDFDocument.load(await pdfDoc.save(), {
      ignoreEncryption: true,
    });
    const { context } = encrypted;
    const encryptDict = context.lookup(context.trailerInfo.Encrypt, PDFDict);
    const cf = encryptDict.lookup(PDFName.of('CF'), PDFDict);
    const stdCf = cf.lookup(PDFName.of('StdCF'), PDFDict);
    cf.set(PDFName.of('StdCF'), context.register(stdCf));
    encryptDict.set(PDFName.of('CF'), context.register(cf));
    const bytes = await encrypted.save({ useObjectStreams: false });

    const reopened = await PDFDocument.load(bytes, { password: '' });
    expect(decodedContentStreams(reopened)[0]).toContain(SECRET_HEX);
  });
});
