/**
 * Sari Melati (mhs-12), adegan Ruang BK bagian pemahaman.
 * Simpul: s-b6 sampai s-b12 ditambah alternatif s-b8-alt, s-b9-alt, s-b12-alt.
 *
 * Titik sambung:
 *  - masuk dari `s-b5` (berkas bk-eksplorasi) ke `s-b6`.
 *  - keluar dari `s-b12` dan `s-b12-alt` ke `s-b13` (berkas bk-rencana).
 *  - Ketegangan memakai `s-tegang-bk` (berkas bk-rencana).
 *
 * Gerbang: `s-b8` (Momen_Terbuka) butuh flag `pengamatan-peran`, trust >= 70, dan level >= 1;
 * `s-b9` butuh level >= 1; `s-b12` (inti kebutuhan) butuh level >= 2. Bila gagal, alur memakai
 * simpul alternatif (Sari menepis dengan humor) yang tetap menuju tulang punggung cerita.
 *
 * Refleksi yang benar menurut cerita (lelah dan takut mengecewakan) memakai
 * `reflectionCorrectOverride: true` karena emosi bawaan mesin untuk Sari berbeda.
 */
import type { StoryNode } from '../../engine/story/storyTypes';

const SCENE = 'bk';
const TENSION = 's-tegang-bk';
const BENAR = { reflectionCorrectOverride: true } as const;
const FAKTUAL = { observationTone: 'faktual' } as const;

export const MHS_12_BK_PEMAHAMAN_NODES: StoryNode[] = [
  {
    id: 's-b6',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Kalau aku berhenti nengahin? Hmm... jujurly nggak tahu sih. Belum pernah nyoba, hehe.',
      expression: 'cemas',
      cue: 'Sari tertawa kecil, tetapi tangannya meremas ponsel yang layarnya sudah gelap.',
    },
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 's-b8',
        text: 'Kalau dibayangin sebentar, apa yang mungkin terjadi pada kelompok dan dirimu?',
        reaction: {
          text: 'Hmm, kelompoknya mungkin jadi kacau dulu, hehe. Kalau aku? Nggak tahu deh. Aneh aja ngebayanginnya, soalnya aku nggak pernah ngebayangin diriku di situ.',
          expression: 'cemas',
          cue: 'Sari menatap ke atas sebentar, lalu tertawa kecil sambil memutar-mutar ponsel.',
        },
      },
      {
        id: 'b', skillId: 'refleksi-perasaan', options: BENAR, next: 's-b8',
        text: 'Kayaknya selama ini kamu nahan banyak hal sendirian, dan itu menguras tenagamu.',
        reaction: {
          text: 'Hehe, kamu bisa baca orang ya. Mungkin iya, capek juga sih kadang. Tapi aku belum kebiasaan ngomongin itu.',
          expression: 'lelah',
          cue: 'Sari tertawa pelan, lalu meletakkan ponsel di meja dan menarik napas.',
        },
      },
      {
        id: 'c', skillId: 'validasi-normalisasi', next: 's-b8',
        text: 'Wajar kok belum pernah coba. Peran penengah itu sudah lama melekat padamu.',
        reaction: {
          text: 'Iya, udah lama banget malah. Jadi ya... kebiasaan, hehe.',
          expression: 'netral',
          cue: 'Sari mengangkat bahu dengan senyum tipis, lalu merapikan jadwal di pangkuannya.',
        },
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: TENSION,
        text: 'Coba berhenti menengahi seminggu saja. Pasti kelompokmu baik-baik saja.',
      },
    ],
  },
  {
    id: 's-b8',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 2,
    reply: {
      text: 'Aku takut kalau berhenti menengahi, mereka pecah, terus semua nyalahin aku. Capek banget sumpah, tapi kalau bilang capek, aku jadi "nggak asik" lagi.',
      expression: 'menunduk',
      cue: 'Sari menatap meja. Tawanya sudah hilang, dan suaranya turun sampai hampir berbisik.',
    },
    marks: ['momen-terbuka', 'isyarat-nonverbal'],
    gate: {
      conditions: [
        { type: 'flag', flag: 'pengamatan-peran' },
        { type: 'trust-min', value: 70 },
        { type: 'level-min', value: 1 },
      ],
      otherwise: 's-b8-alt',
    },
    onEnter: { setFlags: ['momen-terbuka'] },
    choices: [
      {
        id: 'a', skillId: 'jeda-hening', best: true, next: 's-b9',
        text: 'Aku di sini kok. Nggak perlu buru-buru, ambil waktu yang kamu butuhkan.',
        reaction: {
          text: 'Makasih... aku narik napas dulu. Rasanya aneh ngomong gini ke orang. Biasanya aku yang dengerin.',
          expression: 'menunduk',
          cue: 'Sari menarik napas dalam dan menatap meja. Suaranya hampir berbisik.',
        },
      },
      {
        id: 'b', skillId: 'afirmasi-kekuatan', next: 's-b9',
        text: 'Makasih sudah mau cerita. Jujur kayak gini butuh keberanian.',
        reaction: {
          text: 'Hehe... iya, jantungku deg-degan dikit, jujurly. Takut kedengeran lebay.',
          expression: 'menunduk',
          cue: 'Sari tertawa tipis yang tidak sampai ke matanya, lalu menunduk dan memegangi ponselnya.',
        },
      },
      {
        id: 'c', skillId: 'refleksi-perasaan', options: BENAR, next: 's-b9',
        text: 'Kamu lelah, dan kamu takut kelelahan itu malah mengecewakan orang lain.',
        reaction: {
          text: 'Iya... persis itu. Capek, tapi kalau capek ketahuan, aku takut orang kecewa. Kok kamu bisa ngerti sih.',
          expression: 'menunduk',
          cue: 'Sari mengangkat wajah sebentar, matanya berkaca-kaca, lalu menunduk lagi.',
        },
      },
      {
        id: 'd', skillId: 'interogasi', next: TENSION,
        text: 'Kenapa tidak bilang dari dulu kalau kamu capek? Kenapa harus dipendam sendiri?',
      },
    ],
  },
  {
    id: 's-b8-alt',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Aku baik-baik aja kok, santuy! Namanya juga anak penghubung, hehe.',
      expression: 'tersenyum',
      cue: 'Sari tersenyum cepat dan mengalihkan pandangan ke jendela, seolah topiknya sudah selesai.',
    },
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 's-b9',
        text: 'Di luar yang terlihat orang, hari-harimu belakangan ini rasanya gimana?',
        reaction: {
          text: 'Hmm, ya jalan aja sih. Pagi kuliah, siang kelompok, malam balesin chat. Ya gitu, hehe.',
          expression: 'netral',
          cue: 'Sari tersenyum cepat dan mengalihkan pandangan ke jendela.',
        },
      },
      {
        id: 'b', skillId: 'sampaikan-pengamatan', options: FAKTUAL, next: 's-b9',
        text: 'Aku perhatiin tawamu mengecil tiap kita bahas permintaan teman-temanmu.',
        reaction: {
          text: 'Hah, masa? Nggak sadar deh. Mungkin cuma lagi ngantuk, hehe.',
          expression: 'tersenyum',
          cue: 'Sari tertawa dan mengusap mata, seolah ingin menunjukkan dirinya hanya mengantuk.',
        },
      },
      {
        id: 'c', skillId: 'validasi-normalisasi', next: 's-b9',
        text: 'Nggak apa-apa kalau belum mau bahas. Ruang ini tetap terbuka kapan pun kamu siap.',
        reaction: {
          text: 'Makasih, hehe. Nanti kalau aku siap kukabarin ya. Sekarang santuy dulu aja.',
          expression: 'tersenyum',
          cue: 'Sari mengangguk dengan senyum cepat dan kembali menatap jendela.',
        },
      },
      {
        id: 'd', skillId: 'meremehkan', next: 's-b9',
        text: 'Nah, kalau memang baik-baik saja, berarti tidak perlu dibahas panjang-panjang.',
        reaction: {
          text: 'Iya, bener. Udah, gitu aja, hehe.',
          expression: 'menutup-diri',
          cue: 'Sari tertawa tipis sambil memeriksa ponselnya, padahal layarnya mati.',
        },
      },
    ],
  },
  {
    id: 's-b9',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 2,
    reply: {
      text: 'Tiap kali aku nolak permintaan, rasanya bersalah banget. Aku tuh kayak punya utang sama semua orang.',
      expression: 'menunduk',
      cue: 'Sari menarik napas dalam, lalu mengembuskannya pelan. Jarinya berhenti memutar gelang.',
    },
    gate: { conditions: [{ type: 'level-min', value: 1 }], otherwise: 's-b9-alt' },
    choices: [
      {
        id: 'a', skillId: 'validasi-normalisasi', best: true, next: 's-b12',
        text: 'Rasa bersalah saat nolak itu wajar, apalagi kamu biasa jadi sandaran.',
        reaction: {
          text: 'Beneran wajar ya? Aku kira cuma aku yang lebay. Soalnya tiap nolak, aku kebayang mereka kecewa.',
          expression: 'menunduk',
          cue: 'Sari menarik napas dalam, lalu mengembuskannya pelan sambil memegangi gelangnya.',
        },
      },
      {
        id: 'b', skillId: 'refleksi-perasaan', options: BENAR, next: 's-b12',
        text: 'Seolah tiap penolakan bikin kamu berutang rasa bersalah, dan itu berat dipikul.',
        reaction: {
          text: 'Iya, berat. Kayak tiap nolak ada catatan utangnya di kepalaku, dan nggak pernah lunas.',
          expression: 'menunduk',
          cue: 'Sari memutar gelangnya pelan, matanya tertuju pada permukaan meja.',
        },
      },
      {
        id: 'c', skillId: 'pertanyaan-terbuka', next: 's-b12',
        text: 'Kalau kamu nolak, biasanya kamu bayangin orang bakal bilang apa?',
        reaction: {
          text: 'Paling mereka bilang, "Yah, Sari kok gitu sekarang?" Atau cuma diam, tapi diamnya yang bikin aku nggak enak.',
          expression: 'menunduk',
          cue: 'Sari menggigit bibir sebentar, lalu menarik napas dan menatap ujung jarinya.',
        },
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: TENSION,
        text: 'Kalau begitu mulai sekarang tolak saja semua permintaan yang tidak penting.',
      },
    ],
  },
  {
    id: 's-b9-alt',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Ya kadang nolak itu jujurly nggak enak aja sih. Tapi yaudah, biasa.',
      expression: 'netral',
      cue: 'Sari mengangkat bahu dan tertawa kecil, lalu merapikan jadwal kelompok di pangkuannya.',
    },
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 's-b12',
        text: 'Bagian mana dari nolak itu yang paling nggak enak buatmu?',
        reaction: {
          text: 'Pas ngelihat muka mereka sesudahnya, hehe. Kayak ada yang turun dikit. Tapi ya udah, biasa.',
          expression: 'netral',
          cue: 'Sari mengangkat bahu dan tertawa kecil, lalu merapikan jadwal kelompok di pangkuannya.',
        },
      },
      {
        id: 'b', skillId: 'parafrase-ringkasan', next: 's-b12',
        text: 'Jadi nolak itu nggak nyaman, tapi kamu sudah terbiasa menanggungnya.',
        reaction: {
          text: 'Iya, bener. Nggak nyaman sih, tapi udah kebiasaan, jadi ya jalan aja.',
          expression: 'netral',
          cue: 'Sari mengangguk sambil tertawa kecil, lalu menepuk-nepuk lembar jadwalnya.',
        },
      },
      {
        id: 'c', skillId: 'validasi-normalisasi', next: 's-b12',
        text: 'Nggak enak saat nolak itu wajar. Banyak orang ngerasain hal yang sama.',
        reaction: {
          text: 'Oh, banyak yang ngerasain juga ya? Lumayan lega dengernya, hehe. Berarti bukan cuma aku.',
          expression: 'tersenyum',
          cue: 'Sari tertawa kecil, bahunya turun sedikit, lalu merapikan jadwal di pangkuannya.',
        },
      },
      {
        id: 'd', skillId: 'pertanyaan-tertutup', next: 's-b12',
        text: 'Jadi sebenarnya kamu tidak keberatan sama sekali, begitu?',
        reaction: {
          text: 'Iya, enggak keberatan kok. Beneran.',
          expression: 'menutup-diri',
          cue: 'Sari menjawab cepat sambil tersenyum lebar, tetapi matanya tidak ikut tersenyum.',
        },
      },
    ],
  },
  {
    id: 's-b12',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 3,
    reply: {
      text: 'Aku tuh pengen boleh bilang "nggak" atau "aku butuh waktu" tanpa merasa mengecewakan semua orang.',
      expression: 'lega',
      cue: 'Suara Sari pelan tetapi mantap. Bahunya turun, dan untuk pertama kalinya ia berhenti memegangi ponselnya.',
    },
    marks: ['isyarat-nonverbal'],
    gate: { conditions: [{ type: 'level-min', value: 2 }], otherwise: 's-b12-alt' },
    choices: [
      {
        id: 'a', skillId: 'refleksi-perasaan', best: true, options: BENAR, next: 's-b13',
        text: 'Kamu butuh ruang buat bilang tidak atau minta waktu, tanpa takut mengecewakan.',
        reaction: {
          text: 'Iya, itu. Makanya kepikiran satu hal kecil: minggu ini sekali aja aku bilang ke grup, "Aku butuh lima belas menit dulu", terus nanti kubales lagi.',
          expression: 'lega',
          cue: 'Sari berbicara pelan tetapi mantap, bahunya turun, dan ia berhenti memegangi ponselnya.',
        },
      },
      {
        id: 'b', skillId: 'parafrase-ringkasan', next: 's-b13',
        text: 'Jadi kamu ingin boleh istirahat dan menolak sesekali, tapi tetap diterima. Tepat?',
        reaction: {
          text: 'Tepat banget. Makanya aku kepikiran coba kecil-kecilan: sekali aja minggu ini bilang ke grup, "Aku butuh lima belas menit dulu", habis itu kubales lagi.',
          expression: 'lega',
          cue: 'Sari mengangguk mantap dan meletakkan ponselnya di meja dengan layar terbalik.',
        },
      },
      {
        id: 'c', skillId: 'afirmasi-kekuatan', next: 's-b13',
        text: 'Kamu tahu persis apa yang kamu butuhkan. Itu kekuatan yang nggak semua orang punya.',
        reaction: {
          text: 'Hehe, baru kali ini aku sadar. Jadi aku mau coba satu hal kecil: sekali minggu ini bilang ke grup, "Aku butuh lima belas menit dulu", terus kubales lagi nanti.',
          expression: 'tersenyum',
          cue: 'Sari tersenyum tipis, suaranya pelan tetapi mantap, dan jarinya berhenti bergerak di ponsel.',
        },
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: TENSION,
        text: 'Kalau begitu mulai besok katakan tidak saja ke semua permintaan teman-temanmu.',
      },
    ],
  },
  {
    id: 's-b12-alt',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Intinya aku pengen lebih ringan aja, literally itu. Susah jelasinnya, hehe.',
      expression: 'netral',
      cue: 'Sari menarik napas panjang, lalu tertawa pelan sambil menggaruk tengkuknya.',
    },
    choices: [
      {
        id: 'a', skillId: 'validasi-normalisasi', best: true, next: 's-b13',
        text: 'Ingin lebih ringan itu masuk akal. Kamu nggak perlu jelasin semuanya sekarang.',
        reaction: {
          text: 'Makasih ya, hehe. Tapi kayaknya ada satu hal kecil yang bisa kucoba: sekali minggu ini bilang ke grup, "Aku butuh lima belas menit dulu", terus kubales lagi.',
          expression: 'netral',
          cue: 'Sari tertawa pelan sambil menggaruk tengkuknya, lalu menarik napas panjang.',
        },
      },
      {
        id: 'b', skillId: 'parafrase-ringkasan', next: 's-b13',
        text: 'Jadi yang kamu inginkan sekarang adalah menjalani hari dengan beban lebih ringan.',
        reaction: {
          text: 'Iya, itu. Dan biar nyata, aku mau coba satu hal kecil: minggu ini sekali aja bilang ke grup, "Aku butuh lima belas menit dulu", habis itu kubales lagi.',
          expression: 'netral',
          cue: 'Sari menarik napas panjang, lalu mengangguk sambil mengetuk layar ponselnya.',
        },
      },
      {
        id: 'c', skillId: 'pertanyaan-terbuka', next: 's-b13',
        text: 'Kalau ada satu hal kecil yang bikin harimu lebih ringan, kira-kira apa?',
        reaction: {
          text: 'Hmm, bilang "aku butuh lima belas menit dulu" ke grup, mungkin. Sekali aja minggu ini, terus kubales lagi. Kecil sih, tapi kayaknya berat.',
          expression: 'cemas',
          cue: 'Sari tertawa gugup sambil menggaruk tengkuk, matanya melirik ponsel yang tergeletak di meja.',
        },
      },
      {
        id: 'd', skillId: 'meremehkan', next: 's-b13',
        text: 'Nanti juga ringan sendiri kalau kamu sudah terbiasa.',
        reaction: {
          text: 'Iya, mungkin. Semoga deh, hehe.',
          expression: 'menutup-diri',
          cue: 'Sari mengangguk singkat tanpa menoleh, senyumnya tinggal separuh.',
        },
      },
    ],
  },
];
