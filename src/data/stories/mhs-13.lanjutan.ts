import type { StoryNode } from '../../engine/story/storyTypes';

/**
 * Nisa Nurhaliza (mhs-13): adegan lanjutan (epilog di meja diskusi lab) dan tiga akhir.
 * Id simpul: ni-f0, ni-f1 (penutup bersama), ni-akhir-terbantu, ni-akhir-kemajuan, ni-akhir-menarik.
 * Dirakit di mhs-13.ts. Ringkasan tidak memakai label menang, kalah, atau game over.
 */

const SCENE = 'lanjutan';

export const MHS_13_LANJUTAN_NODES: StoryNode[] = [
  {
    id: 'ni-f0',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    marks: ['kejutan'],
    reply: {
      text: 'Bu, Rabu kemarin aku beneran senyapin hp. Pas kubuka jam sembilan, Fira cuma kirim stiker lucu. Dimas malah bilang, "Santai, Nis, besok aja." Aku sampai bengong, jujurly.',
      expression: 'tersenyum',
      cue: 'Nisa duduk di meja diskusi tanpa buku kecil di tangannya, tertawa kecil, lalu bertanya kabar Dosen satu kali saja dan langsung menunggu jawaban sendiri.',
      aside: 'Beberapa hari kemudian. Di sudut meja diskusi, buku kecil bergaris itu terbuka dan halaman terakhirnya kini punya satu baris tulisan.',
    },
    choices: [
      {
        id: 'afirmasi-langkah',
        skillId: 'afirmasi-kekuatan',
        text: 'Kamu senyapin hp sejam dan berani nunggu. Itu langkah nyata, Nisa.',
        reaction: {
          text: 'Hehe, makasih, Bu. Tapi nggak semulus itu juga sih. Selama sejam itu jariku gatel terus pengin ngecek chat, masih kepikiran kalau ada yang butuh aku. Untung Ibu mau nemenin nyobanya.',
          expression: 'lega',
          cue: 'Nisa menutup layar ponselnya, menekan sampulnya ke meja dengan telapak tangan, lalu mengembuskan napas pendek.',
          aside: 'Dari ujung meja, Fira melambai kecil ke arah Nisa tanpa mendekat, lalu kembali mengerjakan papan rangkaiannya.',
        },
        next: 'ni-f1',
        best: true,
      },
      {
        id: 'tanya-rasa',
        skillId: 'pertanyaan-terbuka',
        text: 'Pas lihat stiker Fira dan balasan Dimas, apa yang terlintas di hatimu?',
        reaction: {
          text: 'Lega, Bu, sama agak malu juga, ternyata mereka santai banget. Tapi tetep aja tadi tanganku gatel pengin ngecek chat, takut ada yang butuh aku. Makasih udah nemenin aku nyoba.',
          expression: 'lega',
          cue: 'Nisa menekan ponselnya yang tertutup ke meja dengan telapak tangan, lalu tertawa kecil dan mengembuskan napas ringan.',
          aside: 'Di ujung meja, Fira melambai kecil tanpa mendekat, lalu menunduk lagi ke papan rangkaiannya.',
        },
        next: 'ni-f1',
      },
      {
        id: 'nasihat-lanjut',
        skillId: 'nasihat-dini',
        text: 'Bagus, sekarang senyapin juga tiap malam dan jangan balas apa pun lagi.',
        next: 'ni-tegang-bk',
      },
      {
        id: 'remehkan-kecil',
        skillId: 'meremehkan',
        text: 'Itu cuma sejam. Belum perlu dibangga-banggain.',
        next: 'ni-tegang-bk',
      },
    ],
  },
  {
    id: 'ni-f1',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Tapi jujur, sepanjang jam itu tanganku gatel banget pengin ngecek chat. Aku masih takut ada yang butuh aku. Makasih ya, Bu, udah nemenin aku nyoba.',
      expression: 'lega',
      cue: 'Nisa menutup layar ponselnya, menekan sampulnya ke meja dengan telapak tangan, lalu mengembuskan napas pendek dan ringan.',
      aside: 'Dari ujung meja, Fira melambai kecil ke arah Nisa tanpa mendekat, lalu kembali ke papan rangkaiannya.',
    },
    choices: [
      {
        id: 'refleksi-gatal',
        skillId: 'refleksi-perasaan',
        text: 'Kamu lega udah rehat, tapi masih khawatir ada yang butuh kamu. Dua rasa itu hadir bareng.',
        next: '@ending',
        best: true,
        options: { reflectionNuance: 'lelah-kewalahan', reflectionCorrectOverride: true },
      },
      {
        id: 'validasi-gatal',
        skillId: 'validasi-normalisasi',
        text: 'Belajar rehat dari dengerin itu butuh waktu, dan itu manusiawi banget.',
        next: '@ending',
      },
      {
        id: 'tanya-pilihan',
        skillId: 'pertanyaan-terbuka',
        text: 'Kalau kamu yang nentuin, jeda kecil apa lagi yang terasa nyaman?',
        next: '@ending',
      },
      {
        id: 'tanya-tertutup',
        skillId: 'pertanyaan-tertutup',
        text: 'Jadi minggu depan kamu bakal senyapin hp dua jam, kan?',
        next: '@ending',
      },
    ],
  },
  {
    id: 'ni-akhir-terbantu',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Aku tetap bakal dengerin teman-temanku, Bu. Tapi sekarang aku tahu ada jam yang boleh jadi punyaku. Rabu depan lagi ya, gaskeun.',
      expression: 'lega',
      cue: 'Nisa menuliskan "Rabu 20.00, milikku" di halaman kosong bukunya, lalu menutup buku itu dan menyimpannya tanpa terburu-buru.',
      aside: 'Di meja diskusi, Fira dan Dimas sedang bercanda, dan Nisa duduk di antara mereka sebagai teman, bukan satu-satunya penampung cerita.',
    },
    choices: [],
    ending: { kind: 'terbantu' },
  },
  {
    id: 'ni-akhir-kemajuan',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Aku coba pelan-pelan dulu ya, Bu. Satu jam dulu, sisanya kupikirin lagi minggu depan.',
      expression: 'netral',
      cue: 'Nisa mengangguk, menyelipkan bukunya ke tas, dan tersenyum tipis sambil menggenggam tali tasnya.',
      aside: 'Langkah kecil sudah dimulai. Pintu untuk bertemu lagi tetap terbuka, dan kamu bisa melanjutkan percakapan ini kapan saja.',
    },
    choices: [],
    ending: { kind: 'kemajuan-kecil' },
  },
  {
    id: 'ni-akhir-menarik',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Maaf ya, Bu, aku harus balik. Teman-teman pasti lagi nyariin aku.',
      expression: 'menutup-diri',
      cue: 'Nisa tersenyum sopan, memeluk bukunya, lalu berjalan cepat ke meja diskusi tanpa menoleh.',
      aside: 'Hubungan ini masih dapat dipulihkan. Pertemuan berikutnya bisa dimulai dengan lebih pelan, dan Nisa yang menentukan tempo.',
    },
    choices: [],
    ending: { kind: 'menarik-diri-sementara' },
  },
];
