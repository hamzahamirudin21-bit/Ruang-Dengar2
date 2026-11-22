/**
 * Cerita Ayu Permata (mhs-05), adegan Ruang BK bagian eksplorasi: simpul ay-b0, ay-b2, ay-b4, ay-b5.
 * Tujuan di luar berkas ini: ay-b6 (bk-pemahaman) dan ay-tegang-bk (bk-rencana).
 * Dirakit di mhs-05.ts. Seluruh teks Bahasa Indonesia, tanpa Istilah_Diagnosis.
 */
import type { StoryLine, StoryNode } from '../../engine/story/storyTypes';

const SCENE = 'bk';
const TEGANG = 'ay-tegang-bk';

function line(text: string, expression: StoryLine['expression'], cue: string, aside?: string): StoryLine {
  return { text, expression, cue, ...(aside ? { aside } : {}) };
}

export const AYU_BK_EKSPLORASI_NODES: StoryNode[] = [
  {
    id: 'ay-b0',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: line(
      'Wah, tenang banget di sini, beda sama lab. Boleh aku taruh buku sketsa di meja? Biasanya aku mikir sambil corat-coret.',
      'tersenyum',
      'Ayu duduk menyamping di kursi, kakinya diayun pelan, dan buku sketsa sudah terbuka di pangkuannya sebelum Dosen menjawab.',
    ),
    choices: [
      {
        id: 'a', skillId: 'batas-kerahasiaan', best: true, next: 'ay-b2',
        text: 'Silakan. Ceritamu tetap di antara kita, kecuali menyangkut keselamatan.',
        reaction: {
          text: 'Oke, Bu, aman. Jadi gini: kemarin kakak tingkat cerita kerja di studio antarmuka, terus ada pameran tugas akhir interaktif. Aku pengin semuanya! Menurut Ibu pilih yang mana?',
          expression: 'tersenyum',
          cue: 'Ayu membuka buku sketsa dan menggoreskan satu garis cepat sambil bicara.',
        },
      },
      {
        id: 'b', skillId: 'sapaan-hangat', next: 'ay-b2',
        text: 'Tentu boleh, Ayu. Duduklah sesuka kamu dan corat-coret saja.',
        reaction: {
          text: 'Asyik, makasih, Bu! Aku corat-coret dulu ya. Jadi, kemarin kakak tingkat cerita soal studio antarmuka dan pameran interaktif, aku jadi pengin semuanya. Ibu pilih yang mana?',
          expression: 'tersenyum',
          cue: 'Ayu duduk bersila di kursi dan membuka buku sketsa ke halaman kosong.',
        },
      },
      {
        id: 'c', skillId: 'pertanyaan-terbuka', next: 'ay-b2',
        text: 'Boleh. Apa yang sedang kamu pikirkan akhir-akhir ini?',
        reaction: {
          text: 'Akhir-akhir ini kepikiran terus soal kerja di studio antarmuka yang diceritain kakak tingkat, plus pameran interaktif. Aku pengin semuanya, Bu! Ibu pilih yang mana?',
          expression: 'tersenyum',
          cue: 'Ayu mengetuk-ngetukkan pensil ke pipinya sambil tertawa kecil.',
        },
      },
      {
        id: 'd', skillId: 'interogasi', next: TEGANG,
        text: 'Taruh dulu bukunya. Sebenarnya kamu ke sini mau menyembunyikan apa?',
      },
    ],
  },
  {
    id: 'ay-b2',
    sceneId: SCENE,
    stage: 'eksplorasi',
    depth: 0,
    reply: line(
      'Jadi gini, Bu. Kemarin kakak tingkat cerita kerja di studio antarmuka, minggunya sebelumnya ada pameran tugas akhir interaktif. Aku jadi pengin ini, itu, semuanya! Kalau Ibu di posisiku, pilih yang mana?',
      'tersenyum',
      'Ayu bercerita sambil menggambar kotak-kotak layar di buku sketsa, lalu menatap Dosen dengan alis terangkat menunggu jawaban.',
    ),
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'ay-b4',
        text: 'Aku ingin tahu dulu: dari cerita-cerita itu, mana yang paling membuatmu berdebar?',
        reaction: {
          text: 'Yang paling bikin berdebar semuanya, Bu. Nih, folder portofolioku, ada tujuh proyek. Keren di awal, tapi belum ada yang benar-benar kuselesaikan.',
          expression: 'tertegun',
          cue: 'Ayu memutar laptop sedikit ke arah Dosen, senyumnya mengecil saat folder terbuka.',
          aside: 'Di tiap sketsa, sudut kanan bawah diberi angka kecil. Semuanya hanya berkisar di sekitar enam puluh persen.',
        },
      },
      {
        id: 'b', skillId: 'validasi-normalisasi', next: 'ay-b4',
        text: 'Wajar kalau semuanya terlihat menarik. Banyak orang di tahap ini merasa begitu.',
        reaction: {
          text: 'Iya, Bu, semuanya kelihatan menarik. Nih, folder portofolioku, ada tujuh proyek, tapi belum ada yang benar-benar kuselesaikan.',
          expression: 'tertegun',
          cue: 'Ayu membuka folder di layar dan menggulirnya perlahan.',
          aside: 'Di tiap sketsa, sudut kanan bawah diberi angka kecil. Semuanya hanya berkisar di sekitar enam puluh persen.',
        },
      },
      {
        id: 'c', skillId: 'pertanyaan-tertutup', next: 'ay-b4',
        text: 'Jadi intinya kamu mau jadi desainer antarmuka, bukan insinyur firmware?',
        reaction: line(
          'Hmm, kayaknya, tapi nggak sepenuhnya juga. Ya begitulah.',
          'netral',
          'Ayu mengetuk-ngetukkan pensil ke dagu, lalu mencoret kotak yang baru saja digambarnya.',
        ),
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: TEGANG,
        text: 'Pilih studio antarmuka saja. Itu paling cocok untukmu, jangan terlalu lama menimbang.',
      },
    ],
  },
  {
    id: 'ay-b4',
    sceneId: SCENE,
    stage: 'eksplorasi',
    depth: 1,
    reply: line(
      'Ini folder portofolioku. Ada tujuh proyek. Dashboard telemetri, aplikasi pengatur sensor, poster interaktif... semuanya keren di awal. Tapi, hmm, belum ada yang benar-benar kuselesaikan.',
      'tertegun',
      'Ayu membalik halaman buku sketsa hingga ke deretan tujuh gambar layar, lalu menutup yang paling bawah dengan telapak tangannya.',
      'Di tiap sketsa, sudut kanan bawah diberi angka kecil. Semuanya hanya berkisar di sekitar enam puluh persen.',
    ),
    marks: ['kejutan', 'isyarat-nonverbal'],
    choices: [
      {
        id: 'a', skillId: 'jeda-hening', best: true, next: 'ay-b5',
        text: 'Aku di sini, Ayu. Ceritakan folder itu dengan caramu, tanpa terburu-buru.',
        reaction: {
          text: 'Oke, Bu, kuceritain. Tiap ada ide baru yang lebih seru, yang lama kutinggal. Terus aku mikir, jangan-jangan aku nggak punya arah.',
          expression: 'cemas',
          cue: 'Ayu menarik napas dan membalik buku sketsa pelan, tidak berani menatap Dosen.',
        },
      },
      {
        id: 'b', skillId: 'sampaikan-pengamatan', next: 'ay-b5',
        options: { observationTone: 'faktual' },
        text: 'Ada tujuh sketsa, dan di setiap pojok angkanya tidak lebih dari enam puluh.',
        reaction: {
          text: 'Iya, Bu, banyak yang mentok di sekitar enam puluh persen. Tiap ada ide baru yang lebih seru, yang lama kutinggal. Jadi aku ragu, jangan-jangan nggak punya arah.',
          expression: 'cemas',
          cue: 'Ayu menutup sketsa paling bawah dengan telapak tangan dan tersenyum kaku.',
        },
      },
      {
        id: 'c', skillId: 'janji-mutlak', next: 'ay-b5',
        text: 'Serahkan saja semua ke aku. Aku jamin tiga bulan lagi semuanya selesai.',
        reaction: line(
          'Eh, nggak usah, Bu. Ini kan proyekku sendiri, aku cuma lagi mikir.',
          'waspada',
          'Ayu menarik buku sketsanya ke dada dan menyilangkan tangan di atasnya.',
        ),
      },
      {
        id: 'd', skillId: 'interogasi', next: TEGANG,
        text: 'Kenapa tidak ada satu pun yang selesai? Kamu malas atau tidak serius?',
      },
    ],
  },
  {
    id: 'ay-b5',
    sceneId: SCENE,
    stage: 'eksplorasi',
    depth: 1,
    reply: line(
      'Tiap kali ada ide baru yang lebih seru, yang lama kutinggal. Terus aku mikir, jangan-jangan aku nggak punya arah, cuma suka yang baru-baru aja.',
      'cemas',
      'Tawa Ayu mengecil di tengah kalimat, dan pensilnya berhenti di atas kertas tanpa menggambar apa-apa.',
    ),
    choices: [
      {
        id: 'a', skillId: 'refleksi-perasaan', best: true, next: 'ay-b6',
        options: { reflectionNuance: 'ragu-kurang-percaya' },
        text: 'Kamu bersemangat pada banyak hal, tapi diam-diam ragu apakah itu benar-benar arahmu.',
        reaction: {
          text: 'Tepat banget, Bu. Semangatku banyak, tapi kalau pilih satu, rasanya yang lain ketutup selamanya. Kalau salah pilih, aku takut nyesel.',
          expression: 'cemas',
          cue: 'Ayu mengangguk cepat lalu menggigit ujung pensilnya.',
        },
      },
      {
        id: 'b', skillId: 'pertanyaan-terbuka', next: 'ay-b6',
        text: 'Kalau tidak ada ide baru yang menggoda, apa yang terjadi pada proyek lama itu?',
        reaction: {
          text: 'Proyek lamanya ya... ketinggalan aja, Bu. Kalau aku pilih satu, yang lain kututup selamanya, terus nyesel kalau ternyata salah.',
          expression: 'cemas',
          cue: 'Ayu memandang halaman kosong sebentar sebelum menjawab pelan.',
        },
      },
      {
        id: 'c', skillId: 'refleksi-perasaan', next: 'ay-b6',
        options: { reflectionNuance: 'kecewa-kesal', reflectionCorrectOverride: false },
        text: 'Kamu pasti kesal pada dosen atau tim yang tidak membantu menyelesaikannya.',
        reaction: line(
          'Bukan, nggak ada yang salah kok. Aku lebih ke bingung sama diriku sendiri.',
          'menunduk',
          'Ayu menggeleng pelan sambil menggaruk tengkuknya.',
        ),
      },
      {
        id: 'd', skillId: 'meremehkan', next: 'ay-b6',
        text: 'Anak muda memang begitu. Tidak usah dibesar-besarkan, nanti juga ketemu sendiri.',
        reaction: line(
          'Hehe, iya sih mungkin.',
          'menutup-diri',
          'Ayu tersenyum sopan, tetapi menutup buku sketsanya dan meletakkannya di sisi kursi.',
        ),
      },
    ],
  },
];
