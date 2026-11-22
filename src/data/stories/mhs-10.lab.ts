/**
 * Adegan Lab untuk Teguh Santosa (mhs-10): pembukaan baku di gudang alat, ajakan makan siang teman
 * yang ditolak dengan ramah, isyarat merapikan alat ukur, ajakan ke Ruang Konsultasi, serta
 * Ketegangan `menarik-diri` dan hub perbaikan. Dirakit menjadi STORY_MHS_10 di ./mhs-10.ts.
 */
import type { StoryNode } from '../../engine/story/storyTypes';
import { buildOpeningNode } from '../storyStages';

const STUDENT_ID = 'mhs-10';
const SCENE = 'lab';

export const TEGUH_LAB_NODES: StoryNode[] = [
  // 1. Pembukaan baku
  buildOpeningNode({
    id: 'te-buka',
    studentId: STUDENT_ID,
    sceneId: SCENE,
    name: 'Teguh',
    reply: {
      text: 'Siang, Bu. Sebentar ya, nol multimeter ini tinggal kupastikan. Santai aja, aku nggak lagi ada masalah kok.',
      expression: 'tersenyum',
      cue: 'Teguh menaruh probe di atas kain bersih, lalu menggeser satu bangku kosong ke dekat rak sebagai tempat duduk untuk Dosen.',
    },
    best: 'sapaan-hangat',
    next: {
      'sapaan-hangat': 'te-l2',
      'pertanyaan-terbuka': 'te-l2',
      'pertanyaan-tertutup': 'te-l2',
      'nasihat-dini': 'te-tegang-lab',
    },
    reactions: {
      'sapaan-hangat': {
        text: 'Kabarku baik, Bu. Eh, sebentar. Bas, duluan aja ya, kalibrasiku belum kelar. Nanti kususul kalau sempat.',
        expression: 'tersenyum',
        cue: 'Teguh menyeka probe, lalu menaruh tiap alat kembali ke lubang busanya satu per satu sesuai urutan.',
        aside: 'Dua anak muncul di pintu gudang membawa kotak bekal dan mengajak Teguh makan siang. Mereka tampak biasa saja ketika ia menolak.',
      },
      'pertanyaan-terbuka': {
        text: 'Isi pikiranku? Soal ujian kompetensi bulan depan, sama satu rangkaian kalibrasi yang belum rampung. Itu aja sih.',
        expression: 'netral',
        cue: 'Teguh menjawab dengan nada datar yang hangat sambil tetap memutar kenop alat ukur sedikit demi sedikit.',
      },
      'pertanyaan-tertutup': {
        text: 'Iya. Memang nggak ada apa-apa kok.',
        expression: 'netral',
        cue: 'Teguh mengangguk sekali, lalu menunggu pertanyaan berikutnya dengan sabar.',
      },
    },
  }),

  // 2. Kejutan kecil: teman mengajak makan siang; isyarat mengembalikan alat satu per satu
  {
    id: 'te-l2',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Duluan aja, Bas. Kalibrasinya masih setengah jalan, nanti kususul kalau sempat.',
      expression: 'tersenyum',
      cue: 'Teguh menyeka probe dengan kain, lalu memasukkan tiap alat kembali ke lubang busanya satu per satu sesuai urutan.',
      aside: 'Dua anak muncul di pintu gudang membawa kotak bekal dan mengajak Teguh makan siang bersama. Mereka tampak biasa saja ketika ia menolak.',
    },
    marks: ['kejutan', 'isyarat-nonverbal'],
    choices: [
      {
        id: 'pengamatan-faktual',
        skillId: 'sampaikan-pengamatan',
        text: 'Kamu menaruh tiap alat ke lubang busanya satu per satu, urut dan nggak buru-buru.',
        reaction: {
          text: 'Hehe, ketahuan. Urutannya harus pas, kalau ketuker nanti nyari-nyari lagi. Makanya aku betah di gudang yang tenang ini, semuanya ada tempatnya.',
          expression: 'tersenyum',
          cue: 'Teguh melirik kotak busa yang sudah rapi, lalu sudut bibirnya naik sedikit sambil menutup tutupnya.',
        },
        options: { observationTone: 'faktual' },
        next: 'te-l3',
        setFlags: ['isyarat-diperhatikan'],
        best: true,
      },
      {
        id: 'afirmasi',
        skillId: 'afirmasi-kekuatan',
        text: 'Alat-alat di gudang ini terawat banget. Kelihatan kamu telaten.',
        reaction: {
          text: 'Makasih, Bu. Alat ukur awet kalau dirawat, jadi sayang kalau asal ditaruh. Di gudang yang tenang begini aku betah ngerawatnya.',
          expression: 'tersenyum',
          cue: 'Teguh mengangguk kecil sambil mengelap penutup debu di atas rak.',
        },
        next: 'te-l3',
      },
      {
        id: 'tertutup',
        skillId: 'pertanyaan-tertutup',
        text: 'Kamu memang lebih suka makan sendirian, ya?',
        reaction: {
          text: 'Kalau lagi kalibrasi begini, iya. Makan bisa belakangan, alatnya nggak bisa kutinggal setengah jalan. Gudang yang tenang ini bikin aku betah.',
          expression: 'netral',
          cue: 'Teguh menjawab tanpa tergesa, tangannya masih memegang kain pembersih.',
        },
        next: 'te-l3',
      },
      {
        id: 'pengamatan-menilai',
        skillId: 'sampaikan-pengamatan',
        text: 'Menolak ajakan teman terus begitu, nanti kamu dikira nggak mau bergaul.',
        options: { observationTone: 'menilai' },
        next: 'te-tegang-lab',
        reaction: {
          text: 'Oh. Begitu ya kesannya. Ya sudah, nggak apa-apa.',
          expression: 'menutup-diri',
          cue: 'Teguh berhenti merapikan alat, menutup tutup kotak busa pelan-pelan, lalu menatap meja kerja.',
        },
      },
    ],
  },

  // 3. Ajakan ke Ruang Konsultasi
  {
    id: 'te-l3',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Kalau mau ngobrol, di sini juga boleh. Gudang ini tempat paling tenang di lab, jadi aku betah.',
      expression: 'netral',
      cue: 'Teguh menepuk rak logam di sebelahnya dengan telapak tangan, seperti memperkenalkan seorang teman lama.',
    },
    choices: [
      {
        id: 'ajak-ruang-bk',
        skillId: 'validasi-normalisasi',
        text: 'Wajar betah di tempat tenang. Mau coba Ruang Konsultasi yang sama sepinya, santai aja?',
        next: 'te-l3-tolak',
        routes: [{ when: [{ type: 'trust-min', value: 55 }], next: 'te-b0' }],
        setFlags: ['ruang-dihormati'],
        best: true,
      },
      {
        id: 'privasi',
        skillId: 'batas-kerahasiaan',
        text: 'Apa pun yang kamu ceritakan tetap di antara kita, kecuali soal keselamatanmu.',
        reaction: {
          text: 'Oke, kuingat: kecuali soal keselamatan. Itu masuk akal. Kalau gitu boleh, aku ambil botol minumku dulu ya, soalnya gampang haus kalau ngobrol lama.',
          expression: 'netral',
          cue: 'Teguh mengangguk satu kali, lalu menoleh ke sudut meja tempat botol minumnya diletakkan.',
        },
        next: 'te-l3b',
      },
      {
        id: 'janji-mutlak',
        skillId: 'janji-mutlak',
        text: 'Tenang, pasti aman. Nggak ada satu orang pun yang akan tahu.',
        next: 'te-l3b',
        reaction: {
          text: 'Pasti? Oke deh. Semoga memang begitu.',
          expression: 'waspada',
          cue: 'Teguh mengangguk pelan, tetapi tangannya berhenti bergerak di atas kain pembersih.',
        },
      },
      {
        id: 'terbuka',
        skillId: 'pertanyaan-terbuka',
        text: 'Apa yang bikin gudang ini terasa pas buatmu?',
        reaction: {
          text: 'Sepi, tiap alat ada tempatnya, dan cahayanya pas buat baca skala. Kepalaku jadi nggak ribut. Boleh kok kita ngobrol, aku ambil botol minum dulu.',
          expression: 'tersenyum',
          cue: 'Teguh menyapu pandang ke rak-rak yang tertata, lalu meraih botol minum dari sudut meja.',
        },
        next: 'te-l3b',
      },
    ],
  },

  // Penolakan halus: tempatnya sudah pas, bukan alasan jadwal
  {
    id: 'te-l3-tolak',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Hmm, di sini aja dulu ya. Susunan alatnya baru beres, kalau kutinggal biasanya ada yang naruh sembarangan.',
      expression: 'netral',
      cue: 'Teguh memegang pinggiran meja kerja dengan satu tangan, ramah tetapi tidak beranjak.',
    },
    choices: [
      {
        id: 'privasi',
        skillId: 'batas-kerahasiaan',
        text: 'Kalau nanti pindah, ceritamu tetap di antara kita dan boleh dihentikan kapan aja.',
        reaction: {
          text: 'Boleh dihentikan kapan aja? Oke, itu bikin aku lebih tenang. Kalau gitu aku ikut, tapi bawa botol minumku dulu ya.',
          expression: 'netral',
          cue: 'Teguh melepaskan pegangan pada pinggir meja dan menarik napas pendek.',
        },
        next: 'te-l3b',
        setFlags: ['ruang-dihormati'],
        best: true,
      },
      {
        id: 'validasi',
        skillId: 'validasi-normalisasi',
        text: 'Masuk akal menjaga susunanmu. Kita ikuti ritmemu, nggak perlu pindah sekarang.',
        reaction: {
          text: 'Makasih ngerti, Bu. Susunan ini kubikin lama, sayang kalau berantakan lagi. Tapi sebentar aja nggak apa-apa, aku ambil botol minum dulu.',
          expression: 'tersenyum',
          cue: 'Teguh merapikan satu kotak busa yang agak miring, lalu menoleh ke botol minumnya.',
        },
        next: 'te-l3b',
      },
      {
        id: 'terbuka',
        skillId: 'pertanyaan-terbuka',
        text: 'Kalau susunannya aman, tempat mana yang akan kamu pilih untuk bicara?',
        reaction: {
          text: 'Yang sepi, kursinya dua, dan nggak ada orang lalu-lalang. Ruang Konsultasi kayaknya cocok. Aku bawa botol minum dulu ya.',
          expression: 'netral',
          cue: 'Teguh berpikir sebentar sambil mengetuk meja satu kali dengan ujung jari.',
        },
        next: 'te-l3b',
      },
      {
        id: 'nasihat',
        skillId: 'nasihat-dini',
        text: 'Tinggalkan aja alatnya dan ikut aku. Kamu terlalu lama sendirian di sini.',
        next: 'te-tegang-lab',
      },
    ],
  },

  // Lebih longgar setelah ruang dan tempo dihormati
  {
    id: 'te-l3b',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Boleh deh. Aku bawa botol minumku dulu, soalnya kalau ngobrol agak lama aku gampang haus.',
      expression: 'tersenyum',
      cue: 'Teguh mengunci laci kalibrator, menepuknya dua kali, lalu menyambar botol minum dari sudut meja.',
    },
    choices: [
      {
        id: 'ajak-ruang-bk',
        skillId: 'afirmasi-kekuatan',
        text: 'Makasih mau menyisihkan waktu. Aku jalan di sampingmu, ya.',
        reaction: {
          text: 'Sama-sama, Bu. Sampai juga, dan di sini sepi, enak. Kalau mau tanya silakan, tapi jawabanku mungkin pendek-pendek ya.',
          expression: 'tersenyum',
          cue: 'Teguh berjalan di sisi Dosen, lalu berhenti di ambang ruangan dan mengangguk puas melihat dua kursi yang berhadapan.',
        },
        next: 'te-b0',
        best: true,
      },
      {
        id: 'sapaan',
        skillId: 'sapaan-hangat',
        text: 'Siap kapan pun kamu mau berangkat. Santai aja, nggak perlu buru-buru.',
        reaction: {
          text: 'Siap, Bu. Kabel terakhirnya sudah kugulung, ayo. Wah, di sini sepi, enak. Tanya aja silakan, tapi jawabanku mungkin pendek-pendek.',
          expression: 'tersenyum',
          cue: 'Teguh menepuk laci kalibrator sekali lagi, lalu melangkah masuk dan memandang sekeliling ruangan yang tenang.',
        },
        next: 'te-b0',
      },
      {
        id: 'tertutup',
        skillId: 'pertanyaan-tertutup',
        text: 'Jadi kamu mau atau tidak? Jawab ya atau tidak aja.',
        next: 'te-l3b',
        reaction: {
          text: 'Mau. Tadi kan udah kubilang boleh.',
          expression: 'netral',
          cue: 'Teguh menurunkan botol minumnya sedikit dan menatap Dosen, bingung tanpa terlihat marah.',
        },
      },
      {
        id: 'nasihat',
        skillId: 'nasihat-dini',
        text: 'Sudahlah, jangan menyendiri terus. Ikut aja dan mulai berbaur sama teman.',
        next: 'te-tegang-lab',
      },
    ],
  },

  // Ketegangan fase awal: Teguh mundur dengan sopan ke balik pekerjaannya
  {
    id: 'te-tegang-lab',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Oh. Ya sudah. Aku lanjut kerja aja, Bu.',
      expression: 'menutup-diri',
      cue: 'Teguh memasang kembali penutup debu di atas alat ukur, lalu duduk menghadap rak dan membelakangi Dosen.',
    },
    tension: { phase: 'awal', expectedKind: 'menarik-diri' },
    choices: [
      {
        id: 'akui',
        skillId: 'sampaikan-pengamatan',
        text: 'Kalimatku tadi seperti mendorongmu keluar dari kenyamananmu. Aku ingin dengar sisimu.',
        options: { observationTone: 'faktual' },
        action: { kind: 'akui-ketegangan' },
        next: 'te-perbaikan-lab',
        best: true,
      },
      {
        id: 'abaikan-validasi',
        skillId: 'validasi-normalisasi',
        text: 'Nggak apa-apa, silakan lanjut kerja. Aku duduk di bangku ini.',
        next: 'te-tegang-lab',
        reaction: {
          text: 'Terima kasih, Bu.',
          expression: 'menutup-diri',
          cue: 'Teguh menjawab pelan tanpa menoleh, lalu menggulung kabel dengan gerakan yang terlalu rapi.',
        },
      },
      {
        id: 'abaikan-jeda',
        skillId: 'jeda-hening',
        text: 'Baik, aku tunggu sebentar.',
        next: 'te-tegang-lab',
        reaction: {
          text: 'Silakan.',
          expression: 'menutup-diri',
          cue: 'Teguh menatap jarum alat ukur yang diam, tetapi bahunya tetap kaku.',
        },
      },
      {
        id: 'nasihat',
        skillId: 'nasihat-dini',
        text: 'Jangan begitu. Kamu harus belajar lebih terbuka kepada orang lain.',
        next: 'te-tegang-lab',
        reaction: {
          text: 'Iya, Bu. Akan kupikirkan.',
          expression: 'menutup-diri',
          cue: 'Teguh mengangguk singkat ke arah rak, tidak ke arah Dosen.',
        },
      },
    ],
  },

  // Ketegangan fase perbaikan: hub tiga langkah + satu opsi keliru
  {
    id: 'te-perbaikan-lab',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Maaf, aku tadi diam aja. Rasanya kayak dianggap salah karena lebih nyaman sendiri.',
      expression: 'menunduk',
      cue: 'Teguh memutar bangkunya setengah putaran sehingga kembali menghadap Dosen, dengan tangan terlipat di pangkuan.',
    },
    tension: { phase: 'perbaikan' },
    choices: [
      {
        id: 'akui-dampak',
        skillId: 'validasi-normalisasi',
        text: 'Caraku tadi memang terasa menyalahkan. Maaf ya, nyaman sendiri bukan kekurangan.',
        action: { kind: 'perbaikan', step: 'akui-dampak' },
        next: 'te-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Terima kasih sudah bilang begitu. Dadaku jadi lebih ringan.',
          expression: 'lega',
          cue: 'Teguh menarik napas panjang dan bersandar ke rak untuk pertama kalinya sejak tadi.',
        },
        best: true,
      },
      {
        id: 'eksplorasi-perasaan',
        skillId: 'pertanyaan-terbuka',
        text: 'Boleh tahu, bagian mana yang paling terasa kayak dianggap salah?',
        action: { kind: 'perbaikan', step: 'eksplorasi-perasaan' },
        next: 'te-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Kata "terlalu lama sendirian" itu. Seakan-akan waktuku di sini dihitung sebagai kekurangan.',
          expression: 'menunduk',
          cue: 'Teguh berbicara pelan sambil menelusuri tepi kotak busa dengan ujung jari.',
        },
      },
      {
        id: 'beri-pilihan',
        skillId: 'jeda-hening',
        text: 'Kita bisa lanjut di sini, pindah, atau berhenti dulu. Kamu yang memilih.',
        action: { kind: 'perbaikan', step: 'beri-pilihan' },
        next: 'te-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Di sini aja, tapi jangan terlalu dekat. Jaraknya segini udah enak.',
          expression: 'tersenyum',
          cue: 'Teguh menunjuk ubin di antara mereka dengan ujung sepatu, setengah bercanda, lalu tersenyum tipis.',
        },
      },
      {
        id: 'remehkan',
        skillId: 'meremehkan',
        text: 'Ah, itu cuma soal ngobrol biasa. Nggak usah terlalu sensitif.',
        next: 'te-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Iya, mungkin aku terlalu sensitif.',
          expression: 'menutup-diri',
          cue: 'Teguh meraih kain pembersih dan mulai menyeka probe yang sebenarnya sudah bersih.',
        },
      },
    ],
  },
];
