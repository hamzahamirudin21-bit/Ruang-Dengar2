import type { StoryNode } from '../../engine/story/storyTypes';

/**
 * Sari Melati (mhs-12): adegan lanjutan (seminggu kemudian di Meja Diskusi) dan tiga akhir.
 * Id simpul: s-f0, s-f1 (penutup bersama), s-akhir-terbantu, s-akhir-kemajuan, s-akhir-menarik.
 * Dirakit di mhs-12.ts. Ringkasan tidak memakai label menang, kalah, atau game over.
 */

const SCENE = 'lanjutan';

export const MHS_12_LANJUTAN_NODES: StoryNode[] = [
  {
    id: 's-f0',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    marks: ['kejutan'],
    reply: {
      text: 'Jujurly, tadi di tengah rapat kecil, Dimas sama Kevin mulai berdebat lagi. Biasanya aku langsung nengahin. Tapi tadi aku bilang, "Aku butuh lima belas menit dulu ya." Terus aku keluar bentar, literally pertama kalinya.',
      expression: 'tertegun',
      cue: 'Sari duduk di ujung Meja Diskusi dengan ponsel terbalik di meja. Pulpennya diam, tidak diputar seperti biasanya.',
      aside: 'Seminggu kemudian. Meja Diskusi tetap ramai, tetapi dua teman Sari terlihat sudah kembali mengerjakan bagian masing-masing.',
    },
    choices: [
      {
        id: 'afirmasi-berhenti',
        skillId: 'afirmasi-kekuatan',
        text: 'Kamu bilang apa yang kamu butuhkan, lalu kasih dirimu waktu. Itu nggak mudah, Sari.',
        reaction: {
          text: 'Hehe, makasih. Kupikir bakal runtuh gitu dunianya, ternyata mereka cuma bilang, "Santai aja, Sar." Deg-degan banget sih, sampai sekarang pun masih dikit.',
          expression: 'lega',
          cue: 'Sari melepas napas panjang dan bahunya turun pelan, lalu tertawa kecil yang terdengar tidak dipaksakan.',
        },
        next: 's-f1',
        best: true,
      },
      {
        id: 'tanya-reaksi',
        skillId: 'pertanyaan-terbuka',
        text: 'Pas kamu bilang kalimat itu, apa yang kamu lihat dari wajah teman-temanmu?',
        reaction: {
          text: 'Kaget dikit, terus biasa aja. Mereka malah bilang, "Santai aja, Sar." Aku sendiri yang deg-degan, sampai sekarang pun masih dikit.',
          expression: 'lega',
          cue: 'Sari tertawa kecil yang kali ini tidak dipaksakan, lalu melepas napas dan bersandar.',
        },
        next: 's-f1',
      },
      {
        id: 'nasihat-tiap-hari',
        skillId: 'nasihat-dini',
        text: 'Bagus. Bilang begitu saja setiap ada yang berdebat, supaya kamu tidak capek lagi.',
        next: 's-tegang-bk',
      },
      {
        id: 'remehkan-lima-belas',
        skillId: 'meremehkan',
        text: 'Lima belas menit saja kan sebentar. Tidak perlu dianggap sebagai keberanian besar.',
        next: 's-tegang-bk',
      },
    ],
  },
  {
    id: 's-f1',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Ternyata dunia nggak runtuh, ya. Mereka malah bilang, "Santai aja, Sar." Aku sempat deg-degan banget, sampai sekarang pun masih dikit. Makasih ya udah mau dengerin aku waktu itu.',
      expression: 'lega',
      cue: 'Sari melepas napas panjang, bahunya turun pelan, lalu ia tertawa kecil yang kali ini terdengar tidak dipaksakan.',
      aside: 'Dari seberang meja, salah satu temannya mengangkat jempol, lalu kembali menatap layar laptopnya.',
    },
    choices: [
      {
        id: 'refleksi-lega-cemas',
        skillId: 'refleksi-perasaan',
        text: 'Kamu lega semuanya baik-baik aja, tapi masih ada cemas kecil kalau mereka kecewa.',
        next: '@ending',
        best: true,
        options: { reflectionNuance: 'ragu-kurang-percaya' },
      },
      {
        id: 'validasi-deg-degan',
        skillId: 'validasi-normalisasi',
        text: 'Masih deg-degan setelah hal baru itu wajar. Biasanya mereda kalau kamu ulangi.',
        next: '@ending',
      },
      {
        id: 'tanya-langkah-berikut',
        skillId: 'pertanyaan-terbuka',
        text: 'Kalau ada kesempatan lagi, apa yang ingin kamu pertahankan dari caramu tadi?',
        next: '@ending',
      },
      {
        id: 'tanya-tertutup-ulang',
        skillId: 'pertanyaan-tertutup',
        text: 'Jadi kamu akan mengulanginya lagi minggu depan, ya?',
        next: '@ending',
      },
    ],
  },
  {
    id: 's-akhir-terbantu',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Aku masih mau bantu mereka, tapi sekarang aku tahu aku boleh bilang butuh waktu. Rasanya jauh lebih ringan, literally.',
      expression: 'tersenyum',
      cue: 'Sari menutup ponselnya, meneguk air, lalu kembali ke meja dengan langkah yang tidak terburu-buru.',
      aside: 'Sari tetap sering berada di Meja Diskusi, tetapi kini ia mengambil jeda saat dibutuhkan. Perubahan kecil ini terlihat pada ringkasan sesi.',
    },
    choices: [],
    ending: { kind: 'terbantu' },
  },
  {
    id: 's-akhir-kemajuan',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Aku coba pelan-pelan, ya. Kadang masih susah bilang butuh waktu, soalnya semua orang udah terbiasa sama aku yang selalu ada.',
      expression: 'netral',
      cue: 'Sari mengangguk, memutar pulpen sekali, lalu tersenyum seperti biasanya ke arah teman-temannya.',
      aside: 'Citra ramah dan selalu siap yang melekat pada Sari belum benar-benar tersentuh. Itu wajar, karena perubahan seperti ini butuh waktu. Langkah kecil sudah dimulai, dan percakapan ini bisa dilanjutkan kapan saja.',
    },
    choices: [],
    ending: { kind: 'kemajuan-kecil' },
  },
  {
    id: 's-akhir-menarik',
    sceneId: SCENE,
    stage: 'rencana',
    depth: 1,
    reply: {
      text: 'Maaf, aku belum siap bahas ini, jujurly. Aku balik ke teman-teman dulu, ya. Mereka nungguin.',
      expression: 'menutup-diri',
      cue: 'Sari berdiri, tersenyum tipis yang tidak sampai ke matanya, lalu bergabung kembali ke kelompoknya.',
      aside: 'Hubungan ini masih dapat dipulihkan. Pertemuan berikutnya bisa dimulai dengan lebih pelan, dan Sari yang menentukan tempo.',
    },
    choices: [],
    ending: { kind: 'menarik-diri-sementara' },
  },
];
