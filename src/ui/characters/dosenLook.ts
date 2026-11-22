import type { IdentityColorId } from './characterPalette'

/** Id slot aset dan id karakter untuk Dosen BK. */
export const DOSEN_ID = 'dosen'

/** Seluruh ciri visual Dosen BK dalam satu tabel data agar mudah diganti. */
export interface DosenLook {
  skinId: string
  hair: { colorId: string; style: 'rapi-pendek'; grey: string }
  glasses: { frame: string }
  blazer: { color: IdentityColorId; lapel: string }
  shirt: { base: string; shade: string; batik: { motif: 'parang'; color: string } }
  lanyard: { strap: string; card: string }
}

export const DOSEN_LOOK: Readonly<DosenLook> = {
  skinId: 'kulit-2',
  hair: { colorId: 'rambut-cokelat-tua', style: 'rapi-pendek', grey: '#b9b6b8' },
  glasses: { frame: '#242730' },
  blazer: { color: 'navy', lapel: '#3b5f8f' },
  shirt: { base: '#7a4a24', shade: '#4f2d14', batik: { motif: 'parang', color: '#e0b04a' } },
  lanyard: { strap: '#f0c453', card: '#1f8a8a' },
}
