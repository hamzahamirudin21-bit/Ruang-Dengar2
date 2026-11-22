/**
 * Mita Rahmawati (mhs-06), adegan Ruang BK bagian pemahaman.
 * Simpul (urutan jalur): mi-b6, mi-b9, mi-b8, mi-b12, ditambah alternatif mi-b9-alt, mi-b8-alt, mi-b12-alt.
 *
 * Titik sambung:
 *  - masuk dari `mi-b5` (berkas bk-eksplorasi) ke `mi-b6`.
 *  - keluar dari `mi-b12` dan `mi-b12-alt` ke `mi-b13` (berkas bk-rencana).
 *  - Ketegangan memakai `mi-tegang-bk` (berkas bk-rencana).
 *
 * Gerbang: `mi-b8` (Momen_Terbuka) butuh rasa aman (trust), level >= 1, dan bendera `privasi-dijelaskan`
 * (batas kerahasiaan sudah dijelaskan di mi-b0); `mi-b9` butuh trust; `mi-b12` (inti kebutuhan, kedalaman 2)
 * butuh level >= 2. Bila gagal, alur memakai simpul alternatif yang tetap menuju tulang punggung cerita.
 */
import type { StoryNode } from '../../engine/story/storyTypes';

const SCENE = 'bk';
const TENSION = 'mi-tegang-bk';
const CEMAS = { reflectionCorrectOverride: true } as const;

export const MITA_BK_PEMAHAMAN_NODES: StoryNode[] = [
  {
    id: 'mi-b6',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Timku sering nunjuk aku kalau cari referensi. Kalau mereka tahu aku sendiri belum paham timer, nanti mereka kecewa.',
      expression: 'cemas',
      cue: 'Mita menyelipkan helaian kerudung ke belakang telinga, lalu membuka dan menutup resleting tasnya pelan.',
    },
    choices: [
      {
        id: 'a', skillId: 'parafrase-ringkasan', best: true, next: 'mi-b9',
        text: 'Jadi kamu dipercaya soal referensi, dan takut kepercayaan itu hilang kalau ketahuan?',
        reaction: {
          text: 'Iya, itu, Bu. Cari referensi buat tim aku lumayan, makanya takut kepercayaan itu hilang. Praktikumnya yang belum rapi.',
          expression: 'cemas',
          cue: 'Mita mengangguk dan jemarinya berhenti di tepi bundel.',
        },
      },
      {
        id: 'b', skillId: 'validasi-normalisasi', next: 'mi-b9',
        text: 'Wajar kalau jadi sungkan pas orang udah menaruh harapan padamu.',
        reaction: {
          text: 'Iya, Bu, sungkan banget. Cari referensi buat tim aku lumayan, tapi praktikumnya yang belum rapi, jadi takut mengecewakan.',
          expression: 'cemas',
          cue: 'Mita menghela napas panjang dan bahunya mengecil.',
        },
      },
      {
        id: 'c', skillId: 'nasihat-dini', next: TENSION,
        text: 'Bilang aja ke timmu kalau kamu belum paham. Lebih jujur dan cepat beres.',
      },
      {
        id: 'd', skillId: 'pertanyaan-tertutup', next: 'mi-b9',
        text: 'Jadi kamu takut timmu nganggep kamu nggak berguna, gitu?',
        reaction: {
          text: 'Bukan sampai segitunya... tapi, ya, mungkin kedengarannya gitu. Maaf.',
          expression: 'waspada',
          cue: 'Mita mengerutkan dahi sebentar, lalu cepat menunduk.',
        },
      },
    ],
  },
  {
    id: 'mi-b8',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 2,
    reply: {
      text: 'Minggu lalu laporanku kukumpulin pakai kode contoh dari internet. Kutempel tanpa paham isinya. Sejak itu aku susah tidur.',
      expression: 'tertegun',
      cue: 'Mita berhenti menarik lengan bajunya. Kedua tangannya diam di pangkuan dan suaranya nyaris berbisik.',
    },
    marks: ['momen-terbuka'],
    gate: {
      conditions: [
        { type: 'trust-min', value: 70 }, { type: 'level-min', value: 1 },
        { type: 'flag', flag: 'privasi-dijelaskan' },
      ],
      otherwise: 'mi-b8-alt',
    },
    onEnter: { setFlags: ['momen-terbuka'] },
    choices: [
      {
        id: 'a', skillId: 'refleksi-perasaan', best: true, options: CEMAS, next: 'mi-b12',
        text: 'Kamu ngerasa bersalah dan takut ketahuan, padahal cuma nggak mau ketinggalan.',
        reaction: {
          text: 'Iya, Bu, bersalah banget. Aku cuma pengin bisa ngejar dengan tenang.',
          expression: 'menunduk',
          cue: 'Mita mengangguk pelan dan menunduk lebih dalam.',
        },
      },
      {
        id: 'b', skillId: 'afirmasi-kekuatan', next: 'mi-b12',
        text: 'Kamu mau cerita ke aku walau berat. Itu nunjukin kamu jujur banget.',
        reaction: {
          text: 'Jujur banget? Makasih, Bu. Walau sebenernya aku takut. Aku cuma pengin bisa ngejar dengan tenang.',
          expression: 'menunduk',
          cue: 'Mita mengusap pipinya cepat dan mencoba tersenyum.',
        },
      },
      {
        id: 'c', skillId: 'pertanyaan-terbuka', next: 'mi-b12',
        text: 'Apa yang paling ganggu pikiranmu pas malam datang?',
        reaction: {
          text: 'Yang paling ganggu itu kepikiran terus, Bu, makanya susah tidur. Yang kuinginin cuma bisa ngejar dengan tenang.',
          expression: 'menunduk',
          cue: 'Mita menatap tangannya sendiri sambil berbicara pelan.',
        },
      },
      {
        id: 'd', skillId: 'interogasi', next: TENSION,
        text: 'Itu pelanggaran, kan? Kenapa tetap kamu lakuin kalau tahu salah?',
      },
    ],
  },
  {
    id: 'mi-b8-alt',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Nggak ada yang berat kok, Bu. Aku cuma perlu lebih rajin aja. Maaf udah ngabisin waktu Ibu.',
      expression: 'menunduk',
      cue: 'Mita tersenyum cepat dan memeluk tasnya lebih erat, seolah bersiap berdiri.',
    },
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'mi-b12',
        text: 'Kalau kamu udah rajin, sebenarnya kamu pengin dapat apa dari usahamu?',
        reaction: {
          text: 'Dapat apa dari usaha? Hasil yang bikin tenang aja, Bu, bisa ngejar ketinggalan. Cuma itu.',
          expression: 'netral',
          cue: 'Mita berpikir sebentar, lalu menjawab sambil tersenyum canggung.',
        },
      },
      {
        id: 'b', skillId: 'validasi-normalisasi', next: 'mi-b12',
        text: 'Nggak perlu minta maaf. Kita bisa berhenti dulu kalau terasa kecepetan.',
        reaction: {
          text: 'Maaf, refleks. Iya, boleh berhenti dulu, Bu, makasih. Aku cuma pengin bisa ngejar dengan tenang.',
          expression: 'netral',
          cue: 'Mita menarik napas dan melepaskan lengan bajunya.',
        },
      },
      {
        id: 'c', skillId: 'sampaikan-pengamatan', options: { observationTone: 'faktual' }, next: 'mi-b12',
        text: 'Tanganmu sempat berhenti pas bahas laporan, lalu kamu senyum dan bilang nggak apa-apa.',
        reaction: {
          text: 'Oh, iya, tanganku berhenti ya. Cuma capek aja kok, Bu. Maaf. Aku pengin bisa cepet ngejar dengan tenang.',
          expression: 'netral',
          cue: 'Mita menarik tangannya ke pangkuan dan tersenyum tipis.',
        },
      },
      {
        id: 'd', skillId: 'meremehkan', next: 'mi-b12',
        text: 'Kamu pasti bisa nyusul sendiri. Orang pintar kayak kamu nggak perlu cemas.',
        reaction: {
          text: 'Iya, Bu, bener juga. Aku mungkin kelewat dramatis.',
          expression: 'menutup-diri',
          cue: 'Mita mengangguk sopan, lalu menarik lengan baju sampai menutupi telapak.',
        },
      },
    ],
  },
  {
    id: 'mi-b9',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Padahal pas tim buntu di komunikasi I2C, aku yang nemu catatan aplikasinya dalam dua puluh menit. Mereka senang. Tapi justru itu bikin aku makin takut kalau kemampuanku ketahuan terbatas.',
      expression: 'tersenyum',
      cue: 'Mata Mita sempat menyala saat bercerita soal catatan aplikasi, lalu padam ketika sampai di kalimat terakhir.',
    },
    gate: { conditions: [{ type: 'trust-min', value: 65 }], otherwise: 'mi-b9-alt' },
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'mi-b8',
        text: 'Pas catatan itu ketemu dan timmu senang, kamu ngerasain apa di dalam?',
        reaction: {
          text: 'Senang, Bu, tapi di dalam juga tegang. Ada satu hal yang bikin nggak tenang, susah dijelasin.',
          expression: 'cemas',
          cue: 'Mita tersenyum sekilas, lalu menggigit bibir bawahnya.',
        },
      },
      {
        id: 'b', skillId: 'refleksi-perasaan', options: CEMAS, next: 'mi-b8',
        text: 'Kamu bangga sama hasilnya, tapi pujian itu juga nambah tekanan buat selalu bisa.',
        reaction: {
          text: 'Bangga, iya. Tapi pujian itu bikin takut kalau suatu hari nggak bisa lagi. Ada satu hal yang bikin nggak tenang, susah dijelasin.',
          expression: 'cemas',
          cue: 'Mita mengangguk, matanya menghindari Dosen.',
        },
      },
      {
        id: 'c', skillId: 'pertanyaan-tertutup', next: 'mi-b8',
        text: 'Jadi menurutmu lebih baik nggak usah dipuji sama sekali?',
        reaction: {
          text: 'Bukan itu... tapi kadang rasanya gitu. Maaf, aku bingung jelasinnya.',
          expression: 'menunduk',
          cue: 'Mita tersenyum tipis dan menunduk memandang jari-jarinya.',
        },
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: TENSION,
        text: 'Kalau jago cari referensi, cari aja jawaban timer-nya sekarang. Gampang, kan?',
      },
    ],
  },
  {
    id: 'mi-b9-alt',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Ya, kalau cari referensi aku lumayan kok. Cuma bagian praktikum yang belum rapi.',
      expression: 'netral',
      cue: 'Mita mengangkat bahu kecil, lalu merapikan lipatan lengan bajunya.',
    },
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'mi-b8',
        text: 'Dari bagian praktikum yang belum rapi itu, mana yang paling nyita pikiranmu?',
        reaction: {
          text: 'Dari praktikum yang belum rapi, yang paling kepikiran ketinggalannya, Bu. Ada hal yang bikin nggak tenang, susah dijelasin.',
          expression: 'cemas',
          cue: 'Mita menunjuk satu halaman bundelnya dengan ragu.',
        },
      },
      {
        id: 'b', skillId: 'parafrase-ringkasan', next: 'mi-b8',
        text: 'Jadi cari referensi terasa gampang, sedangkan praktikumnya yang masih ketinggalan.',
        reaction: {
          text: 'Iya, Bu, cari referensi gampang, praktikumnya yang ketinggalan. Selebihnya nggak ada apa-apa kok.',
          expression: 'netral',
          cue: 'Mita mengangguk sambil memegang ujung lengan bajunya.',
        },
      },
      {
        id: 'c', skillId: 'validasi-normalisasi', next: 'mi-b8',
        text: 'Kuat di satu sisi dan ketinggalan di sisi lain itu hal yang lumrah.',
        reaction: {
          text: 'Lumrah ya? Makasih, Bu. Rasanya agak lega denger itu, walau praktikumnya tetep ketinggalan.',
          expression: 'netral',
          cue: 'Mita mengembuskan napas dan bahunya turun sedikit.',
        },
      },
      {
        id: 'd', skillId: 'pertanyaan-tertutup', next: 'mi-b8',
        text: 'Cuma itu aja yang mengganjal?',
        reaction: {
          text: 'Iya, cuma itu kok, Bu.',
          expression: 'menutup-diri',
          cue: 'Mita menjawab singkat dan menatap ritsleting tasnya.',
        },
      },
    ],
  },
  {
    id: 'mi-b12',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 2,
    reply: {
      text: 'Kayaknya aku cuma pengin boleh nanya tanpa dianggap bodoh. Dan boleh belum paham tanpa bikin semua orang kecewa.',
      expression: 'lega',
      cue: 'Mita melepas pelukannya pada tas, menaruhnya di lantai, dan menarik napas panjang untuk pertama kali.',
    },
    gate: { conditions: [{ type: 'level-min', value: 2 }], otherwise: 'mi-b12-alt' },
    choices: [
      {
        id: 'a', skillId: 'parafrase-ringkasan', best: true, next: 'mi-b13',
        text: 'Jadi kamu pengin boleh nanya dan boleh belum paham, tanpa dianggap kurang. Gitu ya?',
        reaction: {
          text: 'Iya, Bu, gitu. Boleh nanya dan boleh belum paham. Mungkin Rabu sore aku datengin asisten lab, bawa satu pertanyaan soal timer aja.',
          expression: 'netral',
          cue: 'Mita mengangguk, lalu menarik bundelnya sedikit lebih dekat.',
        },
      },
      {
        id: 'b', skillId: 'afirmasi-kekuatan', next: 'mi-b13',
        text: 'Kamu tahu persis yang kamu butuhkan. Itu langkah besar buat yang biasa diam.',
        reaction: {
          text: 'Makasih, Bu, tapi aku nggak ngerasa hebat. Mungkin Rabu sore aku datengin asisten lab, bawa satu pertanyaan soal timer aja.',
          expression: 'netral',
          cue: 'Mita menggeleng pelan sambil tersenyum malu.',
        },
      },
      {
        id: 'c', skillId: 'refleksi-perasaan', options: CEMAS, next: 'mi-b13',
        text: 'Kamu pengin nanya dengan tenang, tanpa takut dinilai, termasuk oleh dirimu sendiri.',
        reaction: {
          text: 'Iya, termasuk takut sama penilaianku sendiri. Mungkin Rabu sore aku datengin asisten lab, bawa satu pertanyaan soal timer.',
          expression: 'netral',
          cue: 'Mita terdiam sebentar, lalu mengangguk perlahan.',
        },
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: TENSION,
        text: 'Kalau gitu, berhenti aja takut nanya mulai besok.',
      },
    ],
  },
  {
    id: 'mi-b12-alt',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Intinya aku pengin cepet ngejar aja. Cuma itu yang bisa kujelasin sekarang.',
      expression: 'netral',
      cue: 'Mita memandangi sepatunya sambil menggerakkan ujung jari di tali tas.',
    },
    choices: [
      {
        id: 'a', skillId: 'validasi-normalisasi', best: true, next: 'mi-b13',
        text: 'Pengin cepat nyusul itu wajar. Nggak perlu dijelasin semuanya sekarang.',
        reaction: {
          text: 'Makasih, Bu, nggak harus dijelasin semua. Mungkin Rabu sore aku datengin asisten lab, bawa satu pertanyaan soal timer.',
          expression: 'netral',
          cue: 'Mita mengangguk, napasnya lebih teratur.',
        },
      },
      {
        id: 'b', skillId: 'parafrase-ringkasan', next: 'mi-b13',
        text: 'Jadi yang paling kamu mau sekarang: bisa nyusul materi dengan lebih tenang.',
        reaction: {
          text: 'Iya, nyusul dengan tenang, Bu. Mungkin Rabu sore aku datengin asisten lab, bawa satu pertanyaan soal timer.',
          expression: 'netral',
          cue: 'Mita menyibak rambut ke belakang telinga sambil menjawab pelan.',
        },
      },
      {
        id: 'c', skillId: 'pertanyaan-terbuka', next: 'mi-b13',
        text: 'Kalau boleh ajuin satu pertanyaan kecil minggu ini, apa itu?',
        reaction: {
          text: 'Satu pertanyaan kecil? Soal timer, Bu. Mungkin Rabu sore aku nanya asisten lab itu dulu, yang lain nyusul.',
          expression: 'netral',
          cue: 'Mita menunjuk satu tanda tanya di bundelnya dengan ujung jari.',
        },
      },
      {
        id: 'd', skillId: 'meremehkan', next: 'mi-b13',
        text: 'Nanti juga ketemu sendiri kalau kamu rajin baca lagi.',
        reaction: {
          text: 'Iya, mungkin gitu. Maaf ya, Bu.',
          expression: 'menutup-diri',
          cue: 'Mita mengangguk sopan, lalu menarik lengan baju ke ujung jari.',
        },
      },
    ],
  },
];
