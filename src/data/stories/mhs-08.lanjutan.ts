import type { StoryNode } from '../../engine/story/storyTypes';

/**
 * Hendra Wijaya (mhs-08): adegan lanjutan (epilog di meja printer 3D) dan tiga akhir.
 * Id simpul: he-f0, he-f1 (penutup bersama), he-akhir-terbantu, he-akhir-kemajuan, he-akhir-menarik.
 * Dirakit di mhs-08.ts. Ringkasan tidak memakai label menang, kalah, atau game over.
 */

const SCENE = 'lanjutan';

export const HENDRA_LANJUTAN_NODES: StoryNode[] = [
  {
    id: 'he-f0',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    marks: ['kejutan'],
    reply: {
      text: 'Tadi Rendy minta tolong lagi. Kuucapin kalimat yang kita latih, dan dia cuma jawab "oke, Sabtu ya". Aku sampai bengong. Casing-ku udah separuh jadi.',
      expression: 'tersenyum',
      cue: 'Hendra berdiri di samping printer yang sedang bekerja, ponselnya tertelungkup diam di meja, dan ia tertawa kecil sambil menunjuk lapisan cetakan yang rapi.',
      aside: 'Beberapa hari kemudian. Di dekat ponsel Hendra tertempel sehelai kertas kecil bertuliskan satu kalimat dengan huruf tegak.',
    },
    choices: [
      {
        id: 'afirmasi-langkah',
        reaction: {
          text: 'Hehe, makasih, Dosen. Casing-nya udah separuh, tinggal rapiin bagian sisinya.',
          expression: 'tersenyum',
          cue: 'Hendra tersenyum malu sambil menepuk-nepuk laptopnya.',
        },
        skillId: 'afirmasi-kekuatan',
        text: 'Kamu mengucapkannya dan casing-mu jalan. Itu langkah nyata, Hendra.',
        next: 'he-f1',
        best: true,
      },
      {
        id: 'tanya-rasa',
        reaction: {
          text: 'Lega, Dosen. Dada kayak kosong dari beban satu karung, padahal cuma satu kalimat.',
          expression: 'lega',
          cue: 'Hendra memegang dadanya sambil tertawa kecil dan menggeleng tidak percaya.',
        },
        skillId: 'pertanyaan-terbuka',
        text: 'Pas Rendy jawab "oke, Sabtu ya", apa yang terlintas di dadamu?',
        next: 'he-f1',
      },
      {
        id: 'nasihat-lanjut',
        skillId: 'nasihat-dini',
        text: 'Bagus, sekarang tolak aja semua permintaan lain juga. Jangan setengah-setengah.',
        next: 'he-tegang-bk',
      },
      {
        id: 'remehkan-kecil',
        skillId: 'meremehkan',
        text: 'Itu cuma satu permintaan dari satu teman. Belum perlu dibanggakan.',
        next: 'he-tegang-bk',
      },
    ],
  },
  {
    id: 'he-f1',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Tapi jujurly, tiap ada chat masuk, jempolku masih langsung gatal mau ngetik "siap". Makasih udah nemenin aku latihan, ya.',
      expression: 'lega',
      cue: 'Hendra menatap ponselnya yang menyala, menahan jempol di atas layar, lalu menghela napas dan membiarkan layarnya padam sendiri.',
      aside: 'Dari meja sebelah, Rendy mengangkat tangan sambil tersenyum, lalu kembali membersihkan nozzle printernya sendiri.',
    },
    choices: [
      {
        id: 'refleksi-gatal',
        skillId: 'refleksi-perasaan',
        text: 'Kamu lega bisa menunda, tapi dorongan langsung membantu masih ada. Dua-duanya wajar.',
        next: '@ending',
        best: true,
        options: { reflectionNuance: 'lelah-kewalahan' },
      },
      {
        id: 'validasi-gatal',
        skillId: 'validasi-normalisasi',
        text: 'Mengubah kebiasaan langsung mengiyakan memang butuh waktu, dan itu wajar banget.',
        next: '@ending',
      },
      {
        id: 'tanya-pilihan',
        skillId: 'pertanyaan-terbuka',
        text: 'Kalau kamu yang tentukan, kalimat apa lagi yang pengin kamu latih berikutnya?',
        next: '@ending',
      },
      {
        id: 'tanya-tertutup',
        skillId: 'pertanyaan-tertutup',
        text: 'Jadi minggu depan kamu nolak satu permintaan lagi, kan?',
        next: '@ending',
      },
    ],
  },
  {
    id: 'he-akhir-terbantu',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Aku masih sering pengin bilang siap, tapi sekarang kalimat itu ada di sakuku. Hari Jumat kukabarin kalau casing-nya udah kelar, ya.',
      expression: 'lega',
      cue: 'Hendra menempelkan kertas kecil itu di sisi printer, lalu membalikkan ponselnya dan mulai memasang lapisan cetak berikutnya dengan tenang.',
      aside: 'Di meja printer 3D, antrean orang yang meminta tolong kini menunggu giliran dengan sabar, dan Hendra tak lagi berlari ke semuanya sekaligus.',
    },
    choices: [],
    ending: { kind: 'terbantu' },
  },
  {
    id: 'he-akhir-kemajuan',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Aku coba pelan-pelan dulu, ya. Satu permintaan kutunda dulu, sisanya kupikirin lagi minggu depan.',
      expression: 'netral',
      cue: 'Hendra mengangguk, menyimpan buku catatannya di tas, dan tersenyum tipis sambil membiarkan ponselnya bergetar sekali lagi.',
      aside: 'Langkah kecil sudah dimulai. Pintu untuk bertemu lagi tetap terbuka, dan kamu bisa melanjutkan percakapan ini kapan saja.',
    },
    choices: [],
    ending: { kind: 'kemajuan-kecil' },
  },
  {
    id: 'he-akhir-menarik',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Maaf ya, aku balik dulu. Banyak yang minta tolong, kasihan mereka nunggu.',
      expression: 'menutup-diri',
      cue: 'Hendra tersenyum ramah, mengambil kotak peralatan, lalu berjalan ke meja lain tanpa menoleh.',
      aside: 'Hubungan ini masih dapat dipulihkan. Pertemuan berikutnya bisa dimulai dengan lebih pelan, dan Hendra yang menentukan tempo.',
    },
    choices: [],
    ending: { kind: 'menarik-diri-sementara' },
  },
];
