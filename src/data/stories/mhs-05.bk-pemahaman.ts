/**
 * Ayu Permata (mhs-05), adegan Ruang BK bagian pemahaman.
 * Simpul (urutan jalur): ay-b6, ay-b9, ay-b8, ay-b12, ditambah alternatif ay-b9-alt, ay-b8-alt, ay-b12-alt.
 *
 * Titik sambung:
 *  - masuk dari `ay-b5` (berkas bk-eksplorasi) ke `ay-b6`.
 *  - keluar dari `ay-b12` dan `ay-b12-alt` ke `ay-b13` (berkas bk-rencana).
 *  - Ketegangan memakai `ay-tegang-bk` (berkas bk-rencana).
 *
 * Gerbang: `ay-b8` (Momen_Terbuka) butuh trust, level >= 1, dan bendera `isyarat-diperhatikan` (dari ay-l2);
 * `ay-b9` butuh trust; `ay-b12` (inti kebutuhan, kedalaman 2) butuh level >= 2.
 * Bila gagal, alur memakai simpul alternatif yang tetap menuju tulang punggung cerita.
 */
import type { StoryNode } from '../../engine/story/storyTypes';

const SCENE = 'bk';
const TENSION = 'ay-tegang-bk';
const RAGU = { reflectionNuance: 'ragu-kurang-percaya' } as const;

export const AYU_BK_PEMAHAMAN_NODES: StoryNode[] = [
  {
    id: 'ay-b6',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Kalau aku pilih satu, berarti yang lain kututup selamanya, kan? Terus kalau ternyata salah pilih, aku nyesel seumur hidup.',
      expression: 'cemas',
      cue: 'Ayu menggambar satu pintu kecil di kertas, lalu cepat-cepat menambahkan banyak pintu lain di sekelilingnya.',
    },
    choices: [
      {
        id: 'a', skillId: 'parafrase-ringkasan', best: true, next: 'ay-b9',
        text: 'Jadi memilih terasa seperti menutup semua pintu lain, dan kamu takut salah langkah?',
        reaction: {
          text: 'Iya, itu persis, Bu. Aku semangat banget kalau lagi bikin tampilan, tapi urusan milih jalur bikin aku bengong.',
          expression: 'cemas',
          cue: 'Ayu mengangguk dan jari-jarinya berhenti menggambar.',
        },
      },
      {
        id: 'b', skillId: 'validasi-normalisasi', next: 'ay-b9',
        text: 'Takut salah pilih itu manusiawi. Banyak orang merasakannya di persimpangan seperti ini.',
        reaction: {
          text: 'Manusiawi ya? Makasih, Bu. Bikin tampilan buatku lancar dan seru, tapi pas harus milih jalur, aku bengong.',
          expression: 'tersenyum',
          cue: 'Ayu menghela napas lega dan bersandar ke kursi.',
        },
      },
      {
        id: 'c', skillId: 'nasihat-dini', next: TENSION,
        text: 'Pilih saja satu hari ini. Terlalu banyak pertimbangan hanya membuang waktu.',
      },
      {
        id: 'd', skillId: 'pertanyaan-tertutup', next: 'ay-b9',
        text: 'Jadi kamu memang tidak yakin dengan kemampuanmu sendiri, begitu?',
        reaction: {
          text: 'Bukan gitu, Bu. Aku yakin bisa, tapi yakin bisa apa yang mana, itu yang bingung.',
          expression: 'waspada',
          cue: 'Ayu mengerutkan dahi dan menggeser buku sketsanya sedikit menjauh.',
        },
      },
    ],
  },
  {
    id: 'ay-b8',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 2,
    reply: {
      text: 'Dua minggu lalu aku sudah isi formulir magang di studio antarmuka itu, lengkap sampai portofolionya. Tinggal tekan kirim. Tapi tiap mau kirim, aku buka proyek baru. Sudah sembilan hari, Bu.',
      expression: 'tertegun',
      cue: 'Ayu membuka layar tablet, memperlihatkan tombol kirim berwarna biru, lalu cepat meredupkan layarnya. Suaranya mengecil.',
    },
    marks: ['momen-terbuka'],
    gate: {
      conditions: [
        { type: 'trust-min', value: 80 }, { type: 'level-min', value: 1 },
        { type: 'flag', flag: 'isyarat-diperhatikan' },
      ],
      otherwise: 'ay-b8-alt',
    },
    onEnter: { setFlags: ['momen-terbuka'] },
    choices: [
      {
        id: 'a', skillId: 'refleksi-perasaan', best: true, options: RAGU, next: 'ay-b12',
        text: 'Kamu takut harus yakin sepenuhnya setelah kirim, jadi lebih aman mencoba hal baru.',
        reaction: {
          text: 'Iya, Bu, kayaknya begitu. Takut harus yakin penuh setelah kirim. Aku cuma pengin tenang dulu supaya bisa melangkah.',
          expression: 'cemas',
          cue: 'Ayu mengangguk pelan sambil memeluk buku sketsanya.',
        },
      },
      {
        id: 'b', skillId: 'afirmasi-kekuatan', next: 'ay-b12',
        text: 'Kamu sudah menyiapkan semuanya sampai lengkap. Itu butuh keberanian dan ketelatenan.',
        reaction: {
          text: 'Lengkap sih iya, Bu. Tapi tiap mau kirim aku malah gentar. Aku pengin tenang dulu supaya bisa melangkah.',
          expression: 'cemas',
          cue: 'Ayu tertawa kecil, tapi pandangannya turun ke pangkuan.',
        },
      },
      {
        id: 'c', skillId: 'pertanyaan-terbuka', next: 'ay-b12',
        text: 'Apa yang terlintas di kepalamu persis sebelum jari menyentuh tombol itu?',
        reaction: {
          text: 'Sebelum jari nyentuh tombol? Mikir, gimana kalau salah. Terus tanganku malah buka proyek baru. Aku cuma pengin tenang dulu supaya bisa melangkah.',
          expression: 'tertegun',
          cue: 'Ayu menatap jarinya sendiri, seolah membayangkan tombol itu.',
        },
      },
      {
        id: 'd', skillId: 'interogasi', next: TENSION,
        text: 'Kenapa tidak kamu kirim saja? Sembilan hari itu sudah keterlaluan.',
      },
    ],
  },
  {
    id: 'ay-b8-alt',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Hmm, nggak ada yang gawat kok. Aku cuma lagi nunggu waktu yang pas buat daftar-daftar gitu.',
      expression: 'netral',
      cue: 'Ayu tersenyum lebar dan membalik buku sketsa ke halaman kosong, seperti memulai yang baru.',
    },
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'ay-b12',
        text: 'Waktu yang pas itu seperti apa bagimu, dan apa yang sedang kamu tunggu?',
        reaction: {
          text: 'Waktu yang pas itu pas aku yakin, Bu. Tapi aku nggak tahu kapan. Aku cuma pengin tenang dulu supaya bisa melangkah.',
          expression: 'netral',
          cue: 'Ayu menggaruk pelipis dan memandang halaman kosong di bukunya.',
        },
      },
      {
        id: 'b', skillId: 'validasi-normalisasi', next: 'ay-b12',
        text: 'Tidak apa-apa kalau belum ingin membahas lebih dalam. Kita jalan sesuai tempomu.',
        reaction: {
          text: 'Makasih, Bu. Aku belum pengin bahas panjang, tapi aku pengin tenang dulu supaya bisa melangkah.',
          expression: 'netral',
          cue: 'Ayu tersenyum tipis dan menutup bukunya perlahan.',
        },
      },
      {
        id: 'c', skillId: 'sampaikan-pengamatan', options: { observationTone: 'faktual' }, next: 'ay-b12',
        text: 'Kamu baru saja membuka halaman kosong, tepat setelah aku bertanya soal waktu yang pas.',
        reaction: {
          text: 'Eh, ketahuan ya halaman kosongnya. Cuma coret-coret kok, Bu. Aku pengin tenang dulu supaya bisa melangkah.',
          expression: 'netral',
          cue: 'Ayu meringis dan menggeser buku sketsa sedikit.',
        },
      },
      {
        id: 'd', skillId: 'meremehkan', next: 'ay-b12',
        text: 'Santai saja. Anak kreatif seperti kamu pasti banyak pilihan.',
        reaction: {
          text: 'Iya sih, banyak pilihan. Jadi malah susah, hehe.',
          expression: 'menutup-diri',
          cue: 'Ayu tertawa singkat dan mulai menggambar bunga kecil tanpa menatap Dosen.',
        },
      },
    ],
  },
  {
    id: 'ay-b9',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Padahal waktu aku lagi nyusun tampilan data, aku bisa lupa makan. Minggu lalu tampilan grafik uji getaran kubuat bisa dibaca langsung sama anak yang nggak ngerti elektronika. Tapi begitu urusan diminta memilih jalur, aku langsung bengong.',
      expression: 'tersenyum',
      cue: 'Mata Ayu berbinar ketika menjelaskan grafik, lalu pandangannya turun ke pangkuan ketika menyebut memilih jalur.',
    },
    gate: { conditions: [{ type: 'trust-min', value: 70 }], otherwise: 'ay-b9-alt' },
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'ay-b8',
        text: 'Saat orang awam bisa membaca grafikmu, apa yang membuatmu paling senang?',
        reaction: {
          text: 'Pas lihat dia ngerti tanpa kujelasin, Bu. Rasanya kerjaanku nyampe. Tapi ada satu hal yang kutunda-tunda, nunggu waktu yang pas.',
          expression: 'tersenyum',
          cue: 'Ayu mengangkat bahu sambil tersenyum lebar, lalu senyumnya meredup.',
        },
      },
      {
        id: 'b', skillId: 'refleksi-perasaan', options: RAGU, next: 'ay-b8',
        text: 'Kamu hidup waktu merancang tampilan, tapi ragu kalau harus memutuskan satu arah.',
        reaction: {
          text: 'Betul banget, Bu. Waktu merancang aku hidup. Tapi ada satu hal yang kutunda-tunda, nunggu waktu yang pas.',
          expression: 'tertegun',
          cue: 'Ayu mengangguk, jari-jarinya berhenti di sampul buku.',
        },
      },
      {
        id: 'c', skillId: 'pertanyaan-tertutup', next: 'ay-b8',
        text: 'Jadi sebenarnya kamu sudah tahu jalurnya, hanya malas memilih?',
        reaction: {
          text: 'Hmm, kayaknya bukan malas. Cuma takut aja, mungkin.',
          expression: 'menunduk',
          cue: 'Ayu tertawa kecil tanpa suara dan memilin ujung ikat rambutnya.',
        },
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: TENSION,
        text: 'Kalau begitu langsung daftar ke studio saja besok, tidak usah berpikir panjang.',
      },
    ],
  },
  {
    id: 'ay-b9-alt',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Ya, bagian bikin tampilan sih lancar. Yang agak ribet cuma urusan mutusin mau ke mana habis lulus.',
      expression: 'netral',
      cue: 'Ayu mengangkat bahu ringan lalu memutar pensil, seperti sedang mencari topik lain.',
    },
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'ay-b8',
        text: 'Dari urusan memutuskan itu, bagian mana yang paling mengganggu pikiranmu?',
        reaction: {
          text: 'Yang paling ganggu, aku takut keliru dan nggak bisa balik, Bu. Ada satu hal yang kutunda-tunda juga, nunggu waktu yang pas.',
          expression: 'cemas',
          cue: 'Ayu memainkan ujung pensil dan melirik ke jendela.',
        },
      },
      {
        id: 'b', skillId: 'parafrase-ringkasan', next: 'ay-b8',
        text: 'Jadi bagian merancang berjalan lancar, sementara memutuskan masa depan terasa rumit.',
        reaction: {
          text: 'Iya, Bu, bagian merancang lancar, memutuskan yang rumit. Makanya ada satu hal yang kutunda, nunggu waktu yang pas.',
          expression: 'netral',
          cue: 'Ayu mengangguk dan membuat garis kecil di pinggir halaman.',
        },
      },
      {
        id: 'c', skillId: 'validasi-normalisasi', next: 'ay-b8',
        text: 'Memikirkan kelanjutan setelah lulus sambil tetap mengerjakan tugas memang menyita tenaga.',
        reaction: {
          text: 'Iya sih, Bu, mikirin lulus sambil ngerjain tugas capek juga. Makanya ada satu hal yang kutunda, nunggu waktu yang pas.',
          expression: 'netral',
          cue: 'Ayu mengusap tengkuk sambil tertawa kecil.',
        },
      },
      {
        id: 'd', skillId: 'pertanyaan-tertutup', next: 'ay-b8',
        text: 'Hanya itu yang bikin kamu bingung?',
        reaction: {
          text: 'Iya, cuma itu. Eh, ada satu lagi sih, tapi nggak penting.',
          expression: 'menutup-diri',
          cue: 'Ayu langsung menggambar garis zig-zag di tepi halaman dan melirik ke jendela.',
        },
      },
    ],
  },
  {
    id: 'ay-b12',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 2,
    reply: {
      text: 'Kayaknya yang kubutuhin bukan jawaban pasti, tapi satu hal yang bisa kuselesaikan sampai tuntas, supaya aku tahu rasanya. Dan boleh coba dulu tanpa harus berarti aku menutup semua pintu.',
      expression: 'lega',
      cue: 'Ayu meletakkan pensil, menutup buku sketsa pelan, dan menarik napas panjang sambil menatap Dosen langsung.',
    },
    gate: { conditions: [{ type: 'level-min', value: 2 }], otherwise: 'ay-b12-alt' },
    choices: [
      {
        id: 'a', skillId: 'parafrase-ringkasan', best: true, next: 'ay-b13',
        text: 'Jadi kamu ingin menuntaskan satu hal tanpa langsung menutup pilihan lain. Tepat?',
        reaction: {
          text: 'Tepat, Bu. Mungkin begini: aku ambil satu aja, dashboard telemetri yang udah enam puluh persen. Versi kecilnya kuselesaikan dua minggu, lalu kutunjukin ke kakak tingkat.',
          expression: 'tersenyum',
          cue: 'Ayu mengangguk mantap dan menggambar kotak kecil di pojok halaman.',
        },
      },
      {
        id: 'b', skillId: 'afirmasi-kekuatan', next: 'ay-b13',
        text: 'Kamu paham dirimu cukup baik untuk tahu apa yang kamu butuhkan. Itu langkah matang.',
        reaction: {
          text: 'Makasih, Bu. Mungkin begini: aku ambil satu aja, dashboard telemetri yang sudah enam puluh persen, versi kecilnya dua minggu, terus kutunjukin ke kakak tingkat.',
          expression: 'tersenyum',
          cue: 'Ayu menegakkan badan, wajahnya cerah.',
        },
      },
      {
        id: 'c', skillId: 'refleksi-perasaan', options: RAGU, next: 'ay-b13',
        text: 'Ada keinginan untuk percaya pada diri sendiri lewat satu pengalaman yang selesai.',
        reaction: {
          text: 'Iya, Bu, aku pengin yakin sama diriku lewat satu hal yang beres. Mungkin dashboard telemetri yang enam puluh persen itu, versi kecil dua minggu, lalu kutunjukin ke kakak tingkat.',
          expression: 'tersenyum',
          cue: 'Ayu menatap Dosen sebentar, lalu menahan senyum sambil mengangguk.',
        },
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: TENSION,
        text: 'Kalau begitu berhenti saja mencoba hal baru mulai sekarang.',
      },
    ],
  },
  {
    id: 'ay-b12-alt',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Intinya aku butuh dikasih tahu mana yang terbaik. Habis itu aku tinggal jalanin, kan gampang.',
      expression: 'netral',
      cue: 'Ayu mengetuk-ngetukkan ujung pensil ke lutut sambil menatap langit-langit.',
    },
    choices: [
      {
        id: 'a', skillId: 'validasi-normalisasi', best: true, next: 'ay-b13',
        text: 'Ingin diberi kepastian itu wajar. Kita bisa mencari bentuknya pelan-pelan bersama.',
        reaction: {
          text: 'Makasih, Bu, pelan-pelan ya. Mungkin aku ambil satu aja: dashboard telemetri enam puluh persen, versi kecil dua minggu, lalu kutunjukin ke kakak tingkat.',
          expression: 'tersenyum',
          cue: 'Ayu menghela napas dan tersenyum lebih tenang.',
        },
      },
      {
        id: 'b', skillId: 'parafrase-ringkasan', next: 'ay-b13',
        text: 'Jadi yang kamu inginkan sekarang adalah kepastian arah supaya bisa langsung melangkah.',
        reaction: {
          text: 'Iya, kepastian arah, Bu. Tapi mungkin aku coba satu dulu: dashboard telemetri enam puluh persen, versi kecil dua minggu, tunjukin ke kakak tingkat.',
          expression: 'netral',
          cue: 'Ayu mengetuk-ngetuk pensil ke buku sambil berpikir.',
        },
      },
      {
        id: 'c', skillId: 'pertanyaan-terbuka', next: 'ay-b13',
        text: 'Kalau ada satu hal kecil yang bisa dicoba minggu ini, apa yang terlintas?',
        reaction: {
          text: 'Satu hal kecil minggu ini? Dashboard telemetri yang udah enam puluh persen, Bu. Versi kecilnya dua minggu, lalu kutunjukin ke kakak tingkat.',
          expression: 'tersenyum',
          cue: 'Ayu langsung menjawab dan menulis kata "dashboard" di pinggir halaman.',
        },
      },
      {
        id: 'd', skillId: 'meremehkan', next: 'ay-b13',
        text: 'Nanti juga ketahuan sendiri kalau sudah bekerja.',
        reaction: {
          text: 'Mungkin ya. Kita lihat aja nanti.',
          expression: 'menutup-diri',
          cue: 'Ayu mengangguk sopan, lalu membuka bukunya dan mulai menggambar lagi.',
        },
      },
    ],
  },
];
