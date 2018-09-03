/* eslint-disable prefer-destructuring, no-param-reassign */
import isNumber from 'lodash/isNumber';
import last from 'lodash/last';

import {
  PDFArray,
  PDFDictionary,
  PDFIndirectReference,
  PDFName,
  PDFNumber,
} from 'core/pdf-objects';
import { PDFPage } from 'core/pdf-structures';
import { isInstance, validate } from 'utils/validate';

import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';

export type Kid = PDFPageTree | PDFPage;

const VALID_KEYS = Object.freeze(['Type', 'Parent', 'Kids', 'Count']);

class PDFPageTree extends PDFDictionary {
  static createRootNode = (
    kids: PDFArray<PDFIndirectReference<Kid>>,
    index: PDFObjectIndex,
  ): PDFPageTree => {
    validate(kids, isInstance(PDFArray), '"kids" must be a PDFArray');
    validate(
      index,
      isInstance(PDFObjectIndex),
      '"index" must be an instance of PDFObjectIndex',
    );
    return new PDFPageTree(
      {
        Type: PDFName.from('Pages'),
        Kids: kids,
        Count: PDFNumber.fromNumber(kids.array.length),
      },
      index,
    );
  };

  static createNode = (
    parent: PDFIndirectReference<Kid>,
    kids: PDFArray<PDFIndirectReference<Kid>>,
    index: PDFObjectIndex,
  ): PDFPageTree => {
    validate(
      parent,
      isInstance(PDFIndirectReference),
      '"parent" must be a PDFIndirectReference',
    );
    return PDFPageTree.createRootNode(kids, index).set('Parent', parent);
  };

  static fromDict = (dict: PDFDictionary): PDFPageTree => {
    validate(dict, isInstance(PDFDictionary), '"dict" must be a PDFDictionary');
    return new PDFPageTree(dict.map, dict.index, VALID_KEYS);
  };

  get Kids() {
    return this.index.lookup(this.get('Kids')) as PDFArray<
      Kid | PDFIndirectReference<Kid>
    >;
  }

  get Parent() {
    return this.index.lookupMaybe(
      this.getMaybe('Parent'),
    ) as PDFPageTree | void;
  }

  get Count() {
    return this.get('Count') as PDFNumber;
  }

  addPage = (page: PDFIndirectReference<PDFPage>) => {
    validate(
      page,
      isInstance(PDFIndirectReference),
      '"page" arg must be of type PDFIndirectReference<PDFPage>',
    );
    this.Kids.array.push(page);
    this.ascend((pageTree) => {
      pageTree.Count.number += 1;
    });
    return this;
  };

  removePage = (idx: number) => {
    validate(idx, isNumber, '"idx" arg must be a Number');
    this.Kids.array.splice(idx, 1);
    this.ascend((pageTree) => {
      pageTree.Count.number -= 1;
    });
    return this;
  };

  insertPage = (idx: number, page: PDFIndirectReference<PDFPage>) => {
    validate(idx, isNumber, '"idx" arg must be a Number');
    validate(
      page,
      isInstance(PDFIndirectReference),
      '"page" arg must be of type PDFIndirectReference<PDFPage>',
    );
    this.Kids.array.splice(idx, 0, page);
    this.ascend((pageTree) => {
      pageTree.Count.number += 1;
    });
    return this;
  };

  // TODO: Pass a "stop" callback to allow "visit" to end traversal early
  // TODO: Allow for optimized tree search given an index
  traverse = (visit: (k: Kid, r: Kid | PDFIndirectReference<Kid>) => any) => {
    if (this.Kids.array.length === 0) return this;

    this.Kids.forEach((kidRef) => {
      const kid = this.index.lookup(kidRef) as Kid;
      visit(kid, kidRef);
      if (kid instanceof PDFPageTree) kid.traverse(visit);
    });
    return this;
  };

  traverseRight = (
    visit: (k: Kid, r: Kid | PDFIndirectReference<Kid>) => any,
  ) => {
    if (this.Kids.array.length === 0) return this;

    const lastKidRef = last(this.Kids.array)!;
    const lastKid = this.index.lookup(lastKidRef) as Kid;
    visit(lastKid, lastKidRef);
    if (lastKid instanceof PDFPageTree) lastKid.traverseRight(visit);
    return this;
  };

  ascend = (visit: (t: PDFPageTree) => any, visitSelf = true) => {
    if (visitSelf) visit(this);
    const Parent = this.Parent;
    if (!Parent) return;
    visit(Parent);
    Parent.ascend(visit, false);
  };
}

export default PDFPageTree;
