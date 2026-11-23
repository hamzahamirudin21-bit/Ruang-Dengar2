/**
 * Profil visual terpadu untuk seluruh 15 mahasiswa (mhs-01..mhs-15) + Ibu Dosen BK ('dosen'),
 * diselaraskan langsung dengan gaya anime Visual Novel (referensi 1) dan miniatur chibi 2D (referensi 2)
 * sambil mempertahankan 100% nama, ID, dan karakter asli sistem Ruang Dengar.
 *
 * Dipakai bersama oleh `illustratedPortrait.ts` dan `illustratedSprite.ts` agar potret percakapan,
 * kartu daftar karakter, dan miniatur 2D selalu 100% konsisten (tidak pernah berubah-ubah).
 */

export type RefOutfitKind =
  | 'dosen-blazer'      // Ibu Dosen BK: blazer navy + kemeja batik emas + lanyard ID teal
  | 'almet-navy'        // mhs-01 Raka: almet/blazer navy + kemeja putih + emblem merah-emas + tas selempang
  | 'techwear-cyan'     // mhs-02 Dimas: jaket techwear navy-hitam aksen cyan + headphone leher + kacamata
  | 'soft-academia'     // mhs-03 Tania: mantel krem + syal rajut maroon + rambut panjang + bando
  | 'hoodie-mustard'    // mhs-04 Kevin: hoodie kuning mustard + tali ransel hitam
  | 'sporty-pink'       // mhs-05 Ayu: jaket sporty pink pastel strip putih + jepit rambut X + ransel
  | 'hijab-minimalist'  // mhs-06 Mita: hijab krem lembut + sweater garis navy-putih + kacamata bulat + tote krem
  | 'workshop-orange'   // mhs-07 Bima: jaket workshop oranye + kaus gelap + kacamata safety bening + strap
  | 'flannel-green'     // mhs-08 Hendra: kemeja flanel kotak hijau-navy terbuka + kaus abu gelap
  | 'varsity-maroon'    // mhs-09 Gilang: jaket varsity maroon lengan putih + kaus putih + ransel
  | 'lab-coat'          // mhs-10 Teguh: jas lab putih + kemeja biru muda + kacamata safety di dahi
  | 'hoodie-purple'     // mhs-11 Maya: hoodie ungu lembut + headphone ungu + kacamata bulat + ransel
  | 'semi-formal-blue'  // mhs-12 Sari: kemeja biru langit + lanyard ID + jepit rambut emas + tablet
  | 'hijab-utility'     // mhs-13 Nisa: hijab navy-charcoal gelap + rompi utility hijau zaitun + blus putih
  | 'cardigan-maroon'   // mhs-14 Rani: cardigan rajut maroon hangat + blus kerah krem + kuncir samping berpita
  | 'street-teal'       // mhs-15 Naufal: jaket windbreaker teal + topi bucket krem + kaus putih + ransel

export type RefHairStyle =
  | 'dosen-bob'         // Bob bahu rapi berponi samping + aksen helai perak halus
  | 'messy-short'       // Rambut pendek acak modern anime (laki-laki)
  | 'fluffy-short'      // Rambut pendek bervolume lembut cokelat tua
  | 'long-headband'     // Rambut panjang bergelombang + bando gelap
  | 'bob-xclip'         // Bob sebahu + jepit rambut silang X
  | 'bob-twinpin'       // Bob dagu rapi + dua jepit rambut emas
  | 'long-straight'     // Rambut panjang lurus tergerai (dengan headphone)
  | 'low-ponytail'      // Kuncir samping rendah berpita krem + poni lembut
  | 'hijab-cream'       // Hijab krem/beige berlipat lembut
  | 'hijab-charcoal'    // Hijab navy-charcoal gelap berlipat lembut

export type RefGlasses = 'none' | 'rect-dark' | 'round-dark' | 'safety-clear' | 'goggles-forehead'
export type RefHeadgear = 'none' | 'headphone-purple' | 'bucket-hat'
export type RefNeckItem = 'none' | 'lanyard-dosen' | 'lanyard-student' | 'headphone-cyan' | 'scarf-maroon'
export type RefBag = 'none' | 'crossbody' | 'backpack' | 'tote-cream'

export interface ReferenceCharacterProfile {
  id: string
  feminine: boolean
  skinBase: string
  skinShade: string
  skinLight: string
  hairBase: string
  hairShade: string
  hairLight: string
  hairStyle: RefHairStyle
  irisTop: string
  irisBottom: string
  blushColor: string
  outfit: RefOutfitKind
  topBase: string
  topShade: string
  topLight: string
  innerColor: string
  accentColor: string
  bottomColor: string
  bottomShade: string
  shoeColor: string
  isSkirt: boolean
  glasses: RefGlasses
  headgear: RefHeadgear
  neckItem: RefNeckItem
  bag: RefBag
  hijabBase?: string
  hijabShade?: string
  hijabLight?: string
}

export const REFERENCE_PROFILES: Readonly<Record<string, ReferenceCharacterProfile>> = {
  // Ibu Dosen BK (Perempuan — sesuai seluruh dialog "Bu / Ibu" di 15 cerita)
  dosen: {
    id: 'dosen',
    feminine: true,
    skinBase: '#f7d5be', skinShade: '#ddb093', skinLight: '#ffece0',
    hairBase: '#2c252c', hairShade: '#1a141b', hairLight: '#5a525e',
    hairStyle: 'dosen-bob',
    irisTop: '#3a261e', irisBottom: '#8c5f44',
    blushColor: '#e58686',
    outfit: 'dosen-blazer',
    topBase: '#28395c', topShade: '#1a253d', topLight: '#405785',
    innerColor: '#f5e6cb', accentColor: '#d9a441',
    bottomColor: '#252b3b', bottomShade: '#171b26', shoeColor: '#4c3024',
    isSkirt: true,
    glasses: 'rect-dark',
    headgear: 'none',
    neckItem: 'lanyard-dosen',
    bag: 'none',
  },

  // mhs-01: Raka Pratama (Ref 01 — Almet Navy)
  'mhs-01': {
    id: 'mhs-01',
    feminine: false,
    skinBase: '#f6d2b8', skinShade: '#d9ab8b', skinLight: '#ffebdc',
    hairBase: '#20222c', hairShade: '#11121a', hairLight: '#495066',
    hairStyle: 'messy-short',
    irisTop: '#2a212e', irisBottom: '#6a5678',
    blushColor: '#e6847c',
    outfit: 'almet-navy',
    topBase: '#273860', topShade: '#192542', topLight: '#3f578c',
    innerColor: '#f5f7fb', accentColor: '#c73c3c',
    bottomColor: '#2d313d', bottomShade: '#1d2029', shoeColor: '#edf1f7',
    isSkirt: false,
    glasses: 'none',
    headgear: 'none',
    neckItem: 'none',
    bag: 'crossbody',
  },

  // mhs-02: Dimas Aditya (Ref 05 — Techwear Navy-Cyan + Kacamata + Headphone Leher)
  'mhs-02': {
    id: 'mhs-02',
    feminine: false,
    skinBase: '#f3cdb2', skinShade: '#d4a485', skinLight: '#fde6d6',
    hairBase: '#1f212b', hairShade: '#111218', hairLight: '#464d61',
    hairStyle: 'messy-short',
    irisTop: '#262d38', irisBottom: '#4b7a8c',
    blushColor: '#e2827a',
    outfit: 'techwear-cyan',
    topBase: '#243044', topShade: '#161e2c', topLight: '#3c4e6b',
    innerColor: '#222630', accentColor: '#43bfd1',
    bottomColor: '#282d38', bottomShade: '#191d26', shoeColor: '#2c3d4f',
    isSkirt: false,
    glasses: 'rect-dark',
    headgear: 'none',
    neckItem: 'headphone-cyan',
    bag: 'backpack',
  },

  // mhs-03: Tania Wijaya (Ref 02 — Soft Academia, Rambut Panjang + Syal Maroon + Mantel Krem)
  'mhs-03': {
    id: 'mhs-03',
    feminine: true,
    skinBase: '#fbe0ce', skinShade: '#e3baa0', skinLight: '#fff2e8',
    hairBase: '#8c6248', hairShade: '#60402d', hairLight: '#be9172',
    hairStyle: 'long-headband',
    irisTop: '#4e2f24', irisBottom: '#a66d4e',
    blushColor: '#f08e96',
    outfit: 'soft-academia',
    topBase: '#e4d5be', topShade: '#c3b094', topLight: '#f5ece0',
    innerColor: '#f7f1e6', accentColor: '#7f2c3c',
    bottomColor: '#4a3a34', bottomShade: '#302420', shoeColor: '#5c3c2e',
    isSkirt: true,
    glasses: 'none',
    headgear: 'none',
    neckItem: 'scarf-maroon',
    bag: 'crossbody',
  },

  // mhs-04: Kevin Gunawan (Ref 03 — Hoodie Mustard + Ransel)
  'mhs-04': {
    id: 'mhs-04',
    feminine: false,
    skinBase: '#f7d5bc', skinShade: '#dbae8d', skinLight: '#ffecdd',
    hairBase: '#453228', hairShade: '#2b1e17', hairLight: '#735647',
    hairStyle: 'fluffy-short',
    irisTop: '#362318', irisBottom: '#8c5d3c',
    blushColor: '#e68478',
    outfit: 'hoodie-mustard',
    topBase: '#e2a832', topShade: '#b87f1a', topLight: '#f5ca64',
    innerColor: '#f5efe2', accentColor: '#2c313d',
    bottomColor: '#363b47', bottomShade: '#242830', shoeColor: '#e4e8ef',
    isSkirt: false,
    glasses: 'none',
    headgear: 'none',
    neckItem: 'none',
    bag: 'backpack',
  },

  // mhs-05: Ayu Permata (Ref 06 — Sporty Pink + Jepit X + Ransel)
  'mhs-05': {
    id: 'mhs-05',
    feminine: true,
    skinBase: '#fbe0ce', skinShade: '#e2b99f', skinLight: '#fff3ea',
    hairBase: '#33282e', hairShade: '#1d161a', hairLight: '#63525b',
    hairStyle: 'bob-xclip',
    irisTop: '#3b2436', irisBottom: '#9e5d7a',
    blushColor: '#f28a9a',
    outfit: 'sporty-pink',
    topBase: '#e898ae', topShade: '#c46c86', topLight: '#f7bccd',
    innerColor: '#fdfbfd', accentColor: '#ffffff',
    bottomColor: '#2d3240', bottomShade: '#1d212b', shoeColor: '#f2e8ee',
    isSkirt: false,
    glasses: 'none',
    headgear: 'none',
    neckItem: 'none',
    bag: 'backpack',
  },

  // mhs-06: Mita Rahmawati (Ref 04 — Hijab Krem + Kacamata Bulat + Sweater Garis Navy)
  'mhs-06': {
    id: 'mhs-06',
    feminine: true,
    skinBase: '#f8dac5', skinShade: '#deb497', skinLight: '#fff0e4',
    hairBase: '#231e24', hairShade: '#141016', hairLight: '#473f4a',
    hairStyle: 'hijab-cream',
    irisTop: '#382520', irisBottom: '#825748',
    blushColor: '#ee8c94',
    outfit: 'hijab-minimalist',
    topBase: '#2c3d63', topShade: '#1c2845', topLight: '#455c8c',
    innerColor: '#f4efe6', accentColor: '#e8e4da',
    bottomColor: '#313745', bottomShade: '#1e222c', shoeColor: '#363b47',
    isSkirt: true,
    glasses: 'round-dark',
    headgear: 'none',
    neckItem: 'none',
    bag: 'tote-cream',
    hijabBase: '#e5d5c3', hijabShade: '#c2ae98', hijabLight: '#f6ede3',
  },

  // mhs-07: Bima Mahendra (Ref 10 — Jaket Workshop Oranye + Kacamata Safety)
  'mhs-07': {
    id: 'mhs-07',
    feminine: false,
    skinBase: '#f0c4a4', skinShade: '#cf9b78', skinLight: '#fbe0ca',
    hairBase: '#242228', hairShade: '#141218', hairLight: '#4e4b59',
    hairStyle: 'messy-short',
    irisTop: '#362118', irisBottom: '#8c5438',
    blushColor: '#df7d70',
    outfit: 'workshop-orange',
    topBase: '#dd6c28', topShade: '#ad4b14', topLight: '#f2904c',
    innerColor: '#252932', accentColor: '#303642',
    bottomColor: '#2d3340', bottomShade: '#1d212b', shoeColor: '#4e3528',
    isSkirt: false,
    glasses: 'safety-clear',
    headgear: 'none',
    neckItem: 'none',
    bag: 'crossbody',
  },

  // mhs-08: Hendra Wijaya (Ref 12 — Flanel Kotak Hijau-Navy + Cetak 3D)
  'mhs-08': {
    id: 'mhs-08',
    feminine: false,
    skinBase: '#f5d2b8', skinShade: '#d8aa8a', skinLight: '#ffecdd',
    hairBase: '#3e2d24', hairShade: '#261a14', hairLight: '#6b5143',
    hairStyle: 'fluffy-short',
    irisTop: '#2e241d', irisBottom: '#6f5a46',
    blushColor: '#e48278',
    outfit: 'flannel-green',
    topBase: '#2b4d3e', topShade: '#1b3328', topLight: '#43705c',
    innerColor: '#242830', accentColor: '#1f2e45',
    bottomColor: '#3b3732', bottomShade: '#262320', shoeColor: '#544a40',
    isSkirt: false,
    glasses: 'none',
    headgear: 'none',
    neckItem: 'none',
    bag: 'none',
  },

  // mhs-09: Gilang Ramadhan (Ref 07 — Jaket Varsity Maroon-Krem)
  'mhs-09': {
    id: 'mhs-09',
    feminine: false,
    skinBase: '#f2c9ac', skinShade: '#d29e7d', skinLight: '#fce4d2',
    hairBase: '#1f212a', hairShade: '#121319', hairLight: '#484d60',
    hairStyle: 'messy-short',
    irisTop: '#331e1c', irisBottom: '#7d473d',
    blushColor: '#e07a72',
    outfit: 'varsity-maroon',
    topBase: '#7c2836', topShade: '#541823', topLight: '#a63e4f',
    innerColor: '#f7f4ee', accentColor: '#efeae0',
    bottomColor: '#292e3a', bottomShade: '#1a1e26', shoeColor: '#e8e4dc',
    isSkirt: false,
    glasses: 'none',
    headgear: 'none',
    neckItem: 'none',
    bag: 'backpack',
  },

  // mhs-10: Teguh Santosa (Ref 09 — Jas Lab Putih + Kacamata Safety Dahi)
  'mhs-10': {
    id: 'mhs-10',
    feminine: false,
    skinBase: '#f3ccb0', skinShade: '#d4a383', skinLight: '#fde6d4',
    hairBase: '#1e222b', hairShade: '#11141a', hairLight: '#474f63',
    hairStyle: 'messy-short',
    irisTop: '#242f3d', irisBottom: '#557696',
    blushColor: '#de7e76',
    outfit: 'lab-coat',
    topBase: '#f0f4f8', topShade: '#ccd6e3', topLight: '#ffffff',
    innerColor: '#7a9ec2', accentColor: '#2b3445',
    bottomColor: '#2f3747', bottomShade: '#1e2430', shoeColor: '#3a4252',
    isSkirt: false,
    glasses: 'goggles-forehead',
    headgear: 'none',
    neckItem: 'none',
    bag: 'none',
  },

  // mhs-11: Maya Puspita (Ref 08 — Hoodie Ungu + Headphone Ungu + Kacamata Bulat)
  'mhs-11': {
    id: 'mhs-11',
    feminine: true,
    skinBase: '#fbe1cf', skinShade: '#e3b99f', skinLight: '#fff3ea',
    hairBase: '#3c2b30', hairShade: '#24181c', hairLight: '#6e525c',
    hairStyle: 'long-straight',
    irisTop: '#3d2a4f', irisBottom: '#8d6eb5',
    blushColor: '#f08ea0',
    outfit: 'hoodie-purple',
    topBase: '#786294', topShade: '#54426c', topLight: '#9c86ba',
    innerColor: '#ece4f5', accentColor: '#b57edc',
    bottomColor: '#2e2b3d', bottomShade: '#1d1b29', shoeColor: '#3c364d',
    isSkirt: false,
    glasses: 'round-dark',
    headgear: 'headphone-purple',
    neckItem: 'none',
    bag: 'backpack',
  },

  // mhs-12: Sari Melati (Ref 14 — Kemeja Biru Langit + Lanyard ID + Jepit Emas)
  'mhs-12': {
    id: 'mhs-12',
    feminine: true,
    skinBase: '#f9ddc9', skinShade: '#dfb498', skinLight: '#fff1e7',
    hairBase: '#2d2630', hairShade: '#1a151c', hairLight: '#5a4e61',
    hairStyle: 'bob-twinpin',
    irisTop: '#263645', irisBottom: '#5c84a6',
    blushColor: '#ee8a94',
    outfit: 'semi-formal-blue',
    topBase: '#9db8dc', topShade: '#7494be', topLight: '#bfd4f0',
    innerColor: '#f8fafc', accentColor: '#253147',
    bottomColor: '#2c354a', bottomShade: '#1c2230', shoeColor: '#353945',
    isSkirt: true,
    glasses: 'none',
    headgear: 'none',
    neckItem: 'lanyard-student',
    bag: 'none',
  },

  // mhs-13: Nisa Nurhaliza (Ref 11 — Hijab Navy Gelap + Rompi Zaitun + Blus Putih)
  'mhs-13': {
    id: 'mhs-13',
    feminine: true,
    skinBase: '#f7d8c2', skinShade: '#dcaf92', skinLight: '#ffefe3',
    hairBase: '#1d202b', hairShade: '#10121a', hairLight: '#3d4359',
    hairStyle: 'hijab-charcoal',
    irisTop: '#2b2d42', irisBottom: '#646c94',
    blushColor: '#ee8b92',
    outfit: 'hijab-utility',
    topBase: '#6f7551', topShade: '#4e5437', topLight: '#91996e',
    innerColor: '#f6f5f0', accentColor: '#3e422c',
    bottomColor: '#3c4959', bottomShade: '#26303d', shoeColor: '#4b453e',
    isSkirt: true,
    glasses: 'none',
    headgear: 'none',
    neckItem: 'none',
    bag: 'none',
    hijabBase: '#2d3142', hijabShade: '#1c1f2b', hijabLight: '#495069',
  },

  // mhs-14: Rani Safitri (Desain Perempuan Unik selaras gaya Ref 1 — Cardigan Maroon + Kuncir Samping)
  'mhs-14': {
    id: 'mhs-14',
    feminine: true,
    skinBase: '#fae0ce', skinShade: '#e0b69a', skinLight: '#fff3ea',
    hairBase: '#4d332a', hairShade: '#301d17', hairLight: '#805a4c',
    hairStyle: 'low-ponytail',
    irisTop: '#4a2530', irisBottom: '#a6546a',
    blushColor: '#f28c98',
    outfit: 'cardigan-maroon',
    topBase: '#8f3448', topShade: '#662030', topLight: '#b55066',
    innerColor: '#f8f0e3', accentColor: '#e8d8be',
    bottomColor: '#35313d', bottomShade: '#221f29', shoeColor: '#5c2a36',
    isSkirt: true,
    glasses: 'none',
    headgear: 'none',
    neckItem: 'none',
    bag: 'none',
  },

  // mhs-15: Naufal Hakim (Ref 13 — Jaket Teal Street Casual + Topi Bucket Krem)
  'mhs-15': {
    id: 'mhs-15',
    feminine: false,
    skinBase: '#f5d2b8', skinShade: '#d8aa8a', skinLight: '#ffecdd',
    hairBase: '#23242c', hairShade: '#13141a', hairLight: '#4c5061',
    hairStyle: 'messy-short',
    irisTop: '#24343b', irisBottom: '#4e8794',
    blushColor: '#e48379',
    outfit: 'street-teal',
    topBase: '#2d7a8f', topShade: '#1c5466', topLight: '#4b9eb5',
    innerColor: '#f4f6f8', accentColor: '#e3d5be',
    bottomColor: '#333b45', bottomShade: '#21272e', shoeColor: '#dce3eb',
    isSkirt: false,
    glasses: 'none',
    headgear: 'bucket-hat',
    neckItem: 'none',
    bag: 'backpack',
  },

  // mhs-16: Farhan Pratama (Flanel Kotak Zamrud Studio Desain + Kaus Hitam + Rambut Bergelombang Cokelat)
  'mhs-16': {
    id: 'mhs-16',
    feminine: false,
    skinBase: '#f5d2b8', skinShade: '#d8aa8a', skinLight: '#ffecdd',
    hairBase: '#4b362b', hairShade: '#2e1f18', hairLight: '#7a5d4e',
    hairStyle: 'fluffy-short',
    irisTop: '#2e241d', irisBottom: '#6f5a46',
    blushColor: '#e48278',
    outfit: 'flannel-green',
    topBase: '#1f7a68', topShade: '#145246', topLight: '#3aa08d',
    innerColor: '#242830', accentColor: '#183f4d',
    bottomColor: '#2c3d47', bottomShade: '#1d2930', shoeColor: '#4c4640',
    isSkirt: false,
    glasses: 'none',
    headgear: 'none',
    neckItem: 'none',
    bag: 'none',
  },

  // mhs-17: Sekar Wulandari (Mantel Sage-Teal Pojok Baca + Syal Rajut Mustard Emas + Rambut Hitam Panjang)
  'mhs-17': {
    id: 'mhs-17',
    feminine: true,
    skinBase: '#fbe0ce', skinShade: '#e3baa0', skinLight: '#fff2e8',
    hairBase: '#1d222e', hairShade: '#11141c', hairLight: '#424c63',
    hairStyle: 'long-headband',
    irisTop: '#2a2636', irisBottom: '#5c5473',
    blushColor: '#f08e96',
    outfit: 'soft-academia',
    topBase: '#4da38b', topShade: '#327563', topLight: '#75c4ae',
    innerColor: '#f7f1e6', accentColor: '#c99732',
    bottomColor: '#9c782c', bottomShade: '#6e521b', shoeColor: '#3a3430',
    isSkirt: true,
    glasses: 'none',
    headgear: 'none',
    neckItem: 'scarf-maroon',
    bag: 'crossbody',
  },

  // mhs-18: Bagas Saputra (Jaket Kobalt-Indigo Robotika + Kemeja Terakota + Goggles Dahi Amber)
  'mhs-18': {
    id: 'mhs-18',
    feminine: false,
    skinBase: '#f3ccb0', skinShade: '#d4a383', skinLight: '#fde6d4',
    hairBase: '#1e222b', hairShade: '#11141a', hairLight: '#474f63',
    hairStyle: 'messy-short',
    irisTop: '#33221a', irisBottom: '#7d543c',
    blushColor: '#de7e76',
    outfit: 'lab-coat',
    topBase: '#2b4f8c', topShade: '#1b3563', topLight: '#4a73b8',
    innerColor: '#d96432', accentColor: '#c99238',
    bottomColor: '#252d3d', bottomShade: '#171c26', shoeColor: '#2d3442',
    isSkirt: false,
    glasses: 'goggles-forehead',
    headgear: 'none',
    neckItem: 'none',
    bag: 'none',
  },
}

export function getReferenceProfile(id: string): ReferenceCharacterProfile {
  return REFERENCE_PROFILES[id] ?? REFERENCE_PROFILES['mhs-01']
}
