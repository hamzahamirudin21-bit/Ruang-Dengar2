/**
 * Cerita Mita Rahmawati (mhs-06), adegan Ruang BK bagian rencana dan Ketegangan.
 *
 * Simpul: mi-b13 (langkah kecil: satu pertanyaan ke asisten lab), mi-b14 (penutup sesi dan janji tindak lanjut),
 * mi-tegang-bk (Ketegangan awal, jenis `menarik-diri`, dipakai sebagai `tensionFallbackNodeId`),
 * mi-perbaikan-bk (hub perbaikan).
 *
 * Hub perbaikan memakai rute `@resume` bila keretakan sudah nonaktif.
 */
import type { StoryChoice, StoryNode, StoryRoute } from '../../engine/story/storyTypes';

const SCENE = 'bk';

const RESUME_WHEN_REPAIRED: StoryRoute[] = [
  { when: [{ type: 'tension', active: false }], next: '@resume' },
];

const MI_B13: StoryNode = {
  id: 'mi-b13',
  sceneId: SCENE,
  stage: 'rencana',
  depth: 1,
  reply: {
    text:
      'Mungkin... Rabu sore aku datengin asisten lab, bawa satu pertanyaan aja soal timer. ' +
      'Yang lain nyusul kalau aku udah berani.',
    expression: 'netral',
    cue: 'Mita membuka halaman bundelnya, melingkari satu tanda tanya dengan pensil, lalu menatap Dosen sebentar.',
  },
  choices: [
    {
      id: 'a',
      skillId: 'pertanyaan-terbuka',
      text: 'Pertanyaan mana yang kamu pilih, dan kalimat pertamanya mau gimana?',
      next: 'mi-b14',
      best: true,
      setFlags: ['langkah-kecil'],
      reaction: {
        text: 'Pertanyaan soal timer, Bu, kalimat pertamanya mungkin "Kak, aku belum paham bagian ini". Makasih udah sabar. Soal laporan itu, tolong jangan sampai ke asisten dulu ya. Boleh kukabarin Ibu setelah Rabu?',
        expression: 'cemas',
        cue: 'Mita mengulang kalimat itu tanpa suara, lalu menurunkan pandangan saat menyebut laporan.',
      },
    },
    {
      id: 'b',
      skillId: 'parafrase-ringkasan',
      text: 'Jadi Rabu sore, satu pertanyaan soal timer ke asisten lab. Udah pas?',
      next: 'mi-b14',
      setFlags: ['langkah-kecil'],
      reaction: {
        text: 'Iya, Bu, udah pas: Rabu sore, satu pertanyaan soal timer. Makasih udah sabar. Soal laporan itu, tolong jangan sampai ke asisten dulu ya. Boleh kukabarin setelah Rabu?',
        expression: 'cemas',
        cue: 'Mita mengangguk pelan sambil memegang bundelnya erat-erat.',
      },
    },
    {
      id: 'c',
      skillId: 'nasihat-dini',
      text: 'Tanyain aja semua sebelas pertanyaan sekaligus, biar tuntas hari itu juga.',
      next: 'mi-b14',
      reaction: {
        text: 'Semuanya? Wah, kebanyakan itu. Nanti aku malah nggak jadi datang.',
        expression: 'cemas',
        cue: 'Mita menutup bundel dan menariknya ke dada sambil tersenyum kaku.',
      },
    },
    {
      id: 'd',
      skillId: 'janji-mutlak',
      text: 'Asistennya pasti ramah. Aku jamin nggak ada yang bakal nertawain kamu.',
      next: 'mi-b14',
      reaction: {
        text: 'Semoga ya, Bu. Tapi Ibu kan nggak bisa mastiin.',
        expression: 'waspada',
        cue: 'Mita tersenyum sopan, lalu pensilnya berhenti di atas kertas.',
      },
    },
  ],
};

const MI_B14: StoryNode = {
  id: 'mi-b14',
  sceneId: SCENE,
  stage: 'rencana',
  depth: 1,
  reply: {
    text:
      'Makasih udah sabar sama aku. Soal laporan itu, tolong jangan sampai ke asisten dulu ya. ' +
      'Boleh aku kabarin Ibu setelah Rabu?',
    expression: 'cemas',
    cue: 'Mita berdiri, menaruh bundel di pelukan, dan melepaskan lengan bajunya sepenuhnya untuk pertama kali.',
  },
  choices: [
    {
      id: 'a',
      skillId: 'afirmasi-kekuatan',
      text: 'Kamu berani bawa satu pertanyaan. Kamis pagi aku mampir ke lab, ya.',
      next: 'mi-f0',
      best: true,
      action: { kind: 'janji', dueDayOffset: 3 },
      reaction: {
        text: 'Siap, Bu! Kemarin aku jadi nanya. Kak asistennya bilang tiga orang lain juga belum paham bagian timer. Aku sampai lupa nunduk.',
        expression: 'tersenyum',
        cue: 'Mita berdiri tegak dengan lengan baju tergulung dan menunjukkan satu tanda tanya yang sudah dicoret.',
        aside: 'Beberapa hari kemudian. Di meja praktikum, papan mikrokontroler Mita menyala dengan lampu kecil yang berkedip teratur.',
      },
    },
    {
      id: 'b',
      skillId: 'batas-kerahasiaan',
      text: 'Soal laporan tetap di antara kita, kecuali menyangkut keselamatanmu. Pintuku terbuka.',
      next: 'mi-f0',
      reaction: {
        text: 'Makasih, Bu, aku lega. Kemarin aku jadi nanya, ternyata tiga orang lain juga belum paham bagian timer. Aku sampai lupa nunduk.',
        expression: 'tersenyum',
        cue: 'Mita menahan senyum dan menunjuk papan mikrokontroler yang berkedip di mejanya.',
        aside: 'Beberapa hari kemudian. Di meja praktikum, papan mikrokontroler Mita menyala dengan lampu kecil yang berkedip teratur.',
      },
    },
    {
      id: 'c',
      skillId: 'janji-mutlak',
      text: 'Aku jamin setelah Rabu kamu pasti langsung paham dan nggak bakal ketinggalan lagi.',
      next: 'mi-f0',
      reaction: {
        text: 'Wah, semoga gitu ya. Aku catat dulu deh, Bu.',
        expression: 'waspada',
        cue: 'Mita mengangguk sopan, lalu menggenggam bundelnya lebih erat.',
      },
    },
    {
      id: 'd',
      skillId: 'pertanyaan-tertutup',
      text: 'Jadi sekarang kamu udah nggak khawatir lagi, kan?',
      next: 'mi-f0',
      reaction: {
        text: 'Udah nggak kok. Maaf, Bu, makasih.',
        expression: 'menutup-diri',
        cue: 'Mita menjawab cepat dan menunduk, tangannya kembali menarik lengan baju.',
      },
    },
  ],
};

/** Ketegangan awal: balasan langsung setelah kesalahan pemula di Ruang BK. */
const MI_TEGANG_BK: StoryNode = {
  id: 'mi-tegang-bk',
  sceneId: SCENE,
  stage: 'eksplorasi',
  depth: 0,
  reply: {
    text: 'Maaf, Bu, aku yang salah. Mending aku pamit dulu, udah kelamaan di sini.',
    expression: 'menutup-diri',
    cue: 'Mita menunduk, menyembunyikan tangan di balik lengan baju, dan menggeser tasnya ke arah pintu.',
  },
  tension: { phase: 'awal', expectedKind: 'menarik-diri' },
  choices: [
    {
      id: 'a',
      skillId: 'sampaikan-pengamatan',
      text: 'Kalimatku tadi kayaknya bikin kamu pengin pergi. Aku mau dengerin sisimu dulu.',
      next: 'mi-perbaikan-bk',
      best: true,
      action: { kind: 'akui-ketegangan' },
      options: { observationTone: 'faktual' },
    },
    {
      id: 'b',
      skillId: 'validasi-normalisasi',
      text: 'Nggak apa-apa kalau kamu mau pamit. Aku nggak keberatan nunggu.',
      next: 'mi-tegang-bk',
      reaction: {
        text: 'Makasih, Bu. Maaf ngerepotin.',
        expression: 'menutup-diri',
        cue: 'Mita mengangguk, tetapi duduknya makin ke ujung kursi.',
      },
    },
    {
      id: 'c',
      skillId: 'jeda-hening',
      text: 'Aku tunggu sebentar di sini ya.',
      next: 'mi-tegang-bk',
      reaction: {
        text: '...',
        expression: 'menutup-diri',
        cue: 'Mita diam lama, menarik dan melepas ujung lengan bajunya berulang-ulang.',
      },
    },
    {
      id: 'd',
      skillId: 'nasihat-dini',
      text: 'Jangan ngerasa bersalah terus. Kamu harus belajar lebih pede.',
      next: 'mi-tegang-bk',
      reaction: {
        text: 'Iya, Bu. Aku tahu kok. Maaf.',
        expression: 'menutup-diri',
        cue: 'Mita tersenyum tipis yang tidak sampai ke mata, lalu menatap lantai.',
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
      next: 'mi-perbaikan-bk',
      best: true,
      action: { kind: 'perbaikan', step: 'akui-dampak' },
      routes: RESUME_WHEN_REPAIRED,
      reaction: {
        text: 'Makasih udah bilang gitu. Aku jadi nggak ngerasa harus buru-buru pergi.',
        expression: 'waspada',
        cue: 'Mita melirik Dosen, lalu menurunkan tasnya dari pangkuan ke lantai.',
      },
    },
    {
      id: 'b',
      skillId: 'pertanyaan-terbuka',
      text: 'Kalau boleh, ceritain apa yang kamu rasain pas dengar kalimatku tadi.',
      next: 'mi-perbaikan-bk',
      action: { kind: 'perbaikan', step: 'eksplorasi-perasaan' },
      routes: RESUME_WHEN_REPAIRED,
      reaction: {
        text: 'Rasanya kayak ketahuan nggak bisa, terus aku pengin ngilang. Maaf, susah jelasinnya.',
        expression: 'cemas',
        cue: 'Mita berbicara sangat pelan, jemarinya meremas ujung lengan baju.',
      },
    },
    {
      id: 'c',
      skillId: 'jeda-hening',
      text: 'Kita bisa lanjut pelan, ganti topik, atau cukup sampai sini. Kamu yang mutusin.',
      next: 'mi-perbaikan-bk',
      action: { kind: 'perbaikan', step: 'beri-pilihan' },
      routes: RESUME_WHEN_REPAIRED,
    },
    {
      id: 'd',
      skillId: 'nasihat-dini',
      text: 'Udahlah, lupain aja yang tadi. Yang penting kamu tetap semangat belajar.',
      next: 'mi-perbaikan-bk',
      reaction: {
        text: 'Baik, Bu. Siap.',
        expression: 'menutup-diri',
        cue: 'Mita mengangguk kecil dan kembali menarik lengan baju ke buku jarinya.',
      },
    },
  ];
}

/** Hub perbaikan: tiga langkah perbaikan dan satu opsi keliru (empat pilihan). */
const MI_PERBAIKAN_BK: StoryNode = {
  id: 'mi-perbaikan-bk',
  sceneId: SCENE,
  stage: 'eksplorasi',
  depth: 0,
  reply: {
    text: 'Tadi emang kurang enak sih, tapi aku masih mau lanjut kalau Ibu nggak keberatan.',
    expression: 'waspada',
    cue: 'Mita kembali duduk lebih ke dalam kursi, tetapi tangannya belum lepas dari ujung lengan baju.',
  },
  tension: { phase: 'perbaikan', expectedKind: 'menarik-diri' },
  choices: repairChoices(),
};

export const MITA_BK_RENCANA_NODES: StoryNode[] = [MI_B13, MI_B14, MI_TEGANG_BK, MI_PERBAIKAN_BK];

export const MI_TENSION_FALLBACK_NODE_ID = 'mi-tegang-bk';
