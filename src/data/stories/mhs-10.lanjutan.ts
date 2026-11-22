import type { StoryNode } from '../../engine/story/storyTypes';

/**
 * Teguh Santosa (mhs-10): adegan lanjutan (epilog di pintu gudang alat) dan tiga akhir.
 * Id simpul: te-f0, te-f1 (penutup bersama), te-akhir-terbantu, te-akhir-kemajuan, te-akhir-menarik.
 * Dirakit di mhs-10.ts. Ringkasan tidak memakai label menang, kalah, atau game over.
 */

const SCENE = 'lanjutan';

export const MHS_10_LANJUTAN_NODES: StoryNode[] = [
  {
    id: 'te-f0',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    marks: ['kejutan'],
    reply: {
      text: 'Bu, lihat pintunya. Kertas itu kutempel Senin, tulisannya "Sedang kalibrasi, ketuk dua kali". Kemarin Bagas beneran ngetuk dua kali, lalu pergi tanpa bilang apa-apa.',
      expression: 'tersenyum',
      cue: 'Teguh berdiri di ambang pintu gudang dengan bahu santai, dan menunjuk kertas bertuliskan tangan yang menempel miring di daun pintu.',
      aside: 'Beberapa hari kemudian. Di lantai depan pintu gudang ada sebuah gelas teh kertas yang masih hangat.',
    },
    choices: [
      {
        id: 'afirmasi-langkah',
        skillId: 'afirmasi-kekuatan',
        text: 'Kamu menetapkan batasmu dengan ramah, dan Bagas menghormatinya. Itu hasil usahamu.',
        reaction: {
          text: 'Makasih, Bu. Kalau dipikir, tandanya sederhana, tapi Bagas ngerti. Latihan Rabu kemarin juga lancar, cuma dua langkah kalibrasi yang tertukar urutannya.',
          expression: 'lega',
          cue: 'Teguh mengambil gelas teh dari lantai, lalu menaruhnya di rak dekat kain pembersih.',
        },
        next: 'te-f1',
        best: true,
      },
      {
        id: 'tanya-rasa',
        skillId: 'pertanyaan-terbuka',
        text: 'Waktu mendengar ketukan dua kali itu, apa yang terlintas di pikiranmu?',
        reaction: {
          text: 'Lega, Bu. Ada yang ngerti tanda itu tanpa aku harus jelasin panjang. Rabu kemarin juga latihannya lancar, cuma dua langkah kalibrasi yang tertukar.',
          expression: 'lega',
          cue: 'Teguh menarik napas panjang dan bersandar ringan ke daun pintu sambil memegang gelas teh.',
        },
        next: 'te-f1',
      },
      {
        id: 'nasihat-lanjut',
        skillId: 'nasihat-dini',
        text: 'Sekarang ajak Bagas masuk dan makan siang bareng. Jangan setengah-setengah.',
        next: 'te-tegang-bk',
      },
      {
        id: 'remehkan-kecil',
        skillId: 'meremehkan',
        text: 'Itu cuma ketukan dan segelas teh. Belum berarti apa-apa.',
        next: 'te-tegang-bk',
      },
    ],
  },
  {
    id: 'te-f1',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Dulu kukira orang pasti tersinggung kalau aku menolak. Ternyata cukup dikasih tanda. Rabu kemarin latihannya pas, cuma dua langkah yang tertukar urutannya.',
      expression: 'lega',
      cue: 'Teguh mengambil gelas teh di lantai dengan dua tangan, lalu menaruhnya di rak dekat kain pembersih.',
      aside: 'Dari kejauhan, terdengar dua orang bergurau pelan di lorong lab, lalu suaranya menjauh tanpa mampir ke gudang.',
    },
    choices: [
      {
        id: 'refleksi-tanda',
        skillId: 'refleksi-perasaan',
        text: 'Kamu lega karena dipahami, tapi masih sedikit waspada pada orang yang belum mengerti.',
        next: '@ending',
        best: true,
        options: { reflectionNuance: 'ragu-kurang-percaya' },
      },
      {
        id: 'validasi-tanda',
        skillId: 'validasi-normalisasi',
        text: 'Kasih tanda yang jelas itu cara yang sah untuk menjaga ruangmu.',
        next: '@ending',
      },
      {
        id: 'tanya-pilihan',
        skillId: 'pertanyaan-terbuka',
        text: 'Untuk Rabu depan, bagian mana yang ingin kamu latih lebih dulu?',
        next: '@ending',
      },
      {
        id: 'tanya-tertutup',
        skillId: 'pertanyaan-tertutup',
        text: 'Jadi minggu depan kamu mulai makan bareng teman, kan?',
        next: '@ending',
      },
    ],
  },
  {
    id: 'te-akhir-terbantu',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Makasih, Bu. Aku masih lebih suka sendiri, dan sekarang itu terasa bukan sesuatu yang harus kujelasin terus. Rabu depan kita ulang bagian yang tertukar tadi.',
      expression: 'lega',
      cue: 'Teguh membuka pintu gudang lebar-lebar, menarik bangku kedua ke dekat rak, dan duduk dengan buku saku terbuka di pangkuan.',
      aside: 'Di daun pintu, kertas "ketuk dua kali" ditambah satu baris kecil di bawahnya: "Rabu 15.30, ada tamu".',
    },
    choices: [],
    ending: { kind: 'terbantu' },
  },
  {
    id: 'te-akhir-kemajuan',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Aku coba dulu satu sesi Rabu, ya. Sisanya kuamati sendiri, nanti kukabari Ibu kalau udah ada gambaran.',
      expression: 'netral',
      cue: 'Teguh mengangguk, melipat sobekan kertas jadwalnya menjadi kotak kecil, dan menyelipkannya di sampul buku saku.',
      aside: 'Langkah kecil sudah dimulai. Pintu untuk bertemu lagi tetap terbuka, dan kamu bisa melanjutkan percakapan ini kapan saja.',
    },
    choices: [],
    ending: { kind: 'kemajuan-kecil' },
  },
  {
    id: 'te-akhir-menarik',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Maaf, Bu, aku balik ke alatku dulu. Kalibrasinya belum selesai.',
      expression: 'menutup-diri',
      cue: 'Teguh memasang penutup debu pada alat ukur, menutup pintu gudang perlahan dari dalam, dan tidak menoleh.',
      aside: 'Hubungan ini masih dapat dipulihkan. Pertemuan berikutnya bisa dimulai lebih pelan, dan Teguh yang menentukan tempo serta tempatnya.',
    },
    choices: [],
    ending: { kind: 'menarik-diri-sementara' },
  },
];
