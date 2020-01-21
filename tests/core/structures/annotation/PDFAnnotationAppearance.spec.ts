import {
  PDFAnnotationAppearance,
  PDFContext,
  PDFDict,
  PDFName,
  PDFStream,
} from 'src/index';

describe('PDFAnnotationAppearance', () => {
  let context: PDFContext;
  let appearanceStreamOn: PDFStream;
  let appearanceStreamOff: PDFStream;
  let appearanceSubDict: PDFDict;
  let annotationAppearance: PDFAnnotationAppearance;

  beforeEach(() => {
    context = PDFContext.create();
    appearanceStreamOn = new PDFStream(
      PDFDict.fromMapWithContext(new Map(), context),
    );
    appearanceStreamOff = new PDFStream(
      PDFDict.fromMapWithContext(new Map(), context),
    );
    appearanceSubDict = PDFDict.fromMapWithContext(
      new Map([
        [PDFName.On, appearanceStreamOn],
        [PDFName.Off, appearanceStreamOff],
      ]),
      context,
    );
  });

  it('can return the normal appearance', () => {
    const appearanceDict = PDFDict.fromMapWithContext(
      new Map([[PDFName.N, appearanceSubDict]]),
      context,
    );
    annotationAppearance = PDFAnnotationAppearance.fromDict(appearanceDict);
    expect(annotationAppearance.N()).toBe(appearanceSubDict);
  });

  describe('can return the down appearance dict', () => {
    it('when it is provided', () => {
      const appearanceDict = PDFDict.fromMapWithContext(
        new Map([[PDFName.D, appearanceSubDict]]),
        context,
      );
      annotationAppearance = PDFAnnotationAppearance.fromDict(appearanceDict);
      expect(annotationAppearance.D()).toBe(appearanceSubDict);
    });

    it('when it defaults to the normal appearance', () => {
      const appearanceDict = PDFDict.fromMapWithContext(
        new Map([[PDFName.N, appearanceSubDict]]),
        context,
      );
      annotationAppearance = PDFAnnotationAppearance.fromDict(appearanceDict);
      expect(annotationAppearance.D()).toBe(appearanceSubDict);
    });
  });

  describe('can return the rollover appearance dict', () => {
    it('when it is provided', () => {
      const appearanceDict = PDFDict.fromMapWithContext(
        new Map([[PDFName.R, appearanceSubDict]]),
        context,
      );
      annotationAppearance = PDFAnnotationAppearance.fromDict(appearanceDict);
      expect(annotationAppearance.R()).toBe(appearanceSubDict);
    });

    it('when it defaults to the rollover appearance', () => {
      const appearanceDict = PDFDict.fromMapWithContext(
        new Map([[PDFName.N, appearanceSubDict]]),
        context,
      );
      annotationAppearance = PDFAnnotationAppearance.fromDict(appearanceDict);
      expect(annotationAppearance.R()).toBe(appearanceSubDict);
    });
  });
});
