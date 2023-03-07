import {
  PDFArray,
  PDFBool,
  PDFContentStream,
  PDFContext,
  PDFDict,
  PDFHexString,
  PDFName,
  PDFNull,
  PDFNumber,
  PDFObjectCopier,
  PDFPageLeaf,
  PDFPageTree,
  PDFRawStream,
  PDFRef,
  PDFString,
} from '../../src/index';

describe(`PDFObjectCopier`, () => {
  it(`copies PDFDicts, including their indirect references`, () => {
    // Arrange
    const src = PDFContext.create();
    const origDict = src.obj({
      Foo: PDFString.of('stuff and things'),
      Bar: PDFRef.of(13),
    });
    src.register(origDict);

    src.assign(PDFRef.of(13), src.obj([1, PDFRef.of(17)]));

    src.assign(PDFRef.of(17), src.obj({ Baz: 'wallykazam' }));

    const dest = PDFContext.create();

    // Act
    const copiedDict = PDFObjectCopier.for(src, dest).copy(origDict);

    // Assert
    expect(dest.enumerateIndirectObjects().length).toBe(2);

    expect(copiedDict).not.toBe(origDict);
    expect(copiedDict).toBeInstanceOf(PDFDict);

    const Foo = PDFName.of('Foo');
    expect(copiedDict.get(Foo)).not.toBe(origDict.get(Foo));
    expect(copiedDict.get(Foo)).toBeInstanceOf(PDFString);

    const Bar = PDFName.of('Bar');
    expect(copiedDict.get(Bar)).not.toBe(origDict.get(Bar));
    expect(copiedDict.get(Bar)).toBeInstanceOf(PDFRef);

    const srcBar = src.lookup(origDict.get(Bar), PDFArray);
    const destBar = dest.lookup(copiedDict.get(Bar), PDFArray);

    expect(destBar).not.toBe(srcBar);
    expect(destBar).toBeInstanceOf(PDFArray);

    expect(destBar.get(0)).not.toBe(srcBar.get(0));
    expect(destBar.get(0)).toBeInstanceOf(PDFNumber);

    expect(destBar.get(1)).not.toBe(srcBar.get(1));
    expect(destBar.get(1)).toBeInstanceOf(PDFRef);

    const srcBar1 = src.lookup(srcBar.get(1), PDFDict);
    const destBar1 = dest.lookup(destBar.get(1), PDFDict);

    expect(destBar1).not.toBe(srcBar1);
    expect(destBar1).toBeInstanceOf(PDFDict);

    const Baz = PDFName.of('Baz');
    expect(destBar1.get(Baz)).toBe(srcBar1.get(Baz));
    expect(destBar1.get(Baz)).toBeInstanceOf(PDFName);
  });

  it(`copies PDFArrays, including their indirect references`, () => {
    // Arrange
    const src = PDFContext.create();
    const origArray = src.obj([
      PDFString.of('stuff and things'),
      PDFRef.of(13),
    ]);
    src.register(origArray);

    src.assign(PDFRef.of(13), src.obj({ Foo: 1, Bar: PDFRef.of(17) }));

    src.assign(PDFRef.of(17), src.obj(['wallykazam']));

    const dest = PDFContext.create();

    // Act
    const copiedArray = PDFObjectCopier.for(src, dest).copy(origArray);

    // Assert
    expect(dest.enumerateIndirectObjects().length).toBe(2);

    expect(copiedArray).not.toBe(origArray);
    expect(copiedArray).toBeInstanceOf(PDFArray);

    expect(copiedArray.get(0)).not.toBe(origArray.get(0));
    expect(copiedArray.get(0)).toBeInstanceOf(PDFString);

    expect(copiedArray.get(1)).not.toBe(origArray.get(1));
    expect(copiedArray.get(1)).toBeInstanceOf(PDFRef);

    const src1 = src.lookup(origArray.get(1), PDFDict);
    const dest1 = dest.lookup(copiedArray.get(1), PDFDict);

    expect(dest1).not.toBe(src1);
    expect(dest1).toBeInstanceOf(PDFDict);

    const Foo = PDFName.of('Foo');
    expect(dest1.get(Foo)).not.toBe(src1.get(Foo));
    expect(dest1.get(Foo)).toBeInstanceOf(PDFNumber);

    const Bar = PDFName.of('Bar');
    expect(dest1.get(Bar)).not.toBe(src1.get(Bar));
    expect(dest1.get(Bar)).toBeInstanceOf(PDFRef);

    const src1Bar = src.lookup(src1.get(Bar), PDFArray);
    const dest1Bar = dest.lookup(dest1.get(Bar), PDFArray);

    expect(dest1Bar).not.toBe(src1Bar);
    expect(dest1Bar).toBeInstanceOf(PDFArray);

    expect(dest1Bar.get(0)).toBe(src1Bar.get(0));
    expect(dest1Bar.get(0)).toBeInstanceOf(PDFName);
  });

  it(`copies PDFStreams, including their indirect references`, () => {
    // Arrange
    const src = PDFContext.create();
    const origStream = src.stream(new Uint8Array([1, 2, 3, 4, 5]), {
      Foo: PDFString.of('stuff and things'),
      Bar: PDFRef.of(13),
    });
    src.register(origStream);

    src.assign(PDFRef.of(13), src.obj([1, PDFRef.of(17)]));

    src.assign(PDFRef.of(17), src.obj({ Baz: 'wallykazam' }));

    const dest = PDFContext.create();

    // Act
    const copiedStream = PDFObjectCopier.for(src, dest).copy(origStream);

    // Assert
    expect(dest.enumerateIndirectObjects().length).toBe(2);

    expect(copiedStream).not.toBe(origStream);
    expect(copiedStream).toBeInstanceOf(PDFRawStream);

    expect(copiedStream.contents).not.toBe(origStream.contents);
    expect(copiedStream.contents).toEqual(origStream.contents);

    const Foo = PDFName.of('Foo');
    expect(copiedStream.dict.get(Foo)).not.toBe(origStream.dict.get(Foo));
    expect(copiedStream.dict.get(Foo)).toBeInstanceOf(PDFString);

    const Bar = PDFName.of('Bar');
    expect(copiedStream.dict.get(Bar)).not.toBe(origStream.dict.get(Bar));
    expect(copiedStream.dict.get(Bar)).toBeInstanceOf(PDFRef);

    const srcBar = src.lookup(origStream.dict.get(Bar), PDFArray);
    const destBar = dest.lookup(copiedStream.dict.get(Bar), PDFArray);

    expect(destBar).not.toBe(srcBar);
    expect(destBar).toBeInstanceOf(PDFArray);

    expect(destBar.get(0)).not.toBe(srcBar.get(0));
    expect(destBar.get(0)).toBeInstanceOf(PDFNumber);

    expect(destBar.get(1)).not.toBe(srcBar.get(1));
    expect(destBar.get(1)).toBeInstanceOf(PDFRef);

    const srcBar1 = src.lookup(srcBar.get(1), PDFDict);
    const destBar1 = dest.lookup(destBar.get(1), PDFDict);

    expect(destBar1).not.toBe(srcBar1);
    expect(destBar1).toBeInstanceOf(PDFDict);

    const Baz = PDFName.of('Baz');
    expect(destBar1.get(Baz)).toBe(srcBar1.get(Baz));
    expect(destBar1.get(Baz)).toBeInstanceOf(PDFName);
  });

  it(`copies PDFRefs, including their indirect references`, () => {
    // Arrange
    const src = PDFContext.create();
    const origRef = PDFRef.of(21);
    src.assign(
      origRef,
      src.obj({ Foo: PDFString.of('stuff and things'), Bar: PDFRef.of(13) }),
    );

    src.assign(PDFRef.of(13), src.obj([1, PDFRef.of(17)]));

    src.assign(PDFRef.of(17), src.obj({ Baz: 'wallykazam' }));

    const dest = PDFContext.create();

    // Act
    const copiedRef = PDFObjectCopier.for(src, dest).copy(origRef);

    // Assert
    expect(dest.enumerateIndirectObjects().length).toBe(3);

    expect(copiedRef).not.toBe(origRef);
    expect(copiedRef).toBeInstanceOf(PDFRef);

    const origDeref = src.lookup(origRef, PDFDict);
    const copiedDeref = dest.lookup(copiedRef, PDFDict);

    const Foo = PDFName.of('Foo');
    expect(copiedDeref.get(Foo)).not.toBe(origDeref.get(Foo));
    expect(copiedDeref.get(Foo)).toBeInstanceOf(PDFString);

    const Bar = PDFName.of('Bar');
    expect(copiedDeref.get(Bar)).not.toBe(origDeref.get(Bar));
    expect(copiedDeref.get(Bar)).toBeInstanceOf(PDFRef);

    const srcBar = src.lookup(origDeref.get(Bar), PDFArray);
    const destBar = dest.lookup(copiedDeref.get(Bar), PDFArray);

    expect(destBar).not.toBe(srcBar);
    expect(destBar).toBeInstanceOf(PDFArray);

    expect(destBar.get(0)).not.toBe(srcBar.get(0));
    expect(destBar.get(0)).toBeInstanceOf(PDFNumber);

    expect(destBar.get(1)).not.toBe(srcBar.get(1));
    expect(destBar.get(1)).toBeInstanceOf(PDFRef);

    const srcBar1 = src.lookup(srcBar.get(1), PDFDict);
    const destBar1 = dest.lookup(destBar.get(1), PDFDict);

    expect(destBar1).not.toBe(srcBar1);
    expect(destBar1).toBeInstanceOf(PDFDict);

    const Baz = PDFName.of('Baz');
    expect(destBar1.get(Baz)).toBe(srcBar1.get(Baz));
    expect(destBar1.get(Baz)).toBeInstanceOf(PDFName);
  });

  it(`copies individual PDFPageLeaf objects, without bringing along the whole page tree`, () => {
    // Arrange
    const src = PDFContext.create();

    const contentStreamRef = PDFRef.of(21);
    const origPageRef = src.nextRef();
    const middlePageTreeRef = src.nextRef();
    const rootPageTreeRef = src.nextRef();

    const contentStream = PDFContentStream.of(src.obj({}), []);

    const origPage = PDFPageLeaf.withContextAndParent(src, middlePageTreeRef);
    origPage.set(PDFName.of('Contents'), src.obj([contentStreamRef]));

    const middlePageTree = PDFPageTree.withContext(src, rootPageTreeRef);

    const rectangle = src.obj([1, 2, 3, 4]);
    const rootPageTree = PDFPageTree.withContext(src);
    rootPageTree.set(PDFName.of('Resources'), src.obj({}));
    rootPageTree.set(PDFName.of('MediaBox'), rectangle);
    rootPageTree.set(PDFName.of('CropBox'), rectangle);
    rootPageTree.set(PDFName.of('Rotate'), PDFNumber.of(180));

    rootPageTree.pushTreeNode(middlePageTreeRef);
    middlePageTree.pushLeafNode(origPageRef);

    src.assign(contentStreamRef, contentStream);
    src.assign(origPageRef, origPage);
    src.assign(middlePageTreeRef, middlePageTree);
    src.assign(rootPageTreeRef, rootPageTree);

    const dest = PDFContext.create();

    // Act
    const copiedPage = PDFObjectCopier.for(src, dest).copy(origPage);

    // Assert
    expect(dest.enumerateIndirectObjects().length).toBe(1);

    expect(copiedPage).not.toBe(origPage);
    expect(copiedPage).toBeInstanceOf(PDFPageLeaf);

    const Contents = copiedPage.Contents() as PDFArray;
    expect(Contents).not.toBe(origPage.Contents());
    expect(Contents).toBeInstanceOf(PDFArray);
    expect(Contents.size()).toBe(1);

    expect(Contents.get(0)).not.toBe((origPage.Contents() as PDFArray).get(0));
    expect(Contents.get(0)).toBeInstanceOf(PDFRef);

    const Resources = copiedPage.Resources();
    expect(Resources).not.toBe(rootPageTree.get(PDFName.of('Resources')));
    expect(Resources).toBeInstanceOf(PDFDict);

    const MediaBox = copiedPage.MediaBox();
    expect(MediaBox).not.toBe(rootPageTree.get(PDFName.of('MediaBox')));
    expect(MediaBox).toBeInstanceOf(PDFArray);

    const CropBox = copiedPage.CropBox();
    expect(CropBox).not.toBe(rootPageTree.get(PDFName.of('CropBox')));
    expect(CropBox).toBeInstanceOf(PDFArray);

    const Rotate = copiedPage.Rotate();
    expect(Rotate).not.toBe(rootPageTree.get(PDFName.of('Rotate')));
    expect(Rotate).toBeInstanceOf(PDFNumber);
  });

  it(`copies objects with cyclic references`, () => {
    // Arrange
    const src = PDFContext.create();

    const dictRef = src.nextRef();
    const arrayRef = src.nextRef();

    const dict = src.obj({ Foo: arrayRef, Bar: dictRef });
    const array = src.obj([dictRef, arrayRef]);

    src.assign(dictRef, dict);
    src.assign(arrayRef, array);

    const dest = PDFContext.create();

    // Act
    PDFObjectCopier.for(src, dest).copy(dict);

    // Assert
    expect(dest.enumerateIndirectObjects().length).toBe(
      src.enumerateIndirectObjects().length,
    );
  });

  it(`copies all types of PDFObjects`, () => {
    // Arrange
    const src = PDFContext.create();
    const dest = PDFContext.create();
    const copier = PDFObjectCopier.for(src, dest);

    const origArray = src.obj([]);
    const origBool = src.obj(true);
    const origDict = src.obj({});
    const origHexString = PDFHexString.of('ABC123');
    const origIndirectRef = src.register(origBool);
    const origName = src.obj('QuxBaz');
    const origNull = src.obj(null);
    const origNumber = src.obj(21);
    const origRawStream = src.stream(new Uint8Array([1, 2]));
    const origString = PDFString.of('Stuff and thingz');

    // Act
    const copiedArray = copier.copy(origArray);
    const copiedBool = copier.copy(origBool);
    const copiedDict = copier.copy(origDict);
    const copiedHexString = copier.copy(origHexString);
    const copiedIndirectRef = copier.copy(origIndirectRef);
    const copiedName = copier.copy(origName);
    const copiedNull = copier.copy(origNull);
    const copiedNumber = copier.copy(origNumber);
    const copiedRawStream = copier.copy(origRawStream);
    const copiedString = copier.copy(origString);

    // Assert
    expect(copiedArray).not.toBe(origArray);
    expect(copiedArray).toBeInstanceOf(PDFArray);

    expect(copiedBool).toBe(origBool);
    expect(copiedBool).toBeInstanceOf(PDFBool);

    expect(copiedDict).not.toBe(origDict);
    expect(copiedDict).toBeInstanceOf(PDFDict);

    expect(copiedHexString).not.toBe(origHexString);
    expect(copiedHexString).toBeInstanceOf(PDFHexString);

    expect(copiedIndirectRef).toBe(origIndirectRef);
    expect(copiedIndirectRef).toBeInstanceOf(PDFRef);

    expect(copiedName).toBe(origName);
    expect(copiedName).toBeInstanceOf(PDFName);

    expect(copiedNull).toBe(origNull);
    expect(copiedNull).toBe(PDFNull);

    expect(copiedNumber).not.toBe(origNumber);
    expect(copiedNumber).toBeInstanceOf(PDFNumber);

    expect(copiedRawStream).not.toBe(origRawStream);
    expect(copiedRawStream).toBeInstanceOf(PDFRawStream);

    expect(copiedString).not.toBe(origString);
    expect(copiedString).toBeInstanceOf(PDFString);
  });

  it(`copies objects with undefined references`, () => {
    // Arrange
    const src = PDFContext.create();
    const dest = PDFContext.create();
    const copier = PDFObjectCopier.for(src, dest);

    const origArray = src.obj([PDFRef.of(21)]);
    const origDict = src.obj({ Foo: PDFRef.of(21) });

    // Act
    const copiedArray = copier.copy(origArray);
    const copiedDict = copier.copy(origDict);

    // Assert
    expect(copiedArray).not.toBe(origArray);
    expect(copiedArray).toBeInstanceOf(PDFArray);
    expect(copiedArray.size()).toBe(1);
    expect(copiedArray.get(0)).toBe(PDFRef.of(1));

    expect(copiedDict).not.toBe(origDict);
    expect(copiedDict).toBeInstanceOf(PDFDict);
    expect(copiedDict.entries().length).toBe(1);
    expect(copiedDict.get(PDFName.of('Foo'))).toBe(PDFRef.of(1));
  });
});
