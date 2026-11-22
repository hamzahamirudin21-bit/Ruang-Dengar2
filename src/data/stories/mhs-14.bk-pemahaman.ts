/**
 * Rani Safitri (mhs-14), adegan Ruang BK bagian pemahaman.
 * Simpul (urutan jalur): r-b6, r-b9, r-b8, r-b12, ditambah alternatif r-b9-alt, r-b8-alt, r-b12-alt.
 *
 * Titik sambung:
 *  - masuk dari `r-b5` (berkas bk-eksplorasi) ke `r-b6`.
 *  - keluar dari `r-b12` dan `r-b12-alt` ke `r-b13` (berkas bk-rencana).
 *  - Ketegangan memakai `r-tegang-bk` (berkas bk-rencana).
 *
 * Gerbang: `r-b8` (Momen_Terbuka) butuh trust >= 54, level >= 1, dan bendera `isyarat-diperhatikan` (dari r-l2); `r-b9` butuh trust >= 44;
 * `r-b12` (inti kebutuhan, kedalaman 2) butuh level >= 1. Bila gagal, alur memakai simpul alternatif
 * yang tetap menuju tulang punggung cerita.
 */
import type { StoryNode } from '../../engine/story/storyTypes';

const SCENE = 'bk';
const TENSION = 'r-tegang-bk';
const RAGU = { reflectionNuance: 'ragu-kurang-percaya' } as const;

export const MHS_14_BK_PEMAHAMAN_NODES: StoryNode[] = [
  {
    id: 'r-b6',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Kalau aku bilang butuh bantuan, nanti kelihatan lemah.',
      expression: 'menunduk',
      cue: 'Rani menunduk, jarinya mengusap-usap sampul buku catatan yang ada di pangkuannya.',
    },
    choices: [
      {
        id: 'a', skillId: 'refleksi-perasaan', best: true, options: RAGU, next: 'r-b9',
        text: 'Kedengarannya kamu ragu meminta bantuan karena takut orang menganggapmu kurang mampu.',
        reaction: {
          text: 'Iya, Dosen, kurang lebih gitu. Apalagi kalau banyak orang yang lihat, aku cepat malu duluan. Selebihnya sih biasa aja.',
          expression: 'menunduk',
          cue: 'Rani mengangguk kecil sambil merapikan buku catatan di pangkuannya.',
        },
      },
      {
        id: 'b', skillId: 'validasi-normalisasi', next: 'r-b9',
        text: 'Ragu minta bantuan itu wajar kok. Banyak yang begitu di lingkungan baru.',
        reaction: {
          text: 'Makasih, Dosen... lumayan lega dengernya. Mungkin karena aku masih baru juga. Cuma ya itu, kalau banyak orang aku gampang malu, entah kenapa.',
          expression: 'menunduk',
          cue: 'Rani tersenyum tipis, lalu merapikan buku catatan di pangkuannya.',
        },
      },
      {
        id: 'c', skillId: 'nasihat-dini', next: TENSION,
        text: 'Sebaiknya langsung tanya saja ke asisten lab. Itu cara tercepat supaya paham.',
      },
      {
        id: 'd', skillId: 'pertanyaan-tertutup', next: 'r-b9',
        text: 'Jadi kamu memang nggak mau minta bantuan siapa pun, gitu?',
        reaction: {
          text: 'Bukan begitu juga sih... tapi ya, mungkin iya.',
          expression: 'waspada',
          cue: 'Rani melirik pintu sekilas, lalu kembali menatap bukunya.',
        },
      },
    ],
  },
  {
    id: 'r-b8',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 2,
    reply: {
      text: 'Aku... pernah bikin daftar ini. Pertanyaan yang ingin kutanyakan ke asisten lab. Sudah tiga minggu, belum pernah kukasih ke siapa-siapa.',
      expression: 'tertegun',
      cue: 'Rani mengeluarkan kertas terlipat kecil dari balik sampul buku. Tangannya sedikit gemetar saat membukanya.',
    },
    marks: ['momen-terbuka'],
    gate: {
      conditions: [
        { type: 'trust-min', value: 54 }, { type: 'level-min', value: 1 },
        { type: 'flag', flag: 'isyarat-diperhatikan' },
      ],
      otherwise: 'r-b8-alt',
    },
    onEnter: { setFlags: ['momen-terbuka'] },
    choices: [
      {
        id: 'a', skillId: 'afirmasi-kekuatan', best: true, next: 'r-b12',
        text: 'Kamu sudah merumuskan pertanyaannya dengan jelas. Itu langkah yang berani.',
        reaction: {
          text: 'Makasih, Dosen... aku enggak nyangka dibilang berani. Yang pengin kubilang cuma satu: aku mau lebih tenang waktu belajar. Itu aja dulu.',
          expression: 'menunduk',
          cue: 'Rani menyimpan kertas terlipat itu kembali ke balik sampul buku dengan tangan yang masih sedikit gemetar.',
        },
      },
      {
        id: 'b', skillId: 'pertanyaan-terbuka', next: 'r-b12',
        text: 'Pertanyaan mana di daftar itu yang paling ingin kamu tanyakan lebih dulu?',
        reaction: {
          text: 'Yang paling atas sih, Dosen, soal rangkaian yang kemarin salah. Tapi intinya aku cuma pengin belajar dengan lebih tenang.',
          expression: 'menunduk',
          cue: 'Rani melipat kembali kertas kecilnya dan memegangnya dengan dua tangan.',
        },
      },
      {
        id: 'c', skillId: 'refleksi-perasaan', options: RAGU, next: 'r-b12',
        text: 'Rasanya ada keinginan bertanya yang sudah lama kamu simpan, dan sulit sekali dilepaskan.',
        reaction: {
          text: 'Iya, Dosen... udah lama banget kusimpan. Enggak tahu kenapa susah dilepas. Yang kuinginin cuma bisa belajar dengan lebih tenang, itu aja.',
          expression: 'menunduk',
          cue: 'Rani menekan lipatan kertas itu dengan ibu jarinya, lalu menarik napas pelan.',
        },
      },
      {
        id: 'd', skillId: 'interogasi', next: TENSION,
        text: 'Kenapa baru sekarang kamu tunjukkan? Kenapa tiga minggu tidak bilang apa-apa?',
      },
    ],
  },
  {
    id: 'r-b8-alt',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Enggak ada sih... aku cuma lagi mikir, mungkin besok bisa lebih baik.',
      expression: 'waspada',
      cue: 'Rani merapikan buku catatan yang sebenarnya sudah rapi, lalu menutupnya pelan.',
    },
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'r-b12',
        text: 'Besok yang lebih baik itu seperti apa menurutmu?',
        reaction: {
          text: 'Yang lebih baik itu... ya lebih tenang aja pas belajar, Dosen. Enggak deg-degan terus. Aku belum bisa jelasin lebih dari itu.',
          expression: 'netral',
          cue: 'Rani menghentikan gerakan tangannya yang merapikan buku, lalu menatap Dosen sekilas.',
        },
      },
      {
        id: 'b', skillId: 'validasi-normalisasi', next: 'r-b12',
        text: 'Nggak apa-apa kalau belum mau bahas lebih jauh. Kita pelan-pelan aja.',
        reaction: {
          text: 'Makasih ya, Dosen, enggak maksa. Jadi lebih ringan. Yang bisa kubilang baru sedikit: aku pengin belajar dengan perasaan lebih tenang.',
          expression: 'lega',
          cue: 'Rani menghela napas pelan dan bahunya turun, lalu tangannya berhenti merapikan buku.',
        },
      },
      {
        id: 'c', skillId: 'sampaikan-pengamatan', options: { observationTone: 'faktual' }, next: 'r-b12',
        text: 'Aku lihat kamu dua kali merapikan bukumu. Mungkin ada yang mengganjal?',
        reaction: {
          text: 'Eh, kelihatan ya... Mungkin iya, Dosen, ada yang agak mengganjal. Tapi aku belum bisa jelasin. Yang jelas aku pengin lebih tenang aja kalau belajar.',
          expression: 'menunduk',
          cue: 'Rani menarik tangannya dari buku, lalu menautkan jari di pangkuan.',
        },
      },
      {
        id: 'd', skillId: 'meremehkan', next: 'r-b12',
        text: 'Ah, besok pasti jauh lebih baik. Tidak perlu terlalu dipikirkan.',
        reaction: {
          text: 'Iya, mungkin. Tidak usah dibahas lagi.',
          expression: 'menutup-diri',
          cue: 'Rani memalingkan wajah ke jendela dan menggenggam pulpennya erat.',
        },
      },
    ],
  },
  {
    id: 'r-b9',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Sebenarnya aku suka banget merancang skema, Dosen. Tapi begitu disuruh praktik di depan orang, tanganku kaku dan aku malu. Akhirnya aku pilih diam saja.',
      expression: 'cemas',
      cue: 'Rani tersenyum tipis saat menyebut merancang skema, lalu senyumnya menghilang ketika bicara soal praktik.',
    },
    gate: { conditions: [{ type: 'trust-min', value: 44 }], otherwise: 'r-b9-alt' },
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'r-b8',
        text: 'Saat merancang skema sendirian, apa yang membuatnya terasa menyenangkan bagimu?',
        reaction: {
          text: 'Pas sendirian itu tenang aja, Dosen, gambarnya jadi rapi. Selebihnya sih enggak ada apa-apa, aku cuma lagi mikir, mungkin besok bisa lebih baik.',
          expression: 'netral',
          cue: 'Rani merapikan buku catatan yang sebenarnya sudah rapi, lalu menutupnya pelan.',
        },
      },
      {
        id: 'b', skillId: 'refleksi-perasaan', options: RAGU, next: 'r-b8',
        text: 'Kamu suka merancang skema, tapi diperhatikan banyak orang membuatmu malu dan ragu.',
        reaction: {
          text: 'Iya, Dosen... kurang lebih gitu. Kalau sendirian enak, kalau diliatin jadi malu. Cuma itu kok. Aku cuma mikir, mungkin besok bisa lebih baik.',
          expression: 'menunduk',
          cue: 'Rani menunduk, merapikan buku catatannya dua kali, lalu menutupnya pelan.',
        },
      },
      {
        id: 'c', skillId: 'pertanyaan-tertutup', next: 'r-b8',
        text: 'Jadi kamu memang takut tampil di depan orang, ya?',
        reaction: {
          text: 'Iya... bisa dibilang begitu. Tapi kedengarannya jadi parah ya.',
          expression: 'menunduk',
          cue: 'Rani menggeser duduknya, pandangannya jatuh ke lantai.',
        },
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: TENSION,
        text: 'Kalau begitu latihan saja praktik di depan teman-temanmu sampai terbiasa.',
      },
    ],
  },
  {
    id: 'r-b9-alt',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Ya... kadang aku memang cepat malu kalau banyak orang. Selebihnya biasa saja kok.',
      expression: 'netral',
      cue: 'Rani mengangkat bahu kecil, seolah ingin menganggapnya bukan hal besar.',
    },
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'r-b8',
        text: 'Kalau banyak orang, bagian mana yang terasa paling berat bagimu?',
        reaction: {
          text: 'Bagian yang paling berat... pas semua orang nengok, Dosen. Aku jadi enggak enak sendiri. Selebihnya enggak ada apa-apa kok, mungkin besok bisa lebih baik.',
          expression: 'menunduk',
          cue: 'Rani merapikan buku catatannya dua kali, lalu menutupnya pelan.',
        },
      },
      {
        id: 'b', skillId: 'parafrase-ringkasan', next: 'r-b8',
        text: 'Jadi suasana ramai yang membuatmu cepat malu, sedangkan hal lainnya terasa biasa.',
        reaction: {
          text: 'Iya, Dosen, persis itu. Ramai bikin aku cepat malu, yang lain biasa aja. Mudah-mudahan besok bisa lebih baik.',
          expression: 'netral',
          cue: 'Rani mengangguk kecil, lalu merapikan buku catatannya dan menutupnya pelan.',
        },
      },
      {
        id: 'c', skillId: 'validasi-normalisasi', next: 'r-b8',
        text: 'Cepat malu di keramaian itu wajar kok, banyak yang begitu.',
        reaction: {
          text: 'Hehe, makasih, Dosen... aku jadi enggak ngerasa aneh sendiri. Selebihnya sih biasa aja, aku cuma lagi mikir, mungkin besok bisa lebih baik.',
          expression: 'menunduk',
          cue: 'Rani tersenyum tipis sambil merapikan buku catatannya yang sebenarnya sudah rapi.',
        },
      },
      {
        id: 'd', skillId: 'pertanyaan-tertutup', next: 'r-b8',
        text: 'Jadi hanya itu saja yang mengganggumu?',
        reaction: {
          text: 'Iya, cuma itu.',
          expression: 'menutup-diri',
          cue: 'Rani menjawab singkat tanpa menatap, jarinya mengetuk-ngetuk meja.',
        },
      },
    ],
  },
  {
    id: 'r-b12',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 2,
    reply: {
      text: 'Aku cuma pengen belajar pelan-pelan tanpa dibanding-bandingin, itu aja. Boleh salah juga, tanpa dibilang lemah.',
      expression: 'lega',
      cue: 'Suara Rani pelan tetapi mantap. Bahunya turun, dan tangannya akhirnya berhenti memegangi buku erat-erat.',
    },
    gate: { conditions: [{ type: 'level-min', value: 1 }], otherwise: 'r-b12-alt' },
    choices: [
      {
        id: 'a', skillId: 'parafrase-ringkasan', best: true, next: 'r-b13',
        text: 'Jadi kamu ingin belajar bertahap, boleh salah, dan tidak dibandingkan. Tepat begitu?',
        reaction: {
          text: 'Tepat, Dosen. Kalau gitu mungkin aku bisa coba satu hal: tanya satu pertanyaan aja ke asisten lab, tapi pas sepi. Sebelum praktikum mulai atau sesudah selesai.',
          expression: 'netral',
          cue: 'Rani membuka lipatan kertas kecilnya, menunjuk satu baris, lalu mengangkat pandangan sekilas.',
        },
      },
      {
        id: 'b', skillId: 'afirmasi-kekuatan', next: 'r-b13',
        text: 'Kamu tahu persis apa yang kamu butuhkan. Itu kekuatan yang tidak dimiliki semua orang.',
        reaction: {
          text: 'Makasih, Dosen... aku baru sadar ternyata aku tahu. Jadi mungkin aku coba satu pertanyaan ke asisten lab, tapi di waktu sepi aja. Entah sebelum praktikum atau sesudahnya.',
          expression: 'netral',
          cue: 'Rani membuka lipatan kertasnya, menunjuk satu baris dengan ujung pulpen, lalu menatap Dosen sebentar.',
        },
      },
      {
        id: 'c', skillId: 'refleksi-perasaan', options: RAGU, next: 'r-b13',
        text: 'Ada keinginan merasa aman saat belajar, tanpa takut dinilai ketika salah.',
        reaction: {
          text: 'Iya, itu... aman aja rasanya. Makanya mungkin aku cuma tanya satu hal ke asisten lab, waktu masih sepi, jangan di tengah keramaian.',
          expression: 'netral',
          cue: 'Rani membuka lipatan kertasnya dan menunjuk satu baris, lalu mengangkat pandangan sekilas.',
        },
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: TENSION,
        text: 'Kalau begitu, berhenti saja membandingkan dirimu dengan orang lain mulai sekarang.',
      },
    ],
  },
  {
    id: 'r-b12-alt',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Intinya aku mau lebih tenang aja waktu belajar. Aku belum bisa jelasin lebih dari itu.',
      expression: 'netral',
      cue: 'Rani menarik napas panjang, lalu mengembuskannya pelan sambil menatap meja.',
    },
    choices: [
      {
        id: 'a', skillId: 'validasi-normalisasi', best: true, next: 'r-b13',
        text: 'Pengin lebih tenang saat belajar itu wajar. Nggak perlu dijelasin semuanya sekarang.',
        reaction: {
          text: 'Makasih, Dosen. Kalau gitu satu hal kecil aja yang kepikiran: tanya satu pertanyaan ke asisten lab pas masih sepi, sebelum atau sesudah praktikum.',
          expression: 'netral',
          cue: 'Rani membuka lipatan kertas kecilnya, menunjuk satu baris, lalu mengangkat pandangan sekilas.',
        },
      },
      {
        id: 'b', skillId: 'parafrase-ringkasan', next: 'r-b13',
        text: 'Jadi yang paling kamu inginkan saat ini adalah belajar dengan perasaan yang lebih tenang.',
        reaction: {
          text: 'Iya, Dosen, itu. Mungkin langkah kecilnya: satu pertanyaan aja ke asisten lab, di waktu sepi. Jangan pas banyak orang.',
          expression: 'netral',
          cue: 'Rani mengangguk, membuka lipatan kertas kecil dari balik buku, dan menunjuk satu barisnya.',
        },
      },
      {
        id: 'c', skillId: 'pertanyaan-terbuka', next: 'r-b13',
        text: 'Kalau ada satu hal kecil yang bisa membuatmu lebih tenang, kira-kira apa?',
        reaction: {
          text: 'Satu hal kecil... mungkin tahu jawaban dari satu pertanyaan aja, Dosen. Jadi aku tanya ke asisten lab pas sepi, sebelum praktikum mulai.',
          expression: 'netral',
          cue: 'Rani mengeluarkan kertas kecil terlipat dari balik buku, membukanya, lalu menunjuk satu baris.',
        },
      },
      {
        id: 'd', skillId: 'meremehkan', next: 'r-b13',
        text: 'Nanti juga tenang sendiri kalau sudah terbiasa.',
        reaction: {
          text: 'Mungkin ya. Semoga.',
          expression: 'menutup-diri',
          cue: 'Rani mengangguk singkat tanpa menoleh, suaranya nyaris tak terdengar.',
        },
      },
    ],
  },
];
