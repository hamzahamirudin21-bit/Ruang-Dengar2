function cleanName(name: string): string {
  const n = typeof name === 'string' ? name.trim() : ''
  return n || 'mahasiswa'
}

/** Teks alternatif potret mahasiswa; selalu memuat nama. */
export function portraitAltText(name: string): string {
  return `Potret ${cleanName(name)}`
}

/** Teks alternatif kartu karakter; memuat nomor dan nama. */
export function cardAltText(number: string, name: string): string {
  const num = typeof number === 'string' ? number.trim() : ''
  return num ? `Karakter ${num}: ${cleanName(name)}` : `Karakter: ${cleanName(name)}`
}
