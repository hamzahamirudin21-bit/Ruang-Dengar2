/**
 * Adegan Lab untuk Gilang Ramadhan (mhs-09): pembukaan baku, koreksi mendadak dari rekan timnya
 * di depan orang lain, isyarat rahang mengeras, ajakan ke Ruang Konsultasi, serta Ketegangan
 * `menarik-diri` dan hub perbaikan. Dirakit menjadi STORY_MHS_09 di ./mhs-09.ts.
 */
import type { StoryLine, StoryNode } from '../../engine/story/storyTypes';
import { buildOpeningNode } from '../storyStages';

const STUDENT_ID = 'mhs-09';
const SCENE = 'lab';

const KOREKSI_ASIDE =
  'Rangga, rekan satu timnya, lewat membawa gulungan gambar kerja dan berkata cukup keras: "Gil, sambungan las kemarin masih bolong di pojok, rapikan sebelum dikumpulkan ya."';

const KOREKSI_LINE: StoryLine = {
  text: 'Iya, iya, aku tahu. Nggak usah diumumin satu bengkel juga bisa kali.',
  expression: 'kesal',
  cue: 'Rahang Gilang mengeras. Kikir di tangannya berhenti, lalu ia menancapkannya ke tepi meja dan membelakangi Rangga.',
  aside: KOREKSI_ASIDE,
};

export const GILANG_LAB_NODES: StoryNode[] = [
  // 1. Pembukaan baku
  buildOpeningNode({
    id: 'gi-buka',
    studentId: STUDENT_ID,
    sceneId: SCENE,
    name: 'Gilang',
    reply: {
      text: 'Ya, Bu? Kalau soal tugas kelompok, bilang aja langsung. Aku lagi sibuk nih.',
      expression: 'waspada',
      cue: 'Gilang tetap mengikir sambungan las di tangannya, hanya menoleh sekilas dengan alis berkerut dan rahang yang kaku.',
    },
    best: 'sapaan-hangat',
    next: {
      'sapaan-hangat': 'gi-l2',
      'pertanyaan-terbuka': 'gi-l2',
      'pertanyaan-tertutup': 'gi-l2',
      'nasihat-dini': 'gi-tegang-lab',
    },
    reactions: {
      'sapaan-hangat': {
        text: 'Baik, Bu. Cuma lagi banyak kerjaan di bengkel. Ibu mau ngomongin apa?',
        expression: 'waspada',
        cue: 'Gilang tetap memegang kikir tanpa menoleh sepenuhnya, hanya melirik sekilas ke arah Dosen.',
      },
      'pertanyaan-terbuka': {
        text: 'Pikiranku? Kok Ibu nanya gitu? Aku baik-baik aja kok.',
        expression: 'waspada',
        cue: 'Gilang menyipitkan mata, lalu meniup serbuk logam dari benda kerjanya dengan keras.',
      },
      'pertanyaan-tertutup': {
        text: 'Nggak. Biasa aja.',
        expression: 'netral',
        cue: 'Gilang menjawab pendek dan memutar badan setengah ke arah mesin las.',
      },
    },
  }),

  // 2. Kejutan kecil: koreksi di depan orang; isyarat rahang mengeras
  {
    id: 'gi-l2',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: KOREKSI_LINE,
    marks: ['kejutan', 'isyarat-nonverbal'],
    choices: [
      {
        id: 'pengamatan-faktual',
        reaction: {
          text: 'Ibu merhatiin banget ya. Iya, tadi kikirku memang berhenti. Nggak ada apa-apa.',
          expression: 'waspada',
          cue: 'Gilang menaruh kikirnya di meja dan menyilangkan lengan di dada.',
        },
        skillId: 'sampaikan-pengamatan',
        text: 'Aku lihat rahangmu mengeras dan kikirmu berhenti pas Rangga bicara tadi.',
        options: { observationTone: 'faktual' },
        next: 'gi-l3',
      },
      {
        id: 'refleksi-kesal',
        reaction: {
          text: 'Ya... lumayan, Bu. Nggak enak aja diomongin gitu di depan semua orang.',
          expression: 'kesal',
          cue: 'Gilang mendengus pendek dan menarik lengan jaketnya sampai menutupi pergelangan tangan.',
        },
        skillId: 'refleksi-perasaan',
        text: 'Ditegur keras gitu di depan orang, pasti bikin kesal banget.',
        options: { reflectionNuance: 'kecewa-kesal' },
        next: 'gi-l3',
        best: true,
      },
      {
        id: 'afirmasi',
        reaction: {
          text: 'Hm. Ya ngapain dibales, Bu. Cuma bikin ribut doang.',
          expression: 'netral',
          cue: 'Gilang mengangkat sebelah bahu, tatapannya tetap ke arah benda kerja di depannya.',
        },
        skillId: 'afirmasi-kekuatan',
        text: 'Kamu tetap nahan diri dan nggak membalas Rangga. Itu nggak gampang.',
        next: 'gi-l3',
      },
      {
        id: 'pengamatan-menilai',
        skillId: 'sampaikan-pengamatan',
        text: 'Kamu gampang banget panas kalau dikoreksi, ya.',
        options: { observationTone: 'menilai' },
        next: 'gi-tegang-lab',
        reaction: {
          text: 'Oh, jadi sekarang aku yang salah? Bagus. Sama aja semua.',
          expression: 'kesal',
          cue: 'Gilang menegakkan badan, dadanya naik turun, dan tangannya mencengkeram kikir lebih kuat.',
        },
      },
    ],
  },

  // 3. Ajakan ke Ruang Konsultasi
  {
    id: 'gi-l3',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Kalau mau ngomong, jangan di sini deh. Aku nggak mau jadi tontonan lagi.',
      expression: 'waspada',
      cue: 'Gilang melirik dua temannya di mesin bubut yang tiba-tiba sibuk pura-pura tidak mendengar.',
    },
    choices: [
      {
        id: 'ajak-ruang-bk',
        skillId: 'validasi-normalisasi',
        text: 'Wajar nggak mau jadi tontonan. Mau ngobrol di Ruang Konsultasi, berdua aja?',
        next: 'gi-l3-tolak',
        routes: [{ when: [{ type: 'trust-min', value: 30 }], next: 'gi-b0' }],
        best: true,
      },
      {
        id: 'privasi',
        reaction: {
          text: 'Oke, Bu, jelas. Selain soal keselamatan, nggak keluar dari sini, ya.',
          expression: 'waspada',
          cue: 'Gilang melirik sekeliling sebentar, lalu mengangguk singkat.',
        },
        skillId: 'batas-kerahasiaan',
        text: 'Ceritamu nggak dibawa ke kelompok, kecuali menyangkut keselamatanmu.',
        next: 'gi-l3b',
        setFlags: ['privasi-dijelaskan'],
      },
      {
        id: 'janji-mutlak',
        skillId: 'janji-mutlak',
        text: 'Tenang, di ruang BK tidak akan ada yang tahu. Dijamin 100%.',
        next: 'gi-l3b',
        reaction: {
          text: 'Dijamin? Yang ngomong gitu biasanya malah yang paling dulu bocor.',
          expression: 'waspada',
          cue: 'Gilang mendengus pendek dan melipat tangan di dada.',
        },
      },
      {
        id: 'terbuka',
        reaction: {
          text: 'Tatapan orang, Bu. Ada yang pura-pura kerja, tapi kupingnya ke sini semua.',
          expression: 'kesal',
          cue: 'Gilang melirik ke meja kerja terdekat sambil merendahkan suaranya.',
        },
        skillId: 'pertanyaan-terbuka',
        text: 'Apa sih yang paling bikin kamu ngerasa jadi tontonan di sini?',
        next: 'gi-l3b',
      },
    ],
  },

  // Penolakan keras: takut dianggap bermasalah
  {
    id: 'gi-l3-tolak',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Ruang BK? Nanti dikira aku anak bermasalah. Nggak, di sini aja.',
      expression: 'kesal',
      cue: 'Gilang menaruh kikir ke meja dengan bunyi keras dan berdiri di depan benda kerjanya seperti menjaganya.',
    },
    choices: [
      {
        id: 'privasi',
        reaction: {
          text: 'Hm... kalau Ibu bilang gitu. Tapi aku masih mikir dulu, ya.',
          expression: 'waspada',
          cue: 'Gilang menyipitkan mata dan menggeser berat badannya ke kaki yang lain.',
        },
        skillId: 'batas-kerahasiaan',
        text: 'Ke Ruang Konsultasi bukan berarti bermasalah kok. Ceritamu tetap di antara kita.',
        next: 'gi-l3b',
        setFlags: ['privasi-dijelaskan'],
        best: true,
      },
      {
        id: 'validasi',
        reaction: {
          text: 'Nah, itu. Makasih, Bu. Jarang yang ngerti sampai ke situ.',
          expression: 'tertegun',
          cue: 'Gilang melonggarkan bahunya sedikit, lalu mengalihkan pandangan ke lantai.',
        },
        skillId: 'validasi-normalisasi',
        text: 'Wajar kamu waspada soal anggapan orang. Kita ikuti tempomu aja.',
        next: 'gi-l3b',
      },
      {
        id: 'terbuka',
        reaction: {
          text: 'Yang nggak ada orang lewat, Bu. Pintu tertutup, nggak ada kaca.',
          expression: 'netral',
          cue: 'Gilang menggerakkan tangannya seolah menggambar ruangan dengan dinding penuh.',
        },
        skillId: 'pertanyaan-terbuka',
        text: 'Kalau nggak ada yang menilai, tempat kayak apa yang terasa lebih aman?',
        next: 'gi-l3b',
      },
      {
        id: 'nasihat',
        skillId: 'nasihat-dini',
        text: 'Jangan keras kepala. Ikut saja, ini demi kebaikanmu sendiri.',
        next: 'gi-tegang-lab',
      },
    ],
  },

  // Sedikit melunak setelah privasi dijelaskan
  {
    id: 'gi-l3b',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Hmm. Kalau memang tertutup dan nggak ada yang nonton, boleh deh. Sepuluh menit.',
      expression: 'netral',
      cue: 'Gilang menghembuskan napas panjang, rahangnya melonggar sedikit, dan ia menyeka tangan di kain lap.',
    },
    choices: [
      {
        id: 'ajak-ruang-bk',
        reaction: {
          text: 'Iya deh, Bu. Jalan aja. Tapi jangan lama-lama ya.',
          expression: 'netral',
          cue: 'Gilang menaruh kikirnya, mengambil jaket dari kursi, lalu berjalan di belakang Dosen.',
        },
        skillId: 'afirmasi-kekuatan',
        text: 'Makasih sudah mau kasih waktu. Kita jalan ke Ruang Konsultasi sekarang?',
        next: 'gi-b0',
        best: true,
      },
      {
        id: 'sapaan',
        reaction: {
          text: 'Nggak usah dijagain juga kali, Bu. Tapi ya udah, ayo.',
          expression: 'netral',
          cue: 'Gilang mendengus kecil, tetapi langkahnya tetap menyusul sejajar dengan Dosen.',
        },
        skillId: 'sapaan-hangat',
        text: 'Kalau kamu siap, yuk. Aku jalan di sebelahmu.',
        next: 'gi-b0',
      },
      {
        id: 'tertutup',
        skillId: 'pertanyaan-tertutup',
        text: 'Jadi mau atau tidak? Jawab saja yang jelas.',
        next: 'gi-l3b',
        reaction: {
          text: 'Aku udah bilang boleh, kan? Jangan didesak gitu dong.',
          expression: 'kesal',
          cue: 'Gilang menyipitkan mata dan melempar kain lap ke atas meja.',
        },
      },
      {
        id: 'nasihat',
        skillId: 'nasihat-dini',
        text: 'Nanti jangan marah-marah di sana. Kita bicara dengan kepala dingin.',
        next: 'gi-tegang-lab',
      },
    ],
  },

  // Ketegangan fase awal: Gilang menantang terang-terangan
  {
    id: 'gi-tegang-lab',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Jadi Ibu juga mau ikut nilai aku? Cukup yang kemarin deh. Aku nggak butuh satu penilai lagi.',
      expression: 'kesal',
      cue: 'Gilang membanting pelan sarung tangan lasnya ke meja, rahangnya mengeras, dan suaranya naik sampai dua temannya menoleh.',
    },
    tension: { phase: 'awal', expectedKind: 'menarik-diri' },
    choices: [
      {
        id: 'akui',
        skillId: 'sampaikan-pengamatan',
        text: 'Kalimatku tadi kedengaran menilai. Aku salah mulai, dan aku mau dengar sisimu.',
        options: { observationTone: 'faktual' },
        action: { kind: 'akui-ketegangan' },
        next: 'gi-perbaikan-lab',
        best: true,
      },
      {
        id: 'abaikan-validasi',
        skillId: 'validasi-normalisasi',
        text: 'Aku paham kamu kesal. Silakan lanjut, aku duduk di sini aja.',
        next: 'gi-tegang-lab',
        reaction: {
          text: 'Paham? Kalau paham, jangan berdiri di sini terus dong.',
          expression: 'kesal',
          cue: 'Gilang menyalakan mesin gerinda kecil, bunyinya menutup suara apa pun.',
        },
      },
      {
        id: 'abaikan-jeda',
        skillId: 'jeda-hening',
        text: 'Baik, aku tunggu sebentar.',
        next: 'gi-tegang-lab',
        reaction: {
          text: 'Nunggu apa? Aku nggak punya waktu buat tatap-tatapan.',
          expression: 'kesal',
          cue: 'Gilang mengayunkan kikir ke benda kerja lebih keras dari sebelumnya tanpa menoleh.',
        },
      },
      {
        id: 'nasihat',
        skillId: 'nasihat-dini',
        text: 'Tenang dulu, nada bicaramu jangan begitu. Pelankan suaramu.',
        next: 'gi-tegang-lab',
        reaction: {
          text: 'Nada bicaraku? Tuh kan. Dikoreksi lagi.',
          expression: 'kesal',
          cue: 'Gilang tertawa pendek tanpa senyum dan menunjuk lantai dengan ujung kikir.',
        },
      },
    ],
  },

  // Ketegangan fase perbaikan: hub tiga langkah + satu opsi keliru
  {
    id: 'gi-perbaikan-lab',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Ya udah. Tapi bilang dulu, Ibu sebenarnya maunya apa? Jangan sampai aku salah denger lagi.',
      expression: 'waspada',
      cue: 'Gilang melepas sarung tangannya satu per satu, masih berdiri, tetapi bahunya turun sedikit.',
    },
    tension: { phase: 'perbaikan' },
    choices: [
      {
        id: 'akui-dampak',
        skillId: 'validasi-normalisasi',
        text: 'Ucapanku tadi terasa menyudutkanmu di depan teman. Maaf ya, bukan itu maksudku.',
        action: { kind: 'perbaikan', step: 'akui-dampak' },
        next: 'gi-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Hm. Jarang ada yang bilang gitu. Oke.',
          expression: 'netral',
          cue: 'Gilang menghela napas panjang dan menurunkan bahunya yang tadi terangkat.',
        },
        best: true,
      },
      {
        id: 'eksplorasi-perasaan',
        skillId: 'pertanyaan-terbuka',
        text: 'Boleh cerita, bagian mana yang paling nyesek waktu kerjamu dikomentari?',
        action: { kind: 'perbaikan', step: 'eksplorasi-perasaan' },
        next: 'gi-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Bukan kritiknya. Tapi dibilang di depan semua, kayak kerjaku nggak ada artinya.',
          expression: 'kesal',
          cue: 'Gilang berbicara lebih pelan, matanya tertuju pada sambungan las di meja.',
        },
      },
      {
        id: 'beri-pilihan',
        skillId: 'jeda-hening',
        text: 'Kita bisa lanjut sekarang, nanti, atau cukup sampai sini. Kamu yang pilih ya.',
        action: { kind: 'perbaikan', step: 'beri-pilihan' },
        next: 'gi-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Lanjut. Tapi jangan lama-lama, dan jangan di depan orang.',
          expression: 'netral',
          cue: 'Gilang menaruh kikir di rak, lalu menyilangkan tangan, kali ini dengan sikap lebih longgar.',
        },
      },
      {
        id: 'remehkan',
        skillId: 'meremehkan',
        text: 'Cuma ditegur soal las aja kok sampai marah. Teman-temanmu juga sering dikoreksi.',
        next: 'gi-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Cuma? Teman-teman? Ya udah, berarti aku emang sendirian.',
          expression: 'kesal',
          cue: 'Gilang memunggungi Dosen dan menyalakan kembali gerindanya.',
        },
      },
    ],
  },
];
