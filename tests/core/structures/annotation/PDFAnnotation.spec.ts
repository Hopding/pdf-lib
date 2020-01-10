import {
  DictMap,
  PDFAnnotation,
  PDFContext,
  PDFDict,
  PDFName,
  PDFObject,
  PDFString
} from 'src/index';

describe('PDFAcroField', () => {
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

  describe('can return the page reference', () => {
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
});
