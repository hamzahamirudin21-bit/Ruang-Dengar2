/**
 * Cerita Raka Pratama (mhs-01), adegan Ruang BK bagian rencana dan Ketegangan.
 *
 * Simpul: ra-b13 (langkah kecil: menyerahkan satu tugas), ra-b14 (penutup sesi dan janji tindak lanjut),
 * ra-tegang-bk (Ketegangan awal, jenis `menarik-diri`, dipakai sebagai `tensionFallbackNodeId`),
 * ra-perbaikan-bk (hub perbaikan).
 *
 * Hub perbaikan memakai rute `@resume` bila keretakan sudah nonaktif. Langkah terakhir
 * (`beri-pilihan`) sengaja tanpa `reaction` agar simpul yang dilanjutkan tampil dengan ucapannya sendiri.
 */
import type { StoryChoice, StoryNode, StoryRoute } from '../../engine/story/storyTypes';

const SCENE = 'bk';

const RESUME_WHEN_REPAIRED: StoryRoute[] = [
  { when: [{ type: 'tension', active: false }], next: '@resume' },
];

const RA_B13: StoryNode = {
  id: 'ra-b13',
  sceneId: SCENE,
  stage: 'rencana',
  depth: 1,
  reply: {
    text:
      'Mungkin... minggu ini aku serahin satu aja dulu, notulen rapat, ke satu anggota. ' +
      'Terus tiap Jumat sepuluh menit kami cek bareng, jadi bukan aku yang ngitung sendirian.',
    expression: 'netral',
    cue: 'Raka mengambil pulpen, menulis satu baris baru di jadwalnya, lalu menatap Dosen untuk pertama kalinya tanpa melirik jam.',
  },
  choices: [
    {
      id: 'a',
      skillId: 'pertanyaan-terbuka',
      text: 'Menurutmu siapa yang cocok pegang notulen, dan kapan mau kamu sampaikan?',
      reaction: { text: 'Yang cocok Sinta sih, dia rapi. Soal waktunya, mungkin besok sebelum rapat.', expression: 'netral', cue: 'Raka mengetuk kertas, seperti menimbang jadwal.' },
      next: 'ra-b14',
      best: true,
      setFlags: ['langkah-kecil'],
    },
    {
      id: 'b',
      skillId: 'parafrase-ringkasan',
      text: 'Jadi satu tugas diserahin, dan Jumat sepuluh menit dicek bareng. Sudah pas?',
      reaction: { text: 'Iya, pas banget. Satu tugas aja dulu, terus cek bareng hari Jumat.', expression: 'tersenyum', cue: 'Raka mengangguk puas dan menepuk lipatan daftarnya.' },
      next: 'ra-b14',
      setFlags: ['langkah-kecil'],
    },
    {
      id: 'c',
      skillId: 'nasihat-dini',
      text: 'Serahin aja separuh tugasmu sekaligus, biar cepat terasa ringan.',
      next: 'ra-b14',
      reaction: {
        text: 'Separuh? Wah, kecepetan itu. Aku bisa-bisa panik, jujurly.',
        expression: 'cemas',
        cue: 'Raka menutup jadwalnya dan menahan napas sejenak sebelum tersenyum kaku.',
      },
    },
    {
      id: 'd',
      skillId: 'janji-mutlak',
      text: 'Timmu pasti senang. Aku jamin nggak ada yang bakal nganggap kamu gagal.',
      next: 'ra-b14',
      reaction: {
        text: 'Semoga ya. Tapi kamu kan nggak bisa mastiin.',
        expression: 'waspada',
        cue: 'Raka tersenyum tipis, tetapi pulpennya berhenti menulis.',
      },
    },
  ],
};

const RA_B14: StoryNode = {
  id: 'ra-b14',
  sceneId: SCENE,
  stage: 'rencana',
  depth: 1,
  reply: {
    text:
      'Makasih udah mau dengerin. Soal draf pesan tadi, jangan sampai bocor ke tim ya. ' +
      'Dan... boleh ketemu lagi? Aku mau kabarin hasilnya.',
    expression: 'cemas',
    cue: 'Raka berdiri, memasukkan jadwal ke saku kemeja, lalu menoleh ke jam dinding tanpa terburu-buru.',
  },
  choices: [
    {
      id: 'a',
      skillId: 'afirmasi-kekuatan',
      text: 'Kamu berani ubah caramu memimpin, keren. Tiga hari lagi aku mampir ke lab, ya.',
      reaction: { text: 'Makasih, Bu. Aku tunggu ya, tiga hari lagi, jangan lupa.', expression: 'tersenyum', cue: 'Raka berdiri dan menjabat tangan Ibu singkat.' },
      next: 'ra-f0',
      best: true,
      action: { kind: 'janji', dueDayOffset: 3 },
    },
    {
      id: 'b',
      skillId: 'batas-kerahasiaan',
      text: 'Draf itu tetap di antara kita, kecuali menyangkut keselamatanmu. Pintunya selalu terbuka.',
      reaction: { text: 'Oke, aman ya. Makasih, Bu. Aku pegang janjinya.', expression: 'lega', cue: 'Raka mengangguk pelan, bahunya turun.' },
      next: 'ra-f0',
    },
    {
      id: 'c',
      skillId: 'janji-mutlak',
      text: 'Aku jamin setelah ini jadwalmu pasti longgar dan tim tidak akan molor lagi.',
      next: 'ra-f0',
      reaction: {
        text: 'Wah, semoga beneran begitu. Aku catat dulu deh.',
        expression: 'waspada',
        cue: 'Raka mengangguk sopan, matanya kembali ke jam dinding.',
      },
    },
    {
      id: 'd',
      skillId: 'pertanyaan-tertutup',
      text: 'Jadi sekarang jadwalmu sudah beres, kan?',
      next: 'ra-f0',
      reaction: {
        text: 'Beres sih, kurang lebih. Siap.',
        expression: 'menutup-diri',
        cue: 'Raka menjawab cepat, lalu merapikan kerah tanpa menoleh.',
      },
    },
  ],
};

/** Ketegangan awal: balasan langsung setelah kesalahan pemula di Ruang BK. */
const RA_TEGANG_BK: StoryNode = {
  id: 'ra-tegang-bk',
  sceneId: SCENE,
  stage: 'eksplorasi',
  depth: 0,
  reply: {
    text: 'Oke, aku paham. Kayaknya mending kita udahan aja, aku masih ada yang harus dikejar.',
    expression: 'menutup-diri',
    cue: 'Raka melirik jam tangan, mengancingkan saku kemeja, dan bergeser ke ujung kursi.',
  },
  tension: { phase: 'awal', expectedKind: 'menarik-diri' },
  choices: [
    {
      id: 'a',
      skillId: 'sampaikan-pengamatan',
      text: 'Kalimatku tadi kayaknya bikin kamu pengin pergi. Aku mau dengar sisimu dulu.',
      next: 'ra-perbaikan-bk',
      best: true,
      action: { kind: 'akui-ketegangan' },
      options: { observationTone: 'faktual' },
    },
    {
      id: 'b',
      skillId: 'validasi-normalisasi',
      text: 'Nggak apa-apa kalau kamu mau kejar jadwal. Kita lanjut pelan-pelan aja.',
      next: 'ra-tegang-bk',
      reaction: {
        text: 'Iya, lanjut aja. Bentar lagi juga kelar.',
        expression: 'menutup-diri',
        cue: 'Raka mengangguk, tetapi pandangannya tertuju pada jam dinding.',
      },
    },
    {
      id: 'c',
      skillId: 'jeda-hening',
      text: 'Aku tunggu bentar di sini ya.',
      next: 'ra-tegang-bk',
      reaction: {
        text: '...',
        expression: 'menutup-diri',
        cue: 'Raka diam lama, membuka dan menutup lipatan jadwalnya berulang-ulang.',
      },
    },
    {
      id: 'd',
      skillId: 'nasihat-dini',
      text: 'Jangan terlalu dipikirin. Kamu harus belajar lebih santai soal waktu.',
      next: 'ra-tegang-bk',
      reaction: {
        text: 'Iya, aku tahu kok. Noted.',
        expression: 'menutup-diri',
        cue: 'Raka tersenyum tipis yang tidak sampai ke mata, lalu melirik jam lagi.',
      },
    },
  ],
};

function repairChoices(): StoryChoice[] {
  return [
    {
      id: 'a',
      skillId: 'validasi-normalisasi',
      text: 'Maaf ya, caraku tadi bisa terasa menekan. Dampaknya nyata buatmu, dan aku akui.',
      next: 'ra-perbaikan-bk',
      best: true,
      action: { kind: 'perbaikan', step: 'akui-dampak' },
      routes: RESUME_WHEN_REPAIRED,
      reaction: {
        text: 'Makasih ya udah bilang. Aku jadi nggak buru-buru lagi.',
        expression: 'waspada',
        cue: 'Raka melirik Dosen, lalu menaruh pulpennya di meja dengan pelan.',
      },
    },
    {
      id: 'b',
      skillId: 'pertanyaan-terbuka',
      text: 'Kalau boleh, ceritain apa yang kamu rasakan waktu dengar kalimatku tadi.',
      next: 'ra-perbaikan-bk',
      action: { kind: 'perbaikan', step: 'eksplorasi-perasaan' },
      routes: RESUME_WHEN_REPAIRED,
      reaction: {
        text: 'Rasanya kayak dikasih tahu aku salah atur waktu. Padahal aku udah berusaha keras banget.',
        expression: 'cemas',
        cue: 'Raka berbicara lebih pelan, jemarinya meremas lipatan kertas jadwal.',
      },
    },
    {
      id: 'c',
      skillId: 'jeda-hening',
      text: 'Kita bisa lanjut pelan, ganti topik, atau cukup sampai sini. Terserah kamu.',
      next: 'ra-perbaikan-bk',
      action: { kind: 'perbaikan', step: 'beri-pilihan' },
      routes: RESUME_WHEN_REPAIRED,
    },
    {
      id: 'd',
      skillId: 'nasihat-dini',
      text: 'Udahlah, lupain aja yang tadi. Yang penting kamu tetap semangat.',
      next: 'ra-perbaikan-bk',
      reaction: {
        text: 'Siap. Oke.',
        expression: 'menutup-diri',
        cue: 'Raka mengangguk kecil dan kembali memeriksa jam tangannya.',
      },
    },
  ];
}

/** Hub perbaikan: tiga langkah perbaikan dan satu opsi keliru (empat pilihan). */
const RA_PERBAIKAN_BK: StoryNode = {
  id: 'ra-perbaikan-bk',
  sceneId: SCENE,
  stage: 'eksplorasi',
  depth: 0,
  reply: {
    text: 'Hmm, tadi emang kurang enak sih. Tapi aku masih mau lanjut kalau kamu mau dengerin.',
    expression: 'waspada',
    cue: 'Raka duduk kembali tegak, tidak lagi di ujung kursi, tetapi belum melepas lipatan jadwal dari tangannya.',
  },
  tension: { phase: 'perbaikan', expectedKind: 'menarik-diri' },
  choices: repairChoices(),
};

export const RA_BK_RENCANA_NODES: StoryNode[] = [RA_B13, RA_B14, RA_TEGANG_BK, RA_PERBAIKAN_BK];

export const RA_TENSION_FALLBACK_NODE_ID = 'ra-tegang-bk';
