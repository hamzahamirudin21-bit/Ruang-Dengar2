/**
 * Adegan Lab untuk Ayu Permata (mhs-05): pembukaan baku, layar telemetri yang mendadak menampilkan grafik aneh,
 * isyarat menggambar di pinggir catatan, ajakan ke Ruang Konsultasi, serta Ketegangan `menarik-diri`
 * (Ayu mengalihkan pembicaraan dengan riang) dan hub perbaikan.
 * Dirakit menjadi STORY_MHS_05 di ./mhs-05.ts.
 */
import type { StoryLine, StoryNode } from '../../engine/story/storyTypes';
import { buildOpeningNode } from '../storyStages';

const STUDENT_ID = 'mhs-05';
const SCENE = 'lab';

const GRAFIK_LINE: StoryLine = {
  text: 'Eh, lihat itu! Grafik getarannya mendadak bentuknya kayak gunung kembar. Lucu, jadi kepikiran bikin tampilan yang ceritanya bisa dibaca orang awam.',
  expression: 'terkejut',
  cue: 'Ayu mencondongkan badan ke layar, lalu tangannya otomatis menggambar gunung kembar kecil di pinggir halaman catatannya.',
  aside: 'Monitor di meja firmware berkedip, dan garis hijau pada grafik uji tiba-tiba melonjak dua kali berturut-turut.',
};

export const AYU_LAB_NODES: StoryNode[] = [
  // 1. Pembukaan baku
  buildOpeningNode({
    id: 'ay-buka',
    studentId: STUDENT_ID,
    sceneId: SCENE,
    name: 'Ayu',
    reply: {
      text: 'Halo, Bu! Pas banget, aku baru mau cerita soal dashboard yang kubuat semalam. Eh, tapi Ibu dulu ada ide proyek apa waktu kuliah?',
      expression: 'tersenyum',
      cue: 'Ayu memutar kursinya menghadap Dosen sambil mengayun-ayunkan pensil, buku catatannya terbuka penuh coretan kecil.',
    },
    best: 'sapaan-hangat',
    next: {
      'sapaan-hangat': 'ay-l2',
      'pertanyaan-terbuka': 'ay-l2',
      'pertanyaan-tertutup': 'ay-l2',
      'nasihat-dini': 'ay-tegang-lab',
    },
    reactions: {
      'sapaan-hangat': {
        text: 'Halo, Bu! Baik banget. Eh, lihat deh, grafiknya mendadak kayak gunung kembar. Lucu, jadi kepikiran bikin tampilan yang ceritanya bisa dibaca orang awam.',
        expression: 'terkejut',
        cue: 'Ayu menoleh sekilas sambil tersenyum, lalu langsung mencondongkan badan ke layar.',
        aside: 'Monitor di meja firmware berkedip, dan garis hijau pada grafik uji tiba-tiba melonjak dua kali berturut-turut.',
      },
      'pertanyaan-terbuka': {
        text: 'Pikiranku? Wah, ramai! Ada lima ide, terus muncul ide keenam waktu aku jalan ke sini.',
        expression: 'tersenyum',
        cue: 'Ayu tertawa dan membalik halaman catatan, memperlihatkan deretan sketsa layar yang bertumpuk.',
      },
      'pertanyaan-tertutup': {
        text: 'Baik dong! Eh, maksudku seru. Hmm, baik atau seru, ya?',
        expression: 'netral',
        cue: 'Ayu mengerutkan hidung sambil tertawa kecil, lalu memutar pensil di antara jarinya.',
      },
    },
  }),

  // 2. Kejutan kecil: grafik aneh; isyarat menggambar di pinggir catatan
  {
    id: 'ay-l2',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: GRAFIK_LINE,
    marks: ['kejutan', 'isyarat-nonverbal'],
    choices: [
      {
        id: 'pengamatan-faktual',
        skillId: 'sampaikan-pengamatan',
        text: 'Aku lihat tanganmu langsung menggambar di pinggir catatan begitu grafiknya berubah.',
        options: { observationTone: 'faktual' },
        next: 'ay-l3',
        setFlags: ['isyarat-diperhatikan'],
        best: true,
        reaction: {
          text: 'Ketahuan ya, Bu? Tanganku refleks gambar kalau ada bentuk lucu. Eh, sebenernya aku pengin ngobrol soal arah kuliah dan kerja, cuma di sini temen firmware suka nimbrung.',
          expression: 'netral',
          cue: 'Ayu menutup separuh coretannya dengan telapak tangan sambil nyengir, lalu melirik meja firmware.',
        },
      },
      {
        id: 'afirmasi',
        skillId: 'afirmasi-kekuatan',
        text: 'Matamu jeli menangkap bentuk dalam data. Itu bakat yang jarang dimiliki orang.',
        next: 'ay-l3',
        reaction: {
          text: 'Hehe, makasih, Bu. Tapi sebenernya aku pengin ngobrol soal arah kuliah dan kerja, cuma di sini temen firmware suka nimbrung dan ikut komentar.',
          expression: 'tersenyum',
          cue: 'Ayu tersipu dan memainkan pensilnya, lalu melirik temannya di meja seberang.',
        },
      },
      {
        id: 'tertutup',
        skillId: 'pertanyaan-tertutup',
        text: 'Itu galat pada alatnya, atau memang bentuknya begitu?',
        next: 'ay-l3',
        reaction: {
          text: 'Bukan galat kok, memang bentuknya begitu, makanya lucu. Eh, Bu, aku pengin ngobrol soal arah kuliah dan kerja, tapi jangan di sini, temen firmware suka nimbrung.',
          expression: 'netral',
          cue: 'Ayu menggeleng cepat sambil menunjuk layar, lalu menurunkan suaranya.',
        },
      },
      {
        id: 'pengamatan-menilai',
        skillId: 'sampaikan-pengamatan',
        text: 'Kamu gampang teralihkan, ya. Baru lihat grafik aneh, langsung lupa tugas.',
        options: { observationTone: 'menilai' },
        next: 'ay-tegang-lab',
        reaction: {
          text: 'Hehe, iya ya. Eh, aku balik ke tugas dulu deh, nanti ketinggalan.',
          expression: 'menutup-diri',
          cue: 'Pensil Ayu berhenti, ia menutup buku catatan dengan cepat dan menepuk sampulnya dua kali.',
        },
      },
    ],
  },

  // 3. Ajakan ke Ruang Konsultasi
  {
    id: 'ay-l3',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Kalau mau ngobrol soal arah kuliah dan kerja, sebenarnya aku pengin. Cuma di sini temen-temen firmware suka nimbrung dan ikut komentar.',
      expression: 'netral',
      cue: 'Ayu melirik ke meja sebelah tempat dua temannya berdebat soal kabel, lalu menurunkan suaranya sedikit.',
    },
    choices: [
      {
        id: 'ajak-ruang-bk',
        skillId: 'validasi-normalisasi',
        text: 'Wajar ingin ngobrol tanpa ditimpali. Mau pindah ke Ruang Konsultasi saja?',
        next: 'ay-l3-tolak',
        routes: [{ when: [{ type: 'trust-min', value: 60 }], next: 'ay-b0' }],
        best: true,
      },
      {
        id: 'privasi',
        skillId: 'batas-kerahasiaan',
        text: 'Isi obrolan kita tidak kubawa ke siapa pun, kecuali bila ada hal yang membahayakan.',
        next: 'ay-l3b',
        setFlags: ['privasi-dijelaskan'],
        reaction: {
          text: 'Kecuali kalau bahaya, ya? Oke, kedengarannya aman buatku. Lagian sekali-sekali butuh tempat tanpa suara solder, kan?',
          expression: 'tersenyum',
          cue: 'Ayu mengangguk lega dan menutup buku sketsanya.',
        },
      },
      {
        id: 'janji-mutlak',
        skillId: 'janji-mutlak',
        text: 'Pasti aman. Tidak ada satu kata pun dari ruangan itu yang akan sampai ke orang lain.',
        next: 'ay-l3b',
        reaction: {
          text: 'Wah, tegas banget. Oke deh, tapi nanti aku pikir-pikir dulu ya.',
          expression: 'waspada',
          cue: 'Ayu tertawa kecil, tetapi pensilnya berhenti dan ia menatap Dosen sedikit lebih lama.',
        },
      },
      {
        id: 'terbuka',
        skillId: 'pertanyaan-terbuka',
        text: 'Kalau teman-teman tidak ikut nimbrung, apa yang ingin kamu ceritakan?',
        next: 'ay-l3b',
        reaction: {
          text: 'Kalau nggak ada yang nimbrung? Banyak banget, Bu, soal arah kuliah dan kerja. Yuk cari tempat tanpa suara solder dulu.',
          expression: 'tersenyum',
          cue: 'Ayu berdiri sambil memeluk buku sketsanya, matanya berbinar.',
        },
      },
    ],
  },

  // Penolakan halus: Ayu mengalihkan ke ide lain
  {
    id: 'ay-l3-tolak',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Hmm, nanti dulu ya. Aku lagi tanggung nih, ada ide animasi grafik yang harus kucoba sebelum lupa. Besok deh, besok pasti sempat!',
      expression: 'tersenyum',
      cue: 'Ayu menarik laptop lebih dekat dan jarinya sudah mengetuk papan ketik, sementara pandangannya tetap pada layar.',
    },
    choices: [
      {
        id: 'privasi',
        skillId: 'batas-kerahasiaan',
        text: 'Boleh kujelaskan dulu? Ceritamu tetap di antara kita, dan boleh berhenti kapan saja.',
        next: 'ay-l3b',
        setFlags: ['privasi-dijelaskan'],
        best: true,
        reaction: {
          text: 'Boleh berhenti kapan saja? Wah, oke, kedengarannya aman. Lagian sekali-sekali butuh tempat tanpa suara solder, kan?',
          expression: 'tersenyum',
          cue: 'Ayu menghela napas lega dan bahunya turun.',
        },
      },
      {
        id: 'validasi',
        skillId: 'validasi-normalisasi',
        text: 'Ide yang sedang hangat memang sayang dilewatkan. Kita bisa ikuti tempomu.',
        next: 'ay-l3b',
        reaction: {
          text: 'Iya, ide yang lagi hangat sayang banget kalau lewat. Ya udah, ayo, sekalian cari tempat yang tanpa suara solder.',
          expression: 'tersenyum',
          cue: 'Ayu terkekeh dan menutup halaman catatannya.',
        },
      },
      {
        id: 'terbuka',
        skillId: 'pertanyaan-terbuka',
        text: 'Kalau tidak ada ide yang menunggu, kamu ingin mulai dari mana?',
        next: 'ay-l3b',
        reaction: {
          text: 'Kalau nggak ada ide yang nunggu, mulai dari obrolan santai aja dulu, Bu. Boleh, yuk cari tempat yang tanpa suara solder.',
          expression: 'netral',
          cue: 'Ayu memiringkan kepala sebentar, lalu mengangguk sambil merapikan alat tulisnya.',
        },
      },
      {
        id: 'nasihat',
        skillId: 'nasihat-dini',
        text: 'Ide animasi itu bisa menunggu. Yang lebih penting, ikut aku sekarang.',
        next: 'ay-tegang-lab',
      },
    ],
  },

  // Lebih longgar setelah privasi dijelaskan
  {
    id: 'ay-l3b',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Oke, kalau begitu kedengarannya aman. Lagian sekali-sekali butuh tempat yang tidak ada suara solder, kan?',
      expression: 'tersenyum',
      cue: 'Ayu menyelipkan pensil ke ikat rambutnya, menutup laptop separuh, dan bahunya turun sedikit.',
    },
    choices: [
      {
        id: 'ajak-ruang-bk',
        skillId: 'afirmasi-kekuatan',
        text: 'Terima kasih sudah mau meluangkan waktu. Yuk, jalan santai ke Ruang Konsultasi.',
        next: 'ay-b0',
        best: true,
        reaction: {
          text: 'Sama-sama, Bu! Wah, tenang banget di sini, beda sama lab. Boleh aku taruh buku sketsa di meja? Aku mikir sambil corat-coret.',
          expression: 'tersenyum',
          cue: 'Ayu melangkah masuk sambil memandang sekeliling, lalu menepuk meja pelan.',
        },
      },
      {
        id: 'sapaan',
        skillId: 'sapaan-hangat',
        text: 'Kalau kamu sudah siap, aku temani jalan ke sana.',
        next: 'ay-b0',
        reaction: {
          text: 'Siap, ditemenin jalan ya, Bu. Wah, tenang banget di sini. Boleh buku sketsaku kutaruh di meja? Biasanya aku mikir sambil corat-coret.',
          expression: 'tersenyum',
          cue: 'Ayu berjalan di samping Dosen, lalu menarik kursi dengan ringan.',
        },
      },
      {
        id: 'tertutup',
        skillId: 'pertanyaan-tertutup',
        text: 'Jadi jadinya mau ikut atau tidak? Ya atau tidak saja.',
        next: 'ay-l3b',
        reaction: {
          text: 'Ya, eh, tidak, eh... bentar, aku lagi mikir sambil beresin kabel ini.',
          expression: 'cemas',
          cue: 'Ayu mengambil seuntai kabel dari meja dan menggulungnya berulang tanpa benar-benar merapikannya.',
        },
      },
      {
        id: 'nasihat',
        skillId: 'nasihat-dini',
        text: 'Tidak usah banyak mikir. Langsung ikut saja, nanti juga terbiasa.',
        next: 'ay-tegang-lab',
      },
    ],
  },

  // Ketegangan fase awal: Ayu menarik diri lewat obrolan riang yang mengalihkan
  {
    id: 'ay-tegang-lab',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Hehe, nggak apa-apa kok, Bu. Eh, Ibu sudah lihat tampilan baru situs jurusan belum? Warnanya lucu banget!',
      expression: 'menutup-diri',
      cue: 'Ayu tersenyum lebar terlalu cepat, memutar kursi setengah badan menjauh, dan menunjuk layar yang tidak berkaitan sama sekali.',
    },
    tension: { phase: 'awal', expectedKind: 'menarik-diri' },
    choices: [
      {
        id: 'akui',
        skillId: 'sampaikan-pengamatan',
        text: 'Kata-kataku tadi mungkin terasa menekan. Aku ingin dengar apa yang kamu rasakan.',
        options: { observationTone: 'faktual' },
        action: { kind: 'akui-ketegangan' },
        next: 'ay-perbaikan-lab',
        best: true,
      },
      {
        id: 'abaikan-validasi',
        skillId: 'validasi-normalisasi',
        text: 'Boleh kok ganti topik. Ceritakan saja soal situs jurusan itu.',
        next: 'ay-tegang-lab',
        reaction: {
          text: 'Nah itu! Pokoknya headernya gradasi gitu, keren. Terus, terus...',
          expression: 'menutup-diri',
          cue: 'Ayu bercerita makin cepat tanpa menatap Dosen, jarinya menggambar garis lurus berulang di tepi meja.',
        },
      },
      {
        id: 'abaikan-jeda',
        skillId: 'jeda-hening',
        text: 'Baik, aku dengarkan dulu.',
        next: 'ay-tegang-lab',
        reaction: {
          text: 'Eh, kok jadi sepi ya. Haha, aku lanjut cerita lain aja deh...',
          expression: 'menutup-diri',
          cue: 'Ayu tertawa kecil lalu membuka-tutup tutup pulpen sambil menatap sudut ruangan.',
        },
      },
      {
        id: 'nasihat',
        skillId: 'nasihat-dini',
        text: 'Jangan kebanyakan membahas hal lain. Fokus saja pada urusanmu sendiri dulu.',
        next: 'ay-tegang-lab',
        reaction: {
          text: 'Oke, oke, Bu. Siap fokus.',
          expression: 'menutup-diri',
          cue: 'Ayu mengangguk cepat dengan senyum yang kaku dan buku catatannya ditutup rapat.',
        },
      },
    ],
  },

  // Ketegangan fase perbaikan: hub tiga langkah + satu opsi keliru
  {
    id: 'ay-perbaikan-lab',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Hehe, maaf ya, tadi aku malah ngalor-ngidul. Sebenarnya kalimat tadi bikin aku mendadak nggak enak.',
      expression: 'menunduk',
      cue: 'Ayu berhenti memutar kursi, menaruh pensil, dan menatap telapak tangannya sendiri.',
    },
    tension: { phase: 'perbaikan' },
    choices: [
      {
        id: 'akui-dampak',
        skillId: 'validasi-normalisasi',
        text: 'Terima kasih sudah bilang. Kalimatku tadi memang menekan, dan aku minta maaf.',
        action: { kind: 'perbaikan', step: 'akui-dampak' },
        next: 'ay-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Makasih, Bu. Rasanya jadi enteng, nggak perlu ngelucu terus.',
          expression: 'lega',
          cue: 'Ayu mengembuskan napas panjang dan senyumnya kali ini turun pelan, bukan melebar tiba-tiba.',
        },
        best: true,
      },
      {
        id: 'eksplorasi-perasaan',
        skillId: 'pertanyaan-terbuka',
        text: 'Boleh ceritakan, bagian mana yang membuatmu mendadak tidak enak?',
        action: { kind: 'perbaikan', step: 'eksplorasi-perasaan' },
        next: 'ay-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Kayak aku disuruh milih jawaban benar, padahal aku sendiri belum tahu pilihannya apa.',
          expression: 'cemas',
          cue: 'Ayu menggambar spiral kecil di tepi buku, makin ke dalam, sambil bicara pelan.',
        },
      },
      {
        id: 'beri-pilihan',
        skillId: 'jeda-hening',
        text: 'Kita bisa lanjut pelan, ganti suasana, atau berhenti dulu. Kamu yang memutuskan.',
        action: { kind: 'perbaikan', step: 'beri-pilihan' },
        next: 'ay-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Lanjut aja, tapi jangan terlalu serius dulu ya. Pelan-pelan.',
          expression: 'tersenyum',
          cue: 'Ayu meletakkan pensilnya sejajar dengan buku catatan, lalu mengangguk sambil tersenyum tipis.',
        },
      },
      {
        id: 'remehkan',
        skillId: 'meremehkan',
        text: 'Ah, itu cuma salah paham kecil. Anak seceria kamu pasti sudah lupa.',
        next: 'ay-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Iya, haha, betul. Aku kan memang gampang lupa.',
          expression: 'menutup-diri',
          cue: 'Senyum Ayu menempel di wajahnya, tetapi ia menutup buku catatannya lagi.',
        },
      },
    ],
  },
];
