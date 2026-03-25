import { isPDFInstance, PDFClasses } from '../../src/api/objects';
import { PDFNumber, PDFName, PDFNull } from '../../src/index';

describe('isPDFInstance', () => {
  const pStr = PDFName.of('Hola');
  const pNum = PDFNumber.of(125);

  it('identifies PDF instances', () => {
    expect(isPDFInstance(pStr, PDFClasses.PDFName)).toBeTruthy();
    expect(isPDFInstance(pNum, PDFClasses.PDFNumber)).toBeTruthy();
    expect(isPDFInstance(pNum, PDFClasses.PDFArray)).toBeFalsy();
    expect(isPDFInstance(pNum, PDFNumber as any)).toBeTruthy();
  });

  it('identifies instances as being superclases', () => {
    expect(isPDFInstance(pStr, PDFClasses.PDFObject)).toBeTruthy();
    expect(isPDFInstance(pNum, PDFClasses.PDFObject)).toBeTruthy();
  });

  it('properly handles PDFNull', () => {
    expect(isPDFInstance(pNum, PDFClasses.PDFNull)).toBeFalsy();
    expect(isPDFInstance(PDFNull, PDFClasses.PDFNull)).toBeTruthy();
  });

  it('does not fail on incorrect usage', () => {
    expect(isPDFInstance(pNum, (() => null) as any)).toBeFalsy();
  });
});
