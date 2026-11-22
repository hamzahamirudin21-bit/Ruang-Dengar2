/**
 * Cerita Sari Melati (mhs-12), adegan Ruang BK bagian eksplorasi: simpul s-b0, s-b1, s-b2, s-b4 (empat giliran).
 * Tujuan di luar berkas ini: s-b6 (bk-pemahaman) dan s-tegang-bk (bk-rencana).
 * Dirakit di mhs-12.ts. Seluruh teks Bahasa Indonesia, tanpa Istilah_Diagnosis.
 */
import type { StoryLine, StoryNode } from '../../engine/story/storyTypes';

const SCENE = 'bk';
const TEGANG = 's-tegang-bk';

function line(text: string, expression: StoryLine['expression'], cue: string, aside?: string): StoryLine {
  return { text, expression, cue, ...(aside ? { aside } : {}) };
}

export const MHS12_BK_EKSPLORASI_NODES: StoryNode[] = [
  {
    id: 's-b0',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: line(
      'Wah, adem banget di sini, jujurly. Boleh numpang tidur nih, mager banget, hehe.',
      'tersenyum',
      'Sari menjatuhkan diri ke kursi sambil tertawa, sementara ponsel di sakunya bergetar terus.',
    ),
    choices: [
      {
        id: 'a', skillId: 'sapaan-hangat', best: true, next: 's-b1',
        text: 'Duduk yang nyaman aja ya, Sari. Makasih sudah mau meluangkan waktu.',
        reaction: {
          text: 'Sama-sama, hehe. Eh, bentar ya, ponselku bunyi terus nih. Aku matiin notifikasinya dulu, biar bisa santai seperempat jam.',
          expression: 'netral',
          cue: 'Sari mengeluarkan ponsel, membuka pengaturan, dan mematikan notifikasi dengan satu tekanan cepat.',
          aside: 'Di layar ponselnya sempat terlihat empat belas pesan grup yang belum terbaca.',
        },
      },
      {
        id: 'b', skillId: 'batas-kerahasiaan', next: 's-b1',
        text: 'Obrolan kita nggak dibawa ke kelompok mana pun, kecuali keselamatanmu terancam.',
        reaction: {
          text: 'Oke deh, aman ya. Eh, bentar, aku matiin notifikasi dulu biar nggak gangguin. Biar santuy seperempat jam.',
          expression: 'netral',
          cue: 'Sari merogoh ponsel dari saku, menekan satu tombol pengaturan dengan cepat.',
          aside: 'Layar ponselnya sempat menyala dan memperlihatkan empat belas pesan grup yang belum terbaca.',
        },
      },
      {
        id: 'c', skillId: 'pertanyaan-tertutup', next: 's-b1',
        text: 'Kamu kelihatan capek ya? Kurang tidur?',
        reaction: line(
          'Hehe, enggak kok. Biasa aja.',
          'tersenyum',
          'Sari mengibaskan tangan, senyumnya tetap lebar.',
        ),
      },
      {
        id: 'd', skillId: 'meremehkan', next: TEGANG,
        text: 'Ah, kamu kan anak yang selalu ceria. Pasti tidak ada apa-apa.',
      },
    ],
  },
  {
    id: 's-b1',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: line(
      'Bentar ya, aku matiin notifikasinya dulu. Biar santuy lima belas menit.',
      'netral',
      'Sari mengeluarkan ponsel, membuka pengaturan, dan menekan satu tombol dengan cepat.',
      'Layar ponselnya sempat menyala: empat belas pesan grup belum terbaca.',
    ),
    marks: ['kejutan'],
    choices: [
      {
        id: 'a', skillId: 'validasi-normalisasi', best: true, next: 's-b2',
        text: 'Wajar kok kalau kamu butuh tenang dulu. Silakan, aku tunggu.',
        reaction: {
          text: 'Makasih. Ya, jujurly aku emang agak capek sih, dikit. Tapi ya namanya juga jadi orang yang bisa diandalkan, hehe.',
          expression: 'lelah',
          cue: 'Sari tertawa kecil, lalu bersandar dan menghembuskan napas panjang.',
        },
      },
      {
        id: 'b', skillId: 'sampaikan-pengamatan', next: 's-b2',
        options: { observationTone: 'faktual' },
        text: 'Aku lihat banyak pesan masuk, dan kamu matiin notifikasinya sebelum kita ngobrol.',
        reaction: {
          text: 'Hehe, ketahuan. Banyak sih, itu aja belum semuanya. Capek dikit, jujurly, tapi ya gitu, namanya juga orang yang bisa diandalkan.',
          expression: 'lelah',
          cue: 'Sari menyimpan ponsel dengan layar menghadap ke bawah, lalu tertawa kecil dan bersandar.',
        },
      },
      {
        id: 'c', skillId: 'afirmasi-kekuatan', next: 's-b2',
        text: 'Kamu berani ambil jeda buat dirimu sendiri. Itu nggak mudah lho.',
        reaction: {
          text: 'Hehe, iya sih nggak gampang. Biasanya aku nggak sempat kayak gini. Capek dikit sih, tapi ya, risiko jadi orang yang bisa diandalkan.',
          expression: 'lelah',
          cue: 'Sari menunduk sebentar, tertawa kecil, lalu bersandar dan menghembuskan napas.',
        },
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: TEGANG,
        text: 'Sebaiknya kamu keluar saja dari grup yang bikin ribut itu.',
      },
    ],
  },
  {
    id: 's-b2',
    sceneId: SCENE,
    stage: 'eksplorasi',
    depth: 1,
    reply: line(
      'Capek sih dikit... tapi ya, aku tuh risikonya jadi orang yang bisa diandalkan.',
      'lelah',
      'Sari tertawa kecil, lalu bersandar dan menghembuskan napas panjang.',
    ),
    choices: [
      {
        id: 'a', skillId: 'refleksi-perasaan', best: true, next: 's-b4',
        options: { reflectionNuance: 'lelah-kewalahan', reflectionCorrectOverride: true },
        text: 'Kamu lelah karena banyak yang bergantung padamu, tapi tetap tersenyum di depan mereka.',
        reaction: {
          text: 'Hehe, kamu nangkep banget. Iya, tiap hari ada aja yang bilang "Sar, tolong, Sar, tolong..." terus aku senyum aja. Namanya juga aku.',
          expression: 'lelah',
          cue: 'Sari tertawa, tetapi suaranya mengecil di akhir kalimat dan bahunya turun sekejap.',
        },
      },
      {
        id: 'b', skillId: 'validasi-normalisasi', next: 's-b4',
        text: 'Orang yang dipercaya banyak teman sering nanggung beban yang nggak kelihatan.',
        reaction: {
          text: 'Iya sih, nggak kelihatan ya. Tiap hari ada aja yang minta, "Sar, tolong", dan aku jawab, "Siap!" Ya gitu deh.',
          expression: 'lelah',
          cue: 'Sari tertawa kecil, tetapi bahunya turun dan pandangannya jatuh ke ponsel di pangkuan.',
        },
      },
      {
        id: 'c', skillId: 'afirmasi-kekuatan', next: 's-b4',
        setFlags: ['citra-diperkuat'],
        text: 'Kamu memang bintang lab. Semua orang percaya padamu dan menyukaimu.',
        reaction: line(
          'Ah, biasa aja kok. Hehe.',
          'tersenyum',
          'Sari tertawa cepat dan merapikan rambutnya, topengnya terasa makin rapat.',
        ),
      },
      {
        id: 'd', skillId: 'refleksi-perasaan', next: 's-b4',
        options: { reflectionNuance: 'kecewa-kesal', reflectionCorrectOverride: false },
        text: 'Kamu pasti kesal sekali pada teman yang selalu minta tolong.',
        reaction: line(
          'Eh, bukan kesal... mereka baik kok.',
          'waspada',
          'Sari menggeleng cepat, senyumnya mengencang.',
        ),
      },
    ],
  },
  {
    id: 's-b4',
    sceneId: SCENE,
    stage: 'eksplorasi',
    depth: 1,
    reply: line(
      'Hehe, tiap hari ada aja yang "Sar, tolong, Sar, tolong..." Ya... namanya juga aku.',
      'lelah',
      'Sari tertawa, tetapi suaranya mengecil di akhir kalimat dan bahunya turun sekejap.',
    ),
    marks: ['isyarat-nonverbal'],
    choices: [
      {
        id: 'a', skillId: 'sampaikan-pengamatan', best: true, next: 's-b6',
        options: { observationTone: 'faktual' },
        setFlags: ['pengamatan-peran'],
        text: 'Mereka noleh ke kamu tiap ada selisih. Tadi suaramu mengecil pas bilang "tolong".',
        reaction: {
          text: 'Hah? Suaraku mengecil? Nggak sadar, hehe. Mungkin iya, soalnya jujurly aku nggak pernah kepikiran berhenti nengahin. Belum pernah nyoba.',
          expression: 'cemas',
          cue: 'Sari tertawa pendek, lalu tangannya meremas ponsel yang layarnya gelap.',
        },
      },
      {
        id: 'b', skillId: 'validasi-normalisasi', next: 's-b6',
        text: 'Terus-terusan dimintai tolong bisa melelahkan, bahkan buat yang rela membantu.',
        reaction: {
          text: 'Iya, lumayan, hehe. Tapi mau gimana lagi, kalau bukan aku siapa. Berhenti nengahin pun belum pernah kucoba sih, jujurly.',
          expression: 'cemas',
          cue: 'Sari tertawa kecil, tetapi jarinya mengetuk-ngetuk sisi ponsel dengan gelisah.',
        },
      },
      {
        id: 'c', skillId: 'jeda-hening', next: 's-b6',
        text: 'Aku nggak buru-buru kok. Kamu boleh diam dulu kalau perlu.',
        reaction: line(
          'Hmm... iya.',
          'menunduk',
          'Sari menatap ponselnya yang gelap, tawanya sudah hilang.',
        ),
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: 's-b6',
        text: 'Mulai besok bilang saja tidak. Gampang, kan, tinggal menolak.',
        reaction: line(
          'Hehe, iya ya. Gampang banget kalau dibilangin.',
          'tersenyum',
          'Sari tertawa hambar, pandangannya berpindah ke jendela.',
        ),
      },
    ],
  },
];
