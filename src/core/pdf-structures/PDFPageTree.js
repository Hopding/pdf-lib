/* @flow */
/* eslint-disable prefer-destructuring, no-param-reassign */
import _ from 'lodash';

import {
  PDFName,
  PDFNumber,
  PDFArray,
  PDFDictionary,
  PDFIndirectReference,
} from 'core/pdf-objects';
import { PDFPage } from 'core/pdf-structures';
import { validate, isInstance } from 'utils/validate';

import type { PDFObjectLookup } from 'core/pdf-document/PDFObjectIndex';

export type Kid = PDFPageTree | PDFPage;

const VALID_KEYS = Object.freeze(['Type', 'Parent', 'Kids', 'Count']);

class PDFPageTree extends PDFDictionary {
  static createRootNode = (
    kids: PDFArray<PDFIndirectReference<Kid>>,
    lookup: PDFObjectLookup,
  ): PDFPageTree => {
    validate(kids, isInstance(PDFArray), '"kids" must be a PDFArray');
    validate(lookup, _.isFunction, '"lookup" must be a function');
    return new PDFPageTree(
      {
        Type: PDFName.from('Pages'),
        Kids: kids,
        Count: PDFNumber.fromNumber(kids.array.length),
      },
      lookup,
    );
  };

  static fromDict = (dict: PDFDictionary): PDFPageTree => {
    validate(dict, isInstance(PDFDictionary), '"dict" must be a PDFDictionary');
    return new PDFPageTree(dict.map, dict.lookup, VALID_KEYS);
  };

  addPage = (page: PDFIndirectReference<PDFPage>) => {
    validate(
      page,
      isInstance(PDFIndirectReference),
      '"page" arg must be of type PDFIndirectReference<PDFPage>',
    );
    this.get('Kids').array.push(page);
    this.ascend(pageTree => {
      pageTree.get('Count').number += 1;
    });
    return this;
  };

  removePage = (idx: number) => {
    validate(idx, _.isNumber, '"idx" arg must be a Number');
    this.get('Kids').array.splice(idx, 1);
    this.ascend(pageTree => {
      pageTree.get('Count').number -= 1;
    });
    return this;
  };

  insertPage = (idx: number, page: PDFIndirectReference<PDFPage>) => {
    validate(idx, _.isNumber, '"idx" arg must be a Number');
    validate(
      page,
      isInstance(PDFIndirectReference),
      '"page" arg must be of type PDFIndirectReference<PDFPage>',
    );
    this.get('Kids').array.splice(idx, 0, page);
    this.ascend(pageTree => {
      pageTree.get('Count').number += 1;
    });
    return this;
  };

  // TODO: Pass a "stop" callback to allow "visit" to end traversal early
  // TODO: Allow for optimized tree search given an index
  traverse = (visit: (Kid, PDFIndirectReference<Kid>) => any) => {
    if (this.get('Kids').array.length === 0) return this;

    this.get('Kids').forEach(kidRef => {
      const kid: Kid = this.lookup(kidRef);
      visit(kid, kidRef);
      if (kid.is(PDFPageTree)) kid.traverse(visit);
    });
    return this;
  };

  traverseRight = (visit: (Kid, PDFIndirectReference<Kid>) => any) => {
    if (this.get('Kids').array.length === 0) return this;

    const lastKidRef = _.last(this.get('Kids').array);
    const lastKid: Kid = this.lookup(lastKidRef);
    visit(lastKid, lastKidRef);
    if (lastKid.is(PDFPageTree)) lastKid.traverseRight(visit);
    return this;
  };

  ascend = (visit: PDFPageTree => any, visitSelf?: boolean = true) => {
    if (visitSelf) visit(this);
    if (!this.get('Parent')) return;
    const parent: PDFPageTree = this.lookup(this.get('Parent'));
    visit(parent);
    parent.ascend(visit, false);
  };
}

export default PDFPageTree;
