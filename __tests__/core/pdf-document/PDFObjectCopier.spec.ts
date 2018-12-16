import { PDFObjectCopier, PDFObjectIndex } from 'core/pdf-document';
import {
  PDFArray,
  PDFBoolean,
  PDFDictionary,
  PDFHexString,
  PDFIndirectObject,
  PDFIndirectReference,
  PDFName,
  PDFNull,
  PDFNumber,
  PDFRawStream,
  PDFString,
} from 'core/pdf-objects';
import { PDFContentStream, PDFPage, PDFPageTree } from 'core/pdf-structures';

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
    expect(destIndex.index.size).toBe(2);

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
    expect(destIndex.index.size).toBe(2);

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
    expect(destIndex.index.size).toBe(2);

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

  it(`copies PDFIndirectReferences, including their indirect references`, () => {
    // Arrange
    const srcIndex = PDFObjectIndex.create();
    const origRef = PDFIndirectReference.forNumbers(21, 0);
    srcIndex.assign(
      origRef,
      PDFDictionary.from(
        {
          Foo: PDFString.fromString('stuff and things'),
          Bar: PDFIndirectReference.forNumbers(13, 0),
        },
        srcIndex,
      ),
    );

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
    const copiedRef = PDFObjectCopier.for(srcIndex, destIndex).copy(origRef);

    // Assert
    expect(destIndex.index.size).toBe(3);

    expect(copiedRef).not.toBe(origRef);
    expect(copiedRef).toBeInstanceOf(PDFIndirectReference);

    const origDeref = srcIndex.lookup<PDFDictionary>(origRef);
    const copiedDeref = destIndex.lookup<PDFDictionary>(copiedRef);

    expect(copiedDeref.get('Foo')).not.toBe(origDeref.get('Foo'));
    expect(copiedDeref.get('Foo')).toBeInstanceOf(PDFString);

    expect(copiedDeref.get('Bar')).not.toBe(origDeref.get('Bar'));
    expect(copiedDeref.get('Bar')).toBeInstanceOf(PDFIndirectReference);

    const srcBar = srcIndex.lookup<PDFArray>(origDeref.get('Bar'));
    const destBar = destIndex.lookup<PDFArray>(copiedDeref.get('Bar'));

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

  it(`copies individual PDFPage objects, without bringing along the whole page tree`, () => {
    // Arrange
    const srcIndex = PDFObjectIndex.create();

    const contentStreamRef = PDFIndirectReference.forNumbers(21, 0);
    const origPageRef = srcIndex.nextObjectNumber();
    const middlePageTreeRef = srcIndex.nextObjectNumber();
    const rootPageTreeRef = srcIndex.nextObjectNumber();

    const contentStream = PDFContentStream.of(PDFDictionary.from({}, srcIndex));

    const origPage = PDFPage.create(srcIndex, [250, 500])
      .addContentStreams(contentStreamRef)
      .set('Parent', middlePageTreeRef);

    const middlePageTree = PDFPageTree.createNode(
      rootPageTreeRef,
      PDFArray.fromArray([origPageRef], srcIndex),
      srcIndex,
    );

    const rectangle = PDFArray.fromArray(
      [
        PDFNumber.fromNumber(1),
        PDFNumber.fromNumber(2),
        PDFNumber.fromNumber(3),
        PDFNumber.fromNumber(4),
      ],
      srcIndex,
    );
    const rootPageTree = PDFPageTree.createRootNode(
      PDFArray.fromArray([middlePageTreeRef], srcIndex),
      srcIndex,
    )
      .set('Resources', PDFDictionary.from({}, srcIndex))
      .set('MediaBox', rectangle)
      .set('CropBox', rectangle)
      .set('Rotate', PDFNumber.fromNumber(180));

    srcIndex.assign(contentStreamRef, contentStream);
    srcIndex.assign(origPageRef, origPage);
    srcIndex.assign(middlePageTreeRef, middlePageTree);
    srcIndex.assign(rootPageTreeRef, rootPageTree);

    const destIndex = PDFObjectIndex.create();

    // Act
    const copiedPage = PDFObjectCopier.for(srcIndex, destIndex).copy(origPage);

    // Assert
    expect(destIndex.index.size).toBe(1);

    expect(copiedPage).not.toBe(origPage);
    expect(copiedPage).toBeInstanceOf(PDFPage);

    expect(copiedPage.Contents).not.toBe(origPage.Contents);
    expect(copiedPage.Contents).toBeInstanceOf(PDFArray);
    expect(copiedPage.Contents.array.length).toBe(1);

    expect(copiedPage.Contents.get(0)).not.toBe(origPage.Contents.get(0));
    expect(copiedPage.Contents.get(0)).toBeInstanceOf(PDFIndirectReference);

    expect(copiedPage.get('Resources')).not.toBe(rootPageTree.get('Resources'));
    expect(copiedPage.get('Resources')).toBeInstanceOf(PDFDictionary);

    expect(copiedPage.get('MediaBox')).not.toBe(rootPageTree.get('MediaBox'));
    expect(copiedPage.get('MediaBox')).toBeInstanceOf(PDFArray);

    expect(copiedPage.get('CropBox')).not.toBe(rootPageTree.get('CropBox'));
    expect(copiedPage.get('CropBox')).toBeInstanceOf(PDFArray);

    expect(copiedPage.get('Rotate')).not.toBe(rootPageTree.get('Rotate'));
    expect(copiedPage.get('Rotate')).toBeInstanceOf(PDFNumber);
  });

  it(`copies objects with cyclic references`, () => {
    // Arrange
    const srcIndex = PDFObjectIndex.create();

    const dictRef = srcIndex.nextObjectNumber();
    const arrayRef = srcIndex.nextObjectNumber();

    const dict = PDFDictionary.from({ Foo: arrayRef, Bar: dictRef }, srcIndex);
    const array = PDFArray.fromArray([dictRef, arrayRef], srcIndex);

    srcIndex.assign(dictRef, dict);
    srcIndex.assign(arrayRef, array);

    const destIndex = PDFObjectIndex.create();

    // Act
    const copiedDict = PDFObjectCopier.for(srcIndex, destIndex).copy(dict);

    // Assert
    expect(destIndex.index.size).toBe(srcIndex.index.size);
  });

  it(`copies all types of PDFObjects`, () => {
    // Arrange
    const srcIndex = PDFObjectIndex.create();
    const destIndex = PDFObjectIndex.create();
    const copier = PDFObjectCopier.for(srcIndex, destIndex);

    const origArray = PDFArray.fromArray([], srcIndex);
    const origBool = PDFBoolean.fromBool(true);
    const origDict = PDFDictionary.from({}, srcIndex);
    const origHexString = PDFHexString.fromString('ABC123');
    const origIndirectRef = srcIndex.assignNextObjectNumberTo(origBool);
    const origIndirectObj = PDFIndirectObject.of(origBool).setReference(
      origIndirectRef,
    );
    const origName = PDFName.from('QuxBaz');
    const origNull = PDFNull.instance;
    const origNumber = PDFNumber.fromNumber(21);
    const origRawStream = PDFRawStream.from(origDict, new Uint8Array([1, 2]));
    const origString = PDFString.fromString('Stuff and thingz');

    // Act
    const copiedArray = copier.copy(origArray);
    const copiedBool = copier.copy(origBool);
    const copiedDict = copier.copy(origDict);
    const copiedHexString = copier.copy(origHexString);
    const copiedIndirectObj = copier.copy(origIndirectObj);
    const copiedIndirectRef = copier.copy(origIndirectRef);
    const copiedName = copier.copy(origName);
    const copiedNull = copier.copy(origNull);
    const copiedNumber = copier.copy(origNumber);
    const copiedRawStream = copier.copy(origRawStream);
    const copiedString = copier.copy(origString);

    // Assert
    expect(copiedArray).not.toBe(origArray);
    expect(copiedArray).toBeInstanceOf(PDFArray);

    expect(copiedBool).not.toBe(origBool);
    expect(copiedBool).toBeInstanceOf(PDFBoolean);

    expect(copiedDict).not.toBe(origDict);
    expect(copiedDict).toBeInstanceOf(PDFDictionary);

    expect(copiedHexString).not.toBe(origHexString);
    expect(copiedHexString).toBeInstanceOf(PDFHexString);

    expect(copiedIndirectObj).not.toBe(origIndirectObj);
    expect(copiedIndirectObj).toBeInstanceOf(PDFIndirectObject);

    expect(copiedIndirectRef).toBe(origIndirectRef);
    expect(copiedIndirectRef).toBeInstanceOf(PDFIndirectReference);

    expect(copiedName).toBe(origName);
    expect(copiedName).toBeInstanceOf(PDFName);

    expect(copiedNull).toBe(origNull);
    expect(copiedNull).toBeInstanceOf(PDFNull);

    expect(copiedNumber).not.toBe(origNumber);
    expect(copiedNumber).toBeInstanceOf(PDFNumber);

    expect(copiedRawStream).not.toBe(origRawStream);
    expect(copiedRawStream).toBeInstanceOf(PDFRawStream);

    expect(copiedString).not.toBe(origString);
    expect(copiedString).toBeInstanceOf(PDFString);
  });
});
