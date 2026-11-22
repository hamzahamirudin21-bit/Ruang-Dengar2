/**
 * Adegan Lab (area las) untuk Bima Mahendra (mhs-07): pembukaan baku, telepon dari bengkel yang
 * mendadak berdering, isyarat memutar helm las, ajakan ke Ruang Konsultasi, serta Ketegangan
 * `menarik-diri` dan hub perbaikan. Dirakit menjadi STORY_MHS_07 di ./mhs-07.ts.
 */
import type { StoryLine, StoryNode } from '../../engine/story/storyTypes';
import { buildOpeningNode } from '../storyStages';

const STUDENT_ID = 'mhs-07';
const SCENE = 'lab';

const TELEPON_ASIDE =
  'Ponsel di bangku kerja bergetar sampai bergeser di atas besi. Di layarnya tertulis "Bengkel Surya Fabrikasi".';

const TELEPON_LINE: StoryLine = {
  text: 'Eh, bengkel nelepon lagi. Biarin aja, nanti kubalas. Tawarannya nggak harus dijawab hari ini kok.',
  expression: 'terkejut',
  cue: 'Bima membalik ponselnya dengan ujung sarung tangan, lalu memutar-mutar helm las di pangkuannya setengah putaran demi setengah putaran.',
  aside: TELEPON_ASIDE,
};

export const BIMA_LAB_NODES: StoryNode[] = [
  // 1. Pembukaan baku
  buildOpeningNode({
    id: 'bi-buka',
    studentId: STUDENT_ID,
    sceneId: SCENE,
    name: 'Bima',
    reply: {
      text: 'Oh, Bu! Santai aja, aku lagi kalibrasi arus. Tinggal dua tes lagi, habis itu longgar.',
      expression: 'tersenyum',
      cue: 'Bima mengangkat topeng las ke dahi, mengelap tangan di celemek, lalu memutar helm di jarinya sambil menyengir.',
    },
    best: 'sapaan-hangat',
    next: {
      'sapaan-hangat': 'bi-l2',
      'pertanyaan-terbuka': 'bi-l2',
      'pertanyaan-tertutup': 'bi-l2',
      'nasihat-dini': 'bi-tegang-lab',
    },
    reactions: {
      'sapaan-hangat': {
        text: 'Kabar baik, Bu. Cuma lagi sibuk ngatur arus mesin, makanya agak serius. Ibu sendiri gimana kabarnya?',
        expression: 'tersenyum',
        cue: 'Bima mengangkat topeng lasnya sedikit dan tersenyum tipis sambil menoleh ke arah Dosen.',
      },
      'pertanyaan-terbuka': {
        text: 'Di pikiran? Hitung-hitungan sih, Bu. Mana yang untung, mana yang rugi.',
        expression: 'netral',
        cue: 'Bima terkekeh pendek dan mengetuk-ngetuk dagu helmnya dengan sarung tangan.',
      },
      'pertanyaan-tertutup': {
        text: 'Aman, aman. Namanya juga mahasiswa, ya santai aja.',
        expression: 'tersenyum',
        cue: 'Bima mengacungkan jempol dengan cepat, lalu memutar helmnya sekali lagi.',
      },
    },
  }),

  // 2. Kejutan kecil: telepon bengkel; isyarat memutar helm
  {
    id: 'bi-l2',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: TELEPON_LINE,
    marks: ['kejutan', 'isyarat-nonverbal'],
    choices: [
      {
        id: 'pengamatan-faktual',
        reaction: {
          text: 'Oh, ini? Kebiasaan aja, Bu. Helm suka kuputar-putar kalau lagi nunggu mesin panas, ponselnya kubalik biar nggak ganggu kerja.',
          expression: 'waspada',
          cue: 'Bima berhenti memutar helm, lalu meletakkan ponselnya telungkup di atas meja las.',
        },
        skillId: 'sampaikan-pengamatan',
        text: 'Aku lihat helmmu terus diputar, dan ponselnya langsung kamu balik.',
        options: { observationTone: 'faktual' },
        next: 'bi-l3',
        setFlags: ['isyarat-diperhatikan'],
        best: true,
      },
      {
        id: 'afirmasi',
        reaction: {
          text: 'Hehe, makasih, Bu. Lumayan lah, jarang ada yang notice kalau lasan rapi itu butuh arus yang pas.',
          expression: 'tersenyum',
          cue: 'Bima menggaruk pelipis dengan punggung sarung tangan, senyumnya muncul sebentar.',
        },
        skillId: 'afirmasi-kekuatan',
        text: 'Bengkel nelepon itu tanda lasanmu dilirik orang. Boleh banget bangga.',
        next: 'bi-l3',
      },
      {
        id: 'tertutup',
        reaction: {
          text: 'Tawaran kerja sih iya, Bu. Tapi ambil atau nggak belum kuhitung, jadi jangan buru-buru ditanyain gitu dulu ya.',
          expression: 'waspada',
          cue: 'Bima tertawa kecil, tetapi tangannya meraih helm dan menahannya di pangkuan.',
        },
        skillId: 'pertanyaan-tertutup',
        text: 'Itu tawaran kerja, ya? Pasti kamu ambil, kan?',
        next: 'bi-l3',
      },
      {
        id: 'pengamatan-menilai',
        skillId: 'sampaikan-pengamatan',
        text: 'Kamu kelihatan plin-plan banget, ya. Tinggal pilih aja susah amat.',
        options: { observationTone: 'menilai' },
        next: 'bi-tegang-lab',
        reaction: {
          text: 'Hehe, iya kali. Ya udah, aku lanjut kerja ya, Bu.',
          expression: 'menutup-diri',
          cue: 'Senyum Bima tetap ada, tetapi ia menarik turun topeng lasnya dan membelakangi Dosen.',
        },
      },
    ],
  },

  // 3. Ajakan ke Ruang Konsultasi
  {
    id: 'bi-l3',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Di sini berisik, anak-anak juga suka nguping. Kalau mau ngobrol serius, enaknya di tempat yang agak sepi.',
      expression: 'netral',
      cue: 'Bima melirik dua adik tingkat yang sedang menggerinda di ujung bengkel, lalu merendahkan suaranya.',
    },
    choices: [
      {
        id: 'ajak-ruang-bk',
        skillId: 'validasi-normalisasi',
        text: 'Masuk akal. Mau ngobrol di Ruang Konsultasi, berdua aja?',
        next: 'bi-l3-tolak',
        routes: [{ when: [{ type: 'trust-min', value: 60 }], next: 'bi-b0' }],
        best: true,
      },
      {
        id: 'privasi',
        reaction: {
          text: 'Oke, Bu, jelas. Selama bukan soal keselamatan, nggak keluar dari ruangan. Noted.',
          expression: 'netral',
          cue: 'Bima mengangguk pelan, lalu menurunkan sarung tangannya ke atas paha.',
        },
        skillId: 'batas-kerahasiaan',
        text: 'Ceritamu aman di antara kita, kecuali kalau menyangkut keselamatanmu.',
        next: 'bi-l3b',
        setFlags: ['privasi-dijelaskan'],
      },
      {
        id: 'janji-mutlak',
        skillId: 'janji-mutlak',
        text: 'Tenang, semua yang kamu bilang pasti aman. Rahasia penuh, tanpa kecuali.',
        next: 'bi-l3b',
        reaction: {
          text: 'Tanpa kecuali? Wah, enak didengar sih. Cuma, hmm, kutimbang dulu.',
          expression: 'waspada',
          cue: 'Bima tersenyum miring dan menepuk-nepuk sarung tangan ke paha, tidak lagi memutar helm.',
        },
      },
      {
        id: 'terbuka',
        reaction: {
          text: 'Nggak enak aja kalau ngomong sambil ditonton anak-anak, Bu. Di sini ada aja yang nyamperin buat nanya mesin.',
          expression: 'netral',
          cue: 'Bima melirik ke arah meja las di belakang yang ramai, lalu mengecilkan suaranya.',
        },
        skillId: 'pertanyaan-terbuka',
        text: 'Apa yang bikin kamu pengin tempat yang lebih sepi?',
        next: 'bi-l3b',
      },
    ],
  },

  // Penolakan halus: mesin dijadikan alasan
  {
    id: 'bi-l3-tolak',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Wah, nanti dulu deh, Bu. Mesinnya baru panas, kalau ditinggal arusnya meleset dan hasil las tadi sia-sia.',
      expression: 'netral',
      cue: 'Bima menoleh ke mesin las, menurunkan tuas pelan-pelan, lalu menunduk menatap helm di tangannya.',
    },
    choices: [
      {
        id: 'privasi',
        reaction: {
          text: 'Hm, kalau bisa berhenti kapan aja, ya itu mengurangi risiko sih, Bu. Aku dengerin dulu deh.',
          expression: 'waspada',
          cue: 'Bima menimbang sambil mengetuk-ngetuk sisi helm dengan jari.',
        },
        skillId: 'batas-kerahasiaan',
        text: 'Boleh kujelasin dulu? Ceritamu aman, dan kamu boleh berhenti kapan aja.',
        next: 'bi-l3b',
        setFlags: ['privasi-dijelaskan'],
        best: true,
      },
      {
        id: 'validasi',
        reaction: {
          text: 'Nah, itu. Makasih ya, Bu, udah ngerti. Mesin kalau ditinggal pas lagi stabil, kerjaannya bisa kebuang semua.',
          expression: 'tersenyum',
          cue: 'Bima mengembuskan napas, bahunya turun sedikit seperti baru ditemani seseorang yang paham.',
        },
        skillId: 'validasi-normalisasi',
        text: 'Wajar kok kalau mesin harus dijaga dulu. Kita ikut tempomu aja.',
        next: 'bi-l3b',
      },
      {
        id: 'terbuka',
        reaction: {
          text: 'Ketahuan ya, Bu. Mesinnya sih sebenarnya bisa ditinggal sebentar. Aku cuma nimbang dulu, perlu atau nggak ngobrol.',
          expression: 'netral',
          cue: 'Bima tertawa canggung dan menurunkan topengnya sampai menutupi setengah wajah.',
        },
        skillId: 'pertanyaan-terbuka',
        text: 'Kalau mesinnya bukan alasan, kamu sendiri maunya gimana?',
        next: 'bi-l3b',
      },
      {
        id: 'nasihat',
        skillId: 'nasihat-dini',
        text: 'Matiin aja mesinnya. Yang penting sekarang kamu ikut aku.',
        next: 'bi-tegang-lab',
      },
    ],
  },

  // Lebih longgar setelah privasi dijelaskan
  {
    id: 'bi-l3b',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Oke deh, hitung-hitungannya masuk. Sepuluh menit di tempat sepi, rugi apa? Nggak ada.',
      expression: 'netral',
      cue: 'Bima menyimpan helm di bangku, melepas satu sarung tangan, dan bahunya turun pelan.',
    },
    choices: [
      {
        id: 'ajak-ruang-bk',
        reaction: {
          text: 'Sama-sama, Bu. Ya udah, yuk. Bentar kumatiin mesinnya dulu biar aman ditinggal.',
          expression: 'netral',
          cue: 'Bima berdiri, menekan tombol mesin satu per satu, lalu menyampirkan helm di lengannya.',
        },
        skillId: 'afirmasi-kekuatan',
        text: 'Makasih sudah mau meluangkan waktu. Kita jalan ke Ruang Konsultasi?',
        next: 'bi-b0',
        best: true,
      },
      {
        id: 'sapaan',
        reaction: {
          text: 'Siap, Bu, ayo. Bentar ya, helmnya kutaruh dulu, habis itu aku nyusul jalan di sebelah Ibu.',
          expression: 'tersenyum',
          cue: 'Bima menaruh helm di rak kayu dan menepuk debu dari sarung tangannya.',
        },
        skillId: 'sapaan-hangat',
        text: 'Kalau sudah siap, yuk ke Ruang Konsultasi. Aku temani jalan.',
        next: 'bi-b0',
      },
      {
        id: 'tertutup',
        skillId: 'pertanyaan-tertutup',
        text: 'Jadi mau atau nggak? Jawab aja, ya atau tidak.',
        next: 'bi-l3b',
        reaction: {
          text: 'Ya... nggak... eh. Jangan ditodong gitu dong, Bu, aku belum selesai ngitung.',
          expression: 'cemas',
          cue: 'Bima kembali memakai sarung tangan yang tadi dilepas dan menggenggam helmnya erat-erat.',
        },
      },
      {
        id: 'nasihat',
        skillId: 'nasihat-dini',
        text: 'Udahlah, jangan kebanyakan ngitung. Ikut aja sekarang.',
        next: 'bi-tegang-lab',
      },
    ],
  },

  // Ketegangan fase awal: Bima menarik diri ke balik candaan dan pekerjaan
  {
    id: 'bi-tegang-lab',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Ya udah, santai aja, Bu. Aku balik ke mesin dulu, kasihan hasil lasnya kalau dibiarin.',
      expression: 'menutup-diri',
      cue: 'Bima tertawa kecil, menurunkan topeng las sampai menutup wajah, dan menyalakan mesin tanpa menoleh.',
    },
    tension: { phase: 'awal', expectedKind: 'menarik-diri' },
    choices: [
      {
        id: 'akui',
        skillId: 'sampaikan-pengamatan',
        text: 'Kata-kataku tadi mungkin terasa menekan. Aku mau dengar sisimu.',
        options: { observationTone: 'faktual' },
        action: { kind: 'akui-ketegangan' },
        next: 'bi-perbaikan-lab',
        best: true,
      },
      {
        id: 'abaikan-validasi',
        skillId: 'validasi-normalisasi',
        text: 'Nggak apa-apa. Lanjut las aja, aku duduk di sini.',
        next: 'bi-tegang-lab',
        reaction: {
          text: 'Sip, makasih ya, Bu.',
          expression: 'menutup-diri',
          cue: 'Bima mengangguk dari balik topeng, percikan las menyala makin deras.',
        },
      },
      {
        id: 'abaikan-jeda',
        skillId: 'jeda-hening',
        text: 'Oke, aku tunggu sebentar di sini.',
        next: 'bi-tegang-lab',
        reaction: {
          text: 'Eh, iya, bentar ya. Satu jalur lagi.',
          expression: 'menutup-diri',
          cue: 'Bima menggeser elektroda, tetapi tangannya berhenti di tengah jalur tanpa menyambung.',
        },
      },
      {
        id: 'nasihat',
        skillId: 'nasihat-dini',
        text: 'Jangan kerja terus gitu. Kamu harus belajar lebih terbuka.',
        next: 'bi-tegang-lab',
        reaction: {
          text: 'Hehe, siap. Nanti kucoba.',
          expression: 'menutup-diri',
          cue: 'Bima mengacungkan jempol berbalut sarung tangan tanpa mengangkat topengnya.',
        },
      },
    ],
  },

  // Ketegangan fase perbaikan: hub tiga langkah + satu opsi keliru
  {
    id: 'bi-perbaikan-lab',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Maaf, Bu, tadi aku sok santai. Rasanya kayak disuruh pilih cepat, padahal aku sendiri belum tahu maunya apa.',
      expression: 'menunduk',
      cue: 'Bima mematikan mesin, mengangkat topeng, lalu duduk dan memegang helmnya tanpa memutarnya lagi.',
    },
    tension: { phase: 'perbaikan' },
    choices: [
      {
        id: 'akui-dampak',
        skillId: 'validasi-normalisasi',
        text: 'Caraku tadi memang terasa menekan. Maaf ya, itu bukan maksudku.',
        action: { kind: 'perbaikan', step: 'akui-dampak' },
        next: 'bi-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Nah, gitu. Jadi lebih enteng dengarnya.',
          expression: 'netral',
          cue: 'Bima mengembuskan napas panjang dan menyandarkan punggung ke dinding bengkel.',
        },
        best: true,
      },
      {
        id: 'eksplorasi-perasaan',
        skillId: 'pertanyaan-terbuka',
        text: 'Bagian mana yang paling terasa kayak disuruh buru-buru?',
        action: { kind: 'perbaikan', step: 'eksplorasi-perasaan' },
        next: 'bi-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Pas disebut plin-plan. Aku bukan plin-plan, aku cuma takut salah timbang.',
          expression: 'cemas',
          cue: 'Bima berbicara lebih pelan, ibu jarinya menggosok-gosok kelim sarung tangan.',
        },
      },
      {
        id: 'beri-pilihan',
        skillId: 'jeda-hening',
        text: 'Kita bisa lanjut pelan, ganti topik, atau berhenti dulu. Kamu yang tentukan.',
        action: { kind: 'perbaikan', step: 'beri-pilihan' },
        next: 'bi-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Lanjut aja, tapi pelan. Helmnya kutaruh dulu.',
          expression: 'lega',
          cue: 'Bima meletakkan helm di bangku dan menautkan jari-jarinya di lutut.',
        },
      },
      {
        id: 'remehkan',
        skillId: 'meremehkan',
        text: 'Cuma soal tawaran kerja, kan. Banyak yang lebih rumit dari itu.',
        next: 'bi-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Iya juga ya. Aku aja yang lebay.',
          expression: 'menutup-diri',
          cue: 'Bima memasang kembali sarung tangannya dan menarik topeng las ke wajah.',
        },
      },
    ],
  },
];
