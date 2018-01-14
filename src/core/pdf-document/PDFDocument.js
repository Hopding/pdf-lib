/* @flow */
import _ from 'lodash';
import fontkit from 'fontkit';
import PNG from 'png-js';

import PNGImage from 'core/PNGImage';
import {
  PDFIndirectReference,
  PDFObject,
  PDFDictionary,
  PDFName,
  PDFNumber,
  PDFArray,
  PDFRawStream,
} from '../pdf-objects';
import { PDFCatalog, PDFHeader, PDFPage, PDFPageTree } from '../pdf-structures';
import { setCharAt } from 'utils';
import { error, validate, isInstance, isIdentity } from 'utils/validate';

const unsigned32Bit = '00000000000000000000000000000000';

type FontFlagOptions = {
  FixedPitch?: boolean,
  Serif?: boolean,
  Symbolic?: boolean,
  Script?: boolean,
  Nonsymbolic?: boolean,
  Italic?: boolean,
  AllCap?: boolean,
  SmallCap?: boolean,
  ForceBold?: boolean,
};
/* eslint-disable prettier/prettier */
// Doing this by bit-twiddling a string and then parsing gets around JavaScript
// converting the results of bit-shifting ops back into 64-bit integers.
const fontFlags = (options: FontFlagOptions) => {
  let flags = unsigned32Bit;
  if (options.FixedPitch)  flags = setCharAt(flags, 32 - 1, '1');
  if (options.Serif)       flags = setCharAt(flags, 32 - 2, '1');
  if (options.Symbolic)    flags = setCharAt(flags, 32 - 3, '1');
  if (options.Script)      flags = setCharAt(flags, 32 - 4, '1');
  if (options.Nonsymbolic) flags = setCharAt(flags, 32 - 6, '1');
  if (options.Italic)      flags = setCharAt(flags, 32 - 7, '1');
  if (options.AllCap)      flags = setCharAt(flags, 32 - 17, '1');
  if (options.SmallCap)    flags = setCharAt(flags, 32 - 18, '1');
  if (options.ForceBold)   flags = setCharAt(flags, 32 - 19, '1');
  return parseInt(flags, 2);
};
/* eslint-enable prettier/prettier */

class PDFDocument {
  header: PDFHeader = PDFHeader.forVersion(1, 7);
  catalog: PDFCatalog;
  index: Map<PDFIndirectReference<*>, PDFObject>;
  maxObjNum: number = 0;

  constructor(index: Map<PDFIndirectReference<*>, PDFObject>) {
    validate(
      index,
      isInstance(Map),
      'index must be a Map<PDFIndirectReference, PDFObject>',
    );
    index.forEach((obj, ref) => {
      if (obj.is(PDFCatalog)) this.catalog = obj;
      if (ref.objectNumber > this.maxObjNum) this.maxObjNum = ref.objectNumber;
    });
    this.index = index;
  }

  static fromIndex = (index: Map<PDFIndirectReference<*>, PDFObject>) =>
    new PDFDocument(index);

  lookup = (ref: PDFIndirectReference<*> | PDFObject) =>
    ref.is(PDFIndirectReference) ? this.index.get(ref) : ref;

  register = <T: PDFObject>(object: T): PDFIndirectReference<T> => {
    validate(object, isInstance(PDFObject), 'object must be a PDFObject');
    this.maxObjNum += 1;
    const ref = PDFIndirectReference.forNumbers(this.maxObjNum, 0);
    this.index.set(ref, object);
    return ref;
  };

  getPages = (): PDFPage[] => {
    const pageTree = this.catalog.getPageTree(this.lookup);
    const pages = [];
    pageTree.traverse(this.lookup, kid => {
      if (kid.is(PDFPage)) pages.push(kid);
    });
    return Object.freeze(pages);
  };

  addPage = (page: PDFPage) => {
    validate(page, isInstance(PDFPage), 'page must be a PDFPage');
    const pageTree = this.catalog.getPageTree(this.lookup);

    let lastPageTree = pageTree;
    let lastPageTreeRef = this.catalog.get('Pages');
    pageTree.traverseRight(this.lookup, (kid, ref) => {
      if (kid.is(PDFPageTree)) {
        lastPageTree = kid;
        lastPageTreeRef = ref;
      }
    });

    page.set('Parent', lastPageTreeRef);
    lastPageTree.addPage(this.lookup, this.register(page));
    return this;
  };

  // TODO: Clean up unused objects when possible after removing page from tree
  // TODO: Make sure "idx" is within required range
  removePage = (idx: number) => {
    validate(idx, _.isNumber, 'idx must be a number');
    const pageTreeRef = this.catalog.get('Pages');
    const pageTree = this.catalog.getPageTree(this.lookup);

    // TODO: Use a "stop" callback to avoid unneccesarily traversing whole page tree...
    let treeRef = pageTreeRef;
    let pageCount = 0;
    let kidNum = 0;
    pageTree.traverse(this.lookup, (kid, ref) => {
      if (pageCount !== idx) {
        if (kid.is(PDFPageTree)) kidNum = 0;
        if (kid.is(PDFPage)) {
          pageCount += 1;
          kidNum += 1;
          if (pageCount === idx) treeRef = kid.get('Parent');
        }
      }
    });

    const tree: PDFPageTree = this.lookup(treeRef);
    tree.removePage(this.lookup, kidNum);
    return this;
  };

  // TODO: Make sure "idx" is within required range
  insertPage = (idx: number, page: PDFPage) => {
    validate(idx, _.isNumber, 'idx must be a number');
    validate(page, isInstance(PDFPage), 'page must be a PDFPage');
    const pageTreeRef = this.catalog.get('Pages');
    const pageTree = this.catalog.getPageTree(this.lookup);

    // TODO: Use a "stop" callback to avoid unneccesarily traversing whole page tree...
    let treeRef = pageTreeRef;
    let pageCount = 0;
    let kidNum = 0;
    pageTree.traverse(this.lookup, (kid, ref) => {
      if (pageCount !== idx) {
        if (kid.is(PDFPageTree)) kidNum = 0;
        if (kid.is(PDFPage)) {
          pageCount += 1;
          kidNum += 1;
          if (pageCount === idx) treeRef = kid.get('Parent');
        }
      }
    });

    page.set('Parent', treeRef);
    const tree: PDFPageTree = this.lookup(treeRef);
    tree.insertPage(this.lookup, kidNum, this.register(page));
    return this;
  };

  // TODO: validate args...
  embedFont = (
    name: string,
    fontData: Uint8Array,
    flagOptions: FontFlagOptions,
  ): PDFIndirectReference<PDFDictionary> => {
    // TODO: Use diff header and stuff if is TrueType, not OpenType
    const fontStream = this.register(
      PDFRawStream.from(
        PDFDictionary.from({
          Subtype: PDFName.from('OpenType'),
          Length: PDFNumber.fromNumber(fontData.length),
          // TODO: Length1 might be required for TrueType fonts?
        }),
        fontData,
      ),
    );

    const font = fontkit.create(fontData);
    const fontDescriptor = this.register(
      PDFDictionary.from({
        Type: PDFName.from('FontDescriptor'),
        FontName: PDFName.from(name),
        Flags: PDFNumber.fromNumber(fontFlags(flagOptions)),
        FontBBox: PDFArray.fromArray([
          PDFNumber.fromNumber(font.bbox.minX),
          PDFNumber.fromNumber(font.bbox.minY),
          PDFNumber.fromNumber(font.bbox.maxX),
          PDFNumber.fromNumber(font.bbox.maxY),
        ]),
        ItalicAngle: PDFNumber.fromNumber(font.italicAngle),
        Ascent: PDFNumber.fromNumber(font.ascent),
        Descent: PDFNumber.fromNumber(font.descent),
        CapHeight: PDFNumber.fromNumber(font.capHeight),
        XHeight: PDFNumber.fromNumber(font.xHeight),
        // Not sure how to compute/find this, nor is anybody else really:
        // https://stackoverflow.com/questions/35485179/stemv-value-of-the-truetype-font
        StemV: PDFNumber.fromNumber(0),
        FontFile3: fontStream, // Use different key for TrueType
      }),
    );

    return this.register(
      PDFDictionary.from({
        Type: PDFName.from('Font'),
        // Handle the case of this actually being TrueType
        Subtype: PDFName.from('OpenType'),
        BaseFont: PDFName.from(name),
        FontDescriptor: fontDescriptor,
      }),
    );
  };

  // TODO: This should be moved to some XObject class, probably
  // TODO: Test this in the browser - might not work the same as in Node...
  addImage = (
    imageData: Uint8Array,
  ): Promise<PDFIndirectReference<PDFRawStream>> => {
    const pngImg = new PNGImage(imageData);
    return pngImg.embed(this);
  };
}

export default PDFDocument;
