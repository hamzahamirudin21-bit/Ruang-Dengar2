/**
 * Kevin Gunawan (mhs-04), adegan Ruang BK bagian pemahaman.
 * Simpul (urutan jalur): ke-b6, ke-b9, ke-b8, ke-b12, ditambah alternatif ke-b9-alt, ke-b8-alt, ke-b12-alt.
 *
 * Titik sambung:
 *  - masuk dari `ke-b5` (bk-eksplorasi) ke `ke-b6`.
 *  - keluar dari `ke-b12` dan `ke-b12-alt` ke `ke-b13` (bk-rencana).
 *  - Ketegangan memakai `ke-tegang-bk` (bk-rencana).
 *
 * Gerbang: `ke-b8` (Momen_Terbuka) butuh trust, level >= 1, dan bendera `isyarat-diperhatikan` (dari ke-l2);
 * `ke-b9` butuh trust; `ke-b12` (inti kebutuhan, kedalaman 2) butuh level >= 2.
 * Bila gagal, alur memakai simpul alternatif yang tetap menuju tulang punggung cerita.
 */
import type { StoryNode } from '../../engine/story/storyTypes';

const SCENE = 'bk';
const TENSION = 'ke-tegang-bk';
const CEMAS = { reflectionNuance: 'tertekan-cemas' } as const;

export const MHS_04_BK_PEMAHAMAN_NODES: StoryNode[] = [
  {
    id: 'ke-b6',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Mereka bilang saya keras. Padahal saya cuma mau kodenya nggak bikin orang begadang gara-gara bug, literally itu.',
      expression: 'kesal',
      cue: 'Kevin mengetuk meja satu kali, lalu menatap tangannya sendiri seolah baru sadar tenaganya.',
    },
    choices: [
      {
        id: 'a', skillId: 'refleksi-perasaan', best: true, options: CEMAS, next: 'ke-b9',
        text: 'Kamu peduli supaya nggak ada yang kena celah kecil, dan itu bikin kamu tegang.',
        reaction: {
          text: 'Tegang, iya. Saya jaga ketat biar nggak ada celah, dan itu bikin saya susah santai. Alasannya ada, tapi nggak gampang diceritain.',
          expression: 'lelah',
          cue: 'Kevin mengangguk pelan, jemarinya menggosok sudut laptop.',
        },
      },
      {
        id: 'b', skillId: 'validasi-normalisasi', next: 'ke-b9',
        text: 'Niatmu masuk akal, walau kedengaran keras buat mereka.',
        reaction: {
          text: 'Keras buat mereka, ya, saya ngerti. Tapi niat saya bukan nyakitin siapa-siapa. Ada asal-usulnya, cuma nggak gampang diceritain.',
          expression: 'lelah',
          cue: 'Kevin mengangguk singkat dan menatap tangannya sendiri.',
        },
      },
      {
        id: 'c', skillId: 'nasihat-dini', next: TENSION,
        text: 'Coba bicara lebih lembut ke tim, biar mereka nggak tersinggung lagi.',
      },
      {
        id: 'd', skillId: 'pertanyaan-tertutup', next: 'ke-b9',
        text: 'Jadi kamu sadar caramu keras, tapi nggak mau mengubahnya?',
        reaction: {
          text: 'Saya mau, tapi belum tahu caranya tanpa menurunkan mutu.',
          expression: 'netral',
          cue: 'Kevin memalingkan pandang sebentar, jarinya menggosok sudut laptop.',
        },
      },
    ],
  },
  {
    id: 'ke-b8',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 2,
    reply: {
      text: 'Minggu lalu Arman bilang, "Lebih takut push kode ke kamu daripada ke dosen." Saya pulang, dan nggak bisa tidur. Saya jadi hal yang ditakuti timnya sendiri.',
      expression: 'tertegun',
      cue: 'Kevin akhirnya melepas lipatan tangannya. Ia menatap lantai, dan bahunya turun pelan.',
    },
    marks: ['momen-terbuka'],
    gate: {
      conditions: [
        { type: 'trust-min', value: 66 }, { type: 'level-min', value: 1 },
        { type: 'flag', flag: 'isyarat-diperhatikan' },
      ],
      otherwise: 'ke-b8-alt',
    },
    onEnter: { setFlags: ['momen-terbuka'] },
    choices: [
      {
        id: 'a', skillId: 'validasi-normalisasi', best: true, next: 'ke-b12',
        text: 'Dengar itu pasti sakit, apalagi niatmu jaga mutu. Wajar kamu susah tidur.',
        reaction: {
          text: 'Sakit, iya. Susah tidur itu bukan lebay, kalimat Arman beneran nempel. Saya cuma pengin timnya nggak takut sama saya lagi.',
          expression: 'lelah',
          cue: 'Kevin mengangguk pelan, bahunya turun dan tangannya terbuka di pangkuan.',
        },
      },
      {
        id: 'b', skillId: 'pertanyaan-terbuka', next: 'ke-b12',
        text: 'Setelah dengar kalimat Arman, apa yang paling terasa di dirimu?',
        reaction: {
          text: 'Yang paling terasa... malu, sama kaget. Saya nggak nyangka bisa kedengaran seseram itu. Saya nggak mau jadi orang yang ditakuti tim.',
          expression: 'tertegun',
          cue: 'Kevin menelan ludah dan menatap lantai agak lama.',
        },
      },
      {
        id: 'c', skillId: 'afirmasi-kekuatan', next: 'ke-b12',
        text: 'Kamu sangat teliti, dan itu kekuatan besar buat tim, Kevin.',
        reaction: {
          text: 'Teliti, iya. Tapi kalau timnya takut, ketelitian itu rasanya nggak ada artinya. Saya nggak mau ditakuti tim.',
          expression: 'lelah',
          cue: 'Kevin tersenyum tipis, lalu senyum itu cepat hilang.',
        },
      },
      {
        id: 'd', skillId: 'interogasi', next: TENSION,
        text: 'Memangnya kamu ngapain sampai Arman takut gitu?',
      },
    ],
  },
  {
    id: 'ke-b8-alt',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Ada sih satu-dua omongan di tim. Nggak penting. Standarnya tetap harus dijaga.',
      expression: 'netral',
      cue: 'Kevin meluruskan posisi laptop di meja, dua kali, hingga sejajar dengan tepi.',
    },
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'ke-b12',
        text: 'Omongan mana yang paling sering terngiang, walau kamu bilang nggak penting?',
        reaction: {
          text: 'Yang sering terngiang soal tim yang jadi sungkan sama saya. Itu aja. Saya nggak mau mereka takut.',
          expression: 'netral',
          cue: 'Kevin berhenti meluruskan laptop dan menatap meja sebentar.',
        },
      },
      {
        id: 'b', skillId: 'validasi-normalisasi', next: 'ke-b12',
        text: 'Nggak apa-apa kalau belum mau bahas. Kita ikut tempomu aja.',
        reaction: {
          text: 'Makasih. Saya belum mau bahas panjang, tapi saya nggak keberatan Dosen tetap di sini. Intinya saya mau tim nggak takut sama saya.',
          expression: 'netral',
          cue: 'Kevin bersandar, lipatan tangannya sedikit mengendur.',
        },
      },
      {
        id: 'c', skillId: 'sampaikan-pengamatan', options: { observationTone: 'faktual' }, next: 'ke-b12',
        text: 'Kulihat kamu dua kali meluruskan laptop. Mungkin ada yang masih mengganjal.',
        reaction: {
          text: 'Itu kebiasaan aja. Tapi mungkin ada yang masih nyangkut soal tim. Belum bisa saya jelasin, intinya saya mau mereka nggak takut.',
          expression: 'netral',
          cue: 'Kevin menahan tangannya di tepi laptop dan melirik Dosen sekilas.',
        },
      },
      {
        id: 'd', skillId: 'meremehkan', next: 'ke-b12',
        text: 'Omongan tim itu sering berlebihan, cuekin aja.',
        reaction: {
          text: 'Ya. Abaikan.',
          expression: 'menutup-diri',
          cue: 'Kevin melipat tangan kembali dan menatap lurus ke dinding.',
        },
      },
    ],
  },
  {
    id: 'ke-b9',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Waktu magang dulu, satu variabel yang tak diinisialisasi bikin alat uji berhenti di tengah demo. Sejak itu saya nggak mau lengah. Tapi sekarang timnya menghindar kalau saya lewat, jujurly nggak enak.',
      expression: 'lelah',
      cue: 'Kevin tersenyum miring saat bilang demo, lalu senyumnya padam ketika menyebut tim menghindar.',
    },
    gate: { conditions: [{ type: 'trust-min', value: 60 }], otherwise: 'ke-b9-alt' },
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'ke-b8',
        text: 'Waktu alat berhenti saat demo itu, bagian mana yang paling membekas?',
        reaction: {
          text: 'Yang paling membekas itu rasa nggak boleh lengah lagi. Sejak itu saya jaga ketat. Ada satu omongan di tim yang masih kepikiran.',
          expression: 'lelah',
          cue: 'Kevin menatap lurus ke meja, rahangnya mengeras sebentar.',
        },
      },
      {
        id: 'b', skillId: 'refleksi-perasaan', options: CEMAS, next: 'ke-b8',
        text: 'Gagal waktu demo bikin kamu takut lengah, dan kini jarak dengan tim ikut terasa.',
        reaction: {
          text: 'Takut lengah, iya. Soal jarak dengan tim, kerasa, jujurly nggak enak. Ada satu omongan di tim yang masih nyangkut.',
          expression: 'lelah',
          cue: 'Kevin mengangguk dan pandangannya jatuh ke lantai.',
        },
      },
      {
        id: 'c', skillId: 'pertanyaan-tertutup', next: 'ke-b8',
        text: 'Jadi gagal waktu demo itu yang bikin kamu keras ke tim, ya?',
        reaction: {
          text: 'Nggak sebesar itu. Tapi ya, ada pengaruhnya.',
          expression: 'waspada',
          cue: 'Kevin mengetuk-ngetuk meja pelan sambil menghindari tatapan.',
        },
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: TENSION,
        text: 'Kalau gitu percaya aja sama temanmu mulai sekarang. Lepasin kendalinya.',
      },
    ],
  },
  {
    id: 'ke-b9-alt',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Ya, saya memang perfeksionis soal kode. Itu aja. Nggak ada cerita khusus.',
      expression: 'netral',
      cue: 'Kevin mengangkat dagu sedikit, nadanya memotong pembicaraan.',
    },
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'ke-b8',
        text: 'Kalau lihat kode yang nggak rapi, bagian mana yang paling mengganggumu?',
        reaction: {
          text: 'Yang paling ganggu variabel nggak diinisialisasi dan nama fungsi asal-asalan. Hal kecil, tapi nggak bisa saya biarin. Ada omongan di tim soal itu.',
          expression: 'kesal',
          cue: 'Kevin mengangkat dagu, jarinya menunjuk udara seolah menandai baris kode.',
        },
      },
      {
        id: 'b', skillId: 'parafrase-ringkasan', next: 'ke-b8',
        text: 'Jadi kamu jaga kerapian kode dengan ketat, dan menurutmu itu sudah cukup.',
        reaction: {
          text: 'Ya, buat saya cukup. Kerapian itu kewajiban, bukan pilihan. Cuma, ada omongan di tim soal itu.',
          expression: 'netral',
          cue: 'Kevin mengangguk tegas dan merapikan posisi laptop.',
        },
      },
      {
        id: 'c', skillId: 'validasi-normalisasi', next: 'ke-b8',
        text: 'Pengin kode yang rapi itu wajar banget buat pemrogram yang serius.',
        reaction: {
          text: 'Nah, itu. Akhirnya ada yang ngerti. Kerapian kode memang soal serius, walau di tim ada omongan soal itu.',
          expression: 'netral',
          cue: 'Kevin mengangguk, ekspresinya sedikit melunak.',
        },
      },
      {
        id: 'd', skillId: 'pertanyaan-tertutup', next: 'ke-b8',
        text: 'Jadi nggak ada hal lain yang mengganggumu?',
        reaction: {
          text: 'Tidak ada.',
          expression: 'menutup-diri',
          cue: 'Kevin menjawab pendek dan melirik jam di dinding.',
        },
      },
    ],
  },
  {
    id: 'ke-b12',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 2,
    reply: {
      text: 'Saya cuma mau standar itu dibaca sebagai peduli, bukan serangan. Dan saya mau didengar tanpa harus jadi orang paling galak di ruangan, valid sih.',
      expression: 'lega',
      cue: 'Suara Kevin turun dan melambat. Tangannya terbuka di atas lutut, tidak lagi terkepal.',
    },
    gate: { conditions: [{ type: 'level-min', value: 2 }], otherwise: 'ke-b12-alt' },
    choices: [
      {
        id: 'a', skillId: 'parafrase-ringkasan', best: true, next: 'ke-b13',
        text: 'Jadi standarmu mau dibaca sebagai peduli, dan kamu mau didengar tanpa dicap galak?',
        reaction: {
          text: 'Iya, itu yang saya maksud, peduli bukan galak. Mungkin saya ubah urutan review: satu hal bagus dulu, baru komentar merah. Yang berat saya bicarakan langsung.',
          expression: 'lega',
          cue: 'Kevin mengangguk, tangannya terbuka di atas lutut.',
        },
      },
      {
        id: 'b', skillId: 'refleksi-perasaan', options: CEMAS, next: 'ke-b13',
        text: 'Kamu khawatir niat baikmu salah dibaca, dan kamu ingin lebih dipahami.',
        reaction: {
          text: 'Iya, saya khawatir niat baik malah dibaca salah. Mungkin saya ubah urutan review: satu hal bagus dulu, baru komentar merah, dan yang berat bicara langsung.',
          expression: 'netral',
          cue: 'Kevin menarik napas dalam dan suaranya melambat.',
        },
      },
      {
        id: 'c', skillId: 'afirmasi-kekuatan', next: 'ke-b13',
        text: 'Kamu bisa menyebut kebutuhanmu dengan jernih. Itu nggak gampang buat banyak orang.',
        reaction: {
          text: 'Nggak gampang? Mungkin. Tapi kalau udah bisa nyebut, saya bisa mulai: ubah urutan review, satu hal bagus dulu baru komentar merah, yang berat bicara langsung.',
          expression: 'netral',
          cue: 'Kevin menegakkan duduk, nadanya lebih mantap dari sebelumnya.',
        },
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: TENSION,
        text: 'Kalau gitu, mulai sekarang kurangin aja komentar merahmu ke tim.',
      },
    ],
  },
  {
    id: 'ke-b12-alt',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Intinya saya mau tim berhenti takut sama saya. Cuma itu, saya belum bisa jelasin lebih jauh.',
      expression: 'netral',
      cue: 'Kevin menarik napas panjang dan menatap ke satu titik di dinding.',
    },
    choices: [
      {
        id: 'a', skillId: 'validasi-normalisasi', best: true, next: 'ke-b13',
        text: 'Pengin dekat sama tim itu wajar. Nggak perlu dijelasin semua hari ini.',
        reaction: {
          text: 'Makasih, nggak harus semuanya hari ini. Mungkin saya ubah urutan review: satu hal bagus dulu, baru komentar merah. Yang berat saya bicarakan langsung.',
          expression: 'netral',
          cue: 'Kevin menghembuskan napas dan bahunya turun.',
        },
      },
      {
        id: 'b', skillId: 'parafrase-ringkasan', next: 'ke-b13',
        text: 'Jadi yang paling kamu mau sekarang, tim yang nggak takut lagi sama kamu.',
        reaction: {
          text: 'Iya, tim yang nggak takut lagi. Mungkin saya ubah urutan review: satu hal bagus dulu, baru komentar merah, dan yang berat bicara langsung.',
          expression: 'netral',
          cue: 'Kevin mengangguk, matanya tertuju ke satu titik di meja.',
        },
      },
      {
        id: 'c', skillId: 'pertanyaan-terbuka', next: 'ke-b13',
        text: 'Kalau ada satu hal kecil yang mengurangi rasa takut mereka, kira-kira apa?',
        reaction: {
          text: 'Satu hal kecil? Mungkin urutan review: tulis dulu satu hal yang sudah bagus, baru komentar merah. Yang berat saya omongin langsung.',
          expression: 'netral',
          cue: 'Kevin mengetuk meja pelan sambil berpikir, lalu mengangguk.',
        },
      },
      {
        id: 'd', skillId: 'meremehkan', next: 'ke-b13',
        text: 'Nanti juga mereka terbiasa sama gayamu.',
        reaction: {
          text: 'Semoga.',
          expression: 'menutup-diri',
          cue: 'Kevin mengangguk singkat, matanya sudah kembali ke layar laptop.',
        },
      },
    ],
  },
];
