/**
 * Adegan Lab untuk Maya Puspita (mhs-11): pembukaan baku, bunyi bor yang mendadak nyaring,
 * isyarat penutup telinga, ajakan ke Ruang Konsultasi yang sunyi, serta Ketegangan `menarik-diri`
 * dan hub perbaikan. Dirakit menjadi STORY_MHS_11 di ./mhs-11.ts.
 */
import type { StoryNode } from '../../engine/story/storyTypes';
import { buildOpeningNode } from '../storyStages';

const STUDENT_ID = 'mhs-11';
const SCENE = 'lab';

export const MAYA_LAB_NODES: StoryNode[] = [
  // 1. Pembukaan baku
  buildOpeningNode({
    id: 'ma-buka',
    studentId: STUDENT_ID,
    sceneId: SCENE,
    name: 'Maya',
    reply: {
      text: 'Oh, Bu. Sebentar ya... aku selesaiin satu grafik ini dulu, biar pikiranku nggak putus di tengah.',
      expression: 'netral',
      cue: 'Maya menggeser satu sisi penutup telinganya ke leher, sementara matanya masih mengikuti garis grafik di layar.',
    },
    best: 'sapaan-hangat',
    next: {
      'sapaan-hangat': 'ma-l2',
      'pertanyaan-terbuka': 'ma-l2',
      'pertanyaan-tertutup': 'ma-l2',
      'nasihat-dini': 'ma-tegang-lab',
    },
    reactions: {
      'sapaan-hangat': {
        text: 'Baik, Bu, tadi sih. Sebelum ada yang nyalain bor itu. Sebentar ya, aku butuh dua detik buat nenangin telinga.',
        expression: 'terkejut',
        cue: 'Maya langsung menarik kedua penutup telinganya rapat, bahunya naik, lalu perlahan turun setelah bunyi mereda.',
        aside: 'Di meja seberang, seseorang menyalakan bor papan sirkuit tanpa aba-aba. Dengungnya memenuhi lab selama beberapa detik.',
      },
      'pertanyaan-terbuka': {
        text: 'Pikiranku... hmm, gimana ya bilangnya. Banyak yang masih setengah jadi, belum rapi buat diomongin.',
        expression: 'netral',
        cue: 'Maya berhenti sejenak, memilih kata, lalu menyentuh tepi penutup telinganya.',
      },
      'pertanyaan-tertutup': {
        text: 'Baik, sih. Kurang lebih baik. Mungkin lebih tepatnya, tenang.',
        expression: 'netral',
        cue: 'Maya menjawab pelan, lalu menunduk sedikit seakan menimbang apakah jawabannya cukup.',
      },
    },
  }),

  // 2. Kejutan kecil: bunyi bor; isyarat penutup telinga
  {
    id: 'ma-l2',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Maaf, Bu, tunggu sebentar. Bunyi itu... aku butuh dua detik aja.',
      expression: 'terkejut',
      cue: 'Maya langsung menarik kedua penutup telinganya rapat, bahunya naik, lalu perlahan turun setelah bunyi mereda.',
      aside: 'Di meja seberang, seseorang menyalakan bor papan sirkuit tanpa aba-aba. Dengungnya memenuhi seisi lab selama beberapa detik.',
    },
    marks: ['kejutan', 'isyarat-nonverbal'],
    choices: [
      {
        id: 'pengamatan-faktual',
        skillId: 'sampaikan-pengamatan',
        text: 'Aku lihat kamu langsung menutup telinga pas bor menyala. Kita tunggu reda dulu ya.',
        reaction: {
          text: 'Iya, Bu, refleks. Makasih mau nunggu. Kalau sudah reda gini aku bisa mikir lagi, tapi aku lebih nyaman ngobrol di tempat yang agak sunyi.',
          expression: 'netral',
          cue: 'Maya menurunkan tangannya perlahan dari penutup telinga dan menarik napas panjang.',
        },
        options: { observationTone: 'faktual' },
        next: 'ma-l3',
        setFlags: ['telinga-diperhatikan'],
        best: true,
      },
      {
        id: 'validasi-bunyi',
        skillId: 'validasi-normalisasi',
        text: 'Bunyi yang tiba-tiba memang bikin kaget. Santai aja, nggak perlu buru-buru.',
        reaction: {
          text: 'Makasih, Bu. Bunyi mendadak gitu bikin kepalaku kosong sebentar. Kayaknya aku bakal lebih enak ngobrol di tempat yang lebih sunyi.',
          expression: 'netral',
          cue: 'Maya mengusap tepi buku catatan hijaunya, lalu menurunkan bahunya yang tadi naik.',
        },
        next: 'ma-l3',
      },
      {
        id: 'tertutup',
        skillId: 'pertanyaan-tertutup',
        text: 'Kamu memang nggak tahan suara bising, ya?',
        next: 'ma-l3',
        reaction: {
          text: 'Tahan, sih. Cuma... butuh waktu buat nata ulang. Itu beda.',
          expression: 'netral',
          cue: 'Maya menjawab hati-hati, lalu membetulkan letak penutup telinga di lehernya.',
        },
      },
      {
        id: 'meremehkan-bunyi',
        skillId: 'meremehkan',
        text: 'Cuma bunyi bor. Lama-lama juga terbiasa, kok.',
        next: 'ma-tegang-lab',
        reaction: {
          text: 'Oh. Gitu, ya. Baik.',
          expression: 'menutup-diri',
          cue: 'Maya menaikkan kembali penutup telinganya, kali ini sampai menutup rapat.',
        },
      },
    ],
  },

  // 3. Ajakan ke Ruang Konsultasi
  {
    id: 'ma-l3',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Kalau boleh, aku lebih nyaman ngobrol di tempat yang lebih sunyi. Di sini semua suara campur jadi satu.',
      expression: 'netral',
      cue: 'Maya berbicara dengan nada rendah, memilih tiap kata, sambil mengusap tepi buku catatan hijau di sebelah laptopnya.',
    },
    choices: [
      {
        id: 'ajak-ruang-bk',
        skillId: 'validasi-normalisasi',
        text: 'Wajar kok cari tempat sunyi. Mau ke Ruang Konsultasi, pelan-pelan aja?',
        next: 'ma-l3-tolak',
        routes: [{ when: [{ type: 'trust-min', value: 55 }], next: 'ma-b0' }],
        best: true,
      },
      {
        id: 'privasi',
        skillId: 'batas-kerahasiaan',
        text: 'Obrolan kita cuma di antara kita, kecuali menyangkut keselamatanmu.',
        reaction: {
          text: 'Oke, Bu, kuingat: kecuali soal keselamatan. Kalau gitu aku mau ikut. Jalannya pelan ya, aku rapiin catatanku dulu.',
          expression: 'netral',
          cue: 'Maya mengangguk dan mulai menumpuk lembar grafik dengan rapi di samping laptopnya.',
        },
        next: 'ma-l3b',
        setFlags: ['privasi-dijelaskan'],
      },
      {
        id: 'janji-mutlak',
        skillId: 'janji-mutlak',
        text: 'Pasti sunyi total di sana, tidak akan ada bunyi sedikit pun. Dijamin.',
        next: 'ma-l3b',
        reaction: {
          text: 'Dijamin... hmm. Aku coba percaya, tapi kutunggu dulu buktinya ya.',
          expression: 'waspada',
          cue: 'Maya tersenyum tipis, tetapi tangannya menggenggam buku catatan lebih erat.',
        },
      },
      {
        id: 'terbuka',
        skillId: 'pertanyaan-terbuka',
        text: 'Tempat sunyi menurutmu seperti apa, biar kamu nyaman ngobrol?',
        reaction: {
          text: 'Yang nggak ada dengung mesin, Bu, dan nggak banyak orang lewat. Kalau ada yang kayak gitu aku mau ikut. Jalannya pelan ya, aku rapiin catatanku dulu.',
          expression: 'netral',
          cue: 'Maya berbicara pelan sambil menyejajarkan pensil dengan tepi buku hijaunya.',
        },
        next: 'ma-l3b',
      },
    ],
  },

  // Penolakan halus: butuh waktu menimbang
  {
    id: 'ma-l3-tolak',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Bukan nolak, Bu. Cuma aku belum selesai menimbang. Kalau pindah sekarang, kepalaku masih riuh banget.',
      expression: 'menunduk',
      cue: 'Maya menoleh ke layar sebentar, lalu menaikkan satu sisi penutup telinganya setengah jalan.',
    },
    choices: [
      {
        id: 'jeda-tenang',
        skillId: 'jeda-hening',
        text: 'Kita tunggu sampai kamu siap. Nggak ada yang ngejar waktu.',
        reaction: {
          text: 'Makasih, Bu. Aku narik napas dulu... oke, udah agak enakan. Aku mau ikut kalau jalannya pelan, tapi catatanku kurapiin dulu ya.',
          expression: 'netral',
          cue: 'Maya memejamkan mata sejenak, lalu membuka dan menaikkan satu sisi penutup telinganya setengah jalan.',
        },
        next: 'ma-l3b',
        setFlags: ['privasi-dijelaskan'],
        best: true,
      },
      {
        id: 'validasi',
        skillId: 'validasi-normalisasi',
        text: 'Menimbang dulu itu wajar. Kita ikuti tempomu aja.',
        reaction: {
          text: 'Makasih ngerti, Bu. Setelah dipikir-pikir, aku mau kok pindah. Pelan-pelan ya, aku rapiin catatan dulu.',
          expression: 'lega',
          cue: 'Maya tersenyum tipis dan mulai menutup buku catatan hijaunya.',
        },
        next: 'ma-l3b',
      },
      {
        id: 'terbuka',
        skillId: 'pertanyaan-terbuka',
        text: 'Apa yang masih riuh di kepalamu? Kalau boleh, aku dengerin dikit.',
        reaction: {
          text: 'Dengung bor tadi, sama angka-angka grafik yang belum selesai. Kalau sudah kurapiin, kepalaku agak tenang. Aku mau pindah, Bu, tapi catatanku kurapiin dulu.',
          expression: 'netral',
          cue: 'Maya menoleh ke layar sebentar, lalu menyimpan file grafiknya dan merapikan lembar catatan.',
        },
        next: 'ma-l3b',
      },
      {
        id: 'nasihat',
        skillId: 'nasihat-dini',
        text: 'Jangan kebanyakan menimbang. Ikut aja sekarang, nanti juga tenang.',
        next: 'ma-tegang-lab',
      },
    ],
  },

  // Lebih longgar setelah diberi ruang
  {
    id: 'ma-l3b',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Oke, kalau gitu aku mau. Tolong jalannya pelan ya. Aku rapiin catatanku dulu.',
      expression: 'netral',
      cue: 'Maya menyimpan pensil ke saku, memeluk buku hijaunya, dan menurunkan kedua penutup telinga ke leher.',
    },
    choices: [
      {
        id: 'ajak-ruang-bk',
        skillId: 'afirmasi-kekuatan',
        text: 'Terima kasih sudah mau. Di jalan kita diam aja nggak apa-apa.',
        reaction: {
          text: 'Sama-sama, Bu. Diam di jalan malah enak buatku. Nah, sampai juga. Akhirnya sunyi, lega banget.',
          expression: 'lega',
          cue: 'Maya berjalan pelan di samping Dosen sambil memeluk buku hijaunya, lalu berhenti di ambang ruangan dan menghembuskan napas.',
        },
        next: 'ma-b0',
        best: true,
      },
      {
        id: 'sapaan',
        skillId: 'sapaan-hangat',
        text: 'Kalau sudah siap, ayo ke Ruang Konsultasi. Aku jalan di sampingmu.',
        reaction: {
          text: 'Aku udah siap, Bu. Ayo. Wah, sampai. Di sini sunyi banget, telingaku jadi lega.',
          expression: 'lega',
          cue: 'Maya menyimpan pensil ke saku, lalu berjalan di sisi Dosen dan menurunkan penutup telinga ke leher begitu masuk ruangan.',
        },
        next: 'ma-b0',
      },
      {
        id: 'tertutup',
        skillId: 'pertanyaan-tertutup',
        text: 'Jadi kamu benar-benar siap sekarang, ya atau nggak?',
        next: 'ma-l3b',
        reaction: {
          text: 'Ya... mungkin. Maksudku, bisa jadi. Aku belum yakin jawabnya gimana.',
          expression: 'cemas',
          cue: 'Maya membuka buku hijaunya, membalik satu halaman, lalu menutupnya lagi tanpa membaca.',
        },
      },
      {
        id: 'nasihat',
        skillId: 'nasihat-dini',
        text: 'Sudahlah, jangan terlalu hati-hati. Ayo ikut aku sekarang.',
        next: 'ma-tegang-lab',
      },
    ],
  },

  // Ketegangan fase awal: Maya menutup telinga dan kembali ke data
  {
    id: 'ma-tegang-lab',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Oke. Aku lanjut baca datanya dulu ya.',
      expression: 'menutup-diri',
      cue: 'Maya menaikkan kedua penutup telinganya, memperbesar grafik di layar, dan memutar badan sedikit menjauhi Dosen.',
    },
    tension: { phase: 'awal', expectedKind: 'menarik-diri' },
    choices: [
      {
        id: 'akui',
        skillId: 'sampaikan-pengamatan',
        text: 'Kalimatku tadi mungkin kecepetan. Aku mau dengerin sisimu, pelan aja.',
        options: { observationTone: 'faktual' },
        action: { kind: 'akui-ketegangan' },
        next: 'ma-perbaikan-lab',
        best: true,
      },
      {
        id: 'abaikan-validasi',
        skillId: 'validasi-normalisasi',
        text: 'Silakan lanjut baca. Aku nggak akan ganggu kok.',
        next: 'ma-tegang-lab',
        reaction: {
          text: 'Terima kasih, Bu.',
          expression: 'menutup-diri',
          cue: 'Maya mengangguk tanpa menoleh; jarinya menggeser grafik naik-turun tanpa tujuan.',
        },
      },
      {
        id: 'abaikan-jeda',
        skillId: 'jeda-hening',
        text: 'Oke, aku duduk di sini dulu ya.',
        next: 'ma-tegang-lab',
        reaction: {
          text: '...Ya.',
          expression: 'menutup-diri',
          cue: 'Maya menatap layar, tetapi garis grafik di sana tidak lagi ia ikuti dengan matanya.',
        },
      },
      {
        id: 'nasihat',
        skillId: 'nasihat-dini',
        text: 'Jangan menutup diri gitu. Coba lebih terbuka sama orang lain.',
        next: 'ma-tegang-lab',
        reaction: {
          text: 'Iya. Nanti kupikirin.',
          expression: 'menutup-diri',
          cue: 'Maya menjawab datar, lalu menarik penutup telinga makin rapat.',
        },
      },
    ],
  },

  // Ketegangan fase perbaikan: hub tiga langkah + satu opsi keliru
  {
    id: 'ma-perbaikan-lab',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Maaf, tadi aku langsung diam. Bukan karena Ibu. Cuma kepalaku terlalu riuh banget.',
      expression: 'menunduk',
      cue: 'Maya menurunkan satu sisi penutup telinganya dan menaruh tangannya di pangkuan, tidak lagi menyentuh tetikus.',
    },
    tension: { phase: 'perbaikan' },
    choices: [
      {
        id: 'akui-dampak',
        skillId: 'validasi-normalisasi',
        text: 'Caraku tadi terasa mendesak. Maaf ya, itu bukan maksudku.',
        action: { kind: 'perbaikan', step: 'akui-dampak' },
        next: 'ma-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Terima kasih. Kalimat itu lebih gampang kudengar daripada penjelasan panjang.',
          expression: 'netral',
          cue: 'Maya menarik napas pelan dan bahunya turun sedikit.',
        },
        best: true,
      },
      {
        id: 'eksplorasi-perasaan',
        skillId: 'pertanyaan-terbuka',
        text: 'Kalau mau cerita, bagian mana yang bikin kamu pengen menutup telinga tadi?',
        action: { kind: 'perbaikan', step: 'eksplorasi-perasaan' },
        next: 'ma-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Pas ada yang nyuruh aku cepat. Aku jadi lupa tadi mau ngomong apa.',
          expression: 'menunduk',
          cue: 'Maya berbicara nyaris berbisik, sambil memutar pensil perlahan di antara jarinya.',
        },
      },
      {
        id: 'beri-pilihan',
        skillId: 'jeda-hening',
        text: 'Kita bisa lanjut pelan, nulis dulu, atau berhenti. Kamu yang pilih.',
        action: { kind: 'perbaikan', step: 'beri-pilihan' },
        next: 'ma-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Lanjut aja, tapi pelan. Aku butuh waktu sebelum jawab.',
          expression: 'lega',
          cue: 'Maya menutup layar laptopnya setengah dan menghadapkan kursinya kembali ke arah Dosen.',
        },
      },
      {
        id: 'remehkan',
        skillId: 'meremehkan',
        text: 'Ah, cuma soal suara. Jangan terlalu dibawa perasaan.',
        next: 'ma-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Mungkin kamu benar. Aku aja yang berlebihan.',
          expression: 'menutup-diri',
          cue: 'Maya memasang kembali penutup telinganya dan menatap layar yang sudah gelap.',
        },
      },
    ],
  },
];
