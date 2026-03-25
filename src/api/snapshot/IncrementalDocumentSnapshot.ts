import type { PDFContext, PDFObject, PDFRef } from '../../core';
import { PDFClasses } from '../objects';
import type { DocumentSnapshot } from './DocumentSnapshot';

export class IncrementalDocumentSnapshot implements DocumentSnapshot {
  pdfSize: number;
  prevStartXRef: number;
  deletedCount: number = 0;

  private deleted: PDFRef[] = [];
  private lastObjectNumber: number;
  private changedObjects: Set<number>;

  context: PDFContext;

  constructor(
    lastObjectNumber: number,
    indirectObjects: Set<number>,
    pdfSize: number,
    prevStartXRef: number,
    context: PDFContext,
  ) {
    this.lastObjectNumber = lastObjectNumber;
    this.changedObjects = indirectObjects;
    this.pdfSize = pdfSize;
    this.prevStartXRef = prevStartXRef;
    this.context = context;
  }

  static className = () => PDFClasses.IncrementalDocumentSnapshot;
  myClass(): PDFClasses {
    return PDFClasses.IncrementalDocumentSnapshot;
  }

  shouldSave(objectNumber: number): boolean {
    if (objectNumber > this.lastObjectNumber) return true;
    return this.changedObjects.has(objectNumber);
  }

  markRefForSave(ref: PDFRef): void {
    this.markRefsForSave([ref]);
  }

  markRefsForSave(refs: PDFRef[]): void {
    refs.forEach((ref) => {
      if (ref) this.changedObjects.add(ref.objectNumber);
    });
  }

  markObjForSave(obj: PDFObject): void {
    this.markObjsForSave([obj]);
  }

  markObjsForSave(objs: PDFObject[]): void {
    this.markRefsForSave(
      objs
        .map((obj) => this.context.getRef(obj))
        .filter((ref) => ref !== undefined) as PDFRef[],
    );
  }

  markDeletedRef(ref: PDFRef): void {
    if (
      this.deleted.findIndex((dref) => dref.objectNumber === ref.objectNumber) <
      0
    )
      this.deletedCount = this.deleted.push(ref);
  }

  markDeletedObj(obj: PDFObject): void {
    const oref = this.context.getRef(obj);
    if (oref) this.markDeletedRef(oref);
  }

  deletedRef(index: number): PDFRef | null {
    if (index < 0 || index >= this.deleted.length) return null;
    return this.deleted[index];
  }
}
