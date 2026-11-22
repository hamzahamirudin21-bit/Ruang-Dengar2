/**
 * Maya Puspita (mhs-11), adegan Ruang BK bagian pemahaman.
 * Simpul (urutan jalur): ma-b6, ma-b9, ma-b8, ma-b12, ditambah alternatif ma-b9-alt, ma-b8-alt, ma-b12-alt.
 *
 * Titik sambung:
 *  - masuk dari `ma-b5` (berkas bk-eksplorasi) ke `ma-b6`.
 *  - keluar dari `ma-b12` dan `ma-b12-alt` ke `ma-b13` (berkas bk-rencana).
 *  - Ketegangan memakai `ma-tegang-bk` (berkas bk-rencana).
 *
 * Gerbang: `ma-b8` (Momen_Terbuka) butuh kepercayaan tinggi, level >= 1, dan bendera `telinga-diperhatikan`
 * (dari ma-l2); `ma-b9` butuh kepercayaan sedang; `ma-b12` (inti kebutuhan, kedalaman 2) butuh level >= 1.
 * Bila gagal, alur memakai simpul alternatif yang tetap menuju tulang punggung cerita.
 */
import type { StoryNode } from '../../engine/story/storyTypes';

const SCENE = 'bk';
const TENSION = 'ma-tegang-bk';

export const MAYA_BK_PEMAHAMAN_NODES: StoryNode[] = [
  {
    id: 'ma-b6',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Kalau datang tanpa pertanyaan yang matang, nanti dikira belum belajar. Jadi kutunggu sampai yakin. Yakinnya nggak pernah datang.',
      expression: 'menunduk',
      cue: 'Maya menutup buku hijaunya dan menahan sampulnya dengan kedua telapak, seolah menjaga isinya tetap rapi.',
    },
    choices: [
      {
        id: 'a', skillId: 'parafrase-ringkasan', best: true, next: 'ma-b9',
        text: 'Jadi nunggu matang terasa lebih aman, tapi pertanyaannya jadi nggak pernah sampai?',
        reaction: {
          text: 'Iya, Bu, persis. Nunggu matang itu terasa aman, tapi akhirnya pertanyaannya nggak pernah sampai ke siapa-siapa. Padahal aku suka tukar pikiran asal berdua dan nggak buru-buru. Sekali pernah dua jam sama kakak tingkat.',
          expression: 'tersenyum',
          cue: 'Maya mengangguk, lalu sudut bibirnya naik sedikit dan genggamannya pada sampul buku mengendur.',
        },
      },
      {
        id: 'b', skillId: 'validasi-normalisasi', next: 'ma-b9',
        text: 'Banyak orang nunggu yakin dulu sebelum bertanya. Itu bisa dimengerti kok.',
        reaction: {
          text: 'Makasih, Bu. Sebenarnya aku suka tukar pikiran asal berdua dan nggak buru-buru. Pernah sekali dua jam sama kakak tingkat. Tapi biasanya ya kutulis sendiri aja, lebih tenang.',
          expression: 'netral',
          cue: 'Maya mengusap sampul buku hijaunya pelan, lalu mengangkat bahu ringan.',
        },
      },
      {
        id: 'c', skillId: 'nasihat-dini', next: TENSION,
        text: 'Tanya aja dulu, jangan nunggu matang. Mulai besok ya.',
      },
      {
        id: 'd', skillId: 'pertanyaan-tertutup', next: 'ma-b9',
        text: 'Kamu takut dianggap bodoh, ya?',
        reaction: {
          text: 'Bukan bodoh persisnya. Lebih ke takut nyita waktu orang.',
          expression: 'waspada',
          cue: 'Maya mengerutkan dahi sedikit, lalu menggeser buku ke tepi meja.',
        },
      },
    ],
  },
  {
    id: 'ma-b8',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 2,
    reply: {
      text: 'Dua minggu lalu aku sudah sampai di depan pintu pembimbing, tinggal ngetuk. Terus dari dalam ada yang tertawa, dan aku balik badan. Sejak itu penutup telinga terasa lebih gampang daripada dengar tawa orang.',
      expression: 'tertegun',
      cue: 'Suara Maya hampir berbisik. Ia menahan penutup telinga di lehernya dengan kedua tangan dan menatap lantai.',
    },
    marks: ['momen-terbuka'],
    gate: {
      conditions: [
        { type: 'trust-min', value: 69 }, { type: 'level-min', value: 1 },
        { type: 'flag', flag: 'telinga-diperhatikan' },
      ],
      otherwise: 'ma-b8-alt',
    },
    onEnter: { setFlags: ['momen-terbuka'] },
    choices: [
      {
        id: 'a', skillId: 'refleksi-perasaan', best: true, next: 'ma-b12',
        options: { reflectionNuance: 'ragu-kurang-percaya' },
        text: 'Kamu hampir ngetuk, lalu tawa itu bikin ragu pertanyaanmu pantas didengar.',
        reaction: {
          text: 'Iya, Bu, persis. Habis itu aku mikir, jangan-jangan pertanyaanku memang nggak pantas didengar. Padahal aku tahu itu belum tentu benar.',
          expression: 'menunduk',
          cue: 'Suara Maya hampir berbisik. Ia menahan penutup telinga di lehernya dengan kedua tangan dan menatap lantai.',
        },
      },
      {
        id: 'b', skillId: 'afirmasi-kekuatan', next: 'ma-b12',
        text: 'Kamu sempat sampai di depan pintu itu. Berarti pertanyaanmu penting banget buatmu.',
        reaction: {
          text: 'Makasih, Bu. Aku sendiri baru sadar, ya, aku udah sampai di depan pintu. Tinggal selangkah lagi, tapi kakiku nggak mau maju.',
          expression: 'menunduk',
          cue: 'Maya mengangkat wajah sedikit, lalu menunduk lagi sambil mengeratkan pegangan pada penutup telinganya.',
        },
      },
      {
        id: 'c', skillId: 'pertanyaan-terbuka', next: 'ma-b12',
        text: 'Pas balik badan dari pintu itu, apa yang terlintas di pikiranmu?',
        reaction: {
          text: 'Cuma satu, Bu: "ya udah, tulis aja nanti". Terus aku jalan cepat ke lab, pasang penutup telinga, dan pura-pura sibuk.',
          expression: 'menunduk',
          cue: 'Maya menjawab nyaris berbisik, matanya tertuju pada ujung sepatunya.',
        },
      },
      {
        id: 'd', skillId: 'interogasi', next: TENSION,
        text: 'Siapa yang tertawa waktu itu? Dosen mana yang kamu maksud?',
      },
    ],
  },
  {
    id: 'ma-b8-alt',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Nggak ada yang khusus, Bu. Aku cuma butuh tempat kerja yang lebih sepi, itu aja.',
      expression: 'netral',
      cue: 'Maya tersenyum sopan dan menaikkan satu sisi penutup telinganya setengah jalan ke atas.',
    },
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'ma-b12',
        text: 'Kalau tempat kerjamu sudah sepi, apa yang mau kamu kerjakan dulu?',
        reaction: {
          text: 'Beresin grafik yang kemarin, Bu, sama ngerapiin catatan buat ditanyain. Selama sepi, kerjaku lancar.',
          expression: 'netral',
          cue: 'Maya menaikkan satu sisi penutup telinganya setengah jalan sambil menjawab dengan tenang.',
        },
      },
      {
        id: 'b', skillId: 'validasi-normalisasi', next: 'ma-b12',
        text: 'Nggak apa-apa bahas yang ringan dulu. Kita ikuti tempomu.',
        reaction: {
          text: 'Makasih, Bu. Aku memang lebih nyaman kalau pelan-pelan gini.',
          expression: 'lega',
          cue: 'Maya tersenyum sopan dan bahunya turun sedikit.',
        },
      },
      {
        id: 'c', skillId: 'sampaikan-pengamatan', options: { observationTone: 'faktual' }, next: 'ma-b12',
        text: 'Penutup telinganya naik lagi sedikit pas kamu menjawab tadi.',
        reaction: {
          text: 'Eh, iya? Refleks aja kali, Bu. Biar kepalaku tenang sambil jawab.',
          expression: 'netral',
          cue: 'Maya menyentuh penutup telinganya sekilas, lalu menurunkan tangan dan tersenyum sopan.',
        },
      },
      {
        id: 'd', skillId: 'meremehkan', next: 'ma-b12',
        text: 'Semua orang butuh tempat sepi. Itu bukan masalah besar.',
        reaction: {
          text: 'Iya, benar. Mungkin aku memang kebanyakan mikir.',
          expression: 'menutup-diri',
          cue: 'Maya mengangguk kecil dan membuka bukunya pada halaman kosong, tanpa menulis apa pun.',
        },
      },
    ],
  },
  {
    id: 'ma-b9',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Sebenarnya aku suka tukar pikiran, asal berdua dan nggak buru-buru. Pernah sekali sama kakak tingkat, dua jam bahas sensor kelembapan yang melenceng. Rasanya ringan banget.',
      expression: 'tersenyum',
      cue: 'Sudut bibir Maya naik sedikit, dan genggamannya pada sampul buku mengendur.',
    },
    gate: { conditions: [{ type: 'trust-min', value: 65 }], otherwise: 'ma-b9-alt' },
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'ma-b8',
        text: 'Apa yang bikin diskusi dua jam itu terasa ringan buatmu?',
        reaction: {
          text: 'Nggak ada yang buru-buru, Bu, dan lawan bicaranya mau nunggu aku nyusun kalimat. Pelan-pelan gitu, kepalaku nggak riuh.',
          expression: 'tersenyum',
          cue: 'Maya menegakkan punggungnya sedikit dan genggamannya pada buku hijau melonggar.',
        },
      },
      {
        id: 'b', skillId: 'parafrase-ringkasan', next: 'ma-b8',
        text: 'Kamu senang tukar ide, asal ruangnya tenang dan nggak buru-buru.',
        reaction: {
          text: 'Iya, Bu, itu intinya. Ruangnya tenang, orangnya satu atau dua, dan nggak ada yang nungguin jawabanku dengan buru-buru.',
          expression: 'tersenyum',
          cue: 'Maya mengangguk cepat, lalu meletakkan pensil sejajar dengan tepi buku.',
        },
      },
      {
        id: 'c', skillId: 'pertanyaan-tertutup', next: 'ma-b8',
        text: 'Jadi sebenarnya kamu nggak anti ngobrol, ya?',
        reaction: {
          text: 'Nggak anti, kok. Cuma milih-milih kapan dan sama siapa.',
          expression: 'netral',
          cue: 'Maya tertawa kecil tanpa suara dan merapikan rambut ke belakang telinga.',
        },
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: TENSION,
        text: 'Kalau gitu ajak kakak tingkat itu lagi. Beres, kan?',
      },
    ],
  },
  {
    id: 'ma-b9-alt',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Kadang pengin cerita soal data ke seseorang, tapi biasanya cukup kutulis sendiri. Lebih tenang gitu.',
      expression: 'netral',
      cue: 'Maya mengangkat bahu ringan dan menepuk sampul bukunya, seakan menunjukkan tempat cerita itu biasa berakhir.',
    },
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'ma-b8',
        text: 'Kapan terakhir kamu ingin cerita soal data itu ke seseorang?',
        reaction: {
          text: 'Kemarin sore, Bu, pas grafik kelembapan tiba-tiba melenceng. Pengin nanya, tapi ujung-ujungnya kutulis aja di buku.',
          expression: 'netral',
          cue: 'Maya menepuk sampul bukunya, seakan menunjukkan tempat cerita itu biasa berakhir.',
        },
      },
      {
        id: 'b', skillId: 'parafrase-ringkasan', next: 'ma-b8',
        text: 'Jadi nulis sendiri terasa lebih tenang, meski kadang ingin cerita.',
        reaction: {
          text: 'Iya, begitu, Bu. Nulis itu tenang, tapi kadang ya pengin ada yang dengar juga.',
          expression: 'netral',
          cue: 'Maya memutar pensil sekali di antara jarinya lalu menaruhnya kembali di meja.',
        },
      },
      {
        id: 'c', skillId: 'validasi-normalisasi', next: 'ma-b8',
        text: 'Menulis buat menata pikiran itu cara yang valid. Nggak ada yang salah.',
        reaction: {
          text: 'Makasih, Bu. Aku memang nulis biar pikiranku rapi dulu, baru kutentuin mau diapain.',
          expression: 'netral',
          cue: 'Maya mengangkat bahu ringan dan menyentuh sampul buku hijaunya sekali.',
        },
      },
      {
        id: 'd', skillId: 'pertanyaan-tertutup', next: 'ma-b8',
        text: 'Berarti kamu memang nggak butuh teman diskusi, ya?',
        reaction: {
          text: 'Butuh sih... kadang. Tapi ya sudah, nggak apa-apa.',
          expression: 'menutup-diri',
          cue: 'Maya menjawab singkat dan menurunkan pandangan ke bukunya.',
        },
      },
    ],
  },
  {
    id: 'ma-b12',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 2,
    reply: {
      text: 'Mungkin yang kumau sederhana: waktu tetap tiap minggu buat bertanya, dan boleh kutulis dulu. Jadi aku nggak perlu ngetuk pintu sambil nebak suasana.',
      expression: 'lega',
      cue: 'Maya meletakkan penutup telinga di meja, membuka buku ke halaman kosong, dan menarik napas panjang.',
    },
    gate: { conditions: [{ type: 'level-min', value: 1 }], otherwise: 'ma-b12-alt' },
    choices: [
      {
        id: 'a', skillId: 'parafrase-ringkasan', best: true, next: 'ma-b13',
        text: 'Jadi: jadwal tetap, pertanyaan boleh ditulis dulu, tanpa nebak suasana. Pas begitu?',
        reaction: {
          text: 'Pas, Bu. Biar nyata, mulainya yang kecil aja: Kamis sore, dua puluh menit, di ruang sunyi. Sehari sebelumnya aku kirim tiga pertanyaan tertulis dulu.',
          expression: 'netral',
          cue: 'Maya menulis "Kamis 16.00, 20 menit" di halaman kosong, lalu mengetuk garis bawahnya dua kali dengan pensil.',
        },
      },
      {
        id: 'b', skillId: 'afirmasi-kekuatan', next: 'ma-b13',
        text: 'Kamu tahu persis bentuk bantuan yang cocok buatmu. Itu modal besar.',
        reaction: {
          text: 'Makasih, Bu. Makanya aku usul mulai kecil: Kamis sore, dua puluh menit di ruang sunyi begini, dan tiga pertanyaanku kukirim tertulis sehari sebelumnya.',
          expression: 'tersenyum',
          cue: 'Maya menulis "Kamis 16.00" di halaman kosong buku hijaunya, lalu menggarisbawahinya pelan.',
        },
      },
      {
        id: 'c', skillId: 'refleksi-perasaan', next: 'ma-b13',
        options: { reflectionNuance: 'lelah-kewalahan' },
        text: 'Nebak suasana tiap kali itu melelahkan, dan kamu ingin jalur yang lebih pasti.',
        reaction: {
          text: 'Iya, Bu, capek nebak-nebak. Jadi jalurnya kubikin pasti: Kamis sore, dua puluh menit, di ruang sunyi, dengan tiga pertanyaan tertulis yang kukirim sehari sebelumnya.',
          expression: 'lega',
          cue: 'Maya menarik napas lega, lalu menulis "Kamis 16.00, 20 menit" dan mengetuk garis bawahnya dua kali.',
        },
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: TENSION,
        text: 'Kalau gitu datangi pembimbing tiap hari aja. Biasakan.',
      },
    ],
  },
  {
    id: 'ma-b12-alt',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Mungkin aku cuma perlu lebih sering ditanya duluan, bukan ngetuk sendiri. Bentuk lengkapnya belum kutahu.',
      expression: 'netral',
      cue: 'Maya menggerakkan pensil pelan di tepi halaman kosong, menggambar garis tanpa makna.',
    },
    choices: [
      {
        id: 'a', skillId: 'validasi-normalisasi', best: true, next: 'ma-b13',
        text: 'Belum tahu bentuk lengkapnya itu wajar. Santai aja, nggak perlu buru-buru.',
        reaction: {
          text: 'Makasih, Bu. Tapi sebenernya aku kepikiran yang kecil dulu: Kamis sore, dua puluh menit, di ruang sunyi, dengan tiga pertanyaan tertulis yang kukirim sehari sebelumnya.',
          expression: 'netral',
          cue: 'Maya berhenti menggambar garis di tepi halaman, lalu menulis "Kamis 16.00" dengan hati-hati.',
        },
      },
      {
        id: 'b', skillId: 'parafrase-ringkasan', next: 'ma-b13',
        text: 'Jadi kamu berharap ada yang membuka pintu lebih dulu.',
        reaction: {
          text: 'Iya, kira-kira begitu, Bu. Biar nggak menggantung, aku usul yang kecil: Kamis sore, dua puluh menit, ruang sunyi, dan tiga pertanyaan tertulis kukirim sehari sebelumnya.',
          expression: 'netral',
          cue: 'Maya mengangguk, lalu menulis "Kamis 16.00, 20 menit" di halaman kosong dan mengetuk garis bawahnya.',
        },
      },
      {
        id: 'c', skillId: 'pertanyaan-terbuka', next: 'ma-b13',
        text: 'Kalau ada satu bentuk "ditanya duluan" yang nyaman, kira-kira seperti apa?',
        reaction: {
          text: 'Jadwal tetap, Bu. Kamis sore dua puluh menit di ruang sunyi, dan pertanyaanku boleh kutulis dulu, kukirim sehari sebelumnya, tiga biji.',
          expression: 'netral',
          cue: 'Maya berpikir sejenak, lalu menulis "Kamis 16.00, 20 menit" dan menggarisbawahinya dua kali.',
        },
      },
      {
        id: 'd', skillId: 'meremehkan', next: 'ma-b13',
        text: 'Nanti juga ada waktunya sendiri. Nggak usah dipikirin.',
        reaction: {
          text: 'Mungkin ya. Lihat nanti aja.',
          expression: 'menutup-diri',
          cue: 'Maya mengangguk sopan, lalu menutup bukunya perlahan.',
        },
      },
    ],
  },
];

