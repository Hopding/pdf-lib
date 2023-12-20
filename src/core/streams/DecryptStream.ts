import DecodeStream from './DecodeStream';
import { StreamType } from './Stream';

const chunkSize = 512;

type DecryptFnType = (
  arg1: Uint8Array | Uint8ClampedArray,
  arg2: boolean,
) => Uint8Array;

class DecryptStream extends DecodeStream {
  private stream: StreamType;
  private initialized: boolean;
  private nextChunk: Uint8Array | Uint8ClampedArray | null;
  private decrypt: DecryptFnType;

  constructor(
    stream: StreamType,
    decrypt: DecryptFnType,
    maybeLength?: number,
  ) {
    super(maybeLength);

    this.stream = stream;
    this.decrypt = decrypt;
    this.nextChunk = null;
    this.initialized = false;
  }

  readBlock() {
    let chunk;
    if (this.initialized) {
      chunk = this.nextChunk;
    } else {
      chunk = this.stream.getBytes(chunkSize);
      this.initialized = true;
    }
    if (!chunk || chunk.length === 0) {
      this.eof = true;
      return;
    }
    this.nextChunk = this.stream.getBytes(chunkSize);
    const hasMoreData = this.nextChunk && this.nextChunk.length > 0;

    const decrypt = this.decrypt;
    chunk = decrypt(chunk, !hasMoreData);

    const bufferLength = this.bufferLength,
      newLength = bufferLength + chunk.length,
      buffer = this.ensureBuffer(newLength);
    buffer.set(chunk, bufferLength);
    this.bufferLength = newLength;
  }
}

export default DecryptStream;
