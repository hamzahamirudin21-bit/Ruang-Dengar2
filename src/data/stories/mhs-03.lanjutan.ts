import type { StoryNode } from '../../engine/story/storyTypes';

/**
 * Tania Wijaya (mhs-03): adegan lanjutan (epilog di lab) dan tiga akhir.
 * Id simpul: ta-f0, ta-f1 (penutup bersama), ta-akhir-terbantu, ta-akhir-kemajuan, ta-akhir-menarik.
 * Dirakit di mhs-03.ts. Ringkasan tidak memakai label menang, kalah, atau game over.
 */

const SCENE = 'lanjutan';

export const MHS_03_LANJUTAN_NODES: StoryNode[] = [
  {
    id: 'ta-f0',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    marks: ['kejutan'],
    reply: {
      text: 'Bu! Aku udah ngobrol sama Kak Dewi, dan ternyata dulu dia juga hampir mundur sebelum daftar. Sampai sekarang masih sering salah juga katanya. Aku sampai ketawa kaget, literally.',
      expression: 'tersenyum',
      cue: 'Tania menyambut dengan langkah cepat. Pulpennya terselip di telinga, dan lembar berkolom itu terlipat rapi di sakunya.',
      aside: 'Beberapa hari kemudian. Lab sore itu lengang, dan pengumuman asisten riset masih menempel di papan.',
    },
    choices: [
      {
        id: 'afirmasi-langkah',
        skillId: 'afirmasi-kekuatan',
        text: 'Kamu isi kolomnya dan beneran nemuin Kak Dewi. Itu langkah yang nyata, lho.',
        reaction: { text: 'Hehe, iya, Bu. Awalnya deg-degan, tapi Kak Dewi ramah banget.', expression: 'tersenyum', cue: 'Tania tertawa kecil dan menyingkirkan rambut dari pipinya.' },
        next: 'ta-f1',
        best: true,
      },
      {
        id: 'tanya-rasa',
        skillId: 'pertanyaan-terbuka',
        text: 'Waktu Kak Dewi bilang itu, apa yang terlintas tentang dirimu?',
        reaction: { text: 'Yang terlintas? Ternyata aku nggak sendirian, Bu. Lega banget.', expression: 'lega', cue: 'Tania tersenyum lebar sambil menghela napas.' },
        next: 'ta-f1',
      },
      {
        id: 'nasihat-daftar',
        skillId: 'nasihat-dini',
        text: 'Kalau Kak Dewi saja begitu, langsung daftar saja sekarang. Tidak ada alasan menunda.',
        next: 'ta-tegang-bk',
      },
      {
        id: 'remehkan-kecil',
        skillId: 'meremehkan',
        text: 'Itu cuma ngobrol biasa. Keputusan besarnya kan belum kamu ambil.',
        next: 'ta-tegang-bk',
      },
    ],
  },
  {
    id: 'ta-f1',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Aku belum mutusin, Bu. Tapi anehnya nggak sepanik kemarin. Tadi ada adik tingkat nanya osiloskop lagi, dan aku jawab sambil nggak mikirin hasil seleksi.',
      expression: 'tertegun',
      cue: 'Tania menepuk pelan saku tempat lembar itu tersimpan, lalu menatap papan pengumuman sambil tersenyum kecil.',
      aside: 'Dari meja seberang, seorang adik tingkat melambai dan mengangkat probe osiloskop sambil bertanya tanpa suara.',
    },
    choices: [
      {
        id: 'refleksi-tenang',
        skillId: 'refleksi-perasaan',
        text: 'Kamu belum memutuskan, tetapi mulai merasa dirimu berharga di luar hasil seleksi.',
        next: '@ending',
        best: true,
        options: { reflectionNuance: 'ragu-kurang-percaya' },
      },
      {
        id: 'validasi-belum',
        skillId: 'validasi-normalisasi',
        text: 'Belum memutuskan itu nggak apa-apa. Merasa lebih tenang itu sudah kemajuan.',
        next: '@ending',
      },
      {
        id: 'tanya-langkah',
        skillId: 'pertanyaan-terbuka',
        text: 'Langkah kecil apa yang terasa cukup nyaman untuk kamu ambil berikutnya?',
        next: '@ending',
      },
      {
        id: 'tanya-tertutup-daftar',
        skillId: 'pertanyaan-tertutup',
        text: 'Jadi akhirnya kamu mau daftar asisten riset, kan?',
        next: '@ending',
      },
    ],
  },
  {
    id: 'ta-akhir-terbantu',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Pilihanku belum final, Bu. Tapi aku sadar aku tetap Tania yang sama, apa pun hasilnya. Makasih udah nemenin aku mikir.',
      expression: 'lega',
      cue: 'Tania berjalan ke meja adik tingkat itu dan memegang probe bersamanya. Pulpennya kini hanya terselip diam di telinga.',
      aside: 'Di bawah kolom "yang aku mau", ia menulis satu baris pendek sebelum melipat kertasnya kembali.',
    },
    choices: [],
    ending: { kind: 'terbantu' },
  },
  {
    id: 'ta-akhir-kemajuan',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Aku pikirin pelan-pelan dulu ya, Bu. Mungkin minggu depan aku isi kolom itu lagi.',
      expression: 'netral',
      cue: 'Tania mengangguk, melipat lembar berkolomnya, lalu tersenyum tipis sambil mengetuk pulpen satu kali.',
      aside: 'Langkah kecil sudah dimulai. Pintu untuk bertemu lagi tetap terbuka, dan kamu bisa melanjutkan percakapan ini kapan saja.',
    },
    choices: [],
    ending: { kind: 'kemajuan-kecil' },
  },
  {
    id: 'ta-akhir-menarik',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Kayaknya aku butuh mikir sendiri dulu, Bu. Makasih ya udah dengerin.',
      expression: 'menutup-diri',
      cue: 'Tania menyelipkan pulpennya di saku, merapikan map, lalu pergi dengan langkah tenang tanpa menoleh.',
      aside: 'Hubungan ini masih dapat dipulihkan. Pertemuan berikutnya bisa dimulai lebih pelan, dan Tania yang menentukan tempo.',
    },
    choices: [],
    ending: { kind: 'menarik-diri-sementara' },
  },
];
