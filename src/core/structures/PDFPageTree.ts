import PDFArray from 'src/core/objects/PDFArray';
import PDFDict, { DictMap } from 'src/core/objects/PDFDict';
import PDFName from 'src/core/objects/PDFName';
import PDFNumber from 'src/core/objects/PDFNumber';
import PDFRef from 'src/core/objects/PDFRef';
import PDFContext from 'src/core/PDFContext';

class PDFPageTree extends PDFDict {
  static withContextAndKidsAndCount = (
    context: PDFContext,
    kids: PDFRef | PDFArray,
    count: PDFRef | PDFNumber,
    parent?: PDFRef | PDFDict,
  ) => {
    const dict = new Map();
    dict.set(PDFName.of('Type'), PDFName.of('Pages'));
    dict.set(PDFName.of('Kids'), kids);
    dict.set(PDFName.of('Count'), count);
    if (parent) dict.set(PDFName.of('Parent'), parent);
    return new PDFPageTree(dict, context);
  };

  static fromMapWithContext = (map: DictMap, context: PDFContext) =>
    new PDFPageTree(map, context);

  Parent(): PDFDict | undefined {
    return this.lookup(PDFName.of('Parent')) as PDFDict | undefined;
  }

  Kids(): PDFArray {
    return this.lookup(PDFName.of('Kids'), PDFArray);
  }

  Count(): PDFNumber {
    return this.lookup(PDFName.of('Count'), PDFNumber);
  }
}

export default PDFPageTree;
