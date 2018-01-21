/* @flow */
/* eslint-disable prefer-destructuring, no-param-reassign */
import _ from 'lodash';

import {
  PDFName,
  PDFNumber,
  PDFObject,
  PDFArray,
  PDFDictionary,
  PDFIndirectReference,
} from 'core/pdf-objects';
import { PDFPage } from 'core/pdf-structures';
import { validate, isInstance } from 'utils/validate';

export type Kid = PDFPageTree | PDFPage;

const VALID_KEYS = Object.freeze(['Type', 'Parent', 'Kids', 'Count']);

class PDFPageTree extends PDFDictionary {
  static createRootNode = (
    kids: PDFArray<PDFIndirectReference<Kid>>,
  ): PDFPageTree => {
    validate(kids, isInstance(PDFArray), '"kids" must be a PDFArray');
    return PDFPageTree.from({
      Type: PDFName.from('Pages'),
      Kids: kids,
      Count: PDFNumber.fromNumber(kids.array.length),
    });
  };

  static from = (object: PDFDictionary): PDFPageTree =>
    new PDFPageTree(object, VALID_KEYS);

  addPage = (
    lookup: (PDFIndirectReference<Kid>) => PDFPageTree,
    page: PDFIndirectReference<PDFPage>,
  ) => {
    validate(
      page,
      isInstance(PDFIndirectReference),
      '"page" arg must be of type PDFIndirectReference<PDFPage>',
    );
    this.get('Kids').array.push(page);
    this.ascend(lookup, pageTree => {
      pageTree.get('Count').number += 1;
    });
    return this;
  };

  removePage = (
    lookup: (PDFIndirectReference<Kid>) => PDFPageTree,
    idx: number,
  ) => {
    validate(idx, _.isNumber, '"idx" arg must be a Number');
    this.get('Kids').array.splice(idx, 1);
    this.ascend(lookup, pageTree => {
      pageTree.get('Count').number -= 1;
    });
    return this;
  };

  insertPage = (
    lookup: (PDFIndirectReference<Kid>) => PDFPageTree,
    idx: number,
    page: PDFIndirectReference<PDFPage>,
  ) => {
    validate(idx, _.isNumber, '"idx" arg must be a Number');
    validate(
      page,
      isInstance(PDFIndirectReference),
      '"page" arg must be of type PDFIndirectReference<PDFPage>',
    );
    this.get('Kids').array.splice(idx, 0, page);
    this.ascend(lookup, pageTree => {
      pageTree.get('Count').number += 1;
    });
    return this;
  };

  // TODO: Pass a "stop" callback to allow "visit" to end traversal early
  // TODO: Allow for optimized tree search given an index
  traverse = (
    lookup: (PDFIndirectReference<Kid>) => PDFObject,
    visit: (Kid, PDFIndirectReference<Kid>) => any,
  ) => {
    if (this.get('Kids').array.length === 0) return this;

    this.get('Kids').forEach(kidRef => {
      const kid: Kid = lookup(kidRef);
      visit(kid, kidRef);
      if (kid.is(PDFPageTree)) kid.traverse(lookup, visit);
    });
    return this;
  };

  traverseRight = (
    lookup: (PDFIndirectReference<Kid>) => PDFObject,
    visit: (Kid, PDFIndirectReference<Kid>) => any,
  ) => {
    if (this.get('Kids').array.length === 0) return this;

    const lastKidRef = _.last(this.get('Kids').array);
    const lastKid: Kid = lookup(lastKidRef);
    visit(lastKid, lastKidRef);
    if (lastKid.is(PDFPageTree)) lastKid.traverseRight(lookup, visit);
    return this;
  };

  ascend = (
    lookup: (PDFIndirectReference<Kid>) => PDFPageTree,
    visit: PDFPageTree => any,
    visitSelf?: boolean = true,
  ) => {
    if (visitSelf) visit(this);
    if (!this.get('Parent')) return;
    const parent: PDFPageTree = lookup(this.get('Parent'));
    visit(parent);
    parent.ascend(lookup, visit, false);
  };
}

export default PDFPageTree;
