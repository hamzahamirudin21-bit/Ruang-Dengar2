/**
 * Cerita Sari Melati (mhs-12), adegan Ruang BK bagian rencana dan Ketegangan.
 *
 * Simpul: s-b13 (langkah kecil "aku butuh lima belas menit"), s-b14 (penutup sesi dan
 * janji tindak lanjut), s-tegang-bk (Ketegangan awal, jenis `konfrontasi`),
 * s-perbaikan-bk (hub perbaikan; s-tegang-bk dipakai sebagai `tensionFallbackNodeId` oleh mhs-12.ts).
 *
 * Catatan perilaku Runner:
 * - Pilihan yang mengabaikan Ketegangan kembali ke s-tegang-bk; dua kali berturut-turut
 *   menutup sesi (akhir `menarik-diri-sementara`).
 * - Hub perbaikan memakai rute `@resume` bila keretakan sudah nonaktif. Langkah terakhir
 *   (`beri-pilihan`) sengaja tanpa `reaction` agar simpul yang dilanjutkan tampil dengan
 *   ucapannya sendiri.
 */
import type { StoryChoice, StoryNode, StoryRoute } from '../../engine/story/storyTypes';

const SCENE = 'bk';

/** Setelah langkah perbaikan: kembali ke simpul yang tertunda bila keretakan sudah selesai. */
const RESUME_WHEN_REPAIRED: StoryRoute[] = [
  { when: [{ type: 'tension', active: false }], next: '@resume' },
];

const S_B13: StoryNode = {
  id: 's-b13',
  sceneId: SCENE,
  stage: 'rencana',
  depth: 1,
  reply: {
    text:
      'Jujurly, kayaknya aku bisa coba satu hal kecil deh. Minggu ini, sekali aja, aku bilang ' +
      '"aku butuh lima belas menit dulu" ke grup. Cuma itu. Nanti aku balas lagi habis itu.',
    expression: 'netral',
    cue: 'Sari mengetuk-ngetuk layar ponselnya yang akhirnya gelap, lalu menarik napas pendek.',
  },
  choices: [
    {
      id: 'a',
      skillId: 'pertanyaan-terbuka',
      text: 'Langkah kecil yang jelas, nih. Kapan kalimat itu paling mungkin kamu ucapkan?',
      reaction: {
        text: 'Kayaknya pas rapat kecil, kalau Dimas sama Kevin mulai debat lagi. Udah ah, cukup dulu hari ini, aku udah spill dikit. Eh, yang tadi nggak nyebar ke anak-anak kan? Boleh ngobrol lagi nggak nanti?',
        expression: 'cemas',
        cue: 'Sari menyampirkan tasnya ke bahu, lalu berhenti sebentar di dekat pintu.',
      },
      next: 's-b14',
      best: true,
      setFlags: ['langkah-kecil'],
    },
    {
      id: 'b',
      skillId: 'parafrase-ringkasan',
      text: 'Jadi sekali minggu ini kamu bilang "aku butuh lima belas menit", lalu membalas lagi?',
      reaction: {
        text: 'Iya, sekali aja, terus kubales lagi. Udah ya, cukup dulu hari ini, aku udah spill dikit. Eh, tapi yang tadi nggak bakal nyebar ke anak-anak lain, kan? Nanti boleh ngobrol lagi?',
        expression: 'cemas',
        cue: 'Sari berdiri, menyampirkan tasnya ke bahu, dan berhenti ragu di dekat pintu.',
      },
      next: 's-b14',
      setFlags: ['langkah-kecil'],
    },
    {
      id: 'c',
      skillId: 'nasihat-dini',
      text: 'Lima belas menit terlalu singkat. Langsung bilang saja ke mereka bahwa kamu berhenti.',
      next: 's-b14',
      reaction: {
        text: 'Hehe, iya sih... Tapi kalau langsung gitu, kayaknya mereka bakal kaget banget.',
        expression: 'cemas',
        cue: 'Sari tertawa kecil, tetapi tawanya tidak sampai ke matanya.',
      },
    },
    {
      id: 'd',
      skillId: 'janji-mutlak',
      text: 'Tenang, teman-temanmu pasti paham dan tidak ada yang akan kecewa. Aku jamin.',
      next: 's-b14',
      reaction: {
        text: 'Mudah-mudahan sih. Tapi kamu kan nggak kenal mereka satu-satu.',
        expression: 'waspada',
        cue: 'Sari mengangkat bahu, senyumnya tipis dan agak kaku.',
      },
    },
  ],
};

const S_B14: StoryNode = {
  id: 's-b14',
  sceneId: SCENE,
  stage: 'rencana',
  depth: 1,
  reply: {
    text:
      'Oke, kayaknya cukup dulu hari ini, aku udah spill dikit. Eh, tapi yang kuceritain tadi nggak bakal ' +
      'nyebar ke anak-anak lain, kan? Terus, nanti ngobrol begini lagi bisa nggak?',
    expression: 'tertegun',
    cue: 'Sari menyampirkan tasnya ke bahu, lalu berhenti sebentar di dekat pintu.',
  },
  choices: [
    {
      id: 'a',
      skillId: 'afirmasi-kekuatan',
      text: 'Kamu berani jujur soal lelahmu hari ini. Boleh banget kita ngobrol lagi tiga hari lagi.',
      reaction: {
        text: 'Makasih, aku tunggu ya! Eh, dengerin dulu: tadi di rapat kecil, Dimas sama Kevin debat lagi, dan aku bilang, "Aku butuh lima belas menit dulu ya." Terus aku keluar bentar. Literally pertama kalinya!',
        expression: 'tertegun',
        cue: 'Sari duduk di ujung Meja Diskusi dengan ponsel terbalik di meja. Pulpennya diam, tidak diputar seperti biasanya.',
        aside: 'Seminggu kemudian. Meja Diskusi tetap ramai, dan dua teman Sari sudah kembali mengerjakan bagiannya masing-masing.',
      },
      next: 's-f0',
      best: true,
      action: { kind: 'janji', dueDayOffset: 3 },
    },
    {
      id: 'b',
      skillId: 'batas-kerahasiaan',
      text: 'Ceritamu tetap di ruang ini, kecuali mengancam keselamatanmu. Pintu ini terbuka.',
      reaction: {
        text: 'Oke, lega dengernya. Terus, tau nggak? Tadi di rapat kecil Dimas sama Kevin debat lagi, dan aku bilang, "Aku butuh lima belas menit dulu ya." Habis itu aku keluar bentar, pertama kali, jujurly!',
        expression: 'tertegun',
        cue: 'Sari duduk di ujung Meja Diskusi, ponselnya terbalik di meja, dan pulpennya tidak ia putar-putar.',
        aside: 'Seminggu kemudian. Meja Diskusi masih ramai, tetapi dua teman Sari tampak sudah kembali mengerjakan bagian masing-masing.',
      },
      next: 's-f0',
    },
    {
      id: 'c',
      skillId: 'pertanyaan-tertutup',
      text: 'Berarti sekarang kamu sudah merasa baik-baik saja, benar?',
      next: 's-f0',
      reaction: {
        text: 'Iya, aman kok. Santai aja.',
        expression: 'tersenyum',
        cue: 'Sari menjawab cepat dengan senyum lebar yang terasa dipasang.',
      },
    },
    {
      id: 'd',
      skillId: 'janji-mutlak',
      text: 'Aku pastikan setelah ini semuanya beres dan kamu tidak akan capek lagi.',
      next: 's-f0',
      reaction: {
        text: 'Wah, semoga ya. Makasih.',
        expression: 'waspada',
        cue: 'Sari mengangguk sopan, pandangannya sudah mengarah ke lorong.',
      },
    },
  ],
};

/** Ketegangan awal: balasan langsung setelah kesalahan pemula di Ruang BK. */
const S_TEGANG_BK: StoryNode = {
  id: 's-tegang-bk',
  sceneId: SCENE,
  stage: 'eksplorasi',
  depth: 0,
  reply: {
    text: 'Ringan? Kamu tuh nggak tahu apa yang kutanggung.',
    expression: 'kesal',
    cue: 'Sari menyilangkan tangan, rahangnya mengeras, dan suaranya naik sedikit.',
  },
  tension: { phase: 'awal', expectedKind: 'konfrontasi' },
  choices: [
    {
      id: 'a',
      skillId: 'sampaikan-pengamatan',
      text: 'Nadamu naik dan tanganmu menyilang. Kalimatku tadi mungkin meremehkan, mau cerita?',
      next: 's-perbaikan-bk',
      best: true,
      action: { kind: 'akui-ketegangan' },
      options: { observationTone: 'faktual' },
    },
    {
      id: 'b',
      skillId: 'validasi-normalisasi',
      text: 'Wajar kalau kamu kesal. Ayo kita lanjutkan saja, ya.',
      next: 's-tegang-bk',
      reaction: {
        text: 'Ya udah, lanjut aja.',
        expression: 'kesal',
        cue: 'Sari mendengus pelan dan membuang muka ke jendela.',
      },
    },
    {
      id: 'c',
      skillId: 'jeda-hening',
      text: 'Aku diam sebentar di sini sambil menunggumu.',
      next: 's-tegang-bk',
      reaction: {
        text: '...',
        expression: 'kesal',
        cue: 'Sari diam, kakinya bergoyang cepat di bawah meja.',
      },
    },
    {
      id: 'd',
      skillId: 'nasihat-dini',
      text: 'Tidak usah sensitif begitu. Kamu harus belajar tidak terlalu mengambil hati.',
      next: 's-tegang-bk',
      reaction: {
        text: 'Terserah deh. Aku sudah biasa dibilang gitu.',
        expression: 'menutup-diri',
        cue: 'Sari menarik napas panjang, tangannya makin erat menyilang di dada.',
      },
    },
  ],
};

function repairChoices(): StoryChoice[] {
  return [
    {
      id: 'a',
      skillId: 'validasi-normalisasi',
      text: 'Kalimatku tadi terdengar seolah bebanmu kecil. Itu menyakitkan, dan aku mengakuinya.',
      next: 's-perbaikan-bk',
      best: true,
      action: { kind: 'perbaikan', step: 'akui-dampak' },
      routes: RESUME_WHEN_REPAIRED,
      reaction: {
        text: 'Ya... valid sih, tadi kena banget. Makasih sudah ngomong gitu.',
        expression: 'waspada',
        cue: 'Sari menurunkan tangannya perlahan ke pangkuan, rahangnya tidak lagi tegang.',
      },
    },
    {
      id: 'b',
      skillId: 'validasi-normalisasi',
      text: 'Aku minta maaf. Maksudku bukan mengecilkan ceritamu, tapi caraku tadi memang keliru.',
      next: 's-perbaikan-bk',
      action: { kind: 'perbaikan', step: 'minta-maaf' },
      routes: RESUME_WHEN_REPAIRED,
      reaction: {
        text: 'Oke, diterima. Aku juga tadi agak ketus.',
        expression: 'netral',
        cue: 'Sari menghela napas dan menyandarkan punggung ke kursi.',
      },
    },
    {
      id: 'c',
      skillId: 'jeda-hening',
      text: 'Kamu boleh pilih: lanjut pelan, ganti topik, atau berhenti dulu. Semuanya boleh banget.',
      next: 's-perbaikan-bk',
      action: { kind: 'perbaikan', step: 'beri-pilihan' },
      routes: RESUME_WHEN_REPAIRED,
    },
    {
      id: 'd',
      skillId: 'meremehkan',
      text: 'Ah, itu cuma salah paham kecil. Jangan dibesar-besarkan, kamu kan orangnya santai.',
      next: 's-perbaikan-bk',
      reaction: {
        text: 'Oh gitu. Oke deh.',
        expression: 'menutup-diri',
        cue: 'Sari memaksakan senyum tipis, lalu mengalihkan pandangan.',
      },
    },
  ];
}

/** Hub perbaikan: tiga langkah perbaikan dan satu opsi keliru (empat pilihan). */
const S_PERBAIKAN_BK: StoryNode = {
  id: 's-perbaikan-bk',
  sceneId: SCENE,
  stage: 'eksplorasi',
  depth: 0,
  reply: {
    text: 'Hmm, tadi emang nggak enak sih, jujurly. Tapi ya udah, aku masih mau dengerin kamu.',
    expression: 'waspada',
    cue: 'Sari masih menyilang tangan, tetapi tubuhnya mulai condong sedikit ke arah Dosen.',
  },
  tension: { phase: 'perbaikan', expectedKind: 'konfrontasi' },
  choices: repairChoices(),
};

/** Simpul adegan Ruang BK bagian rencana dan Ketegangan, untuk dirakit di mhs-12.ts. */
export const S_BK_RENCANA_NODES: StoryNode[] = [S_B13, S_B14, S_TEGANG_BK, S_PERBAIKAN_BK];

/** Id simpul Ketegangan fase awal; dipakai sebagai `tensionFallbackNodeId` (validator mewajibkan fase awal). */
export const S_TENSION_FALLBACK_NODE_ID = 's-tegang-bk';
