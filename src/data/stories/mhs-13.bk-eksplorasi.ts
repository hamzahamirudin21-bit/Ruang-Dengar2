/**
 * Cerita Nisa Nurhaliza (mhs-13), adegan Ruang BK bagian eksplorasi: simpul ni-b0, ni-b2, ni-b4, ni-b5.
 * Tujuan di luar berkas ini: ni-b6 (bk-pemahaman) dan ni-tegang-bk (bk-rencana).
 * Dirakit di mhs-13.ts. Seluruh teks Bahasa Indonesia, tanpa Istilah_Diagnosis.
 */
import type { StoryLine, StoryNode } from '../../engine/story/storyTypes';

const SCENE = 'bk';
const TEGANG = 'ni-tegang-bk';

function line(text: string, expression: StoryLine['expression'], cue: string, aside?: string): StoryLine {
  return { text, expression, cue, ...(aside ? { aside } : {}) };
}

export const MHS13_BK_EKSPLORASI_NODES: StoryNode[] = [
  {
    id: 'ni-b0',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: line(
      'Silakan duduk dulu, Bu. Kursinya enak? Kalau kurang nyaman, aku tukar aja. Oh, Ibu mau air putih?',
      'tersenyum',
      'Nisa menunggu Dosen duduk lebih dulu, baru ia sendiri duduk di tepi kursi dengan ponsel tertelungkup di pangkuan.',
    ),
    choices: [
      {
        id: 'a', skillId: 'batas-kerahasiaan', best: true, next: 'ni-b2',
        text: 'Makasih perhatiannya. Ceritamu di sini aman, kecuali soal keselamatanmu.',
        reaction: {
          text: 'Oh, aman ya, Bu. Makasih, jadi agak tenang. Yang bisa kuceritain sih soal teman-teman. Mereka sering curhat ke aku, kadang chat sampai lewat tengah malam. Tapi aku seneng kok dipercaya.',
          expression: 'netral',
          cue: 'Nisa tersenyum sambil mengangguk, tetapi ibu jarinya menggosok-gosok sisi ponsel yang tertelungkup.',
        },
      },
      {
        id: 'b', skillId: 'sapaan-hangat', next: 'ni-b2',
        text: 'Aku baik-baik aja, Nisa. Hari ini giliranmu, aku dengerin.',
        reaction: {
          text: 'Syukurlah Ibu baik. Giliranku ya... hehe, rasanya aneh. Mulai dari teman-teman aja deh, mereka sering curhat ke aku sampai chat lewat tengah malam. Aku sih seneng dipercaya.',
          expression: 'tersenyum',
          cue: 'Nisa tertawa kecil, tetapi ibu jarinya menggosok-gosok sisi ponsel yang tertelungkup.',
        },
      },
      {
        id: 'c', skillId: 'pertanyaan-terbuka', next: 'ni-b2',
        text: 'Apa yang pengin kamu ceritain hari ini?',
        reaction: {
          text: 'Hmm, apa ya, Bu. Mungkin soal teman-teman. Mereka sering curhat ke aku, kadang malah chat lewat tengah malam. Tapi nggak apa-apa, aku seneng kok dipercaya.',
          expression: 'netral',
          cue: 'Nisa berpikir sebentar sambil tersenyum, dan ibu jarinya menggosok-gosok sisi ponsel yang tertelungkup.',
        },
      },
      {
        id: 'd', skillId: 'interogasi', next: TEGANG,
        text: 'Kenapa tadi kamu selalu mengiyakan Fira? Jawab jujur.',
      },
    ],
  },
  {
    id: 'ni-b2',
    sceneId: SCENE,
    stage: 'eksplorasi',
    depth: 0,
    reply: line(
      'Teman-teman emang sering curhat ke aku. Soal dosen pembimbing, kos, keluarga. Ada yang chat sampai lewat tengah malam, jujurly. Tapi aku seneng kok dipercaya.',
      'netral',
      'Nisa bercerita sambil tersenyum, tetapi ibu jarinya menggosok-gosok sisi ponsel yang tertelungkup.',
    ),
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'ni-b4',
        text: 'Habis baca chat tengah malam itu, biasanya kamu ngerasa apa?',
        reaction: {
          text: 'Rasanya campur sih, Bu. Seneng dipercaya, tapi kadang badan udah capek. Biar nggak lupa nanya kabar mereka, aku catet semuanya di buku kecil ini.',
          expression: 'tersenyum',
          cue: 'Nisa mengeluarkan buku saku bergaris yang tepinya lusuh dari tas, membalik halaman demi halaman, lalu berhenti di lembar terakhir yang masih kosong.',
          aside: 'Setiap halaman diberi nama teman dan catatan kecil dengan tulisan tangan yang rapi, dari Fira sampai nama-nama yang tidak dikenal Dosen.',
        },
      },
      {
        id: 'b', skillId: 'validasi-normalisasi', next: 'ni-b4',
        text: 'Dipercaya banyak orang itu membanggakan, tapi bisa capek banget juga.',
        reaction: {
          text: 'Hehe, dua-duanya ada, Bu. Bangga iya, capeknya kadang nyelip juga. Makanya semua kucatet di buku kecil ini, biar nggak ada yang kelewat.',
          expression: 'tersenyum',
          cue: 'Nisa mengambil buku saku bergaris yang tepinya lusuh, membalik halaman demi halaman, lalu berhenti di lembar terakhir yang masih kosong.',
          aside: 'Tiap halaman bertuliskan nama seorang teman dengan catatan kecil bertulisan tangan rapi, mulai dari Fira sampai nama-nama yang tidak dikenal Dosen.',
        },
      },
      {
        id: 'c', skillId: 'pertanyaan-tertutup', next: 'ni-b4',
        text: 'Jadi kamu emang suka jadi tempat curhat, ya?',
        reaction: line(
          'Suka kok, Bu. Aku suka bantuin orang.',
          'tersenyum',
          'Nisa mengangguk cepat, tetapi senyumnya sedikit terlambat muncul.',
        ),
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: TEGANG,
        text: 'Matiin aja notifikasimu malam hari. Itu langsung beresin masalahnya.',
      },
    ],
  },
  {
    id: 'ni-b4',
    sceneId: SCENE,
    stage: 'eksplorasi',
    depth: 1,
    reply: line(
      'Ini buku kecilku. Tiap teman ada halamannya, biar aku inget apa yang mereka ceritain dan bisa nanya kabar lagi. Halamannya udah hampir abis. Halaman buat aku sendiri... belum ada.',
      'tertegun',
      'Nisa membuka buku saku bergaris yang tepinya lusuh, membalik halaman demi halaman, lalu berhenti di lembar terakhir yang masih kosong.',
      'Setiap halaman diberi nama teman dan catatan kecil dengan tulisan tangan yang rapi, dari Fira sampai nama-nama yang tidak dikenal Dosen.',
    ),
    marks: ['kejutan', 'isyarat-nonverbal'],
    choices: [
      {
        id: 'a', skillId: 'jeda-hening', best: true, next: 'ni-b5',
        text: 'Aku di sini. Kamu boleh jelasin buku itu dengan caramu, nggak usah buru-buru.',
        reaction: {
          text: 'Makasih, Bu. Jadi gini, tiap teman ada halamannya biar aku inget cerita mereka. Soalnya kalau aku sampai berhenti dengerin, rasanya mereka bakal sendirian.',
          expression: 'cemas',
          cue: 'Nisa memegang buku kecil itu dengan dua tangan, menarik napas pelan, dan bahunya naik-turun mengikuti napas yang berat.',
        },
      },
      {
        id: 'b', skillId: 'sampaikan-pengamatan', next: 'ni-b5',
        options: { observationTone: 'faktual' },
        text: 'Ada banyak halaman buat teman-temanmu, dan satu lembar kosong di akhir.',
        reaction: {
          text: 'Iya, Bu, lembar terakhir itu emang masih kosong. Halaman teman-temanku hampir penuh semua. Aku nggak tega kalau sampai berhenti dengerin, nanti mereka sendirian.',
          expression: 'cemas',
          cue: 'Nisa mengusap lembar kosong itu dengan ujung jari, lalu memegang buku dengan dua tangan dan napasnya terdengar berat.',
        },
      },
      {
        id: 'c', skillId: 'janji-mutlak', next: 'ni-b5',
        text: 'Mulai hari ini halaman buat kamu pasti terisi. Aku jamin.',
        reaction: line(
          'Hehe, nggak usah repot-repot, Bu. Nanti aku isi sendiri... suatu hari.',
          'waspada',
          'Nisa menutup bukunya perlahan dan memeluknya di dada.',
        ),
      },
      {
        id: 'd', skillId: 'interogasi', next: TEGANG,
        text: 'Kenapa kamu nyatat urusan orang lain sebanyak ini? Buat apa?',
      },
    ],
  },
  {
    id: 'ni-b5',
    sceneId: SCENE,
    stage: 'eksplorasi',
    depth: 1,
    reply: line(
      'Kalau aku berhenti dengerin, nanti mereka sendirian. Aku jadi ngerasa jahat. Tapi kadang habis dengerin, dadaku ikut sesak, capek banget sumpah sampai susah tidur.',
      'cemas',
      'Nisa memegang buku kecil itu dengan dua tangan, dan bahunya perlahan naik-turun mengikuti napas yang berat.',
    ),
    choices: [
      {
        id: 'a', skillId: 'refleksi-perasaan', best: true, next: 'ni-b6',
        options: { reflectionNuance: 'lelah-kewalahan', reflectionCorrectOverride: true },
        text: 'Kedengarannya kamu jagain semua orang, sampai dirimu sendiri ikut kecapekan.',
        reaction: {
          text: 'Iya, Bu, kayak gitu rasanya. Badan ikut capek, tapi mau bilang "aku capek, nanti ya" aja takut. Nanti mereka kira aku udah nggak peduli.',
          expression: 'cemas',
          cue: 'Nisa menunduk, membuka-tutup sampul buku kecilnya, dan suaranya mengecil di ujung kalimat.',
        },
      },
      {
        id: 'b', skillId: 'pertanyaan-terbuka', next: 'ni-b6',
        text: 'Kalau kamu berhenti dengerin sebentar, kamu bayangin apa yang terjadi?',
        reaction: {
          text: 'Yang kebayang sih mereka bakal ngira aku nggak peduli lagi, Bu. Kalau aku bilang "aku capek, nanti ya", rasanya mereka bisa ngejauh dari aku.',
          expression: 'cemas',
          cue: 'Nisa menunduk dan memutar-mutar buku kecilnya di pangkuan, suaranya mengecil di ujung kalimat.',
        },
      },
      {
        id: 'c', skillId: 'refleksi-perasaan', next: 'ni-b6',
        options: { reflectionNuance: 'kecewa-kesal', reflectionCorrectOverride: false },
        text: 'Kamu pasti kesel sama teman yang terus ngeluh ke kamu.',
        reaction: line(
          'Bukan kesel, Bu. Aku cuma bingung kenapa malah aku yang capek.',
          'menunduk',
          'Nisa menggeleng pelan sambil tersenyum tipis yang tidak sampai ke mata.',
        ),
      },
      {
        id: 'd', skillId: 'meremehkan', next: 'ni-b6',
        text: 'Semua orang juga pernah dengar curhat teman. Nggak usah dibesar-besarkan.',
        reaction: line(
          'Iya sih, Bu. Mungkin akunya aja yang kelewat perasa.',
          'menutup-diri',
          'Nisa tersenyum cepat dan segera mengalihkan pandang ke jendela.',
        ),
      },
    ],
  },
];
