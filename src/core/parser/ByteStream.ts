import CharCodes from 'src/core/syntax/CharCodes';

const LineEndings = [
  CharCodes.Newline,
  CharCodes.FormFeed,
  CharCodes.CarriageReturn,
];

// TODO: See how line/col tracking affects performance
class ByteStream {
  static of = (bytes: Uint8Array) => new ByteStream(bytes);

  private readonly bytes: Uint8Array;
  private readonly length: number;

  private idx = 0;
  private line = 0;
  private column = 0;

  constructor(bytes: Uint8Array) {
    this.bytes = bytes;
    this.length = this.bytes.length;
  }

  moveTo(offset: number): void {
    this.idx = offset;
  }

  next(): number {
    const byte = this.bytes[this.idx++];
    if (LineEndings.includes(byte)) {
      this.line += 1;
      this.column = 0;
    } else {
      this.column += 1;
    }
    return byte;
  }

  peek(): number {
    return this.bytes[this.idx];
  }

  peekAhead(steps: number) {
    return this.bytes[this.idx + steps];
  }

  peekAt(offset: number) {
    return this.bytes[offset];
  }

  done(): boolean {
    return this.idx >= this.length;
  }

  offset(): number {
    return this.idx;
  }

  slice(start: number, end: number): Uint8Array {
    return this.bytes.slice(start, end);
  }

  position(): { line: number; column: number } {
    return { line: this.line, column: this.column };
  }
}

export default ByteStream;
