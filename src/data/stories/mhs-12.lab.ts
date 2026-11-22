/**
 * Adegan Lab untuk Sari Melati (mhs-12): pembukaan baku, cerita penengah yang riang,
 * kejutan dua teman memanggil, isyarat bahu turun, ajakan ke Ruang BK dengan dua rute berurutan,
 * serta Ketegangan `konfrontasi` dan hub perbaikan.
 * Dirakit menjadi STORY_MHS_12 di ./mhs-12.ts (tugas 13.6).
 */
import type { StoryLine, StoryNode } from '../../engine/story/storyTypes';
import { buildOpeningNode } from '../storyStages';

const STUDENT_ID = 'mhs-12';
const SCENE = 'lab';

/** Selingan kejutan di s-l2; dipakai ulang bila reaksi pilihan menggantikan balasan simpul. */
const FRIENDS_ASIDE =
  'Dari seberang meja dua temannya berseru, "Sar, tolong bilangin dia dong!" "Sar, jadwalnya mana?"';

const KEJUTAN_LINE: StoryLine = {
  text: 'Seru banget kok! Dimas sama Kevin debat soal modul, aku yang atur, beres. Biasa, anak penghubung! ... Iya iya, bentar!',
  expression: 'tersenyum',
  cue: 'Begitu kedua temannya menoleh pergi, senyum Sari turun sekejap dan bahunya merosot sebelum ia menegakkannya lagi.',
  aside: FRIENDS_ASIDE,
};

/** Rute ajakan ke Ruang BK: citra diperkuat atau kepercayaan rendah membuat Sari menepis. */
const AJAKAN_ROUTES = [
  { when: [{ type: 'flag' as const, flag: 'citra-diperkuat' }], next: 's-l3-tolak' },
  { when: [{ type: 'trust-max' as const, value: 59 }], next: 's-l3-tolak' },
];

export const SARI_LAB_NODES: StoryNode[] = [
  // 1. Pembukaan baku
  buildOpeningNode({
    id: 's-buka',
    studentId: STUDENT_ID,
    sceneId: SCENE,
    name: 'Sari',
    reply: {
      text: 'Haii! Mau ikut diskusi? Duduk sini aja, literally seru banget!',
      expression: 'tersenyum',
      cue: 'Sari melambai sambil tangan satunya memegang dua lembar jadwal kelompok.',
    },
    best: 'pertanyaan-terbuka',
    next: {
      'sapaan-hangat': 's-l1',
      'pertanyaan-terbuka': 's-l1',
      'pertanyaan-tertutup': 's-l1',
      'nasihat-dini': 's-tegang-lab',
    },
    reactions: {
      'pertanyaan-terbuka': {
        text: 'Pikiranku? Hehe, soal kelompok sih, literally lagi seru banget. Tadi pagi Dimas sama Kevin debat soal pembagian modul, terus aku yang nyambungin. Biasa, anak penghubung!',
        expression: 'tersenyum',
        cue: 'Sari tertawa sambil mengangkat dua lembar jadwal di tangannya, lalu menoleh sekilas ke meja diskusi.',
      },
      'sapaan-hangat': {
        text: 'Kabar? Baik dong! Kelompokku lagi heboh banget, tapi jujurly seru kok.',
        expression: 'tersenyum',
        cue: 'Sari menjawab cepat sambil merapikan tumpukan jadwal di depannya.',
      },
      'pertanyaan-tertutup': {
        text: 'Hah? Aku? Baik-baik aja dong, masa nggak. Yuk, gaskeun duduk!',
        expression: 'tersenyum',
        cue: 'Tawa Sari terdengar sedikit terlalu cepat, dan ia segera menggeser kursi untuk Dosen.',
      },
    },
  }),

  // 2. Sari bercerita riang sebagai penengah
  {
    id: 's-l1',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Seru banget sumpah! Tadi pagi Dimas sama Kevin sempat debat soal pembagian modul, terus aku bantu atur, jadi beres. Biasa lah, aku tuh anak penghubung!',
      expression: 'tersenyum',
      cue: 'Sari tertawa; jarinya tak berhenti memutar pulpen.',
    },
    choices: [
      {
        id: 'pengamatan-faktual',
        skillId: 'sampaikan-pengamatan',
        text: 'Aku perhatiin, tiap ada yang berselisih, mereka langsung noleh ke kamu.',
        reaction: {
          text: 'Hehe, kelihatan banget ya? Namanya juga anak penghubung, mereka udah kebiasaan. ... Iya iya, bentar!',
          expression: 'tersenyum',
          cue: 'Sari tertawa sambil memutar pulpen, lalu menoleh ke arah temannya.',
          aside: 'Dari seberang meja, dua temannya berseru bergantian: "Sar, tolong bilangin dia dong!" dan "Sar, jadwalnya mana?"',
        },
        options: { observationTone: 'faktual' },
        next: 's-l2',
        setFlags: ['pengamatan-peran'],
        best: true,
      },
      {
        id: 'afirmasi-bintang',
        skillId: 'afirmasi-kekuatan',
        text: 'Kamu bintang lab, semua orang suka sama kamu.',
        next: 's-l2',
        setFlags: ['citra-diperkuat'],
        reaction: {
          text: 'Ah, biasa aja kok. Hehe, makasih ya, jadi salting nih!',
          expression: 'tersenyum',
          cue: 'Sari tertawa ringan dan melambaikan tangan, senyumnya tetap rapi dan tak bergeser.',
        },
      },
      {
        id: 'validasi',
        skillId: 'validasi-normalisasi',
        text: 'Menengahi teman yang berdebat itu nggak gampang. Wajar kalau mereka nanya kamu.',
        reaction: {
          text: 'Hehe, makasih. Ya gitu deh, udah kebiasaan sih mereka nanya ke aku dulu. ... Iya iya, bentar!',
          expression: 'tersenyum',
          cue: 'Sari tersenyum lebar dan tangannya melambai ke arah meja seberang.',
          aside: 'Dari seberang meja, dua temannya berseru bergantian: "Sar, tolong bilangin dia dong!" dan "Sar, jadwalnya mana?"',
        },
        next: 's-l2',
      },
      {
        id: 'remehkan',
        skillId: 'meremehkan',
        text: 'Itu kerjaan ringan dibanding yang lain, kan?',
        next: 's-tegang-lab',
      },
    ],
  },

  // 3. Kejutan: dua teman memanggil; isyarat bahu turun
  {
    id: 's-l2',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: KEJUTAN_LINE,
    marks: ['kejutan', 'isyarat-nonverbal'],
    choices: [
      {
        id: 'jeda',
        skillId: 'jeda-hening',
        text: 'Aku tunggu sebentar ya. Nggak apa-apa, kamu nggak perlu langsung cerita.',
        next: 's-l3',
        reaction: {
          text: 'Hehe... lagi rame banget ya hari ini.',
          expression: 'lelah',
          cue: 'Sari menarik napas panjang tanpa suara, lalu matanya turun ke jadwal di tangannya.',
          aside: FRIENDS_ASIDE,
        },
        best: true,
      },
      {
        id: 'terbuka',
        skillId: 'pertanyaan-terbuka',
        text: 'Kalau dipanggil gantian kayak tadi, biasanya kamu ngerasa gimana?',
        reaction: {
          text: 'Hmm, rame sih, hehe. Kadang bangga, kadang ya agak buru-buru aja. Maaf ya, jadi ketunda, jujurly aku nggak enak ninggalin mereka.',
          expression: 'cemas',
          cue: 'Sari melirik ke meja seberang, lalu cepat-cepat kembali tersenyum pada Dosen.',
        },
        next: 's-l3',
      },
      {
        id: 'afirmasi-bintang',
        skillId: 'afirmasi-kekuatan',
        text: 'Lihat, semuanya mencarimu. Kamu memang bintang di lab ini!',
        next: 's-l3',
        setFlags: ['citra-diperkuat'],
        reaction: {
          text: 'Ah, apaan sih, biasa aja! Hehe.',
          expression: 'tersenyum',
          cue: 'Sari tertawa keras, tetapi matanya tidak ikut tersenyum.',
        },
      },
      {
        id: 'interogasi',
        skillId: 'interogasi',
        text: 'Kenapa kamu selalu mau saja disuruh-suruh begitu? Sebenarnya kamu capek, kan?',
        next: 's-tegang-lab',
      },
    ],
  },

  // 3. Ajakan ke Ruang BK dengan dua rute berurutan
  {
    id: 's-l3',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Eh, maaf ya, jadi ketunda. Jujurly aku nggak enak ninggalin mereka.',
      expression: 'cemas',
      cue: 'Sari melirik ke meja seberang, lalu cepat-cepat kembali tersenyum pada Dosen.',
    },
    choices: [
      {
        id: 'ajak-ruang-bk',
        skillId: 'batas-kerahasiaan',
        text: 'Obrolan kita nggak dibawa ke kelompok mana pun. Duduk bentar di tempat tenang, yuk?',
        reaction: {
          text: 'Serius nggak dibawa ke kelompok? Oke, lega dikit, hehe. Ya udah, yuk. ... Nah, sampai. Adem banget di sini, boleh numpang rebahan nih, mager banget.',
          expression: 'tersenyum',
          cue: 'Sari berjalan di samping Dosen, lalu menjatuhkan diri ke kursi dengan napas panjang begitu masuk ruangan.',
        },
        next: 's-b0',
        routes: AJAKAN_ROUTES,
        best: true,
      },
      {
        id: 'ajak-validasi',
        skillId: 'validasi-normalisasi',
        text: 'Wajar kok nggak enak sama mereka. Kalau mau, kita ke Ruang Konsultasi sebentar.',
        reaction: {
          text: 'Makasih ngerti, hehe. Ya udah, sebentar aja ya. ... Wah, adem banget di sini. Boleh numpang rebahan dikit nggak? Mager banget nih.',
          expression: 'tersenyum',
          cue: 'Sari mengikuti Dosen masuk ruangan, lalu menjatuhkan diri ke kursi dan meregangkan bahu.',
        },
        next: 's-b0',
        routes: AJAKAN_ROUTES,
      },
      {
        id: 'janji-mutlak',
        skillId: 'janji-mutlak',
        text: 'Tenang, di ruang BK semuanya pasti aman, tidak akan ada yang tahu sama sekali.',
        next: 's-l3-tolak',
        reaction: {
          text: 'Wah, serius? Hehe, tapi... nanti aja deh, kasihan mereka.',
          expression: 'waspada',
          cue: 'Senyum Sari bertahan, tetapi tangannya meremas lembar jadwal hingga sedikit kusut.',
        },
      },
      {
        id: 'nasihat',
        skillId: 'nasihat-dini',
        text: 'Kamu itu jangan terlalu memikirkan perasaan orang lain. Ikut aku saja sekarang.',
        next: 's-tegang-lab',
      },
    ],
  },

  // Sari menepis dengan riang
  {
    id: 's-l3-tolak',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Ah, aku baik-baik aja kok, santuy! Yuk gaskeun diskusi aja.',
      expression: 'tersenyum',
      cue: 'Sari menepuk meja pelan dan tersenyum lebar, tetapi pandangannya tidak benar-benar bertemu mata Dosen.',
    },
    choices: [
      {
        id: 'privasi',
        skillId: 'batas-kerahasiaan',
        text: 'Aku percaya kamu baik-baik aja. Kalau mau cerita, cuma kita berdua yang tahu.',
        reaction: {
          text: 'Oke deh, aku ikut. Tapi sebentar aja ya, sekitar seperempat jam, mereka masih bisa nunggu kok.',
          expression: 'netral',
          cue: 'Sari menghembuskan napas pendek dan menepuk meja pelan sebelum berdiri.',
        },
        next: 's-l3b',
        setFlags: ['privasi-dijelaskan'],
        best: true,
      },
      {
        id: 'pengamatan-faktual',
        skillId: 'sampaikan-pengamatan',
        text: 'Tadi bahumu sempat turun waktu teman-temanmu manggil. Aku sempat lihat.',
        reaction: {
          text: 'Hah, kelihatan ya? Mungkin cuma pegel, hehe. Ya udah deh, aku ikut, tapi sebentar aja ya, seperempat jam. Mereka masih bisa nunggu kok.',
          expression: 'netral',
          cue: 'Sari menegakkan bahunya cepat-cepat dan tertawa kecil sambil mengalihkan pandangan.',
        },
        options: { observationTone: 'faktual' },
        next: 's-l3b',
        setFlags: ['pengamatan-peran'],
      },
      {
        id: 'terbuka',
        skillId: 'pertanyaan-terbuka',
        text: 'Kalau diskusinya ditunda sebentar, apa yang paling kamu khawatirkan?',
        reaction: {
          text: 'Paling mereka bingung nyari jadwal, atau debat lagi, hehe. Tapi ya udah deh, aku ikut sebentar. Seperempat jam aja ya.',
          expression: 'netral',
          cue: 'Sari mengetuk-ngetuk meja dengan jari, lalu meraih jadwal kelompoknya.',
        },
        next: 's-l3b',
      },
      {
        id: 'nasihat',
        skillId: 'nasihat-dini',
        text: 'Jangan berpura-pura kuat terus, Sari. Akui saja kalau kamu lelah.',
        next: 's-tegang-lab',
      },
    ],
  },

  // Sari menerima ajakan setelah privasi dijelaskan
  {
    id: 's-l3b',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Hmm... iya deh. Lima belas menit aja ya, literally. Mereka bisa nunggu bentar kok.',
      expression: 'netral',
      cue: 'Sari menghembuskan napas pendek, menaruh jadwal di meja, dan mengambil ponselnya dari saku.',
    },
    choices: [
      {
        id: 'ajak-ruang-bk',
        skillId: 'validasi-normalisasi',
        text: 'Makasih sudah mau meluangkan waktu. Kita jalan santai ke Ruang Konsultasi ya.',
        reaction: {
          text: 'Sama-sama, hehe. Ayo deh. ... Wah, sampai. Adem banget di sini ya, jujurly. Boleh numpang rebahan bentar nggak? Mager banget.',
          expression: 'tersenyum',
          cue: 'Sari berjalan santai di samping Dosen, lalu menjatuhkan diri ke kursi sambil tertawa.',
        },
        next: 's-b0',
        best: true,
      },
      {
        id: 'sapaan',
        skillId: 'sapaan-hangat',
        text: 'Senang kamu mau ikut. Aku temani jalan ke sana, santai aja.',
        reaction: {
          text: 'Santuy aja, hehe. Yuk jalan. ... Nah, sampai. Wih, adem banget ruangannya. Boleh nyender dulu nggak? Aku mager banget.',
          expression: 'tersenyum',
          cue: 'Sari melangkah ringan di samping Dosen, lalu bersandar ke kursi begitu duduk.',
        },
        next: 's-b0',
      },
      {
        id: 'afirmasi',
        skillId: 'afirmasi-kekuatan',
        text: 'Kamu berani nyisihin waktu buat dirimu. Itu nggak mudah buat yang selalu dibutuhkan.',
        reaction: {
          text: 'Hehe, bisa aja. Iya sih, jarang banget aku ngambil waktu begini. ... Wah, ruangannya adem banget. Boleh numpang nyender dulu nggak? Mager nih.',
          expression: 'tersenyum',
          cue: 'Sari tersenyum kikuk, lalu duduk dan menyandarkan punggungnya ke kursi.',
        },
        next: 's-b0',
      },
      {
        id: 'tertutup',
        skillId: 'pertanyaan-tertutup',
        text: 'Jadi kamu memang lagi ada masalah, ya? Iya atau tidak saja.',
        next: 's-tegang-lab',
      },
    ],
  },

  // Ketegangan fase awal: Sari mengonfrontasi
  {
    id: 's-tegang-lab',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Ringan? Kamu tuh nggak tahu apa yang kutanggung.',
      expression: 'kesal',
      cue: 'Sari menyilangkan tangan, rahangnya mengeras, dan suaranya naik sedikit sampai satu dua teman menoleh.',
    },
    tension: { phase: 'awal', expectedKind: 'konfrontasi' },
    choices: [
      {
        id: 'akui',
        skillId: 'sampaikan-pengamatan',
        text: 'Kalimatku tadi terdengar meremehkan, dan kamu kesal. Aku mau dengerin sisimu dulu.',
        options: { observationTone: 'faktual' },
        action: { kind: 'akui-ketegangan' },
        next: 's-perbaikan-lab',
        best: true,
      },
      {
        id: 'abaikan-validasi',
        skillId: 'validasi-normalisasi',
        text: 'Sudah, sudah, jangan marah. Semua orang punya hari yang berat.',
        next: 's-tegang-lab',
        reaction: {
          text: 'Aku enggak marah kok. Udah, lupain aja.',
          expression: 'kesal',
          cue: 'Sari memalingkan wajah ke jendela; senyumnya hilang sama sekali.',
        },
      },
      {
        id: 'abaikan-jeda',
        skillId: 'jeda-hening',
        text: 'Baik, aku diam saja dulu di sini.',
        next: 's-tegang-lab',
        reaction: {
          text: 'Terserah deh.',
          expression: 'kesal',
          cue: 'Sari mengetuk-ngetukkan pulpen ke meja dengan cepat dan tidak menatap Dosen.',
        },
      },
      {
        id: 'nasihat',
        skillId: 'nasihat-dini',
        text: 'Kamu harus belajar mengendalikan emosi, Sari. Jangan terbawa suasana.',
        next: 's-tegang-lab',
        reaction: {
          text: 'Oh, jadi sekarang aku yang salah? Hebat.',
          expression: 'kesal',
          cue: 'Sari berdiri setengah dari kursinya, lalu duduk lagi dengan napas tertahan.',
        },
      },
    ],
  },

  // Ketegangan fase perbaikan: hub empat langkah
  {
    id: 's-perbaikan-lab',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Ya... aku tuh cuma nggak suka kalau semua dianggap gampang. Capek banget sumpah, aku udah berusaha.',
      expression: 'lelah',
      cue: 'Sari menghembuskan napas panjang dan melepas silangan tangannya pelan-pelan.',
    },
    tension: { phase: 'perbaikan' },
    choices: [
      {
        id: 'akui-dampak',
        skillId: 'validasi-normalisasi',
        text: 'Aku sadar ucapanku tadi mengecilkan usahamu, dan itu bukan maksudku.',
        action: { kind: 'perbaikan', step: 'akui-dampak' },
        next: 's-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Iya... valid sih. Makasih udah sadar, agak lega dengernya.',
          expression: 'netral',
          cue: 'Rahang Sari mengendur dan ia menyandarkan punggung ke kursi.',
        },
        best: true,
      },
      {
        id: 'eksplorasi-perasaan',
        skillId: 'pertanyaan-terbuka',
        text: 'Boleh banget aku tahu, bagian mana dari ucapanku tadi yang terasa nggak adil?',
        action: { kind: 'perbaikan', step: 'eksplorasi-perasaan' },
        next: 's-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Kayak semua yang kulakuin itu dianggap emang udah tugasku. Padahal literally nggak gampang.',
          expression: 'lelah',
          cue: 'Suara Sari merendah dan matanya sekilas berkaca-kaca sebelum ia mengedip cepat.',
        },
      },
      {
        id: 'beri-pilihan',
        skillId: 'jeda-hening',
        text: 'Kita bisa lanjut pelan-pelan, balik ke diskusi, atau cukup. Terserah kamu ya.',
        action: { kind: 'perbaikan', step: 'beri-pilihan' },
        next: 's-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Lanjut aja, tapi santai ya, jangan buru-buru.',
          expression: 'lega',
          cue: 'Bahu Sari turun dan ia meletakkan jadwal kelompok di pinggir meja, menjauh dari tangannya.',
        },
      },
      {
        id: 'remehkan',
        skillId: 'meremehkan',
        text: 'Sudahlah, itu cuma soal sepele. Jangan dibesar-besarkan.',
        next: 's-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Oh. Oke. Sepele ya.',
          expression: 'menutup-diri',
          cue: 'Sari tersenyum tipis yang kaku, lalu mengambil ponselnya dan menunduk ke layar.',
        },
      },
    ],
  },
];
