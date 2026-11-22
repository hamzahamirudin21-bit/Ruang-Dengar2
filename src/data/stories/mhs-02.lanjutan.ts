import type { StoryNode } from '../../engine/story/storyTypes';

/**
 * Dimas Aditya (mhs-02): adegan lanjutan (epilog di meja solder) dan tiga akhir.
 * Id simpul: di-f0, di-f1 (penutup bersama), di-akhir-terbantu, di-akhir-kemajuan, di-akhir-menarik.
 * Dirakit di mhs-02.ts. Ringkasan tidak memakai label menang, kalah, atau game over.
 */

const SCENE = 'lanjutan';

export const MHS_02_LANJUTAN_NODES: StoryNode[] = [
  {
    id: 'di-f0',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    marks: ['kejutan'],
    reply: {
      text: 'Pesannya udah kukirim kemarin malam. Tadi pagi dibalas, katanya ada formulir daring. Nih, ponselku nggak kututup lagi.',
      expression: 'tersenyum',
      cue: 'Dimas meletakkan ponselnya di samping papan solder dengan layar menghadap atas, lalu melirik Dosen seolah menunggu reaksi.',
      aside: 'Beberapa hari kemudian, lab sore itu lengang. Di layar terbaca balasan: "Formulir keringanan bisa diisi daring, silakan dilengkapi."',
    },
    choices: [
      {
        id: 'pengamatan-ponsel',
        skillId: 'sampaikan-pengamatan',
        text: 'Kali ini ponselmu kamu biarkan terbuka. Aku perhatikan perbedaannya.',
        reaction: { text: 'Iya, sengaja. Rasanya aneh, tapi nggak buruk.', expression: 'tertegun', cue: 'Dimas menatap ponsel yang tergeletak menghadap atas.' },
        options: { observationTone: 'faktual' },
        next: 'di-f1',
        best: true,
      },
      {
        id: 'afirmasi-langkah',
        skillId: 'afirmasi-kekuatan',
        text: 'Kamu merumuskan pesan, memilih waktu, lalu mengirimnya. Itu langkah nyata, Dimas.',
        reaction: { text: 'Iya, nggak semudah kedengarannya, tapi udah kukirim.', expression: 'lega', cue: 'Dimas mengangguk dan tersenyum samar.' },
        next: 'di-f1',
      },
      {
        id: 'nasihat-isi',
        skillId: 'nasihat-dini',
        text: 'Langsung isi saja formulirnya malam ini juga. Jangan ditunda lagi.',
        next: 'di-tegang-bk',
      },
      {
        id: 'remehkan-kecil',
        skillId: 'meremehkan',
        text: 'Itu baru satu pesan. Urusan biayanya masih panjang.',
        next: 'di-tegang-bk',
      },
    ],
  },
  {
    id: 'di-f1',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Formulirnya udah kuisi setengah. Sisanya besok. Makasih ya, kemarin kamu nggak bikin aku merasa dipajang.',
      expression: 'lega',
      cue: 'Dimas mengetuk layar ponselnya pelan, lalu menoleh ke asisten lab yang mengangkat pinset kecil dari seberang ruangan.',
      aside: 'Asisten lab itu menunjuk papan solder Dimas dan mengacungkan jempol. Dimas tertawa pendek, tawa pertama hari itu.',
    },
    choices: [
      {
        id: 'refleksi-lega',
        skillId: 'refleksi-perasaan',
        text: 'Kamu lega karena langkahnya bisa kamu pegang sendiri, tanpa disorot orang.',
        next: '@ending',
        best: true,
        options: { reflectionNuance: 'lelah-kewalahan' },
      },
      {
        id: 'validasi-setengah',
        skillId: 'validasi-normalisasi',
        text: 'Setengah formulir pun sudah kemajuan. Kamu boleh menyelesaikannya dengan tempomu.',
        next: '@ending',
      },
      {
        id: 'tanya-pilihan',
        skillId: 'pertanyaan-terbuka',
        text: 'Bagian mana dari sisa formulir yang terasa paling berat untuk diisi besok?',
        next: '@ending',
      },
      {
        id: 'tanya-tertutup-selesai',
        skillId: 'pertanyaan-tertutup',
        text: 'Jadi besok pasti selesai, kan?',
        next: '@ending',
      },
    ],
  },
  {
    id: 'di-akhir-terbantu',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Aku masih nggak suka kalau ditanyain soal uang. Tapi kayaknya, minta bantuan lewat jalur yang bener itu bukan hal memalukan.',
      expression: 'lega',
      cue: 'Dimas kembali ke mikroskop, tetapi sebelum menyalakan solder ia meletakkan ponselnya di meja, terbuka dan tidak lagi disembunyikan.',
      aside: 'Di layar ponsel itu terlihat formulir yang hampir selesai diisi.',
    },
    choices: [],
    ending: { kind: 'terbantu' },
  },
  {
    id: 'di-akhir-kemajuan',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Aku pikirin dulu soal formulirnya. Mungkin lain kali aku cerita lebih banyak.',
      expression: 'netral',
      cue: 'Dimas mengangguk, memasukkan ponsel ke saku, lalu menyalakan solder dan membungkuk ke arah mikroskop.',
      aside: 'Langkah kecil sudah dimulai. Pintu untuk bertemu lagi tetap terbuka, dan kamu bisa melanjutkan percakapan ini kapan saja.',
    },
    choices: [],
    ending: { kind: 'kemajuan-kecil' },
  },
  {
    id: 'di-akhir-menarik',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Kayaknya hari ini cukup. Aku balik ke bangku dulu, targetku belum kelar.',
      expression: 'menutup-diri',
      cue: 'Dimas berdiri, merapatkan tangan ke saku tempat ponselnya, lalu berjalan ke meja solder tanpa menoleh.',
      aside: 'Hubungan ini masih dapat dipulihkan. Pertemuan berikutnya bisa dimulai lebih pelan, dan Dimas yang menentukan tempo.',
    },
    choices: [],
    ending: { kind: 'menarik-diri-sementara' },
  },
];
