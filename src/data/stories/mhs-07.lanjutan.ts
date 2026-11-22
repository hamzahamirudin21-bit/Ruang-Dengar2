import type { StoryNode } from '../../engine/story/storyTypes';

/**
 * Bima Mahendra (mhs-07): adegan lanjutan (epilog di bangku kerja las) dan tiga akhir.
 * Id simpul: bi-f0, bi-f1 (penutup bersama), bi-akhir-terbantu, bi-akhir-kemajuan, bi-akhir-menarik.
 * Dirakit di mhs-07.ts. Ringkasan tidak memakai label menang, kalah, atau game over.
 */

const SCENE = 'lanjutan';

export const BIMA_LANJUTAN_NODES: StoryNode[] = [
  {
    id: 'bi-f0',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    marks: ['kejutan'],
    reply: {
      text: 'Bu, Ayah ternyata tanya dulu gajinya cukup buat kos atau nggak, baru tanya ijazahku. Aku sampai lupa semua kalimat yang sudah kusiapin.',
      expression: 'tersenyum',
      cue: 'Bima menggantungkan helm di paku dinding, tanpa surat di dalamnya, lalu tertawa sambil menggaruk belakang kepala dengan sarung tangan.',
      aside: 'Beberapa hari kemudian. Di dinding bengkel kampus, surat tawaran itu kini ditempel dengan catatan kecil: "Tanya jadwal paruh waktu".',
    },
    choices: [
      {
        id: 'afirmasi-langkah',
        reaction: {
          text: 'Makasih, Bu. Deg-degan sih, tapi ternyata sepuluh menit itu cepat banget lewatnya.',
          expression: 'tersenyum',
          cue: 'Bima mengangkat bahu sambil tersenyum, lalu mengetuk-ngetuk bangku kerja pelan.',
        },
        skillId: 'afirmasi-kekuatan',
        text: 'Kamu telepon dan dengar dulu. Itu langkah yang nggak mudah, Bima.',
        next: 'bi-f1',
        best: true,
      },
      {
        id: 'tanya-rasa',
        reaction: {
          text: 'Terlintas... "oh, Ayah mikirin aku makan apa nggak". Aku jadi lega, Bu, sekaligus malu karena sudah nyiapin pidato panjang.',
          expression: 'lega',
          cue: 'Bima menutup separuh wajahnya dengan sarung tangan sambil tertawa pelan.',
        },
        skillId: 'pertanyaan-terbuka',
        text: 'Pas Ayah tanya soal kos dulu, apa yang terlintas di benakmu?',
        next: 'bi-f1',
      },
      {
        id: 'nasihat-lanjut',
        skillId: 'nasihat-dini',
        text: 'Bagus, sekarang langsung tanda tangan aja sebelum Jumat lewat.',
        next: 'bi-tegang-bk',
      },
      {
        id: 'remehkan-kecil',
        skillId: 'meremehkan',
        text: 'Itu cuma satu telepon. Belum nyelesaiin apa-apa.',
        next: 'bi-tegang-bk',
      },
    ],
  },
  {
    id: 'bi-f1',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Tapi jujur, malam sebelum telepon aku masih ngitung sampai lewat tengah malam. Kebiasaan. Makasih ya, Bu, sudah nemenin aku mikir.',
      expression: 'lega',
      cue: 'Bima mengusap tempurung helm yang tergantung, lalu menyilangkan sarung tangannya di atas bangku dan menepuknya sekali.',
      aside: 'Dari mesin sebelah, adik tingkat memanggil, "Kak Bima, arusnya sudah pas?" dan Bima mengacungkan jempol tanpa terburu-buru menoleh.',
    },
    choices: [
      {
        id: 'refleksi-hitung',
        skillId: 'refleksi-perasaan',
        text: 'Kamu lega sudah bicara, tapi hitung-hitungan lama masih nemenin. Dua-duanya nyata.',
        next: '@ending',
        best: true,
        options: { reflectionNuance: 'ragu-kurang-percaya' },
      },
      {
        id: 'validasi-hitung',
        skillId: 'validasi-normalisasi',
        text: 'Kebiasaan menimbang matang nggak hilang dalam semalam, dan itu manusiawi.',
        next: '@ending',
      },
      {
        id: 'tanya-pilihan',
        skillId: 'pertanyaan-terbuka',
        text: 'Kalau kamu yang tentukan, langkah kecil apa lagi yang terasa cukup nyaman?',
        next: '@ending',
      },
      {
        id: 'tanya-tertutup',
        skillId: 'pertanyaan-tertutup',
        text: 'Jadi hari Jumat kamu sudah pasti jawab bengkel, kan?',
        next: '@ending',
      },
    ],
  },
  {
    id: 'bi-akhir-terbantu',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Hitunganku belum selesai, tapi kolom bawahnya sudah ada isinya sekarang: Ayah. Kita ketemu lagi Jumat sore, ya, nanti kukabarin soal jadwal bengkelnya.',
      expression: 'lega',
      cue: 'Bima menulis satu kata di kolom kosong tabelnya, melipat kertas itu rapi, dan memasukkannya ke saku dada, bukan ke dalam helm.',
      aside: 'Helm las itu kini tergantung di paku dinding, dan Bima mulai menyetel arus tanpa memutarnya lagi.',
    },
    choices: [],
    ending: { kind: 'terbantu' },
  },
  {
    id: 'bi-akhir-kemajuan',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Aku pikirin lagi pelan-pelan, ya. Jumat masih lama, dan kayaknya aku boleh nimbang sedikit lebih lama.',
      expression: 'netral',
      cue: 'Bima mengangguk, memasukkan surat itu kembali ke dalam helm, dan menepuk kubah helm itu pelan sambil tersenyum tipis.',
      aside: 'Langkah kecil sudah dimulai. Pintu untuk bertemu lagi tetap terbuka, dan kamu bisa melanjutkan percakapan ini kapan saja.',
    },
    choices: [],
    ending: { kind: 'kemajuan-kecil' },
  },
  {
    id: 'bi-akhir-menarik',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Maaf ya, Bu, aku balik ke mesin dulu. Hasil las ini harus selesai sebelum sore.',
      expression: 'menutup-diri',
      cue: 'Bima menurunkan topeng las, menyalakan mesin, dan percikan api menutupi wajahnya tanpa ia menoleh sedikit pun.',
      aside: 'Hubungan ini masih dapat dipulihkan. Pertemuan berikutnya bisa dimulai dengan lebih pelan, dan Bima yang menentukan tempo.',
    },
    choices: [],
    ending: { kind: 'menarik-diri-sementara' },
  },
];
