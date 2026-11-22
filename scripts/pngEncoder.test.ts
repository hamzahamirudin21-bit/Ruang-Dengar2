import { test } from 'node:test'
import assert from 'node:assert/strict'
import { inflateSync } from 'node:zlib'
import { crc32, encodePng, gridToRgba } from './pngEncoder'
import type { PixelGrid } from '../src/ui/characters/pixelGrid'

function parseChunks(png: Buffer) {
  const chunks: { type: string; data: Buffer; crc: number; crcOk: boolean }[] = []
  let p = 8
  while (p < png.length) {
    const len = png.readUInt32BE(p)
    const type = png.toString('ascii', p + 4, p + 8)
    const data = png.subarray(p + 8, p + 8 + len)
    const crc = png.readUInt32BE(p + 8 + len)
    chunks.push({ type, data, crc, crcOk: crc === crc32(png.subarray(p + 4, p + 8 + len)) })
    p += 12 + len
  }
  return chunks
}

function sampleRgba(w: number, h: number): Uint8Array {
  const a = new Uint8Array(w * h * 4)
  for (let i = 0; i < a.length; i++) a[i] = (i * 37 + 11) & 0xff
  return a
}

test('crc32 cocok dengan vektor uji baku', () => {
  assert.equal(crc32(new TextEncoder().encode('123456789')), 0xcbf43926)
})

test('tanda tangan, IHDR, dan CRC semua chunk valid', () => {
  const png = encodePng(5, 3, sampleRgba(5, 3))
  assert.deepEqual([...png.subarray(0, 8)], [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const chunks = parseChunks(png)
  assert.deepEqual(chunks.map((c) => c.type), ['IHDR', 'IDAT', 'IEND'])
  assert.ok(chunks.every((c) => c.crcOk))
  const ihdr = chunks[0].data
  assert.equal(ihdr.readUInt32BE(0), 5)
  assert.equal(ihdr.readUInt32BE(4), 3)
  assert.equal(ihdr[8], 8)
  assert.equal(ihdr[9], 6)
})

test('data IDAT dapat diinflasi kembali ke piksel asli', () => {
  const w = 7
  const h = 4
  const rgba = sampleRgba(w, h)
  const raw = inflateSync(parseChunks(encodePng(w, h, rgba))[1].data)
  assert.equal(raw.length, (w * 4 + 1) * h)
  for (let y = 0; y < h; y++) {
    assert.equal(raw[y * (w * 4 + 1)], 0)
    const row = raw.subarray(y * (w * 4 + 1) + 1, (y + 1) * (w * 4 + 1))
    assert.deepEqual([...row], [...rgba.subarray(y * w * 4, (y + 1) * w * 4)])
  }
})

test('ukuran atau panjang data tidak valid ditolak', () => {
  assert.throws(() => encodePng(0, 1, new Uint8Array(0)))
  assert.throws(() => encodePng(2, 2, new Uint8Array(3)))
})

test('gridToRgba menskalakan sel dan menjadikan null transparan', () => {
  const grid: PixelGrid = { width: 2, height: 1, cells: ['#ff8000', null] } as PixelGrid
  const { width, height, rgba } = gridToRgba(grid, 3)
  assert.equal(width, 6)
  assert.equal(height, 3)
  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 6; x++) {
      const i = (y * 6 + x) * 4
      if (x < 3) assert.deepEqual([...rgba.subarray(i, i + 4)], [255, 128, 0, 255])
      else assert.deepEqual([...rgba.subarray(i, i + 4)], [0, 0, 0, 0])
    }
  }
})
