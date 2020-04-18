import { PDFName, PDFNumber } from 'src/core';

export const asPDFName = (name: string | PDFName) =>
  name instanceof PDFName ? name : PDFName.of(name);

export const asPDFNumber = (num: number | PDFNumber) =>
  num instanceof PDFNumber ? num : PDFNumber.of(num);

export const asNumber = (num: number | PDFNumber) =>
  num instanceof PDFNumber ? num.asNumber() : num;
