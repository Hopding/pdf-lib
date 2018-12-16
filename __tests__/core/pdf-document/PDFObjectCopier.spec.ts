import { PDFObjectCopier, PDFObjectIndex } from 'core/pdf-document';
import {
  PDFArray,
  PDFDictionary,
  PDFIndirectReference,
  PDFName,
  PDFNumber,
  PDFRawStream,
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

  it(`copies PDFArrays, including their indirect references`, () => {
    // Arrange
    const srcIndex = PDFObjectIndex.create();
    const origArray = PDFArray.fromArray(
      [
        PDFString.fromString('stuff and things'),
        PDFIndirectReference.forNumbers(13, 0),
      ],
      srcIndex,
    );
    srcIndex.assignNextObjectNumberTo(origArray);

    srcIndex.assign(
      PDFIndirectReference.forNumbers(13, 0),
      PDFDictionary.from(
        {
          Foo: PDFNumber.fromNumber(1),
          Bar: PDFIndirectReference.forNumbers(17, 0),
        },
        srcIndex,
      ),
    );

    srcIndex.assign(
      PDFIndirectReference.forNumbers(17, 0),
      PDFArray.fromArray([PDFName.from('wallykazam')], srcIndex),
    );

    const destIndex = PDFObjectIndex.create();

    // Act
    const copiedArray = PDFObjectCopier.for(srcIndex, destIndex).copy(
      origArray,
    );

    // Assert
    expect(Array.from(destIndex.index.entries()).length).toBe(2);

    expect(copiedArray).not.toBe(origArray);
    expect(copiedArray).toBeInstanceOf(PDFArray);

    expect(copiedArray.get(0)).not.toBe(origArray.get(0));
    expect(copiedArray.get(0)).toBeInstanceOf(PDFString);

    expect(copiedArray.get(1)).not.toBe(origArray.get(1));
    expect(copiedArray.get(1)).toBeInstanceOf(PDFIndirectReference);

    const src1 = srcIndex.lookup<PDFDictionary>(origArray.get(1));
    const dest1 = destIndex.lookup<PDFDictionary>(copiedArray.get(1));

    expect(dest1).not.toBe(src1);
    expect(dest1).toBeInstanceOf(PDFDictionary);

    expect(dest1.get('Foo')).not.toBe(src1.get('Foo'));
    expect(dest1.get('Foo')).toBeInstanceOf(PDFNumber);

    expect(dest1.get('Bar')).not.toBe(src1.get('Bar'));
    expect(dest1.get('Bar')).toBeInstanceOf(PDFIndirectReference);

    const src1Bar = srcIndex.lookup<PDFArray>(src1.get('Bar'));
    const dest1Bar = destIndex.lookup<PDFArray>(dest1.get('Bar'));

    expect(dest1Bar).not.toBe(src1Bar);
    expect(dest1Bar).toBeInstanceOf(PDFArray);

    expect(dest1Bar.get(0)).toBe(src1Bar.get(0));
    expect(dest1Bar.get(0)).toBeInstanceOf(PDFName);
  });

  it(`copies PDFStreams, including their indirect references`, () => {
    // Arrange
    const srcIndex = PDFObjectIndex.create();
    const origStream = PDFRawStream.from(
      PDFDictionary.from(
        {
          Foo: PDFString.fromString('stuff and things'),
          Bar: PDFIndirectReference.forNumbers(13, 0),
        },
        srcIndex,
      ),
      new Uint8Array([1, 2, 3, 4, 5]),
    );
    srcIndex.assignNextObjectNumberTo(origStream);

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
    const copiedStream = PDFObjectCopier.for(srcIndex, destIndex).copy(
      origStream,
    );

    // Assert
    expect(Array.from(destIndex.index.entries()).length).toBe(2);

    expect(copiedStream).not.toBe(origStream);
    expect(copiedStream).toBeInstanceOf(PDFRawStream);

    expect(copiedStream.content).not.toBe(origStream.content);
    expect(copiedStream.content).toEqual(origStream.content);

    expect(copiedStream.dictionary.get('Foo')).not.toBe(
      origStream.dictionary.get('Foo'),
    );
    expect(copiedStream.dictionary.get('Foo')).toBeInstanceOf(PDFString);

    expect(copiedStream.dictionary.get('Bar')).not.toBe(
      origStream.dictionary.get('Bar'),
    );
    expect(copiedStream.dictionary.get('Bar')).toBeInstanceOf(
      PDFIndirectReference,
    );

    const srcBar = srcIndex.lookup<PDFArray>(origStream.dictionary.get('Bar'));
    const destBar = destIndex.lookup<PDFArray>(
      copiedStream.dictionary.get('Bar'),
    );

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
