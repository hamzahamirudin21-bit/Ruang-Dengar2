/**
 * Cerita Mita Rahmawati (mhs-06), adegan Ruang BK bagian eksplorasi: simpul mi-b0, mi-b2, mi-b4, mi-b5.
 * Tujuan di luar berkas ini: mi-b6 (bk-pemahaman) dan mi-tegang-bk (bk-rencana).
 * Dirakit di mhs-06.ts. Seluruh teks Bahasa Indonesia, tanpa Istilah_Diagnosis.
 */
import type { StoryLine, StoryNode } from '../../engine/story/storyTypes';

const SCENE = 'bk';
const TEGANG = 'mi-tegang-bk';

function line(text: string, expression: StoryLine['expression'], cue: string, aside?: string): StoryLine {
  return { text, expression, cue, ...(aside ? { aside } : {}) };
}

export const MITA_BK_EKSPLORASI_NODES: StoryNode[] = [
  {
    id: 'mi-b0',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: line(
      'Maaf ya, Bu, aku duduk di pinggir aja. Kursinya enak banget, nanti kupakai kelamaan.',
      'menunduk',
      'Mita duduk di ujung kursi dengan tas dipeluk di pangkuan, lalu menarik lengan bajunya sampai menutupi buku jari.',
    ),
    choices: [
      {
        id: 'a', skillId: 'batas-kerahasiaan', best: true, next: 'mi-b2',
        setFlags: ['privasi-dijelaskan'],
        text: 'Ceritamu aman di sini, kecuali menyangkut keselamatanmu. Itu perlu kubahas lagi.',
        reaction: {
          text: 'Oke, Bu, lega dengernya. Jadi soal modul praktikum mikrokontroler, dua pertemuan terakhir. Aku pulang ke Bogor, sekarang yang lain udah di bagian interupsi.',
          expression: 'cemas',
          cue: 'Mita mengangguk dan merapikan lengan bajunya sebelum mulai bicara.',
        },
      },
      {
        id: 'b', skillId: 'sapaan-hangat', next: 'mi-b2',
        text: 'Duduk senyamannya aja, Mita. Kursi ini memang buat dipakai selama perlu.',
        reaction: {
          text: 'Makasih, Bu. Kursinya boleh kupakai lama ya. Jadi soal modul praktikum mikrokontroler, dua pertemuan terakhir aku nggak ikut. Maaf, ini bodoh banget.',
          expression: 'cemas',
          cue: 'Mita duduk perlahan dan menaruh tasnya di pangkuan.',
        },
      },
      {
        id: 'c', skillId: 'pertanyaan-terbuka', next: 'mi-b2',
        text: 'Apa yang pengin kamu bawa pulang dari obrolan hari ini?',
        reaction: {
          text: 'Yang pengin kubawa pulang jawaban soal modul praktikum mikrokontroler, dua pertemuan yang kulewatin waktu pulang ke Bogor. Maaf ya, Bu, kedengarannya bodoh.',
          expression: 'cemas',
          cue: 'Mita memeluk tasnya dan bicara sambil menatap lantai.',
        },
      },
      {
        id: 'd', skillId: 'interogasi', next: TEGANG,
        text: 'Kenapa tadi kamu nutup buku cepat banget? Apa yang kamu sembunyiin?',
      },
    ],
  },
  {
    id: 'mi-b2',
    sceneId: SCENE,
    stage: 'eksplorasi',
    depth: 0,
    reply: line(
      'Sebenernya soal modul praktikum mikrokontroler, dua pertemuan terakhir. Waktu itu aku pulang ke Bogor, dan sekarang yang lain udah di bagian interupsi. Maaf, ini bodoh banget ya.',
      'cemas',
      'Mita berbicara menunduk dan mengatur kata satu per satu, lalu tertawa kecil yang terdengar canggung.',
    ),
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'mi-b4',
        text: 'Pas lihat teman-temanmu udah di bagian itu, apa yang paling kamu rasain?',
        reaction: {
          text: 'Yang paling kurasain ketinggalan banget, Bu. Malam-malam kubaca lembar data sendiri, empat puluh halaman. Tapi tiap sampai bagian timer aku mentok.',
          expression: 'menunduk',
          cue: 'Mita menarik bundelnya dari tas, memperlihatkannya sekilas, lalu mendekapnya.',
          aside: 'Hampir setiap halaman bergaris stabilo kuning, dan di tepinya ada tanda tanya kecil yang ditulis dengan pensil.',
        },
      },
      {
        id: 'b', skillId: 'validasi-normalisasi', next: 'mi-b4',
        text: 'Ketinggalan dua pertemuan lalu ngejar sendirian itu berat. Itu nggak bodoh kok.',
        reaction: {
          text: 'Makasih udah bilang nggak bodoh, Bu. Memang berat. Malam-malam kubaca lembar data sendiri, empat puluh halaman, tapi di bagian timer aku mentok.',
          expression: 'menunduk',
          cue: 'Mita mengangguk pelan dan mengeluarkan bundel kertas dari tasnya.',
          aside: 'Hampir setiap halaman bergaris stabilo kuning, dan di tepinya ada tanda tanya kecil yang ditulis dengan pensil.',
        },
      },
      {
        id: 'c', skillId: 'pertanyaan-tertutup', next: 'mi-b4',
        text: 'Jadi masalahnya cuma materi yang terlewat itu aja, gitu?',
        reaction: line(
          'Iya, kurang lebih. Cuma itu kok, Bu.',
          'menunduk',
          'Mita mengangguk cepat dan merapikan tali tasnya.',
        ),
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: TEGANG,
        text: 'Tinggal tanya asisten lab atau teman sekelompok. Beres, kan?',
      },
    ],
  },
  {
    id: 'mi-b4',
    sceneId: SCENE,
    stage: 'eksplorasi',
    depth: 1,
    reply: line(
      'Malam-malam kubaca lembar data sendiri. Empat puluh halaman, kutandai satu-satu. Tapi tiap sampai bagian timer aku mentok, dan aku... nggak berani nanya.',
      'tertegun',
      'Mita mengeluarkan bundel kertas penuh stabilo dari tasnya, memperlihatkannya sekilas, lalu mendekapnya lagi.',
      'Hampir setiap halaman bergaris stabilo kuning, dan di tepinya ada tanda tanya kecil yang ditulis dengan pensil.',
    ),
    marks: ['kejutan', 'isyarat-nonverbal'],
    choices: [
      {
        id: 'a', skillId: 'jeda-hening', next: 'mi-b5',
        text: 'Aku dengerin kok. Ceritain soal bundel itu pelan-pelan, sesuai ritmemu.',
        reaction: {
          text: 'Iya, Bu. Bundel ini kutandai satu-satu sendirian. Tanda tanyanya kusimpen, soalnya kalau aku nanya, ketahuan cuma aku yang ketinggalan.',
          expression: 'cemas',
          cue: 'Mita membuka bundel pelan-pelan, lalu menutupnya lagi sebelum Dosen sempat membaca.',
        },
      },
      {
        id: 'b', skillId: 'sampaikan-pengamatan', best: true, next: 'mi-b5',
        options: { observationTone: 'faktual' },
        text: 'Hampir tiap halaman kamu tandai, dan tanda tanyanya kamu simpan sendiri.',
        reaction: {
          text: 'Iya, tanda tanyanya kusimpen sendiri. Kalau nanya, nanti ketahuan cuma aku yang ketinggalan, dikira nggak serius belajar.',
          expression: 'cemas',
          cue: 'Mita menunduk dan menggeser bundelnya ke dekat dadanya.',
        },
      },
      {
        id: 'c', skillId: 'janji-mutlak', next: 'mi-b5',
        text: 'Kasih bundel itu ke aku, minggu depan pasti kamu udah sejajar sama semuanya.',
        reaction: line(
          'Jangan, Bu, nanti ngerepotin. Biar kupegang sendiri aja.',
          'waspada',
          'Mita cepat menarik bundelnya kembali ke dada dan menggeleng pelan.',
        ),
      },
      {
        id: 'd', skillId: 'interogasi', next: TEGANG,
        text: 'Kenapa nggak tanya aja? Apa susahnya angkat tangan?',
      },
    ],
  },
  {
    id: 'mi-b5',
    sceneId: SCENE,
    stage: 'eksplorasi',
    depth: 1,
    reply: line(
      'Kalau aku nanya, nanti ketahuan cuma aku yang ketinggalan. Mereka pasti mikir aku nggak serius belajar.',
      'cemas',
      'Mita menggosok-gosok ujung lengan bajunya di antara dua jari, matanya tertuju ke lantai.',
    ),
    choices: [
      {
        id: 'a', skillId: 'refleksi-perasaan', best: true, next: 'mi-b6',
        options: { reflectionCorrectOverride: true },
        text: 'Kedengarannya kamu takut dinilai nggak serius, jadi kamu milih diam.',
        reaction: {
          text: 'Iya, Bu, takutnya gitu. Timku sering nunjuk aku buat cari referensi, jadi kalau mereka tahu aku belum paham timer, pasti kecewa.',
          expression: 'cemas',
          cue: 'Mita mengangguk cepat dan matanya berkaca-kaca tipis.',
        },
      },
      {
        id: 'b', skillId: 'pertanyaan-terbuka', next: 'mi-b6',
        text: 'Kalau mereka tahu kamu ketinggalan, kamu bayangin mereka bilang apa?',
        reaction: {
          text: 'Mereka mungkin mikir, kok baru nanya sekarang. Apalagi timku sering nunjuk aku buat cari referensi. Nanti kecewa kalau tahu aku belum paham timer.',
          expression: 'cemas',
          cue: 'Mita berpikir sebentar, lalu menjawab sambil memilin lengan bajunya.',
        },
      },
      {
        id: 'c', skillId: 'refleksi-perasaan', next: 'mi-b6',
        options: { reflectionNuance: 'kecewa-kesal', reflectionCorrectOverride: false },
        text: 'Kamu pasti kesal karena kelompokmu jalan terus tanpa nungguin kamu.',
        reaction: line(
          'Bukan, mereka baik kok. Aku yang kesal sama diriku sendiri.',
          'menunduk',
          'Mita menggeleng cepat, takut kesannya menyalahkan orang lain.',
        ),
      },
      {
        id: 'd', skillId: 'meremehkan', next: 'mi-b6',
        text: 'Itu cuma perasaanmu aja. Anak lain juga nggak bakal peduli.',
        reaction: line(
          'Iya, mungkin gitu. Maaf, aku lebay.',
          'menutup-diri',
          'Mita mengangguk sopan, tetapi tangannya menarik lengan baju hingga menutup seluruh telapak.',
        ),
      },
    ],
  },
];
