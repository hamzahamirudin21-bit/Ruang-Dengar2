/**
 * Cerita Rani Safitri (mhs-14), adegan Ruang BK bagian eksplorasi: simpul r-b0, r-b2, r-b4, r-b5 (r-b1 dan r-b3 digabung, tugas 27.1).
 * Tujuan di luar berkas ini: r-b6 (bk-pemahaman) dan r-tegang-bk (bk-rencana).
 * Dirakit di mhs-14.ts. Seluruh teks Bahasa Indonesia, tanpa Istilah_Diagnosis.
 */
import type { StoryLine, StoryNode } from '../../engine/story/storyTypes';

const SCENE = 'bk';
const TEGANG = 'r-tegang-bk';

function line(text: string, expression: StoryLine['expression'], cue: string, aside?: string): StoryLine {
  return { text, expression, cue, ...(aside ? { aside } : {}) };
}

export const MHS14_BK_EKSPLORASI_NODES: StoryNode[] = [
  {
    id: 'r-b0',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: line(
      'Jadi... ini ruangannya. Sepi ya. Aku bawa ini biar ada yang dipegang, hehe.',
      'waspada',
      'Rani duduk di ujung kursi, tangannya menahan sampul buku catatan di pangkuan, matanya menyapu sudut ruangan.',
    ),
    choices: [
      {
        id: 'a', skillId: 'batas-kerahasiaan', best: true, next: 'r-b2',
        text: 'Ceritamu aman di antara kita, kecuali menyangkut keselamatanmu.',
        reaction: {
          text: 'Makasih, Dosen... itu bikin lebih tenang. Kalau soal kuliah sih, aku jarang nanya waktu praktikum. Takut kedengaran bodoh, jadi biasanya kucoba sendiri sampai malam.',
          expression: 'menunduk',
          cue: 'Rani berbicara pelan, pandangannya jatuh ke sampul bukunya; senyum tipisnya tidak sampai ke mata.',
        },
      },
      {
        id: 'b', skillId: 'sapaan-hangat', next: 'r-b2',
        text: 'Makasih sudah mau ikut, Rani. Duduk di mana pun yang nyaman, ya.',
        reaction: {
          text: 'Iya, Dosen, aku di sini aja deh, dekat pintu. Hmm, mulai dari mana ya... Mungkin soal praktikum. Aku jarang nanya di sana, takut kedengaran bodoh, jadi kucoba sendiri sampai malam.',
          expression: 'menunduk',
          cue: 'Rani menggeser duduknya sedikit, pandangannya jatuh ke sampul buku, dan senyum tipisnya tidak sampai ke mata.',
        },
      },
      {
        id: 'c', skillId: 'pertanyaan-terbuka', next: 'r-b2',
        text: 'Gimana rasanya waktu pertama masuk ruangan ini?',
        reaction: {
          text: 'Rasanya deg-degan, Dosen, tapi enggak seburuk yang kubayangin. Lebih sepi daripada lab. Di lab aku jarang nanya waktu praktikum, takut kedengaran bodoh. Kucoba sendiri sampai malam.',
          expression: 'menunduk',
          cue: 'Rani berbicara pelan sambil menatap sampul bukunya; senyum tipisnya tidak sampai ke mata.',
        },
      },
      {
        id: 'd', skillId: 'interogasi', next: TEGANG,
        text: 'Kenapa tadi di Lab kamu kelihatan menghindar? Jawab saja terus terang.',
      },
    ],
  },
  {
    id: 'r-b2',
    sceneId: SCENE,
    stage: 'eksplorasi',
    depth: 0,
    reply: line(
      'Aku jarang nanya waktu praktikum. Takut kedengaran bodoh, jujurly. Biasanya aku coba sendiri sampai malam, biar enggak merepotkan.',
      'menunduk',
      'Rani berbicara pelan, pandangannya jatuh ke sampul bukunya; senyum tipisnya tidak sampai ke mata.',
    ),
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'r-b4',
        text: 'Sebelum memutuskan tidak bertanya, apa yang biasanya terlintas di kepalamu?',
        reaction: {
          text: 'Biasanya yang kepikiran: "nanti dikira enggak ngerti-ngerti". Makanya aku diam dan gambar ulang sendiri. Nih, rangkaian yang kemarin salah, kukerjain lagi. Kayaknya sekarang sudah benar.',
          expression: 'tertegun',
          cue: 'Rani membuka halaman paling belakang bukunya dengan dua tangan, lalu menahan napas.',
          aside: 'Di halaman itu ada skema rangkaian yang digambar rapi dengan pensil dan penggaris.',
        },
      },
      {
        id: 'b', skillId: 'refleksi-perasaan', next: 'r-b4',
        options: { reflectionNuance: 'ragu-kurang-percaya' },
        text: 'Kedengarannya kamu pengin nanya, tapi ragu pertanyaanmu bakal diterima.',
        reaction: {
          text: 'Iya, Dosen, tepat... Pengin banget nanya, tapi enggak yakin bakal diterima. Jadinya kugambar ulang sendiri aja, nih rangkaian yang kemarin salah. Kayaknya sekarang sudah benar.',
          expression: 'tertegun',
          cue: 'Rani membuka halaman paling belakang dengan dua tangan dan menahan napas.',
          aside: 'Halaman itu berisi skema rangkaian yang digambar rapi dengan pensil dan penggaris.',
        },
      },
      {
        id: 'c', skillId: 'pertanyaan-tertutup', next: 'r-b4',
        text: 'Jadi kamu memang nggak pernah nanya sama sekali, ya?',
        reaction: line(
          'Ya... jarang.',
          'menutup-diri',
          'Rani menjawab singkat dan menunduk lebih dalam.',
        ),
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: TEGANG,
        text: 'Mulai besok tanyain aja yang bikin bingung. Jangan malu-malu lagi.',
      },
    ],
  },
  {
    id: 'r-b4',
    sceneId: SCENE,
    stage: 'eksplorasi',
    depth: 1,
    reply: line(
      'Ini... aku gambar ulang rangkaian yang kemarin salah. Kayaknya sekarang sudah benar, tapi aku enggak berani nunjukin ke siapa-siapa.',
      'tertegun',
      'Rani membuka halaman paling belakang dengan dua tangan, lalu menahan napas.',
      'Di halaman itu ada skema rangkaian yang digambar rapi dengan pensil dan penggaris.',
    ),
    marks: ['kejutan', 'isyarat-nonverbal'],
    choices: [
      {
        id: 'a', skillId: 'sampaikan-pengamatan', best: true, next: 'r-b5',
        options: { observationTone: 'faktual' },
        text: 'Kamu buka halaman ini pakai dua tangan sambil menahan napas. Gambar ini berarti ya.',
        reaction: {
          text: 'Ketahuan ya... iya, Dosen, gambar ini berarti banget buatku. Aku enggak berani nunjukin ke siapa pun, soalnya teman-teman cepat banget, aku jadi minder.',
          expression: 'menunduk',
          cue: 'Rani melirik pintu sebentar, lalu kembali menatap bukunya dengan kedua tangan masih memegang halaman itu.',
        },
      },
      {
        id: 'b', skillId: 'afirmasi-kekuatan', next: 'r-b5',
        text: 'Gambar ulang sampai benar itu butuh ketekunan. Usahamu nyata banget, Rani.',
        reaction: {
          text: 'Makasih, Dosen... jarang ada yang bilang gitu. Tapi kalau lihat teman-teman yang cepat banget, usahaku rasanya enggak ada apa-apanya, jujurly.',
          expression: 'menunduk',
          cue: 'Rani melirik pintu sebentar, lalu kembali menunduk menatap gambarnya.',
        },
      },
      {
        id: 'c', skillId: 'janji-mutlak', next: 'r-b5',
        text: 'Serahkan saja ke saya. Gambar ini pasti diterima semua orang, saya jamin.',
        reaction: line(
          'Jangan dulu ya... aku belum siap.',
          'waspada',
          'Rani cepat menutup bukunya dan memeluknya di dada.',
        ),
      },
      {
        id: 'd', skillId: 'interogasi', next: TEGANG,
        text: 'Kenapa tidak pernah kamu tunjukkan? Ada yang kamu sembunyikan?',
      },
    ],
  },
  {
    id: 'r-b5',
    sceneId: SCENE,
    stage: 'eksplorasi',
    depth: 1,
    reply: line(
      'Teman-teman cepat banget. Aku lihat mereka, terus mikir, kok aku enggak bisa kayak gitu.',
      'menunduk',
      'Rani melirik pintu sebentar, lalu kembali menatap bukunya.',
    ),
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'r-b6',
        text: 'Saat membandingkan diri dengan mereka, apa yang kamu katakan pada dirimu?',
        reaction: {
          text: 'Aku bilang ke diriku, "kok lambat banget sih". Terus mikir, kalau minta bantuan nanti kelihatan lemah. Jadi aku diam aja.',
          expression: 'menunduk',
          cue: 'Rani menunduk, jarinya mengusap-usap sampul buku catatan di pangkuannya.',
        },
      },
      {
        id: 'b', skillId: 'validasi-normalisasi', next: 'r-b6',
        text: 'Lihat teman yang cepat memang bikin merasa tertinggal. Banyak yang begitu kok.',
        reaction: {
          text: 'Beneran banyak yang begitu, Dosen? Syukurlah, kupikir cuma aku. Tapi tetep aja, rasanya kalau aku minta bantuan nanti kelihatan lemah.',
          expression: 'menunduk',
          cue: 'Rani menunduk sambil mengusap-usap sampul buku catatan di pangkuannya.',
        },
      },
      {
        id: 'c', skillId: 'refleksi-perasaan', next: 'r-b6',
        options: { reflectionNuance: 'kecewa-kesal', reflectionCorrectOverride: false },
        text: 'Kamu pasti kesal sekali pada teman-teman yang cepat itu.',
        reaction: line(
          'Bukan kesal sih... aku cuma merasa kecil.',
          'menunduk',
          'Rani menggeleng pelan, suaranya hampir tak terdengar.',
        ),
      },
      {
        id: 'd', skillId: 'meremehkan', next: 'r-b6',
        text: 'Mereka cuma kebetulan cepat. Kamu juga nanti bisa, tenang saja.',
        reaction: line(
          'Iya, mungkin...',
          'menutup-diri',
          'Rani mengangguk singkat tanpa menatap.',
        ),
      },
    ],
  },
];
