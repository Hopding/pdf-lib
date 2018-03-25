/* tslint:disable:max-classes-per-file class-name */
import PDFOperator from 'core/pdf-operators/PDFOperator';

import { addStringToBuffer } from 'utils';
import { oneOf, validate } from 'utils/validate';

type RenderingIntents =
  | 'AbsoluteColorimetric'
  | 'RelativeColorimetric'
  | 'Saturation'
  | 'Perceptual';

/**
 * Set the colour rendering intent in the graphics state. The rendering intent
 * must be one of the following values:
 *  - AbsoluteColorimetric
 *  - RelativeColorimetric
 *  - Saturation
 *  - Perceptual
 */
class ri extends PDFOperator {
  public static of = (intent: RenderingIntents) => new ri(intent);

  public intent: RenderingIntents;

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

  public toString = (): string => `${this.intent} ri\n`;

  public bytesSize = (): number => this.toString().length;

  public copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default ri;
