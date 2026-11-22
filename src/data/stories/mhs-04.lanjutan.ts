import type { StoryNode } from '../../engine/story/storyTypes';

/**
 * Kevin Gunawan (mhs-04): adegan lanjutan (epilog di zona pemrograman) dan tiga akhir.
 * Id simpul: ke-f0, ke-f1 (penutup bersama), ke-akhir-terbantu, ke-akhir-kemajuan, ke-akhir-menarik.
 * Dirakit di mhs-04.ts. Ringkasan tidak memakai label menang, kalah, atau game over.
 */

const SCENE = 'lanjutan';

export const MHS_04_LANJUTAN_NODES: StoryNode[] = [
  {
    id: 'ke-f0',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    marks: ['kejutan'],
    reply: {
      text: 'Dosen. Di PR Arman, saya tulis dulu dua hal yang bagus, baru komentar. Dia balas emoji jempol. Kayaknya pertama kalinya, literally.',
      expression: 'tersenyum',
      cue: 'Kevin duduk dengan tangan di atas keyboard, bukan terlipat. Ia menunjuk layar dengan dagu, agak canggung.',
      aside: 'Beberapa hari kemudian. Zona pemrograman lengang, dan dua rekan tim sedang membahas sesuatu di layar yang sama.',
    },
    choices: [
      {
        id: 'afirmasi-langkah',
        skillId: 'afirmasi-kekuatan',
        text: 'Kamu ubah urutan reviewmu dan hasilnya kelihatan. Itu usaha nyata, Kevin.',
        next: 'ke-f1',
        best: true,
        reaction: {
          text: 'Usaha nyata ya... mungkin. Arman sampai ngajak pairing besok pagi, saya iya-kan. Tapi saya bilang, jangan salahkan kalau saya cerewet soal variabel.',
          expression: 'tertegun',
          cue: 'Kevin menggaruk tengkuk dan menahan senyum sambil melirik rekan di sebelah layar.',
          aside: 'Salah satu rekan menggeser kursi kosong ke samping layar mereka.',
        },
      },
      {
        id: 'tanya-rasa',
        skillId: 'pertanyaan-terbuka',
        text: 'Waktu lihat balasan jempol itu, kamu ngerasa apa?',
        next: 'ke-f1',
        reaction: {
          text: 'Lihat jempol itu rasanya aneh, lega campur nggak percaya. Arman malah ngajak pairing besok pagi, saya iya-kan. Tapi jangan salahkan kalau saya cerewet soal variabel.',
          expression: 'tertegun',
          cue: 'Kevin tertawa kecil, lalu menunduk melihat tangannya yang kini terbuka di atas keyboard.',
          aside: 'Salah satu rekan menggeser kursi kosong ke samping layar mereka.',
        },
      },
      {
        id: 'nasihat-lanjut',
        skillId: 'nasihat-dini',
        text: 'Sekarang terusin aja cara itu ke semua orang, tanpa terkecuali.',
        next: 'ke-tegang-bk',
      },
      {
        id: 'remehkan-kecil',
        skillId: 'meremehkan',
        text: 'Itu cuma emoji. Jangan terlalu dipikirin.',
        next: 'ke-tegang-bk',
      },
    ],
  },
  {
    id: 'ke-f1',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Arman ngajak pairing besok pagi. Saya iya-kan. Tapi saya bilang, jangan salahkan saya kalau cerewet soal variabel.',
      expression: 'tertegun',
      cue: 'Kevin tertawa kecil, lalu menggaruk tengkuk sambil melirik dua rekan yang melambai ke arahnya.',
      aside: 'Salah satu rekan menggeser kursi kosong ke samping layar mereka.',
    },
    choices: [
      {
        id: 'refleksi-campur',
        skillId: 'refleksi-perasaan',
        text: 'Kamu senang diajak, tapi masih was-was kebiasaan lamamu muncul lagi.',
        next: '@ending',
        best: true,
        options: { reflectionNuance: 'tertekan-cemas' },
      },
      {
        id: 'validasi-ajakan',
        skillId: 'validasi-normalisasi',
        text: 'Wajar canggung. Mulai cara baru di tempat lama memang nggak langsung mulus.',
        next: '@ending',
      },
      {
        id: 'tanya-batas',
        skillId: 'pertanyaan-terbuka',
        text: 'Besok pas pairing, hal kecil apa yang mau kamu coba beda?',
        next: '@ending',
      },
      {
        id: 'tertutup-pairing',
        skillId: 'pertanyaan-tertutup',
        text: 'Jadi kamu siap pairing sama Arman, kan?',
        next: '@ending',
      },
    ],
  },
  {
    id: 'ke-akhir-terbantu',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Saya masih keras soal mutu, itu nggak berubah. Tapi saya mau belajar cara bilangnya.',
      expression: 'lega',
      cue: 'Kevin menggeser kursi ke samping Arman. Lengannya tidak terlipat, dan ia mengangguk saat Arman mulai menjelaskan.',
      aside: 'Dua kursi berdampingan menghadap satu layar. Komentar pertama yang Kevin ucapkan kali ini diawali kata "bagian ini sudah rapi".',
    },
    choices: [],
    ending: { kind: 'terbantu' },
  },
  {
    id: 'ke-akhir-kemajuan',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Saya coba dulu satu PR, nanti saya lihat hasilnya. Jangan berharap banyak ya.',
      expression: 'netral',
      cue: 'Kevin mengangguk singkat, menutup laptop perlahan, dan menatap meja diskusi tanpa melipat tangan.',
      aside: 'Langkah kecil sudah dimulai. Pintu untuk bertemu lagi tetap terbuka, dan kamu bisa melanjutkan percakapan ini kapan saja.',
    },
    choices: [],
    ending: { kind: 'kemajuan-kecil' },
  },
  {
    id: 'ke-akhir-menarik',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Saya balik ke kode dulu. Masih banyak yang harus saya periksa.',
      expression: 'menutup-diri',
      cue: 'Kevin memasang headset, memutar kursi ke layar, dan mulai mengetik tanpa menoleh.',
      aside: 'Hubungan ini masih dapat dipulihkan. Pertemuan berikutnya bisa dimulai lebih pelan, dan Kevin yang menentukan tempo.',
    },
    choices: [],
    ending: { kind: 'menarik-diri-sementara' },
  },
];
