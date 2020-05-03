import PDFDict from 'src/core/objects/PDFDict';
import { PDFAcroTerminal } from 'src/core/acroform';

// TODO: Handle setting stuff with Opts instead of Values

export enum AcroButtonFlags {
  NoToggleToOff = 15 - 1,
  Radio = 16 - 1,
  PushButton = 17 - 1,
  RadiosInUnison = 26 - 1,
}

// TODO: Create factory function to avoid intermediate objects and circular
//       dependencies if possible
class PDFAcroButton extends PDFAcroTerminal {
  static fromDict = (dict: PDFDict) => new PDFAcroButton(dict);

  isPushButton(): boolean {
    return this.hasFlag(AcroButtonFlags.PushButton);
  }

  isRadioButton(): boolean {
    return this.hasFlag(AcroButtonFlags.Radio);
  }

  isCheckBoxButton(): boolean {
    return !this.isPushButton() && !this.isRadioButton();
  }
}

export default PDFAcroButton;
