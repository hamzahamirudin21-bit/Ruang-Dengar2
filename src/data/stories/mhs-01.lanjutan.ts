import type { StoryNode } from '../../engine/story/storyTypes';

/**
 * Raka Pratama (mhs-01): adegan lanjutan (epilog di papan jadwal tim) dan tiga akhir.
 * Id simpul: ra-f0, ra-f1 (penutup bersama), ra-akhir-terbantu, ra-akhir-kemajuan, ra-akhir-menarik.
 * Dirakit di mhs-01.ts. Ringkasan tidak memakai label menang, kalah, atau game over.
 */

const SCENE = 'lanjutan';

export const MHS_01_LANJUTAN_NODES: StoryNode[] = [
  {
    id: 'ra-f0',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    marks: ['kejutan'],
    reply: {
      text: 'Bu, lihat deh. Notulen kemarin udah dikirim Sinta sebelum aku minta. Rapi pula. Aku sampai bengong, terus kuhapus draf pesan yang itu.',
      expression: 'tersenyum',
      cue: 'Raka berdiri di depan papan jadwal tim, kali ini tanpa kertas di tangan, dan sempat tertawa kecil sambil menunjuk satu kotak yang berisi nama lain.',
      aside: 'Beberapa hari kemudian. Papan jadwal tim di dinding lab kini punya kolom baru berjudul "Istirahat".',
    },
    choices: [
      {
        id: 'afirmasi-langkah',
        skillId: 'afirmasi-kekuatan',
        text: 'Kamu serahin satu tugas dan hapus draf itu. Itu keberanian nyata, Raka, keren.',
        reaction: { text: 'Hehe, makasih, Bu. Awalnya deg-degan banget sih, tapi ternyata nggak seburuk itu.', expression: 'tersenyum', cue: 'Raka tertawa kecil dan menggaruk belakang kepalanya.' },
        next: 'ra-f1',
        best: true,
      },
      {
        id: 'tanya-rasa',
        skillId: 'pertanyaan-terbuka',
        text: 'Pas notulen itu masuk tanpa kamu minta, apa yang terlintas di pikiranmu?',
        reaction: { text: 'Yang terlintas? Kok ringan ya, kayak ada yang ngangkat satu kotak dari bahuku.', expression: 'lega', cue: 'Raka menengadah sebentar, lalu tersenyum.' },
        next: 'ra-f1',
      },
      {
        id: 'nasihat-lanjut',
        skillId: 'nasihat-dini',
        text: 'Bagus, sekarang serahin aja semua tugas lain juga. Jangan tanggung-tanggung.',
        next: 'ra-tegang-bk',
      },
      {
        id: 'remehkan-kecil',
        skillId: 'meremehkan',
        text: 'Itu cuma satu notulen. Belum perlu dibanggakan.',
        next: 'ra-tegang-bk',
      },
    ],
  },
  {
    id: 'ra-f1',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Tapi jujurly, tiap lihat kolom kosong di papan, tanganku masih gatal pengin ngisi sendiri. Makasih ya, Bu, udah nemenin aku pelan-pelan.',
      expression: 'lega',
      cue: 'Raka menaruh spidol di rak papan, lalu menggenggam tangannya sendiri sejenak seolah menahan diri.',
      aside: 'Dari meja seberang, Sinta mengacungkan jempol kecil ke arah Raka sambil tetap menyolder.',
    },
    choices: [
      {
        id: 'refleksi-gatal',
        skillId: 'refleksi-perasaan',
        text: 'Kamu lega tugas terbagi, tapi masih pengin pegang semuanya. Dua rasa itu hadir bareng.',
        next: '@ending',
        best: true,
        options: { reflectionNuance: 'tertekan-cemas' },
      },
      {
        id: 'validasi-gatal',
        skillId: 'validasi-normalisasi',
        text: 'Melepas kebiasaan pegang semuanya memang butuh waktu, dan itu wajar banget.',
        next: '@ending',
      },
      {
        id: 'tanya-pilihan',
        skillId: 'pertanyaan-terbuka',
        text: 'Kalau kamu yang nentuin, langkah kecil berikutnya apa yang terasa cukup nyaman?',
        next: '@ending',
      },
      {
        id: 'tanya-tertutup',
        skillId: 'pertanyaan-tertutup',
        text: 'Jadi minggu depan kamu serahin satu tugas lagi, kan?',
        next: '@ending',
      },
    ],
  },
  {
    id: 'ra-akhir-terbantu',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Aku masih sering cek jam sih, tapi sekarang rasanya timku bukan beban di pundakku doang. Lanjut Jumat ya, gaskeun.',
      expression: 'lega',
      cue: 'Raka menulis "Jumat 15.00, evaluasi 10 menit" di papan, lalu memberi spidol pada Sinta dan membiarkannya menambah satu baris.',
      aside: 'Seluruh anggota tim berkumpul di papan jadwal, dan Raka berdiri di antara mereka, bukan di depan.',
    },
    choices: [],
    ending: { kind: 'terbantu' },
  },
  {
    id: 'ra-akhir-kemajuan',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Aku coba pelan-pelan dulu, ya. Satu tugas dulu, sisanya kupikirin lagi minggu depan.',
      expression: 'netral',
      cue: 'Raka mengangguk, melipat jadwalnya dengan hati-hati, dan menyimpannya di saku sambil tersenyum tipis.',
      aside: 'Langkah kecil sudah dimulai. Pintu untuk bertemu lagi tetap terbuka, dan kamu bisa melanjutkan percakapan ini kapan saja.',
    },
    choices: [],
    ending: { kind: 'kemajuan-kecil' },
  },
  {
    id: 'ra-akhir-menarik',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Maaf ya, Bu, aku harus balik dulu. Banyak banget yang harus kukejar hari ini.',
      expression: 'menutup-diri',
      cue: 'Raka melirik jam tangannya, mengambil laptop, lalu berjalan ke meja kerjanya tanpa menoleh.',
      aside: 'Hubungan ini masih dapat dipulihkan. Pertemuan berikutnya bisa dimulai dengan lebih pelan, dan Raka yang menentukan tempo.',
    },
    choices: [],
    ending: { kind: 'menarik-diri-sementara' },
  },
];
