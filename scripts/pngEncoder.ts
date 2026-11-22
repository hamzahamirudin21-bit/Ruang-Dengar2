import { deflateSync } from 'node:zlib'
import type { PixelGrid } from '../src/ui/characters/pixelGrid'

const CRC_TABLE: Uint32Array = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

export function crc32(buf: Uint8Array): number {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type: string, data: Uint8Array): Buffer {
  const out = Buffer.alloc(12 + data.length)
  out.writeUInt32BE(data.length, 0)
  out.write(type, 4, 'ascii')
  out.set(data, 8)
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length)
  return out
}

/** Menyandikan RGBA 8-bit (width*height*4 byte) menjadi berkas PNG. */
export function encodePng(width: number, height: number, rgba: Uint8Array): Buffer {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
    throw new Error('Ukuran PNG tidak valid')
  }
  if (rgba.length !== width * height * 4) throw new Error('Panjang data RGBA tidak sesuai')
  const stride = width * 4
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0
    raw.set(rgba.subarray(y * stride, (y + 1) * stride), y * (stride + 1) + 1)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // kedalaman bit
  ihdr[9] = 6 // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', new Uint8Array(0)),
  ])
}

/** Mengubah PixelGrid menjadi RGBA dengan skala bilangan bulat (sel null transparan). */
export function gridToRgba(
  grid: PixelGrid,
  scale = 1,
): { width: number; height: number; rgba: Uint8Array } {
  const s = Math.max(1, Math.floor(scale))
  const width = grid.width * s
  const height = grid.height * s
  const rgba = new Uint8Array(width * height * 4)
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      const c = grid.cells[y * grid.width + x]
      if (!c) continue
      const r = parseInt(c.slice(1, 3), 16)
      const g = parseInt(c.slice(3, 5), 16)
      const b = parseInt(c.slice(5, 7), 16)
      for (let dy = 0; dy < s; dy++) {
        for (let dx = 0; dx < s; dx++) {
          const i = ((y * s + dy) * width + x * s + dx) * 4
          rgba[i] = r
          rgba[i + 1] = g
          rgba[i + 2] = b
          rgba[i + 3] = 255
        }
      }
    }
  }
  return { width, height, rgba }
}
