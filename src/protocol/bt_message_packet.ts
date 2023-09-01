import { BytesList } from 'std/bytes/bytes_list.ts'
import { SimpleBuffer } from '~/src/util/simple_buffer.ts'

/**
 * BitTorrent message packet.
 *
 * @see https://wiki.theory.org/BitTorrentSpecification#Messages
 */
export default class BTMessagePacket {
  #id?: IdType // 1 byte
  #payload?: Uint8Array // x bytes

  private constructor(id?: IdType, payload?: Uint8Array) {
    this.#id = id
    this.#payload = payload
  }

  static from(id: IdType, payload: Uint8Array): BTMessagePacket {
    return new BTMessagePacket(id, payload)
  }

  static fromUint8Array(bytes: Uint8Array): BTMessagePacket {
    // 4 bytes at least: 4 bytes length, keep-alive message has no id and payload, and its length is 0
    if (bytes.length < 4) {
      throw new Error('BTMessagePacket.fromUint8Array: invalid bytes length')
    }

    const buffer = new SimpleBuffer(bytes)

    // 4 bytes: length
    const lengthBytes = buffer.readBytes(4)

    // lengthBytes to number
    const length = new DataView(lengthBytes.buffer).getUint32(0)

    if (length === 0) {
      return new BTMessagePacket()
    }

    if (bytes.length < length) {
      throw new Error('BTMessagePacket.fromUint8Array: invalid bytes length')
    }

    // 1 byte: id
    const id = buffer.readByte()

    // x bytes: payload
    const payload = buffer.readBytes(length - 1)

    return new BTMessagePacket(id, payload)
  }

  length(): number {
    const idLength = this.#id ? 1 : 0
    const payloadLength = this.#payload ? this.#payload.length : 0
    return 4 + idLength + payloadLength
  }

  toUint8Array(): Uint8Array {
    const bytesList = new BytesList()

    // 4 bytes: length
    const lengthBytes = new Uint8Array(4)

    // use data view to write bytes
    const dataView = new DataView(lengthBytes.buffer)

    // 4 bytes = 4 * 8 bits = 32 bits(js number is 64 bits(8 bytes)), default is big endian
    dataView.setUint32(0, this.length())

    // add length bytes to bytes list
    bytesList.add(lengthBytes)

    // add id to bytes list
    if (this.#id) {
      bytesList.add(new Uint8Array([this.#id]))
    }

    // add payload to bytes list
    if (this.#payload) {
      bytesList.add(this.#payload)
    }

    return bytesList.concat()
  }
}

export enum IdType {
  CHOKE = 0, // tell peer to stop sending request messages
  UNCHOKE = 1, // tell peer to start sending request messages
  INTERESTED = 2, // tell peer that the client is interested in downloading a piece
  NOT_INTERESTED = 3, // tell peer that the client is not interested in downloading a piece
  HAVE = 4, // tell peer that the client has downloaded a piece
  BITFIELD = 5, // used to send a bitmap of the pieces that have and have not been downloaded
  REQUEST = 6, // request a block of data from a peer
  PIECE = 7, // deliver a block of data to a peer
  CANCEL = 8 // cancel a request for a block of data
}
