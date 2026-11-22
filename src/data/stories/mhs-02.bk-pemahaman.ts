/**
 * Dimas Aditya (mhs-02), adegan Ruang BK bagian pemahaman.
 * Simpul (urutan jalur): di-b6, di-b9, di-b8, di-b12, ditambah alternatif di-b9-alt, di-b8-alt, di-b12-alt.
 *
 * Titik sambung:
 *  - masuk dari `di-b5` (bk-eksplorasi) ke `di-b6`.
 *  - keluar dari `di-b12` dan `di-b12-alt` ke `di-b13` (bk-rencana).
 *  - Ketegangan memakai `di-tegang-bk` (bk-rencana).
 *
 * Gerbang: `di-b8` (Momen_Terbuka) butuh trust, level >= 1, bendera `batas-dijelaskan` (di-b0) dan
 * `jeda-diberi` (di-b2); `di-b9` butuh trust; `di-b12` (inti kebutuhan, kedalaman 2) butuh level >= 1.
 * Bila gagal, alur memakai simpul alternatif yang tetap menuju tulang punggung cerita.
 */
import type { StoryNode } from '../../engine/story/storyTypes';

const SCENE = 'bk';
const TENSION = 'di-tegang-bk';
const LELAH = { reflectionNuance: 'lelah-kewalahan' } as const;

/** Ambang kepercayaan gerbang (jalur terbaik memberi margin >= 4). */
export const DIMAS_B9_TRUST_MIN = 53;
export const DIMAS_B8_TRUST_MIN = 57;

export const MHS_02_BK_PEMAHAMAN_NODES: StoryNode[] = [
  {
    id: 'di-b6',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Kalau ketahuan aku kesulitan soal uang, orang bakal lihat aku beda. Aku nggak mau dikasihani.',
      expression: 'kesal',
      cue: 'Rahang Dimas mengeras sebentar; pandangannya naik ke langit-langit, menghindari mata Dosen.',
    },
    choices: [
      {
        id: 'a', skillId: 'refleksi-perasaan', best: true, options: LELAH, next: 'di-b9',
        text: 'Kamu lelah menanggung ini, dan takut dilihat lemah kalau orang tahu.',
        reaction: { text: 'Ya, kira-kira begitu.', expression: 'menunduk', cue: 'Dimas mengangguk singkat dan menunduk.' },
      },
      {
        id: 'b', skillId: 'validasi-normalisasi', next: 'di-b9',
        text: 'Tidak ingin dikasihani itu bisa dimengerti. Harga dirimu penting.',
        reaction: { text: 'Iya, itu. Makasih nggak nganggap aku lebay.', expression: 'lega', cue: 'Dimas menghembuskan napas pendek.' },
      },
      {
        id: 'c', skillId: 'nasihat-dini', next: TENSION,
        text: 'Cari saja kerja sambilan atau minta keringanan ke kampus, selesai.',
      },
      {
        id: 'd', skillId: 'pertanyaan-tertutup', next: 'di-b9',
        text: 'Jadi kamu memang tidak mau dibantu siapa pun?',
        reaction: {
          text: 'Bukan gitu... tapi ya, hampir.',
          expression: 'waspada',
          cue: 'Dimas melirik pintu sekilas, lalu menatap lututnya.',
        },
      },
    ],
  },
  {
    id: 'di-b9',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Nyolder SMD itu satu-satunya waktu kepalaku diam. Tapi gara-gara target, tanganku buru-buru dan hasilnya sering diulang.',
      expression: 'lelah',
      cue: 'Untuk pertama kalinya Dimas menatap Dosen; senyum tipisnya muncul saat menyebut nyolder, lalu hilang.',
    },
    gate: { conditions: [{ type: 'trust-min', value: DIMAS_B9_TRUST_MIN }], otherwise: 'di-b9-alt' },
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'di-b8',
        text: 'Saat kepalamu diam waktu menyolder, apa yang terasa berbeda?',
        reaction: { text: 'Bedanya? Tanganku nggak gemetar, kepalaku diem. Ya itu.', expression: 'netral', cue: 'Dimas melihat ujung jarinya sendiri.' },
      },
      {
        id: 'b', skillId: 'refleksi-perasaan', options: LELAH, next: 'di-b8',
        text: 'Menyolder memberimu ruang tenang, tetapi tenggat membuatmu terburu-buru.',
        reaction: { text: 'Iya, begitu. Tenang dulu, terus kepotong tenggat.', expression: 'lelah', cue: 'Dimas mengusap mata sambil mengangguk.' },
      },
      {
        id: 'c', skillId: 'pertanyaan-tertutup', next: 'di-b8',
        text: 'Jadi masalahmu cuma target praktikum, ya?',
        reaction: {
          text: 'Ya. Itu aja kok.',
          expression: 'menutup-diri',
          cue: 'Dimas memutar posisi duduk dan menyilangkan kaki.',
        },
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: TENSION,
        text: 'Pelan-pelan saja nyolder-nya, jangan ikut tenggat. Kualitas lebih penting.',
      },
    ],
  },
  {
    id: 'di-b8',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 2,
    reply: {
      text: 'Sebenarnya sudah dua minggu aku makan sekali sehari. Uang kos kemarin telat. Ibu kos belum marah, tapi aku takut ditagih lagi di depan orang.',
      expression: 'tertegun',
      cue: 'Dimas mengeluarkan ponsel dari saku, membuka catatan pengeluaran, lalu menyodorkannya dengan tangan yang tidak sepenuhnya mantap.',
    },
    marks: ['momen-terbuka'],
    gate: {
      conditions: [
        { type: 'trust-min', value: DIMAS_B8_TRUST_MIN },
        { type: 'level-min', value: 1 },
        { type: 'flag', flag: 'batas-dijelaskan' },
        { type: 'flag', flag: 'jeda-diberi' },
      ],
      otherwise: 'di-b8-alt',
    },
    onEnter: { setFlags: ['momen-terbuka'] },
    choices: [
      {
        id: 'a', skillId: 'afirmasi-kekuatan', best: true, next: 'di-b12',
        text: 'Kamu berani memperlihatkan catatan ini. Itu bukan tanda lemah, Dimas.',
        reaction: { text: 'Berani? Kayaknya cuma kepepet. Tapi makasih.', expression: 'menunduk', cue: 'Dimas melipat catatannya dan menyimpannya lagi.' },
      },
      {
        id: 'b', skillId: 'pertanyaan-terbuka', next: 'di-b12',
        text: 'Dari catatan ini, bagian mana yang paling menekanmu sekarang?',
        reaction: { text: 'Yang paling nekan? Hitungan uangnya, tiap hari.', expression: 'lelah', cue: 'Dimas menatap catatan itu tanpa mengangkat kepala.' },
      },
      {
        id: 'c', skillId: 'refleksi-perasaan', options: LELAH, next: 'di-b12',
        text: 'Kamu sudah lama menanggung ini sendirian, dan tenagamu mulai terkuras.',
        reaction: { text: 'Iya, lama. Tenagaku emang tinggal sisa.', expression: 'lelah', cue: 'Dimas menyandarkan kepala ke dinding.' },
      },
      {
        id: 'd', skillId: 'interogasi', next: TENSION,
        text: 'Kenapa tidak bilang dari awal? Uangmu habis dipakai apa saja?',
      },
    ],
  },
  {
    id: 'di-b8-alt',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Nggak ada yang gawat sih. Aku cuma lagi ngitung, kapan bisa tidur cukup.',
      expression: 'netral',
      cue: 'Dimas menyelipkan ponselnya kembali ke saku dan menepuk-nepuknya dua kali.',
    },
    choices: [
      {
        id: 'a', skillId: 'validasi-normalisasi', best: true, next: 'di-b12',
        text: 'Kurang tidur karena banyak hitungan itu melelahkan. Wajar kalau kamu ingin istirahat.',
        reaction: { text: 'Iya, tidur cukup aja udah mewah.', expression: 'lelah', cue: 'Dimas mengucek mata dan menguap tertahan.' },
      },
      {
        id: 'b', skillId: 'pertanyaan-terbuka', next: 'di-b12',
        text: 'Yang kamu hitung itu seperti apa, kalau boleh tahu?',
        reaction: { text: 'Hitungan? Ya jadwal sama tugas. Detailnya belum bisa kujelasin.', expression: 'netral', cue: 'Dimas mengalihkan pandangan ke jendela.' },
      },
      {
        id: 'c', skillId: 'parafrase-ringkasan', next: 'di-b12',
        text: 'Jadi saat ini yang paling kamu inginkan adalah bisa tidur dengan cukup.',
        reaction: { text: 'Iya, itu intinya. Bisa tidur cukup.', expression: 'netral', cue: 'Dimas mengangguk satu kali.' },
      },
      {
        id: 'd', skillId: 'meremehkan', next: 'di-b12',
        text: 'Semua mahasiswa kurang tidur kok. Nanti juga terbiasa.',
        reaction: {
          text: 'Iya, mungkin. Udah, nggak usah dibahas.',
          expression: 'menutup-diri',
          cue: 'Dimas memalingkan badan ke arah jendela dan menggenggam ponselnya erat di saku.',
        },
      },
    ],
  },
  {
    id: 'di-b9-alt',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Ya begitulah, lagi sibuk. Selebihnya biasa aja kok.',
      expression: 'netral',
      cue: 'Dimas mengangkat bahu kecil, seolah ingin menutup topik itu.',
    },
    choices: [
      {
        id: 'a', skillId: 'parafrase-ringkasan', best: true, next: 'di-b8',
        text: 'Jadi minggu ini penuh, tetapi kamu merasa masih bisa mengendalikannya. Tepat begitu?',
        reaction: { text: 'Iya, penuh. Tapi masih bisa kukendalikan, kok.', expression: 'netral', cue: 'Dimas mengangguk sambil memutar solder di tangannya.' },
      },
      {
        id: 'b', skillId: 'pertanyaan-terbuka', next: 'di-b8',
        text: 'Dari semua kesibukan itu, mana yang paling menyita tenagamu?',
        reaction: { text: 'Yang paling nyita? Praktikum. Itu aja.', expression: 'netral', cue: 'Dimas menjawab cepat dan menunduk.' },
      },
      {
        id: 'c', skillId: 'validasi-normalisasi', next: 'di-b8',
        text: 'Sibuk sampai tidak sempat memikirkan diri sendiri itu hal yang wajar.',
        reaction: { text: 'Wajar ya? Oke. Makasih.', expression: 'netral', cue: 'Dimas mengangguk singkat, tak berkata lebih.' },
      },
      {
        id: 'd', skillId: 'pertanyaan-tertutup', next: 'di-b8',
        text: 'Jadi cuma sibuk saja, tidak ada yang lain?',
        reaction: {
          text: 'Iya, cuma sibuk.',
          expression: 'menutup-diri',
          cue: 'Dimas menjawab tanpa menatap, jarinya mengetuk-ngetuk lengan kursi.',
        },
      },
    ],
  },
  {
    id: 'di-b12',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 2,
    reply: {
      text: 'Aku cuma butuh tahu ada jalan resmi buat bantuan biaya, tanpa semua orang tahu. Dan tanpa dilihat kayak kasus.',
      expression: 'lega',
      cue: 'Suara Dimas rendah tetapi mantap. Telapaknya akhirnya lepas dari saku, dan ia bersandar sedikit.',
    },
    gate: { conditions: [{ type: 'level-min', value: 1 }], otherwise: 'di-b12-alt' },
    choices: [
      {
        id: 'a', skillId: 'parafrase-ringkasan', best: true, next: 'di-b13',
        text: 'Jadi kamu butuh jalur bantuan biaya yang resmi, rahasia, dan tanpa dikasihani. Tepat?',
        reaction: { text: 'Iya, itu. Resmi, rahasia, nggak dikasihani. Kamu nangkep.', expression: 'lega', cue: 'Dimas mengangkat wajah sedikit dan mengangguk.' },
      },
      {
        id: 'b', skillId: 'afirmasi-kekuatan', next: 'di-b13',
        text: 'Kamu tahu persis yang kamu butuhkan, dan itu bukan hal kecil.',
        reaction: { text: 'Bukan hal kecil? Baru dengar ada yang bilang gitu.', expression: 'tertegun', cue: 'Dimas terdiam sebentar, lalu menunduk.' },
      },
      {
        id: 'c', skillId: 'refleksi-perasaan', options: LELAH, next: 'di-b13',
        text: 'Ada keinginan mendapat bantuan tanpa harus menanggung rasa malu lagi.',
        reaction: { text: 'Malu itu iya, bagian yang bikin males cerita.', expression: 'menunduk', cue: 'Dimas mengusap lutut dengan telapak tangannya.' },
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: TENSION,
        text: 'Kalau begitu, berhenti gengsi dan langsung datangi bagian keuangan.',
      },
    ],
  },
  {
    id: 'di-b12-alt',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Intinya aku mau ada napas lebih longgar. Soal detailnya belum bisa kuceritakan.',
      expression: 'netral',
      cue: 'Dimas menghela napas panjang dan memandangi ujung sepatunya.',
    },
    choices: [
      {
        id: 'a', skillId: 'validasi-normalisasi', best: true, next: 'di-b13',
        text: 'Ingin napas yang lebih longgar itu wajar. Detailnya tak perlu hari ini.',
        reaction: { text: 'Makasih. Detailnya nanti aja ya.', expression: 'lega', cue: 'Dimas mengangguk dan mengendurkan rahangnya.' },
      },
      {
        id: 'b', skillId: 'parafrase-ringkasan', next: 'di-b13',
        text: 'Jadi yang kamu inginkan saat ini adalah beban yang sedikit lebih ringan.',
        reaction: { text: 'Iya, ringan dikit aja udah cukup.', expression: 'netral', cue: 'Dimas memandang meja sambil mengangguk.' },
      },
      {
        id: 'c', skillId: 'pertanyaan-terbuka', next: 'di-b13',
        text: 'Kalau ada satu hal kecil yang bisa melonggarkan bebanmu, kira-kira apa?',
        reaction: { text: 'Satu hal kecil? Mungkin ngurangin target di praktikum.', expression: 'netral', cue: 'Dimas berpikir sebentar sambil menatap langit-langit.' },
      },
      {
        id: 'd', skillId: 'meremehkan', next: 'di-b13',
        text: 'Nanti juga longgar sendiri kalau sudah lulus.',
        reaction: {
          text: 'Mungkin. Entah kapan.',
          expression: 'menutup-diri',
          cue: 'Dimas mengangguk singkat tanpa menoleh, suaranya hampir tak terdengar.',
        },
      },
    ],
  },
];
