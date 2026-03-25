import fs from 'fs';
import { decodeFromBase64DataUri } from '../../src/utils';

const pdfBytes = fs.readFileSync('tests/utils/data/simple.pdf');
const pdfBase64Bytes = fs.readFileSync('tests/utils/data/simple.pdf.base64');

// Jest stalls when comparing large arrays, so we'll use this instead
const arraysAreEqual = (a: Uint8Array, b: Uint8Array) => {
  if (a.length !== b.length) return false;
  for (let idx = 0, len = a.length; idx < len; idx++) {
    if (a[idx] !== b[idx]) return false;
  }
  return true;
};

describe('decodeFromBase64DataUri', () => {
  it('can decode plain base64 strings', () => {
    const uri = String(pdfBase64Bytes);
    expect(arraysAreEqual(decodeFromBase64DataUri(uri), pdfBytes)).toBe(true);
  });

  it('can decode complete data URIs', () => {
    const uri = `data:application/pdf;base64,${pdfBase64Bytes}`;
    expect(arraysAreEqual(decodeFromBase64DataUri(uri), pdfBytes)).toBe(true);
  });

  it('can decode partial data URIs (1)', () => {
    const uri = `data:application/pdf;,${pdfBase64Bytes}`;
    expect(arraysAreEqual(decodeFromBase64DataUri(uri), pdfBytes)).toBe(true);
  });

  it('can decode partial data URIs (2)', () => {
    const uri = `data:;,${pdfBase64Bytes}`;
    expect(arraysAreEqual(decodeFromBase64DataUri(uri), pdfBytes)).toBe(true);
  });

  it('can decode partial data URIs (3)', () => {
    const uri = `data:application/pdf;,${pdfBase64Bytes}`;
    expect(arraysAreEqual(decodeFromBase64DataUri(uri), pdfBytes)).toBe(true);
  });

  it('can decode partial data URIs (4)', () => {
    const uri = `:;,${pdfBase64Bytes}`;
    expect(arraysAreEqual(decodeFromBase64DataUri(uri), pdfBytes)).toBe(true);
  });

  it('can decode partial data URIs (5)', () => {
    const uri = `;,${pdfBase64Bytes}`;
    expect(arraysAreEqual(decodeFromBase64DataUri(uri), pdfBytes)).toBe(true);
  });

  it('can decode partial data URIs (6)', () => {
    const uri = `,${pdfBase64Bytes}`;
    expect(arraysAreEqual(decodeFromBase64DataUri(uri), pdfBytes)).toBe(true);
  });

  it('can throws an error when it fails to parse the URI', () => {
    const uri = {} as any;
    expect(() => decodeFromBase64DataUri(uri)).toThrow();
  });
});
