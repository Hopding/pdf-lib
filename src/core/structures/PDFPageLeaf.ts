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
  static readonly InheritableEntries = [
    'Resources',
    'MediaBox',
    'CropBox',
    'Rotate',
  ];

  static withContextAndParent = (context: PDFContext, parent: PDFRef) => {
    const dict = new Map();
    dict.set(PDFName.Type, PDFName.Page);
    dict.set(PDFName.Parent, parent);
    dict.set(PDFName.Resources, context.obj({}));
    dict.set(PDFName.MediaBox, context.obj([0, 0, 612, 792]));
    return new PDFPageLeaf(dict, context, false);
  };

  static fromMapWithContext = (
    map: DictMap,
    context: PDFContext,
    autoNormalizeCTM = true,
  ) => new PDFPageLeaf(map, context, autoNormalizeCTM);

  private normalized = false;
  private readonly autoNormalizeCTM: boolean;

  private constructor(
    map: DictMap,
    context: PDFContext,
    autoNormalizeCTM = true,
  ) {
    super(map, context);
    this.autoNormalizeCTM = autoNormalizeCTM;
  }

  clone(context?: PDFContext): PDFPageLeaf {
    const clone = PDFPageLeaf.fromMapWithContext(
      new Map(),
      context || this.context,
      this.autoNormalizeCTM,
    );
    const entries = this.entries();
    for (let idx = 0, len = entries.length; idx < len; idx++) {
      const [key, value] = entries[idx];
      clone.set(key, value);
    }
    return clone;
  }

  Parent(): PDFPageTree | undefined {
    return this.lookupMaybe(PDFName.Parent, PDFDict) as PDFPageTree | undefined;
  }

  Contents(): PDFStream | PDFArray | undefined {
    return this.lookup(PDFName.of('Contents')) as
      | PDFStream
      | PDFArray
      | undefined;
  }

  Annots(): PDFArray | undefined {
    return this.lookupMaybe(PDFName.Annots, PDFArray);
  }

  BleedBox(): PDFArray | undefined {
    return this.lookupMaybe(PDFName.BleedBox, PDFArray);
  }

  TrimBox(): PDFArray | undefined {
    return this.lookupMaybe(PDFName.TrimBox, PDFArray);
  }

  ArtBox(): PDFArray | undefined {
    return this.lookupMaybe(PDFName.ArtBox, PDFArray);
  }

  Resources(): PDFDict | undefined {
    const dictOrRef = this.getInheritableAttribute(PDFName.Resources);
    return this.context.lookupMaybe(dictOrRef, PDFDict);
  }

  MediaBox(): PDFArray {
    const arrayOrRef = this.getInheritableAttribute(PDFName.MediaBox);
    return this.context.lookup(arrayOrRef, PDFArray);
  }

  CropBox(): PDFArray | undefined {
    const arrayOrRef = this.getInheritableAttribute(PDFName.CropBox);
    return this.context.lookupMaybe(arrayOrRef, PDFArray);
  }

  Rotate(): PDFNumber | undefined {
    const numberOrRef = this.getInheritableAttribute(PDFName.Rotate);
    return this.context.lookupMaybe(numberOrRef, PDFNumber);
  }

  getInheritableAttribute(name: PDFName): PDFObject | undefined {
    let attribute: PDFObject | undefined;
    this.ascend((node) => {
      if (!attribute) attribute = node.get(name);
    });
    return attribute;
  }

  setParent(parentRef: PDFRef): void {
    this.set(PDFName.Parent, parentRef);
  }

  addContentStream(contentStreamRef: PDFRef): void {
    const Contents = this.normalizedEntries().Contents || this.context.obj([]);
    this.set(PDFName.Contents, Contents);
    Contents.push(contentStreamRef);
  }

  wrapContentStreams(startStream: PDFRef, endStream: PDFRef): boolean {
    const Contents = this.Contents();
    if (Contents instanceof PDFArray) {
      Contents.insert(0, startStream);
      Contents.push(endStream);
      return true;
    }
    return false;
  }

  addAnnot(annotRef: PDFRef): void {
    const { Annots } = this.normalizedEntries();
    Annots.push(annotRef);
  }

  removeAnnot(annotRef: PDFRef) {
    const { Annots } = this.normalizedEntries();
    const index = Annots.indexOf(annotRef);
    if (index !== undefined) {
      Annots.remove(index);
    }
  }

  setFontDictionary(name: PDFName, fontDictRef: PDFRef): void {
    const { Font } = this.normalizedEntries();
    Font.set(name, fontDictRef);
  }

  newFontDictionaryKey(tag: string): PDFName {
    const { Font } = this.normalizedEntries();
    return Font.uniqueKey(tag);
  }

  newFontDictionary(tag: string, fontDictRef: PDFRef): PDFName {
    const key = this.newFontDictionaryKey(tag);
    this.setFontDictionary(key, fontDictRef);
    return key;
  }

  setXObject(name: PDFName, xObjectRef: PDFRef): void {
    const { XObject } = this.normalizedEntries();
    XObject.set(name, xObjectRef);
  }

  newXObjectKey(tag: string): PDFName {
    const { XObject } = this.normalizedEntries();
    return XObject.uniqueKey(tag);
  }

  newXObject(tag: string, xObjectRef: PDFRef): PDFName {
    const key = this.newXObjectKey(tag);
    this.setXObject(key, xObjectRef);
    return key;
  }

  setExtGState(name: PDFName, extGStateRef: PDFRef | PDFDict): void {
    const { ExtGState } = this.normalizedEntries();
    ExtGState.set(name, extGStateRef);
  }

  newExtGStateKey(tag: string): PDFName {
    const { ExtGState } = this.normalizedEntries();
    return ExtGState.uniqueKey(tag);
  }

  newExtGState(tag: string, extGStateRef: PDFRef | PDFDict): PDFName {
    const key = this.newExtGStateKey(tag);
    this.setExtGState(key, extGStateRef);
    return key;
  }

  ascend(visitor: (node: PDFPageTree | PDFPageLeaf) => any): void {
    visitor(this);
    const Parent = this.Parent();
    if (Parent) Parent.ascend(visitor);
  }

  normalize() {
    if (this.normalized) return;

    const { context } = this;

    const contentsRef = this.get(PDFName.Contents);
    const contents = this.context.lookup(contentsRef);
    if (contents instanceof PDFStream) {
      this.set(PDFName.Contents, context.obj([contentsRef]));
    }

    if (this.autoNormalizeCTM) {
      this.wrapContentStreams(
        this.context.getPushGraphicsStateContentStream(),
        this.context.getPopGraphicsStateContentStream(),
      );
    }

    // TODO: Clone `Resources` if it is inherited
    const dictOrRef = this.getInheritableAttribute(PDFName.Resources);
    const Resources =
      context.lookupMaybe(dictOrRef, PDFDict) || context.obj({});
    this.set(PDFName.Resources, Resources);

    // TODO: Clone `Font` if it is inherited
    const Font =
      Resources.lookupMaybe(PDFName.Font, PDFDict) || context.obj({});
    Resources.set(PDFName.Font, Font);

    // TODO: Clone `XObject` if it is inherited
    const XObject =
      Resources.lookupMaybe(PDFName.XObject, PDFDict) || context.obj({});
    Resources.set(PDFName.XObject, XObject);

    // TODO: Clone `ExtGState` if it is inherited
    const ExtGState =
      Resources.lookupMaybe(PDFName.ExtGState, PDFDict) || context.obj({});
    Resources.set(PDFName.ExtGState, ExtGState);

    const Annots = this.Annots() || context.obj([]);
    this.set(PDFName.Annots, Annots);

    this.normalized = true;
  }

  normalizedEntries() {
    this.normalize();
    const Annots = this.Annots()!;
    const Resources = this.Resources()!;
    const Contents = this.Contents() as PDFArray | undefined;
    return {
      Annots,
      Resources,
      Contents,
      Font: Resources.lookup(PDFName.Font, PDFDict),
      XObject: Resources.lookup(PDFName.XObject, PDFDict),
      ExtGState: Resources.lookup(PDFName.ExtGState, PDFDict),
    };
  }
}

export default PDFPageLeaf;
