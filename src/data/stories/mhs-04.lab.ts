/**
 * Adegan Lab untuk Kevin Gunawan (mhs-04): pembukaan baku, kejutan komentar review dari teman satu tim,
 * isyarat melipat tangan, ajakan ke Ruang Konsultasi, serta Ketegangan `menarik-diri` dan hub perbaikan.
 * Dirakit menjadi STORY_MHS_04 di ./mhs-04.ts.
 */
import type { StoryLine, StoryNode } from '../../engine/story/storyTypes';
import { buildOpeningNode } from '../storyStages';

const STUDENT_ID = 'mhs-04';
const SCENE = 'lab';

/** Selingan kejutan di ke-l2. */
const TEAMMATE_ASIDE =
  'Seorang teman satu tim berhenti di belakang kursi. "Vin, bug memori di modulku ketemu gara-gara komentarmu. Tapi tolong, empat puluh komentar sekaligus itu bikin aku sesak."';

const KEJUTAN_LINE: StoryLine = {
  text: 'Aku cuma nulis yang salah. Kalau ada yang lolos, nanti kita semua yang kena.',
  expression: 'kesal',
  cue: 'Kevin melipat tangan di dada dan tidak menoleh dari layar yang penuh tanda merah.',
  aside: TEAMMATE_ASIDE,
};

export const KEVIN_LAB_NODES: StoryNode[] = [
  // 1. Pembukaan baku
  buildOpeningNode({
    id: 'ke-buka',
    studentId: STUDENT_ID,
    sceneId: SCENE,
    name: 'Kevin',
    reply: {
      text: 'Dosen mau ngecek saya? Kalau soal tugas, kodenya sudah saya kumpulkan semalam.',
      expression: 'waspada',
      cue: 'Kevin menyandarkan punggung ke kursi dan melipat tangan, matanya tetap di layar yang penuh baris kode.',
    },
    best: 'sapaan-hangat',
    next: {
      'sapaan-hangat': 'ke-l2',
      'pertanyaan-terbuka': 'ke-l2',
      'pertanyaan-tertutup': 'ke-l2',
      'nasihat-dini': 'ke-tegang-lab',
    },
    reactions: {
      'sapaan-hangat': {
        text: 'Baik. Cuma lagi banyak review, makanya layar saya penuh tanda merah. Saya nulis yang salah aja, kalau ada yang lolos nanti semua kena.',
        expression: 'netral',
        cue: 'Kevin menjawab tanpa menoleh, matanya menyusuri baris kode dan jarinya berhenti di satu komentar.',
        aside: 'Seorang teman satu tim berhenti di belakang kursi. "Vin, bug memori di modulku ketemu gara-gara komentarmu. Tapi tolong, empat puluh komentar sekaligus itu bikin aku sesak."',
      },
      'pertanyaan-terbuka': {
        text: 'Pikiran saya? Review kode tim. Literally itu saja, nggak ada yang menarik.',
        expression: 'netral',
        cue: 'Kevin mengangkat satu alis, menimbang apakah pertanyaan itu jebakan.',
      },
      'pertanyaan-tertutup': {
        text: 'Ya. Nggak ada masalah.',
        expression: 'menutup-diri',
        cue: 'Kevin menjawab datar dan menggulir layar tanpa menoleh.',
      },
    },
  }),

  // 2. Kejutan kecil: komentar review; isyarat nonverbal melipat tangan
  {
    id: 'ke-l2',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: KEJUTAN_LINE,
    marks: ['kejutan', 'isyarat-nonverbal'],
    choices: [
      {
        id: 'pengamatan-faktual',
        skillId: 'sampaikan-pengamatan',
        text: 'Layarmu penuh tanda merah, dan tanganmu terlipat sejak temanmu bicara tadi.',
        options: { observationTone: 'faktual' },
        next: 'ke-l3',
        setFlags: ['isyarat-diperhatikan'],
        best: true,
        reaction: {
          text: 'Merahnya memang komentar review. Tangan terlipat itu refleks aja. Tapi kalau mau lanjut, jangan di sini, anak-anak gampang nangkep.',
          expression: 'waspada',
          cue: 'Kevin melirik tangannya sendiri, lalu menurunkan suaranya sambil mengecek meja seberang.',
        },
      },
      {
        id: 'afirmasi',
        skillId: 'afirmasi-kekuatan',
        text: 'Komentarmu nemu bug memori. Teliti kayak gitu jarang, Kevin.',
        next: 'ke-l3',
        reaction: {
          text: 'Itu cuma ngecek dua kali, bukan bakat. Tapi ya, makasih. Kalau mau bahas lebih jauh, jangan di sini, nanti jadi bahan obrolan.',
          expression: 'waspada',
          cue: 'Kevin berhenti mengetik sebentar, lalu melirik rekan di meja seberang.',
        },
      },
      {
        id: 'tertutup',
        skillId: 'pertanyaan-tertutup',
        text: 'Kamu memang selalu setegas itu sama kode orang lain, kan?',
        next: 'ke-l3',
        reaction: {
          text: 'Selalu? Kalau menyangkut kode yang masuk produksi, iya. Tapi jangan dibahas di sini, anak-anak gampang nangkep.',
          expression: 'waspada',
          cue: 'Kevin menjawab pendek, suaranya merendah, matanya mengecek meja sebelah.',
        },
      },
      {
        id: 'pengamatan-menilai',
        skillId: 'sampaikan-pengamatan',
        text: 'Kamu kelihatan susah nerima kekurangan orang lain, ya.',
        options: { observationTone: 'menilai' },
        next: 'ke-tegang-lab',
        reaction: {
          text: 'Itu penilaian Dosen. Saya cuma kerja sesuai standar.',
          expression: 'menutup-diri',
          cue: 'Kevin menegakkan duduknya, rahangnya mengeras, dan suaranya mendatar.',
        },
      },
    ],
  },

  // 3. Ajakan ke Ruang Konsultasi
  {
    id: 'ke-l3',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Kalau mau bahas, jangan di sini. Anak-anak gampang nangkep, nanti jadi bahan obrolan.',
      expression: 'waspada',
      cue: 'Kevin melirik dua rekan tim di meja seberang, lalu menurunkan suaranya.',
    },
    choices: [
      {
        id: 'ajak-ruang-bk',
        skillId: 'validasi-normalisasi',
        text: 'Masuk akal kok nggak mau dibahas di depan orang. Kita ke Ruang Konsultasi aja?',
        next: 'ke-l3-tolak',
        routes: [{ when: [{ type: 'trust-min', value: 40 }], next: 'ke-b0' }],
        best: true,
      },
      {
        id: 'privasi',
        skillId: 'batas-kerahasiaan',
        text: 'Obrolan kita tetap di sini, kecuali menyangkut keselamatanmu.',
        next: 'ke-l3b',
        setFlags: ['privasi-dijelaskan'],
        reaction: {
          text: 'Soal keselamatan itu saya catat. Kalau memang cuma ngobrol dan bukan ceramah, saya ikut sebentar.',
          expression: 'netral',
          cue: 'Kevin mengangguk sekali dan mengendurkan lipatan tangannya.',
        },
      },
      {
        id: 'janji-mutlak',
        skillId: 'janji-mutlak',
        text: 'Di sana pasti aman, saya jamin nggak ada yang akan tahu sedikit pun.',
        next: 'ke-l3b',
        reaction: {
          text: 'Jaminan mutlak? Dosen sendiri tahu itu nggak ada.',
          expression: 'waspada',
          cue: 'Kevin menyipitkan mata dan menyilangkan lengannya lebih rapat.',
        },
      },
      {
        id: 'terbuka',
        skillId: 'pertanyaan-terbuka',
        text: 'Apa yang kamu khawatirkan kalau obrolan ini kedengaran orang lain?',
        next: 'ke-l3b',
        reaction: {
          text: 'Takutnya jadi bahan omongan di tim. Kalau tempatnya lain dan bukan ceramah, saya ikut sebentar.',
          expression: 'netral',
          cue: 'Kevin melirik dua rekan di meja seberang, lalu menutup laptopnya setengah.',
        },
      },
    ],
  },

  // Penolakan halus karena kepercayaan belum cukup
  {
    id: 'ke-l3-tolak',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Buat apa pindah? Saya belum lihat alasannya. Di sini juga bisa kok.',
      expression: 'netral',
      cue: 'Kevin mengetuk-ngetukkan jari ke lengan kursi, belum bergerak dari tempatnya.',
    },
    choices: [
      {
        id: 'privasi',
        skillId: 'batas-kerahasiaan',
        text: 'Wajar minta alasan. Obrolan tetap di antara kita, boleh berhenti kapan aja.',
        next: 'ke-l3b',
        setFlags: ['privasi-dijelaskan'],
        best: true,
        reaction: {
          text: 'Boleh berhenti kapan aja? Oke, itu masuk akal. Kalau memang cuma ngobrol dan bukan ceramah, saya ikut sebentar.',
          expression: 'netral',
          cue: 'Kevin berhenti mengetuk lengan kursi dan menimbang sebentar sebelum mengangguk.',
        },
      },
      {
        id: 'validasi',
        skillId: 'validasi-normalisasi',
        text: 'Boleh banget menimbang dulu. Kita ngobrol di sini sampai kamu siap.',
        next: 'ke-l3b',
        reaction: {
          text: 'Hm, oke. Saya timbang dulu. Kalau memang cuma ngobrol dan bukan ceramah, saya ikut sebentar.',
          expression: 'netral',
          cue: 'Kevin bersandar, nada suaranya sedikit melunak.',
        },
      },
      {
        id: 'terbuka',
        skillId: 'pertanyaan-terbuka',
        text: 'Apa yang perlu kujelaskan supaya kamu bisa menimbang ini layak atau nggak?',
        next: 'ke-l3b',
        reaction: {
          text: 'Jelasin aja tujuannya, singkat. Kalau memang cuma ngobrol dan bukan ceramah, saya ikut sebentar.',
          expression: 'netral',
          cue: 'Kevin menaikkan satu alis, lalu mengangguk pendek menunggu jawaban.',
        },
      },
      {
        id: 'nasihat',
        skillId: 'nasihat-dini',
        text: 'Kamu harus belajar mendengarkan orang lain, Kevin. Ayo ikut aja.',
        next: 'ke-tegang-lab',
      },
    ],
  },

  // Lebih tenang setelah privasi dijelaskan
  {
    id: 'ke-l3b',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Oke. Kalau memang cuma ngobrol dan bukan ceramah, saya ikut sebentar.',
      expression: 'netral',
      cue: 'Kevin menutup laptopnya setengah dan mengendurkan lipatan tangannya.',
    },
    choices: [
      {
        id: 'ajak-ruang-bk',
        skillId: 'validasi-normalisasi',
        text: 'Makasih sudah mau coba. Kita jalan ke Ruang Konsultasi sekarang?',
        next: 'ke-b0',
        best: true,
        reaction: {
          text: 'Oke, jalan. Tapi jangan ceramah, ya. Saya mau tahu dulu Dosen sebenarnya mau apa di sana.',
          expression: 'waspada',
          cue: 'Kevin menutup laptop sepenuhnya, berdiri, dan mengikuti Dosen dengan langkah kaku.',
        },
      },
      {
        id: 'sapaan',
        skillId: 'sapaan-hangat',
        text: 'Kalau kamu setuju, kita ke Ruang Konsultasi. Aku jalan di sampingmu.',
        next: 'ke-b0',
        reaction: {
          text: 'Nggak usah ditemenin juga bisa, tapi ya sudah. Silakan jalan duluan, saya ikut. Saya cuma mau tahu Dosen mau apa.',
          expression: 'waspada',
          cue: 'Kevin memeluk laptopnya dan berjalan setengah langkah di belakang Dosen.',
        },
      },
      {
        id: 'tertutup',
        skillId: 'pertanyaan-tertutup',
        text: 'Jadi ikut atau nggak? Jawab ya atau nggak aja.',
        next: 'ke-l3b',
        reaction: {
          text: 'Kalau dipaksa pilih begitu, jawaban saya tidak.',
          expression: 'kesal',
          cue: 'Kevin menarik laptopnya kembali dan melipat tangan lagi.',
        },
      },
      {
        id: 'nasihat',
        skillId: 'nasihat-dini',
        text: 'Sudahlah, ikut aja. Ini demi kebaikan timmu juga.',
        next: 'ke-tegang-lab',
      },
    ],
  },

  // Ketegangan fase awal: Kevin menarik diri secara dingin dan singkat
  {
    id: 'ke-tegang-lab',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Baik. Dicatat. Saya lanjut kerja.',
      expression: 'menutup-diri',
      cue: 'Kevin memutar kursinya setengah menghadap layar dan memasang headset di satu telinga.',
    },
    tension: { phase: 'awal', expectedKind: 'menarik-diri' },
    choices: [
      {
        id: 'akui',
        skillId: 'sampaikan-pengamatan',
        text: 'Omonganku tadi kedengaran menggurui. Aku mau dengar sudut pandangmu dulu.',
        options: { observationTone: 'faktual' },
        action: { kind: 'akui-ketegangan' },
        next: 'ke-perbaikan-lab',
        best: true,
      },
      {
        id: 'abaikan-validasi',
        skillId: 'validasi-normalisasi',
        text: 'Nggak apa-apa. Lanjut aja kerjanya, aku duduk di sini.',
        next: 'ke-tegang-lab',
        reaction: {
          text: 'Ya.',
          expression: 'menutup-diri',
          cue: 'Kevin mengetik tanpa menoleh; bunyi ketukan tombolnya terdengar keras.',
        },
      },
      {
        id: 'abaikan-jeda',
        skillId: 'jeda-hening',
        text: 'Santai aja, aku tunggu sebentar.',
        next: 'ke-tegang-lab',
        reaction: {
          text: '...',
          expression: 'menutup-diri',
          cue: 'Kevin diam, menggulir kode ke atas dan ke bawah tanpa membacanya.',
        },
      },
      {
        id: 'nasihat',
        skillId: 'nasihat-dini',
        text: 'Jangan gitu, Kevin. Coba lebih sabar sama timmu.',
        next: 'ke-tegang-lab',
        reaction: {
          text: 'Sudah sering dengar. Terima kasih.',
          expression: 'menutup-diri',
          cue: 'Kevin mengencangkan lipatan tangannya dan tetap menatap layar.',
        },
      },
    ],
  },

  // Ketegangan fase perbaikan: hub tiga langkah + satu opsi keliru
  {
    id: 'ke-perbaikan-lab',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Tadi kedengarannya saya yang salah, padahal saya cuma jaga mutu.',
      expression: 'kesal',
      cue: 'Kevin melepas headset dan memutar kursinya perlahan ke arah Dosen, tangannya masih terlipat.',
    },
    tension: { phase: 'perbaikan' },
    choices: [
      {
        id: 'akui-dampak',
        skillId: 'validasi-normalisasi',
        text: 'Nadaku tadi menggurui, dan itu kerasa buatmu. Itu bukan maksudku.',
        action: { kind: 'perbaikan', step: 'akui-dampak' },
        next: 'ke-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Oke. Itu... diterima.',
          expression: 'netral',
          cue: 'Kevin mengembuskan napas lewat hidung dan lipatan tangannya melonggar.',
        },
        best: true,
      },
      {
        id: 'eksplorasi-perasaan',
        skillId: 'pertanyaan-terbuka',
        text: 'Bagian mana dari omonganku tadi yang paling terasa meremehkanmu?',
        action: { kind: 'perbaikan', step: 'eksplorasi-perasaan' },
        next: 'ke-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Seolah standar saya itu salah. Padahal itu yang bikin sistem aman.',
          expression: 'kesal',
          cue: 'Kevin menatap Dosen langsung untuk pertama kalinya, suaranya tetap rendah.',
        },
      },
      {
        id: 'beri-pilihan',
        skillId: 'jeda-hening',
        text: 'Boleh lanjut, ganti topik, atau cukup di sini. Kamu yang tentukan.',
        action: { kind: 'perbaikan', step: 'beri-pilihan' },
        next: 'ke-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Lanjut. Tapi jangan diulang yang tadi.',
          expression: 'netral',
          cue: 'Kevin menutup laptopnya dan bersandar, tangannya akhirnya turun ke pangkuan.',
        },
      },
      {
        id: 'remehkan',
        skillId: 'meremehkan',
        text: 'Ah, cuma salah paham kecil. Jangan terlalu serius gitu.',
        next: 'ke-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Oh, jadi menurut Dosen saya berlebihan. Baik.',
          expression: 'menutup-diri',
          cue: 'Kevin memasang headset lagi dan memutar kursi membelakangi Dosen.',
        },
      },
    ],
  },
];
