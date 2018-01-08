/* @flow */
/* eslint-disable prefer-destructuring */
import _ from 'lodash';

import {
  PDFObject,
  PDFDictionary,
  PDFIndirectObject,
  PDFIndirectReference,
} from '../pdf-objects';
import { PDFPage } from '.';
import { not } from '../../utils';
import {
  validate,
  isIndirectObjectOf,
  isInstance,
  isIdentity,
} from '../../utils/validate';

import type { Predicate } from '../../utils';

export type Kid = PDFPageTree | PDFPage;

class PDFPageTree extends PDFDictionary {
  static validKeys = Object.freeze(['Type', 'Parent', 'Kids', 'Count']);

  static from = (object: PDFDictionary): PDFPageTree =>
    new PDFPageTree(object, PDFPageTree.validKeys);

  addPage = (
    lookup: (PDFIndirectReference<Kid>) => PDFObject,
    page: PDFIndirectReference<PDFPage>,
  ) => {
    validate(
      page,
      isInstance(PDFIndirectReference),
      '"page" arg must be of type PDFIndirectReference<PDFPage>',
    );
    this.get('Kids').array.push(page);

    this.get('Count').number += 1;
    this.ascend(lookup, parent => {
      parent.get('Count').number += 1;
    });

    return this;
  };

  // removePage = (page: PDFPage) => {
  //   console.log(page);
  //   validate(
  //     page,
  //     isInstance(PDFPage),
  //     'PDFPageTree.removePage() required argument to be of type PDFPage',
  //   );
  //   const Kids = this.get('Kids').object;
  //   Kids.array = Kids.array.filter(indirectObj =>
  //     not(isIdentity(page))(indirectObj.pdfObject),
  //   );
  //   this.get('Count').number -= 1;
  //   return this;
  // };
  //

  insertPage = (
    lookup: (PDFIndirectReference<Kid>) => PDFObject,
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

    this.get('Count').number += 1;
    this.ascend(lookup, parent => {
      parent.get('Count').number += 1;
    });

    return this;
  };

  // TODO: Pass a "stop" callback to allow "visit" to end traversal early
  traverse = (
    lookup: (PDFIndirectReference<Kid>) => PDFObject,
    visit: (Kid, PDFIndirectReference<Kid>) => any,
  ) => {
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
    const lastKidRef = _.last(this.get('Kids').array);
    const lastKid: Kid = lookup(lastKidRef);
    visit(lastKid, lastKidRef);
    if (lastKid.is(PDFPageTree)) lastKid.traverseRight(lookup, visit);
    return this;
  };

  ascend = (
    lookup: (PDFIndirectReference<Kid>) => PDFObject,
    visit: PDFPageTree => any,
  ) => {
    if (!this.get('Parent')) return;
    const parent: PDFPageTree = lookup(this.get('Parent'));
    visit(parent);
    parent.ascend(lookup, visit);
  };
}

export default PDFPageTree;
