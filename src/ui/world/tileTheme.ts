import type { ZoneType } from '../../types';

export type FloorKind = 'kayu' | 'keramik' | 'beton' | 'karpet' | 'koridor';

export interface TileTheme {
  floor: FloorKind;
  /** Warna dasar lantai (#rrggbb). */
  base: string;
  /** Warna pola kedua (papan, ubin, bercak). */
  alt: string;
  /** Warna garis/sambungan. */
  accent: string;
  /** Warna muka dinding zona. */
  wallFace: string;
  /** Warna sisi atas dinding. */
  wallCap: string;
}

export const ZONE_THEMES: Readonly<Record<ZoneType, TileTheme>> = {
  // Beton bengkel gelap, bercak kuning K3
  las: {
    floor: 'beton',
    base: '#6b6560',
    alt: '#d9a21b',
    accent: '#4a4541',
    wallFace: '#7d4a3a',
    wallCap: '#b8735a',
  },
  // Keramik biru muda
  'cetak-3d': {
    floor: 'keramik',
    base: '#9fd0e6',
    alt: '#82bcd8',
    accent: '#5f9cbd',
    wallFace: '#3f7fa8',
    wallCap: '#7cb8d9',
  },
  // Keramik antistatik hijau abu
  'elektronik-iot': {
    floor: 'keramik',
    base: '#9db8a4',
    alt: '#84a38c',
    accent: '#5f7f69',
    wallFace: '#456b55',
    wallCap: '#7fa88b',
  },
  // Beton gelap bergaris
  'gudang-alat': {
    floor: 'beton',
    base: '#7a7468',
    alt: '#8e8678',
    accent: '#575246',
    wallFace: '#5c5346',
    wallCap: '#8f8470',
  },
  // Karpet biru abu
  pemrograman: {
    floor: 'karpet',
    base: '#5f78a3',
    alt: '#6d87b3',
    accent: '#46608a',
    wallFace: '#34497a',
    wallCap: '#6a85b8',
  },
  // Kayu terang
  diskusi: {
    floor: 'kayu',
    base: '#e0b36e',
    alt: '#d29e52',
    accent: '#a8742f',
    wallFace: '#b9803d',
    wallCap: '#e8c58a',
  },
  // Karpet hangat
  istirahat: {
    floor: 'karpet',
    base: '#d47a5a',
    alt: '#c76a4a',
    accent: '#a2523a',
    wallFace: '#8f4a3a',
    wallCap: '#e09a7a',
  },
  // Kayu hangat
  konsultasi: {
    floor: 'kayu',
    base: '#c98a4b',
    alt: '#b9783a',
    accent: '#8c5624',
    wallFace: '#8a5a34',
    wallCap: '#d9a56e',
  },
  // Kayu gelap
  'ruang-dosen': {
    floor: 'kayu',
    base: '#8a5a38',
    alt: '#784a2c',
    accent: '#573219',
    wallFace: '#4a3a5c',
    wallCap: '#7a6890',
  },
};

/** Koridor: keramik krem. */
export const CORRIDOR_THEME: TileTheme = {
  floor: 'koridor',
  base: '#efe2c0',
  alt: '#e3d3a8',
  accent: '#c4b27f',
  wallFace: '#5b6b8c',
  wallCap: '#97a6c4',
};

export function themeForZone(zoneId: ZoneType): TileTheme {
  return ZONE_THEMES[zoneId] ?? CORRIDOR_THEME;
}
