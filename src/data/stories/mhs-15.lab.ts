/**
 * Adegan Lab untuk Naufal Hakim (mhs-15): pembukaan baku, pesan grup yang mendadak masuk,
 * isyarat memeluk laptop, ajakan ke Ruang Konsultasi, serta Ketegangan `menarik-diri` dan hub perbaikan.
 * Dirakit menjadi STORY_MHS_15 di ./mhs-15.ts.
 */
import type { StoryLine, StoryNode } from '../../engine/story/storyTypes';
import { buildOpeningNode } from '../storyStages';

const STUDENT_ID = 'mhs-15';
const SCENE = 'lab';

const GROUP_ASIDE =
  'Ponsel di dekat printer 3D bergetar. Layarnya menyala sebentar: "Rapat kelompok besok. Dito presentasi desain engsel."';

const GROUP_LINE: StoryLine = {
  text: 'Oh, desain engsel. Ya udah, silakan, Dito emang cepat kalau urusan presentasi.',
  expression: 'menunduk',
  cue: 'Naufal memeluk laptopnya lebih erat ke dada dan membalik ponsel supaya layarnya menghadap meja.',
  aside: GROUP_ASIDE,
};

export const NAUFAL_LAB_NODES: StoryNode[] = [
  // 1. Pembukaan baku
  buildOpeningNode({
    id: 'na-buka',
    studentId: STUDENT_ID,
    sceneId: SCENE,
    name: 'Naufal',
    reply: {
      text: 'Oh, Dosen. Tumben mampir ke meja printer. Biasanya cuma lewat, lihat bentar, terus pergi.',
      expression: 'netral',
      cue: 'Naufal memeluk laptop di pangkuannya dan hanya mengangkat mata sebentar dari filamen yang sedang ia gulung.',
    },
    best: 'sapaan-hangat',
    next: {
      'sapaan-hangat': 'na-l2',
      'pertanyaan-terbuka': 'na-l2',
      'pertanyaan-tertutup': 'na-l2',
      'nasihat-dini': 'na-tegang-lab',
    },
    reactions: {
      'sapaan-hangat': {
        text: 'Kabarku? Ya baik, jawabannya kan selalu itu. Oh, desain engsel. Ya udah, silakan, Dito emang cepat urusan presentasi.',
        expression: 'menunduk',
        cue: 'Naufal memeluk laptopnya lebih erat ke dada, lalu membalik ponselnya supaya layarnya menghadap meja.',
        aside: 'Ponsel di samping printer 3D bergetar. Di layar muncul pesan grup: "Rapat kelompok besok. Dito yang presentasi desain engsel."',
      },
      'pertanyaan-terbuka': {
        text: 'Pikiranku? Hm. Nanti juga Dosen lupa jawabannya, jadi singkat aja: filamen habis.',
        expression: 'netral',
        cue: 'Naufal tersenyum miring dan menepuk-nepuk sampul laptopnya dua kali.',
      },
      'pertanyaan-tertutup': {
        text: 'Baik-baik aja. Semuanya baik. Itu kan jawaban yang Dosen mau dengar.',
        expression: 'netral',
        cue: 'Naufal mengangkat bahu tanpa melepas pelukannya pada laptop.',
      },
    },
  }),

  // 2. Kejutan kecil: pesan grup; isyarat memeluk laptop
  {
    id: 'na-l2',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: GROUP_LINE,
    marks: ['kejutan', 'isyarat-nonverbal'],
    choices: [
      {
        id: 'pengamatan-faktual',
        skillId: 'sampaikan-pengamatan',
        text: 'Habis pesan itu masuk, kamu meluk laptopmu lebih erat dan ponselnya dibalik.',
        reaction: {
          text: 'Hm, ngamatin juga ya. Iya, nggak apa-apa. Cuma lagi males bahas, apalagi di sini rame. Lagian kalau aku ngomong biasanya cuma lewat. Emangnya Dosen mau dengar sampai habis?',
          expression: 'waspada',
          cue: 'Naufal melirik dua teman kelompoknya di meja seberang, lalu menatap Dosen dengan alis terangkat.',
        },
        options: { observationTone: 'faktual' },
        next: 'na-l3',
        setFlags: ['isyarat-diperhatikan'],
        best: true,
      },
      {
        id: 'afirmasi',
        skillId: 'afirmasi-kekuatan',
        text: 'Cetakan komponen daur ulang di mejamu rapi banget. Jarang ada yang bisa begitu.',
        reaction: {
          text: 'Oh, makasih. Cetakan itu ya, lumayan lah. Tapi percuma sih, di sini rame dan kalau aku ngomong biasanya cuma lewat. Emangnya Dosen mau dengar sampai habis?',
          expression: 'waspada',
          cue: 'Naufal melirik dua teman kelompoknya di meja seberang, lalu menatap Dosen dengan alis terangkat.',
        },
        next: 'na-l3',
      },
      {
        id: 'tertutup',
        skillId: 'pertanyaan-tertutup',
        text: 'Dito itu teman sekelompokmu, kan? Kalian akur?',
        reaction: {
          text: 'Iya, sekelompok. Akur? Ya... akur-akur aja. Udahlah, di sini rame, dan kalau aku ngomong biasanya cuma lewat. Dosen mau dengar sampai habis nggak?',
          expression: 'waspada',
          cue: 'Naufal melirik dua teman kelompoknya di meja seberang, lalu menatap Dosen dengan alis terangkat.',
        },
        next: 'na-l3',
      },
      {
        id: 'pengamatan-menilai',
        skillId: 'sampaikan-pengamatan',
        text: 'Kamu kelihatan iri sama Dito. Seperti anak yang tidak mau mengalah.',
        options: { observationTone: 'menilai' },
        next: 'na-tegang-lab',
        reaction: {
          text: 'Wah, cepet banget nyimpulinnya. Pantes orang males ngomong ke sini.',
          expression: 'menutup-diri',
          cue: 'Naufal memutar badan setengah, memunggungi Dosen, dan menekan laptop ke perutnya.',
        },
      },
    ],
  },

  // 3. Ajakan ke Ruang Konsultasi; ia menguji apakah Dosen sungguh mendengar
  {
    id: 'na-l3',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Di sini rame, dan kalau aku ngomong biasanya cuma lewat. Emangnya Dosen mau dengar sampai habis?',
      expression: 'waspada',
      cue: 'Naufal melirik dua teman kelompoknya di meja seberang, lalu menatap Dosen dengan alis terangkat.',
    },
    choices: [
      {
        id: 'ajak-ruang-bk',
        skillId: 'validasi-normalisasi',
        text: 'Wajar kalau kamu ragu. Mau ngobrol di Ruang Konsultasi aja, berdua?',
        next: 'na-l3-tolak',
        routes: [{ when: [{ type: 'trust-min', value: 36 }], next: 'na-b0' }],
        best: true,
      },
      {
        id: 'privasi',
        skillId: 'batas-kerahasiaan',
        text: 'Yang kamu ceritakan cuma di antara kita, kecuali menyangkut keselamatanmu.',
        reaction: {
          text: 'Hm, janji nggak bocor ya. Oke, aku catat. Kalau tempatnya sepi, mungkin aku mau coba.',
          expression: 'netral',
          cue: 'Naufal mengendurkan pelukannya pada laptop dan menaruh gulungan filamen di meja.',
        },
        next: 'na-l3b',
        setFlags: ['privasi-dijelaskan'],
      },
      {
        id: 'janji-mutlak',
        skillId: 'janji-mutlak',
        text: 'Tentu aku dengerin semuanya, dan aku pastikan idemu pasti dipakai kelompok.',
        next: 'na-l3b',
        reaction: {
          text: 'Pasti dipakai? Dosen aja belum tahu idenya apa.',
          expression: 'waspada',
          cue: 'Naufal mendengus pendek dan menggeser kursinya menjauh dari Dosen.',
        },
      },
      {
        id: 'terbuka',
        skillId: 'pertanyaan-terbuka',
        text: 'Kalau ucapanmu sering lewat gitu, kamu ngerasa gimana?',
        reaction: {
          text: 'Rasanya? Ya nggak enak, kayak ngomong ke tembok. Tapi Dosen nanyanya lumayan nggak basa-basi. Kalau tempatnya sepi, mungkin aku mau coba.',
          expression: 'netral',
          cue: 'Naufal menghela napas, mengendurkan pelukannya pada laptop, dan menaruh gulungan filamen di meja.',
        },
        next: 'na-l3b',
      },
    ],
  },

  // Penolakan halus: ia menguji ingatan Dosen
  {
    id: 'na-l3-tolak',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Nanti aja. Lagian tadi aku bilang apa soal pesan itu? Coba, Dosen ingat nggak?',
      expression: 'netral',
      cue: 'Naufal bersandar ke kursi dan mengetuk-ngetukkan jarinya di sampul laptop, menunggu.',
    },
    choices: [
      {
        id: 'parafrase',
        skillId: 'parafrase-ringkasan',
        text: 'Kamu bilang Dito cepat presentasi, tapi nadamu seperti ada yang tertinggal.',
        reaction: {
          text: 'Hm, ingat ya. Dan nangkep nadanya juga. Oke, itu poin buat Dosen. Kalau tempatnya sepi, mungkin aku mau coba.',
          expression: 'netral',
          cue: 'Naufal menaikkan satu alis, lalu mengendurkan pelukannya pada laptop dan menaruh gulungan filamen di meja.',
        },
        next: 'na-l3b',
        setFlags: ['privasi-dijelaskan'],
        best: true,
      },
      {
        id: 'validasi',
        skillId: 'validasi-normalisasi',
        text: 'Wajar kalau kamu menguji dulu. Aku dengerin pelan-pelan, nggak buru-buru.',
        reaction: {
          text: 'Hm, nggak marah aku uji. Lumayan. Oke, kalau tempatnya sepi, aku mau coba.',
          expression: 'netral',
          cue: 'Naufal mengembuskan napas pendek, mengendurkan pelukannya pada laptop, dan menaruh gulungan filamen di meja.',
        },
        next: 'na-l3b',
      },
      {
        id: 'terbuka',
        skillId: 'pertanyaan-terbuka',
        text: 'Aku perlu ngapain biar kamu percaya aku dengerin?',
        reaction: {
          text: 'Cukup nggak nyela aja, Dosen. Itu aja udah langka. Ya udah, kalau tempatnya sepi, mungkin aku mau coba.',
          expression: 'netral',
          cue: 'Naufal tersenyum miring, lalu mengendurkan pelukannya pada laptop dan menaruh gulungan filamen di meja.',
        },
        next: 'na-l3b',
      },
      {
        id: 'nasihat',
        skillId: 'nasihat-dini',
        text: 'Jangan curiga begitu. Percaya saja dan ikut aku sekarang.',
        next: 'na-tegang-lab',
      },
    ],
  },

  // Sedikit melunak
  {
    id: 'na-l3b',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Hm. Oke, kali ini nggak terlalu basa-basi. Kalau tempatnya sepi, mungkin aku mau coba.',
      expression: 'netral',
      cue: 'Naufal menghela napas, mengendurkan pelukannya pada laptop, dan menaruh gulungan filamen di meja.',
    },
    choices: [
      {
        id: 'ajak-ruang-bk',
        skillId: 'afirmasi-kekuatan',
        text: 'Makasih udah kasih kesempatan. Kita jalan santai ke Ruang Konsultasi?',
        reaction: {
          text: 'Ya, ya, kesempatannya sekali ini aja ya. Oke, jalan. ... Hm, sepi juga. Nah, Dosen yang mulai. Aku mau lihat Dosen sanggup nggak nyela sampai kapan.',
          expression: 'netral',
          cue: 'Naufal duduk di kursi paling dekat pintu, laptop dipeluk di pangkuan, dan matanya mengamati wajah Dosen.',
        },
        next: 'na-b0',
        best: true,
      },
      {
        id: 'sapaan',
        skillId: 'sapaan-hangat',
        text: 'Kalau kamu siap, yuk ke Ruang Konsultasi. Aku temani jalan.',
        reaction: {
          text: 'Siap nggak siap, udah sampai juga. Hm, sepi banget. Oke, Dosen mulai aja. Aku mau lihat Dosen bisa nggak ngomong tanpa nyela orang.',
          expression: 'netral',
          cue: 'Naufal mengambil kursi paling dekat pintu, memeluk laptop di pangkuan, dan mengamati wajah Dosen dari ujung matanya.',
        },
        next: 'na-b0',
      },
      {
        id: 'tertutup',
        skillId: 'pertanyaan-tertutup',
        text: 'Jadi mau atau tidak? Jawab saja.',
        next: 'na-l3b',
        reaction: {
          text: 'Tuh, kan. Baru lima detik udah nuntut jawaban.',
          expression: 'waspada',
          cue: 'Naufal menarik laptop kembali ke dada dan menyipitkan mata.',
        },
      },
      {
        id: 'nasihat',
        skillId: 'nasihat-dini',
        text: 'Sudahlah, jangan berprasangka begitu. Ikut saja sekarang.',
        next: 'na-tegang-lab',
      },
    ],
  },

  // Ketegangan fase awal: Naufal menarik diri di balik laptop
  {
    id: 'na-tegang-lab',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Tuh, bener kan. Ya udah, Dosen ngomong aja sendiri. Aku mau lanjut nyetak.',
      expression: 'menutup-diri',
      cue: 'Naufal membuka laptop, mengangkat layarnya hingga menutupi wajah, dan mulai mengetik pelan.',
    },
    tension: { phase: 'awal', expectedKind: 'menarik-diri' },
    choices: [
      {
        id: 'akui',
        skillId: 'sampaikan-pengamatan',
        text: 'Kalimatku tadi kedengaran nggak mendengarkan. Aku mau dengar versimu dulu.',
        options: { observationTone: 'faktual' },
        action: { kind: 'akui-ketegangan' },
        next: 'na-perbaikan-lab',
        best: true,
      },
      {
        id: 'abaikan-validasi',
        skillId: 'validasi-normalisasi',
        text: 'Nggak apa-apa. Silakan nyetak, aku duduk di sini aja.',
        next: 'na-tegang-lab',
        reaction: {
          text: 'Ya. Terserah.',
          expression: 'menutup-diri',
          cue: 'Naufal tidak menoleh; ketukan keyboardnya terdengar lebih keras dari sebelumnya.',
        },
      },
      {
        id: 'abaikan-jeda',
        skillId: 'jeda-hening',
        text: 'Oke, aku tunggu sebentar di sini ya.',
        next: 'na-tegang-lab',
        reaction: {
          text: 'Nunggu apa? Nggak ada yang bakal berubah.',
          expression: 'menutup-diri',
          cue: 'Naufal menatap layar tanpa mengetik, bahunya naik sedikit.',
        },
      },
      {
        id: 'nasihat',
        skillId: 'nasihat-dini',
        text: 'Jangan terlalu sensitif begitu. Coba lebih terbuka sama teman kelompok.',
        next: 'na-tegang-lab',
        reaction: {
          text: 'Wah, saran lagi. Padahal belum ada yang nanya apa yang terjadi.',
          expression: 'menutup-diri',
          cue: 'Naufal tertawa tanpa suara dan menunduk lebih dalam ke balik layar.',
        },
      },
    ],
  },

  // Ketegangan fase perbaikan: hub tiga langkah + satu opsi keliru
  {
    id: 'na-perbaikan-lab',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Hmm. Setidaknya Dosen bilang sendiri. Tapi jangan kira aku langsung percaya, ya.',
      expression: 'waspada',
      cue: 'Naufal menurunkan layar laptop perlahan sampai matanya terlihat lagi, tetapi lengannya tetap melingkar di sampulnya.',
    },
    tension: { phase: 'perbaikan' },
    choices: [
      {
        id: 'akui-dampak',
        skillId: 'validasi-normalisasi',
        text: 'Tadi aku kedengaran nggak mendengarkan, dan itu pasti bikin kecewa. Maaf ya.',
        action: { kind: 'perbaikan', step: 'akui-dampak' },
        next: 'na-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Oke. Itu... jarang aku dengar dari orang.',
          expression: 'netral',
          cue: 'Naufal mengendurkan jari di sampul laptop dan menatap meja.',
        },
        best: true,
      },
      {
        id: 'eksplorasi-perasaan',
        skillId: 'pertanyaan-terbuka',
        text: 'Boleh tahu, bagian mana yang paling terasa nggak didengar?',
        action: { kind: 'perbaikan', step: 'eksplorasi-perasaan' },
        next: 'na-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Waktu orang langsung menjawab sebelum aku selesai kalimat. Rasanya kayak nggak perlu hadir.',
          expression: 'menunduk',
          cue: 'Naufal berbicara lirih, jempolnya menggaruk sudut laptop.',
        },
      },
      {
        id: 'beri-pilihan',
        skillId: 'jeda-hening',
        text: 'Kita bisa lanjut pelan-pelan, ganti topik, atau stop dulu. Terserah kamu.',
        action: { kind: 'perbaikan', step: 'beri-pilihan' },
        next: 'na-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Lanjut. Tapi Dosen jangan potong-potong ya.',
          expression: 'netral',
          cue: 'Naufal menaruh laptop di meja dan menyilangkan kaki, kali ini menghadap Dosen.',
        },
      },
      {
        id: 'remehkan',
        skillId: 'meremehkan',
        text: 'Ah, itu hal kecil dalam kelompok. Semua orang pernah dilewati.',
        next: 'na-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Iya. Kecil. Makanya aku nggak bilang apa-apa.',
          expression: 'menutup-diri',
          cue: 'Naufal menarik laptop lagi ke dada dan memalingkan wajah ke printer.',
        },
      },
    ],
  },
];
