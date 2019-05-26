import PDFArray from 'src/core/objects/PDFArray';
import PDFDict, { DictMap } from 'src/core/objects/PDFDict';
import PDFName from 'src/core/objects/PDFName';
import PDFNumber from 'src/core/objects/PDFNumber';
import PDFObject from 'src/core/objects/PDFObject';
import PDFRef from 'src/core/objects/PDFRef';
import PDFStream from 'src/core/objects/PDFStream';
import PDFContext from 'src/core/PDFContext';
import PDFPageTree from 'src/core/structures/PDFPageTree';

class PDFPageLeaf extends PDFDict {
  static withContextAndParent = (context: PDFContext, parent: PDFRef) => {
    const dict = new Map();
    dict.set(PDFName.of('Type'), PDFName.of('Page'));
    dict.set(PDFName.of('Parent'), parent);
    dict.set(PDFName.of('Resources'), context.obj({}));
    dict.set(PDFName.of('MediaBox'), context.obj([0, 0, 612, 792]));
    return new PDFPageLeaf(dict, context);
  };

  static fromMapWithContext = (map: DictMap, context: PDFContext) =>
    new PDFPageLeaf(map, context);

  Parent(): PDFPageTree {
    return this.lookup(PDFName.of('Parent'), PDFDict) as PDFPageTree;
  }

  Contents(): PDFStream | PDFArray | undefined {
    return this.lookup(PDFName.of('Contents')) as
      | PDFStream
      | PDFArray
      | undefined;
  }

  Annots(): PDFArray | undefined {
    return this.lookup(PDFName.of('Annots')) as PDFArray | undefined;
  }

  BleedBox(): PDFArray | undefined {
    return this.lookup(PDFName.of('BleedBox')) as PDFArray | undefined;
  }

  TrimBox(): PDFArray | undefined {
    return this.lookup(PDFName.of('TrimBox')) as PDFArray | undefined;
  }

  Resources(): PDFDict {
    const dictOrRef = this.getInheritableAttribute(PDFName.of('Resources'));
    return this.context.lookup(dictOrRef, PDFDict);
  }

  MediaBox(): PDFArray {
    const arrayOrRef = this.getInheritableAttribute(PDFName.of('MediaBox'));
    return this.context.lookup(arrayOrRef, PDFArray);
  }

  CropBox(): PDFArray | undefined {
    const maybeArrayOrRef = this.getInheritableAttribute(PDFName.of('CropBox'));
    return this.context.lookup(maybeArrayOrRef) as PDFArray | undefined;
  }

  Rotate(): PDFNumber {
    const numberOrRef = this.getInheritableAttribute(PDFName.of('Rotate'));
    return this.context.lookup(numberOrRef, PDFNumber);
  }

  getInheritableAttribute(name: PDFName): PDFObject | undefined {
    let attribute: PDFObject | undefined;
    this.ascend((node) => {
      if (!attribute) attribute = node.get(name);
    });
    return attribute;
  }

  ascend(visitor: (node: PDFPageTree | PDFPageLeaf) => any): void {
    visitor(this);
    this.Parent().ascend(visitor);
  }
}

export default PDFPageLeaf;
