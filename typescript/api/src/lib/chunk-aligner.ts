import { Transform } from 'stream';

export class ChunkAligner extends Transform {
  private buffer = Buffer.alloc(0);
  private readonly chunkSize: number;

  constructor(chunkSize = 8192) {
    super();
    this.chunkSize = chunkSize;
  }

  _transform(chunk: Buffer, _encoding: BufferEncoding, callback: Function) {
    this.buffer = Buffer.concat([this.buffer, chunk]);

    while (this.buffer.length >= this.chunkSize) {
      this.push(this.buffer.subarray(0, this.chunkSize));
      this.buffer = this.buffer.subarray(this.chunkSize);
    }

    callback();
  }

  _flush(callback: Function) {
    if (this.buffer.length > 0) {
      this.push(this.buffer);
    }
    callback();
  }
}
