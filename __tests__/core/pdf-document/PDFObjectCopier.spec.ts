import { PDFObjectCopier, PDFObjectIndex } from 'core/pdf-document';
import {
  PDFArray,
  PDFDictionary,
  PDFIndirectReference,
  PDFName,
  PDFNumber,
  PDFString,
} from 'core/pdf-objects';

describe(`PDFObjectCopier`, () => {
  it(`copies PDFDictionaries, including their indirect references`, () => {
    // Arrange
    const srcIndex = PDFObjectIndex.create();
    const origDict = PDFDictionary.from(
      {
        Foo: PDFString.fromString('stuff and things'),
        Bar: PDFIndirectReference.forNumbers(13, 0),
      },
      srcIndex,
    );
    srcIndex.assignNextObjectNumberTo(origDict);

    srcIndex.assign(
      PDFIndirectReference.forNumbers(13, 0),
      PDFArray.fromArray(
        [PDFNumber.fromNumber(1), PDFIndirectReference.forNumbers(17, 0)],
        srcIndex,
      ),
    );

    srcIndex.assign(
      PDFIndirectReference.forNumbers(17, 0),
      PDFDictionary.from({ Baz: PDFName.from('wallykazam') }, srcIndex),
    );

    const destIndex = PDFObjectIndex.create();

    // Act
    const copiedDict = PDFObjectCopier.for(srcIndex, destIndex).copy(origDict);

    // Assert
    expect(Array.from(destIndex.index.entries()).length).toBe(2);

    expect(copiedDict).not.toBe(origDict);
    expect(copiedDict).toBeInstanceOf(PDFDictionary);

    expect(copiedDict.get('Foo')).not.toBe(origDict.get('Foo'));
    expect(copiedDict.get('Foo')).toBeInstanceOf(PDFString);

    expect(copiedDict.get('Bar')).not.toBe(origDict.get('Bar'));
    expect(copiedDict.get('Bar')).toBeInstanceOf(PDFIndirectReference);

    const srcBar = srcIndex.lookup<PDFArray>(origDict.get('Bar'));
    const destBar = destIndex.lookup<PDFArray>(copiedDict.get('Bar'));

    expect(destBar).not.toBe(srcBar);
    expect(destBar).toBeInstanceOf(PDFArray);

    expect(destBar.get(0)).not.toBe(srcBar.get(0));
    expect(destBar.get(0)).toBeInstanceOf(PDFNumber);

    expect(destBar.get(1)).not.toBe(srcBar.get(1));
    expect(destBar.get(1)).toBeInstanceOf(PDFIndirectReference);

    const srcBar1 = srcIndex.lookup<PDFDictionary>(srcBar.get(1));
    const destBar1 = destIndex.lookup<PDFDictionary>(destBar.get(1));

    expect(destBar1).not.toBe(srcBar1);
    expect(destBar1).toBeInstanceOf(PDFDictionary);

    expect(destBar1.get('Baz')).toBe(srcBar1.get('Baz'));
    expect(destBar1.get('Baz')).toBeInstanceOf(PDFName);
  });
});
