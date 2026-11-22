/**
 * Cerita Kevin Gunawan (mhs-04), adegan Ruang BK bagian eksplorasi: simpul ke-b0, ke-b2, ke-b4, ke-b5.
 * Tujuan di luar berkas ini: ke-b6 (bk-pemahaman) dan ke-tegang-bk (bk-rencana).
 * Dirakit di mhs-04.ts. Seluruh teks Bahasa Indonesia, tanpa Istilah_Diagnosis.
 */
import type { StoryLine, StoryNode } from '../../engine/story/storyTypes';

const SCENE = 'bk';
const TEGANG = 'ke-tegang-bk';

function line(text: string, expression: StoryLine['expression'], cue: string, aside?: string): StoryLine {
  return { text, expression, cue, ...(aside ? { aside } : {}) };
}

export const MHS04_BK_EKSPLORASI_NODES: StoryNode[] = [
  {
    id: 'ke-b0',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: line(
      'Jadi ini ruangannya. Oke. Silakan mulai, saya mau tahu Dosen sebenarnya mau apa.',
      'waspada',
      'Kevin menarik kursi, duduk tegak dengan tangan terlipat, dan memeriksa ruangan seperti memeriksa sebuah sistem.',
    ),
    choices: [
      {
        id: 'a', skillId: 'batas-kerahasiaan', best: true, next: 'ke-b2',
        text: 'Yang kamu ceritakan tetap di sini, kecuali menyangkut keselamatanmu. Itu batasnya.',
        reaction: {
          text: 'Oke, batasnya jelas. Jadi saya langsung aja: standar saya bukan berlebihan, tapi di tim saya disebut galak.',
          expression: 'netral',
          cue: 'Kevin mengangguk, tangannya yang terlipat sedikit turun ke pangkuan.',
        },
      },
      {
        id: 'b', skillId: 'sapaan-hangat', next: 'ke-b2',
        text: 'Makasih sudah mau datang, Kevin. Duduk di posisi yang paling nyaman aja.',
        reaction: {
          text: 'Posisi nyaman? Ya sudah, di sini aja. Tapi saya tetap nggak ngerti kenapa di tim saya disebut galak, padahal standar saya wajar.',
          expression: 'waspada',
          cue: 'Kevin menarik kursi sedikit dan duduk tegak, matanya masih menyapu ruangan.',
        },
      },
      {
        id: 'c', skillId: 'pertanyaan-terbuka', next: 'ke-b2',
        text: 'Menurutmu, apa yang sebenarnya terjadi di tim belakangan ini?',
        reaction: {
          text: 'Di tim? Mereka bilang saya galak. Padahal standar saya bukan berlebihan, kode asal jalan itu utang, jujurly.',
          expression: 'kesal',
          cue: 'Kevin menjawab cepat dan rapi, ibu jarinya menekan ruas jari lain.',
        },
      },
      {
        id: 'd', skillId: 'interogasi', next: TEGANG,
        text: 'Kenapa temanmu sampai mengeluh soal kamu? Jawab langsung aja.',
      },
    ],
  },
  {
    id: 'ke-b2',
    sceneId: SCENE,
    stage: 'eksplorasi',
    depth: 0,
    reply: line(
      'Standar saya bukan berlebihan. Kode yang asal jalan itu utang, dan yang nagih nanti orang lain. Tapi di tim saya disebut galak, jujurly.',
      'kesal',
      'Kevin berbicara cepat dan rapi seperti membacakan spesifikasi; ibu jarinya menekan ruas jari lain dengan keras.',
    ),
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'ke-b4',
        text: 'Waktu kode temanmu nggak sesuai standar, apa yang muncul di dalam dirimu?',
        reaction: {
          text: 'Kesel dulu, jujurly. Terus saya benerin sendiri aja, lebih cepat. Nih, diff yang kemarin saya tolak, tiga fungsi saya tulis ulang.',
          expression: 'kesal',
          cue: 'Kevin memutar laptop ke arah Dosen dan menunjuk satu diff yang penuh coretan.',
          aside: 'Di layar terlihat tiga fungsi yang dikerjakan ulang, lengkap dengan stempel waktu pukul 02.14.',
        },
      },
      {
        id: 'b', skillId: 'refleksi-perasaan', next: 'ke-b4',
        options: { reflectionNuance: 'tertekan-cemas' },
        text: 'Kedengarannya kamu cemas kalau satu celah kecil bisa merugikan semua.',
        reaction: {
          text: 'Cemas... bisa dibilang begitu. Satu celah lolos, yang kena orang lain. Makanya diff ini saya tulis ulang sendiri sampai jam dua pagi.',
          expression: 'lelah',
          cue: 'Kevin terdiam sebentar, lalu memutar laptopnya ke arah Dosen.',
          aside: 'Di layar terlihat tiga fungsi yang dikerjakan ulang, lengkap dengan stempel waktu pukul 02.14.',
        },
      },
      {
        id: 'c', skillId: 'pertanyaan-tertutup', next: 'ke-b4',
        text: 'Jadi menurutmu semua temanmu memang kurang teliti?',
        reaction: line(
          'Nggak semua. Tapi cukup banyak.',
          'kesal',
          'Kevin mendengus pendek dan mengalihkan pandangan ke jendela.',
        ),
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: TEGANG,
        text: 'Turunin aja standarmu sedikit. Tim nggak sesempurna kamu.',
      },
    ],
  },
  {
    id: 'ke-b4',
    sceneId: SCENE,
    stage: 'eksplorasi',
    depth: 1,
    reply: line(
      'Ini diff yang kemarin saya tolak. Tiga fungsi saya tulis ulang sendiri sampai jam dua pagi, soalnya nggak enak minta dia ulangi.',
      'lelah',
      'Kevin memutar laptopnya ke arah Dosen, lalu mengusap wajah dengan kedua telapak tangan.',
      'Di layar terlihat tiga fungsi yang dikerjakan ulang, lengkap dengan stempel waktu pukul 02.14.',
    ),
    marks: ['kejutan', 'isyarat-nonverbal'],
    choices: [
      {
        id: 'a', skillId: 'sampaikan-pengamatan', best: true, next: 'ke-b5',
        options: { observationTone: 'faktual' },
        text: 'Kamu nunjukin layar ini sambil mengusap wajah. Kerja jam dua pagi itu berat.',
        reaction: {
          text: 'Iya, jam dua pagi itu capek. Tapi pilihannya apa? Kalau saya diam, rilis bocor. Kalau saya bicara, saya yang dibilang masalah.',
          expression: 'lelah',
          cue: 'Kevin mengusap wajah dan mengangguk pelan tanpa membantah.',
        },
      },
      {
        id: 'b', skillId: 'afirmasi-kekuatan', next: 'ke-b5',
        text: 'Nulis ulang tiga fungsi sampai tuntas, itu tanggung jawab yang besar.',
        reaction: {
          text: 'Tanggung jawab, ya. Masalahnya nggak ada yang lihat kerja jam dua pagi itu. Kalau saya diam rilis bocor, kalau bicara saya dibilang masalah.',
          expression: 'lelah',
          cue: 'Kevin menarik napas panjang dan menatap layar, bahunya sedikit turun.',
        },
      },
      {
        id: 'c', skillId: 'janji-mutlak', next: 'ke-b5',
        text: 'Mulai sekarang timmu pasti ngerti. Saya jamin semuanya membaik.',
        reaction: line(
          'Jangan janji hal yang nggak bisa Dosen kontrol.',
          'waspada',
          'Kevin menutup laptopnya dengan satu gerakan dan melipat tangan.',
        ),
      },
      {
        id: 'd', skillId: 'interogasi', next: TEGANG,
        text: 'Kenapa nggak minta dia benerin sendiri? Alasan sebenarnya apa?',
      },
    ],
  },
  {
    id: 'ke-b5',
    sceneId: SCENE,
    stage: 'eksplorasi',
    depth: 1,
    reply: line(
      'Kalau saya diam, rilis bocor. Kalau saya bicara, saya yang dibilang masalah. Capek banget sumpah kalau selalu begitu.',
      'lelah',
      'Kevin menyandarkan kepala sebentar ke sandaran kursi, lalu menegakkan badan lagi seakan tidak terjadi apa-apa.',
    ),
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'ke-b6',
        text: 'Waktu dibilang masalah, apa yang kamu katakan pada dirimu sendiri?',
        reaction: {
          text: 'Ke diri sendiri? Bukan salah saya kalau standarnya begini. Tapi kalau itu benar, kenapa rasanya salah juga? Mereka bilang saya keras.',
          expression: 'lelah',
          cue: 'Kevin menatap meja, jarinya berhenti mengetuk.',
        },
      },
      {
        id: 'b', skillId: 'validasi-normalisasi', next: 'ke-b6',
        text: 'Jaga mutu sendirian memang melelahkan. Wajar banget kalau kamu capek.',
        reaction: {
          text: 'Capek, iya. Soalnya nggak ada yang ikut jaga. Mereka bilang saya keras, padahal saya cuma mau kode yang nggak bikin orang begadang.',
          expression: 'lelah',
          cue: 'Kevin mengembuskan napas dan bahunya turun sedikit.',
        },
      },
      {
        id: 'c', skillId: 'refleksi-perasaan', next: 'ke-b6',
        options: { reflectionNuance: 'kecewa-kesal', reflectionCorrectOverride: false },
        text: 'Kamu pasti marah banget sama timmu yang nggak mau berubah.',
        reaction: line(
          'Bukan marah. Saya cuma takut hasil kerja kami jebol.',
          'cemas',
          'Kevin menggeleng pelan, nada bicaranya turun.',
        ),
      },
      {
        id: 'd', skillId: 'meremehkan', next: 'ke-b6',
        text: 'Semua tim pernah cekcok. Itu biasa aja, nggak usah dipikirin.',
        reaction: line(
          'Mungkin buat Dosen biasa.',
          'menutup-diri',
          'Kevin mengangkat bahu singkat dan menatap meja.',
        ),
      },
    ],
  },
];
