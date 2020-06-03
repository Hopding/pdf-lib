import PDFDict from 'src/core/objects/PDFDict';
import PDFAcroChoice from 'src/core/acroform/PDFAcroChoice';
import PDFString from 'src/core/objects/PDFString';
import PDFHexString from 'src/core/objects/PDFHexString';
import PDFName from 'src/core/objects/PDFName';

class PDFAcroComboBox extends PDFAcroChoice {
  static fromDict = (dict: PDFDict) => new PDFAcroComboBox(dict);

  DA(): PDFString | PDFHexString | undefined {
    const da = this.dict.lookup(PDFName.of('DA'));
    if (da instanceof PDFString || da instanceof PDFHexString) return da;
    return undefined;
  }

  getDefaultAppearance(): string | undefined {
    return this.DA()?.decodeText() ?? '';
  }
}

export default PDFAcroComboBox;
