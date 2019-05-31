import PDFDict from 'src/core/objects/PDFDict';
import PDFStream from 'src/core/objects/PDFStream';
import PDFOperator from 'src/core/operators/PDFOperator';
import PDFContext from 'src/core/PDFContext';
import CharCodes from 'src/core/syntax/CharCodes';

class PDFContentStream extends PDFStream {
  static of = (dict: PDFDict, operators: PDFOperator[]) =>
    new PDFContentStream(dict, operators);

  private readonly operators: PDFOperator[];

  private constructor(dict: PDFDict, operators: PDFOperator[]) {
    super(dict);
    this.operators = operators;
  }

  clone(context?: PDFContext): PDFContentStream {
    const operators = new Array(this.operators.length);
    for (let idx = 0, len = this.operators.length; idx < len; idx++) {
      operators[idx] = this.operators[idx].clone(context);
    }
    return PDFContentStream.of(this.dict.clone(context), operators);
  }

  getContentsString(): string {
    let value = '';
    for (let idx = 0, len = this.operators.length; idx < len; idx++) {
      value += `${this.operators[idx]}\n`;
    }
    return value;
  }

  getContents(): Uint8Array {
    const buffer = new Uint8Array(this.getContentsSize());
    let offset = 0;
    for (let idx = 0, len = this.operators.length; idx < len; idx++) {
      offset += this.operators[idx].copyBytesInto(buffer, offset);
      buffer[offset++] = CharCodes.Newline;
    }
    return buffer;
  }

  getContentsSize(): number {
    let size = 0;
    for (let idx = 0, len = this.operators.length; idx < len; idx++) {
      size += this.operators[idx].sizeInBytes() + 1;
    }
    return size;
  }
}

export default PDFContentStream;
