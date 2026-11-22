/**
 * Cerita Nisa Nurhaliza (mhs-13), adegan Ruang BK bagian rencana dan Ketegangan.
 *
 * Simpul: ni-b13 (langkah kecil: satu waktu istirahat dari mendengarkan), ni-b14 (penutup sesi dan janji
 * tindak lanjut), ni-tegang-bk (Ketegangan awal, jenis `menarik-diri`, dipakai sebagai
 * `tensionFallbackNodeId`), ni-perbaikan-bk (hub perbaikan).
 *
 * Hub perbaikan memakai rute `@resume` bila keretakan sudah nonaktif.
 */
import type { StoryChoice, StoryNode, StoryRoute } from '../../engine/story/storyTypes';

const SCENE = 'bk';

const RESUME_WHEN_REPAIRED: StoryRoute[] = [
  { when: [{ type: 'tension', active: false }], next: '@resume' },
];

const NI_B13: StoryNode = {
  id: 'ni-b13',
  sceneId: SCENE,
  stage: 'rencana',
  depth: 1,
  reply: {
    text:
      'Mungkin... Rabu malam, jam delapan sampai sembilan, aku senyapin hp dulu. Satu jam aja. ' +
      'Sebelumnya aku kabarin Fira sama Dimas, biar mereka nggak ngira aku ngilang.',
    expression: 'netral',
    cue: 'Nisa membuka halaman kosong di bukunya, menulis "Rabu 20.00" dengan pelan, lalu menatap tulisannya sendiri.',
  },
  choices: [
    {
      id: 'a',
      skillId: 'pertanyaan-terbuka',
      text: 'Selama satu jam itu, kamu pengin ngapain buat dirimu sendiri?',
      reaction: {
        text: 'Belum kepikiran sih, Bu. Mungkin duduk aja sambil minum teh, nggak ngapa-ngapain. Aneh ya? Makasih udah dengerin aku. Soal nangisku semalem, jangan sampai Fira tahu ya. Kita ketemu lagi nggak?',
        expression: 'cemas',
        cue: 'Nisa berdiri, memeluk buku kecilnya, dan sempat menoleh ke pintu seolah memastikan tidak ada yang menunggu di luar.',
      },
      next: 'ni-b14',
      best: true,
      setFlags: ['langkah-kecil'],
    },
    {
      id: 'b',
      skillId: 'parafrase-ringkasan',
      text: 'Jadi Rabu jam delapan hp disenyapin sejam, Fira dan Dimas dikabari dulu. Udah tepat?',
      reaction: {
        text: 'Tepat, Bu, itu rencananya. Makasih udah dengerin aku, rasanya aneh tapi enak. Soal nangisku semalem, tolong jangan sampai Fira tahu ya. Kita ketemu lagi nggak? Aku mau cerita hasilnya.',
        expression: 'cemas',
        cue: 'Nisa berdiri sambil memeluk buku kecilnya dan menoleh sekilas ke pintu sebelum kembali menatap Dosen.',
      },
      next: 'ni-b14',
      setFlags: ['langkah-kecil'],
    },
    {
      id: 'c',
      skillId: 'nasihat-dini',
      text: 'Senyapin aja hp-mu tiap malam, biar cepat terasa lega.',
      next: 'ni-b14',
      reaction: {
        text: 'Tiap malam? Aduh, aku pasti gelisah banget, Bu. Kalau ada yang butuh gimana?',
        expression: 'cemas',
        cue: 'Nisa memegang ponselnya erat-erat dan tertawa gugup.',
      },
    },
    {
      id: 'd',
      skillId: 'janji-mutlak',
      text: 'Teman-temanmu pasti paham. Aku jamin nggak ada yang bakal kecewa.',
      next: 'ni-b14',
      reaction: {
        text: 'Semoga ya, Bu. Tapi Ibu kan nggak bisa mastiin isi hati mereka.',
        expression: 'waspada',
        cue: 'Nisa tersenyum tipis, lalu mengetuk-ngetuk halaman bukunya dengan ujung pena.',
      },
    },
  ],
};

const NI_B14: StoryNode = {
  id: 'ni-b14',
  sceneId: SCENE,
  stage: 'rencana',
  depth: 1,
  reply: {
    text:
      'Makasih ya, Bu, udah dengerin aku. Rasanya aneh, tapi enak banget. ' +
      'Soal nangisku semalem, jangan sampai Fira tahu ya. Nanti kita ketemu lagi nggak? Aku mau cerita hasilnya.',
    expression: 'cemas',
    cue: 'Nisa berdiri, memeluk buku kecilnya, dan sempat menoleh ke pintu seolah memastikan tidak ada yang menunggu di luar.',
  },
  choices: [
    {
      id: 'a',
      skillId: 'afirmasi-kekuatan',
      text: 'Kamu mulai kasih ruang buat dirimu. Tiga hari lagi aku mampir ke lab, ya.',
      reaction: {
        text: 'Ibu beneran mampir! Makasih ya, Bu. Rabu kemarin aku beneran senyapin hp sejam. Pas kubuka, Fira cuma kirim stiker lucu, dan Dimas bilang, "Santai, Nis, besok aja." Aku sampai bengong.',
        expression: 'tersenyum',
        cue: 'Nisa duduk di meja diskusi tanpa buku kecil di tangannya, tertawa kecil, lalu bertanya kabar Dosen satu kali dan menunggu jawabannya.',
        aside: 'Beberapa hari kemudian, di lab. Buku kecil bergaris itu terbuka di meja diskusi, dan lembar terakhirnya sudah berisi satu baris tulisan.',
      },
      next: 'ni-f0',
      best: true,
      action: { kind: 'janji', dueDayOffset: 3 },
    },
    {
      id: 'b',
      skillId: 'batas-kerahasiaan',
      text: 'Ceritamu nggak sampai ke Fira, kecuali soal keselamatanmu. Pintu ini selalu terbuka.',
      reaction: {
        text: 'Makasih, Bu, aku jadi tenang. Dan ternyata Rabu kemarin hp-ku beneran kusenyapin sejam. Pas dibuka, Fira cuma kirim stiker, Dimas bilang, "Santai, Nis, besok aja." Aku bengong sendiri.',
        expression: 'tersenyum',
        cue: 'Nisa duduk di meja diskusi dengan tangan kosong, tertawa kecil, lalu menanyakan kabar Dosen dan menunggu jawabannya.',
        aside: 'Beberapa hari kemudian, di lab. Buku kecil bergaris itu terbuka di sudut meja diskusi, dan halaman terakhirnya kini punya satu baris tulisan.',
      },
      next: 'ni-f0',
    },
    {
      id: 'c',
      skillId: 'janji-mutlak',
      text: 'Aku jamin habis ini kamu nggak bakal terbebani cerita orang lagi.',
      next: 'ni-f0',
      reaction: {
        text: 'Wah, semoga ya, Bu. Aku catet dulu di buku.',
        expression: 'waspada',
        cue: 'Nisa mengangguk sopan, tetapi tidak jadi membuka bukunya.',
      },
    },
    {
      id: 'd',
      skillId: 'pertanyaan-tertutup',
      text: 'Jadi sekarang kamu udah ngerasa lebih baik, kan?',
      next: 'ni-f0',
      reaction: {
        text: 'Iya, Bu. Udah lebih baik kok. Makasih banyak ya.',
        expression: 'menutup-diri',
        cue: 'Nisa membungkuk sedikit dengan senyum sopan, lalu bergegas membuka pintu.',
      },
    },
  ],
};

/** Ketegangan awal: balasan langsung setelah kesalahan pemula di Ruang BK. */
const NI_TEGANG_BK: StoryNode = {
  id: 'ni-tegang-bk',
  sceneId: SCENE,
  stage: 'eksplorasi',
  depth: 0,
  reply: {
    text: 'Maaf, Bu, kayaknya aku kebanyakan ngomong. Udahan aja yuk, Ibu pasti masih ada urusan lain.',
    expression: 'menutup-diri',
    cue: 'Nisa menutup bukunya, memangku ponsel dengan kedua tangan, dan duduk di tepi kursi seperti siap berdiri.',
  },
  tension: { phase: 'awal', expectedKind: 'menarik-diri' },
  choices: [
    {
      id: 'a',
      skillId: 'sampaikan-pengamatan',
      text: 'Kalimatku tadi kayaknya bikin kamu pengin pergi. Kamu nggak salah, aku mau dengar sisimu.',
      next: 'ni-perbaikan-bk',
      best: true,
      action: { kind: 'akui-ketegangan' },
      options: { observationTone: 'faktual' },
    },
    {
      id: 'b',
      skillId: 'validasi-normalisasi',
      text: 'Nggak apa-apa kalau kamu ngerasa gitu. Kita lanjut pelan-pelan aja.',
      next: 'ni-tegang-bk',
      reaction: {
        text: 'Iya, Bu. Ibu baik banget, aku jadi nggak enak.',
        expression: 'menutup-diri',
        cue: 'Nisa tersenyum sopan, tetapi bahunya tetap kaku.',
      },
    },
    {
      id: 'c',
      skillId: 'jeda-hening',
      text: 'Aku tunggu sebentar di sini ya.',
      next: 'ni-tegang-bk',
      reaction: {
        text: '...',
        expression: 'menutup-diri',
        cue: 'Nisa diam lama dan menghela napas panjang berulang kali tanpa mengangkat wajah.',
      },
    },
    {
      id: 'd',
      skillId: 'nasihat-dini',
      text: 'Jangan terlalu sungkan. Yuk belajar lebih berani ngomong.',
      next: 'ni-tegang-bk',
      reaction: {
        text: 'Iya, Bu. Noted. Maaf ya, Bu.',
        expression: 'menutup-diri',
        cue: 'Nisa mengangguk kecil dengan senyum yang tidak sampai ke mata.',
      },
    },
  ],
};

function repairChoices(): StoryChoice[] {
  return [
    {
      id: 'a',
      skillId: 'validasi-normalisasi',
      text: 'Maaf, ucapanku tadi bisa kerasa menekan. Dampaknya nyata buatmu, dan aku akui itu.',
      next: 'ni-perbaikan-bk',
      best: true,
      action: { kind: 'perbaikan', step: 'akui-dampak' },
      routes: RESUME_WHEN_REPAIRED,
      reaction: {
        text: 'Makasih, Bu, udah mau bilang. Aku jadi nggak ngerasa harus kabur.',
        expression: 'waspada',
        cue: 'Nisa menatap Dosen sebentar, lalu meletakkan ponselnya di meja.',
      },
    },
    {
      id: 'b',
      skillId: 'pertanyaan-terbuka',
      text: 'Kalau boleh, ceritain apa yang kamu rasain pas dengar kalimatku tadi.',
      next: 'ni-perbaikan-bk',
      action: { kind: 'perbaikan', step: 'eksplorasi-perasaan' },
      routes: RESUME_WHEN_REPAIRED,
      reaction: {
        text: 'Rasanya kayak aku ngerepotin Ibu. Aku tuh nggak suka kalau ada yang repot gara-gara aku.',
        expression: 'cemas',
        cue: 'Nisa berbicara pelan, jemarinya memilin tali tas di sampingnya.',
      },
    },
    {
      id: 'c',
      skillId: 'jeda-hening',
      text: 'Kita bisa lanjut pelan, ganti topik, atau cukup sampai sini. Kamu yang mutusin.',
      next: 'ni-perbaikan-bk',
      action: { kind: 'perbaikan', step: 'beri-pilihan' },
      routes: RESUME_WHEN_REPAIRED,
    },
    {
      id: 'd',
      skillId: 'nasihat-dini',
      text: 'Udahlah, lupain yang tadi. Yang penting kamu tetap semangat bantu teman.',
      next: 'ni-perbaikan-bk',
      reaction: {
        text: 'Siap, Bu. Oke deh.',
        expression: 'menutup-diri',
        cue: 'Nisa mengangguk kecil dan kembali tersenyum sopan.',
      },
    },
  ];
}

/** Hub perbaikan: tiga langkah perbaikan dan satu opsi keliru (empat pilihan). */
const NI_PERBAIKAN_BK: StoryNode = {
  id: 'ni-perbaikan-bk',
  sceneId: SCENE,
  stage: 'eksplorasi',
  depth: 0,
  reply: {
    text: 'Tadi aku emang agak pengin pergi. Tapi aku masih mau di sini, kalau Ibu masih mau dengerin.',
    expression: 'waspada',
    cue: 'Nisa menggeser duduknya sedikit ke tengah kursi, tetapi tangannya masih menggenggam buku kecil itu.',
  },
  tension: { phase: 'perbaikan', expectedKind: 'menarik-diri' },
  choices: repairChoices(),
};

export const NI_BK_RENCANA_NODES: StoryNode[] = [NI_B13, NI_B14, NI_TEGANG_BK, NI_PERBAIKAN_BK];

export const NI_TENSION_FALLBACK_NODE_ID = 'ni-tegang-bk';
