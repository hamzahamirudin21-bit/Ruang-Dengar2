/**
 * Cerita Maya Puspita (mhs-11), adegan Ruang BK bagian eksplorasi: simpul ma-b0, ma-b2, ma-b4, ma-b5.
 * Tujuan di luar berkas ini: ma-b6 (bk-pemahaman) dan ma-tegang-bk (bk-rencana).
 * Dirakit di mhs-11.ts. Seluruh teks Bahasa Indonesia, tanpa Istilah_Diagnosis.
 */
import type { StoryLine, StoryNode } from '../../engine/story/storyTypes';

const SCENE = 'bk';
const TEGANG = 'ma-tegang-bk';

function line(text: string, expression: StoryLine['expression'], cue: string, aside?: string): StoryLine {
  return { text, expression, cue, ...(aside ? { aside } : {}) };
}

export const MAYA_BK_EKSPLORASI_NODES: StoryNode[] = [
  {
    id: 'ma-b0',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: line(
      'Akhirnya sunyi. Di sini aku bisa dengerin pikiranku sendiri, dan itu lega banget.',
      'lega',
      'Maya melepas kedua penutup telinga, meletakkannya di pangkuan, lalu memeluk buku catatan hijau dengan dua tangan.',
    ),
    choices: [
      {
        id: 'a', skillId: 'sapaan-hangat', best: true, next: 'ma-b2',
        text: 'Silakan duduk di mana yang paling nyaman. Kita nggak harus langsung ngobrol.',
        reaction: {
          text: 'Makasih, Bu. Aku duduk sini aja, dekat tembok. Kalau mulai, aku cerita sedikit: aku di tim sensor lingkungan, tiap menit ada data suhu dan kelembapan masuk.',
          expression: 'netral',
          cue: 'Maya memilih kursi dekat tembok, meletakkan penutup telinga di pangkuan, dan memeluk buku catatan hijaunya.',
        },
      },
      {
        id: 'b', skillId: 'batas-kerahasiaan', next: 'ma-b2',
        text: 'Yang kamu ceritakan di sini tetap di sini, kecuali soal keselamatanmu.',
        reaction: {
          text: 'Oke, aku catat, Bu. Jadi aman buat cerita soal kerjaanku: aku di tim sensor lingkungan, data suhu sama kelembapan masuk tiap menit.',
          expression: 'netral',
          cue: 'Maya mengangguk pelan lalu meletakkan buku hijaunya di pangkuan dengan kedua tangan.',
        },
      },
      {
        id: 'c', skillId: 'pertanyaan-terbuka', next: 'ma-b2',
        text: 'Apa yang ingin kamu bawa pulang dari pertemuan ini?',
        reaction: {
          text: 'Hm, kayaknya cukup rasa tenang dulu, Bu. Soalnya kerjaku di tim sensor lingkungan butuh kepala yang jernih, data suhu sama kelembapan masuk tiap menit.',
          expression: 'netral',
          cue: 'Maya berpikir sejenak sambil mengetuk sampul buku hijaunya dengan ujung pensil.',
        },
      },
      {
        id: 'd', skillId: 'interogasi', next: TEGANG,
        text: 'Kenapa kamu selalu pakai penutup telinga? Jawab yang jujur.',
      },
    ],
  },
  {
    id: 'ma-b2',
    sceneId: SCENE,
    stage: 'eksplorasi',
    depth: 0,
    reply: line(
      'Aku di tim sensor lingkungan. Tiap menit data suhu sama kelembapan masuk, dan kalau sekitarku sepi, pola kecilnya kelihatan jelas banget.',
      'netral',
      'Maya mengetuk halaman buku dengan ujung pensil, tiga ketukan pelan, lalu berhenti dan menunggu.',
    ),
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'ma-b4',
        text: 'Pas sekelilingmu ramai, apa yang berubah dari cara kamu baca data?',
        reaction: {
          text: 'Pola kecilnya hilang, Bu. Pas ramai aku nggak bisa bedain mana data janggal dan mana cuma bising biasa. Makanya kucatat semuanya di buku ini, lihat.',
          expression: 'netral',
          cue: 'Maya membuka buku hijaunya. Halamannya penuh grafik kecil dengan tanda tanya di tepi, dan separuhnya ia tutup dengan telapak tangan.',
          aside: 'Tanggal di pojok tiap halaman tertulis berurutan dan rapi, berjarak sekitar tiga hari satu sama lain.',
        },
      },
      {
        id: 'b', skillId: 'validasi-normalisasi', next: 'ma-b4',
        text: 'Baca pola data butuh fokus lama, jadi ruang tenang memang penting banget.',
        reaction: {
          text: 'Betul, Bu. Makanya tiap ada yang janggal kucatat dan kutulis tanda tanya di pinggirnya. Ini bukunya, lihat deh, banyak banget.',
          expression: 'tersenyum',
          cue: 'Maya membuka buku hijaunya. Halamannya penuh grafik kecil dengan tanda tanya di tepi, dan separuhnya ia tutup dengan telapak tangan.',
          aside: 'Tanggal di pojok tiap halaman tertulis berurutan dan rapi, berjarak kira-kira tiga hari satu sama lain.',
        },
      },
      {
        id: 'c', skillId: 'pertanyaan-tertutup', next: 'ma-b4',
        text: 'Jadi masalahmu cuma lab yang berisik, kan?',
        reaction: line(
          'Sebagian, iya. Tapi mungkin nggak cuma itu.',
          'netral',
          'Maya mengangguk pelan sambil menimbang, lalu menyelipkan pensil di punggung buku.',
        ),
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: TEGANG,
        text: 'Pindah aja kerja ke perpustakaan. Itu langsung menyelesaikan semuanya.',
      },
    ],
  },
  {
    id: 'ma-b4',
    sceneId: SCENE,
    stage: 'eksplorasi',
    depth: 1,
    reply: line(
      'Ini kebiasaanku. Kalau ada yang janggal di data, kucatat terus kutulis "tanya?" di pinggir. Lihat deh, banyak banget.',
      'tertegun',
      'Maya membuka buku hijaunya. Halamannya penuh grafik kecil dengan tanda tanya di tepi, dan ia menutup separuhnya dengan telapak tangan.',
      'Tanggal di pojok tiap halaman berurutan rapi, berjarak sekitar tiga hari satu sama lain.',
    ),
    marks: ['kejutan', 'isyarat-nonverbal'],
    choices: [
      {
        id: 'a', skillId: 'jeda-hening', best: true, next: 'ma-b5',
        text: 'Aku di sini. Tunjukin bagian yang kamu mau, dengan caramu sendiri.',
        reaction: {
          text: 'Hm... ini aja, Bu, bagian paling kiri. Tanda tanyanya kecil-kecil, soalnya tadinya kupikir sepele buat ditanyain ke dosen, jadi kutunda.',
          expression: 'menunduk',
          cue: 'Maya menggeser buku hijaunya setengah jengkal ke arah Dosen, lalu memutar pensil sekali di antara jarinya.',
        },
      },
      {
        id: 'b', skillId: 'sampaikan-pengamatan', next: 'ma-b5',
        options: { observationTone: 'faktual' },
        text: 'Hampir tiap halaman ada tanda tanya di tepinya, dan tanggalnya berurutan.',
        reaction: {
          text: 'Iya, Bu, hampir semua. Kutulis dulu karena ragu mau ditanyain, kayaknya terlalu sepele buat nyita waktu dosen, jadi kutunda.',
          expression: 'menunduk',
          cue: 'Maya menunduk menatap halaman bukunya dan meluruskan pensil agar sejajar dengan tepi buku.',
        },
      },
      {
        id: 'c', skillId: 'validasi-normalisasi', next: 'ma-b5',
        text: 'Mencatat hal janggal sebelum bertanya itu cara kerja yang cermat, lho.',
        reaction: {
          text: 'Makasih, Bu. Tapi catatannya numpuk, soalnya pertanyaannya sering kutunda. Kupikir sepele buat dosen yang sibuk.',
          expression: 'menunduk',
          cue: 'Maya meletakkan pensil sejajar dengan tepi buku dan menautkan jari-jarinya.',
        },
      },
      {
        id: 'd', skillId: 'janji-mutlak', next: TEGANG,
        text: 'Serahin bukunya, semua tanda tanya itu pasti kujawab tuntas minggu ini.',
        reaction: line(
          'Eh, nggak usah. Itu... masih punyaku sendiri.',
          'waspada',
          'Maya cepat menutup buku dan memeluknya di dada.',
        ),
      },
    ],
  },
  {
    id: 'ma-b5',
    sceneId: SCENE,
    stage: 'eksplorasi',
    depth: 1,
    reply: line(
      'Pertanyaannya sering kelihatan sepele. Dosen kan sibuk, jadi kutunda. Lama-lama aku lupa kenapa tadinya penting.',
      'menunduk',
      'Maya memutar pensil sekali di antara jarinya, lalu meletakkannya sejajar dengan tepi buku.',
    ),
    choices: [
      {
        id: 'a', skillId: 'refleksi-perasaan', best: true, next: 'ma-b6',
        options: { reflectionNuance: 'ragu-kurang-percaya' },
        text: 'Kamu ingin bertanya, tapi rasa sungkan menahanmu di tengah jalan.',
        reaction: {
          text: 'Iya, Bu, sungkan banget. Aku takut dikira belum belajar kalau datang dengan pertanyaan yang belum matang, jadi kutunggu sampai yakin.',
          expression: 'menunduk',
          cue: 'Maya menutup buku hijaunya dan menahan sampulnya dengan kedua telapak, seolah menjaga isinya tetap rapi.',
        },
      },
      {
        id: 'b', skillId: 'pertanyaan-terbuka', next: 'ma-b6',
        text: 'Dari semua tanda tanya itu, mana yang paling ngganjel sampai sekarang?',
        reaction: {
          text: 'Yang soal kalibrasi sensor kelembapan, Bu. Sudah tiga minggu kutunda, takut dikira belum belajar, jadi kutunggu yakin dulu.',
          expression: 'menunduk',
          cue: 'Maya menunjuk satu halaman dengan ujung pensil, lalu menarik tangannya kembali dan menutup bukunya.',
        },
      },
      {
        id: 'c', skillId: 'refleksi-perasaan', next: 'ma-b6',
        options: { reflectionNuance: 'kecewa-kesal', reflectionCorrectOverride: false },
        text: 'Kamu pasti kesal karena dosen susah ditemui.',
        reaction: line(
          'Bukan kesal. Lebih ke... sungkan aja, Bu.',
          'menunduk',
          'Maya menggeleng pelan dan tersenyum kecil yang tidak lama.',
        ),
      },
      {
        id: 'd', skillId: 'meremehkan', next: 'ma-b6',
        text: 'Pertanyaan sepele itu biasa. Nggak usah dipikirin.',
        reaction: line(
          'Iya, sih. Mungkin memang gitu.',
          'menutup-diri',
          'Maya mengangguk sopan, lalu jemarinya berhenti bergerak di atas sampul buku.',
        ),
      },
    ],
  },
];
