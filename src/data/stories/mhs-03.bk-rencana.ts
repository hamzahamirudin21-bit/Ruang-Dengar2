/**
 * Cerita Tania Wijaya (mhs-03), adegan Ruang BK bagian rencana dan Ketegangan.
 *
 * Simpul: ta-b13 (langkah kecil), ta-b14 (penutup sesi dan janji tindak lanjut),
 * ta-tegang-bk (Ketegangan awal, jenis `menarik-diri`, dipakai sebagai
 * `tensionFallbackNodeId` oleh mhs-03.ts), ta-perbaikan-bk (hub perbaikan).
 *
 * Catatan perilaku Runner: pilihan yang mengabaikan Ketegangan kembali ke ta-tegang-bk;
 * hub perbaikan memakai rute `@resume` bila keretakan sudah nonaktif. Langkah terakhir
 * (`beri-pilihan`) sengaja tanpa `reaction` agar simpul yang dilanjutkan tampil dengan
 * ucapannya sendiri.
 */
import type { StoryNode, StoryRoute } from '../../engine/story/storyTypes';

const SCENE = 'bk';

const RESUME_WHEN_REPAIRED: StoryRoute[] = [
  { when: [{ type: 'tension', active: false }], next: '@resume' },
];

const TA_B13: StoryNode = {
  id: 'ta-b13',
  sceneId: SCENE,
  stage: 'rencana',
  depth: 1,
  reply: {
    text:
      'Nah, gimana kalau lembar yang kosong itu kuisi satu kolom aja: yang aku mau, bukan kata orang. ' +
      'Terus aku tanya Kak Dewi, kakak tingkat yang dulu asisten riset, kayak apa sih hari-harinya.',
    expression: 'netral',
    cue: 'Tania menarik lembar kosong itu ke tengah meja dan menggambar satu garis kolom dengan pulpennya.',
  },
  choices: [
    {
      id: 'a',
      skillId: 'pertanyaan-terbuka',
      text: 'Dari dua langkah itu, mana yang terasa paling mungkin kamu lakukan minggu ini?',
      reaction: { text: 'Yang paling mungkin minggu ini? Kolom kosong dulu, Bu. Kak Dewi nunggu dia balas.', expression: 'tersenyum', cue: 'Tania menunjuk lembar kosong di mejanya.' },
      next: 'ta-b14',
      best: true,
      setFlags: ['langkah-kecil'],
    },
    {
      id: 'b',
      skillId: 'parafrase-ringkasan',
      text: 'Jadi satu kolom keinginanmu sendiri dan satu obrolan dengan Kak Dewi. Sudah tepat?',
      reaction: { text: 'Iya, Bu, pas banget! Satu kolom dan satu obrolan.', expression: 'tersenyum', cue: 'Tania mengangguk semangat sambil menunjukkan dua jari.' },
      next: 'ta-b14',
      setFlags: ['langkah-kecil'],
    },
    {
      id: 'c',
      skillId: 'nasihat-dini',
      text: 'Sekalian saja daftar asisten riset hari ini, supaya tidak menunda lagi.',
      next: 'ta-b14',
      reaction: {
        text: 'Hari ini? Duh, Bu, jangan dulu deh. Aku belum siap secepat itu, serius.',
        expression: 'cemas',
        cue: 'Tania menutup pulpennya dan menggenggamnya erat.',
      },
    },
    {
      id: 'd',
      skillId: 'janji-mutlak',
      text: 'Kak Dewi pasti memberi jawaban yang membuatmu langsung yakin, saya jamin.',
      next: 'ta-b14',
      reaction: {
        text: 'Semoga ya, Bu. Tapi kan Ibu nggak bisa tahu pasti.',
        expression: 'waspada',
        cue: 'Tania tersenyum kecil, tetapi jarinya kembali mengetuk meja pelan.',
      },
    },
  ],
};

const TA_B14: StoryNode = {
  id: 'ta-b14',
  sceneId: SCENE,
  stage: 'rencana',
  depth: 1,
  reply: {
    text:
      'Makasih ya, Bu. Tapi... soal lembar yang kutunjukin tadi, nggak bakal nyebar ke tim, kan? ' +
      'Terus kapan kita ngobrol lagi? Aku mau lapor hasil ngobrol sama Kak Dewi.',
    expression: 'cemas',
    cue: 'Tania berdiri, memasukkan dua map ke tas, lalu menyisakan lembar yang kini punya satu kolom di atas meja.',
  },
  choices: [
    {
      id: 'a',
      skillId: 'afirmasi-kekuatan',
      text: 'Kamu berani menyusun langkahmu sendiri. Empat hari lagi aku menyapamu di lab, ya.',
      reaction: { text: 'Makasih, Bu! Empat hari lagi, ya, aku catat di kalender.', expression: 'tersenyum', cue: 'Tania mencatat sesuatu di ponselnya sambil tersenyum.' },
      next: 'ta-f0',
      best: true,
      action: { kind: 'janji', dueDayOffset: 4 },
    },
    {
      id: 'b',
      skillId: 'batas-kerahasiaan',
      text: 'Lembar itu tetap di antara kita, kecuali menyangkut keselamatanmu. Pintu ini terbuka.',
      reaction: { text: 'Oke, Bu, aman. Makasih udah jaga lembarnya.', expression: 'lega', cue: 'Tania mengangguk dan melipat lembar itu ke dalam tasnya.' },
      next: 'ta-f0',
    },
    {
      id: 'c',
      skillId: 'janji-mutlak',
      text: 'Aku jamin setelah ini kamu pasti tahu mana pilihan yang terbaik.',
      next: 'ta-f0',
      reaction: {
        text: 'Oh, oke. Semoga beneran gitu.',
        expression: 'waspada',
        cue: 'Tania mengangguk dan mengalihkan pandangan ke kolom kosong di kertasnya.',
      },
    },
    {
      id: 'd',
      skillId: 'pertanyaan-tertutup',
      text: 'Jadi sekarang kamu sudah tidak bimbang lagi, kan?',
      next: 'ta-f0',
      reaction: {
        text: 'Iya, Bu. Kayaknya sih.',
        expression: 'menutup-diri',
        cue: 'Tania menjawab cepat dan menyampirkan tasnya tanpa menoleh.',
      },
    },
  ],
};

const TA_TEGANG_BK: StoryNode = {
  id: 'ta-tegang-bk',
  sceneId: SCENE,
  stage: 'eksplorasi',
  depth: 0,
  reply: {
    text: 'Oh, iya, Bu. Maaf, aku kebanyakan cerita ya. Mungkin cukup sampai sini aja.',
    expression: 'menutup-diri',
    cue: 'Tania menumpuk map-mapnya rapi dan menaruh pulpen di atasnya, seolah bersiap pergi.',
  },
  tension: { phase: 'awal', expectedKind: 'menarik-diri' },
  choices: [
    {
      id: 'a',
      skillId: 'sampaikan-pengamatan',
      text: 'Kalimatku barusan kayaknya bikin kamu mundur. Aku pengin dengar dari sisimu dulu.',
      next: 'ta-perbaikan-bk',
      best: true,
      action: { kind: 'akui-ketegangan' },
      options: { observationTone: 'faktual' },
    },
    {
      id: 'b',
      skillId: 'validasi-normalisasi',
      text: 'Nggak apa-apa kalau mau berhenti. Kita lanjut sesuai kenyamananmu aja.',
      next: 'ta-tegang-bk',
      reaction: {
        text: 'Iya, Bu. Makasih.',
        expression: 'menutup-diri',
        cue: 'Tania tersenyum sopan, tetapi tidak membuka map-mapnya lagi.',
      },
    },
    {
      id: 'c',
      skillId: 'jeda-hening',
      text: 'Aku tunggu sebentar di sini ya.',
      next: 'ta-tegang-bk',
      reaction: {
        text: '...',
        expression: 'menutup-diri',
        cue: 'Tania diam cukup lama. Pulpennya yang biasa mengetuk kini tak bergerak.',
      },
    },
    {
      id: 'd',
      skillId: 'nasihat-dini',
      text: 'Jangan buru-buru pergi. Kamu harus belajar menyelesaikan satu hal sampai tuntas.',
      next: 'ta-tegang-bk',
      reaction: {
        text: 'Iya, Bu. Aku ngerti kok.',
        expression: 'menutup-diri',
        cue: 'Tania mengangguk datar dan memandang tas di pangkuannya.',
      },
    },
  ],
};

const TA_PERBAIKAN_BK: StoryNode = {
  id: 'ta-perbaikan-bk',
  sceneId: SCENE,
  stage: 'eksplorasi',
  depth: 0,
  reply: {
    text: 'Tadi rasanya kayak aku ngomong kebanyakan terus dipotong. Tapi aku masih mau denger Ibu.',
    expression: 'waspada',
    cue: 'Tania meletakkan tasnya di lantai, belum sepenuhnya rileks tetapi tidak lagi bersiap pergi.',
  },
  tension: { phase: 'perbaikan', expectedKind: 'menarik-diri' },
  choices: [
    {
      id: 'a',
      skillId: 'validasi-normalisasi',
      text: 'Maaf ya, caraku tadi terasa memotongmu. Dampaknya nyata, dan aku mengakuinya.',
      next: 'ta-perbaikan-bk',
      best: true,
      action: { kind: 'perbaikan', step: 'akui-dampak' },
      routes: RESUME_WHEN_REPAIRED,
      reaction: {
        text: 'Iya, Bu, agak kaget tadi. Makasih udah bilang.',
        expression: 'waspada',
        cue: 'Tania melirik Dosen sebentar, lalu mengambil pulpennya kembali.',
      },
    },
    {
      id: 'b',
      skillId: 'pertanyaan-terbuka',
      text: 'Kalau boleh, cerita dong apa yang kamu rasakan waktu dengar kalimatku tadi.',
      next: 'ta-perbaikan-bk',
      action: { kind: 'perbaikan', step: 'eksplorasi-perasaan' },
      routes: RESUME_WHEN_REPAIRED,
      reaction: {
        text: 'Kayak aku salah lagi, padahal aku cuma lagi nyari kata yang pas.',
        expression: 'cemas',
        cue: 'Tania berbicara pelan, sesekali memutar tutup pulpen.',
      },
    },
    {
      id: 'c',
      skillId: 'jeda-hening',
      text: 'Kita bisa lanjut, ganti topik, atau cukup sampai sini. Kamu yang memutuskan.',
      next: 'ta-perbaikan-bk',
      action: { kind: 'perbaikan', step: 'beri-pilihan' },
      routes: RESUME_WHEN_REPAIRED,
    },
    {
      id: 'd',
      skillId: 'nasihat-dini',
      text: 'Sudahlah, lupakan yang tadi. Yang penting kamu tetap semangat.',
      next: 'ta-perbaikan-bk',
      reaction: {
        text: 'Iya, Bu. Oke.',
        expression: 'menutup-diri',
        cue: 'Tania mengangguk kecil, senyumnya tipis dan tidak sampai ke mata.',
      },
    },
  ],
};

export const TA_BK_RENCANA_NODES: StoryNode[] = [TA_B13, TA_B14, TA_TEGANG_BK, TA_PERBAIKAN_BK];

/** Id simpul Ketegangan fase awal; dipakai sebagai `tensionFallbackNodeId`. */
export const TA_TENSION_FALLBACK_NODE_ID = 'ta-tegang-bk';
