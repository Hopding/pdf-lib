
/* eslint-disable new-cap */
import PDFOperator from 'core/pdf-operators/PDFOperator';

import { addStringToBuffer } from 'utils';
import { validate, oneOf } from 'utils/validate';

type RenderingIntents =
  | 'AbsoluteColorimetric'
  | 'RelativeColorimetric'
  | 'Saturation'
  | 'Perceptual';

/**
Set the colour rendering intent in the graphics state. The rendering intent
must be one of the following values:
 * AbsoluteColorimetric
 * RelativeColorimetric
 * Saturation
 * Perceptual
*/
class ri extends PDFOperator {
  intent: RenderingIntents;

  constructor(intent: RenderingIntents) {
    super();
    validate(
      intent,
      oneOf(
        'AbsoluteColorimetric',
        'RelativeColorimetric',
        'Saturation',
        'Perceptual',
      ),
      'ri operator arg "intent" must be one of: "AbsoluteColorimetric", ' +
        '"RelativeColorimetric", "Saturation", "Perceptual"',
    );
    this.intent = intent;
  }

  static of = (intent: RenderingIntents) => new ri(intent);

  toString = (): string => `${this.intent} ri\n`;

  bytesSize = (): number => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default ri;
