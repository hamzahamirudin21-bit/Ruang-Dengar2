/**
 * Cerita Rani Safitri (mhs-14), adegan Ruang BK bagian rencana dan Ketegangan.
 *
 * Simpul: r-b13 (langkah kecil), r-b14 (penutup sesi dan janji tindak lanjut),
 * r-tegang-bk (Ketegangan awal, jenis `menarik-diri`, dipakai sebagai
 * `tensionFallbackNodeId` oleh mhs-14.ts), r-perbaikan-bk (hub perbaikan).
 *
 * Catatan perilaku Runner:
 * - Pilihan yang mengabaikan Ketegangan kembali ke r-tegang-bk; dua kali berturut-turut
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

const R_B13: StoryNode = {
  id: 'r-b13',
  sceneId: SCENE,
  stage: 'rencana',
  depth: 1,
  reply: {
    text:
      'Mungkin... aku bisa tanya satu hal aja ke asisten lab, kalau sepi. Tapi jangan pas banyak orang. ' +
      'Sebelum praktikum mulai atau sesudah selesai, waktu masih sepi.',
    expression: 'netral',
    cue: 'Rani membuka lipatan kertas kecilnya, menunjuk satu baris, lalu mengangkat pandangan sekilas.',
  },
  choices: [
    {
      id: 'a',
      skillId: 'pertanyaan-terbuka',
      text: 'Pertanyaan mana di daftarmu yang mau ditanya dulu, dan kapan waktunya nyaman?',
      reaction: {
        text: 'Yang soal rangkaian kemarin dulu, Dosen, sebelum praktikum mulai pas masih sepi. Makasih ya udah dengerin, sumpah. Tapi yang tadi kuceritain enggak bakal sampai ke teman-teman, kan? Kita ketemu lagi nggak?',
        expression: 'cemas',
        cue: 'Rani berdiri perlahan, memeluk buku catatannya, dan menatap Dosen dengan ragu.',
      },
      next: 'r-b14',
      best: true,
      setFlags: ['langkah-kecil'],
    },
    {
      id: 'b',
      skillId: 'parafrase-ringkasan',
      text: 'Jadi satu pertanyaan ke asisten lab, di waktu sepi. Aku nangkepnya sudah pas?',
      reaction: {
        text: 'Iya, Dosen, pas banget. Makasih udah mau dengerin, sumpah. Cuma... yang tadi kuceritain enggak bakal sampai ke teman-teman, kan? Terus, nanti kita ketemu lagi nggak?',
        expression: 'cemas',
        cue: 'Rani berdiri pelan, memeluk buku catatannya erat, lalu menatap Dosen dengan ragu.',
      },
      next: 'r-b14',
      setFlags: ['langkah-kecil'],
    },
    {
      id: 'c',
      skillId: 'nasihat-dini',
      text: 'Sebaiknya langsung tanya saja di depan kelas, biar cepat terbiasa.',
      next: 'r-b14',
      reaction: {
        text: 'Hmm... iya sih. Tapi kayaknya aku belum sanggup yang kayak gitu.',
        expression: 'menunduk',
        cue: 'Rani melipat kertasnya kembali, jari-jarinya menekan lipatan itu rapat-rapat.',
      },
    },
    {
      id: 'd',
      skillId: 'janji-mutlak',
      text: 'Asisten lab pasti ramah. Aku jamin tidak akan ada yang menertawakanmu.',
      next: 'r-b14',
      reaction: {
        text: 'Semoga ya... tapi kamu kan tidak bisa tahu pasti.',
        expression: 'waspada',
        cue: 'Rani tersenyum tipis, tetapi bahunya tetap tegang.',
      },
    },
  ],
};

const R_B14: StoryNode = {
  id: 'r-b14',
  sceneId: SCENE,
  stage: 'rencana',
  depth: 1,
  reply: {
    text:
      'Makasih ya sudah mau dengerin, sumpah. Tapi... yang tadi aku ceritain nggak bakal sampai ke ' +
      'teman-teman, kan? Terus, nanti kita ketemu lagi nggak?',
    expression: 'cemas',
    cue: 'Rani berdiri perlahan, memeluk buku catatannya, dan menatap Dosen dengan ragu.',
  },
  choices: [
    {
      id: 'a',
      skillId: 'afirmasi-kekuatan',
      text: 'Kamu berani menyusun langkahmu sendiri. Tiga hari lagi aku nyapa kamu di lab, ya.',
      reaction: {
        text: 'Dosen beneran nyapa! Kemarin aku akhirnya berani tanya ke asisten lab, satu pertanyaan aja, dan dia jelasin sambil senyum. Terus aku duduk di sini, dua kursi dari kelompok itu.',
        expression: 'tersenyum',
        cue: 'Rani duduk agak tegak dengan buku catatan terbuka di meja, dan sesekali melirik ke arah kelompok di ujung Meja Diskusi.',
        aside: 'Beberapa hari kemudian, di lab. Siang itu tidak terlalu ramai, dan Meja Diskusi diisi beberapa orang.',
      },
      next: 'r-f0',
      best: true,
      action: { kind: 'janji', dueDayOffset: 3 },
    },
    {
      id: 'b',
      skillId: 'batas-kerahasiaan',
      text: 'Ceritamu aman di antara kita, kecuali soal keselamatanmu. Pintu ini selalu terbuka.',
      reaction: {
        text: 'Makasih, Dosen, aku jadi tenang. Dan... kemarin aku beneran tanya ke asisten lab, satu pertanyaan, jelasinnya ramah. Sekarang aku duduk dua kursi dari kelompok itu, lho.',
        expression: 'tersenyum',
        cue: 'Rani duduk lebih tegak dari biasanya, bukunya terbuka di meja, dan matanya sesekali melirik kelompok di ujung Meja Diskusi.',
        aside: 'Beberapa hari kemudian, di lab. Suasana siang itu agak lengang, dan beberapa orang duduk di Meja Diskusi.',
      },
      next: 'r-f0',
    },
    {
      id: 'c',
      skillId: 'janji-mutlak',
      text: 'Aku jamin setelah ini semuanya pasti beres dan kamu tidak akan kesulitan lagi.',
      next: 'r-f0',
      reaction: {
        text: 'Oh... oke. Semoga beneran begitu.',
        expression: 'waspada',
        cue: 'Rani mengangguk singkat, matanya beralih ke pintu.',
      },
    },
    {
      id: 'd',
      skillId: 'pertanyaan-tertutup',
      text: 'Jadi sekarang kamu sudah tidak ada masalah lagi, kan?',
      next: 'r-f0',
      reaction: {
        text: 'Iya... kayaknya sih begitu.',
        expression: 'menutup-diri',
        cue: 'Rani menjawab cepat, lalu merapikan tali tasnya tanpa menoleh.',
      },
    },
  ],
};

/** Ketegangan awal: balasan langsung setelah kesalahan pemula di Ruang BK. */
const R_TEGANG_BK: StoryNode = {
  id: 'r-tegang-bk',
  sceneId: SCENE,
  stage: 'eksplorasi',
  depth: 0,
  reply: {
    text: 'Oh... iya. Maaf. Mungkin aku belum siap.',
    expression: 'menutup-diri',
    cue: 'Rani menggeser kursinya menjauh dan memandangi ujung meja.',
  },
  tension: { phase: 'awal', expectedKind: 'menarik-diri' },
  choices: [
    {
      id: 'a',
      skillId: 'sampaikan-pengamatan',
      text: 'Kalimatku tadi sepertinya bikin kamu nggak nyaman. Aku mau dengar dari sisimu dulu.',
      next: 'r-perbaikan-bk',
      best: true,
      action: { kind: 'akui-ketegangan' },
      options: { observationTone: 'faktual' },
    },
    {
      id: 'b',
      skillId: 'validasi-normalisasi',
      text: 'Nggak apa-apa kalau belum siap. Kita lanjut pelan-pelan aja, ya.',
      next: 'r-tegang-bk',
      reaction: {
        text: 'Iya... lanjut aja.',
        expression: 'menutup-diri',
        cue: 'Rani mengangguk, tetapi tatapannya tetap ke arah meja.',
      },
    },
    {
      id: 'c',
      skillId: 'jeda-hening',
      text: 'Aku tunggu sebentar di sini ya, santai aja.',
      next: 'r-tegang-bk',
      reaction: {
        text: '...',
        expression: 'menutup-diri',
        cue: 'Rani diam cukup lama, jarinya mengetuk-ngetuk sampul buku dengan gelisah.',
      },
    },
    {
      id: 'd',
      skillId: 'nasihat-dini',
      text: 'Jangan terlalu dipikirkan. Kamu harus belajar lebih berani bicara.',
      next: 'r-tegang-bk',
      reaction: {
        text: 'Iya, aku tahu. Maaf ya.',
        expression: 'menutup-diri',
        cue: 'Rani memeluk buku catatannya erat dan menunduk lebih dalam.',
      },
    },
  ],
};

function repairChoices(): StoryChoice[] {
  return [
    {
      id: 'a',
      skillId: 'validasi-normalisasi',
      text: 'Maaf, caraku tadi bisa terasa menekan. Itu nyata buatmu, dan aku mengakuinya.',
      next: 'r-perbaikan-bk',
      best: true,
      action: { kind: 'perbaikan', step: 'akui-dampak' },
      routes: RESUME_WHEN_REPAIRED,
      reaction: {
        text: 'Iya... agak canggung tadi. Makasih sudah bilang.',
        expression: 'waspada',
        cue: 'Rani melirik Dosen sebentar; genggamannya pada buku sedikit mengendur.',
      },
    },
    {
      id: 'b',
      skillId: 'pertanyaan-terbuka',
      text: 'Kalau boleh, ceritain apa yang kamu rasakan waktu dengar kalimatku tadi.',
      next: 'r-perbaikan-bk',
      action: { kind: 'perbaikan', step: 'eksplorasi-perasaan' },
      routes: RESUME_WHEN_REPAIRED,
      reaction: {
        text: 'Rasanya kayak... aku salah lagi. Padahal kamu nggak bermaksud gitu, ya.',
        expression: 'cemas',
        cue: 'Rani berbicara pelan, sesekali memainkan ujung kertas yang terlipat.',
      },
    },
    {
      id: 'c',
      skillId: 'jeda-hening',
      text: 'Bisa lanjut pelan, ganti topik, atau cukup sampai sini. Kamu yang pilih.',
      next: 'r-perbaikan-bk',
      action: { kind: 'perbaikan', step: 'beri-pilihan' },
      routes: RESUME_WHEN_REPAIRED,
    },
    {
      id: 'd',
      skillId: 'nasihat-dini',
      text: 'Sudahlah, lupakan saja yang tadi. Yang penting kamu harus tetap semangat.',
      next: 'r-perbaikan-bk',
      reaction: {
        text: 'Iya... oke.',
        expression: 'menutup-diri',
        cue: 'Rani mengangguk kecil, tetapi suaranya hampir tidak terdengar.',
      },
    },
  ];
}

/** Hub perbaikan: tiga langkah perbaikan dan satu opsi keliru (empat pilihan). */
const R_PERBAIKAN_BK: StoryNode = {
  id: 'r-perbaikan-bk',
  sceneId: SCENE,
  stage: 'eksplorasi',
  depth: 0,
  reply: {
    text: 'Hmm... iya, tadi memang agak tidak enak. Tapi aku masih mau dengar kamu.',
    expression: 'waspada',
    cue: 'Rani melirik Dosen sebentar, belum sepenuhnya rileks tetapi tidak lagi menjauh.',
  },
  tension: { phase: 'perbaikan', expectedKind: 'menarik-diri' },
  choices: repairChoices(),
};

/** Simpul adegan Ruang BK bagian rencana dan Ketegangan, untuk dirakit di mhs-14.ts. */
export const R_BK_RENCANA_NODES: StoryNode[] = [R_B13, R_B14, R_TEGANG_BK, R_PERBAIKAN_BK];

/** Id simpul Ketegangan fase awal; dipakai sebagai `tensionFallbackNodeId` (validator mewajibkan fase awal). */
export const R_TENSION_FALLBACK_NODE_ID = 'r-tegang-bk';
