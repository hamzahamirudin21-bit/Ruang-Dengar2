/**
 * Cerita Maya Puspita (mhs-11), adegan Ruang BK bagian rencana dan Ketegangan.
 *
 * Simpul: ma-b13 (langkah kecil: jadwal tukar ide berkala dengan pertanyaan tertulis), ma-b14 (penutup sesi
 * dan janji tindak lanjut), ma-tegang-bk (Ketegangan awal, jenis `menarik-diri`, dipakai sebagai
 * `tensionFallbackNodeId`), ma-perbaikan-bk (hub perbaikan).
 *
 * Hub perbaikan memakai rute `@resume` bila keretakan sudah nonaktif. Langkah terakhir
 * (`beri-pilihan`) sengaja tanpa `reaction` agar simpul yang dilanjutkan tampil dengan ucapannya sendiri.
 */
import type { StoryChoice, StoryNode, StoryRoute } from '../../engine/story/storyTypes';

const SCENE = 'bk';

const RESUME_WHEN_REPAIRED: StoryRoute[] = [
  { when: [{ type: 'tension', active: false }], next: '@resume' },
];

const MA_B13: StoryNode = {
  id: 'ma-b13',
  sceneId: SCENE,
  stage: 'rencana',
  depth: 1,
  reply: {
    text:
      'Mungkin mulai dari yang kecil aja. Kamis sore, dua puluh menit, di ruang sunyi kayak gini. ' +
      'Sehari sebelumnya kukirim tiga pertanyaan tertulis, jadi nggak ada yang mendadak.',
    expression: 'netral',
    cue: 'Maya menulis "Kamis 16.00, 20 menit" di halaman kosong, lalu mengetuk garis bawahnya dua kali dengan pensil.',
  },
  choices: [
    {
      id: 'a',
      skillId: 'parafrase-ringkasan',
      text: 'Jadi Kamis sore dua puluh menit, dengan tiga pertanyaan tertulis sehari sebelumnya?',
      reaction: {
        text: 'Iya, Bu, tepat. Oh ya, satu hal: soal pintu pembimbing tadi, tolong jangan sampai ke tim ya. Dan boleh nggak Ibu mampir lagi nanyain kabarku?',
        expression: 'cemas',
        cue: 'Maya berdiri perlahan, menyelipkan buku hijau ke dalam tas, dan memegang penutup telinga tanpa memakainya.',
      },
      next: 'ma-b14',
      best: true,
      setFlags: ['langkah-kecil'],
    },
    {
      id: 'b',
      skillId: 'afirmasi-kekuatan',
      text: 'Rencana ini jelas dan realistis. Kamu atur temponya sesuai dirimu.',
      reaction: {
        text: 'Makasih, Bu. Satu permintaan ya: soal pintu pembimbing tadi, tolong jangan sampai ke tim. Dan nanti boleh Ibu mampir lagi buat nanyain kabarku?',
        expression: 'cemas',
        cue: 'Maya berdiri sambil mendekap tasnya, penutup telinga di tangan, tanpa berani menatap lama.',
      },
      next: 'ma-b14',
      setFlags: ['langkah-kecil'],
    },
    {
      id: 'c',
      skillId: 'nasihat-dini',
      text: 'Dua puluh menit terlalu sedikit. Ambil aja tiap hari biar cepat terbiasa.',
      next: 'ma-b14',
      reaction: {
        text: 'Tiap hari? Itu... kebanyakan ramai buatku. Nanti malah kutinggalin.',
        expression: 'cemas',
        cue: 'Maya menutup bukunya dan menggenggam pensilnya erat-erat.',
      },
    },
    {
      id: 'd',
      skillId: 'janji-mutlak',
      text: 'Pembimbingmu pasti selalu senang menjawab. Aku jamin nggak ada yang menertawakan.',
      next: 'ma-b14',
      reaction: {
        text: 'Semoga gitu. Tapi Ibu nggak bisa memastikan isi kepala orang lain.',
        expression: 'waspada',
        cue: 'Maya tersenyum tipis, tetapi pensilnya berhenti di atas kertas.',
      },
    },
  ],
};

const MA_B14: StoryNode = {
  id: 'ma-b14',
  sceneId: SCENE,
  stage: 'rencana',
  depth: 1,
  reply: {
    text:
      'Terima kasih sudah ngasih ruang. Soal pintu pembimbing tadi, tolong jangan sampai ke tim, ya. ' +
      'Dan... boleh nanti Ibu mampir lagi buat nanyain kabarku?',
    expression: 'cemas',
    cue: 'Maya berdiri perlahan, menyelipkan buku hijau ke dalam tas, dan memegang penutup telinga tanpa memakainya.',
  },
  choices: [
    {
      id: 'a',
      skillId: 'afirmasi-kekuatan',
      text: 'Kamu sudah menyusun langkah nyata. Empat hari lagi aku mampir ke pojok sunyi itu.',
      reaction: {
        text: 'Makasih, Bu, aku tunggu. Eh, Bu, Kamis kemarin itu dua puluh menitnya kupakai penuh, tiga pertanyaan dijawab satu-satu. Satu jawabannya malah nyelametin sensorku.',
        expression: 'tersenyum',
        cue: 'Maya duduk di mejanya dengan penutup telinga tergantung di leher. Bunyi solder kecil terdengar, dan ia tidak menaikkannya.',
        aside: 'Beberapa hari kemudian. Di dekat meja Maya sudah terpasang papan kecil "Zona Fokus", dengan jadwal Kamis tertempel di bawahnya.',
      },
      next: 'ma-f0',
      best: true,
      action: { kind: 'janji', dueDayOffset: 4 },
    },
    {
      id: 'b',
      skillId: 'batas-kerahasiaan',
      text: 'Cerita soal pintu itu tetap di antara kita, kecuali soal keselamatanmu.',
      reaction: {
        text: 'Syukurlah, Bu, itu bikin tenang. Oh ya, Kamis kemarin dua puluh menitnya kupakai penuh: tiga pertanyaan dijawab satu per satu, dan satu jawabannya nyelametin sensor kelembapanku.',
        expression: 'lega',
        cue: 'Maya duduk di mejanya dengan penutup telinga di leher. Solder berbunyi pelan di dekatnya dan ia tidak menaikkan penutup itu.',
        aside: 'Beberapa hari kemudian. Papan kecil bertuliskan "Zona Fokus" terpasang di dekat meja Maya, dengan jadwal Kamis di bawahnya.',
      },
      next: 'ma-f0',
    },
    {
      id: 'c',
      skillId: 'janji-mutlak',
      text: 'Aku jamin setelah ini lab selalu sunyi dan nggak ada yang berani menertawakanmu.',
      next: 'ma-f0',
      reaction: {
        text: 'Wah, janjinya gede banget. Kucatat dulu aja ya.',
        expression: 'waspada',
        cue: 'Maya mengangguk sopan, lalu menunduk membetulkan tali tasnya.',
      },
    },
    {
      id: 'd',
      skillId: 'pertanyaan-tertutup',
      text: 'Jadi mulai Kamis ini kamu pasti sudah berani bertanya, ya?',
      next: 'ma-f0',
      reaction: {
        text: 'Kuusahain. Mungkin.',
        expression: 'menutup-diri',
        cue: 'Maya menjawab singkat, lalu memasang satu sisi penutup telinganya.',
      },
    },
  ],
};

/** Ketegangan awal: balasan langsung setelah kesalahan pemula di Ruang BK. */
const MA_TEGANG_BK: StoryNode = {
  id: 'ma-tegang-bk',
  sceneId: SCENE,
  stage: 'eksplorasi',
  depth: 0,
  reply: {
    text: 'Oh. Oke, Bu. Kayaknya lebih baik aku balik ke meja dulu.',
    expression: 'menutup-diri',
    cue: 'Maya menaikkan penutup telinga sampai menutup kedua telinganya, lalu mengikat buku hijaunya dengan karet.',
  },
  tension: { phase: 'awal', expectedKind: 'menarik-diri' },
  choices: [
    {
      id: 'a',
      skillId: 'sampaikan-pengamatan',
      text: 'Kalimatku tadi kayaknya kecepetan dan keras. Aku mau dengerin sisimu dulu.',
      next: 'ma-perbaikan-bk',
      best: true,
      action: { kind: 'akui-ketegangan' },
      options: { observationTone: 'faktual' },
    },
    {
      id: 'b',
      skillId: 'validasi-normalisasi',
      text: 'Silakan balik ke mejamu kalau itu terasa tenang. Aku nggak akan menahan.',
      next: 'ma-tegang-bk',
      reaction: {
        text: 'Terima kasih. Sebentar lagi mungkin aku selesai kok.',
        expression: 'menutup-diri',
        cue: 'Maya mengangguk, tetapi tubuhnya sudah menghadap pintu.',
      },
    },
    {
      id: 'c',
      skillId: 'jeda-hening',
      text: 'Aku diam sebentar di sini ya, tanpa menuntut apa pun.',
      next: 'ma-tegang-bk',
      reaction: {
        text: '...',
        expression: 'menutup-diri',
        cue: 'Maya diam lama, menarik karet buku hijaunya lalu melepasnya berulang-ulang.',
      },
    },
    {
      id: 'd',
      skillId: 'nasihat-dini',
      text: 'Jangan menutup diri gitu. Nanti timmu ngira kamu susah didekati.',
      next: 'ma-tegang-bk',
      reaction: {
        text: 'Iya, aku tahu. Makasih sarannya.',
        expression: 'menutup-diri',
        cue: 'Maya tersenyum tipis yang tidak sampai ke mata, lalu menatap meja.',
      },
    },
  ],
};

function repairChoices(): StoryChoice[] {
  return [
    {
      id: 'a',
      skillId: 'validasi-normalisasi',
      text: 'Maaf, tadi aku terlalu cepat dan menekan. Dampaknya nyata, dan aku mengakuinya.',
      next: 'ma-perbaikan-bk',
      best: true,
      action: { kind: 'perbaikan', step: 'akui-dampak' },
      routes: RESUME_WHEN_REPAIRED,
      reaction: {
        text: 'Terima kasih sudah bilang. Aku jadi nggak merasa harus sembunyi lagi.',
        expression: 'waspada',
        cue: 'Maya melirik Dosen sebentar, lalu menurunkan satu sisi penutup telinganya.',
      },
    },
    {
      id: 'b',
      skillId: 'pertanyaan-terbuka',
      text: 'Kalau boleh, ceritain apa yang terasa pas kalimatku tadi masuk.',
      next: 'ma-perbaikan-bk',
      action: { kind: 'perbaikan', step: 'eksplorasi-perasaan' },
      routes: RESUME_WHEN_REPAIRED,
      reaction: {
        text: 'Kayak ada suara keras di ruangan yang tadinya hening. Aku langsung pengin menutup semuanya.',
        expression: 'cemas',
        cue: 'Maya berbicara pelan sekali, jemarinya menarik-narik karet pada buku hijaunya.',
      },
    },
    {
      id: 'c',
      skillId: 'jeda-hening',
      text: 'Kita bisa lanjut pelan, nulis dulu, atau cukup sampai sini. Kamu yang tentukan.',
      next: 'ma-perbaikan-bk',
      action: { kind: 'perbaikan', step: 'beri-pilihan' },
      routes: RESUME_WHEN_REPAIRED,
    },
    {
      id: 'd',
      skillId: 'nasihat-dini',
      text: 'Sudahlah, lupain aja yang tadi. Yang penting kamu tetap berusaha.',
      next: 'ma-perbaikan-bk',
      reaction: {
        text: 'Iya. Oke.',
        expression: 'menutup-diri',
        cue: 'Maya mengangguk kecil dan kembali mengikat bukunya dengan karet.',
      },
    },
  ];
}

/** Hub perbaikan: tiga langkah perbaikan dan satu opsi keliru (empat pilihan). */
const MA_PERBAIKAN_BK: StoryNode = {
  id: 'ma-perbaikan-bk',
  sceneId: SCENE,
  stage: 'eksplorasi',
  depth: 0,
  reply: {
    text: 'Aku masih di sini. Tapi tolong pelan-pelan ya, satu hal dalam satu waktu.',
    expression: 'waspada',
    cue: 'Maya duduk kembali, belum melepas penutup telinga dari lehernya, tetapi kedua tangannya sudah berhenti bergerak.',
  },
  tension: { phase: 'perbaikan', expectedKind: 'menarik-diri' },
  choices: repairChoices(),
};

export const MA_BK_RENCANA_NODES: StoryNode[] = [MA_B13, MA_B14, MA_TEGANG_BK, MA_PERBAIKAN_BK];

export const MA_TENSION_FALLBACK_NODE_ID = 'ma-tegang-bk';
