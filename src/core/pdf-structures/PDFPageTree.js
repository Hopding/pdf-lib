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
import { error } from 'utils';
import { validate, isInstance } from 'utils/validate';

import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';

export type Kid = PDFPageTree | PDFPage;

const VALID_KEYS = Object.freeze(['Type', 'Parent', 'Kids', 'Count']);

class PDFPageTree extends PDFDictionary {
  static createRootNode = (
    kids: PDFArray<PDFIndirectReference<Kid>>,
    index: PDFObjectIndex,
  ): PDFPageTree => {
    validate(kids, isInstance(PDFArray), '"kids" must be a PDFArray');
    validate(index, isInstance(PDFObjectIndex), '"index" must be an instance of PDFObjectIndex');
    return new PDFPageTree(
      {
        Type: PDFName.from('Pages'),
        Kids: kids,
        Count: PDFNumber.fromNumber(kids.array.length),
      },
      index,
    );
  };

  static fromDict = (dict: PDFDictionary): PDFPageTree => {
    validate(dict, isInstance(PDFDictionary), '"dict" must be a PDFDictionary');
    return new PDFPageTree(dict.map, dict.index, VALID_KEYS);
  };

  getKids(): PDFArray<Kid> {
    return this.index.lookup(this.get('Kids'));
  }

  getParent(): ?PDFPageTree {
    return this.index.lookup(this.get('Parent'));
  }

  addPage = (page: PDFIndirectReference<PDFPage>) => {
    validate(
      page,
      isInstance(PDFIndirectReference),
      '"page" arg must be of type PDFIndirectReference<PDFPage>',
    );
    this.getKids().array.push(page);
    this.ascend(pageTree => {
      const Count = pageTree.get('Count');
      if (!Count) throw new Error('Missing PDFDictionary entry: "Count".');
      Count.number += 1;
    });
    return this;
  };

  removePage = (idx: number) => {
    validate(idx, _.isNumber, '"idx" arg must be a Number');
    this.getKids().array.splice(idx, 1);
    this.ascend(pageTree => {
      const Count = pageTree.get('Count');
      if (!Count) throw new Error('Missing PDFDictionary entry: "Count".');
      Count.number -= 1;
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
    this.getKids().array.splice(idx, 0, page);
    this.ascend(pageTree => {
      const Count = pageTree.get('Count');
      if (!Count) throw new Error('Missing PDFDictionary entry: "Count".');
      Count.number += 1;
    });
    return this;
  };

  // TODO: Pass a "stop" callback to allow "visit" to end traversal early
  // TODO: Allow for optimized tree search given an index
  traverse = (visit: (Kid, PDFIndirectReference<Kid>) => any) => {
    if (this.getKids().array.length === 0) return this;

    this.getKids().forEach(kidRef => {
      const kid: Kid = this.index.lookup(kidRef);
      visit(kid, kidRef);
      if (kid.is(PDFPageTree)) kid.traverse(visit);
    });
    return this;
  };

  traverseRight = (visit: (Kid, PDFIndirectReference<Kid>) => any) => {
    if (this.getKids().array.length === 0) return this;

    const lastKidRef = _.last(this.getKids().array);
    const lastKid: Kid = this.index.lookup(lastKidRef);
    visit(lastKid, lastKidRef);
    if (lastKid.is(PDFPageTree)) lastKid.traverseRight(visit);
    return this;
  };

  ascend = (visit: PDFPageTree => any, visitSelf?: boolean = true) => {
    if (visitSelf) visit(this);
    const Parent = this.getParent();
    if (!Parent) return;
    visit(Parent);
    Parent.ascend(visit, false);
  };
}

export default PDFPageTree;
