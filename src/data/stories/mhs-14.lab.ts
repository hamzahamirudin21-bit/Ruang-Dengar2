/**
 * Adegan Lab untuk Rani Safitri (mhs-14): pembukaan baku, kejutan teman berterima kasih,
 * isyarat nonverbal, ajakan ke Ruang Konsultasi, serta Ketegangan `menarik-diri` dan hub perbaikan.
 * Dirakit menjadi STORY_MHS_14 di ./mhs-14.ts (tugas 12.6).
 */
import type { StoryLine, StoryNode } from '../../engine/story/storyTypes';
import { buildOpeningNode } from '../storyStages';

const STUDENT_ID = 'mhs-14';
const SCENE = 'lab';

/** Selingan kejutan di r-l2; dipakai ulang bila reaksi pilihan menggantikan balasan simpul. */
const FRIEND_ASIDE =
  'Seorang teman lewat di samping meja. "Ran, skema punyamu kemarin kepakai di kelompok kami. Makasih ya!"';

const KEJUTAN_LINE: StoryLine = {
  text: 'Eh... itu... cuma catatan biasa kok, sumpah.',
  expression: 'terkejut',
  cue: 'Pipinya memerah dan ia cepat menutup bukunya.',
  aside: FRIEND_ASIDE,
};

export const RANI_LAB_NODES: StoryNode[] = [
  // 1. Pembukaan baku
  buildOpeningNode({
    id: 'r-buka',
    studentId: STUDENT_ID,
    sceneId: SCENE,
    name: 'Rani',
    reply: {
      text: 'Eh... selamat siang. Aku lagi nyatet skema aja kok.',
      expression: 'waspada',
      cue: 'Rani menutup buku catatannya setengah ketika melihat Dosen mendekat; ujung pulpennya masih menempel di kertas.',
    },
    best: 'sapaan-hangat',
    next: {
      'sapaan-hangat': 'r-l2',
      'pertanyaan-terbuka': 'r-l2',
      'pertanyaan-tertutup': 'r-l2',
      'nasihat-dini': 'r-tegang-lab',
    },
    reactions: {
      'sapaan-hangat': {
        text: 'Baik kok, Dosen. Biasa aja. Eh, itu... cuma catatan kok, sumpah, bukan apa-apa.',
        expression: 'terkejut',
        cue: 'Pipi Rani memerah dan ia cepat-cepat menutup bukunya.',
        aside: 'Seorang teman lewat di samping meja dan melambai. "Ran, skemamu kemarin kepakai di kelompok kami. Makasih banget ya!"',
      },
      'pertanyaan-terbuka': {
        text: 'Hmm... pikiranku? Paling soal rangkaian ini. Aku masih belajar dari dasar.',
        expression: 'waspada',
        cue: 'Rani menjawab singkat sambil memutar pulpen di sela jarinya.',
      },
      'pertanyaan-tertutup': {
        text: 'Iya. Baik-baik aja.',
        expression: 'menutup-diri',
        cue: 'Rani mengangguk singkat tanpa mengangkat pandangan dari buku.',
      },
    },
  }),

  // 2. Kejutan kecil: teman berterima kasih; isyarat nonverbal
  {
    id: 'r-l2',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: KEJUTAN_LINE,
    marks: ['kejutan', 'isyarat-nonverbal'],
    choices: [
      {
        id: 'pengamatan-faktual',
        skillId: 'sampaikan-pengamatan',
        text: 'Tadi temanmu bilang makasih, dan kamu langsung menutup bukumu ya.',
        reaction: {
          text: 'Eh, ketahuan ya... Iya, Dosen, refleks aja. Kayaknya enggak enak dilihat banyak orang, apalagi di sini rame. Jadi aku agak canggung.',
          expression: 'cemas',
          cue: 'Rani mengangguk kecil, lalu pandangannya berpindah ke dua temannya di meja seberang dan suaranya merendah.',
        },
        options: { observationTone: 'faktual' },
        next: 'r-l3',
        setFlags: ['isyarat-diperhatikan'],
        best: true,
      },
      {
        id: 'afirmasi',
        skillId: 'afirmasi-kekuatan',
        text: 'Skemamu dipakai kelompok lain lho. Berarti catatanmu berguna banget, Rani.',
        reaction: {
          text: 'Hah, beneran dipakai? Ehm... syukurlah kalau berguna, Dosen. Tapi jujurly aku masih canggung kalau dibahas di sini. Rame banget, banyak anak-anak.',
          expression: 'menunduk',
          cue: 'Pipi Rani memerah, lalu ia melirik dua temannya di meja seberang dan suaranya merendah.',
        },
        next: 'r-l3',
      },
      {
        id: 'tertutup',
        skillId: 'pertanyaan-tertutup',
        text: 'Itu skemamu, kan? Kamu memang nggak mau dilihat orang?',
        reaction: {
          text: 'Iya itu skemaku... Bukan enggak mau dilihat sih, Dosen. Cuma kalau lagi rame gini aku jadi enggak nyaman, sumpah.',
          expression: 'cemas',
          cue: 'Rani menggeser buku catatannya ke pangkuan, lalu melirik dua temannya di meja seberang dengan suara yang merendah.',
        },
        next: 'r-l3',
      },
      {
        id: 'pengamatan-menilai',
        skillId: 'sampaikan-pengamatan',
        text: 'Kamu kelihatan malu banget, kayak enggak percaya diri.',
        options: { observationTone: 'menilai' },
        next: 'r-tegang-lab',
        reaction: {
          text: 'Aku cuma lagi fokus kok.',
          expression: 'menutup-diri',
          cue: 'Rani menegakkan bahu dan menatap meja; suaranya mendatar.',
        },
      },
    ],
  },

  // 3. Ajakan ke Ruang Konsultasi
  {
    id: 'r-l3',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Di sini rame ya... jujurly aku agak enggak enak ngobrol di depan anak-anak.',
      expression: 'cemas',
      cue: 'Pandangan Rani berpindah ke dua temannya di meja seberang; suaranya merendah.',
    },
    choices: [
      {
        id: 'ajak-ruang-bk',
        skillId: 'validasi-normalisasi',
        text: 'Wajar kok kurang nyaman. Mau pindah ke Ruang Konsultasi, berdua aja?',
        next: 'r-l3-tolak',
        routes: [{ when: [{ type: 'trust-min', value: 29 }], next: 'r-b0' }],
        best: true,
      },
      {
        id: 'privasi',
        skillId: 'batas-kerahasiaan',
        text: 'Obrolan kita cuma antara kita berdua, kecuali menyangkut keselamatanmu.',
        reaction: {
          text: 'Beneran cuma antara kita ya, Dosen? Oke... jadi agak tenang. Kalau tempatnya lebih sepi, kayaknya aku mau coba.',
          expression: 'netral',
          cue: 'Rani menarik napas pendek, bahunya turun sedikit, dan genggamannya pada pulpen mengendur.',
        },
        next: 'r-l3b',
        setFlags: ['privasi-dijelaskan'],
      },
      {
        id: 'janji-mutlak',
        skillId: 'janji-mutlak',
        text: 'Tenang, di ruang BK pasti aman, semua rahasia 100% terjamin.',
        next: 'r-l3b',
        reaction: {
          text: 'Beneran... seratus persen? Hmm, aku pikir-pikir dulu ya.',
          expression: 'cemas',
          cue: 'Rani mengerutkan dahi dan menarik buku catatannya lebih dekat.',
        },
      },
      {
        id: 'terbuka',
        skillId: 'pertanyaan-terbuka',
        text: 'Apa yang membuatmu kurang nyaman kalau ngobrol di sini?',
        reaction: {
          text: 'Hmm... pas anak-anak lewat, aku jadi mikir mereka dengerin. Susah fokus ngomongnya. Kalau agak sepi, kayaknya bisa lebih tenang.',
          expression: 'netral',
          cue: 'Rani menghela napas pendek sambil melirik ke arah meja seberang, dan bahunya turun sedikit.',
        },
        next: 'r-l3b',
      },
    ],
  },

  // Penolakan halus karena kepercayaan belum cukup
  {
    id: 'r-l3-tolak',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Hmm... nanti aja deh. Aku belum terlalu... ya, di sini juga enggak apa-apa.',
      expression: 'menunduk',
      cue: 'Rani merapikan pulpen yang sebenarnya sudah rapi, lalu menggeleng pelan.',
    },
    choices: [
      {
        id: 'privasi',
        skillId: 'batas-kerahasiaan',
        text: 'Boleh aku jelasin dulu? Ceritamu cuma antara kita, boleh berhenti kapan aja.',
        reaction: {
          text: 'Boleh berhenti kapan aja? ...Oke, itu bikin agak lega, Dosen. Kalau tempatnya sepi, kayaknya aku bisa coba.',
          expression: 'netral',
          cue: 'Rani menghela napas pendek dan bahunya turun sedikit.',
        },
        next: 'r-l3b',
        setFlags: ['privasi-dijelaskan'],
        best: true,
      },
      {
        id: 'validasi',
        skillId: 'validasi-normalisasi',
        text: 'Nggak apa-apa kalau belum siap. Kita tetap di sini, santai aja.',
        reaction: {
          text: 'Makasih, Dosen... aku jadi enggak ngerasa dipaksa. Ya udah, kalau agak sepi kayaknya aku mau coba, sebentar aja.',
          expression: 'netral',
          cue: 'Rani mengembuskan napas pelan dan bahunya turun, lalu ia mengangguk kecil.',
        },
        next: 'r-l3b',
      },
      {
        id: 'terbuka',
        skillId: 'pertanyaan-terbuka',
        text: 'Boleh aku tahu, apa yang membuat pindah tempat terasa berat?',
        reaction: {
          text: 'Berat karena... aku enggak enak keluar bareng Dosen, takut dilihat anak-anak. Tapi kalau pelan-pelan dan tempatnya sepi, mungkin aku bisa.',
          expression: 'menunduk',
          cue: 'Rani menunduk sebentar, lalu menghela napas pendek dan bahunya turun sedikit.',
        },
        next: 'r-l3b',
      },
      {
        id: 'nasihat',
        skillId: 'nasihat-dini',
        text: 'Kamu harus berani keluar dari zona nyaman, Rani. Ayo ikut aku saja.',
        next: 'r-tegang-lab',
      },
    ],
  },

  // Lebih tenang setelah privasi dijelaskan
  {
    id: 'r-l3b',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Hmm... iya sih. Kalau tempatnya lebih sepi, mungkin aku bisa lebih tenang.',
      expression: 'netral',
      cue: 'Rani menghela napas pendek dan bahunya turun sedikit.',
    },
    choices: [
      {
        id: 'ajak-ruang-bk',
        skillId: 'validasi-normalisasi',
        text: 'Makasih sudah mau mempertimbangkan. Kita jalan pelan-pelan ke Ruang Konsultasi?',
        reaction: {
          text: 'Iya, yuk, pelan-pelan aja ya, Dosen. Wah, jadi ini ruangannya... sepi banget. Aku bawa buku ini aja biar ada yang dipegang.',
          expression: 'waspada',
          cue: 'Rani duduk di ujung kursi, tangannya menahan sampul buku catatan di pangkuan, dan matanya menyapu sudut-sudut ruangan.',
        },
        next: 'r-b0',
        best: true,
      },
      {
        id: 'sapaan',
        skillId: 'sapaan-hangat',
        text: 'Kalau nyaman, kita pindah ke Ruang Konsultasi. Aku temani jalan, ya.',
        reaction: {
          text: 'Makasih udah nemenin jalan, Dosen. Ini ruangannya ya. Sepi... enggak apa-apa sih, cuma belum terbiasa. Bukuku kubawa terus biar ada yang dipegang.',
          expression: 'waspada',
          cue: 'Rani mengambil kursi paling pinggir, tangannya menahan sampul buku catatan di pangkuan, dan matanya menyapu ruangan.',
        },
        next: 'r-b0',
      },
      {
        id: 'tertutup',
        skillId: 'pertanyaan-tertutup',
        text: 'Jadi ikut ke ruang BK atau tidak? Iya atau tidak saja.',
        next: 'r-l3b',
        reaction: {
          text: 'Eh... iya atau tidak ya... aku bingung jawabnya.',
          expression: 'cemas',
          cue: 'Rani menggigit bibir dan menunduk ke arah bukunya.',
        },
      },
      {
        id: 'nasihat',
        skillId: 'nasihat-dini',
        text: 'Sudahlah, ikut saja. Ini demi kebaikanmu sendiri.',
        next: 'r-tegang-lab',
      },
    ],
  },

  // Ketegangan fase awal: Rani menarik diri
  {
    id: 'r-tegang-lab',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Oh... iya. Maaf. Aku balik kerja dulu.',
      expression: 'menutup-diri',
      cue: 'Rani menggeser kursinya sedikit menjauh dan membuka bukunya kembali tanpa menatap Dosen.',
    },
    tension: { phase: 'awal', expectedKind: 'menarik-diri' },
    choices: [
      {
        id: 'akui',
        skillId: 'sampaikan-pengamatan',
        text: 'Kalimatku tadi mungkin membuatmu kurang nyaman. Aku ingin dengar dari sisimu.',
        options: { observationTone: 'faktual' },
        action: { kind: 'akui-ketegangan' },
        next: 'r-perbaikan-lab',
        best: true,
      },
      {
        id: 'abaikan-validasi',
        skillId: 'validasi-normalisasi',
        text: 'Nggak apa-apa. Lanjutin aja catatanmu, aku di sini kok.',
        next: 'r-tegang-lab',
        reaction: {
          text: 'Iya... makasih.',
          expression: 'menutup-diri',
          cue: 'Rani menunduk ke bukunya; bahunya terlihat kaku.',
        },
      },
      {
        id: 'abaikan-jeda',
        skillId: 'jeda-hening',
        text: 'Oke, aku tunggu sebentar di sini ya.',
        next: 'r-tegang-lab',
        reaction: {
          text: 'Em... iya.',
          expression: 'menutup-diri',
          cue: 'Rani menulis sesuatu tanpa benar-benar membaca apa yang ia tulis.',
        },
      },
      {
        id: 'nasihat',
        skillId: 'nasihat-dini',
        text: 'Jangan begitu, Rani. Coba lebih terbuka, nanti juga terbiasa.',
        next: 'r-tegang-lab',
        reaction: {
          text: 'Iya... nanti aku coba.',
          expression: 'menutup-diri',
          cue: 'Suara Rani nyaris tak terdengar dan matanya tidak lepas dari meja.',
        },
      },
    ],
  },

  // Ketegangan fase perbaikan: hub tiga langkah + satu opsi keliru
  {
    id: 'r-perbaikan-lab',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Aku... kaget aja tadi. Rasanya kayak ketahuan salah, jujurly.',
      expression: 'menunduk',
      cue: 'Rani memandangi ujung meja dan menarik buku lebih dekat ke dadanya.',
    },
    tension: { phase: 'perbaikan' },
    choices: [
      {
        id: 'akui-dampak',
        skillId: 'validasi-normalisasi',
        text: 'Aku sadar caraku tadi menekan. Maaf ya, bukan maksudku begitu.',
        action: { kind: 'perbaikan', step: 'akui-dampak' },
        next: 'r-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Iya... agak canggung tadi.',
          expression: 'netral',
          cue: 'Rani menarik napas pelan dan melonggarkan genggamannya pada buku.',
        },
        best: true,
      },
      {
        id: 'eksplorasi-perasaan',
        skillId: 'pertanyaan-terbuka',
        text: 'Boleh aku tahu, bagian mana tadi yang paling nggak enak buatmu?',
        action: { kind: 'perbaikan', step: 'eksplorasi-perasaan' },
        next: 'r-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Pas dibilang begitu, rasanya aku salah. Aku enggak mau salah di depan orang.',
          expression: 'cemas',
          cue: 'Suara Rani bergetar sedikit, tetapi ia tetap menatap Dosen.',
        },
      },
      {
        id: 'beri-pilihan',
        skillId: 'jeda-hening',
        text: 'Bisa lanjut pelan, ganti topik, atau cukup. Kamu yang pilih ya.',
        action: { kind: 'perbaikan', step: 'beri-pilihan' },
        next: 'r-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Lanjut pelan-pelan aja... kalau boleh.',
          expression: 'lega',
          cue: 'Bahu Rani turun dan ia membuka buku catatannya kembali, kali ini tanpa menutupinya.',
        },
      },
      {
        id: 'remehkan',
        skillId: 'meremehkan',
        text: 'Ah, itu bukan masalah besar kok. Jangan dibawa perasaan.',
        next: 'r-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Oh... iya. Mungkin aku yang berlebihan.',
          expression: 'menutup-diri',
          cue: 'Rani menutup bukunya rapat dan menyilangkan tangan di atasnya.',
        },
      },
    ],
  },
];
