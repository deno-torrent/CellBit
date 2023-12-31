import { Buffer } from 'std/io/buffer.ts'

export class SimpleBuffer extends Buffer {
  readBytes(len: number): Uint8Array {
    if (this.length === 0) {
      throw new Error('Buffer is empty')
    }

    if (len > this.length) {
      throw new Error('Buffer is not enough')
    }

    const bytes = new Uint8Array(len)
    this.readSync(bytes)
    return bytes
  }

  readByte(): number {
    if (this.length === 0) {
      throw new Error('Buffer is empty')
    }
    return this.readBytes(1)[0]
  }

  hasNext(): boolean {
    return this.length > 0
  }
}
