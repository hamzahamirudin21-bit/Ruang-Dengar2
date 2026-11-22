import { ConsultationDoorMode, LabMapData } from '../types';

export const LAB_MAP: LabMapData = {
  width: 40,
  height: 24,
  tileSizePx: 28,
  walls: [
    // Dinding keliling luar (40 x 24)
    { x: 0, y: 0, w: 40, h: 1 },
    { x: 0, y: 23, w: 40, h: 1 },
    { x: 0, y: 1, w: 1, h: 22 },
    { x: 39, y: 1, w: 1, h: 22 },

    // Sekat Stasiun Las (x=1..9, y=1..7) dengan pintu bawah di x=5..6, y=8
    { x: 10, y: 1, w: 1, h: 8 },
    { x: 1, y: 8, w: 4, h: 1 },
    { x: 7, y: 8, w: 3, h: 1 },

    // Sekat Stasiun Cetak 3D & Elektronik (x=11..30, y=1..7)
    { x: 21, y: 1, w: 1, h: 4 },
    { x: 11, y: 8, w: 3, h: 1 },
    { x: 19, y: 8, w: 5, h: 1 },
    { x: 29, y: 8, w: 2, h: 1 },

    // Dinding Gudang Alat (x=32..38, y=1..7) dengan pintu di x=34..35, y=8
    { x: 31, y: 1, w: 1, h: 8 },
    { x: 32, y: 8, w: 2, h: 1 },
    { x: 36, y: 8, w: 3, h: 1 },

    // Dinding Ruang Konsultasi Praktikum (lantai dalam x=31..38, y=12..14)
    // Dinding utara & segmen barat/selatan tetap; pintu dikontrol lewat doors[]
    { x: 30, y: 11, w: 9, h: 1 }, // utara
    { x: 30, y: 12, w: 1, h: 1 }, // barat atas
    { x: 30, y: 14, w: 1, h: 1 }, // barat bawah (y=13 adalah slot pintu lab)
    { x: 30, y: 15, w: 5, h: 1 }, // selatan kiri (x=35..36 adalah slot pintu samping)
    { x: 37, y: 15, w: 2, h: 1 }, // selatan kanan

    // Dinding Ruang Dosen (lantai dalam x=31..38, y=19..22) dengan pintu di x=33..34, y=18
    { x: 30, y: 18, w: 3, h: 1 },
    { x: 35, y: 18, w: 4, h: 1 },
    { x: 30, y: 19, w: 1, h: 4 },
  ],
  lowDividers: [
    // Pembatas rendah antara Stasiun Pemrograman (y=11..16) dan Ruang Istirahat (y=18..22)
    { x: 1, y: 17, w: 8, h: 1 },
    // Pilar pembatas tipis sisi timur Pemrograman (tetap menyisakan lorong y=14..16)
    { x: 13, y: 11, w: 1, h: 3 },
  ],
  doors: [
    {
      id: 'pintu-las',
      zoneId: 'las',
      tiles: [
        { x: 5, y: 8 },
        { x: 6, y: 8 },
      ],
      orientation: 'horizontal',
      label: 'Pintu K3 Stasiun Las',
    },
    {
      id: 'pintu-gudang',
      zoneId: 'gudang-alat',
      tiles: [
        { x: 34, y: 8 },
        { x: 35, y: 8 },
      ],
      orientation: 'horizontal',
      label: 'Pintu Gudang Alat',
    },
    {
      id: 'pintu-konsultasi-lab',
      zoneId: 'konsultasi',
      tiles: [{ x: 30, y: 13 }],
      orientation: 'vertical',
      mode: 'lab',
      label: 'Pintu Konsultasi (Menghadap Lab)',
    },
    {
      id: 'pintu-konsultasi-samping',
      zoneId: 'konsultasi',
      tiles: [
        { x: 35, y: 15 },
        { x: 36, y: 15 },
      ],
      orientation: 'horizontal',
      mode: 'samping',
      label: 'Pintu Konsultasi (Pintu Samping)',
    },
    {
      id: 'pintu-dosen',
      zoneId: 'ruang-dosen',
      tiles: [
        { x: 33, y: 18 },
        { x: 34, y: 18 },
      ],
      orientation: 'horizontal',
      label: 'Pintu Ruang Dosen',
    },
  ],
  furniture: [
    // Stasiun Las (peralatan las di utara ruangan)
    { id: 'las-1', kind: 'bilik-las', rect: { x: 2, y: 1, w: 2, h: 2 }, walkable: false, label: 'Bilik Las A' },
    { id: 'las-2', kind: 'bilik-las', rect: { x: 6, y: 1, w: 2, h: 2 }, walkable: false, label: 'Bilik Las B' },
    { id: 'las-k3', kind: 'penanda-k3', rect: { x: 4, y: 2, w: 2, h: 1 }, walkable: true, label: 'K3' },

    // Stasiun Cetak 3D (4 unit printer dengan indikator status)
    { id: 'p3d-1', kind: 'printer-3d', rect: { x: 12, y: 2, w: 1, h: 1 }, walkable: false, label: 'P1' },
    { id: 'p3d-2', kind: 'printer-3d', rect: { x: 14, y: 2, w: 1, h: 1 }, walkable: false, label: 'P2' },
    { id: 'p3d-3', kind: 'printer-3d', rect: { x: 17, y: 2, w: 1, h: 1 }, walkable: false, label: 'P3' },
    { id: 'p3d-4', kind: 'printer-3d', rect: { x: 19, y: 2, w: 1, h: 1 }, walkable: false, label: 'P4' },

    // Stasiun Elektronik dan IoT (meja solder & osiloskop)
    { id: 'iot-1', kind: 'meja-elektronik', rect: { x: 23, y: 2, w: 3, h: 1 }, walkable: false, label: 'Meja Solder' },
    { id: 'iot-2', kind: 'meja-elektronik', rect: { x: 27, y: 2, w: 3, h: 1 }, walkable: false, label: 'Alat Ukur' },

    // Gudang Alat (rak komponen)
    { id: 'gudang-1', kind: 'rak-gudang', rect: { x: 33, y: 1, w: 5, h: 1 }, walkable: false, label: 'Rak Komponen' },
    { id: 'gudang-2', kind: 'rak-gudang', rect: { x: 38, y: 3, w: 1, h: 4 }, walkable: false, label: 'Rak Alat' },

    // Stasiun Pemrograman dan Mikrokontroler (meja komputer)
    { id: 'pc-1', kind: 'meja-komputer', rect: { x: 2, y: 13, w: 4, h: 1 }, walkable: false, label: 'Meja PC A' },
    { id: 'pc-2', kind: 'meja-komputer', rect: { x: 7, y: 13, w: 4, h: 1 }, walkable: false, label: 'Meja PC B' },

    // Meja Diskusi Bersama
    { id: 'diskusi-1', kind: 'meja-diskusi', rect: { x: 18, y: 14, w: 6, h: 2 }, walkable: false, label: 'Meja Diskusi' },

    // Ruang Istirahat (sofa, meja kopi, dispenser)
    { id: 'sofa-1', kind: 'sofa', rect: { x: 2, y: 21, w: 4, h: 1 }, walkable: false, label: 'Sofa' },
    { id: 'sofa-2', kind: 'sofa', rect: { x: 2, y: 19, w: 1, h: 2 }, walkable: false },
    { id: 'kopi-1', kind: 'meja-kopi', rect: { x: 4, y: 19, w: 2, h: 1 }, walkable: false },
    { id: 'disp-1', kind: 'dispenser', rect: { x: 8, y: 21, w: 1, h: 1 }, walkable: false, label: 'Air' },

    // Ruang Konsultasi Praktikum
    { id: 'kons-1', kind: 'meja-konsultasi', rect: { x: 36, y: 13, w: 2, h: 1 }, walkable: false, label: 'Meja Konsultasi' },

    // Ruang Dosen
    { id: 'dosen-1', kind: 'meja-dosen', rect: { x: 35, y: 21, w: 3, h: 1 }, walkable: false, label: 'Meja Dosen' },
    { id: 'dosen-2', kind: 'rak-buku', rect: { x: 31, y: 21, w: 1, h: 2 }, walkable: false, label: 'Arsip' },
  ],
  zones: [
    {
      id: 'las',
      type: 'las',
      label: 'Stasiun Las',
      shortLabel: 'St. Las (K3)',
      description: 'Area pengelasan bersekat dengan penanda keselamatan kerja (K3) dan ventilasi khusus.',
      bounds: { x: 1, y: 1, w: 9, h: 7 },
      capacity: 5,
      standingSlots: [
        { x: 2, y: 4 },
        { x: 4, y: 4 },
        { x: 7, y: 4 },
        { x: 3, y: 6 },
        { x: 7, y: 6 },
      ],
      entrances: [
        { x: 5, y: 8 },
        { x: 6, y: 8 },
      ],
      visibility: 'semi-privat',
      privacy: 0.5,
      colorVar: '--zone-las',
    },
    {
      id: 'cetak-3d',
      type: 'cetak-3d',
      label: 'Stasiun Cetak 3D',
      shortLabel: 'Cetak 3D',
      description: 'Deretan empat unit printer 3D dengan indikator status cetak dan meja pasca-proses.',
      bounds: { x: 11, y: 1, w: 10, h: 7 },
      capacity: 5,
      standingSlots: [
        { x: 12, y: 4 },
        { x: 14, y: 4 },
        { x: 17, y: 4 },
        { x: 19, y: 4 },
        { x: 16, y: 6 },
      ],
      entrances: [
        { x: 15, y: 8 },
        { x: 17, y: 8 },
      ],
      visibility: 'terbuka',
      privacy: 0.2,
      colorVar: '--zone-cetak-3d',
    },
    {
      id: 'elektronik-iot',
      type: 'elektronik-iot',
      label: 'Stasiun Elektronik dan IoT',
      shortLabel: 'Elektronik & IoT',
      description: 'Meja solder, osiloskop, multimeter, serta perakitan modul sensor IoT.',
      bounds: { x: 22, y: 1, w: 9, h: 7 },
      capacity: 5,
      standingSlots: [
        { x: 23, y: 4 },
        { x: 25, y: 4 },
        { x: 27, y: 4 },
        { x: 28, y: 5 },
        { x: 26, y: 6 },
      ],
      entrances: [
        { x: 25, y: 8 },
        { x: 27, y: 8 },
      ],
      visibility: 'terbuka',
      privacy: 0.25,
      colorVar: '--zone-elektronik',
    },
    {
      id: 'gudang-alat',
      type: 'gudang-alat',
      label: 'Gudang Alat',
      shortLabel: 'Gudang Alat',
      description: 'Ruang penyimpanan alat ukur, suku cadang, dan perlengkapan praktikum.',
      bounds: { x: 32, y: 1, w: 7, h: 7 },
      capacity: 4,
      standingSlots: [
        { x: 33, y: 4 },
        { x: 35, y: 4 },
        { x: 34, y: 6 },
        { x: 36, y: 6 },
      ],
      entrances: [
        { x: 34, y: 8 },
        { x: 35, y: 8 },
      ],
      visibility: 'semi-privat',
      privacy: 0.65,
      colorVar: '--zone-gudang',
    },
    {
      id: 'pemrograman',
      type: 'pemrograman',
      label: 'Stasiun Pemrograman dan Mikrokontroler',
      shortLabel: 'Pemrograman & MCU',
      description: 'Deretan meja komputer untuk pemrograman firmware, simulasi rangkaian, dan debugging.',
      bounds: { x: 1, y: 11, w: 12, h: 6 },
      capacity: 6,
      standingSlots: [
        { x: 2, y: 15 },
        { x: 4, y: 15 },
        { x: 6, y: 15 },
        { x: 8, y: 15 },
        { x: 10, y: 15 },
        { x: 11, y: 12 },
      ],
      entrances: [
        { x: 5, y: 11 },
        { x: 8, y: 11 },
      ],
      visibility: 'terbuka',
      privacy: 0.2,
      colorVar: '--zone-pemrograman',
    },
    {
      id: 'diskusi',
      type: 'diskusi',
      label: 'Meja Diskusi Bersama',
      shortLabel: 'Meja Diskusi',
      description: 'Pusat interaksi kelompok di tengah laboratorium untuk diskusi tugas dan koordinasi tim.',
      bounds: { x: 15, y: 11, w: 12, h: 8 },
      capacity: 6,
      standingSlots: [
        { x: 17, y: 14 },
        { x: 19, y: 13 },
        { x: 22, y: 13 },
        { x: 24, y: 14 },
        { x: 19, y: 16 },
        { x: 22, y: 16 },
      ],
      entrances: [
        { x: 20, y: 11 },
        { x: 15, y: 14 },
      ],
      visibility: 'terbuka',
      privacy: 0.1,
      colorVar: '--zone-diskusi',
    },
    {
      id: 'istirahat',
      type: 'istirahat',
      label: 'Ruang Istirahat',
      shortLabel: 'Ruang Istirahat',
      description: 'Area santai kecil untuk jeda antar-praktikum, minum air, dan pemulihan fokus.',
      bounds: { x: 1, y: 18, w: 12, h: 5 },
      capacity: 4,
      standingSlots: [
        { x: 4, y: 18 },
        { x: 6, y: 20 },
        { x: 9, y: 20 },
        { x: 11, y: 21 },
      ],
      entrances: [
        { x: 10, y: 17 },
        { x: 12, y: 20 },
      ],
      visibility: 'semi-privat',
      privacy: 0.45,
      colorVar: '--zone-istirahat',
    },
    {
      id: 'konsultasi',
      type: 'konsultasi',
      label: 'Ruang Konsultasi Praktikum',
      shortLabel: 'Ruang Konsultasi',
      description:
        'Ruang percakapan empat mata; posisi pintu dapat diatur agar menghadap area lab atau lewat lorong samping.',
      bounds: { x: 31, y: 12, w: 8, h: 3 },
      capacity: 4,
      standingSlots: [
        { x: 32, y: 13 },
        { x: 33, y: 12 },
        { x: 34, y: 14 },
        { x: 37, y: 14 },
      ],
      entrances: [{ x: 30, y: 13 }],
      visibility: 'dapat-diatur',
      privacy: 0.78,
      colorVar: '--zone-konsultasi',
    },
    {
      id: 'ruang-dosen',
      type: 'ruang-dosen',
      label: 'Ruang Dosen',
      shortLabel: 'Ruang Dosen',
      description: 'Ruang pembimbing laboratorium dan arsip administrasi akademik.',
      bounds: { x: 31, y: 19, w: 8, h: 4 },
      capacity: 4,
      standingSlots: [
        { x: 32, y: 20 },
        { x: 34, y: 20 },
        { x: 36, y: 20 },
        { x: 37, y: 22 },
      ],
      entrances: [
        { x: 33, y: 18 },
        { x: 34, y: 18 },
      ],
      visibility: 'privat',
      privacy: 0.9,
      colorVar: '--zone-dosen',
    },
  ],
};

export function getEffectiveZonePrivacy(
  zoneId: string,
  basePrivacy: number,
  doorMode: ConsultationDoorMode
): number {
  if (zoneId !== 'konsultasi') {
    return basePrivacy;
  }
  return doorMode === 'lab' ? 0.65 : 0.92;
}

export function getZoneEntrances(
  map: LabMapData,
  zoneId: string,
  doorMode: ConsultationDoorMode
) {
  if (zoneId === 'konsultasi') {
    return doorMode === 'lab'
      ? [{ x: 30, y: 13 }]
      : [
          { x: 35, y: 15 },
          { x: 36, y: 15 },
        ];
  }
  const zone = map.zones.find((z) => z.id === zoneId);
  return zone ? zone.entrances : [];
}
