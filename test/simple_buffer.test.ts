import { assertEquals, assertThrows, assert } from 'std/assert/mod.ts'
import { SimpleBuffer } from '~/src/bytes/simple_buffer.ts'

Deno.test('simple_buffer readByte', () => {
  const bytes = Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8])
  const buffer = new SimpleBuffer(bytes)

  // readByte
  assertEquals(buffer.readByte(), 1)
  assertEquals(buffer.readByte(), 2)
  assertEquals(buffer.readByte(), 3)
  assertEquals(buffer.readByte(), 4)
  assertEquals(buffer.readByte(), 5)
  assertEquals(buffer.readByte(), 6)
  assertEquals(buffer.readByte(), 7)
  assertEquals(buffer.readByte(), 8)

  assertThrows(() => {
    buffer.readByte()
  })
})

Deno.test('simple_buffer readBytes', () => {
  const bytes = Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  const buffer = new SimpleBuffer(bytes)

  // readBytes
  assertEquals(buffer.readBytes(1), Uint8Array.from([1]))
  assertEquals(buffer.readBytes(2), Uint8Array.from([2, 3]))
  assertEquals(buffer.readBytes(3), Uint8Array.from([4, 5, 6]))
  assertEquals(buffer.readBytes(4), Uint8Array.from([7, 8, 9, 10]))

  assertThrows(() => {
    buffer.readBytes(1)
  })
})

Deno.test('simple_buffer hasNext', () => {
  const bytes = Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8])
  const buffer = new SimpleBuffer(bytes)

  // hasNext
  assertEquals(buffer.hasNext(), true)
  buffer.readBytes(8)
  assertEquals(buffer.hasNext(), false)
})
