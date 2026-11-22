import type { StoryNode } from '../../engine/story/storyTypes';

/**
 * Ayu Permata (mhs-05): adegan lanjutan (epilog di meja firmware) dan tiga akhir.
 * Id simpul: ay-f0, ay-f1 (penutup bersama), ay-akhir-terbantu, ay-akhir-kemajuan, ay-akhir-menarik.
 * Dirakit di mhs-05.ts. Ringkasan tidak memakai label menang, kalah, atau game over.
 */

const SCENE = 'lanjutan';

export const AYU_LANJUTAN_NODES: StoryNode[] = [
  {
    id: 'ay-f0',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    marks: ['kejutan'],
    reply: {
      text: 'Bu, lihat! Dashboard-nya jalan sampai tuntas, versi kecil. Tadi kakak tingkat balas, katanya bagian legenda warnanya enak dibaca. Terus, ini aneh, aku nggak langsung kepikiran ide baru.',
      expression: 'tersenyum',
      cue: 'Ayu memutar laptop menghadap Dosen dengan kedua tangan, lalu menahan senyum sambil menunjuk satu pojok layar.',
      aside: 'Beberapa hari kemudian. Di pinggir layar dashboard, sebuah tulisan kecil bertanda "100%" menggantikan angka enam puluh.',
    },
    choices: [
      {
        id: 'afirmasi-langkah',
        skillId: 'afirmasi-kekuatan',
        text: 'Kamu menuntaskan satu hal sampai selesai. Itu pencapaian yang nyata, Ayu.',
        next: 'ay-f1',
        best: true,
        reaction: {
          text: 'Hehe, makasih, Bu. Jujur tanganku masih gatal mau mulai proyek baru, tapi sekarang aku udah tahu rasanya sampai selesai, jadi bisa milih.',
          expression: 'lega',
          cue: 'Ayu tertawa kecil dan menggaruk telapak tangannya.',
          aside: 'Dari meja sebelah, seorang teman firmware mengangkat gelas kopinya ke arah Ayu sambil tetap menatap layar.',
        },
      },
      {
        id: 'tanya-rasa',
        skillId: 'pertanyaan-terbuka',
        text: 'Waktu melihat angka seratus itu, apa yang kamu rasakan?',
        next: 'ay-f1',
        reaction: {
          text: 'Pas lihat angka seratus itu, bangga banget, Bu, sama geli. Tapi tanganku masih gatal mau mulai proyek baru; bedanya sekarang aku bisa milih.',
          expression: 'lega',
          cue: 'Ayu menunjuk pojok layar dan tersenyum lebar sambil menggoyang kakinya.',
          aside: 'Dari meja sebelah, seorang teman firmware mengangkat gelas kopinya ke arah Ayu sambil tetap menatap layar.',
        },
      },
      {
        id: 'nasihat-lanjut',
        skillId: 'nasihat-dini',
        text: 'Bagus, sekarang kirim formulir magangnya hari ini juga. Jangan ditunda lagi.',
        next: 'ay-tegang-bk',
      },
      {
        id: 'remehkan-kecil',
        skillId: 'meremehkan',
        text: 'Itu baru versi kecil. Belum cukup untuk dibanggakan.',
        next: 'ay-tegang-bk',
      },
    ],
  },
  {
    id: 'ay-f1',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Tapi, jujur, tanganku masih gatal mau mulai proyek baru. Bedanya, sekarang aku tahu rasanya sampai selesai, jadi aku bisa milih. Makasih ya, Bu.',
      expression: 'lega',
      cue: 'Ayu menutup halaman sketsa baru yang baru setengah digambar, lalu menekan sampulnya dengan telapak tangan, seolah menyimpannya untuk nanti.',
      aside: 'Dari meja sebelah, seorang teman firmware mengangkat gelas kopinya ke arah Ayu sambil tetap menatap layar.',
    },
    choices: [
      {
        id: 'refleksi-gatal',
        skillId: 'refleksi-perasaan',
        text: 'Kamu senang bisa menuntaskan, tapi masih ingin mencoba hal baru. Dua-duanya boleh.',
        next: '@ending',
        best: true,
        options: { reflectionNuance: 'ragu-kurang-percaya' },
      },
      {
        id: 'validasi-gatal',
        skillId: 'validasi-normalisasi',
        text: 'Punya banyak minat sambil belajar menuntaskan satu per satu itu manusiawi.',
        next: '@ending',
      },
      {
        id: 'tanya-pilihan',
        skillId: 'pertanyaan-terbuka',
        text: 'Kalau kamu yang menentukan, langkah kecil apa lagi yang terasa menyenangkan?',
        next: '@ending',
      },
      {
        id: 'tanya-tertutup',
        skillId: 'pertanyaan-tertutup',
        text: 'Jadi minggu depan formulirnya kamu kirim, kan?',
        next: '@ending',
      },
    ],
  },
  {
    id: 'ay-akhir-terbantu',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Aku masih punya banyak ide, tapi sekarang rasanya itu bukan tanda aku nggak punya arah. Kita lanjut ngobrol minggu depan, ya.',
      expression: 'lega',
      cue: 'Ayu mengetik pesan singkat, menekan tombol kirim dengan satu ketukan mantap, lalu menoleh dan tertawa lepas.',
      aside: 'Di layar laptop Ayu, bilah status kecil bertuliskan "formulir terkirim" muncul di antara jendela-jendela lain.',
    },
    choices: [],
    ending: { kind: 'terbantu' },
  },
  {
    id: 'ay-akhir-kemajuan',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Aku coba pelan-pelan dulu, ya. Satu dashboard dulu, sisanya kupikir lagi minggu depan.',
      expression: 'netral',
      cue: 'Ayu mengangguk, membuka satu berkas proyek lama, dan tersenyum tipis sambil menggulir layarnya perlahan.',
      aside: 'Langkah kecil sudah dimulai. Pintu untuk bertemu lagi tetap terbuka, dan kamu bisa melanjutkan percakapan ini kapan saja.',
    },
    choices: [],
    ending: { kind: 'kemajuan-kecil' },
  },
  {
    id: 'ay-akhir-menarik',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Maaf ya, Bu, aku harus balik ke tim dulu. Ada rapat dadakan, nanti kapan-kapan aja ngobrolnya.',
      expression: 'menutup-diri',
      cue: 'Ayu tersenyum lebar, menyambar buku sketsanya, dan berjalan cepat ke meja firmware tanpa menoleh ke belakang.',
      aside: 'Hubungan ini masih dapat dipulihkan. Pertemuan berikutnya bisa dimulai dengan lebih pelan, dan Ayu yang menentukan tempo.',
    },
    choices: [],
    ending: { kind: 'menarik-diri-sementara' },
  },
];
