import type { PDFObject, PDFRef } from '../../core';
import { PDFClasses } from '../objects';
import type { DocumentSnapshot } from './DocumentSnapshot';

export class DefaultDocumentSnapshot implements DocumentSnapshot {
  static className = () => PDFClasses.DefaultDocumentSnapshot;
  myClass(): PDFClasses {
    return PDFClasses.DefaultDocumentSnapshot;
  }

  pdfSize = 0;
  prevStartXRef = 0;
  deletedCount = 0;

  shouldSave(_objectNumber: number): boolean {
    return true;
  }

  markRefForSave(_ref: PDFRef): void {
    throw new Error('This method should not be called.');
  }

  markRefsForSave(_refs: PDFRef[]): void {
    throw new Error('This method should not be called.');
  }

  markObjForSave(_obj: PDFObject): void {
    throw new Error('This method should not be called.');
  }

  markObjsForSave(_objs: PDFObject[]): void {
    throw new Error('This method should not be called.');
  }

  markDeletedObj(_obj: PDFObject): void {
    throw new Error('This method should not be called.');
  }

  markDeletedRef(_ref: PDFRef): void {
    throw new Error('This method should not be called.');
  }

  deletedRef(_index: number): PDFRef | null {
    throw new Error('This method should not be called.');
  }
}

export const defaultDocumentSnapshot = new DefaultDocumentSnapshot();
