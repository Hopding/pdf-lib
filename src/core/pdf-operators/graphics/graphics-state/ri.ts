/* tslint:disable:max-classes-per-file class-name */
import PDFOperator from 'core/pdf-operators/PDFOperator';

import { addStringToBuffer } from 'utils';
import { oneOf, validate } from 'utils/validate';

export type RenderingIntents =
  | '/AbsoluteColorimetric'
  | '/RelativeColorimetric'
  | '/Saturation'
  | '/Perceptual';

/**
 * Set the colour rendering intent in the graphics state. The rendering intent
 * must be one of the following values:
 *  - AbsoluteColorimetric
 *  - RelativeColorimetric
 *  - Saturation
 *  - Perceptual
 */
class ri extends PDFOperator {
  static of = (intent: RenderingIntents) => new ri(intent);

  intent: RenderingIntents;

  // TODO: Should this be a PDFName?
  constructor(intent: RenderingIntents) {
    super();
    validate(
      intent,
      oneOf(
        '/AbsoluteColorimetric',
        '/RelativeColorimetric',
        '/Saturation',
        '/Perceptual',
      ),
      `ri operator arg "intent" must be one of: "AbsoluteColorimetric", "RelativeColorimetric", "Saturation", "Perceptual"`,
    );
    this.intent = intent;
  }

  toString = () => `${this.intent} ri\n`;

  bytesSize = () => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default ri;
