/**
 * Cerita Bima Mahendra (mhs-07), adegan Ruang BK bagian rencana dan Ketegangan.
 *
 * Simpul: bi-b13 (langkah kecil: menelepon Ayah sepuluh menit), bi-b14 (penutup sesi dan janji tindak lanjut),
 * bi-tegang-bk (Ketegangan awal, jenis `menarik-diri`, dipakai sebagai `tensionFallbackNodeId`),
 * bi-perbaikan-bk (hub perbaikan).
 *
 * Hub perbaikan memakai rute `@resume` bila keretakan sudah nonaktif.
 */
import type { StoryChoice, StoryNode, StoryRoute } from '../../engine/story/storyTypes';

const SCENE = 'bk';

const RESUME_WHEN_REPAIRED: StoryRoute[] = [
  { when: [{ type: 'tension', active: false }], next: '@resume' },
];

const BI_B13: StoryNode = {
  id: 'bi-b13',
  sceneId: SCENE,
  stage: 'rencana',
  depth: 1,
  reply: {
    text:
      'Mungkin gini, Bu. Sabtu pagi aku telepon Ayah, sepuluh menit aja. Tabelnya kubawa, tapi aku dengar dulu maunya Ayah, baru kuceritain tawarannya.',
    expression: 'netral',
    cue: 'Bima menarik surat dari helm, menaruhnya di atas lutut, dan untuk pertama kalinya menatap Dosen tanpa memutar apa pun.',
  },
  choices: [
    {
      id: 'a',
      reaction: {
        text: 'Hmm, mungkin tanya kabar dulu, Bu. Habis itu kubilang aku pengin cerita soal tawaran, bukan langsung minta restu.',
        expression: 'netral',
        cue: 'Bima menggerakkan bibir tanpa suara, seolah sedang berlatih kalimat itu.',
      },
      skillId: 'pertanyaan-terbuka',
      text: 'Hal pertama apa yang pengin kamu sampaikan ke Ayah pas telepon tersambung?',
      next: 'bi-b14',
      best: true,
      setFlags: ['langkah-kecil'],
    },
    {
      id: 'b',
      reaction: {
        text: 'Betul, Bu. Sepuluh menit, dengar dulu, baru cerita. Nggak usah kebanyakan nyiapin kalimat.',
        expression: 'tersenyum',
        cue: 'Bima mengangguk mantap dan tersenyum tipis sambil menepuk helm di meja.',
      },
      skillId: 'parafrase-ringkasan',
      text: 'Jadi Sabtu pagi telepon Ayah sepuluh menit, dengar dulu, lalu cerita. Sudah tepat?',
      next: 'bi-b14',
      setFlags: ['langkah-kecil'],
    },
    {
      id: 'c',
      skillId: 'nasihat-dini',
      text: 'Kenapa nggak langsung tanda tangan aja, lalu kabari Ayah belakangan?',
      next: 'bi-b14',
      reaction: {
        text: 'Wah, jangan, Bu. Itu malah bikin Ayah merasa dilangkahi.',
        expression: 'cemas',
        cue: 'Bima menyimpan suratnya kembali ke dalam helm dan menutup pelapisnya rapat-rapat.',
      },
    },
    {
      id: 'd',
      skillId: 'janji-mutlak',
      text: 'Ayahmu pasti ngerti. Aku jamin beliau nggak akan kecewa.',
      next: 'bi-b14',
      reaction: {
        text: 'Semoga ya. Tapi Ibu kan belum kenal Ayahku.',
        expression: 'waspada',
        cue: 'Bima tersenyum tipis, lalu mulai memutar helmnya lagi.',
      },
    },
  ],
};

const BI_B14: StoryNode = {
  id: 'bi-b14',
  sceneId: SCENE,
  stage: 'rencana',
  depth: 1,
  reply: {
    text:
      'Makasih, Bu, sudah mau dengerin hitunganku. Soal surat di helm tadi, simpan dulu ya. ' +
      'Boleh nanti kita ngobrol lagi? Aku mau kabarkan hasil teleponnya.',
    expression: 'cemas',
    cue: 'Bima berdiri, memasang helm di lengan dan sarung tangan di saku celemek, lalu menoleh ke pintu tanpa terburu-buru.',
  },
  choices: [
    {
      id: 'a',
      reaction: {
        text: 'Hehe, iya, Bu. Mampir aja, nanti kutunjukin mesin las yang sudah kukalibrasi ulang.',
        expression: 'tersenyum',
        cue: 'Bima menggaruk belakang kepala dengan senyum yang lebih santai dari sebelumnya.',
      },
      skillId: 'afirmasi-kekuatan',
      text: 'Kamu berani buka pembicaraan yang sulit. Tiga hari lagi aku mampir ke bengkel, ya.',
      next: 'bi-f0',
      best: true,
      action: { kind: 'janji', dueDayOffset: 3 },
    },
    {
      id: 'b',
      reaction: {
        text: 'Makasih, Bu. Kalau pintunya terbuka gitu, aku nggak sungkan lagi balik ke sini.',
        expression: 'lega',
        cue: 'Bima mengangguk, lalu merapikan sarung tangannya dengan gerak yang lebih tenang.',
      },
      skillId: 'batas-kerahasiaan',
      text: 'Soal surat itu aman di antara kita, kecuali menyangkut keselamatanmu. Pintu ini terbuka.',
      next: 'bi-f0',
    },
    {
      id: 'c',
      skillId: 'janji-mutlak',
      text: 'Aku jamin habis ini Ayahmu setuju dan kamu nggak akan ragu lagi.',
      next: 'bi-f0',
      reaction: {
        text: 'Wah, mantap kalau gitu. Kucatat jadi target.',
        expression: 'waspada',
        cue: 'Bima mengangguk sopan, jarinya kembali memutar tali helm.',
      },
    },
    {
      id: 'd',
      skillId: 'pertanyaan-tertutup',
      text: 'Jadi sekarang keputusanmu sudah bulat, kan?',
      next: 'bi-f0',
      reaction: {
        text: 'Bulat, bulat. Siap, Bu.',
        expression: 'menutup-diri',
        cue: 'Bima menjawab cepat, lalu mengenakan sarung tangannya kembali.',
      },
    },
  ],
};

/** Ketegangan awal: balasan langsung setelah kesalahan pemula di Ruang BK. */
const BI_TEGANG_BK: StoryNode = {
  id: 'bi-tegang-bk',
  sceneId: SCENE,
  stage: 'eksplorasi',
  depth: 0,
  reply: {
    text: 'Oke, paham, Bu. Kayaknya cukup sampai sini aja deh. Mesin di bengkel masih nunggu.',
    expression: 'menutup-diri',
    cue: 'Bima memakai kembali kedua sarung tangannya, menyelipkan helm ke ketiak, dan bergeser ke tepi kursi.',
  },
  tension: { phase: 'awal', expectedKind: 'menarik-diri' },
  choices: [
    {
      id: 'a',
      skillId: 'sampaikan-pengamatan',
      text: 'Kalimatku tadi kayaknya bikin kamu pengin pergi. Aku mau dengar sisimu dulu.',
      next: 'bi-perbaikan-bk',
      best: true,
      action: { kind: 'akui-ketegangan' },
      options: { observationTone: 'faktual' },
    },
    {
      id: 'b',
      skillId: 'validasi-normalisasi',
      text: 'Nggak apa-apa kalau mesinnya nunggu. Kita lanjut pelan aja.',
      next: 'bi-tegang-bk',
      reaction: {
        text: 'Iya, lanjut aja. Santai, Bu.',
        expression: 'menutup-diri',
        cue: 'Bima mengangguk sambil tersenyum, tetapi tubuhnya tetap menghadap pintu.',
      },
    },
    {
      id: 'c',
      skillId: 'jeda-hening',
      text: 'Aku tunggu sebentar di sini, ya.',
      next: 'bi-tegang-bk',
      reaction: {
        text: '...',
        expression: 'menutup-diri',
        cue: 'Bima diam lama, memutar helm di ketiaknya sampai hampir terjatuh, lalu menangkapnya.',
      },
    },
    {
      id: 'd',
      skillId: 'nasihat-dini',
      text: 'Jangan terlalu dipikirin. Kamu harus belajar lebih terbuka.',
      next: 'bi-tegang-bk',
      reaction: {
        text: 'Iya, aku tahu. Siap.',
        expression: 'menutup-diri',
        cue: 'Bima tertawa kecil yang terdengar datar, lalu menatap pintu.',
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
      next: 'bi-perbaikan-bk',
      best: true,
      action: { kind: 'perbaikan', step: 'akui-dampak' },
      routes: RESUME_WHEN_REPAIRED,
      reaction: {
        text: 'Makasih, Bu. Jadi nggak pengin kabur lagi.',
        expression: 'waspada',
        cue: 'Bima melirik Dosen, lalu menurunkan helm ke pangkuan dengan pelan.',
      },
    },
    {
      id: 'b',
      skillId: 'pertanyaan-terbuka',
      text: 'Kalau boleh, ceritain apa yang kamu rasakan waktu dengar kalimatku tadi.',
      next: 'bi-perbaikan-bk',
      action: { kind: 'perbaikan', step: 'eksplorasi-perasaan' },
      routes: RESUME_WHEN_REPAIRED,
      reaction: {
        text: 'Rasanya kayak disuruh mutusin sekarang juga. Padahal aku lagi berusaha nggak asal pilih.',
        expression: 'cemas',
        cue: 'Bima berbicara lebih pelan, jemarinya menjepit tali helm.',
      },
    },
    {
      id: 'c',
      skillId: 'jeda-hening',
      text: 'Kita bisa lanjut pelan, ganti topik, atau cukup sampai sini. Kamu yang tentukan.',
      next: 'bi-perbaikan-bk',
      action: { kind: 'perbaikan', step: 'beri-pilihan' },
      routes: RESUME_WHEN_REPAIRED,
    },
    {
      id: 'd',
      skillId: 'nasihat-dini',
      text: 'Udahlah, lupain yang tadi. Yang penting kamu tetap semangat.',
      next: 'bi-perbaikan-bk',
      reaction: {
        text: 'Siap. Oke.',
        expression: 'menutup-diri',
        cue: 'Bima mengangguk kecil dan mulai memutar helmnya lagi.',
      },
    },
  ];
}

/** Hub perbaikan: tiga langkah perbaikan dan satu opsi keliru (empat pilihan). */
const BI_PERBAIKAN_BK: StoryNode = {
  id: 'bi-perbaikan-bk',
  sceneId: SCENE,
  stage: 'eksplorasi',
  depth: 0,
  reply: {
    text: 'Hmm, tadi memang kurang enak. Tapi hitunganku belum kelar, jadi kalau Ibu masih mau dengerin, aku lanjut.',
    expression: 'waspada',
    cue: 'Bima kembali duduk tegak di kursi, belum melepas sarung tangannya, tetapi helmnya sudah diletakkan di lantai.',
  },
  tension: { phase: 'perbaikan', expectedKind: 'menarik-diri' },
  choices: repairChoices(),
};

export const BI_BK_RENCANA_NODES: StoryNode[] = [BI_B13, BI_B14, BI_TEGANG_BK, BI_PERBAIKAN_BK];

export const BI_TENSION_FALLBACK_NODE_ID = 'bi-tegang-bk';
