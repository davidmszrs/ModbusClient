/**
 * Pack multibyte 8-bit or 16-bit values into Big-Endian Buffers
 *
 * Inspired by node-put:
 * https://github.com/substack/node-put
 *
 * @author David Meszaros
 */

export class BufferBuilder {
  private words: Array<any> = []
  private length = 0

  /**
   * Append an existing buffer
   * @param buf - Buffer to be appended
   */
  public put(buf: Buffer) {
    this.words.push({ buffer: buf })
    this.length += buf.length
    return this
  }

  /**
   * Append an 8-bit number to the buffer
   * @param x - value to be appended
   */
  public word8(x: number) {
    this.words.push({ bytes: 1, value: x })
    this.length += 1
    return this
  }

  /**
   * Append a 16-bit number to the buffer
   * @param x - value to be appended
   */
  public word16be(x: number) {
    this.words.push({ bytes: 2, value: x, endian: 'big' })
    this.length += 2
    return this
  }

  /**
   * Append a float to the buffer
   * @param x - float value to be appended
   */
  public floatle(x: number) {
    this.words.push({ bytes: 'float', endian: 'little', value: x })
    this.length += 4
    return this
  }

  /**
   * Return the buffer with all the appended values
   */
  public buffer() {
    const buf = Buffer.alloc(this.length)
    let offset = 0
    this.words.forEach(function (word) {
      if (word.buffer) {
        word.buffer.copy(buf, offset, 0)
        offset += word.buffer.length
      } else {
        const big = word.endian === 'big'
        const ix = big ? [(word.bytes - 1) * 8, -8] : [0, 8]

        for (let i = ix[0]; big ? i >= 0 : i < word.bytes * 8; i += ix[1]) {
          if (i >= 32) {
            buf[offset++] = Math.floor(word.value / Math.pow(2, i)) & 0xff
          } else {
            buf[offset++] = (word.value >> i) & 0xff
          }
        }
      }
    })
    return buf
  }
}
