/**
 * Adegan Lab untuk Nisa Nurhaliza (mhs-13): pembukaan baku, teman yang datang mengeluh mendadak,
 * isyarat menghela napas panjang, ajakan ke Ruang Konsultasi, serta Ketegangan `menarik-diri`
 * dan hub perbaikan. Dirakit menjadi STORY_MHS_13 di ./mhs-13.ts.
 */
import type { StoryLine, StoryNode } from '../../engine/story/storyTypes';
import { buildOpeningNode } from '../storyStages';

const STUDENT_ID = 'mhs-13';
const SCENE = 'lab';

const FIRA_ASIDE =
  'Fira, teman satu kelompok, datang membawa papan rangkaian yang hangus dan langsung duduk di sebelah Nisa sambil menggerutu pelan.';

const FIRA_LINE: StoryLine = {
  text: 'Eh, Fira. Iya, Fir, cerita aja, aku dengerin kok. Maaf ya, Bu, cuma sebentar banget.',
  expression: 'terkejut',
  cue: 'Nisa menggeser kursinya agar Fira bisa duduk, mengangguk-angguk selama Fira bicara, lalu menghela napas panjang begitu Fira pergi.',
  aside: FIRA_ASIDE,
};

export const NISA_LAB_NODES: StoryNode[] = [
  // 1. Pembukaan baku
  buildOpeningNode({
    id: 'ni-buka',
    studentId: STUDENT_ID,
    sceneId: SCENE,
    name: 'Nisa',
    reply: {
      text: 'Siang, Bu! Ibu sendiri apa kabar? Udah makan belum? Kayaknya hari Ibu padat banget juga deh.',
      expression: 'tersenyum',
      cue: 'Nisa mendongak dari papan rangkaian, tersenyum lebar, dan langsung memiringkan badan ke arah Dosen seolah ingin mendengar lebih dulu.',
    },
    best: 'sapaan-hangat',
    next: {
      'sapaan-hangat': 'ni-l2',
      'pertanyaan-terbuka': 'ni-l2',
      'pertanyaan-tertutup': 'ni-l2',
      'nasihat-dini': 'ni-tegang-lab',
    },
    reactions: {
      'sapaan-hangat': {
        text: 'Aku baik kok, Bu, makasih udah nanya! Eh, bentar, Fira dateng. Iya, Fir, cerita aja, aku dengerin. Maaf ya, Bu, cuma sebentar banget.',
        expression: 'terkejut',
        cue: 'Nisa menjawab sambil tersenyum, lalu menggeser kursinya agar Fira bisa duduk, mengangguk-angguk selama Fira bicara, dan menghela napas panjang begitu Fira pergi.',
        aside: 'Fira, teman satu kelompok, datang membawa papan rangkaian yang hangus dan duduk di sebelah Nisa sambil menggerutu pelan.',
      },
      'pertanyaan-terbuka': {
        text: 'Aku? Hehe, biasa aja kok, Bu. Ibu dulu deh, tadi pagi sibuk apa?',
        expression: 'tersenyum',
        cue: 'Nisa terkekeh pelan dan membalikkan pertanyaan itu dengan mata yang tetap tertuju pada wajah Dosen.',
      },
      'pertanyaan-tertutup': {
        text: 'Baik-baik aja kok, Bu. Ibu sendiri baik, kan?',
        expression: 'tersenyum',
        cue: 'Nisa menjawab ringan, lalu cepat-cepat mengganti sasaran obrolan ke Dosen.',
      },
    },
  }),

  // 2. Kejutan kecil: teman datang mengeluh; isyarat menghela napas panjang
  {
    id: 'ni-l2',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: FIRA_LINE,
    marks: ['kejutan', 'isyarat-nonverbal'],
    choices: [
      {
        id: 'pengamatan-faktual',
        skillId: 'sampaikan-pengamatan',
        text: 'Tadi kamu dengerin Fira serius banget, terus narik napas panjang pas dia pergi.',
        reaction: {
          text: 'Hehe, ketahuan ya, Bu. Iya, tadi ceritanya lumayan panjang, tapi nggak apa-apa kok, Fira kan lagi butuh. Cuma di sini emang gampang banget disamperin.',
          expression: 'netral',
          cue: 'Nisa tertawa kecil sambil menyentuh dadanya sekilas, lalu melirik meja seberang tempat dua temannya sesekali menoleh ke arahnya.',
        },
        options: { observationTone: 'faktual' },
        next: 'ni-l3',
        setFlags: ['isyarat-diperhatikan'],
        best: true,
      },
      {
        id: 'afirmasi',
        skillId: 'afirmasi-kekuatan',
        text: 'Kamu pendengar yang baik. Pantes teman-teman suka curhat ke kamu.',
        reaction: {
          text: 'Wah, makasih, Bu. Aku seneng sih kalau bisa bantu. Tapi di sini mereka gampang banget nyamperin, jadi aku sering nggak enak kalau mau sendirian dulu.',
          expression: 'tersenyum',
          cue: 'Nisa tersipu dan merapikan kerudungnya, lalu matanya melirik meja seberang tempat dua temannya sesekali menoleh ke arahnya.',
        },
        next: 'ni-l3',
      },
      {
        id: 'tertutup',
        skillId: 'pertanyaan-tertutup',
        text: 'Fira sering curhat begitu ya? Kamu nggak keberatan?',
        reaction: {
          text: 'Sering sih, Bu. Keberatan? Hehe, nggak kok, namanya juga teman. Cuma di sini tiap bentar ada aja yang nyamperin.',
          expression: 'netral',
          cue: 'Nisa menggeleng cepat sambil tersenyum, tetapi pandangannya melirik meja seberang tempat dua temannya sesekali menoleh ke arahnya.',
        },
        next: 'ni-l3',
      },
      {
        id: 'pengamatan-menilai',
        skillId: 'sampaikan-pengamatan',
        text: 'Kamu kayaknya susah nolak orang, ya. Semua kamu iyakan.',
        options: { observationTone: 'menilai' },
        next: 'ni-tegang-lab',
        reaction: {
          text: 'Oh, gitu ya. Maaf, Bu, mungkin aku emang kurang tegas. Nanti aku perbaiki deh.',
          expression: 'menutup-diri',
          cue: 'Senyum Nisa mengecil; ia menunduk dan merapikan kabel di mejanya yang sebenarnya sudah rapi.',
        },
      },
    ],
  },

  // 3. Ajakan ke Ruang Konsultasi
  {
    id: 'ni-l3',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Kalau ngobrol di sini, nanti pasti ada aja yang nyamperin. Mereka pasti butuh aku, dan aku tuh nggak enakan buat nolak.',
      expression: 'netral',
      cue: 'Nisa melirik meja seberang tempat dua temannya sesekali menoleh ke arahnya, lalu merendahkan suara.',
    },
    choices: [
      {
        id: 'ajak-ruang-bk',
        skillId: 'validasi-normalisasi',
        text: 'Masuk akal kok butuh tempat tenang. Mau ngobrol di Ruang Konsultasi, berdua aja?',
        next: 'ni-l3-tolak',
        routes: [{ when: [{ type: 'trust-min', value: 60 }], next: 'ni-b0' }],
        best: true,
      },
      {
        id: 'privasi',
        skillId: 'batas-kerahasiaan',
        text: 'Obrolan kita nggak sampai ke teman-temanmu, kecuali soal keselamatanmu.',
        reaction: {
          text: 'Beneran nggak sampai ke mereka ya, Bu? Syukurlah. Ya udah, aku mau deh, tapi sebentar aja ya. Fira nanti kukabarin lewat chat.',
          expression: 'netral',
          cue: 'Nisa mengembuskan napas lega, menutup tutup solder, dan bahunya turun sedikit.',
        },
        next: 'ni-l3b',
        setFlags: ['privasi-dijelaskan'],
      },
      {
        id: 'janji-mutlak',
        skillId: 'janji-mutlak',
        text: 'Di ruang BK nggak bakal ada yang ganggu, semua pasti beres dan aman.',
        next: 'ni-l3b',
        reaction: {
          text: 'Oh, gitu. Ya syukurlah kalau gitu, Bu. Makasih ya.',
          expression: 'waspada',
          cue: 'Nisa tetap tersenyum sopan, tetapi jemarinya meremas ujung kerudungnya.',
        },
      },
      {
        id: 'terbuka',
        skillId: 'pertanyaan-terbuka',
        text: 'Apa yang terasa berat kalau teman-teman nyamperin kamu di sini?',
        reaction: {
          text: 'Berat ya... bukan berat banget sih, Bu. Cuma susah fokus kalau diliatin banyak orang. Ya udah, sebentar aja ya, nanti aku chat Fira dulu.',
          expression: 'netral',
          cue: 'Nisa menutup tutup solder, menarik napas, dan bahunya turun sedikit sambil tersenyum kecil.',
        },
        next: 'ni-l3b',
      },
    ],
  },

  // Penolakan halus: mengutamakan orang lain
  {
    id: 'ni-l3-tolak',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Hmm, nanti dulu ya, Bu. Fira bilang mau balik lagi, kasihan kalau dia nyariin aku dan aku nggak ada.',
      expression: 'netral',
      cue: 'Nisa menoleh ke pintu lab, lalu kembali menatap Dosen dengan senyum yang meminta maaf.',
    },
    choices: [
      {
        id: 'privasi',
        skillId: 'batas-kerahasiaan',
        text: 'Boleh aku jelasin dulu? Ceritamu aman, dan kamu boleh berhenti kapan aja.',
        reaction: {
          text: 'Boleh berhenti kapan aja? Hm, oke deh, Bu. Sebentar aja ya, Fira nanti kukabarin lewat chat biar dia nggak nyariin.',
          expression: 'netral',
          cue: 'Nisa menutup tutup solder dan mengangguk pelan, bahunya turun sedikit.',
        },
        next: 'ni-l3b',
        setFlags: ['privasi-dijelaskan'],
        best: true,
      },
      {
        id: 'validasi',
        skillId: 'validasi-normalisasi',
        text: 'Wajar kok mikirin Fira. Kita ikuti ritmemu aja, santai.',
        reaction: {
          text: 'Makasih ya, Bu, udah ngertiin. Rasanya jadi nggak se-kepikiran. Ya udah, sebentar aja, aku chat Fira dulu.',
          expression: 'tersenyum',
          cue: 'Nisa tersenyum kecil, menutup tutup solder, lalu mengembuskan napas dan bahunya turun sedikit.',
        },
        next: 'ni-l3b',
      },
      {
        id: 'terbuka',
        skillId: 'pertanyaan-terbuka',
        text: 'Kalau Fira nggak lagi nunggu, kamu sendiri maunya apa sekarang?',
        reaction: {
          text: 'Aku sendiri? Hehe, jarang banget ada yang nanya gitu, Bu. Kayaknya pengin duduk tenang bentar aja. Ya udah ayo, tapi sebentar ya, Fira kukabarin dulu lewat chat.',
          expression: 'tersenyum',
          cue: 'Nisa tertawa kecil, menutup tutup solder, lalu mengembuskan napas dan bahunya turun sedikit.',
        },
        next: 'ni-l3b',
      },
      {
        id: 'nasihat',
        skillId: 'nasihat-dini',
        text: 'Fira bisa nunggu. Pikirin dirimu dulu dan ikut aku aja.',
        next: 'ni-tegang-lab',
      },
    ],
  },

  // Lebih longgar setelah privasi dijelaskan
  {
    id: 'ni-l3b',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Iya deh, Bu. Sebentar aja ya. Nanti aku kabarin Fira lewat chat kalau agak lama.',
      expression: 'netral',
      cue: 'Nisa menutup tutup solder, mengembuskan napas, dan bahunya turun sedikit.',
    },
    choices: [
      {
        id: 'ajak-ruang-bk',
        skillId: 'afirmasi-kekuatan',
        text: 'Makasih sudah mau luangin waktu buat dirimu. Kita jalan pelan ke sana, ya?',
        reaction: {
          text: 'Hehe, baru kali ini ada yang bilang gitu ke aku, Bu. Yuk, pelan-pelan. Nah, sampai. Silakan duduk dulu, Bu. Kursinya enak? Kalau kurang nyaman aku tukar. Mau air putih?',
          expression: 'tersenyum',
          cue: 'Nisa menunggu Dosen duduk lebih dulu, baru ia sendiri duduk di tepi kursi dengan ponsel tertelungkup di pangkuan.',
        },
        next: 'ni-b0',
        best: true,
      },
      {
        id: 'sapaan',
        skillId: 'sapaan-hangat',
        text: 'Kalau udah siap, yuk ke Ruang Konsultasi. Aku temenin jalan.',
        reaction: {
          text: 'Siap, Bu, makasih udah nemenin jalan. Nah, ini ruangannya. Silakan duduk dulu, Bu. Kursinya nyaman nggak? Atau mau minum air putih dulu?',
          expression: 'tersenyum',
          cue: 'Nisa menahan pintu agar Dosen masuk lebih dulu, lalu duduk di tepi kursi dengan ponsel tertelungkup di pangkuan.',
        },
        next: 'ni-b0',
      },
      {
        id: 'tertutup',
        skillId: 'pertanyaan-tertutup',
        text: 'Jadi mau atau nggak? Jawab ya atau nggak aja.',
        next: 'ni-l3b',
        reaction: {
          text: 'Eh, mau, Bu. Maaf, maaf, aku jadi bingung jawabnya. Mau kok, beneran.',
          expression: 'cemas',
          cue: 'Nisa tersenyum buru-buru sambil mengangguk berkali-kali, matanya tidak berani menatap lama.',
        },
      },
      {
        id: 'nasihat',
        skillId: 'nasihat-dini',
        text: 'Udahlah, jangan kebanyakan mikirin Fira. Ikut aja sekarang.',
        next: 'ni-tegang-lab',
      },
    ],
  },

  // Ketegangan fase awal: Nisa menarik diri dengan sangat sopan
  {
    id: 'ni-tegang-lab',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Nggak apa-apa kok, Bu. Aku yang salah. Ibu lanjut aja urusan Ibu, jangan repot-repot sama aku.',
      expression: 'menutup-diri',
      cue: 'Nisa tersenyum tipis, menarik papan rangkaian ke pangkuannya, dan memutar tubuh sedikit menjauh dari Dosen.',
    },
    tension: { phase: 'awal', expectedKind: 'menarik-diri' },
    choices: [
      {
        id: 'akui',
        skillId: 'sampaikan-pengamatan',
        text: 'Kalimatku tadi mungkin kerasa menyalahkan, padahal kamu nggak salah. Aku mau dengerin.',
        options: { observationTone: 'faktual' },
        action: { kind: 'akui-ketegangan' },
        next: 'ni-perbaikan-lab',
        best: true,
      },
      {
        id: 'abaikan-validasi',
        skillId: 'validasi-normalisasi',
        text: 'Oke, nggak apa-apa. Aku duduk di sini aja selama kamu kerja.',
        next: 'ni-tegang-lab',
        reaction: {
          text: 'Iya, Bu. Makasih ya udah pengertian.',
          expression: 'menutup-diri',
          cue: 'Nisa mengangguk sopan, lalu menunduk menekuri papan rangkaian tanpa menyentuhnya.',
        },
      },
      {
        id: 'abaikan-jeda',
        skillId: 'jeda-hening',
        text: 'Aku tunggu sebentar di sini ya.',
        next: 'ni-tegang-lab',
        reaction: {
          text: 'Eh, nggak usah nungguin aku, Bu. Nanti Ibu capek.',
          expression: 'menutup-diri',
          cue: 'Nisa melirik Dosen sekilas, lalu cepat-cepat menunduk lagi.',
        },
      },
      {
        id: 'nasihat',
        skillId: 'nasihat-dini',
        text: 'Jangan terus ngerasa bersalah gitu. Yuk belajar tegas pelan-pelan.',
        next: 'ni-tegang-lab',
        reaction: {
          text: 'Iya, Bu. Nanti aku coba. Maaf ya udah ngerepotin.',
          expression: 'menutup-diri',
          cue: 'Nisa tertawa kecil yang terdengar kaku, lalu memeluk papan rangkaian lebih erat.',
        },
      },
    ],
  },

  // Ketegangan fase perbaikan: hub tiga langkah + satu opsi keliru
  {
    id: 'ni-perbaikan-lab',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Maaf, Bu, tadi aku malah jaga jarak. Rasanya takut Ibu kecewa sama aku, padahal Ibu baik banget.',
      expression: 'menunduk',
      cue: 'Nisa meletakkan papan rangkaian di meja dan kali ini menghadap penuh ke Dosen, dengan tangan terlipat di pangkuan.',
    },
    tension: { phase: 'perbaikan' },
    choices: [
      {
        id: 'akui-dampak',
        skillId: 'validasi-normalisasi',
        text: 'Ucapanku tadi emang kerasa menyalahkan. Maaf ya, bukan itu maksudku.',
        action: { kind: 'perbaikan', step: 'akui-dampak' },
        next: 'ni-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Makasih, Bu. Aku jadi nggak setegang tadi.',
          expression: 'netral',
          cue: 'Nisa menghela napas panjang, tetapi kali ini napasnya terdengar lebih longgar.',
        },
        best: true,
      },
      {
        id: 'eksplorasi-perasaan',
        skillId: 'pertanyaan-terbuka',
        text: 'Boleh cerita, bagian mana yang bikin kamu takut aku kecewa?',
        action: { kind: 'perbaikan', step: 'eksplorasi-perasaan' },
        next: 'ni-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Aku udah biasa jadi orang yang nggak bikin masalah. Kalau ada yang kecewa, rasanya tuh salahku.',
          expression: 'cemas',
          cue: 'Nisa berbicara pelan sambil memilin ujung lengan bajunya.',
        },
      },
      {
        id: 'beri-pilihan',
        skillId: 'jeda-hening',
        text: 'Kita bisa lanjut pelan, ganti topik, atau stop dulu. Kamu yang tentuin.',
        action: { kind: 'perbaikan', step: 'beri-pilihan' },
        next: 'ni-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Lanjut aja, Bu. Tapi pelan-pelan ya. Aku yang pilih kali ini.',
          expression: 'lega',
          cue: 'Nisa tersenyum kecil, dan untuk pertama kalinya tidak menanyakan kabar Dosen lebih dulu.',
        },
      },
      {
        id: 'remehkan',
        skillId: 'meremehkan',
        text: 'Ah, cuma salah paham kecil. Nggak perlu sampai sungkan gitu.',
        next: 'ni-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Iya, Bu. Mungkin akunya yang kelewat perasa.',
          expression: 'menutup-diri',
          cue: 'Nisa tersenyum cepat, lalu kembali memeluk papan rangkaiannya.',
        },
      },
    ],
  },
];
