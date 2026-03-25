import { PDFName, PDFNumber } from '../core';

export const asPDFName = (name: string | PDFName) =>
  typeof name !== 'string' ? name : PDFName.of(name);

export const asPDFNumber = (num: number | PDFNumber) =>
  typeof num !== 'number' ? num : PDFNumber.of(num);

export const asNumber = (num: number | PDFNumber) =>
  typeof num !== 'number' ? num.asNumber() : num;

export enum PDFClasses {
  PDFDict = 'PDFDict',
  PDFObject = 'PDFObject',
  PDFNumber = 'PDFNumber',
  PDFName = 'PDFName',
  PDFStream = 'PDFStream',
  PDFWriter = 'PDFWriter',
  PDFStreamWriter = 'PDFStreamWriter',
  PDFString = 'PDFString',
  PDFHexString = 'PDFHexString',
  PDFDocument = 'PDFDocument',
  PDFPageLeaf = 'PDFPageLeaf',
  StandardFontEmbedder = 'StandardFontEmbedder',
  PDFArray = 'PDFArray',
  PDFButton = 'PDFButton',
  PDFCheckBox = 'PDFCheckBox',
  PDFDropdown = 'PDFDropdown',
  PDFOptionList = 'PDFOptionList',
  PDFRadioGroup = 'PDFRadioGroup',
  PDFSignature = 'PDFSignature',
  PDFTextField = 'PDFTextField',
  PDFField = 'PDFField',
  PDFRef = 'PDFRef',
  PDFAcroForm = 'PDFAcroForm',
  PDFAcroField = 'PDFAcroField',
  PDFAcroNonTerminal = 'PDFAcroNonTerminal',
  PDFAcroPushButton = 'PDFAcroPushButton',
  PDFAcroCheckBox = 'PDFAcroCheckBox',
  PDFAcroComboBox = 'PDFAcroComboBox',
  PDFAcroListBox = 'PDFAcroListBox',
  PDFAcroText = 'PDFAcroText',
  PDFAcroRadioButton = 'PDFAcroRadioButton',
  PDFAcroSignature = 'PDFAcroSignature',
  AESBaseCipher = 'AESBaseCipher',
  PDFBool = 'PDFBool',
  PDFRawStream = 'PDFRawStream',
  PDFContentStream = 'PDFContentStream',
  Segment = 'Segment',
  Rectangle = 'Rectangle',
  Arc = 'Arc',
  Circle = 'Circle',
  Ellipse = 'Ellipse',
  Line = 'Line',
  Plot = 'Plot',
  Point = 'Point',
  PDFPageTree = 'PDFPageTree',
  PDFInvalidObject = 'PDFInvalidObject',
  PDFCatalog = 'PDFCatalog',
  DefaultDocumentSnapshot = 'DefaultDocumentSnapshot',
  PDFObjectStream = 'PDFObjectStream',
  IncrementalDocumentSnapshot = 'IncrementalDocumentSnapshot',
  PDFNull = 'PDFNull',
}

/**
 * Replaces instanceof operator by a "secure function" that uses clases internal identification.
 * This allows complex environments, where objects comes from different library instances, to work as expected.
 * @param {any} object Object to which compare the classname.
 * @param {PDFClasses | typeof PDFClass} className Class name object is expected to be an instanca (or subclass instance)
 * @returns {boolean}
 */
export const isPDFInstance = (object: any, className: PDFClasses): boolean => {
  if (!object) return false;
  if (!object.myClass) return false; // it's not an object from this library
  if (typeof className === 'function') {
    // is a constructor (PDFnNumber, PDFDict, etc)
    try {
      return isPDFInstance(object, (className as any).className());
    } catch (error) {
      return false;
    }
  }
  if (object.myClass() === className) return true;
  // not a perfect match, check superclasses
  let proto = Object.getPrototypeOf(object);
  while (proto && proto.constructor.className) {
    try {
      if (proto.constructor.className() === className) return true;
      proto = Object.getPrototypeOf(proto);
    } catch (error) {
      return false;
    }
  }
  // not the class, nor a subclass
  return false;
};
