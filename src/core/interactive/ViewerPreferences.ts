import PDFDict from 'src/core/objects/PDFDict';
import PDFName from 'src/core/objects/PDFName';
import PDFBool from 'src/core/objects/PDFBool';
import PDFContext from 'src/core/PDFContext';

class ViewerPreferences {
  readonly dict: PDFDict;

  static fromDict = (dict: PDFDict): ViewerPreferences =>
    new ViewerPreferences(dict);

  static create = (context: PDFContext) => {
    const dict = context.obj({});
    return new ViewerPreferences(dict);
  };

  protected constructor(dict: PDFDict) {
    this.dict = dict;
  }

  DisplayDocTitle(): PDFBool | undefined {
    const DisplayDocTitle = this.dict.lookup(PDFName.of('DisplayDocTitle'));
    if (DisplayDocTitle instanceof PDFBool) return DisplayDocTitle;
    return undefined;
  }

  getDisplayDocTitle(): boolean {
    return this.DisplayDocTitle()?.asBoolean() ?? false;
  }

  setDisplayDocTitle(displayTitle: boolean) {
    const DisplayDocTitle = this.dict.context.obj(displayTitle);
    this.dict.set(PDFName.of('DisplayDocTitle'), DisplayDocTitle);
  }
}

export default ViewerPreferences;
