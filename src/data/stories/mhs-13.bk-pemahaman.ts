/**
 * Nisa Nurhaliza (mhs-13), adegan Ruang BK bagian pemahaman.
 * Simpul (urutan jalur): ni-b6, ni-b9, ni-b8, ni-b12, ditambah alternatif ni-b9-alt, ni-b8-alt, ni-b12-alt.
 *
 * Titik sambung:
 *  - masuk dari `ni-b5` (berkas bk-eksplorasi) ke `ni-b6`.
 *  - keluar dari `ni-b12` dan `ni-b12-alt` ke `ni-b13` (berkas bk-rencana).
 *  - Ketegangan memakai `ni-tegang-bk` (berkas bk-rencana).
 *
 * Gerbang: `ni-b8` (Momen_Terbuka) butuh trust >= 80, level >= 1, dan bendera `isyarat-diperhatikan` (dari ni-l2);
 * `ni-b9` butuh trust >= 70; `ni-b12` (inti kebutuhan: batas diri) butuh level >= 2.
 * Bila gagal, alur memakai simpul alternatif yang tetap menuju tulang punggung cerita.
 */
import type { StoryNode } from '../../engine/story/storyTypes';

const SCENE = 'bk';
const TENSION = 'ni-tegang-bk';
const LELAH = { reflectionNuance: 'lelah-kewalahan', reflectionCorrectOverride: true } as const;

export const MHS_13_BK_PEMAHAMAN_NODES: StoryNode[] = [
  {
    id: 'ni-b6',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Kalau aku bilang "aku capek, nanti ya", mereka pasti ngira aku udah nggak peduli. Aku tuh takut kehilangan mereka.',
      expression: 'cemas',
      cue: 'Nisa menunduk, membuka-tutup sampul buku kecilnya, dan suaranya mengecil di ujung kalimat.',
    },
    choices: [
      {
        id: 'a', skillId: 'parafrase-ringkasan', best: true, next: 'ni-b9',
        text: 'Jadi bilang "aku butuh jeda" terasa bisa bikin teman-temanmu menjauh?',
        reaction: {
          text: 'Iya, Bu, kira-kira gitu. Takutnya mereka jadi ngejauh. Padahal aku seneng kok bantuin mereka, cuma sesudahnya kadang masih kepikiran dikit.',
          expression: 'netral',
          cue: 'Nisa mengangguk pelan sambil menarik napas, lalu memain-mainkan sampul buku kecilnya.',
        },
      },
      {
        id: 'b', skillId: 'validasi-normalisasi', next: 'ni-b9',
        text: 'Takut dianggap nggak peduli itu wajar buat orang yang selama ini selalu ada.',
        reaction: {
          text: 'Makasih, Bu, jadi agak lega dengernya. Soalnya aku beneran seneng bantuin mereka. Cuma abis itu kadang masih kebawa dikit di pikiran.',
          expression: 'tersenyum',
          cue: 'Nisa tersenyum kecil dan bahunya turun sedikit, lalu ia merapikan letak bukunya di meja.',
        },
      },
      {
        id: 'c', skillId: 'nasihat-dini', next: TENSION,
        text: 'Bilang aja terus terang mulai besok. Teman yang baik pasti ngerti.',
      },
      {
        id: 'd', skillId: 'pertanyaan-tertutup', next: 'ni-b9',
        text: 'Jadi kamu nggak percaya teman-temanmu bakal paham?',
        reaction: {
          text: 'Bukan gitu, Bu. Mereka baik kok. Akunya aja yang... entahlah.',
          expression: 'waspada',
          cue: 'Nisa menggeleng cepat dan tersenyum meminta maaf.',
        },
      },
    ],
  },
  {
    id: 'ni-b8',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 2,
    reply: {
      text: 'Semalem aku nangis di kamar mandi kos, habis Fira cerita panjang. Chat-nya kubales "aku di sini" sambil nangis. Nggak ada yang tahu, Bu. Aku sendiri juga bingung harus spill ke siapa.',
      expression: 'tertegun',
      cue: 'Nisa meletakkan ponsel di meja dengan layar menghadap bawah, lalu menarik napas panjang yang bergetar. Untuk pertama kalinya ia tidak bertanya balik.',
    },
    marks: ['momen-terbuka'],
    gate: {
      conditions: [
        { type: 'trust-min', value: 80 }, { type: 'level-min', value: 1 },
        { type: 'flag', flag: 'isyarat-diperhatikan' },
      ],
      otherwise: 'ni-b8-alt',
    },
    onEnter: { setFlags: ['momen-terbuka'] },
    choices: [
      {
        id: 'a', skillId: 'refleksi-perasaan', best: true, options: LELAH, next: 'ni-b12',
        text: 'Kamu nanggung cerita banyak orang, tapi diam-diam nggak punya tempat buat lelahmu sendiri.',
        reaction: {
          text: 'Iya, Bu... kayak gitu. Selama ini aku nggak tahu mau taruh capeknya di mana. Kayaknya yang kuinginin sederhana aja, pengin nggak sekecapekan ini.',
          expression: 'lelah',
          cue: 'Nisa menutup buku kecilnya, menaruhnya di pangkuan, lalu menghela napas panjang.',
        },
      },
      {
        id: 'b', skillId: 'afirmasi-kekuatan', next: 'ni-b12',
        text: 'Kamu berani cerita ini ke aku. Itu nggak mudah buat orang yang biasa dengerin.',
        reaction: {
          text: 'Makasih, Bu. Jujurly, deg-degan juga tadi ceritanya. Tapi sekarang agak ringan. Yang kuinginin sih sederhana, pengin nggak sekecapekan ini aja.',
          expression: 'lega',
          cue: 'Nisa tersenyum tipis, menaruh buku kecilnya di pangkuan, dan bahunya turun perlahan.',
        },
      },
      {
        id: 'c', skillId: 'pertanyaan-terbuka', next: 'ni-b12',
        text: 'Semalem kamu butuh apa, kalau ada yang nemenin?',
        reaction: {
          text: 'Butuh apa ya, Bu... mungkin cuma ditemenin, nggak usah ngapa-ngapain. Selebihnya aku belum bisa bilang jelas, yang pasti pengin nggak terlalu capek lagi.',
          expression: 'netral',
          cue: 'Nisa menatap buku kecil di pangkuannya, lalu menghela napas pelan sebelum menutupnya.',
        },
      },
      {
        id: 'd', skillId: 'interogasi', next: TENSION,
        text: 'Kenapa nggak bilang aja ke Fira? Udah berapa lama kayak gini?',
      },
    ],
  },
  {
    id: 'ni-b8-alt',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Ah, aku nggak apa-apa kok, Bu. Cuma kurang tidur dikit. Yang penting teman-teman terbantu.',
      expression: 'netral',
      cue: 'Nisa tertawa kecil dan mengusap sudut matanya seolah ada debu di sana.',
    },
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'ni-b12',
        text: 'Kalau teman-temanmu udah terbantu, kamu sendiri gimana?',
        reaction: {
          text: 'Aku sendiri? Hmm, capek sih, Bu, kalau jujur. Kayaknya yang kupengin cuma nggak sekecapekan ini. Belum bisa jelasin lebih jauh dari itu.',
          expression: 'lelah',
          cue: 'Nisa berhenti tertawa, lalu menutup buku kecilnya dan menaruhnya di pangkuan.',
        },
      },
      {
        id: 'b', skillId: 'validasi-normalisasi', next: 'ni-b12',
        text: 'Nggak apa-apa kalau belum mau cerita lebih jauh. Kita jalan pelan aja.',
        reaction: {
          text: 'Makasih ya, Bu, udah nggak maksa. Jadi lebih lega. Yang bisa kubilang sekarang baru satu, aku pengin nggak terlalu capek lagi.',
          expression: 'lega',
          cue: 'Nisa menghela napas panjang dan bahunya turun, lalu menaruh buku kecilnya di pangkuan.',
        },
      },
      {
        id: 'c', skillId: 'sampaikan-pengamatan', options: { observationTone: 'faktual' }, next: 'ni-b12',
        text: 'Tadi kamu ngusap mata, dan napasmu kedengaran berat.',
        reaction: {
          text: 'Eh, kelihatan ya, Bu? Hehe, iya, lumayan capek sih. Aku belum bisa jelasin banget, tapi aku pengin lebih ringan dikit aja.',
          expression: 'netral',
          cue: 'Nisa menurunkan tangannya dari mata, mengatur napas, lalu menaruh buku kecilnya di pangkuan.',
        },
      },
      {
        id: 'd', skillId: 'meremehkan', next: 'ni-b12',
        text: 'Kurang tidur itu biasa buat mahasiswa. Nanti juga pulih sendiri.',
        reaction: {
          text: 'Betul, Bu. Aku emang suka lebay.',
          expression: 'menutup-diri',
          cue: 'Nisa tersenyum lebar yang kaku dan menegakkan punggungnya.',
        },
      },
    ],
  },
  {
    id: 'ni-b9',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Padahal aku suka bantuin mereka. Minggu lalu aku sadar Dimas diem terus di praktikum, kuajak ngobrol, ternyata dia hampir mau berhenti kuliah. Aku seneng bisa peka. Tapi abis itu aku kepikiran dia berhari-hari, literally.',
      expression: 'tersenyum',
      cue: 'Mata Nisa berbinar saat menyebut nama Dimas, lalu meredup dan tangannya menekan dada sebentar.',
    },
    gate: { conditions: [{ type: 'trust-min', value: 70 }], otherwise: 'ni-b9-alt' },
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'ni-b8',
        text: 'Pas kamu nangkep kegelisahan Dimas, kamu sendiri ngerasa apa?',
        reaction: {
          text: 'Perasaanku? Hehe, seneng sih, Bu, ngerasa berguna. Tapi abis itu emang suka capek sendiri, kadang sampai kurang tidur. Yang penting temen-temen terbantu.',
          expression: 'netral',
          cue: 'Nisa tertawa kecil dan mengusap sudut matanya seolah ada debu di sana.',
        },
      },
      {
        id: 'b', skillId: 'refleksi-perasaan', options: LELAH, next: 'ni-b8',
        text: 'Kamu senang bisa peka, tapi setelahnya ikut nanggung kegelisahan itu.',
        reaction: {
          text: 'Iya, Bu, kurang lebih gitu. Ikut kebawa dikit, sampai kurang tidur. Tapi nggak apa-apa kok, yang penting mereka terbantu.',
          expression: 'netral',
          cue: 'Nisa mengangguk sambil tersenyum tipis, lalu mengusap sudut matanya seolah ada debu di sana.',
        },
      },
      {
        id: 'c', skillId: 'pertanyaan-tertutup', next: 'ni-b8',
        text: 'Jadi sebaiknya kamu berhenti nolong orang lain, gitu?',
        reaction: {
          text: 'Bukan, Bu. Aku masih mau nolong kok. Cuma... caranya mungkin salah.',
          expression: 'menunduk',
          cue: 'Nisa mengusap ujung kerudungnya dan tertawa kecil tanpa suara.',
        },
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: TENSION,
        text: 'Kalau gitu jangan terlalu dekat sama masalah teman. Biarin mereka urus sendiri.',
      },
    ],
  },
  {
    id: 'ni-b9-alt',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Ya, aku seneng kok bisa bantu. Kadang cuma kepikiran dikit abis itu, tapi itu wajar kan.',
      expression: 'netral',
      cue: 'Nisa mengangkat bahu ringan dan merapikan letak bukunya di meja.',
    },
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'ni-b8',
        text: 'Kepikiran dikit itu kayak gimana, dan biasanya bertahan berapa lama?',
        reaction: {
          text: 'Ya gitu deh, Bu, kepikiran aja sebelum tidur. Lamanya nggak tentu, kadang sampai kurang tidur. Tapi nggak apa-apa, yang penting teman-teman terbantu.',
          expression: 'netral',
          cue: 'Nisa tertawa kecil sambil mengusap sudut matanya seolah ada debu di sana.',
        },
      },
      {
        id: 'b', skillId: 'parafrase-ringkasan', next: 'ni-b8',
        text: 'Jadi kamu senang nolong, tapi sesudahnya ada yang tertinggal di pikiranmu.',
        reaction: {
          text: 'Nah, iya, Bu, tepat gitu. Seneng nolongnya, tapi sesudahnya masih nyangkut di pikiran. Efeknya paling kurang tidur dikit. Nggak apa-apa kok.',
          expression: 'netral',
          cue: 'Nisa mengangguk cepat, lalu tertawa kecil dan mengusap sudut matanya.',
        },
      },
      {
        id: 'c', skillId: 'validasi-normalisasi', next: 'ni-b8',
        text: 'Ikut mikirin orang yang kita bantu itu manusiawi banget.',
        reaction: {
          text: 'Makasih ya, Bu, jadi nggak ngerasa aneh sendiri. Kadang aku emang kurang tidur gara-gara itu, tapi sudahlah, yang penting teman-teman terbantu.',
          expression: 'tersenyum',
          cue: 'Nisa tersenyum lega, lalu mengusap sudut matanya seolah ada debu di sana.',
        },
      },
      {
        id: 'd', skillId: 'pertanyaan-tertutup', next: 'ni-b8',
        text: 'Cuma sebentar aja kan kepikirannya?',
        reaction: {
          text: 'Iya, sebentar aja kok.',
          expression: 'menutup-diri',
          cue: 'Nisa menjawab cepat sambil tersenyum, lalu melirik ponselnya yang tertelungkup.',
        },
      },
    ],
  },
  {
    id: 'ni-b12',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 2,
    reply: {
      text: 'Kayaknya aku pengin boleh bilang "aku butuh jeda" tanpa dianggap nggak peduli. Dan punya waktu yang emang punyaku sendiri, bukan sisa dari orang lain.',
      expression: 'lega',
      cue: 'Nisa menutup buku kecilnya, menaruhnya di pangkuan, dan menghela napas panjang yang terdengar lebih lapang.',
    },
    gate: { conditions: [{ type: 'level-min', value: 2 }], otherwise: 'ni-b12-alt' },
    choices: [
      {
        id: 'a', skillId: 'parafrase-ringkasan', best: true, next: 'ni-b13',
        text: 'Jadi kamu pengin boleh rehat dan punya waktu sendiri tanpa merasa bersalah. Tepat?',
        reaction: {
          text: 'Tepat banget, Bu. Mungkin aku bisa coba pelan-pelan: Rabu malam, jam delapan sampai sembilan, hp kusenyapin. Fira sama Dimas kukabarin dulu sebelumnya.',
          expression: 'netral',
          cue: 'Nisa mengangguk, membuka halaman kosong di bukunya, lalu menulis "Rabu 20.00" dengan huruf kecil dan menatap tulisannya sendiri.',
        },
      },
      {
        id: 'b', skillId: 'afirmasi-kekuatan', next: 'ni-b13',
        text: 'Kamu tahu persis apa yang kamu butuhin. Itu tanda kamu mulai peka sama dirimu.',
        reaction: {
          text: 'Hehe, makasih, Bu, baru kali ini ada yang bilang gitu. Mungkin aku mulai dari yang kecil: Rabu jam delapan sampai sembilan malam hp kusenyapin, abis ngabarin Fira sama Dimas.',
          expression: 'tersenyum',
          cue: 'Nisa tersipu, membuka halaman kosong di bukunya, dan menulis "Rabu 20.00" dengan pelan.',
        },
      },
      {
        id: 'c', skillId: 'refleksi-perasaan', options: LELAH, next: 'ni-b13',
        text: 'Ada keinginan buat rehat dari dengerin, tanpa takut kehilangan siapa pun.',
        reaction: {
          text: 'Iya, Bu, itu. Rehat tapi nggak kehilangan siapa-siapa. Jadi kupikir Rabu malam sejam aja hp kusenyapin, dan Fira sama Dimas kukabarin dulu, biar mereka nggak kaget.',
          expression: 'netral',
          cue: 'Nisa membuka halaman kosong di bukunya, menuliskan "Rabu 20.00", lalu menatap tulisan itu cukup lama.',
        },
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: TENSION,
        text: 'Kalau gitu mulai sekarang tolak aja semua curhat yang masuk.',
      },
    ],
  },
  {
    id: 'ni-b12-alt',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Intinya aku pengin nggak terlalu capek. Aku belum bisa jelasin lebih jauh dari itu, Bu.',
      expression: 'netral',
      cue: 'Nisa menatap sampul bukunya sambil menggeser jempol di tepinya yang lusuh.',
    },
    choices: [
      {
        id: 'a', skillId: 'validasi-normalisasi', best: true, next: 'ni-b13',
        text: 'Pengin nggak terlalu capek itu wajar. Nggak perlu dijelasin semuanya sekarang.',
        reaction: {
          text: 'Makasih, Bu. Kalau gitu, satu hal kecil aja yang kepikiran: Rabu malam jam delapan sampai sembilan hp kusenyapin. Fira sama Dimas kukabarin dulu.',
          expression: 'netral',
          cue: 'Nisa membuka halaman kosong di bukunya, menulis "Rabu 20.00" pelan-pelan, lalu menatap tulisannya sendiri.',
        },
      },
      {
        id: 'b', skillId: 'parafrase-ringkasan', next: 'ni-b13',
        text: 'Jadi yang paling kamu mau sekarang itu sedikit ruang buat bernapas.',
        reaction: {
          text: 'Iya, Bu, ruang buat napas dulu. Mungkin Rabu malam, sejam aja, hp kusenyapin mulai jam delapan. Sebelumnya Fira sama Dimas kukabarin.',
          expression: 'netral',
          cue: 'Nisa mengangguk, membuka halaman kosong di bukunya, dan menulis "Rabu 20.00" dengan ujung pulpen yang ragu.',
        },
      },
      {
        id: 'c', skillId: 'pertanyaan-terbuka', next: 'ni-b13',
        text: 'Kalau ada satu hal kecil yang bisa meringankanmu minggu ini, apa itu ya?',
        reaction: {
          text: 'Satu hal kecil ya... kayaknya hp disenyapin sejam, Rabu malam jam delapan. Fira sama Dimas kukabarin dulu biar mereka nggak kaget.',
          expression: 'netral',
          cue: 'Nisa berpikir sebentar, lalu membuka halaman kosong di bukunya dan menulis "Rabu 20.00" dengan pelan.',
        },
      },
      {
        id: 'd', skillId: 'meremehkan', next: 'ni-b13',
        text: 'Nanti juga ilang capeknya kalau liburan semester tiba.',
        reaction: {
          text: 'Iya, mungkin gitu, Bu. Tunggu aja.',
          expression: 'menutup-diri',
          cue: 'Nisa mengangguk sopan dan kembali tersenyum ke arah Dosen.',
        },
      },
    ],
  },
];
