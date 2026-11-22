/**
 * Adegan Lab untuk Hendra Wijaya (mhs-08): pembukaan baku, teman datang meminta tolong mendadak,
 * isyarat ponsel yang bergetar terus, ajakan ke Ruang Konsultasi, serta Ketegangan `menarik-diri`
 * dan hub perbaikan. Dirakit menjadi STORY_MHS_08 di ./mhs-08.ts.
 */
import type { StoryLine, StoryNode } from '../../engine/story/storyTypes';
import { buildOpeningNode } from '../storyStages';

const STUDENT_ID = 'mhs-08';
const SCENE = 'lab';
const TENSION = 'he-tegang-lab';
const REPAIR = 'he-perbaikan-lab';

/** Ambang kepercayaan untuk menerima ajakan ke Ruang Konsultasi (jalur terbaik memberi margin >= 4). */
export const HENDRA_INVITE_TRUST_MIN = 55;

const HELP_ASIDE =
  'Dari ujung meja terdengar suara Rendy: "Hen! Nozzle printerku mampet lagi, tolong lihat sebentar ya!"';

const HELP_LINE: StoryLine = {
  text: 'Oh, siap! Bentar ya, Ren, nozzle gampang itu. Maaf, Dosen, lima menit aja.',
  expression: 'tersenyum',
  cue: 'Hendra sudah setengah berdiri sebelum Rendy selesai bicara, sementara ponselnya di meja terus bergetar dan layarnya menyala bergantian.',
  aside: HELP_ASIDE,
};

export const HENDRA_LAB_NODES: StoryNode[] = [
  // 1. Pembukaan baku
  buildOpeningNode({
    id: 'he-buka',
    studentId: STUDENT_ID,
    sceneId: SCENE,
    name: 'Hendra',
    reply: {
      text: 'Halo, halo! Masuk aja, Dosen. Mau lihat printernya? Atau butuh sesuatu? Bilang aja, nanti kubantu.',
      expression: 'tersenyum',
      cue: 'Hendra meletakkan kikir kecil dan langsung menoleh dengan senyum lebar, sementara ponsel di sampingnya bergetar pelan.',
    },
    best: 'sapaan-hangat',
    next: {
      'sapaan-hangat': 'he-l2',
      'pertanyaan-terbuka': 'he-l2',
      'pertanyaan-tertutup': 'he-l2',
      'nasihat-dini': TENSION,
    },
    reactions: {
      'sapaan-hangat': {
        text: 'Kabar baik, Dosen! Agak ramai aja minggu ini, tapi seru. Dosen sendiri gimana?',
        expression: 'tersenyum',
        cue: 'Hendra tersenyum lebar sambil memutar kursi menghadap Dosen, ponselnya ditaruh di samping printer.',
      },
      'pertanyaan-terbuka': {
        text: 'Pikiranku? Hmm, itu nanti aja deh. Yang penting Dosen nyaman dulu di sini.',
        expression: 'tersenyum',
        cue: 'Hendra mengalihkan pembicaraan dengan menyodorkan kursi kosong di dekat mesin cetak.',
      },
      'pertanyaan-tertutup': {
        text: 'Baik-baik aja kok! Di sini selalu ada yang bisa dikerjakan.',
        expression: 'tersenyum',
        cue: 'Hendra menjawab cepat sambil mengusap layar ponselnya yang menyala lagi.',
      },
    },
  }),

  // 2. Kejutan kecil: permintaan tolong mendadak; isyarat ponsel bergetar terus
  {
    id: 'he-l2',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: HELP_LINE,
    marks: ['kejutan', 'isyarat-nonverbal'],
    choices: [
      {
        id: 'pengamatan-faktual',
        reaction: {
          text: 'Ah, iya, Dosen. Biasa, teman-teman suka minta bantuan, jadi refleks gitu deh.',
          expression: 'netral',
          cue: 'Hendra melirik ponselnya yang masih menyala, lalu membaliknya ke bawah.',
        },
        skillId: 'sampaikan-pengamatan',
        text: 'Ponselmu getar terus dari tadi, dan kamu langsung berdiri pas Rendy manggil.',
        options: { observationTone: 'faktual' },
        next: 'he-l3',
        setFlags: ['isyarat-diperhatikan'],
        best: true,
      },
      {
        id: 'afirmasi',
        reaction: {
          text: 'Hehe, makasih, Dosen. Nozzle mampet itu udah hafal polanya, tinggal bersihin ujungnya.',
          expression: 'tersenyum',
          cue: 'Hendra mengusap jarinya yang berminyak ke celana sambil tertawa kecil.',
        },
        skillId: 'afirmasi-kekuatan',
        text: 'Kamu cekatan banget soal nozzle. Pantes teman-temanmu nyariin kamu.',
        next: 'he-l3',
      },
      {
        id: 'tertutup',
        reaction: {
          text: 'Hampir selalu sih, Dosen. Soalnya kalau aku bisa bantu, kenapa nggak?',
          expression: 'netral',
          cue: 'Hendra mengangkat bahu ringan, tetapi jemarinya mengetuk ponsel di meja.',
        },
        skillId: 'pertanyaan-tertutup',
        text: 'Kamu emang selalu begini kalau dimintai tolong, ya?',
        next: 'he-l3',
      },
      {
        id: 'pengamatan-menilai',
        skillId: 'sampaikan-pengamatan',
        text: 'Kamu tuh nggak enakan ya. Semua permintaan langsung diiyakan.',
        options: { observationTone: 'menilai' },
        next: TENSION,
        reaction: {
          text: 'Hehe, iya mungkin. Ya udah, aku selesaiin ini dulu, Dosen tunggu aja.',
          expression: 'menutup-diri',
          cue: 'Senyum Hendra tetap ada, tetapi ia menunduk ke arah nozzle dan tidak menatap Dosen lagi.',
        },
      },
    ],
  },

  // 3. Ajakan ke Ruang Konsultasi
  {
    id: 'he-l3',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Nozzle-nya udah lancar. Eh, di sini rame ya, tadi malah ada dua yang minta tolong lagi lewat chat.',
      expression: 'netral',
      cue: 'Hendra mengelap tangan dengan kain, menengok ponselnya sekilas, lalu mengecilkan suara supaya tidak terdengar mesin sebelah.',
    },
    choices: [
      {
        id: 'ajak-ruang-bk',
        skillId: 'validasi-normalisasi',
        text: 'Rame gini susah ngobrol ya. Mau pindah ke Ruang Konsultasi yang lebih tenang?',
        next: 'he-l3-tolak',
        routes: [{ when: [{ type: 'trust-min', value: HENDRA_INVITE_TRUST_MIN }], next: 'he-b0' }],
        best: true,
      },
      {
        id: 'privasi',
        reaction: {
          text: 'Oke, Dosen, makasih penjelasannya. Selama bukan soal keselamatan, nggak keluar ya. Aku catat.',
          expression: 'netral',
          cue: 'Hendra mengangguk cepat dan menurunkan ponsel ke saku.',
        },
        skillId: 'batas-kerahasiaan',
        text: 'Obrolan kita nggak akan dibawa keluar, kecuali menyangkut keselamatanmu.',
        next: 'he-l3b',
        setFlags: ['privasi-dijelaskan'],
      },
      {
        id: 'janji-mutlak',
        skillId: 'janji-mutlak',
        text: 'Pasti beres kok. Aku jamin nggak ada yang bakal ganggu kita nanti.',
        next: 'he-l3b',
        reaction: {
          text: 'Wah, dijamin ya. Boleh banget, tapi jangan kaget kalau ponselku tetap bunyi.',
          expression: 'waspada',
          cue: 'Hendra tertawa ringan, namun jemarinya mengetuk-ngetuk sisi ponsel.',
        },
      },
      {
        id: 'terbuka',
        reaction: {
          text: 'Rasanya biasa aja sih, Dosen. Cuma agak kepikiran siapa duluan yang harus kubantu.',
          expression: 'netral',
          cue: 'Hendra melirik ponselnya yang layarnya menyala, lalu tersenyum canggung.',
        },
        skillId: 'pertanyaan-terbuka',
        text: 'Waktu dua orang itu minta tolong lewat chat, apa yang kamu rasakan?',
        next: 'he-l3b',
      },
    ],
  },

  // Penolakan halus: ia merasa harus membantu dulu
  {
    id: 'he-l3-tolak',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Hmm, nanti dulu ya. Rendy sama Sabrina masih nunggu giliran, kasihan kalau kutinggal.',
      expression: 'netral',
      cue: 'Hendra membuka kotak peralatan, mengambil jarum pembersih, dan menoleh ke arah dua temannya yang menunggu.',
    },
    choices: [
      {
        id: 'privasi',
        reaction: {
          text: 'Kalau gitu ya... boleh juga, Dosen. Aku dengerin dulu penjelasannya, tapi jangan lama-lama ya.',
          expression: 'netral',
          cue: 'Hendra menegakkan punggung dan menaruh kedua tangan di atas meja dengan sopan.',
        },
        skillId: 'batas-kerahasiaan',
        text: 'Boleh kujelaskan dulu? Obrolan ini rahasia, dan kamu bebas berhenti kapan pun.',
        next: 'he-l3b',
        setFlags: ['privasi-dijelaskan'],
        best: true,
      },
      {
        id: 'validasi',
        reaction: {
          text: 'Wah, makasih, Dosen. Jarang ada yang bilang gitu, biasanya malah disuruh cepetan.',
          expression: 'tersenyum',
          cue: 'Hendra tersenyum lebar, bahunya turun sedikit.',
        },
        skillId: 'validasi-normalisasi',
        text: 'Peduli sama teman itu baik. Kita ikuti ritmemu aja, nggak usah buru-buru.',
        next: 'he-l3b',
      },
      {
        id: 'terbuka',
        reaction: {
          text: 'Kalau nggak ada yang nunggu? Hmm... mungkin rapiin printer sendiri, Dosen. Udah lama nggak sempat.',
          expression: 'netral',
          cue: 'Hendra menatap printer di sudut dengan sorot agak rindu.',
        },
        skillId: 'pertanyaan-terbuka',
        text: 'Kalau nggak ada yang nunggu, kamu pengin pakai waktu ini buat apa?',
        next: 'he-l3b',
      },
      {
        id: 'nasihat',
        skillId: 'nasihat-dini',
        text: 'Biarin aja mereka nunggu. Kamu harus belajar mendahulukan dirimu sendiri.',
        next: TENSION,
      },
    ],
  },

  // Lebih longgar setelah privasi dijelaskan
  {
    id: 'he-l3b',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Oke deh, kayaknya masih bisa. Kuminta Rendy sama Sabrina nunggu setengah jam aja.',
      expression: 'netral',
      cue: 'Hendra menarik napas pendek, membalikkan ponselnya ke bawah, dan getarannya terdengar teredam di meja.',
    },
    choices: [
      {
        id: 'ajak-ruang-bk',
        reaction: {
          text: 'Sama-sama, Dosen. Bentar, kubilangin Rendy dulu ya, habis itu kita jalan.',
          expression: 'tersenyum',
          cue: 'Hendra mengetik cepat di ponselnya sambil berdiri dan merapikan tali ranselnya.',
        },
        skillId: 'afirmasi-kekuatan',
        text: 'Makasih ya sudah menyisihkan waktu. Yuk, kita jalan ke Ruang Konsultasi.',
        next: 'he-b0',
        best: true,
      },
      {
        id: 'sapaan',
        reaction: {
          text: 'Oke, Dosen, ayo. Bentar, kumatiin printernya dulu biar nggak jalan sendiri.',
          expression: 'tersenyum',
          cue: 'Hendra menekan tombol daya printer, lalu mengikuti Dosen dengan langkah ringan.',
        },
        skillId: 'sapaan-hangat',
        text: 'Kalau kamu siap, aku temani jalan ke Ruang Konsultasi sekarang.',
        next: 'he-b0',
      },
      {
        id: 'tertutup',
        skillId: 'pertanyaan-tertutup',
        text: 'Jadi mau ikut atau nggak? Jawab aja ya atau nggak.',
        next: 'he-l3b',
        reaction: {
          text: 'Ya... eh, mau kok. Tapi Sabrina bilang agak mendesak, jadi...',
          expression: 'cemas',
          cue: 'Hendra membalik ponselnya lagi dan membaca layar yang berkedip, lalu cepat-cepat menaruhnya kembali.',
        },
      },
      {
        id: 'nasihat',
        skillId: 'nasihat-dini',
        text: 'Jangan bilang iya terus ke semua orang. Ikut aku sekarang aja.',
        next: TENSION,
      },
    ],
  },

  // Ketegangan fase awal: Hendra menarik diri sambil tetap tampak ramah
  {
    id: TENSION,
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Iya, iya, bener juga. Maaf ya, mending aku bantu yang lain dulu aja.',
      expression: 'menutup-diri',
      cue: 'Hendra tetap tersenyum, tetapi mengambil kikir dan berpura-pura sibuk dengan potongan cetakan di depannya.',
    },
    tension: { phase: 'awal', expectedKind: 'menarik-diri' },
    choices: [
      {
        id: 'akui',
        skillId: 'sampaikan-pengamatan',
        text: 'Kalimatku tadi mungkin kerasa menyalahkan. Aku mau dengar sisimu dulu.',
        options: { observationTone: 'faktual' },
        action: { kind: 'akui-ketegangan' },
        next: REPAIR,
        best: true,
      },
      {
        id: 'abaikan-validasi',
        skillId: 'validasi-normalisasi',
        text: 'Nggak apa-apa, silakan bantu mereka dulu. Aku tunggu di sini.',
        next: TENSION,
        reaction: {
          text: 'Wah, makasih pengertiannya! Kalau gitu bentar ya.',
          expression: 'menutup-diri',
          cue: 'Hendra langsung berdiri, bergegas ke meja sebelah, dan tidak menoleh ke belakang.',
        },
      },
      {
        id: 'abaikan-jeda',
        skillId: 'jeda-hening',
        text: 'Baik, aku nunggu sebentar aja.',
        next: TENSION,
        reaction: {
          text: 'Eh, iya, iya. Satu cetakan lagi, ya.',
          expression: 'menutup-diri',
          cue: 'Hendra memutar-mutar kikir di tangannya, tetapi pandangannya terpaku pada layar ponsel yang bergetar.',
        },
      },
      {
        id: 'nasihat',
        skillId: 'nasihat-dini',
        text: 'Mulai sekarang tolak aja semua permintaan. Itu jauh lebih sehat buatmu.',
        next: TENSION,
        reaction: {
          text: 'Hehe, iya, nanti dicoba. Gampang itu.',
          expression: 'menutup-diri',
          cue: 'Hendra tertawa pendek, lalu kembali membungkuk ke arah potongan cetakan.',
        },
      },
    ],
  },

  // Ketegangan fase perbaikan: hub tiga langkah + satu opsi keliru
  {
    id: REPAIR,
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Maaf ya, tadi aku malah menghindar. Rasanya kayak dikoreksi, padahal aku cuma pengin bantu.',
      expression: 'menunduk',
      cue: 'Hendra meletakkan kikirnya, menaruh ponsel menelungkup di meja, dan duduk menghadap Dosen.',
    },
    tension: { phase: 'perbaikan' },
    choices: [
      {
        id: 'akui-dampak',
        skillId: 'validasi-normalisasi',
        text: 'Ucapanku tadi memang terdengar menyalahkan. Maaf, itu bukan maksudku.',
        action: { kind: 'perbaikan', step: 'akui-dampak' },
        next: REPAIR,
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Makasih udah bilang. Jadi lebih ringan rasanya.',
          expression: 'netral',
          cue: 'Hendra mengembuskan napas dan bahunya turun perlahan.',
        },
        best: true,
      },
      {
        id: 'eksplorasi-perasaan',
        skillId: 'pertanyaan-terbuka',
        text: 'Boleh tahu, bagian mana yang paling kerasa kayak dikoreksi?',
        action: { kind: 'perbaikan', step: 'eksplorasi-perasaan' },
        next: REPAIR,
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Pas disebut nggak enakan. Soalnya aku takut dicap pelit kalau nolak.',
          expression: 'cemas',
          cue: 'Hendra bicara lebih pelan dari biasanya dan memilin ujung kain lap di tangannya.',
        },
      },
      {
        id: 'beri-pilihan',
        skillId: 'jeda-hening',
        text: 'Kita bisa lanjut pelan, ganti topik, atau stop dulu. Kamu yang tentukan.',
        action: { kind: 'perbaikan', step: 'beri-pilihan' },
        next: REPAIR,
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Lanjut aja, tapi pelan-pelan. Ponselnya kubiarin telungkup dulu.',
          expression: 'lega',
          cue: 'Hendra menepuk punggung ponselnya yang menelungkup dan tersenyum kecil, kali ini tanpa terburu-buru.',
        },
      },
      {
        id: 'remehkan',
        skillId: 'meremehkan',
        text: 'Ah, cuma soal tolong-menolong. Jangan dibesar-besarkan.',
        next: REPAIR,
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Iya, bener. Aku aja yang kebanyakan mikir.',
          expression: 'menutup-diri',
          cue: 'Hendra meraih ponselnya kembali dan membaliknya ke atas.',
        },
      },
    ],
  },
];
