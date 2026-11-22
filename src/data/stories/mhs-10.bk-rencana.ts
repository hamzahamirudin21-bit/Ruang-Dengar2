/**
 * Cerita Teguh Santosa (mhs-10), adegan Ruang BK bagian rencana dan Ketegangan.
 *
 * Simpul: te-b13 (langkah kecil: sesi uji tiruan mingguan sesuai pilihannya), te-b14 (penutup sesi dan
 * janji tindak lanjut), te-tegang-bk (Ketegangan awal, jenis `menarik-diri`, dipakai sebagai
 * `tensionFallbackNodeId`), te-perbaikan-bk (hub perbaikan).
 *
 * Hub perbaikan memakai rute `@resume` bila keretakan sudah nonaktif.
 */
import type { StoryChoice, StoryNode, StoryRoute } from '../../engine/story/storyTypes';

const SCENE = 'bk';

const RESUME_WHEN_REPAIRED: StoryRoute[] = [
  { when: [{ type: 'tension', active: false }], next: '@resume' },
];

const TE_B13: StoryNode = {
  id: 'te-b13',
  sceneId: SCENE,
  stage: 'rencana',
  depth: 1,
  reply: {
    text:
      'Kalau boleh, tiap Rabu sore dua puluh menit di gudang. Aku jelasin langkah kalibrasi, Ibu mencatat bagian yang kurang. ' +
      'Satu hal lagi: ke Bagas kukirim pesan pendek, bahwa aku nggak menolaknya, cuma belajar sendiri dulu.',
    expression: 'netral',
    cue: 'Teguh menulis "Rabu 15.30" di halaman kosong buku sakunya, lalu merobek sudutnya dan menaruhnya di dekat gelas Dosen.',
  },
  choices: [
    {
      id: 'a',
      skillId: 'parafrase-ringkasan',
      text: 'Jadi Rabu sore dua puluh menit di gudang, dan satu pesan pendek untuk Bagas. Sudah tepat?',
      reaction: {
        text: 'Tepat, Bu. Cuma satu permintaan: soal kantin kemarin, tolong jangan sampai ke teman-teman. Dan Rabu depan, kita mulai?',
        expression: 'netral',
        cue: 'Teguh berdiri, menyerahkan serbet segitiga tadi sebagai tanda terima kasih kecil, lalu menunggu jawaban sambil memegang botol minumnya.',
      },
      next: 'te-b14',
      best: true,
      setFlags: ['langkah-kecil'],
    },
    {
      id: 'b',
      skillId: 'validasi-normalisasi',
      text: 'Rencana itu cocok banget dengan caramu bekerja. Pesan untuk Bagas pun sederhana.',
      reaction: {
        text: 'Iya, makanya aku nyaman. Oh ya, Bu, soal kantin kemarin itu tolong jangan sampai ke teman-teman. Rabu depan kita mulai ya?',
        expression: 'lega',
        cue: 'Teguh berdiri, meletakkan serbet segitiga di dekat gelas Dosen, lalu menggenggam botol minumnya.',
      },
      next: 'te-b14',
      setFlags: ['langkah-kecil'],
    },
    {
      id: 'c',
      skillId: 'nasihat-dini',
      text: 'Tambah dua sesi belajar kelompok juga, biar sekalian kamu terbiasa.',
      next: 'te-b14',
      reaction: {
        text: 'Dua sesi kelompok? Itu justru mengurangi waktu kalibrasiku.',
        expression: 'waspada',
        cue: 'Teguh menarik kembali sobekan kertas dari dekat gelas Dosen dan melipatnya kecil.',
      },
    },
    {
      id: 'd',
      skillId: 'janji-mutlak',
      text: 'Setelah ini temanmu pasti paham, dan kamu pasti lulus ujian.',
      next: 'te-b14',
      reaction: {
        text: 'Kita belum tahu soal itu, Bu. Tapi niatnya kuhargai.',
        expression: 'netral',
        cue: 'Teguh tersenyum samar sambil menggeleng sangat pelan.',
      },
    },
  ],
};

const TE_B14: StoryNode = {
  id: 'te-b14',
  sceneId: SCENE,
  stage: 'rencana',
  depth: 1,
  reply: {
    text:
      'Makasih udah nggak memaksaku apa-apa. Soal kantin kemarin, tolong jangan sampai ke teman-teman ya. ' +
      'Dan Rabu depan, kita mulai?',
    expression: 'lega',
    cue: 'Teguh berdiri, menyerahkan serbet segitiga tadi sebagai tanda terima kasih kecil, lalu menunggu jawaban sambil memegang botol minumnya.',
  },
  choices: [
    {
      id: 'a',
      skillId: 'afirmasi-kekuatan',
      text: 'Kamu menata belajarmu dengan jernih. Rabu depan aku datang ke gudang.',
      reaction: {
        text: 'Makasih, Bu, aku tunggu hari Rabu. Eh, lihat pintunya. Kertas itu kutempel Senin: "Sedang kalibrasi, ketuk dua kali". Kemarin Bagas beneran ngetuk dua kali, terus pergi gitu aja.',
        expression: 'tersenyum',
        cue: 'Teguh berdiri di ambang pintu gudang dengan bahu santai, dan menunjuk kertas tulisan tangan yang menempel miring di daun pintu.',
        aside: 'Beberapa hari kemudian. Di lantai depan pintu gudang tergeletak gelas teh kertas yang masih hangat.',
      },
      next: 'te-f0',
      best: true,
      action: { kind: 'janji', dueDayOffset: 4 },
    },
    {
      id: 'b',
      skillId: 'batas-kerahasiaan',
      text: 'Soal kantin tetap di antara kita, kecuali menyangkut keselamatanmu.',
      reaction: {
        text: 'Oke, Bu, itu cukup buatku. Nah, lihat pintunya. Kertas "ketuk dua kali" itu kutempel Senin, dan kemarin Bagas beneran ngetuk dua kali, lalu pergi tanpa bilang apa-apa.',
        expression: 'tersenyum',
        cue: 'Teguh berdiri di ambang pintu gudang dengan bahu santai, lalu menunjuk kertas yang menempel miring di daun pintu.',
        aside: 'Beberapa hari kemudian. Sebuah gelas teh kertas yang masih hangat terletak di lantai depan pintu gudang.',
      },
      next: 'te-f0',
    },
    {
      id: 'c',
      skillId: 'janji-mutlak',
      text: 'Aku jamin tidak ada lagi yang akan bilang kamu sombong.',
      next: 'te-f0',
      reaction: {
        text: 'Wah, kalau itu susah dijamin. Aku catat aja niat baiknya.',
        expression: 'waspada',
        cue: 'Teguh tertawa pendek dan memasukkan botol minum ke tasnya.',
      },
    },
    {
      id: 'd',
      skillId: 'pertanyaan-tertutup',
      text: 'Jadi sekarang kamu sudah tidak ragu lagi, kan?',
      next: 'te-f0',
      reaction: {
        text: 'Belum sepenuhnya sih. Tapi cukup.',
        expression: 'netral',
        cue: 'Teguh menjawab pelan dan merapikan tali tasnya tanpa melihat ke arah Dosen.',
      },
    },
  ],
};

/** Ketegangan awal: Teguh mundur dengan sopan setelah kesalahan pemula di Ruang BK. */
const TE_TEGANG_BK: StoryNode = {
  id: 'te-tegang-bk',
  sceneId: SCENE,
  stage: 'eksplorasi',
  depth: 0,
  reply: {
    text: 'Oh, begitu. Iya, Bu. Mungkin cukup sampai sini, aku mau balik ke gudang.',
    expression: 'menutup-diri',
    cue: 'Teguh menutup tutup botol minumnya, menarik buku saku ke pangkuan, lalu memandang pintu, bukan Dosen.',
  },
  tension: { phase: 'awal', expectedKind: 'menarik-diri' },
  choices: [
    {
      id: 'a',
      skillId: 'sampaikan-pengamatan',
      text: 'Kalimatku tadi sepertinya membuatmu ingin kembali ke gudang. Aku mau dengar sisimu.',
      next: 'te-perbaikan-bk',
      best: true,
      action: { kind: 'akui-ketegangan' },
      options: { observationTone: 'faktual' },
    },
    {
      id: 'b',
      skillId: 'validasi-normalisasi',
      text: 'Boleh banget kalau kamu mau balik ke gudang. Kita bisa lanjut kapan aja.',
      next: 'te-tegang-bk',
      reaction: {
        text: 'Baik. Terima kasih, Bu.',
        expression: 'menutup-diri',
        cue: 'Teguh mengangguk sopan, tetapi tubuhnya tetap miring ke arah pintu.',
      },
    },
    {
      id: 'c',
      skillId: 'jeda-hening',
      text: 'Aku tunggu sebentar di sini.',
      next: 'te-tegang-bk',
      reaction: {
        text: '...',
        expression: 'menutup-diri',
        cue: 'Teguh membuka dan menutup resleting tasnya tanpa suara.',
      },
    },
    {
      id: 'd',
      skillId: 'nasihat-dini',
      text: 'Jangan kabur begitu. Belajar menghadapi orang lain biar nggak menyendiri terus.',
      next: 'te-tegang-bk',
      reaction: {
        text: 'Iya, Bu. Kuingat.',
        expression: 'menutup-diri',
        cue: 'Teguh menegakkan punggung dengan sopan, tetapi senyumnya hilang sepenuhnya.',
      },
    },
  ],
};

function repairChoices(): StoryChoice[] {
  return [
    {
      id: 'a',
      skillId: 'validasi-normalisasi',
      text: 'Maaf, ucapanku tadi terdengar menghakimi pilihanmu. Dampaknya nyata, dan aku mengakuinya.',
      next: 'te-perbaikan-bk',
      best: true,
      action: { kind: 'perbaikan', step: 'akui-dampak' },
      routes: RESUME_WHEN_REPAIRED,
      reaction: {
        text: 'Makasih, Bu. Aku nggak jadi ingin pergi.',
        expression: 'lega',
        cue: 'Teguh menaruh botol minumnya kembali ke tengah meja dan menghela napas panjang.',
      },
    },
    {
      id: 'b',
      skillId: 'pertanyaan-terbuka',
      text: 'Kalau boleh, ceritakan apa yang kamu rasakan waktu mendengar kalimatku tadi.',
      next: 'te-perbaikan-bk',
      action: { kind: 'perbaikan', step: 'eksplorasi-perasaan' },
      routes: RESUME_WHEN_REPAIRED,
      reaction: {
        text: 'Rasanya kayak diminta berubah, padahal aku merasa nggak lagi rusak.',
        expression: 'menunduk',
        cue: 'Teguh berbicara pelan, ibu jarinya menggosok sampul buku saku berulang kali.',
      },
    },
    {
      id: 'c',
      skillId: 'jeda-hening',
      text: 'Kita bisa lanjut pelan, ganti topik, atau berhenti. Kamu yang pilih.',
      next: 'te-perbaikan-bk',
      action: { kind: 'perbaikan', step: 'beri-pilihan' },
      routes: RESUME_WHEN_REPAIRED,
    },
    {
      id: 'd',
      skillId: 'nasihat-dini',
      text: 'Sudahlah, lupakan aja. Yang penting kamu mau coba lebih terbuka.',
      next: 'te-perbaikan-bk',
      reaction: {
        text: 'Baik, Bu.',
        expression: 'menutup-diri',
        cue: 'Teguh mengangguk singkat dan kembali memandang pintu.',
      },
    },
  ];
}

/** Hub perbaikan: tiga langkah perbaikan dan satu opsi keliru (empat pilihan). */
const TE_PERBAIKAN_BK: StoryNode = {
  id: 'te-perbaikan-bk',
  sceneId: SCENE,
  stage: 'eksplorasi',
  depth: 0,
  reply: {
    text: 'Aku masih mau lanjut kok. Asal kita nggak bahas soal harus berubah dulu.',
    expression: 'waspada',
    cue: 'Teguh kembali duduk menghadap Dosen, tetapi tangannya masih memegang tali tas.',
  },
  tension: { phase: 'perbaikan', expectedKind: 'menarik-diri' },
  choices: repairChoices(),
};

export const TE_BK_RENCANA_NODES: StoryNode[] = [TE_B13, TE_B14, TE_TEGANG_BK, TE_PERBAIKAN_BK];

export const TE_TENSION_FALLBACK_NODE_ID = 'te-tegang-bk';
