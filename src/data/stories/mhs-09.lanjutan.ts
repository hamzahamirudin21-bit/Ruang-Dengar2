import type { StoryNode } from '../../engine/story/storyTypes';

/**
 * Gilang Ramadhan (mhs-09): adegan lanjutan (epilog di meja bengkel) dan tiga akhir.
 * Id simpul: gi-f0, gi-f1 (penutup bersama), gi-akhir-terbantu, gi-akhir-kemajuan, gi-akhir-menarik.
 * Dirakit di mhs-09.ts. Ringkasan tidak memakai label menang, kalah, atau game over.
 */

const SCENE = 'lanjutan';

export const MHS_09_LANJUTAN_NODES: StoryNode[] = [
  {
    id: 'gi-f0',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    marks: ['kejutan'],
    reply: {
      text: 'Bu, tadi Rangga nepuk bahuku, bisik-bisik doang: "ada catatan kecil buat sambungan kedua, kukirim lewat chat." Aku sampai bengong. Sambungan yang kemarin juga kuanter, katanya rapi.',
      expression: 'tertegun',
      cue: 'Gilang berdiri di meja bengkel dengan lengan jaket tergulung, memperlihatkan bekas luka di pergelangan tanpa menutupinya, dan rahangnya tampak longgar.',
      aside: 'Beberapa hari kemudian. Di sudut meja las, sebuah dudukan baja berkilat mulus kini bertuliskan nama Gilang di label kecilnya.',
    },
    choices: [
      {
        id: 'afirmasi-langkah',
        reaction: {
          text: 'Hehe, ya... makasih, Bu. Masih canggung sih, tapi ternyata nggak seburuk bayanganku.',
          expression: 'tersenyum',
          cue: 'Gilang menggaruk belakang telinga dan tersenyum miring sambil menunduk.',
        },
        skillId: 'afirmasi-kekuatan',
        text: 'Kamu minta cara beda dan anter hasilmu sendiri. Itu berani banget, Gilang.',
        next: 'gi-f1',
        best: true,
      },
      {
        id: 'tanya-rasa',
        reaction: {
          text: 'Kaget, Bu. Terus lega. Soalnya nggak ada yang ngelihat.',
          expression: 'lega',
          cue: 'Gilang mengembuskan napas dan melonggarkan genggaman pada lengan jaketnya.',
        },
        skillId: 'pertanyaan-terbuka',
        text: 'Waktu Rangga bisik-bisik, apa yang pertama kamu rasain?',
        next: 'gi-f1',
      },
      {
        id: 'nasihat-lanjut',
        skillId: 'nasihat-dini',
        text: 'Bagus. Sekarang minta juga asisten dan dosenmu mengoreksi begitu.',
        next: 'gi-tegang-bk',
      },
      {
        id: 'remehkan-kecil',
        skillId: 'meremehkan',
        text: 'Itu cuma bisikan. Rangga memang sudah seharusnya begitu.',
        next: 'gi-tegang-bk',
      },
    ],
  },
  {
    id: 'gi-f1',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Tapi jujur, kalau ada yang komentar keras, rahangku masih langsung kaku duluan. Aku lagi belajar nahan lima detik sebelum jawab. Makasih udah mau dengerin, Bu.',
      expression: 'lega',
      cue: 'Gilang menarik napas dalam, menghitung pelan dengan jari di atas meja, lalu menurunkan bahunya.',
      aside: 'Dari mesin bubut, Rangga mengangkat tangan sebagai salam kecil. Gilang mengangguk singkat sebagai balasan.',
    },
    choices: [
      {
        id: 'refleksi-kaku',
        skillId: 'refleksi-perasaan',
        text: 'Kamu masih pengin bela diri pas dikomentari, tapi mau coba jeda. Dua-duanya nyata.',
        next: '@ending',
        best: true,
        options: { reflectionNuance: 'kecewa-kesal' },
      },
      {
        id: 'validasi-kaku',
        skillId: 'validasi-normalisasi',
        text: 'Refleks lama butuh waktu buat berubah, dan itu manusiawi.',
        next: '@ending',
      },
      {
        id: 'tanya-pilihan',
        skillId: 'pertanyaan-terbuka',
        text: 'Menurutmu sendiri, langkah kecil berikutnya apa yang terasa cukup nyaman?',
        next: '@ending',
      },
      {
        id: 'tanya-tertutup',
        skillId: 'pertanyaan-tertutup',
        text: 'Jadi minggu depan kamu pasti nggak marah lagi, kan?',
        next: '@ending',
      },
    ],
  },
  {
    id: 'gi-akhir-terbantu',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Kamis nanti aku mau ajuin aturan koreksi ke seluruh tim: lewat chat atau empat mata. Kalau Ibu mau duduk di belakang pas rapat, boleh banget.',
      expression: 'lega',
      cue: 'Gilang menempelkan secarik kertas bertuliskan "Koreksi: chat atau empat mata" di tepi meja las, lalu mengangguk pada Rangga yang sedang melihat.',
      aside: 'Di meja bengkel itu, dua orang yang kemarin bersitegang kini memeriksa satu sambungan las bersama, kepala saling berdekatan.',
    },
    choices: [],
    ending: { kind: 'terbantu' },
  },
  {
    id: 'gi-akhir-kemajuan',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Kucoba dulu sama Rangga aja. Yang lain... liat nanti deh.',
      expression: 'netral',
      cue: 'Gilang mengangguk singkat, memasukkan ponsel ke saku, dan menarik lengan jaketnya turun sambil tetap menatap Dosen.',
      aside: 'Langkah kecil sudah dimulai. Pintu untuk bertemu lagi tetap terbuka, dan kamu bisa melanjutkan percakapan ini kapan saja.',
    },
    choices: [],
    ending: { kind: 'kemajuan-kecil' },
  },
  {
    id: 'gi-akhir-menarik',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Udah ya. Aku mau lanjut kerja. Nggak usah ditungguin.',
      expression: 'menutup-diri',
      cue: 'Gilang menurunkan topeng las ke wajahnya, menyalakan mesin, dan memunggungi Dosen.',
      aside: 'Hubungan ini masih dapat dipulihkan. Pertemuan berikutnya bisa dimulai dengan lebih pelan, dan Gilang yang menentukan tempo.',
    },
    choices: [],
    ending: { kind: 'menarik-diri-sementara' },
  },
];
