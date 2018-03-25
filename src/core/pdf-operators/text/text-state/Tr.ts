/* eslint-disable new-cap */
import PDFOperator from 'core/pdf-operators/PDFOperator';

import { addStringToBuffer } from 'utils';
import { isNumber, validate } from 'utils/validate';

/**
 * Set the text rendering mode, Tmode, to render, which shall be an integer.
 * Initial value: 0.
 */
class Tr extends PDFOperator {
  public static of = (render: number) => new Tr(render);

  public render: number;

  constructor(render: number) {
    super();
    validate(render, isNumber, 'Tr operator arg "render" must be a number.');
    this.render = render;
  }

  public toString = (): string => `${this.render} Tr\n`;

  public bytesSize = () => this.toString().length;

  public copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default Tr;
