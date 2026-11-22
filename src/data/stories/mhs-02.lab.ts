/**
 * Adegan Lab untuk Dimas Aditya (mhs-02): pembukaan baku, kejutan ponsel bergetar,
 * isyarat nonverbal (menelungkupkan ponsel), ajakan ke Ruang Konsultasi, serta
 * Ketegangan `menarik-diri` dan hub perbaikan. Dirakit di ./mhs-02.ts.
 */
import type { StoryLine, StoryNode } from '../../engine/story/storyTypes';
import { buildOpeningNode } from '../storyStages';

const STUDENT_ID = 'mhs-02';
const SCENE = 'lab';
const TENSION = 'di-tegang-lab';
const REPAIR = 'di-perbaikan-lab';

/** Ambang kepercayaan untuk menerima ajakan ke Ruang Konsultasi (jalur terbaik memberi margin >= 4). */
export const DIMAS_INVITE_TRUST_MIN = 38;

const PHONE_ASIDE = 'Sekilas terbaca pratinjau pesan: "Dimas, ibu kos menunggu pembayaran bulan ini ya."';

const KEJUTAN_LINE: StoryLine = {
  text: 'Oh, itu... notifikasi doang. Nggak penting.',
  expression: 'waspada',
  cue: 'Layar ponsel menyala di samping papan solder; Dimas menelungkupkannya dengan telapak sebelum sempat terbaca penuh.',
  aside: PHONE_ASIDE,
};

export const DIMAS_LAB_NODES: StoryNode[] = [
  // 1. Pembukaan baku
  buildOpeningNode({
    id: 'di-buka',
    studentId: STUDENT_ID,
    sceneId: SCENE,
    name: 'Dimas',
    reply: {
      text: 'Siang. Aku lagi nyolder, targetnya belum kelar.',
      expression: 'netral',
      cue: 'Dimas tidak mengangkat kepala dari mikroskop solder; satu tangannya meraba saku, memastikan ponselnya masih di sana.',
    },
    best: 'sapaan-hangat',
    next: {
      'sapaan-hangat': 'di-l2',
      'pertanyaan-terbuka': 'di-l2',
      'pertanyaan-tertutup': 'di-l2',
      'nasihat-dini': TENSION,
    },
    reactions: {
      'sapaan-hangat': {
        text: 'Baik. Lagi sibuk aja.',
        expression: 'netral',
        cue: 'Dimas tidak mengangkat kepala dari solderannya.',
      },
      'pertanyaan-terbuka': {
        text: 'Pikiran? Ya jadwal praktikum. Itu aja.',
        expression: 'netral',
        cue: 'Dimas menjawab sambil tetap memegang solder; ujungnya tidak bergeser dari papan.',
      },
      'pertanyaan-tertutup': {
        text: 'Aman.',
        expression: 'menutup-diri',
        cue: 'Satu kata saja, lalu ia kembali membungkuk ke mikroskop.',
      },
    },
  }),

  // 2. Kejutan kecil: ponsel bergetar; isyarat nonverbal
  {
    id: 'di-l2',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: KEJUTAN_LINE,
    marks: ['kejutan', 'isyarat-nonverbal'],
    choices: [
      {
        id: 'pengamatan-faktual',
        skillId: 'sampaikan-pengamatan',
        text: 'Ponselmu bergetar dan langsung kamu telungkupkan. Aku hanya melihat, tanpa menebak.',
        reaction: { text: 'Ya, getar doang. Nggak usah dibahas.', expression: 'menutup-diri', cue: 'Dimas menggeser ponselnya sedikit lebih jauh.' },
        options: { observationTone: 'faktual' },
        next: 'di-l3',
        best: true,
      },
      {
        id: 'afirmasi',
        skillId: 'afirmasi-kekuatan',
        text: 'Tanganmu tetap mantap di komponen sekecil itu. Ketelitianmu jarang dimiliki orang.',
        reaction: { text: 'Biasa aja, namanya juga kebiasaan nyolder.', expression: 'netral', cue: 'Dimas mendengus pendek, ujung bibirnya sempat naik.' },
        next: 'di-l3',
      },
      {
        id: 'tertutup',
        skillId: 'pertanyaan-tertutup',
        text: 'Itu dari ibu kos, kan? Kamu belum bayar?',
        next: 'di-l3',
        reaction: {
          text: 'Bukan urusan itu. Aku lanjut ya.',
          expression: 'menutup-diri',
          cue: 'Dimas menunduk ke mikroskop dan menyalakan solder lagi, tanpa menoleh.',
        },
      },
      {
        id: 'pengamatan-menilai',
        skillId: 'sampaikan-pengamatan',
        text: 'Kamu kelihatan gengsi sekali menyembunyikan pesan itu.',
        options: { observationTone: 'menilai' },
        next: TENSION,
        reaction: {
          text: 'Gengsi apaan. Ini cuma notifikasi.',
          expression: 'kesal',
          cue: 'Dimas menegakkan punggung dan suaranya mendatar.',
        },
      },
    ],
  },

  // 3. Ajakan ke Ruang Konsultasi
  {
    id: 'di-l3',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Bentar lagi aku uji sambungan. Lagian di sini orang lalu-lalang terus.',
      expression: 'waspada',
      cue: 'Dimas menggeser badan, menutupi papan dan ponselnya dari dua teman yang lewat di lorong meja.',
    },
    choices: [
      {
        id: 'ajak-ruang-bk',
        skillId: 'validasi-normalisasi',
        text: 'Wajar kurang leluasa di sini. Mau pindah ke Ruang Konsultasi, sepuluh menit saja?',
        next: 'di-l3-tolak',
        routes: [{ when: [{ type: 'trust-min', value: DIMAS_INVITE_TRUST_MIN }], next: 'di-b0' }],
        best: true,
      },
      {
        id: 'privasi',
        skillId: 'batas-kerahasiaan',
        text: 'Obrolan kita sebatas kita berdua, kecuali menyangkut keselamatanmu.',
        reaction: { text: 'Oke. Kalau cuma kita berdua, ya nggak masalah.', expression: 'netral', cue: 'Dimas mengangguk tanpa menoleh dari papan sirkuit.' },
        next: 'di-l3b',
        setFlags: ['privasi-dijelaskan'],
      },
      {
        id: 'janji-mutlak',
        skillId: 'janji-mutlak',
        text: 'Di ruang BK semuanya pasti aman, kujamin tidak akan ada yang tahu.',
        next: 'di-l3b',
        reaction: {
          text: 'Kamu bisa jamin sampai segitu? Hmm. Lihat nanti deh.',
          expression: 'waspada',
          cue: 'Dimas menyipitkan mata sekilas, lalu menaruh pinset dengan sangat hati-hati.',
        },
      },
      {
        id: 'terbuka',
        skillId: 'pertanyaan-terbuka',
        text: 'Apa yang bikin kamu kurang leluasa bicara di sini?',
        reaction: { text: 'Banyak yang lewat, jadi nggak bebas aja. Itu doang.', expression: 'netral', cue: 'Dimas melirik lorong lalu menunduk lagi.' },
        next: 'di-l3b',
      },
    ],
  },

  // Penolakan halus karena kepercayaan belum cukup
  {
    id: 'di-l3-tolak',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Nanti aja deh. Targetku belum kelar, nggak enak ninggalin bangku.',
      expression: 'menutup-diri',
      cue: 'Dimas meraih solder dan memeriksa ujungnya, padahal alat itu belum dipakai.',
    },
    choices: [
      {
        id: 'jeda',
        skillId: 'jeda-hening',
        text: 'Aku tunggu di sini sebentar. Selesaikan dulu bagianmu.',
        reaction: { text: 'Ya. Tunggu aja, bentar lagi bagian ini beres.', expression: 'netral', cue: 'Dimas kembali menunduk ke papan sirkuit.' },
        next: 'di-l3b',
        best: true,
      },
      {
        id: 'privasi',
        skillId: 'batas-kerahasiaan',
        text: 'Ini batasnya: ceritamu tetap rahasia, kecuali menyangkut keselamatan.',
        reaction: { text: 'Rahasia beneran ya? Oke, kucatat.', expression: 'waspada', cue: 'Dimas menoleh sekilas, matanya menyipit.' },
        next: 'di-l3b',
        setFlags: ['privasi-dijelaskan'],
      },
      {
        id: 'validasi',
        skillId: 'validasi-normalisasi',
        text: 'Tidak apa-apa belum siap. Kita ikuti kecepatanmu.',
        reaction: { text: 'Hm. Makasih nggak maksa.', expression: 'lega', cue: 'Dimas menurunkan solder dan bahunya mengendur.' },
        next: 'di-l3b',
      },
      {
        id: 'nasihat',
        skillId: 'nasihat-dini',
        text: 'Tinggalkan dulu soldermu. Kesehatanmu lebih penting daripada target.',
        next: TENSION,
      },
    ],
  },

  // Lebih tenang setelah ruang diberikan
  {
    id: 'di-l3b',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Kalau cuma sebentar dan nggak ada yang dengar, ya... boleh deh.',
      expression: 'netral',
      cue: 'Dimas mematikan solder, menaruhnya di dudukan, lalu menghela napas pendek.',
    },
    choices: [
      {
        id: 'ajak-ruang-bk',
        skillId: 'afirmasi-kekuatan',
        text: 'Terima kasih sudah mau mencoba. Kita jalan pelan ke Ruang Konsultasi.',
        reaction: { text: 'Iya, jalan aja. Aku matiin solder dulu.', expression: 'netral', cue: 'Dimas mencabut kabel solder dan berdiri pelan.' },
        next: 'di-b0',
        best: true,
      },
      {
        id: 'sapaan',
        skillId: 'sapaan-hangat',
        text: 'Aku temani jalan. Bawa saja barang yang kamu perlukan.',
        reaction: { text: 'Nggak ada yang perlu dibawa. Cuma ponsel.', expression: 'netral', cue: 'Dimas memasukkan ponsel ke saku dengan layar menghadap ke dalam.' },
        next: 'di-b0',
      },
      {
        id: 'tertutup',
        skillId: 'pertanyaan-tertutup',
        text: 'Jadi ikut atau tidak? Jawab ya atau tidak saja.',
        next: 'di-l3b',
        reaction: {
          text: 'Ya... atau... ah, terserah deh.',
          expression: 'lelah',
          cue: 'Dimas mengusap tengkuk dan menatap papan solder yang sudah dingin.',
        },
      },
      {
        id: 'nasihat',
        skillId: 'nasihat-dini',
        text: 'Ikut saja. Ini demi kebaikanmu sendiri.',
        next: TENSION,
      },
    ],
  },

  // Ketegangan fase awal: Dimas menarik diri
  {
    id: TENSION,
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Oke. Maaf, aku balik kerja dulu.',
      expression: 'menutup-diri',
      cue: 'Dimas memutar kursi menghadap mikroskop dan menyelipkan ponselnya lebih dalam ke saku.',
    },
    tension: { phase: 'awal', expectedKind: 'menarik-diri' },
    choices: [
      {
        id: 'akui',
        skillId: 'sampaikan-pengamatan',
        text: 'Ucapanku tadi mungkin terasa menusuk. Aku ingin dengar bagaimana buatmu.',
        options: { observationTone: 'faktual' },
        action: { kind: 'akui-ketegangan' },
        next: REPAIR,
        best: true,
      },
      {
        id: 'abaikan-validasi',
        skillId: 'validasi-normalisasi',
        text: 'Tidak apa-apa. Lanjutkan saja kerjamu, aku di sini.',
        next: TENSION,
        reaction: {
          text: 'Hm. Oke.',
          expression: 'menutup-diri',
          cue: 'Dimas mengangguk tipis tanpa melepas pandangan dari lensa.',
        },
      },
      {
        id: 'abaikan-jeda',
        skillId: 'jeda-hening',
        text: 'Aku tunggu sebentar di sini.',
        next: TENSION,
        reaction: {
          text: '...',
          expression: 'menutup-diri',
          cue: 'Dimas menyolder satu titik, lalu satu titik lagi, tanpa suara.',
        },
      },
      {
        id: 'nasihat',
        skillId: 'nasihat-dini',
        text: 'Jangan dipendam terus, nanti menumpuk. Ceritakan saja.',
        next: TENSION,
        reaction: {
          text: 'Iya, iya. Nanti.',
          expression: 'menutup-diri',
          cue: 'Suaranya datar, dan bahunya kembali membungkuk ke arah meja.',
        },
      },
    ],
  },

  // Ketegangan fase perbaikan: hub tiga langkah + satu opsi keliru
  {
    id: REPAIR,
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Aku cuma nggak suka ditebak-tebak. Rasanya kayak dipajang.',
      expression: 'menunduk',
      cue: 'Dimas menatap papan solder; rahangnya mengeras sebentar, lalu mengendur pelan.',
    },
    tension: { phase: 'perbaikan' },
    choices: [
      {
        id: 'akui-dampak',
        skillId: 'validasi-normalisasi',
        text: 'Aku sadar ucapanku tadi menekan. Maaf, itu bukan maksudku.',
        action: { kind: 'perbaikan', step: 'akui-dampak' },
        next: REPAIR,
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Ya... aku juga agak kaku tadi.',
          expression: 'netral',
          cue: 'Dimas meletakkan pinset dan akhirnya memutar badan setengah ke arah Dosen.',
        },
        best: true,
      },
      {
        id: 'eksplorasi-perasaan',
        skillId: 'pertanyaan-terbuka',
        text: 'Boleh aku tahu, bagian mana tadi yang paling tidak enak?',
        action: { kind: 'perbaikan', step: 'eksplorasi-perasaan' },
        next: REPAIR,
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Pas orang mulai nebak, aku ngerasa kayak harus ngebela diri. Capek.',
          expression: 'lelah',
          cue: 'Ia mengucapkannya pelan sambil memutar-mutar gagang solder di jarinya.',
        },
      },
      {
        id: 'beri-pilihan',
        skillId: 'jeda-hening',
        text: 'Kita bisa lanjut pelan, ganti topik, atau cukup. Kamu yang memutuskan.',
        action: { kind: 'perbaikan', step: 'beri-pilihan' },
        next: REPAIR,
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Lanjut aja. Tapi pelan, ya.',
          expression: 'lega',
          cue: 'Bahunya turun dan ia membalik ponselnya ke atas meja, kali ini tanpa buru-buru.',
        },
      },
      {
        id: 'remehkan',
        skillId: 'meremehkan',
        text: 'Ah, cuma soal sepele. Jangan terlalu dipikirkan.',
        next: REPAIR,
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Iya. Sepele. Aku lanjut kerja.',
          expression: 'menutup-diri',
          cue: 'Dimas merapatkan sikunya ke tubuh dan menunduk lebih rendah ke mikroskop.',
        },
      },
    ],
  },
];
