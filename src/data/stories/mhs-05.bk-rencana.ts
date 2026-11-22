/**
 * Cerita Ayu Permata (mhs-05), adegan Ruang BK bagian rencana dan Ketegangan.
 *
 * Simpul: ay-b13 (langkah kecil: satu percobaan konkret), ay-b14 (penutup sesi dan janji tindak lanjut),
 * ay-tegang-bk (Ketegangan awal, jenis `menarik-diri`, dipakai sebagai `tensionFallbackNodeId`),
 * ay-perbaikan-bk (hub perbaikan).
 *
 * Hub perbaikan memakai rute `@resume` bila keretakan sudah nonaktif.
 */
import type { StoryChoice, StoryNode, StoryRoute } from '../../engine/story/storyTypes';

const SCENE = 'bk';

const RESUME_WHEN_REPAIRED: StoryRoute[] = [
  { when: [{ type: 'tension', active: false }], next: '@resume' },
];

const AY_B13: StoryNode = {
  id: 'ay-b13',
  sceneId: SCENE,
  stage: 'rencana',
  depth: 1,
  reply: {
    text:
      'Mungkin begini: aku ambil satu saja, dashboard telemetri yang sudah enam puluh persen itu. ' +
      'Dua minggu kuselesaikan versi kecilnya, lalu kutunjukkan ke kakak tingkat yang di studio.',
    expression: 'tersenyum',
    cue: 'Ayu membuka halaman baru, menulis satu judul besar dengan huruf tebal, dan menggarisbawahinya dua kali sambil menatap Dosen.',
  },
  choices: [
    {
      id: 'a',
      skillId: 'pertanyaan-terbuka',
      text: 'Bagian mana dari dashboard itu yang ingin kamu selesaikan dulu, dan kapan mulainya?',
      next: 'ay-b14',
      best: true,
      setFlags: ['langkah-kecil'],
      reaction: {
        text: 'Bagian grafiknya dulu, Bu, mulai besok pagi. Makasih udah dengerin ocehanku. Soal formulir yang belum kukirim, jangan bilang ke temen-temen ya. Boleh ketemu lagi?',
        expression: 'tersenyum',
        cue: 'Ayu menutup buku sketsa dan memeluknya, suaranya menurun saat menyebut formulir.',
      },
    },
    {
      id: 'b',
      skillId: 'parafrase-ringkasan',
      text: 'Jadi satu proyek, dua minggu, lalu diperlihatkan ke kakak tingkat. Sudah tepat?',
      next: 'ay-b14',
      setFlags: ['langkah-kecil'],
      reaction: {
        text: 'Iya, Bu, pas banget. Makasih udah dengerin. Soal formulir yang belum kukirim, jangan bilang ke temen-temen ya. Boleh kita ketemu lagi?',
        expression: 'tersenyum',
        cue: 'Ayu mengangguk cepat lalu melirik pintu sekilas.',
      },
    },
    {
      id: 'c',
      skillId: 'nasihat-dini',
      text: 'Selesaikan semua tujuh proyek sekaligus. Dengan begitu portofoliomu langsung penuh.',
      next: 'ay-b14',
      reaction: {
        text: 'Tujuh sekaligus? Wah, aku bisa bengong di depan laptop berhari-hari.',
        expression: 'cemas',
        cue: 'Ayu menutup bukunya dan tertawa canggung sambil memegangi dahinya.',
      },
    },
    {
      id: 'd',
      skillId: 'janji-mutlak',
      text: 'Studio pasti menerima kamu. Aku jamin tidak mungkin ditolak.',
      next: 'ay-b14',
      reaction: {
        text: 'Hehe, makasih, tapi Ibu kan belum tentu tahu.',
        expression: 'waspada',
        cue: 'Ayu tersenyum tipis, tetapi pensilnya berhenti di tengah garis.',
      },
    },
  ],
};

const AY_B14: StoryNode = {
  id: 'ay-b14',
  sceneId: SCENE,
  stage: 'rencana',
  depth: 1,
  reply: {
    text:
      'Makasih ya, Bu, sudah mau dengerin ocehanku. Soal formulir yang belum kukirim itu, jangan bilang ke teman-teman ya. ' +
      'Boleh nggak kita ketemu lagi? Aku pengin kasih lihat hasilnya.',
    expression: 'tersenyum',
    cue: 'Ayu berdiri sambil memeluk buku sketsa, lalu merobek satu halaman kecil dan menyodorkannya ke Dosen.',
  },
  choices: [
    {
      id: 'a',
      skillId: 'afirmasi-kekuatan',
      text: 'Kamu berani mencoba menuntaskan satu hal. Tiga hari lagi aku mampir ke lab, ya.',
      next: 'ay-f0',
      best: true,
      action: { kind: 'janji', dueDayOffset: 3 },
      reaction: {
        text: 'Siap, Bu, ditunggu di lab! Lihat deh, dashboard-nya jalan sampai tuntas, versi kecil. Kakak tingkat bilang legenda warnanya enak dibaca, dan aku nggak langsung kepikiran ide baru.',
        expression: 'tersenyum',
        cue: 'Ayu menyodorkan laptopnya dengan kedua tangan, matanya berbinar.',
        aside: 'Beberapa hari kemudian. Di pinggir layar dashboard, sebuah tulisan kecil bertanda "100%" menggantikan angka enam puluh.',
      },
    },
    {
      id: 'b',
      skillId: 'batas-kerahasiaan',
      text: 'Soal formulir itu tetap di antara kita, kecuali soal keselamatanmu. Pintu ini terbuka.',
      next: 'ay-f0',
      reaction: {
        text: 'Makasih, Bu, lega dengernya. Nih, dashboard-nya jalan sampai tuntas, versi kecil. Kakak tingkat bilang legenda warnanya enak dibaca, dan aku nggak langsung kepikiran ide baru.',
        expression: 'tersenyum',
        cue: 'Ayu memutar laptop menghadap Dosen sambil menahan tawa.',
        aside: 'Beberapa hari kemudian. Di pinggir layar dashboard, sebuah tulisan kecil bertanda "100%" menggantikan angka enam puluh.',
      },
    },
    {
      id: 'c',
      skillId: 'janji-mutlak',
      text: 'Setelah ini kamu pasti langsung yakin dengan pilihanmu dan tidak akan bimbang lagi.',
      next: 'ay-f0',
      reaction: {
        text: 'Aamiin, deh. Semoga beneran ya, Bu.',
        expression: 'waspada',
        cue: 'Ayu mengangguk, tetapi tangannya sudah membuka lagi halaman kosong di bukunya.',
      },
    },
    {
      id: 'd',
      skillId: 'pertanyaan-tertutup',
      text: 'Jadi sekarang kamu sudah tahu mau ke mana, kan?',
      next: 'ay-f0',
      reaction: {
        text: 'Hehe, sudah dong. Kurang lebih.',
        expression: 'menutup-diri',
        cue: 'Ayu menjawab cepat dan langsung sibuk memasukkan pensil ke tempatnya.',
      },
    },
  ],
};

/** Ketegangan awal: balasan langsung setelah kesalahan pemula di Ruang BK. */
const AY_TEGANG_BK: StoryNode = {
  id: 'ay-tegang-bk',
  sceneId: SCENE,
  stage: 'eksplorasi',
  depth: 0,
  reply: {
    text: 'Hehe, iya iya, Bu. Eh, kayaknya aku tadi dengar ada kelas tambahan ya? Aku cek jadwal dulu deh.',
    expression: 'menutup-diri',
    cue: 'Ayu tertawa terlalu cepat, menutup buku sketsa, dan berdiri setengah dari kursinya sambil mengecek ponsel.',
  },
  tension: { phase: 'awal', expectedKind: 'menarik-diri' },
  choices: [
    {
      id: 'a',
      skillId: 'sampaikan-pengamatan',
      text: 'Kalimatku tadi sepertinya membuatmu ingin mengalihkan topik. Aku ingin dengar sisimu.',
      next: 'ay-perbaikan-bk',
      best: true,
      action: { kind: 'akui-ketegangan' },
      options: { observationTone: 'faktual' },
    },
    {
      id: 'b',
      skillId: 'validasi-normalisasi',
      text: 'Tidak apa-apa kalau perlu mengecek jadwal. Kita lanjut santai saja.',
      next: 'ay-tegang-bk',
      reaction: {
        text: 'Iya, santai aja ya. Ngomong-ngomong, tadi aku lihat kucing lucu di parkiran!',
        expression: 'menutup-diri',
        cue: 'Ayu duduk kembali, tetapi tubuhnya miring ke arah pintu dan suaranya naik satu nada.',
      },
    },
    {
      id: 'c',
      skillId: 'jeda-hening',
      text: 'Aku tunggu sebentar di sini.',
      next: 'ay-tegang-bk',
      reaction: {
        text: '...',
        expression: 'menutup-diri',
        cue: 'Ayu menggulir layar ponsel tanpa membaca apa pun, jempolnya bergerak naik-turun.',
      },
    },
    {
      id: 'd',
      skillId: 'nasihat-dini',
      text: 'Jangan sering mengalihkan pembicaraan begitu. Biasakan fokus pada satu hal.',
      next: 'ay-tegang-bk',
      reaction: {
        text: 'Iya, Bu, noted. Fokus.',
        expression: 'menutup-diri',
        cue: 'Ayu tersenyum tipis yang tidak sampai ke mata, lalu memasukkan pensil ke saku.',
      },
    },
  ],
};

function repairChoices(): StoryChoice[] {
  return [
    {
      id: 'a',
      skillId: 'validasi-normalisasi',
      text: 'Maaf, ucapanku tadi bisa terasa menyudutkan. Dampaknya nyata buatmu, dan aku mengakuinya.',
      next: 'ay-perbaikan-bk',
      best: true,
      action: { kind: 'perbaikan', step: 'akui-dampak' },
      routes: RESUME_WHEN_REPAIRED,
      reaction: {
        text: 'Makasih ya sudah bilang. Aku jadi nggak perlu ngelucu lagi.',
        expression: 'lega',
        cue: 'Ayu duduk kembali sepenuhnya, lalu menaruh ponselnya telungkup di meja.',
      },
    },
    {
      id: 'b',
      skillId: 'pertanyaan-terbuka',
      text: 'Kalau boleh, ceritakan apa yang kamu rasakan waktu mendengar kalimatku tadi.',
      next: 'ay-perbaikan-bk',
      action: { kind: 'perbaikan', step: 'eksplorasi-perasaan' },
      routes: RESUME_WHEN_REPAIRED,
      reaction: {
        text: 'Rasanya kayak disuruh cepat-cepat memutuskan. Padahal aku butuh waktu buat mikir.',
        expression: 'cemas',
        cue: 'Ayu berbicara lebih pelan, jarinya menelusuri tepi sampul buku sketsa.',
      },
    },
    {
      id: 'c',
      skillId: 'jeda-hening',
      text: 'Kita bisa lanjut pelan, ganti topik, atau cukup sampai sini. Kamu yang memutuskan.',
      next: 'ay-perbaikan-bk',
      action: { kind: 'perbaikan', step: 'beri-pilihan' },
      routes: RESUME_WHEN_REPAIRED,
    },
    {
      id: 'd',
      skillId: 'nasihat-dini',
      text: 'Sudahlah, lupakan saja yang tadi. Yang penting kamu tetap ceria seperti biasa.',
      next: 'ay-perbaikan-bk',
      reaction: {
        text: 'Siap! Aku kan memang ceria, hehe.',
        expression: 'menutup-diri',
        cue: 'Ayu tertawa singkat dan kembali membuka-tutup buku sketsanya.',
      },
    },
  ];
}

/** Hub perbaikan: tiga langkah perbaikan dan satu opsi keliru (empat pilihan). */
const AY_PERBAIKAN_BK: StoryNode = {
  id: 'ay-perbaikan-bk',
  sceneId: SCENE,
  stage: 'eksplorasi',
  depth: 0,
  reply: {
    text: 'Tadi aku sempat kabur ya, hehe. Tapi aku masih mau lanjut kok, kalau Ibu masih mau dengar.',
    expression: 'waspada',
    cue: 'Ayu kembali duduk menghadap Dosen, tetapi buku sketsanya masih dipeluk di dada.',
  },
  tension: { phase: 'perbaikan', expectedKind: 'menarik-diri' },
  choices: repairChoices(),
};

export const AYU_BK_RENCANA_NODES: StoryNode[] = [AY_B13, AY_B14, AY_TEGANG_BK, AY_PERBAIKAN_BK];

export const AY_TENSION_FALLBACK_NODE_ID = 'ay-tegang-bk';
