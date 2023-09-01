import { BytesList } from 'std/bytes/bytes_list.ts'
import { SimpleBuffer } from '~/src/bytes/simple_buffer.ts'

/**
 * Handshake packet
 *
 * The handshake is a required message and must be the first message transmitted by the client. It is (49+len(pstr)) bytes long.
 *
 * @see https://wiki.theory.org/BitTorrentSpecification#Handshake
 */
export default class HandshakePacket {
  static #PSTRLEN = 0x13 // protocol string length
  static #PROTOCOL_STRING = 'BitTorrent protocol' // protocol string for 1.0, length = 19
  static #RESERVED = Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 0]) // 8 bytes reserved, all filled with 0

  #infoHash: Uint8Array // 20 bytes
  #peerId: Uint8Array // 20 bytes

  private constructor(infoHash: Uint8Array, peerId: Uint8Array) {
    // check infoHash length
    if (infoHash.length !== 20) {
      throw new Error('infoHash length must be 20 bytes')
    }

    // check peerId length
    if (peerId.length !== 20) {
      throw new Error('peerId length must be 20 bytes')
    }

    this.#infoHash = infoHash
    this.#peerId = peerId
  }

  /**
   * Create handshake packet
   * @param infoHash
   * @param peerId
   * @returns
   */
  static from(infoHash: Uint8Array, peerId: Uint8Array): HandshakePacket {
    return new HandshakePacket(infoHash, peerId)
  }

  /**
   * Parse handshake packet from bytes
   * @param bytes
   * @returns
   */
  static fromUint8Array(bytes: Uint8Array): HandshakePacket {
    // 1 byte: pstrlen + 19 bytes: pstr + 8 bytes: reserved + 20 bytes: info_hash + 20 bytes: peer_id
    if (bytes.length !== 68) {
      throw new Error('Handshake packet length must be 68 bytes')
    }

    // use SimpleBuffer to read bytes
    const buffer = new SimpleBuffer(bytes)

    // 1 byte: pstrlen
    const pstrLenBytes = buffer.readByte()
    if (pstrLenBytes !== this.#PSTRLEN) {
      throw new Error(`pstrLen value must be ${this.#PSTRLEN}`)
    }

    // 19 bytes: pstr
    const protocolStringBytes = buffer.readBytes(HandshakePacket.#PROTOCOL_STRING.length)
    if (new TextDecoder().decode(protocolStringBytes) !== this.#PROTOCOL_STRING) {
      throw new Error(`pstr value must be ${this.#PROTOCOL_STRING}`)
    }

    // 8 bytes: reserved
    const reservedBytes = buffer.readBytes(HandshakePacket.#RESERVED.length)
    if (reservedBytes.some((v) => v !== 0)) {
      throw new Error('Reserved must be filled with 0')
    }

    // 20 bytes: info_hash and 20 bytes: peer_id
    const infoHashBytes = buffer.readBytes(20)
    const peerIdBytes = buffer.readBytes(20)

    return this.from(infoHashBytes, peerIdBytes)
  }

  toUnit8Array(): Uint8Array {
    const bytesList = new BytesList()
    bytesList.add(Uint8Array.from([HandshakePacket.#PSTRLEN]))
    bytesList.add(new TextEncoder().encode(HandshakePacket.#PROTOCOL_STRING))
    bytesList.add(HandshakePacket.#RESERVED)
    bytesList.add(this.#infoHash)
    bytesList.add(this.#peerId)
    return bytesList.concat()
  }
}
