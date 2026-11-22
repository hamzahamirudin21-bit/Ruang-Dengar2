import type { StoryNode } from '../../engine/story/storyTypes';

/**
 * Maya Puspita (mhs-11): adegan lanjutan (epilog di pojok sunyi lab) dan tiga akhir.
 * Id simpul: ma-f0, ma-f1 (penutup bersama), ma-akhir-terbantu, ma-akhir-kemajuan, ma-akhir-menarik.
 * Dirakit di mhs-11.ts. Ringkasan tidak memakai label menang, kalah, atau game over.
 */

const SCENE = 'lanjutan';

export const MAYA_LANJUTAN_NODES: StoryNode[] = [
  {
    id: 'ma-f0',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    marks: ['kejutan'],
    reply: {
      text: 'Bu, Kamis kemarin dua puluh menit itu kupakai penuh. Tiga pertanyaan, dijawab satu per satu. Satu jawabannya nyelametin sensor kelembapanku, literally.',
      expression: 'tersenyum',
      cue: 'Maya duduk di mejanya dengan penutup telinga tergantung di leher. Bunyi solder kecil terdengar, dan ia tidak menaikkannya.',
      aside: 'Beberapa hari kemudian. Di dekat meja Maya terpasang papan kecil bertuliskan "Zona Fokus", dengan jadwal Kamis tertempel di bawahnya.',
    },
    choices: [
      {
        id: 'afirmasi-langkah',
        skillId: 'afirmasi-kekuatan',
        text: 'Kamu bawa tiga pertanyaan itu sampai selesai. Itu langkah nyata, Maya.',
        reaction: {
          text: 'Makasih, Bu, aku juga lega. Cuma satu hal: kadang Kamis terasa jauh dari hari aku bingung. Boleh nggak aku taruh catatan di kotak depan ruangan Ibu kalau mendesak?',
          expression: 'netral',
          cue: 'Maya menyentuh buku hijaunya, memutar pensil sekali, lalu menunggu jawaban dengan pandangan tertuju pada papan Zona Fokus.',
        },
        next: 'ma-f1',
        best: true,
      },
      {
        id: 'tanya-rasa',
        skillId: 'pertanyaan-terbuka',
        text: 'Dibanding bayanganmu, gimana rasanya duduk dua puluh menit itu?',
        reaction: {
          text: 'Lebih ringan dari bayanganku, Bu. Cuma, kadang Kamis kerasa jauh dari hari aku bingung. Boleh nggak kutaruh catatan di kotak depan ruangan Ibu kalau mendesak?',
          expression: 'netral',
          cue: 'Maya memandang papan Zona Fokus sebentar, lalu menunggu jawaban sambil menyentuh sampul buku hijaunya.',
        },
        next: 'ma-f1',
      },
      {
        id: 'nasihat-lanjut',
        skillId: 'nasihat-dini',
        text: 'Bagus, sekarang tambah jadi tiap hari aja sekalian. Jangan tanggung-tanggung.',
        next: 'ma-tegang-bk',
      },
      {
        id: 'remehkan-kecil',
        skillId: 'meremehkan',
        text: 'Dua puluh menit aja kok dibahas panjang. Itu belum seberapa.',
        next: 'ma-tegang-bk',
      },
    ],
  },
  {
    id: 'ma-f1',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Tapi kadang Kamis kerasa jauh dari hari aku bingung. Boleh nggak kutaruh catatan di kotak depan ruangan Ibu kalau mendesak?',
      expression: 'netral',
      cue: 'Maya menyentuh buku hijaunya, memutar pensil sekali, lalu menunggu jawaban dengan pandangan tertuju pada papan Zona Fokus.',
      aside: 'Dari meja seberang, seorang rekan satu tim mengangkat jempol tanpa suara, lalu kembali memakai penutup telinga sendiri.',
    },
    choices: [
      {
        id: 'parafrase-jalan',
        skillId: 'parafrase-ringkasan',
        text: 'Kamis jadi pegangan tetap, plus catatan di kotak buat hari mendesak. Cocok?',
        next: '@ending',
        best: true,
      },
      {
        id: 'validasi-cadangan',
        skillId: 'validasi-normalisasi',
        text: 'Siapin jalan cadangan itu wajar, dan bukan berarti kamu terlalu bergantung.',
        next: '@ending',
      },
      {
        id: 'tanya-catatan',
        skillId: 'pertanyaan-terbuka',
        text: 'Catatan seperti apa yang paling gampang kamu tulis di hari yang bikin bingung?',
        next: '@ending',
      },
      {
        id: 'tanya-tertutup',
        skillId: 'pertanyaan-tertutup',
        text: 'Jadi mulai sekarang kamu akan rajin nulis catatan, kan?',
        next: '@ending',
      },
    ],
  },
  {
    id: 'ma-akhir-terbantu',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Penutup telinga ini tetap kupakai, tapi sekarang bukan buat sembunyi. Kamis depan, tiga pertanyaan baru ya, Bu.',
      expression: 'lega',
      cue: 'Maya menempel kertas "Kamis 16.00" di papan Zona Fokus, lalu menurunkan penutup telinganya dan menaruhnya santai di meja.',
      aside: 'Seorang rekan lewat berjinjit dan meletakkan segelas teh di sisi meja Maya tanpa mengucap sepatah kata.',
    },
    choices: [],
    ending: { kind: 'terbantu' },
  },
  {
    id: 'ma-akhir-kemajuan',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Kupikirin dulu ya, Bu. Kamis depan aku coba kirim dua pertanyaan aja, kalau sempat.',
      expression: 'netral',
      cue: 'Maya mengangguk, menutup buku hijaunya, dan meletakkan pensil sejajar dengan tepinya sambil tersenyum tipis.',
      aside: 'Langkah kecil sudah dimulai. Pintu untuk bertemu lagi tetap terbuka, dan kamu bisa melanjutkan percakapan ini kapan saja.',
    },
    choices: [],
    ending: { kind: 'kemajuan-kecil' },
  },
  {
    id: 'ma-akhir-menarik',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Maaf, Bu. Aku balik ke meja dulu, datanya belum selesai kubaca.',
      expression: 'menutup-diri',
      cue: 'Maya menaikkan penutup telinganya, memutar kursi menghadap layar, dan tidak menoleh lagi.',
      aside: 'Hubungan ini masih dapat dipulihkan. Pertemuan berikutnya bisa dimulai di tempat sunyi dengan tempo pelan, dan Maya yang menentukan kapan ia siap bicara.',
    },
    choices: [],
    ending: { kind: 'menarik-diri-sementara' },
  },
];
