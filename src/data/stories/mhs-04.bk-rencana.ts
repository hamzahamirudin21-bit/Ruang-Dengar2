/**
 * Cerita Kevin Gunawan (mhs-04), adegan Ruang BK bagian rencana dan Ketegangan.
 *
 * Simpul: ke-b13 (langkah kecil), ke-b14 (penutup sesi dan janji tindak lanjut),
 * ke-tegang-bk (Ketegangan awal, jenis `menarik-diri`, dipakai sebagai `tensionFallbackNodeId`),
 * ke-perbaikan-bk (hub perbaikan).
 *
 * Hub perbaikan memakai rute `@resume` bila keretakan sudah nonaktif; langkah terakhir
 * (`beri-pilihan`) tanpa `reaction` agar simpul yang dilanjutkan tampil dengan ucapannya sendiri.
 */
import type { StoryNode, StoryRoute } from '../../engine/story/storyTypes';

const SCENE = 'bk';

const RESUME_WHEN_REPAIRED: StoryRoute[] = [
  { when: [{ type: 'tension', active: false }], next: '@resume' },
];

const KE_B13: StoryNode = {
  id: 'ke-b13',
  sceneId: SCENE,
  stage: 'rencana',
  depth: 1,
  reply: {
    text:
      'Mungkin saya bisa ubah urutan review. Tulis dulu satu hal yang sudah bagus, baru komentar merah. ' +
      'Dan yang berat-berat saya bicarakan langsung, bukan ditumpuk di pull request.',
    expression: 'netral',
    cue: 'Kevin membuka catatan di ponselnya, mengetik satu baris, lalu memperlihatkannya sekilas kepada Dosen.',
  },
  choices: [
    {
      id: 'a',
      skillId: 'pertanyaan-terbuka',
      text: 'Dari rencana itu, mana yang bisa kamu coba duluan, dan ke siapa?',
      next: 'ke-b14',
      best: true,
      setFlags: ['langkah-kecil'],
      reaction: {
        text: 'Yang duluan: review PR Arman, satu hal bagus dulu. Soal obrolan ini, jangan sampai bocor ke tim, ya. Kalau saya macet, boleh ketemu lagi?',
        expression: 'cemas',
        cue: 'Kevin menjawab cepat, lalu melirik pintu seolah memastikan tidak ada yang mendengar.',
      },
    },
    {
      id: 'b',
      skillId: 'parafrase-ringkasan',
      text: 'Jadi satu hal bagus dulu, lalu bicara langsung soal yang berat. Udah pas?',
      next: 'ke-b14',
      setFlags: ['langkah-kecil'],
      reaction: {
        text: 'Udah pas. Satu hal bagus dulu, lalu bicara langsung. Soal obrolan ini jangan sampai bocor ke tim, ya. Kalau saya macet lagi, boleh ketemu lagi?',
        expression: 'cemas',
        cue: 'Kevin mengangguk singkat dan menggenggam tepi laptopnya.',
      },
    },
    {
      id: 'c',
      skillId: 'nasihat-dini',
      text: 'Langsung aja minta maaf ke semua anggota tim hari ini, biar cepat kelar.',
      next: 'ke-b14',
      reaction: {
        text: 'Hari ini semua? Kalau begitu malah kelihatan dibuat-buat.',
        expression: 'kesal',
        cue: 'Kevin menutup catatannya dan melipat tangan kembali.',
      },
    },
    {
      id: 'd',
      skillId: 'janji-mutlak',
      text: 'Dengan cara itu timmu pasti langsung suka sama kamu. Saya jamin.',
      next: 'ke-b14',
      reaction: {
        text: 'Nggak ada jaminan soal orang. Tapi saya coba.',
        expression: 'waspada',
        cue: 'Kevin tersenyum tipis, bahunya tetap tegak.',
      },
    },
  ],
};

const KE_B14: StoryNode = {
  id: 'ke-b14',
  sceneId: SCENE,
  stage: 'rencana',
  depth: 1,
  reply: {
    text:
      'Soal obrolan ini, jangan sampai bocor ke tim, ya. Dan... kalau saya macet lagi, boleh ketemu lagi?',
    expression: 'cemas',
    cue: 'Kevin berdiri, membereskan laptop ke tas, lalu berhenti sebentar sebelum menatap Dosen.',
  },
  choices: [
    {
      id: 'a',
      skillId: 'afirmasi-kekuatan',
      text: 'Kamu nyusun langkahmu sendiri. Tiga hari lagi aku mampir ke lab, ya.',
      next: 'ke-f0',
      best: true,
      action: { kind: 'janji', dueDayOffset: 3 },
      reaction: {
        text: 'Oke, Dosen mampir aja. Hasilnya, di PR Arman saya tulis dulu dua hal bagus, baru komentar. Dia bales emoji jempol, pertama kalinya kayaknya.',
        expression: 'tersenyum',
        cue: 'Kevin duduk dengan tangan di atas keyboard, bukan terlipat, dan menunjuk layar dengan dagu.',
        aside: 'Beberapa hari kemudian. Zona pemrograman lengang, dan dua rekan tim sedang membahas sesuatu di layar yang sama.',
      },
    },
    {
      id: 'b',
      skillId: 'batas-kerahasiaan',
      text: 'Obrolan ini tetap di antara kita, kecuali soal keselamatanmu. Pintu ini terbuka.',
      next: 'ke-f0',
      reaction: {
        text: 'Pintunya terbuka, saya catat. Dosen, di PR Arman saya tulis dulu dua hal yang bagus, baru komentar. Dia bales emoji jempol, kayaknya pertama kali.',
        expression: 'tersenyum',
        cue: 'Kevin mengangguk, lalu menggaruk tengkuk dan mengangkat layar ke arah Dosen.',
        aside: 'Beberapa hari kemudian. Zona pemrograman lengang, dan dua rekan tim sedang membahas sesuatu di layar yang sama.',
      },
    },
    {
      id: 'c',
      skillId: 'janji-mutlak',
      text: 'Habis ini semuanya pasti beres dan timmu nggak akan menjauh lagi.',
      next: 'ke-f0',
      reaction: {
        text: 'Pasti? Baik. Kita lihat saja.',
        expression: 'waspada',
        cue: 'Kevin mengangguk singkat dan menyampirkan tas ke bahu.',
      },
    },
    {
      id: 'd',
      skillId: 'pertanyaan-tertutup',
      text: 'Jadi sekarang kamu sudah nggak ada masalah lagi, kan?',
      next: 'ke-f0',
      reaction: {
        text: 'Selesai. Kira-kira begitu.',
        expression: 'menutup-diri',
        cue: 'Kevin menjawab cepat sambil menarik ritsleting tasnya.',
      },
    },
  ],
};

/** Ketegangan awal: balasan dingin setelah kesalahan pemula di Ruang BK. */
const KE_TEGANG_BK: StoryNode = {
  id: 'ke-tegang-bk',
  sceneId: SCENE,
  stage: 'eksplorasi',
  depth: 0,
  reply: {
    text: 'Oke. Dosen sudah punya kesimpulan. Saya nggak perlu menambahkan apa-apa.',
    expression: 'menutup-diri',
    cue: 'Kevin menyandarkan punggung, melipat tangan erat, dan menatap ke arah pintu.',
  },
  tension: { phase: 'awal', expectedKind: 'menarik-diri' },
  choices: [
    {
      id: 'a',
      skillId: 'sampaikan-pengamatan',
      text: 'Omonganku tadi kedengaran menghakimi. Aku mau dengar pendapatmu dulu.',
      next: 'ke-perbaikan-bk',
      best: true,
      action: { kind: 'akui-ketegangan' },
      options: { observationTone: 'faktual' },
    },
    {
      id: 'b',
      skillId: 'validasi-normalisasi',
      text: 'Wajar banget kalau kamu kesal. Lanjut kalau kamu mau aja.',
      next: 'ke-tegang-bk',
      reaction: {
        text: 'Terserah.',
        expression: 'menutup-diri',
        cue: 'Kevin tidak berubah posisi; matanya terpaku pada ujung meja.',
      },
    },
    {
      id: 'c',
      skillId: 'jeda-hening',
      text: 'Santai aja, aku tunggu di sini sebentar.',
      next: 'ke-tegang-bk',
      reaction: {
        text: '...',
        expression: 'menutup-diri',
        cue: 'Kevin diam lama; rahangnya bergerak sedikit seperti menahan kalimat.',
      },
    },
    {
      id: 'd',
      skillId: 'nasihat-dini',
      text: 'Jangan terlalu tersinggung. Coba lebih terbuka, biar tim juga terbuka.',
      next: 'ke-tegang-bk',
      reaction: {
        text: 'Nasihat lagi. Oke.',
        expression: 'menutup-diri',
        cue: 'Kevin mengembuskan napas panjang tanpa menoleh.',
      },
    },
  ],
};

/** Hub perbaikan: tiga langkah perbaikan dan satu opsi keliru (empat pilihan). */
const KE_PERBAIKAN_BK: StoryNode = {
  id: 'ke-perbaikan-bk',
  sceneId: SCENE,
  stage: 'eksplorasi',
  depth: 0,
  reply: {
    text: 'Tadi memang kurang enak didengar. Tapi saya masih di sini, kan.',
    expression: 'waspada',
    cue: 'Kevin melirik Dosen sekilas, lipatan tangannya sedikit mengendur walau masih terlipat.',
  },
  tension: { phase: 'perbaikan', expectedKind: 'menarik-diri' },
  choices: [
    {
      id: 'a',
      skillId: 'validasi-normalisasi',
      text: 'Maaf, omonganku tadi terasa menghakimi. Dampaknya nyata, dan aku mengakuinya.',
      next: 'ke-perbaikan-bk',
      best: true,
      action: { kind: 'perbaikan', step: 'akui-dampak' },
      routes: RESUME_WHEN_REPAIRED,
      reaction: {
        text: 'Hm. Baru kali ini ada yang bilang begitu. Oke.',
        expression: 'netral',
        cue: 'Kevin menurunkan pandangan, lalu menepuk lutut sekali, tanda ia menerima.',
      },
    },
    {
      id: 'b',
      skillId: 'pertanyaan-terbuka',
      text: 'Bagian mana dari kalimatku tadi yang paling bikin nggak nyaman?',
      next: 'ke-perbaikan-bk',
      action: { kind: 'perbaikan', step: 'eksplorasi-perasaan' },
      routes: RESUME_WHEN_REPAIRED,
      reaction: {
        text: 'Rasanya seperti dinilai sebelum diberi kesempatan menjelaskan.',
        expression: 'kesal',
        cue: 'Kevin berbicara lugas, tetapi jarinya yang mengetuk lutut mulai melambat.',
      },
    },
    {
      id: 'c',
      skillId: 'jeda-hening',
      text: 'Boleh lanjut, ganti topik, atau berhenti. Kamu yang pilih.',
      next: 'ke-perbaikan-bk',
      action: { kind: 'perbaikan', step: 'beri-pilihan' },
      routes: RESUME_WHEN_REPAIRED,
    },
    {
      id: 'd',
      skillId: 'nasihat-dini',
      text: 'Sudahlah, lupain aja. Yang penting kamu tetap semangat kerja.',
      next: 'ke-perbaikan-bk',
      reaction: {
        text: 'Gitu. Baik.',
        expression: 'menutup-diri',
        cue: 'Kevin mengangguk datar dan kembali melipat tangannya.',
      },
    },
  ],
};

export const KE_BK_RENCANA_NODES: StoryNode[] = [KE_B13, KE_B14, KE_TEGANG_BK, KE_PERBAIKAN_BK];

/** Id simpul Ketegangan fase awal; dipakai sebagai `tensionFallbackNodeId`. */
export const KE_TENSION_FALLBACK_NODE_ID = 'ke-tegang-bk';
