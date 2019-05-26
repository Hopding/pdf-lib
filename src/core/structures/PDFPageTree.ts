import PDFArray from 'src/core/objects/PDFArray';
import PDFDict, { DictMap } from 'src/core/objects/PDFDict';
import PDFName from 'src/core/objects/PDFName';
import PDFNumber from 'src/core/objects/PDFNumber';
import PDFRef from 'src/core/objects/PDFRef';
import PDFContext from 'src/core/PDFContext';

class PDFPageTree extends PDFDict {
  static withContext = (context: PDFContext, parent?: PDFRef) => {
    const dict = new Map();
    dict.set(PDFName.of('Type'), PDFName.of('Pages'));
    dict.set(PDFName.of('Kids'), context.obj([]));
    dict.set(PDFName.of('Count'), context.obj(0));
    if (parent) dict.set(PDFName.of('Parent'), parent);
    return new PDFPageTree(dict, context);
  };

  static fromMapWithContext = (map: DictMap, context: PDFContext) =>
    new PDFPageTree(map, context);

  Parent(): PDFPageTree | undefined {
    return this.lookup(PDFName.of('Parent')) as PDFPageTree | undefined;
  }

  Kids(): PDFArray {
    return this.lookup(PDFName.of('Kids'), PDFArray);
  }

  Count(): PDFNumber {
    return this.lookup(PDFName.of('Count'), PDFNumber);
  }

  pushTreeNode(treeRef: PDFRef): void {
    const Kids = this.Kids();
    Kids.push(treeRef);
  }

  pushLeafNode(leafRef: PDFRef): void {
    const Kids = this.Kids();
    Kids.push(leafRef);
    this.ascend((node) => {
      const Count = node.Count();
      node.set(PDFName.of('Count'), PDFNumber.of(Count.value() + 1));
    });
  }

  ascend(visitor: (node: PDFPageTree) => any): void {
    visitor(this);
    const Parent = this.Parent();
    if (Parent) Parent.ascend(visitor);
  }
}

export default PDFPageTree;
