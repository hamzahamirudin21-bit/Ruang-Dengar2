import type { StoryNode } from '../../engine/story/storyTypes';

/**
 * Mita Rahmawati (mhs-06): adegan lanjutan (epilog di meja praktikum) dan tiga akhir.
 * Id simpul: mi-f0, mi-f1 (penutup bersama), mi-akhir-terbantu, mi-akhir-kemajuan, mi-akhir-menarik.
 * Dirakit di mhs-06.ts. Ringkasan tidak memakai label menang, kalah, atau game over.
 */

const SCENE = 'lanjutan';

export const MITA_LANJUTAN_NODES: StoryNode[] = [
  {
    id: 'mi-f0',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    marks: ['kejutan'],
    reply: {
      text: 'Bu, kemarin aku jadi nanya. Kak asistennya malah bilang, tiga orang lain juga belum paham bagian timer. Aku sampai lupa nunduk.',
      expression: 'tersenyum',
      cue: 'Mita berdiri di samping meja praktikum dengan lengan baju tergulung rapi, bundelnya terbuka dan satu tanda tanya sudah dicoret.',
      aside: 'Beberapa hari kemudian. Di meja praktikum, papan mikrokontroler Mita menyala dengan lampu kecil yang berkedip teratur.',
    },
    choices: [
      {
        id: 'afirmasi-langkah',
        skillId: 'afirmasi-kekuatan',
        text: 'Kamu bawa satu pertanyaan dan nyoret sendiri. Itu keberanian nyata, Mita.',
        next: 'mi-f1',
        best: true,
        reaction: {
          text: 'Makasih, Bu, aku seneng dengernya. Tapi jujur masih deg-degan, sepuluh pertanyaan lainnya belum berani kusentuh.',
          expression: 'lega',
          cue: 'Mita tersenyum kecil dan jarinya mengusap tanda tanya yang sudah dicoret.',
          aside: 'Di seberang meja, seorang teman sekelompok menggeser kursinya dan menunjuk layar Mita sambil bertanya sesuatu.',
        },
      },
      {
        id: 'tanya-rasa',
        skillId: 'pertanyaan-terbuka',
        text: 'Pas tahu kamu nggak sendirian, apa yang kamu rasain di dalam?',
        next: 'mi-f1',
        reaction: {
          text: 'Pas tahu nggak sendirian, lega banget, Bu, kayak bahuku turun. Tapi masih deg-degan, sepuluh pertanyaan lain belum berani kusentuh.',
          expression: 'lega',
          cue: 'Mita memejamkan mata sebentar sambil menghela napas ringan.',
          aside: 'Di seberang meja, seorang teman sekelompok menggeser kursinya dan menunjuk layar Mita sambil bertanya sesuatu.',
        },
      },
      {
        id: 'nasihat-lanjut',
        skillId: 'nasihat-dini',
        text: 'Bagus, besok tanyain sepuluh sisanya sekaligus. Jangan setengah-setengah.',
        next: 'mi-tegang-bk',
      },
      {
        id: 'remehkan-kecil',
        skillId: 'meremehkan',
        text: 'Itu baru satu pertanyaan. Belum perlu dirayain.',
        next: 'mi-tegang-bk',
      },
    ],
  },
  {
    id: 'mi-f1',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Tapi jujur, masih deg-degan banget, Bu. Sepuluh pertanyaan lain belum berani kusentuh. Makasih udah mau nungguin aku bicara, ya.',
      expression: 'lega',
      cue: 'Mita menutup bundelnya perlahan, memegang ujung lengan bajunya sebentar, lalu melepasnya sendiri.',
      aside: 'Di seberang meja, seorang teman sekelompok menggeser kursinya dan menunjuk layar Mita sambil bertanya sesuatu.',
    },
    choices: [
      {
        id: 'refleksi-degdegan',
        skillId: 'refleksi-perasaan',
        text: 'Kamu lega udah nanya, tapi masih gugup buat sisanya. Dua rasa itu bisa ada bareng.',
        next: '@ending',
        best: true,
        options: { reflectionCorrectOverride: true },
      },
      {
        id: 'validasi-degdegan',
        skillId: 'validasi-normalisasi',
        text: 'Berani nanya itu perlu dilatih pelan-pelan, dan gugup itu manusiawi kok.',
        next: '@ending',
      },
      {
        id: 'tanya-pilihan',
        skillId: 'pertanyaan-terbuka',
        text: 'Kalau kamu yang pilih, pertanyaan kecil mana yang paling ringan berikutnya?',
        next: '@ending',
      },
      {
        id: 'tanya-tertutup',
        skillId: 'pertanyaan-tertutup',
        text: 'Jadi minggu depan kamu tanyain satu lagi, kan?',
        next: '@ending',
      },
    ],
  },
  {
    id: 'mi-akhir-terbantu',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Aku masih sering mikir dulu sebelum bicara, tapi sekarang nanya rasanya bukan aib lagi. Kita lanjut Kamis depan ya, Bu.',
      expression: 'lega',
      cue: 'Mita menulis satu pertanyaan baru di bundelnya, lalu mengangkat tangan sedikit ke arah asisten sambil tersenyum.',
      aside: 'Teman sekelompok menoleh, dan Mita menggeser kursi agar mereka bisa melihat layar bersama.',
    },
    choices: [],
    ending: { kind: 'terbantu' },
  },
  {
    id: 'mi-akhir-kemajuan',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Aku coba pelan-pelan dulu ya, Bu. Satu pertanyaan dulu, sisanya kupikirin lagi nanti.',
      expression: 'netral',
      cue: 'Mita mengangguk, merapikan bundelnya dengan hati-hati, dan menyimpannya ke dalam tas sambil tersenyum tipis.',
      aside: 'Langkah kecil sudah dimulai. Pintu untuk bertemu lagi tetap terbuka, dan kamu bisa melanjutkan percakapan ini kapan saja.',
    },
    choices: [],
    ending: { kind: 'kemajuan-kecil' },
  },
  {
    id: 'mi-akhir-menarik',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Maaf, Bu, aku balik ke modul dulu ya. Aku udah kebanyakan makan waktu Ibu.',
      expression: 'menutup-diri',
      cue: 'Mita menunduk, menarik lengan baju sampai menutupi tangan, lalu berjalan ke meja praktikum tanpa menoleh.',
      aside: 'Hubungan ini masih dapat dipulihkan. Pertemuan berikutnya bisa dimulai dengan lebih pelan, dan Mita yang menentukan tempo.',
    },
    choices: [],
    ending: { kind: 'menarik-diri-sementara' },
  },
];
