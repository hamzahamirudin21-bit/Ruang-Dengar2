/**
 * Cerita Raka Pratama (mhs-01), adegan Ruang BK bagian eksplorasi: simpul ra-b0, ra-b2, ra-b4, ra-b5.
 * Tujuan di luar berkas ini: ra-b6 (bk-pemahaman) dan ra-tegang-bk (bk-rencana).
 * Dirakit di mhs-01.ts. Seluruh teks Bahasa Indonesia, tanpa Istilah_Diagnosis.
 */
import type { StoryLine, StoryNode } from '../../engine/story/storyTypes';

const SCENE = 'bk';
const TEGANG = 'ra-tegang-bk';

function line(text: string, expression: StoryLine['expression'], cue: string, aside?: string): StoryLine {
  return { text, expression, cue, ...(aside ? { aside } : {}) };
}

export const MHS01_BK_EKSPLORASI_NODES: StoryNode[] = [
  {
    id: 'ra-b0',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: line(
      'Nah, ini ruangannya. Rapi ya. Aku udah kosongin jadwal sampai jam tiga, jadi waktunya cukup banget.',
      'tersenyum',
      'Raka duduk tegak dengan daftar terlipat di saku kemeja, dan matanya sempat singgah ke jam dinding.',
    ),
    choices: [
      {
        id: 'a', skillId: 'batas-kerahasiaan', best: true, next: 'ra-b2',
        text: 'Ceritamu tetap di antara kita ya, kecuali ada hal yang membahayakan keselamatanmu.',
        reaction: { text: 'Oh, jadi aman ya. Jujurly itu bikin aku lebih santai ngomongnya.', expression: 'lega', cue: 'Raka menyandarkan punggung ke kursi untuk pertama kalinya.' },
      },
      {
        id: 'b', skillId: 'sapaan-hangat', next: 'ra-b2',
        text: 'Makasih sudah meluangkan waktu, Raka. Silakan duduk senyamanmu, santai aja.',
        reaction: { text: 'Makasih, Bu. Aku duduk di sini aja, kursinya pas kok.', expression: 'tersenyum', cue: 'Raka duduk dan meluruskan lipatan daftar di pangkuannya.' },
      },
      {
        id: 'c', skillId: 'pertanyaan-terbuka', next: 'ra-b2',
        text: 'Kira-kira, apa yang kamu harapkan dari obrolan kita hari ini?',
        reaction: { text: 'Harapanku? Pengennya nemu cara biar jadwal tim nggak gampang geser, sih.', expression: 'netral', cue: 'Raka berpikir sebentar sambil menghitung dengan jarinya.' },
      },
      {
        id: 'd', skillId: 'interogasi', next: TEGANG,
        text: 'Kenapa tadi di lab kamu terus lihat jam? Jawab yang jujur.',
      },
    ],
  },
  {
    id: 'ra-b2',
    sceneId: SCENE,
    stage: 'eksplorasi',
    depth: 0,
    reply: line(
      'Aku koordinator proyek IoT, anggotanya lima orang. Prototipe harus jadi tiga minggu lagi. Tiap pagi kubuat daftar, tapi sorenya selalu aja ada yang geser.',
      'netral',
      'Raka berbicara cepat dan runtut sambil menghitung dengan jari, lalu berhenti sebentar di jari yang kelima.',
    ),
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'ra-b4',
        text: 'Pas sore daftarnya bergeser, biasanya kamu ngerasain apa?',
        reaction: { text: 'Pas sore itu? Hm, campur kesel dan buru-buru ngitung ulang, sih.', expression: 'netral', cue: 'Raka berpikir sebentar, jarinya mengetuk lutut.' },
      },
      {
        id: 'b', skillId: 'validasi-normalisasi', next: 'ra-b4',
        text: 'Mimpin lima orang dengan tenggat dekat memang nguras tenaga dan pikiran banget.',
        reaction: { text: 'Iya kan? Lima orang itu nggak gampang diatur, hehe. Makasih udah ngerti.', expression: 'tersenyum', cue: 'Raka tertawa kecil dan mengangguk beberapa kali.' },
      },
      {
        id: 'c', skillId: 'pertanyaan-tertutup', next: 'ra-b4',
        text: 'Jadi masalah utamanya cuma jadwal yang sering meleset, kan?',
        reaction: line(
          'Kurang lebih sih, ya. Intinya soal waktu.',
          'netral',
          'Raka mengangguk cepat dan merapikan lipatan daftarnya.',
        ),
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: TEGANG,
        text: 'Pakai saja aplikasi pengatur proyek. Itu langsung menyelesaikan semuanya.',
      },
    ],
  },
  {
    id: 'ra-b4',
    sceneId: SCENE,
    stage: 'eksplorasi',
    depth: 1,
    reply: line(
      'Ini jadwal mingguanku. Kolom istirahatnya sengaja kubuat, tapi... kosong terus, jujurly. Bagian paling banyak itu debug, soalnya aku yang paling cepat nemuin kerusakannya.',
      'tertegun',
      'Raka membentangkan kertas yang penuh warna dan menunjuk kolom paling kanan yang tak terisi, lalu menarik tangannya kembali.',
      'Di kertas itu, hampir setiap sel diwarnai, dan nama Raka muncul di hampir semua baris.',
    ),
    marks: ['kejutan', 'isyarat-nonverbal'],
    choices: [
      {
        id: 'a', skillId: 'jeda-hening', best: true, next: 'ra-b5',
        text: 'Aku dengerin kok. Jelaskan jadwal ini dengan caramu sendiri, nggak usah buru-buru.',
        reaction: { text: 'Oke, aku jelasin ya. Pelan-pelan dulu, soalnya kolomnya banyak.', expression: 'netral', cue: 'Raka menarik napas lalu meluruskan kertas di meja.' },
      },
      {
        id: 'b', skillId: 'sampaikan-pengamatan', next: 'ra-b5',
        options: { observationTone: 'faktual' },
        text: 'Namamu ada di hampir semua baris, dan kolom istirahatnya masih kosong.',
        reaction: { text: 'Iya, namaku di mana-mana ya. Kolom istirahat itu belum sempat kuisi aja.', expression: 'menunduk', cue: 'Raka menatap kolom kosong itu, lalu mengusap pinggir kertas.' },
      },
      {
        id: 'c', skillId: 'janji-mutlak', next: 'ra-b5',
        text: 'Serahin jadwal ini ke aku, dijamin semuanya beres minggu depan.',
        reaction: line(
          'Eh, jangan deh. Ini tanggung jawabku, biar aku aja yang pegang.',
          'waspada',
          'Raka cepat melipat kertasnya dan menaruhnya di pangkuan.',
        ),
      },
      {
        id: 'd', skillId: 'interogasi', next: TEGANG,
        text: 'Kenapa semua kamu kerjain sendiri? Anggota lain ngapain?',
      },
    ],
  },
  {
    id: 'ra-b5',
    sceneId: SCENE,
    stage: 'eksplorasi',
    depth: 1,
    reply: line(
      'Kalau ada yang molor, itu pasti gara-gara aku salah hitung. Mereka kan udah percaya banget sama jadwalku.',
      'cemas',
      'Raka menekan lipatan kertas dengan ibu jari, lalu melirik jam dinding sekali lagi.',
    ),
    choices: [
      {
        id: 'a', skillId: 'refleksi-perasaan', best: true, next: 'ra-b6',
        options: { reflectionNuance: 'tertekan-cemas' },
        text: 'Kedengarannya beban tim terasa di pundakmu semua, dan itu bikin cemas.',
        reaction: { text: 'Iya, tepat. Pundakku emang berasa berat, literally.', expression: 'cemas', cue: 'Raka memegang bahunya sendiri sambil tersenyum tipis.' },
      },
      {
        id: 'b', skillId: 'pertanyaan-terbuka', next: 'ra-b6',
        text: 'Kalau jadwalnya meleset, kamu ngebayangin apa yang bakal terjadi?',
        reaction: { text: 'Kalau meleset, ya semua ikut mundur. Kebayang aja udah bikin gelisah.', expression: 'cemas', cue: 'Raka melirik jam dinding lalu menarik napas pendek.' },
      },
      {
        id: 'c', skillId: 'refleksi-perasaan', next: 'ra-b6',
        options: { reflectionNuance: 'kecewa-kesal', reflectionCorrectOverride: false },
        text: 'Kamu pasti kesal pada anggota tim yang suka molor.',
        reaction: line(
          'Bukan mereka sih. Aku lebih kesel ke diriku sendiri, jujurly.',
          'menunduk',
          'Raka menggeleng dan tersenyum getir.',
        ),
      },
      {
        id: 'd', skillId: 'meremehkan', next: 'ra-b6',
        text: 'Molor dikit itu biasa di proyek mahasiswa. Nggak usah dipikirin.',
        reaction: line(
          'Iya sih, mungkin juga.',
          'menutup-diri',
          'Raka mengangguk sopan, tetapi jarinya berhenti bergerak di atas kertas.',
        ),
      },
    ],
  },
];
