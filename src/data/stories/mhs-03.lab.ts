/**
 * Adegan Lab untuk Tania Wijaya (mhs-03): pembukaan baku, kejutan adik tingkat menyebut
 * pengumuman asisten riset, isyarat mengetuk pena, ajakan ke Ruang Konsultasi, serta
 * Ketegangan `menarik-diri` dan hub perbaikan. Dirakit di ./mhs-03.ts. Awalan id simpul `ta-`.
 */
import type { StoryLine, StoryNode } from '../../engine/story/storyTypes';
import { buildOpeningNode } from '../storyStages';

const STUDENT_ID = 'mhs-03';
const SCENE = 'lab';

const JUNIOR_ASIDE =
  'Seorang adik tingkat berhenti di dekat meja. "Kak Tania, pengumuman asisten riset sudah ditempel. Kakak daftar, kan?"';

const KEJUTAN_LINE: StoryLine = {
  text: 'Hehe, doain aja ya, Bu. Eh, tadi kita lagi bahas apa ya? Oh iya, osiloskop tadi...',
  expression: 'terkejut',
  cue: 'Tawanya masih ada, tetapi pulpen di tangannya mengetuk meja makin cepat.',
  aside: JUNIOR_ASIDE,
};

export const TANIA_LAB_NODES: StoryNode[] = [
  buildOpeningNode({
    id: 'ta-buka',
    studentId: STUDENT_ID,
    sceneId: SCENE,
    name: 'Tania',
    reply: {
      text: 'Halo, Bu! Pas banget, aku lagi bingung banget bandingin dua jadwal nih. Ibu lagi sibuk nggak?',
      expression: 'tersenyum',
      cue: 'Tania menoleh cepat dari lembar jadwal yang penuh coretan, pulpennya mengetuk-ngetuk pinggir meja.',
    },
    best: 'sapaan-hangat',
    next: {
      'sapaan-hangat': 'ta-l2',
      'pertanyaan-terbuka': 'ta-l2',
      'pertanyaan-tertutup': 'ta-l2',
      'nasihat-dini': 'ta-tegang-lab',
    },
    reactions: {
      'sapaan-hangat': {
        text: 'Halo juga, Bu! Kabarku lumayan, tapi kepalaku lagi ribut sama jadwal, hehe.',
        expression: 'tersenyum',
        cue: 'Tania melambai kecil sambil memegang dua lembar jadwal.',
      },
      'pertanyaan-terbuka': {
        text: 'Pikiranku? Jujurly banyak banget, Bu, tapi intinya dua jadwal ini. Susah banget milih salah satu.',
        expression: 'cemas',
        cue: 'Tania tertawa kecil sambil menyodorkan dua kertas yang sama-sama penuh coretan.',
      },
      'pertanyaan-tertutup': {
        text: 'Lumayan sih. Eh, nggak juga deh. Hehe, ya lumayan lah.',
        expression: 'netral',
        cue: 'Tania menjawab cepat, lalu mengetuk pulpennya dua kali tanpa alasan jelas.',
      },
    },
  }),

  {
    id: 'ta-l2',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: KEJUTAN_LINE,
    marks: ['kejutan', 'isyarat-nonverbal'],
    choices: [
      {
        id: 'pengamatan-faktual',
        skillId: 'sampaikan-pengamatan',
        text: 'Pulpenmu mengetuk lebih cepat waktu pengumuman asisten riset disebut tadi.',
        reaction: { text: 'Eh, kelihatan ya, Bu? Hehe, kebiasaan kalau lagi mikir.', expression: 'terkejut', cue: 'Tania menghentikan pulpennya dan menyembunyikannya di balik kertas.' },
        options: { observationTone: 'faktual' },
        next: 'ta-l3',
        setFlags: ['isyarat-diperhatikan'],
        best: true,
      },
      {
        id: 'afirmasi',
        skillId: 'afirmasi-kekuatan',
        text: 'Adik tingkat mencarimu soal osiloskop. Kamu memang tempat bertanya yang enak.',
        reaction: { text: 'Aduh, Ibu bisa aja, hehe. Seneng sih dibilang gitu.', expression: 'tersenyum', cue: 'Tania menutup mulut sambil tertawa kecil.' },
        next: 'ta-l3',
      },
      {
        id: 'tertutup',
        skillId: 'pertanyaan-tertutup',
        text: 'Jadi kamu akan mendaftar asisten riset itu, kan?',
        reaction: { text: 'Hmm, iya sih, Bu, kepikiran mau daftar. Tapi belum pasti, jujurly.', expression: 'cemas', cue: 'Tania memutar-mutar pulpen di jarinya.' },
        next: 'ta-l3',
      },
      {
        id: 'pengamatan-menilai',
        skillId: 'sampaikan-pengamatan',
        text: 'Kamu kelihatan gelisah sekali, seperti takut tidak lolos.',
        options: { observationTone: 'menilai' },
        next: 'ta-tegang-lab',
        reaction: {
          text: 'Enggak kok, Bu. Aku biasa aja. Lanjut aja yuk bahas yang lain.',
          expression: 'menutup-diri',
          cue: 'Tawa Tania berhenti, ia menaruh pulpen dan merapikan kertas jadwalnya dengan cepat.',
        },
      },
    ],
  },

  {
    id: 'ta-l3',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Jujurly ada yang pengen aku ceritain, Bu. Tapi di sini anak-anak tim IoT lalu-lalang terus, jadi canggung.',
      expression: 'cemas',
      cue: 'Tania melirik rekan satu timnya di meja seberang, lalu menurunkan suaranya yang biasanya lantang.',
    },
    choices: [
      {
        id: 'ajak-ruang-bk',
        skillId: 'validasi-normalisasi',
        text: 'Wajar kok pengin tempat yang lebih sepi. Mau pindah ke Ruang Konsultasi?',
        next: 'ta-l3-tolak',
        routes: [{ when: [{ type: 'trust-min', value: 29 }], next: 'ta-b0' }],
        best: true,
      },
      {
        id: 'privasi',
        skillId: 'batas-kerahasiaan',
        text: 'Apa pun yang kamu ceritakan tetap di antara kita, kecuali menyangkut keselamatanmu.',
        reaction: { text: 'Wah, makasih ya, Bu. Itu bikin aku agak lega buat lanjut.', expression: 'lega', cue: 'Tania menarik napas dan bahunya turun.' },
        next: 'ta-l3b',
        setFlags: ['privasi-dijelaskan'],
      },
      {
        id: 'janji-mutlak',
        skillId: 'janji-mutlak',
        text: 'Tenang, pasti aman. Tidak ada satu pun orang yang akan tahu, saya jamin.',
        next: 'ta-l3b',
        reaction: {
          text: 'Beneran, Bu? Soalnya tim kami kecil banget, kabar tuh cepet banget nyebar... Aku pikir dulu ya.',
          expression: 'cemas',
          cue: 'Tania tersenyum kaku dan menarik kertas jadwal ke dekat dadanya.',
        },
      },
      {
        id: 'terbuka',
        skillId: 'pertanyaan-terbuka',
        text: 'Apa yang membuatmu ragu bercerita di sini?',
        reaction: { text: 'Canggung aja, Bu. Nanti anak-anak denger terus nanya-nanya, hehe.', expression: 'netral', cue: 'Tania melirik ke arah anak-anak tim yang lewat.' },
        next: 'ta-l3b',
      },
    ],
  },

  {
    id: 'ta-l3-tolak',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Hmm, nanti dulu deh, Bu. Jujurly aku sendiri belum yakin mau cerita apa. Di sini aja dulu ya.',
      expression: 'menunduk',
      cue: 'Tania meletakkan pulpennya lalu mengambilnya lagi, jarinya tidak tahu mau diapakan.',
    },
    choices: [
      {
        id: 'privasi',
        skillId: 'batas-kerahasiaan',
        text: 'Boleh aku jelasin dulu? Ceritamu tetap di antara kita, dan boleh berhenti kapan aja.',
        reaction: { text: 'Oh, boleh berhenti kapan aja ya? Oke deh, Bu, aku dengerin.', expression: 'lega', cue: 'Tania mengangguk dan duduk lebih tegak.' },
        next: 'ta-l3b',
        setFlags: ['privasi-dijelaskan'],
        best: true,
      },
      {
        id: 'validasi',
        skillId: 'validasi-normalisasi',
        text: 'Nggak apa-apa kok belum yakin. Kita ikuti tempomu aja.',
        reaction: { text: 'Hehe, makasih, Bu. Lega dibilang gitu, aku emang belum rapi mikirnya.', expression: 'tersenyum', cue: 'Tania nyengir sambil menggaruk pipinya.' },
        next: 'ta-l3b',
      },
      {
        id: 'terbuka',
        skillId: 'pertanyaan-terbuka',
        text: 'Bagian mana yang terasa belum yakin buatmu?',
        reaction: { text: 'Belum yakin soal harus mulai dari mana, Bu. Aku muter-muter aja.', expression: 'cemas', cue: 'Tania menggerakkan jari berputar di atas meja.' },
        next: 'ta-l3b',
      },
      {
        id: 'nasihat',
        skillId: 'nasihat-dini',
        text: 'Jangan ragu begitu, Tania. Ayo ikut saja, nanti juga lega.',
        next: 'ta-tegang-lab',
      },
    ],
  },

  {
    id: 'ta-l3b',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Iya deh, Bu. Kayaknya aku bisa lebih jujur kalau nggak ada yang denger. Gaskeun.',
      expression: 'netral',
      cue: 'Tania menghela napas dan akhirnya berhenti mengetuk pulpennya.',
    },
    choices: [
      {
        id: 'ajak-ruang-bk',
        skillId: 'validasi-normalisasi',
        text: 'Makasih sudah mau mencoba. Kita jalan pelan-pelan ke Ruang Konsultasi, ya.',
        reaction: { text: 'Sama-sama, Bu! Yuk, pelan-pelan aja ya jalannya, hehe.', expression: 'tersenyum', cue: 'Tania berdiri dan merapikan tasnya.' },
        next: 'ta-b0',
        best: true,
      },
      {
        id: 'sapaan',
        skillId: 'sapaan-hangat',
        text: 'Senang kamu mau. Yuk, aku temani ke Ruang Konsultasi.',
        reaction: { text: 'Iya, Bu, temenin ya. Aku ambil tas dulu bentar.', expression: 'tersenyum', cue: 'Tania buru-buru menyambar tasnya dari kursi.' },
        next: 'ta-b0',
      },
      {
        id: 'tertutup',
        skillId: 'pertanyaan-tertutup',
        text: 'Jadi ikut atau tidak? Cukup jawab ya atau tidak.',
        next: 'ta-l3b',
        reaction: {
          text: 'Aduh, Bu, jangan buru-buru gitu dong. Aku kan lagi belajar nentuin pilihan.',
          expression: 'cemas',
          cue: 'Tania tertawa canggung, pulpennya kembali mengetuk meja.',
        },
      },
      {
        id: 'nasihat',
        skillId: 'nasihat-dini',
        text: 'Sudah, ikut saja. Ini baik untuk kariermu sendiri.',
        next: 'ta-tegang-lab',
      },
    ],
  },

  // Ketegangan fase awal: Tania menarik diri (jadi sopan dan datar)
  {
    id: 'ta-tegang-lab',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Oh, iya, Bu. Maaf, aku kebanyakan ngomong ya. Aku lanjut ngerjain jadwal dulu.',
      expression: 'menutup-diri',
      cue: 'Tawa Tania lenyap. Ia menggeser kursi ke arah laptop dan menatap layar tanpa mengetik apa pun.',
    },
    tension: { phase: 'awal', expectedKind: 'menarik-diri' },
    choices: [
      {
        id: 'akui',
        skillId: 'sampaikan-pengamatan',
        text: 'Ucapanku tadi mungkin terasa menghentikanmu. Aku pengin dengar dari sisimu.',
        options: { observationTone: 'faktual' },
        action: { kind: 'akui-ketegangan' },
        next: 'ta-perbaikan-lab',
        best: true,
      },
      {
        id: 'abaikan-validasi',
        skillId: 'validasi-normalisasi',
        text: 'Nggak apa-apa. Lanjut aja jadwalmu, aku nunggu di sini.',
        next: 'ta-tegang-lab',
        reaction: {
          text: 'Iya, Bu. Makasih.',
          expression: 'menutup-diri',
          cue: 'Suara Tania datar. Pulpennya diam di samping laptop.',
        },
      },
      {
        id: 'abaikan-jeda',
        skillId: 'jeda-hening',
        text: 'Oke, aku diam sebentar di sini.',
        next: 'ta-tegang-lab',
        reaction: {
          text: 'Hm, iya.',
          expression: 'menutup-diri',
          cue: 'Tania menggulir layar berulang kali tanpa membaca isinya.',
        },
      },
      {
        id: 'nasihat',
        skillId: 'nasihat-dini',
        text: 'Jangan sungkan begitu. Cerewet itu bagus, nanti juga terbiasa.',
        next: 'ta-tegang-lab',
        reaction: {
          text: 'Iya, Bu. Baik.',
          expression: 'menutup-diri',
          cue: 'Tania tersenyum sopan, tetapi matanya tidak ikut tersenyum.',
        },
      },
    ],
  },

  // Ketegangan fase perbaikan: hub tiga langkah + satu opsi keliru
  {
    id: 'ta-perbaikan-lab',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Tadi rasanya kayak diberhentiin di tengah jalan. Aku jadi nggak enak sendiri, Bu.',
      expression: 'menunduk',
      cue: 'Tania memutar pulpen pelan di antara jari, tidak lagi mengetuk.',
    },
    tension: { phase: 'perbaikan' },
    choices: [
      {
        id: 'akui-dampak',
        skillId: 'validasi-normalisasi',
        text: 'Caraku tadi memotongmu. Aku akui itu, dan maaf ya.',
        action: { kind: 'perbaikan', step: 'akui-dampak' },
        next: 'ta-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Iya, Bu. Makasih udah ngomong gitu. Lumayan lega.',
          expression: 'netral',
          cue: 'Bahu Tania turun dan ia menyunggingkan senyum kecil.',
        },
        best: true,
      },
      {
        id: 'eksplorasi-perasaan',
        skillId: 'pertanyaan-terbuka',
        text: 'Boleh cerita, bagian mana tadi yang paling nggak enak?',
        action: { kind: 'perbaikan', step: 'eksplorasi-perasaan' },
        next: 'ta-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Pas dibilang begitu, aku ngerasa salah ngomong lagi. Padahal aku cuma mau jujur.',
          expression: 'cemas',
          cue: 'Tania menatap Dosen sekilas, suaranya lebih pelan dari biasanya.',
        },
      },
      {
        id: 'beri-pilihan',
        skillId: 'jeda-hening',
        text: 'Kita bisa lanjut, ganti topik, atau berhenti dulu. Kamu yang tentukan.',
        action: { kind: 'perbaikan', step: 'beri-pilihan' },
        next: 'ta-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Lanjut aja deh, Bu. Tapi pelan-pelan, ya.',
          expression: 'lega',
          cue: 'Tania meraih pulpennya lagi, kali ini tanpa mengetuk.',
        },
      },
      {
        id: 'remehkan',
        skillId: 'meremehkan',
        text: 'Ah, itu hal kecil. Kamu terlalu sensitif, Tania.',
        next: 'ta-perbaikan-lab',
        routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        reaction: {
          text: 'Oh. Iya, mungkin aku yang kebawa perasaan.',
          expression: 'menutup-diri',
          cue: 'Tania meluruskan tumpukan kertasnya dan menghindari tatapan Dosen.',
        },
      },
    ],
  },
];
