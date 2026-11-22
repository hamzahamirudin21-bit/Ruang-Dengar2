import type { StoryNode } from '../../engine/story/storyTypes';

/**
 * Naufal Hakim (mhs-15): adegan lanjutan (epilog di meja printer 3D) dan tiga akhir.
 * Id simpul: na-f0, na-f1 (penutup bersama), na-akhir-terbantu, na-akhir-kemajuan, na-akhir-menarik.
 * Ringkasan tidak memakai label menang, kalah, atau game over.
 */

const SCENE = 'lanjutan';

export const MHS_15_LANJUTAN_NODES: StoryNode[] = [
  {
    id: 'na-f0',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    marks: ['kejutan'],
    reply: {
      text: 'Dosen datang beneran. Dan... ketua kelompok bacain usulku dulu kemarin. Dito sampai bilang, "Itu idenya Naufal, kan?" Aku bengong, lupa mau nyangkal.',
      expression: 'tersenyum',
      cue: 'Naufal duduk di depan printer 3D dengan laptop terbuka di meja, bukan di pelukan, dan mengangkat sebuah dudukan sensor dari tutup botol.',
      aside: 'Beberapa hari kemudian. Di dokumen bersama kelompok, satu baris usul kini bertanda nama Naufal.',
    },
    choices: [
      {
        id: 'afirmasi-langkah',
        skillId: 'afirmasi-kekuatan',
        text: 'Kamu nulis usul pakai namamu sendiri dan membiarkannya dibacakan. Itu langkah nyata.',
        reaction: {
          text: 'Hm, makasih, Dosen. Tapi nggak semulus itu juga. Begitu ada yang mulai nyela, dadaku langsung kencang lagi, pengin tutup laptop dan diam. Untung Dosen mau nungguin aku ngomong sampai habis.',
          expression: 'lega',
          cue: 'Naufal menaruh dudukan sensor di meja, lalu menepuk-nepuk sampul laptopnya sekali seolah menenangkannya.',
          aside: 'Dari meja seberang, Dito mengangkat tangan sedikit sambil menunjuk dudukan itu dan mengangguk.',
        },
        next: 'na-f1',
        best: true,
      },
      {
        id: 'tanya-rasa',
        skillId: 'pertanyaan-terbuka',
        text: 'Waktu namamu disebut Dito, kamu kepikiran apa?',
        reaction: {
          text: 'Kepikiran: "oh, ternyata dia tahu". Aneh, bukannya marah malah lega. Tapi pas yang lain mulai nyela, dadaku kencang lagi, pengin nutup laptop dan diam. Makasih udah nungguin aku selesai ngomong.',
          expression: 'lega',
          cue: 'Naufal meletakkan dudukan sensor di meja, lalu menepuk sampul laptopnya pelan sekali.',
          aside: 'Di seberang meja, Dito mengangkat tangan sedikit, menunjuk dudukan itu, lalu mengangguk.',
        },
        next: 'na-f1',
      },
      {
        id: 'nasihat-lanjut',
        skillId: 'nasihat-dini',
        text: 'Bagus, sekarang tulis saja semua usulmu setiap rapat. Jangan tanggung-tanggung.',
        next: 'na-tegang-bk',
      },
      {
        id: 'remehkan-kecil',
        skillId: 'meremehkan',
        text: 'Itu baru satu usul yang dibacakan. Belum ada artinya.',
        next: 'na-tegang-bk',
      },
    ],
  },
  {
    id: 'na-f1',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Tapi jujur, waktu yang lain mulai nyela, dadaku masih berasa kencang. Rasanya pengin nutup laptop dan diam lagi. Makasih udah nungguin aku selesai ngomong.',
      expression: 'lega',
      cue: 'Naufal menaruh dudukan sensor di meja, lalu menepuk-nepuk sampul laptopnya sekali seolah menenangkannya.',
      aside: 'Dari meja seberang, Dito mengangkat tangan sedikit sambil menunjuk dudukan itu dan mengangguk.',
    },
    choices: [
      {
        id: 'refleksi-mengencang',
        skillId: 'refleksi-perasaan',
        text: 'Kamu lega didengar, tapi tubuhmu masih siaga kalau disela. Dua rasa itu hadir bersamaan.',
        next: '@ending',
        best: true,
        options: { reflectionNuance: 'kecewa-kesal' },
      },
      {
        id: 'validasi-mengencang',
        skillId: 'validasi-normalisasi',
        text: 'Pelan-pelan bersuara lagi memang butuh waktu, dan itu manusiawi.',
        next: '@ending',
      },
      {
        id: 'tanya-pilihan',
        skillId: 'pertanyaan-terbuka',
        text: 'Kalau kamu yang menentukan, langkah kecil apa lagi yang terasa cukup nyaman minggu ini?',
        next: '@ending',
      },
      {
        id: 'tanya-tertutup',
        skillId: 'pertanyaan-tertutup',
        text: 'Jadi minggu depan kamu tulis usul lagi, kan?',
        next: '@ending',
      },
    ],
  },
  {
    id: 'na-akhir-terbantu',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Aku masih suka sinis sama rapat, tapi sekarang aku tahu ada orang yang ingat apa yang kubilang. Jumat depan, aku bawa dua usul, ya.',
      expression: 'lega',
      cue: 'Naufal menulis "Jumat, 2 usul + nama" di sampul stiker laptop, lalu membiarkannya terbuka sambil menyodorkan dudukan sensor ke Dito.',
      aside: 'Di meja printer, kursi kosong di sebelah Naufal kini ditarik oleh Dito, dan keduanya melihat layar yang sama.',
    },
    choices: [],
    ending: { kind: 'terbantu' },
  },
  {
    id: 'na-akhir-kemajuan',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Aku coba satu usul tertulis dulu. Sisanya... kita lihat aja gimana rapatnya.',
      expression: 'netral',
      cue: 'Naufal mengangguk, memeluk laptop lebih longgar dari sebelumnya, dan menggulung filamen sambil tersenyum tipis.',
      aside: 'Langkah kecil sudah dimulai. Pintu untuk bertemu lagi tetap terbuka, dan kamu bisa melanjutkan percakapan ini kapan saja.',
    },
    choices: [],
    ending: { kind: 'kemajuan-kecil' },
  },
  {
    id: 'na-akhir-menarik',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Udah ya, Dosen. Aku mau balik ke printer. Nggak ada gunanya diulang-ulang.',
      expression: 'menutup-diri',
      cue: 'Naufal mengambil laptopnya, memeluknya erat, dan berjalan ke meja printer tanpa menoleh.',
      aside: 'Hubungan ini masih dapat dipulihkan. Pertemuan berikutnya bisa dimulai dengan lebih pelan, dan Naufal yang menentukan tempo.',
    },
    choices: [],
    ending: { kind: 'menarik-diri-sementara' },
  },
];
