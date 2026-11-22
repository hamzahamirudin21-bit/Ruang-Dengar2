/**
 * Cerita Dimas Aditya (mhs-02), adegan Ruang BK bagian eksplorasi: di-b0, di-b2, di-b4, di-b5.
 * Tujuan di luar berkas ini: di-b6 (bk-pemahaman) dan di-tegang-bk (bk-rencana).
 * Bendera `batas-dijelaskan` (di-b0) dan `jeda-diberi` (di-b2) menjadi syarat gerbang Momen_Terbuka.
 * Dirakit di mhs-02.ts. Seluruh teks Bahasa Indonesia, tanpa Istilah_Diagnosis.
 */
import type { StoryLine, StoryNode } from '../../engine/story/storyTypes';

const SCENE = 'bk';
const TEGANG = 'di-tegang-bk';

function line(text: string, expression: StoryLine['expression'], cue: string, aside?: string): StoryLine {
  return { text, expression, cue, ...(aside ? { aside } : {}) };
}

export const MHS02_BK_EKSPLORASI_NODES: StoryNode[] = [
  {
    id: 'di-b0',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: line(
      'Ruangannya dingin juga ya. Jangan lama-lama, aku masih ngejar target.',
      'waspada',
      'Dimas duduk tegak di tepi kursi, telapak tangannya menekan saku tempat ponselnya berada.',
    ),
    choices: [
      {
        id: 'a', skillId: 'batas-kerahasiaan', best: true, next: 'di-b2', setFlags: ['batas-dijelaskan'],
        text: 'Ceritamu tidak keluar dari ruangan ini, kecuali menyangkut keselamatanmu.',
        reaction: { text: 'Hm. Oke, kalau nggak keluar dari sini.', expression: 'netral', cue: 'Dimas melirik pintu, lalu duduk.' },
      },
      {
        id: 'b', skillId: 'sapaan-hangat', next: 'di-b2',
        text: 'Terima kasih sudah mampir. Kita pakai waktu sesuai kebutuhanmu, bukan target.',
        reaction: { text: 'Bukan target? Aneh, tapi oke.', expression: 'waspada', cue: 'Dimas mengerutkan dahi sambil memperhatikan jam di dinding.' },
      },
      {
        id: 'c', skillId: 'pertanyaan-terbuka', next: 'di-b2',
        text: 'Apa yang terasa paling mendesak buatmu minggu ini?',
        reaction: { text: 'Paling mendesak? Praktikum yang harus beres.', expression: 'netral', cue: 'Dimas menjawab sambil menatap meja.' },
      },
      {
        id: 'd', skillId: 'interogasi', next: TEGANG,
        text: 'Kenapa ponselmu terus kamu sembunyikan? Ada yang kamu tutupi?',
      },
    ],
  },
  {
    id: 'di-b2',
    sceneId: SCENE,
    stage: 'eksplorasi',
    depth: 0,
    reply: line(
      'Praktikum minggu ini harus beres semua. Kalau telat, nilai ikut turun. Aku bisa kok ngatur.',
      'netral',
      'Jari-jarinya mengetuk lutut dengan irama cepat, lalu berhenti begitu ia sadar sedang diperhatikan.',
    ),
    choices: [
      {
        id: 'a', skillId: 'jeda-hening', best: true, next: 'di-b4', setFlags: ['jeda-diberi'],
        text: 'Aku di sini saja dulu, tanpa buru-buru. Lanjutkan kalau kamu sudah siap.',
        reaction: { text: 'Hm. Iya. Aku nggak buru-buru kok, bentar aja.', expression: 'netral', cue: 'Dimas menarik napas dan bersandar sedikit.' },
      },
      {
        id: 'b', skillId: 'pertanyaan-terbuka', next: 'di-b4',
        text: 'Ngatur itu bentuknya seperti apa dalam sehari-harimu?',
        reaction: { text: 'Ngatur? Ya bagi jam, nyicil yang bisa dikerjain duluan.', expression: 'netral', cue: 'Dimas menghitung dengan jari, lalu berhenti.' },
      },
      {
        id: 'c', skillId: 'pertanyaan-tertutup', next: 'di-b4',
        text: 'Jadi semuanya terkendali, kan?',
        reaction: line(
          'Iya. Terkendali.',
          'menutup-diri',
          'Dimas menjawab cepat dan memalingkan wajah ke dinding.',
        ),
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: TEGANG,
        text: 'Kurangi saja target praktikummu, pasti jadi lebih ringan.',
      },
    ],
  },
  {
    id: 'di-b4',
    sceneId: SCENE,
    stage: 'eksplorasi',
    depth: 1,
    reply: line(
      'Lagi banyak yang dikejar. Makan juga sering sambil kerja, biar hemat waktu. Ya, hemat yang lain juga.',
      'lelah',
      'Dimas menggeser dompet tipisnya dari meja ke pangkuan, lalu menutupinya dengan satu tangan.',
      'Dompet itu terlipat dua dan sudutnya sudah aus.',
    ),
    marks: ['kejutan', 'isyarat-nonverbal'],
    choices: [
      {
        id: 'a', skillId: 'sampaikan-pengamatan', best: true, next: 'di-b5',
        options: { observationTone: 'faktual' },
        text: 'Dompetmu kamu geser ke pangkuan tadi. Aku catat saja, tanpa menyimpulkan.',
        reaction: { text: 'Oh, itu. Nggak sengaja, refleks aja.', expression: 'menutup-diri', cue: 'Dimas menggeser dompetnya makin rapat ke pangkuan.' },
      },
      {
        id: 'b', skillId: 'validasi-normalisasi', next: 'di-b5',
        text: 'Mengejar target sambil menjaga pengeluaran memang melelahkan.',
        reaction: { text: 'Iya, capek sih. Tapi ya dijalanin aja.', expression: 'lelah', cue: 'Dimas mengangkat bahu tanpa menatap.' },
      },
      {
        id: 'c', skillId: 'janji-mutlak', next: 'di-b5',
        text: 'Tenang, soal biaya pasti ada jalan keluarnya. Aku jamin.',
        reaction: line(
          'Jamin? Ya... makasih.',
          'waspada',
          'Dimas tersenyum tipis yang tidak sampai ke mata, dompetnya tetap tertutup.',
        ),
      },
      {
        id: 'd', skillId: 'interogasi', next: TEGANG,
        text: 'Uangmu sebenarnya kurang atau tidak? Jawab jujur saja.',
      },
    ],
  },
  {
    id: 'di-b5',
    sceneId: SCENE,
    stage: 'eksplorasi',
    depth: 1,
    reply: line(
      'Orang rumah tahunya aku baik-baik aja. Kalau cerita, mereka malah kepikiran. Mending aku diam.',
      'menunduk',
      'Dimas merapikan ujung lengan baju yang sebenarnya tidak kusut.',
    ),
    choices: [
      {
        id: 'a', skillId: 'validasi-normalisasi', best: true, next: 'di-b6',
        text: 'Tidak ingin merepotkan keluarga itu tanda sayang. Wajar, dan berat kalau dipikul sendiri.',
        reaction: { text: 'Iya, itu. Mereka nggak perlu ikut mikir.', expression: 'menunduk', cue: 'Dimas mengangguk pelan pada lantai.' },
      },
      {
        id: 'b', skillId: 'refleksi-perasaan', next: 'di-b6',
        options: { reflectionNuance: 'lelah-kewalahan' },
        text: 'Kamu menanggung sendiri supaya mereka tenang, dan itu menguras tenagamu.',
        reaction: { text: 'Iya. Capek, tapi mending aku yang tahan.', expression: 'lelah', cue: 'Dimas memijat tengkuknya.' },
      },
      {
        id: 'c', skillId: 'pertanyaan-terbuka', next: 'di-b6',
        text: 'Kalau satu orang saja boleh tahu, kira-kira siapa?',
        reaction: { text: 'Satu orang? Belum kepikiran. Mungkin nggak ada.', expression: 'menutup-diri', cue: 'Dimas menyilangkan tangan di depan dada.' },
      },
      {
        id: 'd', skillId: 'meremehkan', next: 'di-b6',
        text: 'Soal uang kos itu biasa, semua mahasiswa merasakannya.',
        reaction: line(
          'Iya, biasa. Lupain aja.',
          'menutup-diri',
          'Dimas mengangguk satu kali dan menatap lurus ke depan.',
        ),
      },
    ],
  },
];
