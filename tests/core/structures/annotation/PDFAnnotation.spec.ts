import {
  DictMap,
  PDFAnnotation,
  PDFArray,
  PDFContext,
  PDFDict,
  PDFName,
  PDFNumber,
  PDFObject,
  PDFRectangle,
  PDFString,
} from 'src/index';

describe('PDFAnnotation', () => {
  let context: PDFContext;
  let dict: DictMap;

  beforeEach(() => {
    context = PDFContext.create();
    dict = new Map<PDFName, PDFObject>([
      [PDFName.Subtype, PDFName.Text]
    ]);
  });

  it('can be constructed from a PDFDict', () => {
    const annotationDict = PDFDict.fromMapWithContext(dict, context);
    const annotation = PDFAnnotation.fromDict(annotationDict);
    expect(annotation).toBeInstanceOf(PDFAnnotation);
  });

  describe('can return the annotation type', () => {
    it('when it is defined', () => {
      dict.set(PDFName.Type, PDFName.Text);
      const annotationDict = PDFDict.fromMapWithContext(dict, context);
      const annotation = PDFAnnotation.fromDict(annotationDict);
      expect(annotation.Type()).toEqual(PDFName.Text);
    });

    it('when it is undefined', () => {
      const annotationDict = PDFDict.fromMapWithContext(dict, context);
      const annotation = PDFAnnotation.fromDict(annotationDict);
      expect(annotation.Type()).toBe(undefined);
    });
  });

  it('can return the annotation subtype', () => {
    dict.set(PDFName.Subtype, PDFName.Text);
    const annotationDict = PDFDict.fromMapWithContext(dict, context);
    const annotation = PDFAnnotation.fromDict(annotationDict);
    expect(annotation.Subtype()).toEqual(PDFName.Text);
  });

  it('can return the annotation rectangle', () => {
    const rectangleArray = PDFArray.withContext(context);
    dict.set(PDFName.Rect, rectangleArray);
    const annotationDict = PDFDict.fromMapWithContext(dict, context);
    const annotation = PDFAnnotation.fromDict(annotationDict);
    expect(annotation.Rect()).toBeInstanceOf(PDFRectangle);
  });

  describe('can return the annotation contents', () => {
    it('when defined', () => {
      dict.set(PDFName.Contents, PDFString.of('hello'));
      const annotationDict = PDFDict.fromMapWithContext(dict, context);
      const annotation = PDFAnnotation.fromDict(annotationDict);
      expect(annotation.Contents()).toEqual(PDFString.of('hello'));
    });

    it('when undefined', () => {
      const annotationDict = PDFDict.fromMapWithContext(dict, context);
      const annotation = PDFAnnotation.fromDict(annotationDict);
      expect(annotation.Contents()).toBe(undefined);
    });
  });

  describe('can return the page dictionary', () => {
    it('when defined', () => {
      const pageDict = PDFDict.fromMapWithContext(new Map(), context);
      dict.set(PDFName.P, pageDict);
      const annotationDict = PDFDict.fromMapWithContext(dict, context);
      const annotation = PDFAnnotation.fromDict(annotationDict);
      expect(annotation.P()).toEqual(pageDict);
    });

    it('when undefined', () => {
      const annotationDict = PDFDict.fromMapWithContext(dict, context);
      const annotation = PDFAnnotation.fromDict(annotationDict);
      expect(annotation.P()).toBe(undefined);
    });
  });

  describe('can return the annotation name', () => {
    it('when defined', () => {
      dict.set(PDFName.NM, PDFString.of('field1'));
      const annotationDict = PDFDict.fromMapWithContext(dict, context);
      const annotation = PDFAnnotation.fromDict(annotationDict);
      expect(annotation.NM()).toEqual(PDFString.of('field1'));
    });

    it('when undefined', () => {
      const annotationDict = PDFDict.fromMapWithContext(dict, context);
      const annotation = PDFAnnotation.fromDict(annotationDict);
      expect(annotation.NM()).toBe(undefined);
    });
  });

  describe('can return the modification date', () => {
    it('when defined', () => {
      const dateString = PDFString.of('D:199812231952-08\'00');
      dict.set(PDFName.M, dateString);
      const annotationDict = PDFDict.fromMapWithContext(dict, context);
      const annotation = PDFAnnotation.fromDict(annotationDict);
      expect(annotation.M()).toEqual(dateString);
    });

    it('when undefined', () => {
      const annotationDict = PDFDict.fromMapWithContext(dict, context);
      const annotation = PDFAnnotation.fromDict(annotationDict);
      expect(annotation.M()).toEqual(undefined);
    });
  });

  describe('can return the annotation flags', () => {
    it('when defined', () => {
      dict.set(PDFName.F, PDFNumber.of(1));
      const annotationDict = PDFDict.fromMapWithContext(dict, context);
      const annotation = PDFAnnotation.fromDict(annotationDict);
      expect(annotation.F()).toEqual(PDFNumber.of(1));
    });

    it('when undefined', () => {
      const annotationDict = PDFDict.fromMapWithContext(dict, context);
      const annotation = PDFAnnotation.fromDict(annotationDict);
      expect(annotation.F()).toBe(undefined);
    });
  });


  describe('can return the appearance dictionary', () => {
    it('when defined', () => {
      const appearanceDict = PDFDict.fromMapWithContext(new Map(), context);
      dict.set(PDFName.AP, appearanceDict);
      const annotationDict = PDFDict.fromMapWithContext(dict, context);
      const annotation = PDFAnnotation.fromDict(annotationDict);
      expect(annotation.AP()).toBe(appearanceDict);
    });

    it('when undefined', () => {
      const annotationDict = PDFDict.fromMapWithContext(dict, context);
      const annotation = PDFAnnotation.fromDict(annotationDict);
      expect(annotation.AP()).toBe(undefined);
    });
  });

  describe('can return the appearance state', () => {
    it('when defined', () => {
      dict.set(PDFName.AS, PDFName.of('normalAppearance'));
      const annotationDict = PDFDict.fromMapWithContext(dict, context);
      const annotation = PDFAnnotation.fromDict(annotationDict);
      expect(annotation.AS()).toEqual(PDFName.of('normalAppearance'));
    });

    it('when undefined', () => {
      const annotationDict = PDFDict.fromMapWithContext(dict, context);
      const annotation = PDFAnnotation.fromDict(annotationDict);
      expect(annotation.AS()).toBe(undefined);
    });
  });

  describe('can return the Border array', () => {
    it('when defined', () => {
      const borderArray = PDFArray.withContext(context);
      dict.set(PDFName.Border, borderArray);
      const annotationDict = PDFDict.fromMapWithContext(dict, context);
      const annotation = PDFAnnotation.fromDict(annotationDict);
      expect(annotation.Border()).toEqual(borderArray);
    });

    it('when undefined', () => {
      const annotationDict = PDFDict.fromMapWithContext(dict, context);
      const annotation = PDFAnnotation.fromDict(annotationDict);
      expect(annotation.Border()).toEqual(undefined);
    });
  });

  describe('can return the color array', () => {
    it('when defined', () => {
      const colorArray = PDFArray.withContext(context);
      dict.set(PDFName.C, colorArray);
      const annotationDict = PDFDict.fromMapWithContext(dict, context);
      const annotation = PDFAnnotation.fromDict(annotationDict);
      expect(annotation.C()).toEqual(colorArray);
    });

    it('when undefined', () => {
      const annotationDict = PDFDict.fromMapWithContext(dict, context);
      const annotation = PDFAnnotation.fromDict(annotationDict);
      expect(annotation.C()).toEqual(undefined);
    });
  });

  describe('can return the entry in the structural parent tree', () => {
    it('when defined', () => {
      dict.set(PDFName.StructParent, PDFNumber.of(1));
      const annotationDict = PDFDict.fromMapWithContext(dict, context);
      const annotation = PDFAnnotation.fromDict(annotationDict);
      expect(annotation.StructParent()).toEqual(PDFNumber.of(1));
    });

    it('when undefined', () => {
      const annotationDict = PDFDict.fromMapWithContext(dict, context);
      const annotation = PDFAnnotation.fromDict(annotationDict);
      expect(annotation.StructParent()).toBe(undefined);
    });
  });

  describe('can return the optional content', () => {
    it('when defined', () => {
      const optionalContentDict = PDFDict.fromMapWithContext(new Map(), context);
      dict.set(PDFName.OC, optionalContentDict);
      const annotationDict = PDFDict.fromMapWithContext(dict, context);
      const annotation = PDFAnnotation.fromDict(annotationDict);
      expect(annotation.OC()).toBe(optionalContentDict);
    });

    it('when undefined', () => {
      const annotationDict = PDFDict.fromMapWithContext(dict, context);
      const annotation = PDFAnnotation.fromDict(annotationDict);
      expect(annotation.OC()).toBe(undefined);
    });
  });
});
