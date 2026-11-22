/**
 * Cerita Dimas Aditya (mhs-02), adegan Ruang BK bagian rencana dan Ketegangan.
 *
 * Simpul: di-b13 (langkah kecil), di-b14 (penutup sesi dan janji tindak lanjut),
 * di-tegang-bk (Ketegangan awal, jenis `menarik-diri`, dipakai sebagai
 * `tensionFallbackNodeId`), di-perbaikan-bk (hub perbaikan).
 *
 * Perilaku Runner: pilihan yang mengabaikan Ketegangan kembali ke di-tegang-bk; dua kali
 * berturut-turut menutup sesi. Hub perbaikan memakai rute `@resume` bila keretakan nonaktif;
 * langkah `beri-pilihan` sengaja tanpa `reaction` agar simpul yang dilanjutkan tampil dengan
 * ucapannya sendiri.
 */
import type { StoryChoice, StoryNode, StoryRoute } from '../../engine/story/storyTypes';

const SCENE = 'bk';
const TEGANG = 'di-tegang-bk';
const PERBAIKAN = 'di-perbaikan-bk';

const RESUME_WHEN_REPAIRED: StoryRoute[] = [
  { when: [{ type: 'tension', active: false }], next: '@resume' },
];

const DI_B13: StoryNode = {
  id: 'di-b13',
  sceneId: SCENE,
  stage: 'rencana',
  depth: 1,
  reply: {
    text:
      'Mungkin aku bisa kirim satu pesan ke bagian kemahasiswaan, tanya soal keringanan. ' +
      'Lewat pesan aja, nggak usah datang dan antre di depan orang.',
    expression: 'netral',
    cue: 'Dimas membuka layar ponselnya, mengetik beberapa kata di kolom pesan, lalu mengangkat pandangan sekilas.',
  },
  choices: [
    {
      id: 'a',
      skillId: 'pertanyaan-terbuka',
      text: 'Isi pesan itu kira-kira apa, dan kapan waktu yang terasa aman buat mengirimnya?',
      reaction: { text: 'Isinya singkat aja, tanya soal keringanan. Kirimnya malam hari yang aman.', expression: 'netral', cue: 'Dimas menghitung waktu dengan ujung jari.' },
      next: 'di-b14',
      best: true,
      setFlags: ['langkah-kecil'],
    },
    {
      id: 'b',
      skillId: 'parafrase-ringkasan',
      text: 'Jadi satu pesan ke kemahasiswaan, tanpa datang langsung. Aku menangkapnya tepat?',
      reaction: { text: 'Iya, lewat pesan, nggak perlu datang. Tepat.', expression: 'netral', cue: 'Dimas mengangguk sekali.' },
      next: 'di-b14',
      setFlags: ['langkah-kecil'],
    },
    {
      id: 'c',
      skillId: 'nasihat-dini',
      text: 'Sebaiknya datang langsung saja besok pagi, biar urusannya cepat beres.',
      next: 'di-b14',
      reaction: {
        text: 'Besok pagi ada praktikum. Lagian aku belum siap ketemu orang buat bahas ini.',
        expression: 'lelah',
        cue: 'Dimas menutup layar ponselnya dan menaruhnya terbalik di pangkuan.',
      },
    },
    {
      id: 'd',
      skillId: 'janji-mutlak',
      text: 'Pasti disetujui kok. Aku jamin keringanannya turun.',
      next: 'di-b14',
      reaction: {
        text: 'Kalau ternyata nggak turun, gimana? Kamu kan nggak bisa tahu.',
        expression: 'waspada',
        cue: 'Dimas tersenyum tipis, tetapi jempolnya menekan tepi ponsel dengan keras.',
      },
    },
  ],
};

const DI_B14: StoryNode = {
  id: 'di-b14',
  sceneId: SCENE,
  stage: 'rencana',
  depth: 1,
  reply: {
    text:
      'Makasih udah dengerin. Tapi yang tadi nggak bakal nyebar ke anak-anak lab, kan? ' +
      'Terus... kita ketemu lagi nggak?',
    expression: 'cemas',
    cue: 'Dimas berdiri, memasukkan ponsel ke saku, dan menatap Dosen dengan ragu sebelum meraih tasnya.',
  },
  choices: [
    {
      id: 'a',
      skillId: 'afirmasi-kekuatan',
      text: 'Kamu berani menyusun langkahmu sendiri. Tiga hari lagi aku menyapamu di lab, ya.',
      reaction: { text: 'Hm, oke. Kutunggu tiga hari lagi.', expression: 'tersenyum', cue: 'Sudut bibir Dimas terangkat tipis sebelum ia berdiri.' },
      next: 'di-f0',
      best: true,
      action: { kind: 'janji', dueDayOffset: 3 },
    },
    {
      id: 'b',
      skillId: 'batas-kerahasiaan',
      text: 'Ceritamu tetap di antara kita, kecuali menyangkut keselamatanmu. Pintu ini terbuka.',
      reaction: { text: 'Oke. Kalau gitu aku tenang.', expression: 'lega', cue: 'Dimas menghembuskan napas dan bahunya turun.' },
      next: 'di-f0',
    },
    {
      id: 'c',
      skillId: 'janji-mutlak',
      text: 'Aku jamin sesudah ini semua urusan biayamu pasti beres.',
      next: 'di-f0',
      reaction: {
        text: 'Oh. Oke. Semoga beneran gitu.',
        expression: 'waspada',
        cue: 'Dimas mengangguk singkat dan matanya beralih ke pintu.',
      },
    },
    {
      id: 'd',
      skillId: 'pertanyaan-tertutup',
      text: 'Jadi sekarang kamu sudah tidak ada beban lagi, kan?',
      next: 'di-f0',
      reaction: {
        text: 'Iya. Kayaknya sih.',
        expression: 'menutup-diri',
        cue: 'Dimas menjawab cepat, lalu merapikan tali tasnya tanpa menoleh.',
      },
    },
  ],
};

/** Ketegangan awal: balasan langsung setelah kesalahan pemula di Ruang BK. */
const DI_TEGANG_BK: StoryNode = {
  id: TEGANG,
  sceneId: SCENE,
  stage: 'eksplorasi',
  depth: 0,
  reply: {
    text: 'Ya udah. Mungkin aku salah datang. Nggak apa-apa.',
    expression: 'menutup-diri',
    cue: 'Dimas menggeser kursi ke belakang dan menutup saku ponselnya dengan telapak tangan.',
  },
  tension: { phase: 'awal', expectedKind: 'menarik-diri' },
  choices: [
    {
      id: 'a',
      skillId: 'sampaikan-pengamatan',
      text: 'Kalimatku tadi sepertinya membuatmu tertutup. Aku ingin mendengar dari sisimu.',
      next: PERBAIKAN,
      best: true,
      action: { kind: 'akui-ketegangan' },
      options: { observationTone: 'faktual' },
    },
    {
      id: 'b',
      skillId: 'validasi-normalisasi',
      text: 'Tidak apa-apa kalau belum nyaman. Kita lanjut pelan saja, ya.',
      next: TEGANG,
      reaction: {
        text: 'Hm. Lanjut aja.',
        expression: 'menutup-diri',
        cue: 'Dimas mengangguk, tetapi pandangannya tetap tertuju ke pintu.',
      },
    },
    {
      id: 'c',
      skillId: 'jeda-hening',
      text: 'Aku tunggu sebentar di sini.',
      next: TEGANG,
      reaction: {
        text: '...',
        expression: 'menutup-diri',
        cue: 'Dimas diam lama, ibu jarinya menggosok sudut ponsel di dalam saku.',
      },
    },
    {
      id: 'd',
      skillId: 'nasihat-dini',
      text: 'Jangan terlalu gengsi. Terbuka saja, nanti juga lega.',
      next: TEGANG,
      reaction: {
        text: 'Iya, iya. Aku paham.',
        expression: 'menutup-diri',
        cue: 'Dimas mengalihkan wajah ke jam dinding dan menarik napas dalam diam.',
      },
    },
  ],
};

function repairChoices(): StoryChoice[] {
  return [
    {
      id: 'a',
      skillId: 'validasi-normalisasi',
      text: 'Maaf, caraku tadi bisa terasa menekan. Dampaknya nyata buatmu, dan aku mengakuinya.',
      next: PERBAIKAN,
      best: true,
      action: { kind: 'perbaikan', step: 'akui-dampak' },
      routes: RESUME_WHEN_REPAIRED,
      reaction: {
        text: 'Hm... iya. Makasih udah bilang.',
        expression: 'waspada',
        cue: 'Dimas melirik Dosen sebentar; telapaknya perlahan lepas dari saku.',
      },
    },
    {
      id: 'b',
      skillId: 'pertanyaan-terbuka',
      text: 'Kalau boleh, ceritakan apa yang terasa waktu mendengar kalimatku tadi.',
      next: PERBAIKAN,
      action: { kind: 'perbaikan', step: 'eksplorasi-perasaan' },
      routes: RESUME_WHEN_REPAIRED,
      reaction: {
        text: 'Kayak ditelanjangi. Padahal kamu nggak berniat gitu, aku tahu.',
        expression: 'cemas',
        cue: 'Dimas berbicara pelan, matanya mengikuti garis di lantai.',
      },
    },
    {
      id: 'c',
      skillId: 'jeda-hening',
      text: 'Kita bisa lanjut pelan, ganti topik, atau cukup sampai sini. Kamu yang memutuskan.',
      next: PERBAIKAN,
      action: { kind: 'perbaikan', step: 'beri-pilihan' },
      routes: RESUME_WHEN_REPAIRED,
    },
    {
      id: 'd',
      skillId: 'nasihat-dini',
      text: 'Sudahlah, lupakan yang tadi. Yang penting kamu tetap semangat.',
      next: PERBAIKAN,
      reaction: {
        text: 'Iya. Oke.',
        expression: 'menutup-diri',
        cue: 'Dimas mengangguk kecil, suaranya nyaris tak terdengar.',
      },
    },
  ];
}

/** Hub perbaikan: tiga langkah perbaikan dan satu opsi keliru (empat pilihan). */
const DI_PERBAIKAN_BK: StoryNode = {
  id: PERBAIKAN,
  sceneId: SCENE,
  stage: 'eksplorasi',
  depth: 0,
  reply: {
    text: 'Hm. Tadi memang kurang enak. Tapi aku masih mau denger kamu.',
    expression: 'waspada',
    cue: 'Dimas duduk kembali agak ke depan; belum rileks, tetapi tidak lagi mundur dari meja.',
  },
  tension: { phase: 'perbaikan', expectedKind: 'menarik-diri' },
  choices: repairChoices(),
};

export const DI_BK_RENCANA_NODES: StoryNode[] = [DI_B13, DI_B14, DI_TEGANG_BK, DI_PERBAIKAN_BK];

/** Id simpul Ketegangan fase awal; dipakai sebagai `tensionFallbackNodeId`. */
export const DI_TENSION_FALLBACK_NODE_ID = TEGANG;
