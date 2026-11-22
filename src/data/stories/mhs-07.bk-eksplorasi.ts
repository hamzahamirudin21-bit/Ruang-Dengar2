/**
 * Cerita Bima Mahendra (mhs-07), adegan Ruang BK bagian eksplorasi: simpul bi-b0, bi-b2, bi-b4, bi-b5.
 * Tujuan di luar berkas ini: bi-b6 (bk-pemahaman) dan bi-tegang-bk (bk-rencana).
 * Dirakit di mhs-07.ts. Seluruh teks Bahasa Indonesia, tanpa Istilah_Diagnosis.
 */
import type { StoryLine, StoryNode } from '../../engine/story/storyTypes';

const SCENE = 'bk';
const TEGANG = 'bi-tegang-bk';

function line(text: string, expression: StoryLine['expression'], cue: string, aside?: string): StoryLine {
  return { text, expression, cue, ...(aside ? { aside } : {}) };
}

export const BIMA_BK_EKSPLORASI_NODES: StoryNode[] = [
  {
    id: 'bi-b0',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: line(
      'Wah, adem dan sepi. Pas buat mikir. Tadi sudah kubilang ke anak-anak, aku telat satu jam, jadi santai aja.',
      'tersenyum',
      'Bima duduk sambil meletakkan helm las di pangkuan, lalu memutarnya pelan dan melepas satu sarung tangan.',
    ),
    choices: [
      {
        id: 'a', skillId: 'batas-kerahasiaan', best: true, next: 'bi-b2',
        reaction: {
          text: 'Oke, Bu, jelas. Kecuali ada hal yang bahaya buat keselamatan, ya. Itu masuk akal kok.',
          expression: 'netral',
          cue: 'Bima mengangguk dan menaruh kedua tangannya di atas lutut.',
        },
        text: 'Ceritamu aman di sini, kecuali ada hal yang membahayakan keselamatanmu.',
      },
      {
        id: 'b', skillId: 'sapaan-hangat', next: 'bi-b2',
        reaction: {
          text: 'Siap, Bu. Kursinya empuk juga, lumayan buat ngelurusin punggung habis lama berdiri di depan mesin.',
          expression: 'netral',
          cue: 'Bima duduk dan bersandar sedikit, lalu meregangkan bahunya pelan-pelan.',
        },
        text: 'Makasih sudah mau ikut, Bima. Duduk yang nyaman aja.',
      },
      {
        id: 'c', skillId: 'pertanyaan-terbuka', next: 'bi-b2',
        reaction: {
          text: 'Bawa pulang? Hm, belum kepikiran, Bu. Mungkin cuma pengin kepalaku agak lebih rapi dikit.',
          expression: 'netral',
          cue: 'Bima menatap langit-langit sebentar sambil memutar-mutar sarung tangan di tangannya.',
        },
        text: 'Apa yang pengin kamu bawa pulang dari obrolan ini?',
      },
      {
        id: 'd', skillId: 'interogasi', next: TEGANG,
        text: 'Kenapa tadi telepon bengkel nggak diangkat? Jawab jujur.',
      },
    ],
  },
  {
    id: 'bi-b2',
    sceneId: SCENE,
    stage: 'eksplorasi',
    depth: 0,
    reply: line(
      'Jadi gini, Bu. Bengkel Surya Fabrikasi nawarin aku kerja, gajinya empat koma delapan juta, mulai bulan depan. Wisuda masih setahun lagi. Kalau ambil, untung di gaji dan pengalaman, tapi rugi waktu buat skripsi.',
      'netral',
      'Bima menyebut untung dan rugi sambil menekuk jarinya satu per satu, lalu berhenti di jari ketiga.',
    ),
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'bi-b4',
        reaction: {
          text: 'Angka mana ya... Gaji empat koma delapan juta itu jelas menarik, Bu. Tapi waktu buat skripsi juga angka yang berat kuhitung.',
          expression: 'netral',
          cue: 'Bima menekuk jari satu per satu seperti sedang menghitung dalam hati.',
        },
        text: 'Dari hitungan itu, angka mana yang paling berat buatmu?',
      },
      {
        id: 'b', skillId: 'validasi-normalisasi', next: 'bi-b4',
        reaction: {
          text: 'Iya, Bu. Makanya sampai kubuat tabel. Kalau sederhana, sekali hitung juga selesai.',
          expression: 'tersenyum',
          cue: 'Bima mengangguk sambil mengusap tengkuknya, senyumnya tipis dan agak lelah.',
        },
        text: 'Menimbang tawaran kerja sebelum lulus memang nggak sederhana.',
      },
      {
        id: 'c', skillId: 'pertanyaan-tertutup', next: 'bi-b4',
        text: 'Jadi intinya tinggal pilih gaji atau kuliah, kan?',
        reaction: line(
          'Ya, kurang lebih. Tinggal pilih aja.',
          'netral',
          'Bima mengangguk ringan dan menggeser helm ke lutut yang lain.',
        ),
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: TEGANG,
        text: 'Ambil aja tawarannya. Gaji tetap lebih jelas daripada ijazah.',
      },
    ],
  },
  {
    id: 'bi-b4',
    sceneId: SCENE,
    stage: 'eksplorasi',
    depth: 1,
    reply: line(
      'Ini tabel untung-ruginya. Aku buat tiga versi, hasilnya selalu seri. Baris paling bawah ini kutinggal kosong, soalnya nggak ketemu angkanya.',
      'tertegun',
      'Bima mengeluarkan kertas yang dilipat empat dari saku celemek, membentangkannya, lalu menutup baris paling bawah dengan ibu jarinya.',
      'Baris kosong itu berjudul "Ayah dan Ibu". Tepi kertasnya lecek, tanda sudah sering dibuka dan dilipat lagi.',
    ),
    marks: ['kejutan', 'isyarat-nonverbal'],
    choices: [
      {
        id: 'a', skillId: 'jeda-hening', best: true, next: 'bi-b5',
        reaction: {
          text: 'Oke, pelan-pelan ya, Bu. Jadi ada kolom untung di kiri, rugi di kanan. Tiap kuhitung ulang, timbangannya tetap sebelas-dua belas.',
          expression: 'netral',
          cue: 'Bima menggeser kertas tabel itu ke tengah meja dan menunjuk kolom-kolomnya dengan ujung pensil.',
        },
        text: 'Aku di sini. Ceritain tabelnya dengan caramu, nggak usah buru-buru.',
      },
      {
        id: 'b', skillId: 'sampaikan-pengamatan', next: 'bi-b5',
        reaction: {
          text: 'Eh, iya ya, Bu. Nggak sadar. Baris itu memang masih kosong, belum ketemu isinya.',
          expression: 'menunduk',
          cue: 'Bima menatap ibu jarinya sendiri, lalu menggeser jarinya pelan dari baris terbawah.',
        },
        options: { observationTone: 'faktual' },
        text: 'Ibu jarimu menutup baris paling bawah, dan baris itu kosong.',
      },
      {
        id: 'c', skillId: 'janji-mutlak', next: 'bi-b5',
        text: 'Serahin tabelnya ke aku, dijamin kita ketemu jawaban yang pas hari ini.',
        reaction: line(
          'Eh, tabelnya biar kupegang aja, Bu. Hitungan kayak gini harus aku sendiri.',
          'waspada',
          'Bima cepat melipat kertas itu dan menyelipkannya kembali ke saku celemek.',
        ),
      },
      {
        id: 'd', skillId: 'interogasi', next: TEGANG,
        text: 'Kenapa baris orang tuamu kosong? Kamu belum bilang ke mereka?',
      },
    ],
  },
  {
    id: 'bi-b5',
    sceneId: SCENE,
    stage: 'eksplorasi',
    depth: 1,
    reply: line(
      'Ayah dari dulu bilang, lulus dulu baru kerja. Biaya kuliahku mereka kumpulin dari mana-mana. Kalau kuambil kerjaan itu, kesannya aku menyia-nyiakan semuanya.',
      'cemas',
      'Bima memutar helm setengah putaran, berhenti, lalu memandang tali pengikat helm itu sambil menarik napas.',
    ),
    choices: [
      {
        id: 'a', skillId: 'refleksi-perasaan', best: true, next: 'bi-b6',
        reaction: {
          text: 'Iya, Bu, kurang lebih gitu. Susah misahin mana mauku, mana yang bikin orang tua tenang.',
          expression: 'tertegun',
          cue: 'Bima terdiam sebentar, rahangnya mengeras tipis, lalu pandangannya turun ke meja.',
        },
        options: { reflectionNuance: 'ragu-kurang-percaya' },
        text: 'Kamu ragu, soalnya milih buat dirimu sendiri terasa kayak mengecewakan orang tua.',
      },
      {
        id: 'b', skillId: 'pertanyaan-terbuka', next: 'bi-b6',
        reaction: {
          text: 'Hm. Mungkin Ayah diam dulu, Bu, terus bilang "pikirin lagi, Nak". Dibayangin gitu aja udah bikin aku mikir dua kali.',
          expression: 'menunduk',
          cue: 'Bima menarik napas, lalu memiringkan kepala seolah mendengar suara itu di kepalanya.',
        },
        text: 'Kalau kamu pilih kerja, kamu bayangin Ayah bakal bilang apa?',
      },
      {
        id: 'c', skillId: 'refleksi-perasaan', next: 'bi-b6',
        options: { reflectionNuance: 'kecewa-kesal', reflectionCorrectOverride: false },
        text: 'Kamu pasti kesal sama Ayah yang nyuruh lulus dulu.',
        reaction: line(
          'Nggak kesal ke Ayah, Bu. Aku lebih kesal ke diriku yang nggak bisa mutusin.',
          'menunduk',
          'Bima menggeleng dan tertawa pendek, tawa yang tidak sampai ke matanya.',
        ),
      },
      {
        id: 'd', skillId: 'meremehkan', next: 'bi-b6',
        text: 'Orang tua biasanya luluh sendiri. Nggak usah dibuat berat.',
        reaction: line(
          'Hehe, iya ya. Mungkin aja.',
          'menutup-diri',
          'Bima mengangguk santai, tetapi helmnya berhenti berputar dan jarinya mencengkeram tali.',
        ),
      },
    ],
  },
];
