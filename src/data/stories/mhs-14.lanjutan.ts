import type { StoryNode } from '../../engine/story/storyTypes';

/**
 * Rani Safitri (mhs-14): adegan lanjutan (epilog di dekat Meja Diskusi) dan tiga akhir.
 * Id simpul: r-f0, r-f1 (penutup bersama), r-akhir-terbantu, r-akhir-kemajuan, r-akhir-menarik.
 * Dirakit di mhs-14.ts. Ringkasan tidak memakai label menang, kalah, atau game over.
 */

const SCENE = 'lanjutan';

export const MHS_14_LANJUTAN_NODES: StoryNode[] = [
  {
    id: 'r-f0',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    marks: ['kejutan'],
    reply: {
      text: 'Eh, Bu... Kemarin aku akhirnya berani tanya ke asisten lab, cuma satu pertanyaan. Dia malah jelasin sambil senyum. Terus aku duduk di sini, dua kursi dari kelompok itu.',
      expression: 'tersenyum',
      cue: 'Rani duduk agak tegak. Buku catatannya terbuka di meja, dan ia sesekali melirik ke arah kelompok di ujung Meja Diskusi.',
      aside: 'Beberapa hari kemudian. Suasana lab siang itu tidak terlalu ramai, dan Meja Diskusi terisi beberapa orang.',
    },
    choices: [
      {
        id: 'afirmasi-langkah',
        skillId: 'afirmasi-kekuatan',
        text: 'Kamu susun pertanyaan, pilih waktu, lalu nanya. Usahamu nyata banget, Rani.',
        reaction: {
          text: 'Hehe, makasih, Dosen... Eh, barusan ada yang ngajak aku duduk bareng mereka. Aku bingung mau jawab apa. Makasih ya udah nemenin aku mikirin ini.',
          expression: 'tertegun',
          cue: 'Rani menggenggam sampul buku catatannya dengan dua tangan, lalu menoleh sebentar ke kelompok yang melambai kecil.',
          aside: 'Salah satu anggota kelompok di ujung meja menggeser kursinya, menyisakan tempat kosong.',
        },
        next: 'r-f1',
        best: true,
      },
      {
        id: 'tanya-rasa',
        skillId: 'pertanyaan-terbuka',
        text: 'Waktu duduk di dekat kelompok itu tadi, gimana rasanya buatmu?',
        reaction: {
          text: 'Deg-degan, Dosen, tapi enggak se-nyeremin dulu. Eh, barusan malah ada yang ngajak aku gabung duduk bareng, aku bingung mau jawab apa. Makasih udah nemenin aku mikirin ini ya.',
          expression: 'tertegun',
          cue: 'Rani menggenggam sampul bukunya dengan dua tangan dan menoleh sebentar ke arah kelompok yang melambai kecil.',
          aside: 'Seorang anggota kelompok di ujung meja menggeser kursinya, memberi tempat kosong.',
        },
        next: 'r-f1',
      },
      {
        id: 'nasihat-gabung',
        skillId: 'nasihat-dini',
        text: 'Kalau sudah sedekat itu, langsung gabung aja dan kenalan. Jangan ditunda.',
        next: 'r-tegang-bk',
      },
      {
        id: 'remehkan-kecil',
        skillId: 'meremehkan',
        text: 'Itu cuma satu pertanyaan dan duduk di kursi. Nggak usah dibesar-besarkan.',
        next: 'r-tegang-bk',
      },
    ],
  },
  {
    id: 'r-f1',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Tadi ada yang ngajak aku duduk bareng mereka. Aku bingung mau jawab apa... Tapi makasih ya, Bu, sudah nemenin aku mikirin ini pelan-pelan.',
      expression: 'tertegun',
      cue: 'Rani menggenggam sampul buku catatannya dengan dua tangan, lalu menoleh sebentar ke arah kelompok yang melambai kecil.',
      aside: 'Salah satu anggota kelompok di ujung meja menggeser kursinya, memberi tempat kosong.',
    },
    choices: [
      {
        id: 'refleksi-bingung',
        skillId: 'refleksi-perasaan',
        text: 'Kamu senang diajak, tapi ragu pantas ada di sana. Dua rasa itu muncul bareng.',
        next: '@ending',
        best: true,
        options: { reflectionNuance: 'ragu-kurang-percaya' },
      },
      {
        id: 'validasi-bingung',
        skillId: 'validasi-normalisasi',
        text: 'Bingung saat diajak itu wajar, apalagi kalau biasa mengerjakan semuanya sendiri.',
        next: '@ending',
      },
      {
        id: 'tanya-pilihan',
        skillId: 'pertanyaan-terbuka',
        text: 'Kalau kamu yang pilih, langkah paling kecil apa yang terasa nyaman sekarang?',
        next: '@ending',
      },
      {
        id: 'tanya-tertutup-duduk',
        skillId: 'pertanyaan-tertutup',
        text: 'Jadi kamu mau duduk bareng mereka, kan?',
        next: '@ending',
      },
    ],
  },
  {
    id: 'r-akhir-terbantu',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Aku masih deg-degan banget, tapi rasanya enggak sendirian lagi. Pelan-pelan aja, ya.',
      expression: 'lega',
      cue: 'Rani menarik kursi dan duduk di antara kelompok itu. Buku catatannya terbuka di meja, tidak lagi dipeluk.',
      aside: 'Seseorang menggeser lembar skema ke tengah meja, dan Rani ikut menunjuk satu bagian dengan ujung pulpennya.',
    },
    choices: [],
    ending: { kind: 'terbantu' },
  },
  {
    id: 'r-akhir-kemajuan',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Aku coba pelan-pelan dulu, ya. Mungkin lain kali aku duduk lebih dekat.',
      expression: 'netral',
      cue: 'Rani mengangguk, menutup buku catatannya dengan hati-hati, lalu tersenyum tipis ke arah meja diskusi.',
      aside: 'Langkah kecil sudah dimulai. Pintu untuk bertemu lagi tetap terbuka, dan kamu bisa melanjutkan percakapan ini kapan saja.',
    },
    choices: [],
    ending: { kind: 'kemajuan-kecil' },
  },
  {
    id: 'r-akhir-menarik',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Aku kayaknya belum siap hari ini. Aku balik ke mejaku dulu, ya.',
      expression: 'menutup-diri',
      cue: 'Rani berdiri, memeluk buku catatannya, lalu berjalan ke meja pojok tanpa menoleh.',
      aside: 'Hubungan ini masih dapat dipulihkan. Pertemuan berikutnya bisa dimulai dengan lebih pelan, dan Rani yang menentukan tempo.',
    },
    choices: [],
    ending: { kind: 'menarik-diri-sementara' },
  },
];
