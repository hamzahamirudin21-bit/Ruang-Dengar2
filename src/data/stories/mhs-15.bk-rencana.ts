/**
 * Cerita Naufal Hakim (mhs-15), adegan Ruang BK bagian rencana dan Ketegangan.
 *
 * Simpul: na-b13 (langkah kecil: satu usul tertulis dengan nama), na-b14 (penutup sesi dan janji),
 * na-tegang-bk (Ketegangan awal, jenis `menarik-diri`, dipakai sebagai `tensionFallbackNodeId`),
 * na-perbaikan-bk (hub perbaikan).
 */
import type { StoryChoice, StoryNode, StoryRoute } from '../../engine/story/storyTypes';

const SCENE = 'bk';

const RESUME_WHEN_REPAIRED: StoryRoute[] = [
  { when: [{ type: 'tension', active: false }], next: '@resume' },
];

const NA_B13: StoryNode = {
  id: 'na-b13',
  sceneId: SCENE,
  stage: 'rencana',
  depth: 1,
  reply: {
    text:
      'Mungkin... sebelum rapat Jumat aku tulis satu usul aja di dokumen bersama, lengkap dengan namaku. ' +
      'Terus aku minta ketua kelompok bacain dulu sebelum yang lain nyahut.',
    expression: 'netral',
    cue: 'Naufal membuka laptop, mengetik satu baris judul, lalu menatap Dosen sambil membiarkan layarnya terbuka.',
  },
  choices: [
    {
      id: 'a',
      skillId: 'pertanyaan-terbuka',
      text: 'Usul yang mana yang paling ingin kamu tulis, dan kapan mau kamu kirim?',
      reaction: {
        text: 'Yang soal engsel dari kaleng bekas itu, Dosen, dikirim Kamis malam biar ketua sempat baca. Oh ya, soal catatan tadi, jangan sampai orang kelompokku tahu. Dan Dosen bakal tanya hasilnya, kan? Aku mau lihat Dosen ingat atau nggak.',
        expression: 'cemas',
        cue: 'Naufal berdiri, memasukkan laptop ke tas dengan hati-hati, lalu menahan pintu sebentar sambil menunggu jawaban.',
      },
      next: 'na-b14',
      best: true,
      setFlags: ['langkah-kecil'],
    },
    {
      id: 'b',
      skillId: 'parafrase-ringkasan',
      text: 'Jadi satu usul tertulis dengan namamu, dibacakan ketua dulu. Sudah tepat?',
      reaction: {
        text: 'Tepat. Satu aja dulu. Udah ya, aku mau jalan. Tapi soal catatan tadi, jangan sampai orang kelompokku tahu. Terus, Dosen bakal nanya hasilnya, kan? Aku mau lihat Dosen ingat apa nggak.',
        expression: 'cemas',
        cue: 'Naufal berdiri, memasukkan laptop ke tas, lalu berhenti di pintu dan menunggu jawaban Dosen.',
      },
      next: 'na-b14',
      setFlags: ['langkah-kecil'],
    },
    {
      id: 'c',
      skillId: 'nasihat-dini',
      text: 'Tulis saja semua sketsamu sekaligus dan kirim ke seluruh grup malam ini.',
      next: 'na-b14',
      reaction: {
        text: 'Semua sekaligus? Nanti malah tenggelam dan makin nggak dibaca.',
        expression: 'cemas',
        cue: 'Naufal menutup layar laptop setengah dan menekan sudutnya dengan jempol.',
      },
    },
    {
      id: 'd',
      skillId: 'janji-mutlak',
      text: 'Timmu pasti kagum. Aku jamin idemu langsung diterima.',
      next: 'na-b14',
      reaction: {
        text: 'Jangan janji begitu. Nanti kalau nggak kejadian, aku yang makin malu.',
        expression: 'waspada',
        cue: 'Naufal menghentikan ketikannya dan menatap Dosen lekat-lekat.',
      },
    },
  ],
};

const NA_B14: StoryNode = {
  id: 'na-b14',
  sceneId: SCENE,
  stage: 'rencana',
  depth: 1,
  reply: {
    text:
      'Soal catatan tadi, jangan sampai orang kelompokku tahu ya. ' +
      'Dan... Dosen bakal tanya hasilnya, kan? Aku mau lihat Dosen ingat atau nggak.',
    expression: 'cemas',
    cue: 'Naufal berdiri, memasukkan laptop ke tas dengan hati-hati, lalu menahan pintu sebentar sambil menunggu jawaban.',
  },
  choices: [
    {
      id: 'a',
      skillId: 'afirmasi-kekuatan',
      text: 'Kamu berani nulis usul pakai namamu sendiri. Tiga hari lagi aku mampir ke meja printer.',
      reaction: {
        text: 'Dosen datang beneran, ya. Tiga hari lalu aku tulis usulnya pakai namaku, dan ketua kelompok bacain dulu. Dito sampai bilang, "Itu idenya Naufal, kan?" Aku bengong, lupa nyangkal.',
        expression: 'tersenyum',
        cue: 'Naufal duduk di depan printer 3D dengan laptop terbuka di meja, bukan di pelukan, dan mengangkat sebuah dudukan sensor dari tutup botol.',
        aside: 'Beberapa hari kemudian. Di dokumen bersama kelompok, satu baris usul sekarang bertanda nama Naufal.',
      },
      next: 'na-f0',
      best: true,
      action: { kind: 'janji', dueDayOffset: 3 },
    },
    {
      id: 'b',
      skillId: 'batas-kerahasiaan',
      text: 'Catatan itu tetap di antara kita, kecuali soal keselamatanmu. Pintu ini selalu terbuka.',
      reaction: {
        text: 'Oke, aku pegang omongan Dosen. Dan Dosen datang beneran, hm. Usulku kemarin dibacain ketua duluan. Dito malah nanya, "Itu idenya Naufal, kan?" Aku bengong, nggak sempat nyangkal.',
        expression: 'tersenyum',
        cue: 'Naufal duduk di depan printer 3D dengan laptop terbuka di meja, lalu mengangkat sebuah dudukan sensor dari tutup botol.',
        aside: 'Beberapa hari kemudian. Di dokumen bersama kelompok, satu usul kini tercatat dengan nama Naufal.',
      },
      next: 'na-f0',
    },
    {
      id: 'c',
      skillId: 'janji-mutlak',
      text: 'Aku jamin setelah ini kelompokmu tidak akan pernah menyela lagi.',
      next: 'na-f0',
      reaction: {
        text: 'Hmm. Ya. Kita lihat aja nanti.',
        expression: 'waspada',
        cue: 'Naufal tersenyum miring dan mengeratkan tali tasnya.',
      },
    },
    {
      id: 'd',
      skillId: 'pertanyaan-tertutup',
      text: 'Jadi sekarang kamu udah merasa dihargai, kan?',
      next: 'na-f0',
      reaction: {
        text: 'Udah. Lumayan. Kayak yang Dosen mau dengar.',
        expression: 'menutup-diri',
        cue: 'Naufal menjawab datar sambil menatap lampu langit-langit.',
      },
    },
  ],
};

/** Ketegangan awal: balasan langsung setelah kesalahan pemula di Ruang BK. */
const NA_TEGANG_BK: StoryNode = {
  id: 'na-tegang-bk',
  sceneId: SCENE,
  stage: 'eksplorasi',
  depth: 0,
  reply: {
    text: 'Ya udah. Mungkin kita udahan aja. Dosen udah punya jawabannya sebelum aku selesai ngomong.',
    expression: 'menutup-diri',
    cue: 'Naufal memeluk laptop erat, bergeser ke tepi kursi, dan memandang pintu keluar.',
  },
  tension: { phase: 'awal', expectedKind: 'menarik-diri' },
  choices: [
    {
      id: 'a',
      skillId: 'sampaikan-pengamatan',
      text: 'Kalimatku tadi motong ceritamu. Aku mau dengar sisimu sampai selesai.',
      next: 'na-perbaikan-bk',
      best: true,
      action: { kind: 'akui-ketegangan' },
      options: { observationTone: 'faktual' },
    },
    {
      id: 'b',
      skillId: 'validasi-normalisasi',
      text: 'Nggak apa-apa kalau mau berhenti. Kita lanjut pelan aja kalau kamu mau.',
      next: 'na-tegang-bk',
      reaction: {
        text: 'Terserah. Sama aja.',
        expression: 'menutup-diri',
        cue: 'Naufal mengangkat bahu dan menatap sampul laptopnya.',
      },
    },
    {
      id: 'c',
      skillId: 'jeda-hening',
      text: 'Aku tunggu sebentar di sini ya.',
      next: 'na-tegang-bk',
      reaction: {
        text: '...',
        expression: 'menutup-diri',
        cue: 'Naufal tidak bergerak, hanya jari-jarinya yang mengetuk sampul laptop tanpa ritme.',
      },
    },
    {
      id: 'd',
      skillId: 'nasihat-dini',
      text: 'Jangan terlalu dipikirkan. Coba lebih santai dengan teman-teman kelompokmu.',
      next: 'na-tegang-bk',
      reaction: {
        text: 'Iya. Noted. Seperti biasa.',
        expression: 'menutup-diri',
        cue: 'Naufal tersenyum kering lalu memalingkan wajah ke jendela.',
      },
    },
  ],
};

function repairChoices(): StoryChoice[] {
  return [
    {
      id: 'a',
      skillId: 'validasi-normalisasi',
      text: 'Maaf, tadi aku memotongmu. Itu pasti terasa, dan mengulang apa yang kamu alami.',
      next: 'na-perbaikan-bk',
      best: true,
      action: { kind: 'perbaikan', step: 'akui-dampak' },
      routes: RESUME_WHEN_REPAIRED,
      reaction: {
        text: 'Hm. Ternyata Dosen bisa ngaku salah juga.',
        expression: 'waspada',
        cue: 'Naufal melirik Dosen, lalu perlahan menurunkan laptop ke pangkuan.',
      },
    },
    {
      id: 'b',
      skillId: 'pertanyaan-terbuka',
      text: 'Kalau boleh, ceritain apa yang kamu rasakan waktu aku motong tadi.',
      next: 'na-perbaikan-bk',
      action: { kind: 'perbaikan', step: 'eksplorasi-perasaan' },
      routes: RESUME_WHEN_REPAIRED,
      reaction: {
        text: 'Rasanya persis kayak rapat. Aku ngomong, tapi semuanya udah diputuskan.',
        expression: 'cemas',
        cue: 'Naufal berbicara pelan, jarinya mengikuti tepi laptop berulang kali.',
      },
    },
    {
      id: 'c',
      skillId: 'jeda-hening',
      text: 'Kita bisa lanjut pelan, ganti topik, atau cukup sampai sini. Terserah kamu aja.',
      next: 'na-perbaikan-bk',
      action: { kind: 'perbaikan', step: 'beri-pilihan' },
      routes: RESUME_WHEN_REPAIRED,
    },
    {
      id: 'd',
      skillId: 'nasihat-dini',
      text: 'Sudahlah, lupakan yang tadi. Yang penting kamu tetap semangat.',
      next: 'na-perbaikan-bk',
      reaction: {
        text: 'Siap. Oke.',
        expression: 'menutup-diri',
        cue: 'Naufal mengangguk kecil dan menarik laptop kembali ke dada.',
      },
    },
  ];
}

/** Hub perbaikan: tiga langkah perbaikan dan satu opsi keliru (empat pilihan). */
const NA_PERBAIKAN_BK: StoryNode = {
  id: 'na-perbaikan-bk',
  sceneId: SCENE,
  stage: 'eksplorasi',
  depth: 0,
  reply: {
    text: 'Oke. Aku masih mau lanjut, asal Dosen beneran nunggu aku selesai.',
    expression: 'waspada',
    cue: 'Naufal duduk kembali di tengah kursi, tetapi satu lengannya masih melingkar di laptop.',
  },
  tension: { phase: 'perbaikan', expectedKind: 'menarik-diri' },
  choices: repairChoices(),
};

export const NA_BK_RENCANA_NODES: StoryNode[] = [NA_B13, NA_B14, NA_TEGANG_BK, NA_PERBAIKAN_BK];

export const NA_TENSION_FALLBACK_NODE_ID = 'na-tegang-bk';
