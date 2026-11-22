/**
 * Cerita Hendra Wijaya (mhs-08), adegan Ruang BK bagian rencana dan Ketegangan.
 *
 * Simpul: he-b13 (langkah kecil: satu kalimat menolak yang dilatih), he-b14 (penutup sesi dan janji tindak lanjut),
 * he-tegang-bk (Ketegangan awal, jenis `menarik-diri`, dipakai sebagai `tensionFallbackNodeId`),
 * he-perbaikan-bk (hub perbaikan).
 *
 * Hub perbaikan memakai rute `@resume` bila keretakan sudah nonaktif. Langkah terakhir
 * (`beri-pilihan`) sengaja tanpa `reaction` agar simpul yang dilanjutkan tampil dengan ucapannya sendiri.
 */
import type { StoryChoice, StoryNode, StoryRoute } from '../../engine/story/storyTypes';

const SCENE = 'bk';
const TEGANG = 'he-tegang-bk';
const PERBAIKAN = 'he-perbaikan-bk';

const RESUME_WHEN_REPAIRED: StoryRoute[] = [
  { when: [{ type: 'tension', active: false }], next: '@resume' },
];

const HE_B13: StoryNode = {
  id: 'he-b13',
  sceneId: SCENE,
  stage: 'rencana',
  depth: 1,
  reply: {
    text:
      'Mungkin satu kalimat saja dulu: "Aku lagi kejar tugas sampai Jumat, bisa kubantu Sabtu." ' +
      'Boleh aku latihan ngomongnya di sini, sebelum kupakai ke Rendy?',
    expression: 'netral',
    cue: 'Hendra menulis kalimat itu di sampul belakang bukunya, lalu menatap Dosen sambil menarik napas, tanpa melirik ponsel.',
  },
  choices: [
    {
      id: 'a',
      reaction: {
        text: 'Oke, kucoba... "Aku lagi kejar tugas, Sabtu ya." Hm, susahnya di nadanya, Dosen. Takut kedengaran ketus.',
        expression: 'cemas',
        cue: 'Hendra menarik napas, lalu mengucapkan kalimat itu pelan sambil melirik reaksi Dosen.',
      },
      skillId: 'pertanyaan-terbuka',
      text: 'Silakan coba ucapkan sekali. Habis itu, bagian mana yang terasa paling susah?',
      next: 'he-b14',
      best: true,
      setFlags: ['langkah-kecil'],
    },
    {
      id: 'b',
      reaction: {
        text: 'Betul, Dosen. Satu kalimat dulu, latihan di sini, baru ke Rendy. Jangan langsung loncat.',
        expression: 'tersenyum',
        cue: 'Hendra mengangguk mantap dan menepuk lututnya sekali.',
      },
      skillId: 'parafrase-ringkasan',
      text: 'Jadi satu kalimat dulu, dilatih di sini, baru dicoba ke Rendy. Udah tepat?',
      next: 'he-b14',
      setFlags: ['langkah-kecil'],
    },
    {
      id: 'c',
      skillId: 'nasihat-dini',
      text: 'Kenapa cuma satu kalimat? Langsung tolak aja semua permintaan minggu ini.',
      next: 'he-b14',
      reaction: {
        text: 'Semuanya? Wah, nanti aku dikira berubah drastis. Kayaknya aku belum sanggup deh.',
        expression: 'cemas',
        cue: 'Hendra menutup bukunya dan menahan napas sebelum tertawa kaku.',
      },
    },
    {
      id: 'd',
      skillId: 'janji-mutlak',
      text: 'Pakai kalimat itu, pasti Rendy ngerti dan nggak bakal marah sama sekali.',
      next: 'he-b14',
      reaction: {
        text: 'Semoga ya. Tapi Dosen kan nggak bisa mastiin perasaannya.',
        expression: 'waspada',
        cue: 'Hendra tersenyum tipis, lalu menoleh ke arah ponselnya yang bergetar di meja.',
      },
    },
  ],
};

const HE_B14: StoryNode = {
  id: 'he-b14',
  sceneId: SCENE,
  stage: 'rencana',
  depth: 1,
  reply: {
    text:
      'Makasih udah mau dengerin. Soal chat yang kuhapus tadi, jangan sampai bocor ke anak-anak ya. ' +
      'Nanti kuceritakan hasilnya, boleh?',
    expression: 'cemas',
    cue: 'Hendra berdiri, memasukkan buku ke tas, lalu menyisihkan ponselnya ke saku tanpa mengeceknya, sebuah hal yang jarang ia lakukan.',
  },
  choices: [
    {
      id: 'a',
      reaction: {
        text: 'Siap, Dosen, mampir aja. Nanti kutunjukin casing-nya yang mulai kebentuk.',
        expression: 'tersenyum',
        cue: 'Hendra mengacungkan jempol dengan senyum lebar.',
      },
      skillId: 'afirmasi-kekuatan',
      text: 'Kamu berani coba cara baru. Tiga hari lagi aku mampir ke meja printer, ya.',
      next: 'he-f0',
      best: true,
      action: { kind: 'janji', dueDayOffset: 3 },
    },
    {
      id: 'b',
      reaction: {
        text: 'Makasih, Dosen. Kalau gitu aku tenang ceritainnya nanti.',
        expression: 'lega',
        cue: 'Hendra menghela napas lega dan merapikan buku catatannya ke dalam tas.',
      },
      skillId: 'batas-kerahasiaan',
      text: 'Soal chat itu aman di antara kita, kecuali menyangkut keselamatanmu.',
      next: 'he-f0',
    },
    {
      id: 'c',
      skillId: 'janji-mutlak',
      text: 'Aku jamin habis ini nggak ada lagi yang berani ganggu waktumu.',
      next: 'he-f0',
      reaction: {
        text: 'Wah, semoga beneran gitu. Aku catat dulu deh.',
        expression: 'waspada',
        cue: 'Hendra mengangguk sopan, namun matanya sudah kembali ke saku tempat ponselnya berada.',
      },
    },
    {
      id: 'd',
      skillId: 'pertanyaan-tertutup',
      text: 'Jadi sekarang kamu udah bisa nolak, kan?',
      next: 'he-f0',
      reaction: {
        text: 'Bisa, kurang lebih. Siap.',
        expression: 'menutup-diri',
        cue: 'Hendra menjawab cepat sambil merapikan tali tasnya.',
      },
    },
  ],
};

/** Ketegangan awal: balasan langsung setelah kesalahan pemula di Ruang BK. */
const HE_TEGANG_BK: StoryNode = {
  id: TEGANG,
  sceneId: SCENE,
  stage: 'eksplorasi',
  depth: 0,
  reply: {
    text: 'Oke, oke, aku ngerti. Kayaknya cukup sampai sini aja, ada yang nungguin aku di lab.',
    expression: 'menutup-diri',
    cue: 'Hendra tersenyum ramah, tetapi sudah menyampirkan tas di bahu dan bergeser ke tepi kursi.',
  },
  tension: { phase: 'awal', expectedKind: 'menarik-diri' },
  choices: [
    {
      id: 'a',
      reaction: {
        text: 'Siap, Dosen, mampir aja. Nanti kutunjukin casing-nya yang mulai kebentuk.',
        expression: 'tersenyum',
        cue: 'Hendra mengacungkan jempol dengan senyum lebar.',
      },
      skillId: 'sampaikan-pengamatan',
      text: 'Kalimatku tadi kayaknya bikin kamu pengin segera pergi. Aku mau dengar sisimu dulu.',
      next: PERBAIKAN,
      best: true,
      action: { kind: 'akui-ketegangan' },
      options: { observationTone: 'faktual' },
    },
    {
      id: 'b',
      skillId: 'validasi-normalisasi',
      text: 'Nggak apa-apa kalau ada yang nunggu. Kita lanjut santai aja.',
      next: TEGANG,
      reaction: {
        text: 'Iya, lanjut aja. Sebentar lagi mereka juga bisa nunggu.',
        expression: 'menutup-diri',
        cue: 'Hendra mengangguk, namun ponselnya yang bergetar kembali ia lirik dua kali.',
      },
    },
    {
      id: 'c',
      skillId: 'jeda-hening',
      text: 'Aku tunggu aja sebentar di sini.',
      next: TEGANG,
      reaction: {
        text: '...',
        expression: 'menutup-diri',
        cue: 'Hendra diam, jarinya mengusap-usap tali tas berulang-ulang dengan senyum yang kaku.',
      },
    },
    {
      id: 'd',
      skillId: 'nasihat-dini',
      text: 'Jangan terlalu dipikirin. Kamu harus lebih tegas ke teman-temanmu.',
      next: TEGANG,
      reaction: {
        text: 'Iya, aku tahu kok. Siap, dicatat.',
        expression: 'menutup-diri',
        cue: 'Hendra tersenyum lebar yang tidak sampai ke mata, lalu mengecek ponselnya lagi.',
      },
    },
  ],
};

function repairChoices(): StoryChoice[] {
  return [
    {
      id: 'a',
      skillId: 'validasi-normalisasi',
      text: 'Maaf, caraku tadi bisa terasa mengoreksi. Dampaknya nyata buatmu, aku akui itu.',
      next: PERBAIKAN,
      best: true,
      action: { kind: 'perbaikan', step: 'akui-dampak' },
      routes: RESUME_WHEN_REPAIRED,
      reaction: {
        text: 'Makasih udah bilang. Aku jadi nggak merasa harus buru-buru pergi.',
        expression: 'waspada',
        cue: 'Hendra menurunkan tas dari bahunya dan menaruhnya di lantai dengan pelan.',
      },
    },
    {
      id: 'b',
      skillId: 'pertanyaan-terbuka',
      text: 'Kalau boleh, ceritain apa yang kamu rasakan waktu dengar kalimatku tadi.',
      next: PERBAIKAN,
      action: { kind: 'perbaikan', step: 'eksplorasi-perasaan' },
      routes: RESUME_WHEN_REPAIRED,
      reaction: {
        text: 'Rasanya kayak dibilangin aku salah karena terlalu baik. Padahal aku cuma nggak mau mengecewakan orang.',
        expression: 'cemas',
        cue: 'Hendra berbicara lebih pelan, tangannya meremas tali tas di pangkuan.',
      },
    },
    {
      id: 'c',
      skillId: 'jeda-hening',
      text: 'Kita bisa lanjut pelan, ganti topik, atau cukup sampai sini. Kamu yang pilih.',
      next: PERBAIKAN,
      action: { kind: 'perbaikan', step: 'beri-pilihan' },
      routes: RESUME_WHEN_REPAIRED,
    },
    {
      id: 'd',
      skillId: 'nasihat-dini',
      text: 'Udahlah, lupain aja yang tadi. Yang penting kamu tetap ramah.',
      next: PERBAIKAN,
      reaction: {
        text: 'Siap. Oke.',
        expression: 'menutup-diri',
        cue: 'Hendra mengangguk cepat dan merogoh saku untuk mengecek ponselnya.',
      },
    },
  ];
}

/** Hub perbaikan: tiga langkah perbaikan dan satu opsi keliru (empat pilihan). */
const HE_PERBAIKAN_BK: StoryNode = {
  id: PERBAIKAN,
  sceneId: SCENE,
  stage: 'eksplorasi',
  depth: 0,
  reply: {
    text: 'Hmm, tadi emang kurang enak. Tapi aku masih mau lanjut kalau Dosen mau dengerin.',
    expression: 'waspada',
    cue: 'Hendra duduk kembali dengan punggung tegak, tidak lagi di tepi kursi, tetapi tangannya belum lepas dari tali tas.',
  },
  tension: { phase: 'perbaikan', expectedKind: 'menarik-diri' },
  choices: repairChoices(),
};

export const HE_BK_RENCANA_NODES: StoryNode[] = [HE_B13, HE_B14, HE_TEGANG_BK, HE_PERBAIKAN_BK];

export const HE_TENSION_FALLBACK_NODE_ID = TEGANG;
