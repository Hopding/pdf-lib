// Required to prevent error from circular dependencies in this test
import 'core/pdf-objects';

import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';
import {
  PDFArray,
  PDFDictionary,
  PDFIndirectObject,
  PDFIndirectReference,
  PDFName,
  PDFNumber,
  PDFString,
} from 'core/pdf-objects';
import PDFOperators from 'core/pdf-operators';
import { PDFContentStream, PDFPage, PDFPageTree } from 'core/pdf-structures';
import { typedArrayFor } from 'utils';

describe(`PDFPageTree`, () => {
  it(`extends PDFDictionary`, () => {
    const dict = PDFDictionary.from(
      { foo: PDFString.fromString('bar') },
      PDFObjectIndex.create(),
    );
    expect(PDFPageTree.fromDict(dict)).toBeInstanceOf(PDFDictionary);
  });

  describe(`static "createRootNode" factory method`, () => {
    it(`requires a PDFArray<PDFIndirectReference> and PDFObjectIndex as its arguments`, () => {
      expect(() => PDFPageTree.createRootNode()).toThrowError(
        '"kids" must be a PDFArray',
      );
      expect(() => PDFPageTree.createRootNode('foo')).toThrowError(
        '"kids" must be a PDFArray',
      );

      const index = PDFObjectIndex.create();
      expect(() =>
        PDFPageTree.createRootNode(PDFArray.fromArray([], index)),
      ).toThrowError('"index" must be an instance of PDFObjectIndex');
      expect(
        PDFPageTree.createRootNode(PDFArray.fromArray([], index), index),
      ).toBeInstanceOf(PDFPageTree);
    });

    it(`returns a valid PDFPageTree object`, () => {
      const index = PDFObjectIndex.create();
      const kids = PDFArray.fromArray([], index);
      const pageTree = PDFPageTree.createRootNode(kids, index);

      expect(pageTree).toBeInstanceOf(PDFPageTree);
      expect(pageTree.get('Type')).toBe(PDFName.from('Pages'));
      expect(pageTree.get('Kids')).toBe(kids);
      expect(pageTree.get('Count')).toBeInstanceOf(PDFNumber);
      expect(pageTree.get('Count').number).toEqual(kids.array.length);
    });
  });

  describe(`static "fromDict" factory method`, () => {
    it(`requires a PDFDictionary as its argument`, () => {
      expect(() => PDFPageTree.fromDict()).toThrowError(
        '"dict" must be a PDFDictionary',
      );
      expect(() => PDFPageTree.fromDict('foo')).toThrowError(
        '"dict" must be a PDFDictionary',
      );
    });

    it(`returns a PDFPageTree`, () => {
      const dict = PDFDictionary.from(
        { foo: PDFString.fromString('foo') },
        PDFObjectIndex.create(),
      );
      expect(PDFPageTree.fromDict(dict)).toBeInstanceOf(PDFPageTree);
    });
  });

  describe(`"Kids" getter`, () => {
    it(`looks up and returns the "Kids" entry in the PDFPageTree`, () => {
      const index = PDFObjectIndex.create();
      const kids = PDFArray.fromArray([], index);

      index.set(PDFIndirectReference.forNumbers(0, 1), kids);
      const dict = PDFDictionary.from(
        { Kids: PDFIndirectReference.forNumbers(0, 1) },
        index,
      );

      const pageTree = PDFPageTree.fromDict(dict);
      expect(pageTree.Kids).toBe(kids);
    });
  });

  describe(`"Parent" getter`, () => {
    it(`looks up and returns the "Parent" entry in the PDFPageTree`, () => {
      const index = PDFObjectIndex.create();
      const kids = PDFArray.fromArray([], index);
      const parent = PDFPageTree.createRootNode(kids, index);

      index.set(PDFIndirectReference.forNumbers(0, 1), parent);

      const dict = PDFDictionary.from(
        { Parent: PDFIndirectReference.forNumbers(0, 1) },
        index,
      );

      const pageTree = PDFPageTree.fromDict(dict);
      expect(pageTree.Parent).toBe(parent);
    });
  });

  describe(`"Count" getter`, () => {
    it(`looks up and returns the "Count" entry in the PDFPageTree`, () => {
      const index = PDFObjectIndex.create();
      const count = PDFNumber.fromNumber(0);

      const dict = PDFDictionary.from({ Count: count }, index);

      const pageTree = PDFPageTree.fromDict(dict);
      expect(pageTree.Count).toBe(count);
    });
  });

  describe(`"addPage" method`, () => {
    it(`requires a PDFIndirectReference as its argument`, () => {
      const index = PDFObjectIndex.create();
      const kids = PDFArray.fromArray([], index);
      const pageTree = PDFPageTree.createRootNode(kids, index);

      expect(() => pageTree.addPage()).toThrowError(
        '"page" arg must be of type PDFIndirectReference<PDFPage>',
      );
    });

    it(`It adds a PDFIndirectReference to the PDFPageTree's Kids and increments the page hierarchy's Counts`, () => {
      const index = PDFObjectIndex.create();

      const parentKids = PDFArray.fromArray(
        [PDFIndirectReference.forNumbers(0, 2)],
        index,
      );
      const parent = PDFPageTree.createRootNode(parentKids, index);
      index.set(PDFIndirectReference.forNumbers(0, 1), parent);

      const kids = PDFArray.fromArray([], index);
      const pageTree = PDFPageTree.createNode(
        PDFIndirectReference.forNumbers(0, 1),
        kids,
        index,
      );
      index.set(PDFIndirectReference.forNumbers(0, 2), pageTree);

      const newPage = PDFPage.create(index, [500, 500]);
      index.set(PDFIndirectReference.forNumbers(0, 3), newPage);

      expect(parent.Count.number).toBe(1);
      expect(pageTree.Count.number).toBe(0);
      expect(kids.array).toEqual([]);

      pageTree.addPage(PDFIndirectReference.forNumbers(0, 3));

      expect(parent.Count.number).toBe(2);
      expect(pageTree.Count.number).toBe(1);
      expect(kids.array).toEqual([PDFIndirectReference.forNumbers(0, 3)]);
    });
  });

  describe(`"removePage" method`, () => {
    it(`requires a number as its argument`, () => {
      const index = PDFObjectIndex.create();
      const kids = PDFArray.fromArray([], index);
      const pageTree = PDFPageTree.createRootNode(kids, index);

      expect(() => pageTree.removePage()).toThrowError(
        '"idx" arg must be a Number',
      );
    });

    it(`It removes a PDFIndirectReference from the PDFPageTree's Kids and decrements the page hierarchy's Counts`, () => {
      const index = PDFObjectIndex.create();

      const parentKids = PDFArray.fromArray([], index);
      const parent = PDFPageTree.createRootNode(parentKids, index);
      parent.addPage(PDFIndirectReference.forNumbers(0, 2));
      index.set(PDFIndirectReference.forNumbers(0, 1), parent);

      const kids = PDFArray.fromArray([], index);
      const pageTree = PDFPageTree.createNode(
        PDFIndirectReference.forNumbers(0, 1),
        kids,
        index,
      );
      pageTree.addPage(PDFIndirectReference.forNumbers(0, 3));
      pageTree.addPage(PDFIndirectReference.forNumbers(0, 4));
      pageTree.addPage(PDFIndirectReference.forNumbers(0, 5));
      index.set(PDFIndirectReference.forNumbers(0, 2), pageTree);

      expect(parent.Count.number).toBe(4);
      expect(pageTree.Count.number).toBe(3);
      expect(kids.array).toEqual([
        PDFIndirectReference.forNumbers(0, 3),
        PDFIndirectReference.forNumbers(0, 4),
        PDFIndirectReference.forNumbers(0, 5),
      ]);

      pageTree.removePage(1);

      expect(parent.Count.number).toBe(3);
      expect(pageTree.Count.number).toBe(2);
      expect(kids.array).toEqual([
        PDFIndirectReference.forNumbers(0, 3),
        PDFIndirectReference.forNumbers(0, 5),
      ]);
    });
  });

  describe(`"insertPage" method`, () => {
    it(`requires a number and PDFIndirectReference as its arguments`, () => {
      const index = PDFObjectIndex.create();
      const kids = PDFArray.fromArray([], index);
      const pageTree = PDFPageTree.createRootNode(kids, index);

      expect(() => pageTree.insertPage()).toThrowError(
        '"idx" arg must be a Number',
      );
      expect(() => pageTree.insertPage(1)).toThrowError(
        '"page" arg must be of type PDFIndirectReference<PDFPage>',
      );
    });

    it(`It inserts a PDFIndirectReference into the PDFPageTree's Kids and increments the page hierarchy's Counts`, () => {
      const index = PDFObjectIndex.create();

      const parentKids = PDFArray.fromArray([], index);
      const parent = PDFPageTree.createRootNode(parentKids, index);
      parent.addPage(PDFIndirectReference.forNumbers(0, 2));
      index.set(PDFIndirectReference.forNumbers(0, 1), parent);

      const kids = PDFArray.fromArray([], index);
      const pageTree = PDFPageTree.createNode(
        PDFIndirectReference.forNumbers(0, 1),
        kids,
        index,
      );
      pageTree.addPage(PDFIndirectReference.forNumbers(0, 3));
      pageTree.addPage(PDFIndirectReference.forNumbers(0, 4));
      index.set(PDFIndirectReference.forNumbers(0, 2), pageTree);

      expect(parent.Count.number).toBe(3);
      expect(pageTree.Count.number).toBe(2);
      expect(kids.array).toEqual([
        PDFIndirectReference.forNumbers(0, 3),
        PDFIndirectReference.forNumbers(0, 4),
      ]);

      pageTree.insertPage(1, PDFIndirectReference.forNumbers(0, 5));

      expect(parent.Count.number).toBe(4);
      expect(pageTree.Count.number).toBe(3);
      expect(kids.array).toEqual([
        PDFIndirectReference.forNumbers(0, 3),
        PDFIndirectReference.forNumbers(0, 5),
        PDFIndirectReference.forNumbers(0, 4),
      ]);
    });
  });

  describe(`traversal methods:`, () => {
    const index = PDFObjectIndex.create();

    // R 0 1
    const root = PDFPageTree.createRootNode(
      PDFArray.fromArray([], index),
      index,
    );
    root.addPage(PDFIndirectReference.forNumbers(0, 2));
    root.addPage(PDFIndirectReference.forNumbers(0, 3));

    // R 0 2
    const pageTree1 = PDFPageTree.createNode(
      PDFIndirectReference.forNumbers(0, 1),
      PDFArray.fromArray([], index),
      index,
    );
    pageTree1.addPage(PDFIndirectReference.forNumbers(0, 5));

    // R 0 3
    const pageTree2 = PDFPageTree.createNode(
      PDFIndirectReference.forNumbers(0, 1),
      PDFArray.fromArray([], index),
      index,
    );
    pageTree2.addPage(PDFIndirectReference.forNumbers(0, 6));
    pageTree2.addPage(PDFIndirectReference.forNumbers(0, 7));
    pageTree2.addPage(PDFIndirectReference.forNumbers(0, 4));

    // R 0 4
    const pageTree3 = PDFPageTree.createNode(
      PDFIndirectReference.forNumbers(0, 3),
      PDFArray.fromArray([], index),
      index,
    );

    // R 0 4
    const page1 = PDFPage.create(index, [250, 500]);

    // R 0 6
    const page2 = PDFPage.create(index, [250, 500]);

    // R 0 7
    const page3 = PDFPage.create(index, [250, 500]);

    index.set(PDFIndirectReference.forNumbers(0, 1), root);
    index.set(PDFIndirectReference.forNumbers(0, 2), pageTree1);
    index.set(PDFIndirectReference.forNumbers(0, 3), pageTree2);
    index.set(PDFIndirectReference.forNumbers(0, 4), pageTree3);
    index.set(PDFIndirectReference.forNumbers(0, 5), page1);
    index.set(PDFIndirectReference.forNumbers(0, 6), page2);
    index.set(PDFIndirectReference.forNumbers(0, 7), page3);

    describe(`"traverse"`, () => {
      it(`invokes the "visit" callback for every child of the pageTree`, () => {
        const visit = jest.fn();
        root.traverse(visit);

        expect(visit.mock.calls).toEqual([
          [pageTree1, PDFIndirectReference.forNumbers(0, 2)],
          [page1, PDFIndirectReference.forNumbers(0, 5)],
          [pageTree2, PDFIndirectReference.forNumbers(0, 3)],
          [page2, PDFIndirectReference.forNumbers(0, 6)],
          [page3, PDFIndirectReference.forNumbers(0, 7)],
          [pageTree3, PDFIndirectReference.forNumbers(0, 4)],
        ]);
      });
    });

    describe(`"traverseRight"`, () => {
      it(`invokes the "visit" callback for the rightmost nodes of the pageTree`, () => {
        const visit = jest.fn();
        root.traverseRight(visit);

        expect(visit.mock.calls).toEqual([
          [pageTree2, PDFIndirectReference.forNumbers(0, 3)],
          [pageTree3, PDFIndirectReference.forNumbers(0, 4)],
        ]);
      });
    });

    describe(`"ascend"`, () => {
      it(`invokes the "visit" callback for the pageTree and all its parent nodes`, () => {
        const visit = jest.fn();
        pageTree3.ascend(visit);

        expect(visit.mock.calls).toEqual([[pageTree3], [pageTree2], [root]]);
      });
    });
  });
});
