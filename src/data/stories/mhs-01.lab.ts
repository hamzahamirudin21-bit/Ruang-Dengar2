/**
 * Adegan Lab untuk Raka Pratama (mhs-01): pembukaan baku, alarm rapat yang mendadak berbunyi,
 * isyarat melirik jam, ajakan ke Ruang Konsultasi, serta Ketegangan `menarik-diri` dan hub perbaikan.
 * Dirakit menjadi STORY_MHS_01 di ./mhs-01.ts.
 */
import type { StoryLine, StoryNode } from '../../engine/story/storyTypes';
import { buildOpeningNode } from '../storyStages';

const STUDENT_ID = 'mhs-01';
const SCENE = 'lab';

const ALARM_ASIDE =
  'Ponsel di sebelah papan sirkuit bergetar dan berbunyi nyaring: "Rapat tim 13.30". Beberapa orang menoleh sekilas.';

const ALARM_LINE: StoryLine = {
  text: 'Waduh, alarmnya bunyi. Rapat tim setengah jam lagi, dan notulen kemarin belum kuketik sama sekali, literally nol.',
  expression: 'terkejut',
  cue: 'Raka melirik jam tangannya, lalu membalik ponsel dengan cepat dan mencoret satu baris di daftarnya.',
  aside: ALARM_ASIDE,
};

export const RAKA_LAB_NODES: StoryNode[] = [
  // 1. Pembukaan baku
  buildOpeningNode({
    id: 'ra-buka',
    studentId: STUDENT_ID,
    sceneId: SCENE,
    name: 'Raka',
    reply: {
      text: 'Siang! Bentar ya, tinggal dua poin lagi di daftarku. Minggu ini jadwal uji sensornya padat banget, jujurly.',
      expression: 'tersenyum',
      cue: 'Raka menandai satu kotak di kertas daftarnya sambil melirik jam tangan, lalu menegakkan badan menyambut Dosen.',
    },
    best: 'sapaan-hangat',
    next: {
      'sapaan-hangat': 'ra-l2',
      'pertanyaan-terbuka': 'ra-l2',
      'pertanyaan-tertutup': 'ra-l2',
      'nasihat-dini': 'ra-tegang-lab',
    },
    reactions: {
      'sapaan-hangat': {
        text: 'Kabarku? Baik-baik aja sih, cuma lagi kejar waktu. Makasih udah nanya, Bu.',
        expression: 'tersenyum',
        cue: 'Raka mengangkat pandangan sekilas dari daftarnya dan tersenyum tipis.',
      },
      'pertanyaan-terbuka': {
        text: 'Pikiranku? Banyak sih, tapi tertata kok. Satu per satu, urut sesuai prioritas.',
        expression: 'netral',
        cue: 'Raka mengetuk-ngetukkan ujung pulpen ke daftar sambil tetap tersenyum.',
      },
      'pertanyaan-tertutup': {
        text: 'Lancar, lancar. Santuy kok, semua terkendali.',
        expression: 'tersenyum',
        cue: 'Raka menjawab cepat lalu melirik jam tangannya sekali lagi.',
      },
    },
  }),

  // 2. Kejutan kecil: alarm rapat; isyarat melirik jam
  {
    id: 'ra-l2',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: ALARM_LINE,
    marks: ['kejutan', 'isyarat-nonverbal'],
    choices: [
      {
        id: 'pengamatan-faktual',
        skillId: 'sampaikan-pengamatan',
        text: 'Aku lihat kamu beberapa kali melirik jam, terus langsung mencoret daftar tadi.',
        reaction: { text: 'Eh, kelihatan ya? Iya, aku emang lagi ngecek waktu terus, jujurly.', expression: 'terkejut', cue: 'Raka berhenti mencoret dan menatap pulpen di tangannya.' },
        options: { observationTone: 'faktual' },
        next: 'ra-l3',
        setFlags: ['isyarat-diperhatikan'],
        best: true,
      },
      {
        id: 'afirmasi',
        skillId: 'afirmasi-kekuatan',
        text: 'Daftar dan jadwalmu rapi banget. Pantas timmu percaya kamu jadi koordinator.',
        reaction: { text: 'Hehe, makasih. Daftar itu emang kuandalkan banget sih.', expression: 'tersenyum', cue: 'Raka menegakkan bahu sedikit, senyumnya singkat.' },
        next: 'ra-l3',
      },
      {
        id: 'tertutup',
        skillId: 'pertanyaan-tertutup',
        text: 'Itu rapat wajib, ya? Kamu nggak boleh telat?',
        reaction: { text: 'Iya, wajib. Telat lima menit aja langsung kelihatan banget.', expression: 'waspada', cue: 'Raka melirik alarm di ponselnya lalu mengangguk cepat.' },
        next: 'ra-l3',
      },
      {
        id: 'pengamatan-menilai',
        skillId: 'sampaikan-pengamatan',
        text: 'Kamu kelihatan gelisah banget, kayak orang yang nggak bisa atur waktu.',
        options: { observationTone: 'menilai' },
        next: 'ra-tegang-lab',
        reaction: {
          text: 'Oh. Oke. Mungkin emang kelihatannya begitu. Aku lanjut kerja aja deh.',
          expression: 'menutup-diri',
          cue: 'Senyum Raka hilang; ia merapikan kertas daftarnya dan menatap layar laptop.',
        },
      },
    ],
  },

  // 3. Ajakan ke Ruang Konsultasi
  {
    id: 'ra-l3',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Di sini orang lalu-lalang terus, aku nggak enak kalau agenda tim kedengaran anak lain, hehe.',
      expression: 'netral',
      cue: 'Raka menurunkan suaranya dan melirik dua anggota timnya yang sedang menyolder di meja seberang.',
    },
    choices: [
      {
        id: 'ajak-ruang-bk',
        skillId: 'validasi-normalisasi',
        text: 'Wajar kok pengin lebih privat. Mau lanjut di Ruang Konsultasi, berdua aja?',
        next: 'ra-l3-tolak',
        routes: [{ when: [{ type: 'trust-min', value: 60 }], next: 'ra-b0' }],
        best: true,
      },
      {
        id: 'privasi',
        skillId: 'batas-kerahasiaan',
        text: 'Ceritamu cuma di antara kita, kecuali menyangkut keselamatanmu ya.',
        reaction: { text: 'Oke, itu bikin agak tenang sih. Makasih udah bilang dulu.', expression: 'lega', cue: 'Raka menghembuskan napas pendek, bahunya turun sedikit.' },
        next: 'ra-l3b',
        setFlags: ['privasi-dijelaskan'],
      },
      {
        id: 'janji-mutlak',
        skillId: 'janji-mutlak',
        text: 'Tenang aja, di ruang BK semuanya pasti aman, rahasia 100% terjamin.',
        next: 'ra-l3b',
        reaction: {
          text: 'Seratus persen? Hmm, ya udah deh, nanti kucatat dulu buat dipertimbangkan.',
          expression: 'waspada',
          cue: 'Raka tersenyum sopan, tetapi pulpennya berhenti bergerak di atas daftar.',
        },
      },
      {
        id: 'terbuka',
        skillId: 'pertanyaan-terbuka',
        text: 'Boleh cerita, apa yang bikin kurang nyaman kalau agenda tim terdengar orang lain?',
        reaction: { text: 'Soalnya agenda timnya belum matang, Bu. Aku nggak mau kedengaran setengah jadi.', expression: 'netral', cue: 'Raka melirik ke arah lorong, lalu kembali ke daftarnya.' },
        next: 'ra-l3b',
      },
    ],
  },

  // Penolakan halus: jadwal dijadikan alasan
  {
    id: 'ra-l3-tolak',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Hmm, nanti dulu deh. Jam segini aku harus cek log sensor, jadwalku bakal bentrok kalau pindah sekarang.',
      expression: 'netral',
      cue: 'Raka memeriksa jam tangan, lalu menggeser kursinya kembali menghadap laptop.',
    },
    choices: [
      {
        id: 'privasi',
        skillId: 'batas-kerahasiaan',
        text: 'Boleh kujelaskan dulu? Ceritamu tetap di antara kita, dan boleh berhenti kapan aja.',
        reaction: { text: 'Oh, jadi cuma kita berdua dan boleh berhenti kapan aja? Oke, aku dengerin.', expression: 'netral', cue: 'Raka menaruh pulpen dan menyimak penjelasan itu.' },
        next: 'ra-l3b',
        setFlags: ['privasi-dijelaskan'],
        best: true,
      },
      {
        id: 'validasi',
        skillId: 'validasi-normalisasi',
        text: 'Wajar kalau jadwalmu padat. Santai aja, kita ikuti ritmemu.',
        reaction: { text: 'Makasih, Bu. Enak juga ada yang paham jadwalku nggak bisa digeser seenaknya.', expression: 'lega', cue: 'Raka mengangguk dan melonggarkan genggaman pada daftarnya.' },
        next: 'ra-l3b',
      },
      {
        id: 'terbuka',
        skillId: 'pertanyaan-terbuka',
        text: 'Kalau jadwal nggak jadi soal, kamu sendiri maunya gimana?',
        reaction: { text: 'Maunya sih yang singkat dan tenang aja. Kalau gitu jadwalku masih aman.', expression: 'netral', cue: 'Raka mengetuk-ngetuk meja sambil menghitung dalam hati.' },
        next: 'ra-l3b',
      },
      {
        id: 'nasihat',
        skillId: 'nasihat-dini',
        text: 'Log sensor bisa ditunda. Prioritaskan dirimu dulu dan ikut aku aja.',
        next: 'ra-tegang-lab',
      },
    ],
  },

  // Lebih longgar setelah privasi dijelaskan
  {
    id: 'ra-l3b',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Oke, masuk akal sih. Kalau cuma bentar dan tempatnya tenang, kayaknya bisa kuselipin di jadwal.',
      expression: 'netral',
      cue: 'Raka menarik napas, menaruh pulpen di samping daftarnya, dan bahunya turun sedikit.',
    },
    choices: [
      {
        id: 'ajak-ruang-bk',
        skillId: 'afirmasi-kekuatan',
        text: 'Makasih sudah meluangkan waktu. Kita jalan santai ke Ruang Konsultasi, yuk?',
        reaction: { text: 'Sama-sama, Bu. Ruangannya jauh nggak? Aku harus balik tepat waktu soalnya.', expression: 'tersenyum', cue: 'Raka berdiri dan merapikan daftar ke saku kemejanya.' },
        next: 'ra-b0',
        best: true,
      },
      {
        id: 'sapaan',
        skillId: 'sapaan-hangat',
        text: 'Kalau kamu siap, yuk ke Ruang Konsultasi. Aku temani jalan, ya.',
        reaction: { text: 'Boleh, ditemenin jalan. Aku bawa daftarku aja ya.', expression: 'netral', cue: 'Raka mengambil daftarnya dan melangkah di samping Ibu.' },
        next: 'ra-b0',
      },
      {
        id: 'tertutup',
        skillId: 'pertanyaan-tertutup',
        text: 'Jadi bisa atau nggak? Jawab ya atau nggak aja.',
        next: 'ra-l3b',
        reaction: {
          text: 'Ya... atau nggak... eh, jadwalnya belum kuhitung. Bentar.',
          expression: 'cemas',
          cue: 'Raka mengambil kembali daftarnya dan membaca ulang baris-barisnya tanpa benar-benar fokus.',
        },
      },
      {
        id: 'nasihat',
        skillId: 'nasihat-dini',
        text: 'Udahlah, jangan kebanyakan atur jadwal. Ikut aja sekarang.',
        next: 'ra-tegang-lab',
      },
    ],
  },

  // Ketegangan fase awal: Raka menarik diri ke balik kesibukan
  {
    id: 'ra-tegang-lab',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Oke, noted. Kalau gitu aku lanjut kerja dulu ya, masih banyak banget yang harus kukejar.',
      expression: 'menutup-diri',
      cue: 'Raka tersenyum tipis, membuka laptop, dan mulai mengetik tanpa menoleh ke arah Dosen.',
    },
    tension: { phase: 'awal', expectedKind: 'menarik-diri' },
    choices: [
      {
        id: 'akui',
        skillId: 'sampaikan-pengamatan',
        text: 'Kalimatku tadi mungkin terasa menghakimi. Aku pengin dengar sisimu, ya.',
        options: { observationTone: 'faktual' },
        action: { kind: 'akui-ketegangan' },
        next: 'ra-perbaikan-lab',
        best: true,
      },
      {
        id: 'abaikan-validasi',
        skillId: 'validasi-normalisasi',
        text: 'Nggak apa-apa. Silakan lanjut kerja, aku duduk di sini aja.',
        next: 'ra-tegang-lab',
        reaction: {
          text: 'Siap, makasih ya pengertiannya.',
          expression: 'menutup-diri',
          cue: 'Raka mengangguk singkat; jarinya terus mengetik lebih cepat dari sebelumnya.',
        },
      },
      {
        id: 'abaikan-jeda',
        skillId: 'jeda-hening',
        text: 'Oke, aku tunggu bentar di sini ya.',
        next: 'ra-tegang-lab',
        reaction: {
          text: 'Eh, iya. Bentar ya, tinggal satu tabel lagi.',
          expression: 'menutup-diri',
          cue: 'Raka menatap layar, tetapi kursornya diam dan matanya tidak bergerak.',
        },
      },
      {
        id: 'nasihat',
        skillId: 'nasihat-dini',
        text: 'Jangan sibuk banget gitu. Kamu harus belajar santai dikit.',
        next: 'ra-tegang-lab',
        reaction: {
          text: 'Iya iya, nanti kuatur. Udah masuk daftar kok.',
          expression: 'menutup-diri',
          cue: 'Raka tertawa pendek yang terdengar kaku, lalu kembali menatap layar.',
        },
      },
    ],
  },

  // Ketegangan fase perbaikan: hub tiga langkah + satu opsi keliru
  {
    id: 'ra-perbaikan-lab',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Maaf, tadi aku agak ketus ya? Rasanya kayak lagi dinilai, padahal aku udah berusaha rapi banget.',
      expression: 'menunduk',
      cue: 'Raka menutup laptop pelan dan menaruh kedua tangannya di atas daftar, tidak lagi melirik jam.',
    },
    tension: { phase: 'perbaikan' },
    choices: [
      {
        id: 'akui-dampak',
        skillId: 'validasi-normalisasi',
        text: 'Caraku tadi memang terasa menghakimi. Maaf ya, bukan itu maksudku.',
        action: { kind: 'perbaikan', step: 'akui-dampak' },
        next: 'ra-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Makasih udah bilang. Jadi lebih lega nih.',
          expression: 'netral',
          cue: 'Raka mengembuskan napas dan bersandar sedikit di kursinya.',
        },
        best: true,
      },
      {
        id: 'eksplorasi-perasaan',
        skillId: 'pertanyaan-terbuka',
        text: 'Boleh tahu, bagian mana yang paling terasa kayak dinilai?',
        action: { kind: 'perbaikan', step: 'eksplorasi-perasaan' },
        next: 'ra-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Pas disebut gelisah. Padahal aku cuma takut ada yang kelewat dan jadi salahku, gitu.',
          expression: 'cemas',
          cue: 'Raka berbicara lebih pelan dari biasanya, jarinya memutar pulpen.',
        },
      },
      {
        id: 'beri-pilihan',
        skillId: 'jeda-hening',
        text: 'Kita bisa lanjut pelan-pelan, ganti topik, atau berhenti dulu. Terserah kamu.',
        action: { kind: 'perbaikan', step: 'beri-pilihan' },
        next: 'ra-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Lanjut aja, tapi pelan-pelan ya. Kali ini tanpa daftar dulu.',
          expression: 'lega',
          cue: 'Raka meletakkan kertas daftarnya telungkup di meja dan tersenyum tipis.',
        },
      },
      {
        id: 'remehkan',
        skillId: 'meremehkan',
        text: 'Ah, itu cuma soal jadwal. Jangan dibawa serius, santai aja.',
        next: 'ra-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Iya sih, mungkin aku aja yang lebay.',
          expression: 'menutup-diri',
          cue: 'Raka mengambil daftarnya lagi dan melipatnya dua kali, rapat.',
        },
      },
    ],
  },
];


