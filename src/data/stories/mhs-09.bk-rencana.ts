/**
 * Cerita Gilang Ramadhan (mhs-09), adegan Ruang BK bagian rencana dan Ketegangan.
 *
 * Simpul: gi-b13 (langkah kecil: meminta cara koreksi yang berbeda dan mengumpulkan sambungan las),
 * gi-b14 (penutup sesi dan janji tindak lanjut),
 * gi-tegang-bk (Ketegangan awal, jenis `menarik-diri`, dipakai sebagai `tensionFallbackNodeId`),
 * gi-perbaikan-bk (hub perbaikan).
 *
 * Hub perbaikan memakai rute `@resume` bila keretakan sudah nonaktif. Langkah terakhir
 * (`beri-pilihan`) sengaja tanpa `reaction` agar simpul yang dilanjutkan tampil dengan ucapannya sendiri.
 */
import type { StoryNode, StoryRoute } from '../../engine/story/storyTypes';

const SCENE = 'bk';

const RESUME_WHEN_REPAIRED: StoryRoute[] = [
  { when: [{ type: 'tension', active: false }], next: '@resume' },
];

const GI_B13: StoryNode = {
  id: 'gi-b13',
  sceneId: SCENE,
  stage: 'rencana',
  depth: 1,
  reply: {
    text:
      'Mungkin... aku bilang ke Rangga langsung: kalau ada koreksi, kirim lewat chat atau tunggu kelas selesai. ' +
      'Terus sambungan yang kulas ulang itu kukumpulin, tapi aku yang anter sendiri ke dia.',
    expression: 'netral',
    cue: 'Gilang mengambil ponselnya, mengetik satu baris di catatan, lalu menatap Dosen tanpa mengeraskan rahang.',
  },
  choices: [
    {
      id: 'a',
      reaction: {
        text: 'Iya, Bu, tepat. Intinya aku yang pegang kendali kapan hasilku dilihat.',
        expression: 'netral',
        cue: 'Gilang mengangguk, tatapannya tegas dan tidak lagi menghindar.',
      },
      skillId: 'parafrase-ringkasan',
      text: 'Jadi koreksi lewat chat atau setelah kelas, dan kamu anter sendiri sambungannya. Betul?',
      next: 'gi-b14',
      best: true,
      setFlags: ['langkah-kecil'],
    },
    {
      id: 'b',
      reaction: {
        text: 'Berani? Belum tentu juga, Bu. Tapi ya, mau kucoba.',
        expression: 'menunduk',
        cue: 'Gilang menggaruk tengkuk sambil tersenyum tipis yang canggung.',
      },
      skillId: 'afirmasi-kekuatan',
      text: 'Minta cara diubah dan bawa hasilmu sendiri itu langkah yang berani.',
      next: 'gi-b14',
      setFlags: ['langkah-kecil'],
    },
    {
      id: 'c',
      skillId: 'nasihat-dini',
      text: 'Sebaiknya kamu minta maaf juga ke seluruh kelompok tentang sikapmu kemarin.',
      next: 'gi-b14',
      reaction: {
        text: 'Minta maaf? Aku yang dipermalukan, kok aku yang harus minta maaf?',
        expression: 'kesal',
        cue: 'Gilang menyimpan ponselnya dengan gerakan kasar dan menyipitkan mata.',
      },
    },
    {
      id: 'd',
      skillId: 'janji-mutlak',
      text: 'Rangga pasti setuju. Aku jamin ia tidak akan menegurmu di depan orang lagi.',
      next: 'gi-b14',
      reaction: {
        text: 'Jamin? Ibu bukan Rangga. Nanti kalau dia tetap begitu, gimana?',
        expression: 'waspada',
        cue: 'Gilang mengangkat dagu dan menyilangkan tangan lagi.',
      },
    },
  ],
};

const GI_B14: StoryNode = {
  id: 'gi-b14',
  sceneId: SCENE,
  stage: 'rencana',
  depth: 1,
  reply: {
    text:
      'Soal sambungan las itu, jangan sampai ke dosen pembimbing dulu ya. Biar aku yang bilang sendiri. ' +
      'Terus... kapan Ibu mampir ke bengkel lagi? Aku mau lapor hasilnya.',
    expression: 'cemas',
    cue: 'Gilang berdiri, merapikan lengan jaketnya, lalu berhenti di pintu dengan satu tangan masih di gagang.',
  },
  choices: [
    {
      id: 'a',
      reaction: {
        text: 'Oke, Bu, mampir aja. Nanti kutunjukin hasil lasku langsung.',
        expression: 'tersenyum',
        cue: 'Gilang tersenyum tipis dan memasukkan tangannya ke saku jaket.',
      },
      skillId: 'afirmasi-kekuatan',
      text: 'Kamu berani bilang kebutuhanmu. Tiga hari lagi aku mampir ke bengkel, ya.',
      next: 'gi-f0',
      best: true,
      action: { kind: 'janji', dueDayOffset: 3 },
    },
    {
      id: 'b',
      reaction: {
        text: 'Makasih, Bu. Berarti tetap aku yang nentuin, ya. Oke.',
        expression: 'lega',
        cue: 'Gilang mengangguk perlahan dan menarik napas yang lebih ringan.',
      },
      skillId: 'batas-kerahasiaan',
      text: 'Kamu yang tentukan kapan sambungan itu dibawa ke pembimbing. Pintu ini selalu terbuka.',
      next: 'gi-f0',
    },
    {
      id: 'c',
      skillId: 'janji-mutlak',
      text: 'Setelah ini tidak akan ada yang mengomentari pekerjaanmu lagi, aku jamin.',
      next: 'gi-f0',
      reaction: {
        text: 'Mustahil sih. Tapi ya, boleh lah.',
        expression: 'waspada',
        cue: 'Gilang mendengus kecil, lalu membuka pintu tanpa menoleh.',
      },
    },
    {
      id: 'd',
      skillId: 'pertanyaan-tertutup',
      text: 'Jadi sekarang kamu udah nggak marah lagi, kan?',
      next: 'gi-f0',
      reaction: {
        text: 'Aku bukan marah. Aku cuma kapok.',
        expression: 'kesal',
        cue: 'Gilang menjawab cepat sambil menatap lorong di balik pintu.',
      },
    },
  ],
};

/** Ketegangan awal: penarikan diri dingin setelah kesalahan pemula di Ruang BK. */
const GI_TEGANG_BK: StoryNode = {
  id: 'gi-tegang-bk',
  sceneId: SCENE,
  stage: 'eksplorasi',
  depth: 0,
  reply: {
    text: 'Tuh, kan. Sama aja. Ibu juga datang cuma buat nunjuk salahku. Aku nggak butuh ini.',
    expression: 'kesal',
    cue: 'Gilang berdiri mendadak sampai kursinya bergeser keras, rahangnya mengeras, dan telunjuknya terarah ke meja di antara mereka.',
  },
  tension: { phase: 'awal', expectedKind: 'menarik-diri' },
  choices: [
    {
      id: 'a',
      skillId: 'sampaikan-pengamatan',
      text: 'Kalimatku tadi kedengaran nunjuk salahmu. Bukan itu niatku, aku mau dengar sisimu.',
      next: 'gi-perbaikan-bk',
      best: true,
      action: { kind: 'akui-ketegangan' },
      options: { observationTone: 'faktual' },
    },
    {
      id: 'b',
      skillId: 'validasi-normalisasi',
      text: 'Nggak apa-apa kalau kamu marah. Aku tetap duduk di sini kok.',
      next: 'gi-tegang-bk',
      reaction: {
        text: 'Nggak usah sok sabar deh. Aku tahu Ibu juga menilai.',
        expression: 'kesal',
        cue: 'Gilang tetap berdiri, napasnya cepat, dan tangannya mengepal di sisi tubuh.',
      },
    },
    {
      id: 'c',
      skillId: 'jeda-hening',
      text: 'Aku tunggu sebentar di sini ya.',
      next: 'gi-tegang-bk',
      reaction: {
        text: 'Diem-diem gitu malah lebih nyebelin.',
        expression: 'kesal',
        cue: 'Gilang menendang pelan kaki kursinya, lalu berjalan satu langkah ke pintu dan berhenti.',
      },
    },
    {
      id: 'd',
      skillId: 'nasihat-dini',
      text: 'Duduk dulu dan tenangkan diri. Marah-marah nggak akan menyelesaikan apa pun.',
      next: 'gi-tegang-bk',
      reaction: {
        text: 'Tuh kan? Diceramahin lagi.',
        expression: 'kesal',
        cue: 'Gilang tertawa pendek tanpa senyum dan meraih jaketnya dari sandaran kursi.',
      },
    },
  ],
};

/** Hub perbaikan: tiga langkah perbaikan dan satu opsi keliru (empat pilihan). */
const GI_PERBAIKAN_BK: StoryNode = {
  id: 'gi-perbaikan-bk',
  sceneId: SCENE,
  stage: 'eksplorasi',
  depth: 0,
  reply: {
    text: 'Hmph. Oke. Aku dengerin dulu. Tapi kalau Ibu mulai ceramah lagi, aku keluar.',
    expression: 'waspada',
    cue: 'Gilang duduk kembali, tetapi menahan jaket di pangkuan dan belum menyandarkan punggung.',
  },
  tension: { phase: 'perbaikan', expectedKind: 'menarik-diri' },
  choices: [
    {
      id: 'a',
      skillId: 'validasi-normalisasi',
      text: 'Maaf, ucapanku tadi terasa menyalahkanmu, dan dampaknya nyata buatmu. Aku akui itu.',
      next: 'gi-perbaikan-bk',
      best: true,
      action: { kind: 'perbaikan', step: 'akui-dampak' },
      routes: RESUME_WHEN_REPAIRED,
      reaction: {
        text: 'Hm. Oke. Itu yang kemarin nggak ada yang ngomong.',
        expression: 'netral',
        cue: 'Gilang menghela napas dan melepas cengkeramannya pada jaket.',
      },
    },
    {
      id: 'b',
      skillId: 'pertanyaan-terbuka',
      text: 'Kalau boleh, ceritain apa yang kamu rasain waktu dengar kalimatku tadi.',
      next: 'gi-perbaikan-bk',
      action: { kind: 'perbaikan', step: 'eksplorasi-perasaan' },
      routes: RESUME_WHEN_REPAIRED,
      reaction: {
        text: 'Rasanya kayak dicari salahnya lagi. Capek banget, harus bela diri terus.',
        expression: 'lelah',
        cue: 'Gilang berbicara lebih pelan, jemarinya meremas ujung jaket.',
      },
    },
    {
      id: 'c',
      skillId: 'jeda-hening',
      text: 'Kita bisa lanjut pelan, ganti topik, atau cukup sampai sini. Kamu yang tentukan.',
      next: 'gi-perbaikan-bk',
      action: { kind: 'perbaikan', step: 'beri-pilihan' },
      routes: RESUME_WHEN_REPAIRED,
    },
    {
      id: 'd',
      skillId: 'meremehkan',
      text: 'Sudahlah, itu cuma salah paham kecil. Jangan dibesar-besarkan.',
      next: 'gi-perbaikan-bk',
      routes: RESUME_WHEN_REPAIRED,
      reaction: {
        text: 'Kecil? Buat Ibu mungkin.',
        expression: 'kesal',
        cue: 'Gilang berdiri setengah, lalu duduk lagi dengan rahang kaku.',
      },
    },
  ],
};

export const GI_BK_RENCANA_NODES: StoryNode[] = [GI_B13, GI_B14, GI_TEGANG_BK, GI_PERBAIKAN_BK];

export const GI_TENSION_FALLBACK_NODE_ID = 'gi-tegang-bk';
