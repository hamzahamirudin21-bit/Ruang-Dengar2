/**
 * Adegan Lab untuk Mita Rahmawati (mhs-06): pembukaan baku, isyarat menarik lengan baju,
 * buku catatan berisi pertanyaan yang tak pernah ditanyakan, ajakan ke Ruang Konsultasi,
 * serta Ketegangan `menarik-diri` dan hub perbaikan. Dirakit menjadi STORY_MHS_06 di ./mhs-06.ts.
 */
import type { StoryLine, StoryNode } from '../../engine/story/storyTypes';
import { buildOpeningNode } from '../storyStages';

const STUDENT_ID = 'mhs-06';
const SCENE = 'lab';

const NOTEBOOK_ASIDE =
  'Di halaman terbuka itu tertulis daftar bernomor, sebelas baris, semuanya berakhir dengan tanda tanya dan belum ada yang dicoret.';

const NOTEBOOK_LINE: StoryLine = {
  text: 'Oh, maaf, Bu, ini cuma catatan kecil. Tolong jangan dilihat ya, nggak penting kok.',
  expression: 'cemas',
  cue: 'Mita menarik ujung lengan bajunya sampai menutupi punggung tangan, lalu menutup buku catatan perlahan dengan kedua telapak.',
  aside: NOTEBOOK_ASIDE,
};

export const MITA_LAB_NODES: StoryNode[] = [
  // 1. Pembukaan baku
  buildOpeningNode({
    id: 'mi-buka',
    studentId: STUDENT_ID,
    sceneId: SCENE,
    name: 'Mita',
    reply: {
      text: 'Eh, selamat siang, Bu. Maaf, mejaku belum sempat kurapikan nih. Silakan kalau mau lewat.',
      expression: 'menunduk',
      cue: 'Mita menggeser papan mikrokontroler ke pinggir meja, lalu menunduk sambil menarik lengan baju.',
    },
    best: 'sapaan-hangat',
    next: {
      'sapaan-hangat': 'mi-l2',
      'pertanyaan-terbuka': 'mi-l2',
      'pertanyaan-tertutup': 'mi-l2',
      'nasihat-dini': 'mi-tegang-lab',
    },
    reactions: {
      'sapaan-hangat': {
        text: 'Baik kok, Bu. Maaf, aku lagi corat-coret catatan kecil aja, nggak penting. Tolong jangan dilihat dulu ya.',
        expression: 'cemas',
        cue: 'Mita menjawab pelan sambil menutup separuh bukunya dengan lengan.',
        aside: 'Di halaman terbuka itu tertulis daftar bernomor, sebelas baris, semuanya berakhir dengan tanda tanya dan belum ada yang dicoret.',
      },
      'pertanyaan-terbuka': {
        text: 'Pikiranku? Ah, biasa aja kok, Bu. Nggak ada yang seru buat diceritain.',
        expression: 'menunduk',
        cue: 'Mita tersenyum kecil dan memutar-mutar kabel jumper di jarinya.',
      },
      'pertanyaan-tertutup': {
        text: 'Baik kok, Bu. Maaf kalau kelihatan sepi, aku emang gini orangnya.',
        expression: 'netral',
        cue: 'Mita menjawab pelan, lalu pandangannya turun ke papan di depannya.',
      },
    },
  }),

  // 2. Kejutan kecil: buku catatan pertanyaan; isyarat menarik lengan baju
  {
    id: 'mi-l2',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: NOTEBOOK_LINE,
    marks: ['kejutan', 'isyarat-nonverbal'],
    choices: [
      {
        id: 'pengamatan-faktual',
        skillId: 'sampaikan-pengamatan',
        text: 'Aku lihat lengan bajumu ditarik dan bukunya langsung ditutup. Santai aja ya.',
        options: { observationTone: 'faktual' },
        next: 'mi-l3',
        best: true,
        reaction: {
          text: 'Eh, iya, refleks, Bu. Maaf. Sebenernya ada yang pengin kutanyain, tapi di sini ramai, nanti ada yang dengar.',
          expression: 'cemas',
          cue: 'Mita tersentak kecil, melepas ujung lengan bajunya, lalu melirik teman di meja seberang.',
        },
      },
      {
        id: 'afirmasi',
        skillId: 'afirmasi-kekuatan',
        text: 'Tulisanmu rapi banget dan teliti. Pantas timmu andalin kamu cari referensi.',
        next: 'mi-l3',
        reaction: {
          text: 'Ah, itu cuma kebetulan, Bu. Makasih ya. Sebenernya ada yang pengin kutanyain, tapi di sini ramai. Maaf, ngerepotin.',
          expression: 'cemas',
          cue: 'Mita menunduk dan tersenyum kikuk, tangannya masih menahan buku.',
        },
      },
      {
        id: 'tertutup',
        skillId: 'pertanyaan-tertutup',
        text: 'Itu catatan praktikum, ya? Pasti udah paham semua?',
        next: 'mi-l3',
        reaction: {
          text: 'Iya, catatan praktikum. Soal paham semua... aku jawabnya nanti aja ya, di sini ramai. Ada yang pengin kutanyain juga.',
          expression: 'cemas',
          cue: 'Mita menjawab sambil memegang ujung lengan bajunya, matanya menghindari Dosen.',
        },
      },
      {
        id: 'pengamatan-menilai',
        skillId: 'sampaikan-pengamatan',
        text: 'Kamu kelihatan malu banget, kayak lagi nyembunyiin sesuatu yang memalukan.',
        options: { observationTone: 'menilai' },
        next: 'mi-tegang-lab',
        reaction: {
          text: 'Maaf... mungkin emang kelihatan gitu ya. Aku nggak bermaksud kok.',
          expression: 'menutup-diri',
          cue: 'Mita merapatkan buku ke dada dan menunduk lebih dalam, bahunya mengecil.',
        },
      },
    ],
  },

  // 3. Ajakan ke Ruang Konsultasi
  {
    id: 'mi-l3',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Sebenernya... ada yang pengin kutanyain. Tapi di sini ramai, nanti ada yang dengar. Maaf, ngerepotin ya.',
      expression: 'cemas',
      cue: 'Mita melirik dua temannya di meja ujung, suaranya hampir tak terdengar di atas bunyi kipas solder.',
    },
    choices: [
      {
        id: 'ajak-ruang-bk',
        skillId: 'validasi-normalisasi',
        text: 'Kamu nggak ngerepotin kok. Mau ngobrol di Ruang Konsultasi, berdua aja?',
        next: 'mi-l3-tolak',
        routes: [{ when: [{ type: 'trust-min', value: 40 }], next: 'mi-b0' }],
        best: true,
      },
      {
        id: 'privasi',
        skillId: 'batas-kerahasiaan',
        text: 'Ceritamu aman di antara kita, kecuali menyangkut keselamatanmu.',
        next: 'mi-l3b',
        reaction: {
          text: 'Beneran aman, Bu? Kecuali soal keselamatan, ya, oke. Kalau tempatnya sepi, mungkin aku bisa cerita. Maaf muter-muter terus.',
          expression: 'netral',
          cue: 'Mita mengangguk pelan dan bahunya sedikit turun.',
        },
      },
      {
        id: 'janji-mutlak',
        skillId: 'janji-mutlak',
        text: 'Tenang aja, nggak bakal ada yang tahu. Rahasiamu pasti aman, tanpa pengecualian.',
        next: 'mi-l3b',
        reaction: {
          text: 'Oh... iya, makasih, Bu. Mungkin nanti aja deh kupikirin lagi.',
          expression: 'waspada',
          cue: 'Mita mengangguk sopan, tetapi tangannya menggenggam ujung lengan baju lebih erat.',
        },
      },
      {
        id: 'terbuka',
        skillId: 'pertanyaan-terbuka',
        text: 'Apa yang paling pengin kamu tanyain, kalau nggak ada yang dengar?',
        next: 'mi-l3b',
        reaction: {
          text: 'Yang pengin kutanyain... aduh, panjang, Bu. Kalau tempatnya sepi, mungkin aku bisa jelasin. Maaf ya, muter-muter lagi.',
          expression: 'netral',
          cue: 'Mita menunduk dan memilin ujung lengan bajunya.',
        },
      },
    ],
  },

  // Penolakan halus: meminta maaf dan mengecilkan masalah
  {
    id: 'mi-l3-tolak',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Ah, nggak usah deh, Bu. Pertanyaanku sepele, sayang kalau waktu Ibu kepakai. Lupain aja ya.',
      expression: 'menunduk',
      cue: 'Mita tersenyum cepat, lalu menarik laptopnya mendekat seperti hendak bekerja lagi.',
    },
    choices: [
      {
        id: 'privasi',
        skillId: 'batas-kerahasiaan',
        text: 'Boleh aku jelasin dulu? Ceritamu tetap di antara kita, boleh berhenti kapan aja.',
        next: 'mi-l3b',
        setFlags: ['privasi-dijelaskan'],
        best: true,
        reaction: {
          text: 'Boleh berhenti kapan aja? Oh, oke, itu bikin agak tenang. Kalau tempatnya sepi, mungkin aku bisa. Maaf, muter-muter terus.',
          expression: 'netral',
          cue: 'Mita menarik napas pelan dan menegakkan badan sedikit.',
        },
      },
      {
        id: 'validasi',
        skillId: 'validasi-normalisasi',
        text: 'Pertanyaan yang kamu simpan sendiri biasanya penting buatmu. Pelan-pelan aja.',
        next: 'mi-l3b',
        reaction: {
          text: 'Iya, memang penting buatku, Bu. Pelan-pelan ya. Kalau tempatnya sepi, mungkin aku bisa cerita. Maaf banget.',
          expression: 'netral',
          cue: 'Mita mengangguk kecil dan menggenggam bukunya lebih longgar.',
        },
      },
      {
        id: 'terbuka',
        skillId: 'pertanyaan-terbuka',
        text: 'Kalau nggak ada rasa sungkan sama sekali, apa yang pengin kamu tanyain?',
        next: 'mi-l3b',
        reaction: {
          text: 'Kalau nggak sungkan, aku mau tanya sesuatu soal kuliah. Tapi kalau tempatnya sepi aja, Bu. Maaf, kok jadi muter-muter.',
          expression: 'netral',
          cue: 'Mita melirik sekeliling, lalu menurunkan suaranya.',
        },
      },
      {
        id: 'nasihat',
        skillId: 'nasihat-dini',
        text: 'Jangan ngerasa nggak enak gitu. Tanya aja langsung, beres.',
        next: 'mi-tegang-lab',
      },
    ],
  },

  // Lebih longgar setelah diberi ruang
  {
    id: 'mi-l3b',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Kalau tempatnya sepi, mungkin aku bisa... Maaf ya, dari tadi aku muter-muter terus.',
      expression: 'netral',
      cue: 'Mita mengangkat wajah sebentar, lalu melepas ujung lengan bajunya dan merapikan buku di pangkuan.',
    },
    choices: [
      {
        id: 'ajak-ruang-bk',
        skillId: 'afirmasi-kekuatan',
        text: 'Kamu udah berani bilang. Yuk, kita jalan pelan ke Ruang Konsultasi.',
        next: 'mi-b0',
        best: true,
        reaction: {
          text: 'Iya, Bu, makasih udah nunggu. Maaf ya, aku duduk di pinggir aja. Kursinya enak banget, nanti kupakai kelamaan.',
          expression: 'menunduk',
          cue: 'Mita melangkah pelan dan memilih ujung kursi paling pinggir.',
        },
      },
      {
        id: 'sapaan',
        skillId: 'sapaan-hangat',
        text: 'Kapan pun kamu siap, aku temani ke Ruang Konsultasi. Nggak usah buru-buru.',
        next: 'mi-b0',
        reaction: {
          text: 'Makasih, Bu, nggak usah buru-buru ya. Maaf, aku duduk di pinggir aja, kursinya enak banget, nanti kepakai kelamaan.',
          expression: 'menunduk',
          cue: 'Mita berjalan setengah langkah di belakang Dosen dan duduk di tepi kursi.',
        },
      },
      {
        id: 'tertutup',
        skillId: 'pertanyaan-tertutup',
        text: 'Jadi mau atau nggak? Jawab ya atau nggak aja.',
        next: 'mi-l3b',
        reaction: {
          text: 'Eh, ya... maksudku... maaf, sebentar, aku belum bisa mutusin.',
          expression: 'cemas',
          cue: 'Mita menunduk dan mulai menarik-narik lengan bajunya lagi.',
        },
      },
      {
        id: 'nasihat',
        skillId: 'nasihat-dini',
        text: 'Udahlah, jangan minta maaf terus. Ikut aja sekarang.',
        next: 'mi-tegang-lab',
      },
    ],
  },

  // Ketegangan fase awal: Mita menarik diri, sopan berlebihan
  {
    id: 'mi-tegang-lab',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Iya, Bu, maaf. Aku emang salah. Mending aku lanjut ngerjain modul aja.',
      expression: 'menutup-diri',
      cue: 'Mita menunduk dalam, menyembunyikan kedua tangannya di balik lengan baju, lalu menatap layar tanpa menggerakkan tetikus.',
    },
    tension: { phase: 'awal', expectedKind: 'menarik-diri' },
    choices: [
      {
        id: 'akui',
        skillId: 'sampaikan-pengamatan',
        text: 'Kalimatku tadi mungkin kedengaran nyalahin kamu. Aku mau dengerin sisimu, tanpa dinilai.',
        options: { observationTone: 'faktual' },
        action: { kind: 'akui-ketegangan' },
        next: 'mi-perbaikan-lab',
        best: true,
      },
      {
        id: 'abaikan-validasi',
        skillId: 'validasi-normalisasi',
        text: 'Nggak apa-apa. Silakan lanjut, aku duduk aja di sini.',
        next: 'mi-tegang-lab',
        reaction: {
          text: 'Makasih, Bu. Maaf udah nyusahin.',
          expression: 'menutup-diri',
          cue: 'Mita mengangguk kecil; layarnya masih sama dan jarinya tidak bergerak.',
        },
      },
      {
        id: 'abaikan-jeda',
        skillId: 'jeda-hening',
        text: 'Oke, aku tunggu sebentar ya.',
        next: 'mi-tegang-lab',
        reaction: {
          text: 'Iya... maaf, bentar lagi selesai kok.',
          expression: 'menutup-diri',
          cue: 'Mita menggeser kursor tanpa tujuan; napasnya terdengar tertahan.',
        },
      },
      {
        id: 'nasihat',
        skillId: 'nasihat-dini',
        text: 'Kamu nggak perlu minder gitu. Berani aja tanya ke asisten.',
        next: 'mi-tegang-lab',
        reaction: {
          text: 'Iya, Bu, nanti aku coba deh. Maaf ya.',
          expression: 'menutup-diri',
          cue: 'Mita tersenyum tipis tanpa mengangkat wajah, lengan bajunya ditarik sampai ke ujung jari.',
        },
      },
    ],
  },

  // Ketegangan fase perbaikan: hub tiga langkah + satu opsi keliru
  {
    id: 'mi-perbaikan-lab',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Maaf, tadi aku kecepetan nyerah ya. Aku cuma takut dianggap nggak bisa apa-apa.',
      expression: 'menunduk',
      cue: 'Mita perlahan menurunkan tangan dari balik lengan baju dan menaruhnya di tepi meja.',
    },
    tension: { phase: 'perbaikan' },
    choices: [
      {
        id: 'akui-dampak',
        skillId: 'validasi-normalisasi',
        text: 'Ucapanku tadi bikin kamu makin sungkan. Dampaknya nyata, dan aku menyesal.',
        action: { kind: 'perbaikan', step: 'akui-dampak' },
        next: 'mi-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Makasih udah bilang gitu. Dadaku jadi nggak sesesak tadi.',
          expression: 'netral',
          cue: 'Mita mengembuskan napas panjang dan bahunya turun sedikit.',
        },
        best: true,
      },
      {
        id: 'eksplorasi-perasaan',
        skillId: 'pertanyaan-terbuka',
        text: 'Kalau boleh, bagian mana yang paling bikin kamu takut dianggap nggak bisa?',
        action: { kind: 'perbaikan', step: 'eksplorasi-perasaan' },
        next: 'mi-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Pas orang lain udah paham, aku masih ngulang yang sama. Malu banget rasanya.',
          expression: 'cemas',
          cue: 'Mita berbicara sangat pelan, ibu jarinya menekan buku jari satunya.',
        },
      },
      {
        id: 'beri-pilihan',
        skillId: 'jeda-hening',
        text: 'Kita bisa lanjut pelan, ganti topik, atau berhenti dulu. Kamu yang pilih ya.',
        action: { kind: 'perbaikan', step: 'beri-pilihan' },
        next: 'mi-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Lanjut aja, tapi jangan terlalu cepet ya. Aku butuh waktu buat nata kata.',
          expression: 'lega',
          cue: 'Mita meletakkan buku catatannya di meja, terbuka, dan tidak lagi menariknya kembali.',
        },
      },
      {
        id: 'remehkan',
        skillId: 'meremehkan',
        text: 'Ah, semua orang pernah ketinggalan materi. Itu biasa, nggak usah dipikirin.',
        next: 'mi-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Iya, Bu. Mungkin akunya aja yang kelewat lebay. Maaf.',
          expression: 'menutup-diri',
          cue: 'Mita menutup bukunya dan menyembunyikannya di bawah lengan.',
        },
      },
    ],
  },
];
