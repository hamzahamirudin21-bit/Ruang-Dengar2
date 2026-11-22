/**
 * Naufal Hakim (mhs-15), adegan Ruang BK bagian pemahaman.
 * Simpul (urutan jalur): na-b6, na-b9, na-b8, na-b12, ditambah alternatif na-b9-alt, na-b8-alt, na-b12-alt.
 *
 * Titik sambung: masuk dari `na-b5` ke `na-b6`; keluar dari `na-b12` dan `na-b12-alt` ke `na-b13`
 * (berkas bk-rencana). Ketegangan memakai `na-tegang-bk` (berkas bk-rencana).
 *
 * Gerbang: `na-b8` (Momen_Terbuka) butuh trust >= 64, level >= 1, dan bendera `isyarat-diperhatikan`;
 * `na-b9` butuh trust >= 56; `na-b12` (inti kebutuhan, kedalaman 2) butuh level >= 1 dan trust >= 70 (level 2 baru terbuka setelah rencana).
 */
import type { StoryNode } from '../../engine/story/storyTypes';

const SCENE = 'bk';
const TENSION = 'na-tegang-bk';
const KECEWA = { reflectionNuance: 'kecewa-kesal' } as const;

export const MHS_15_BK_PEMAHAMAN_NODES: StoryNode[] = [
  {
    id: 'na-b6',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Kalau aku protes, nanti dikira cari perhatian. Jadi kusimpan aja. Lama-lama aku berhenti ngangkat tangan.',
      expression: 'menunduk',
      cue: 'Naufal merapikan sudut stiker di sampul laptop, lalu menekannya dengan kuku sampai tepinya rata.',
    },
    choices: [
      {
        id: 'a', skillId: 'refleksi-perasaan', best: true, options: KECEWA, next: 'na-b9',
        text: 'Kedengarannya kamu kecewa dan kesepian, sampai akhirnya berhenti mengangkat tangan.',
        reaction: {
          text: 'Kesepian ya... mungkin sedikit. Tapi udahlah. Yang lancar tuh bagian merakit. Yang macet pas nyampein ke teman-teman, itu aja.',
          expression: 'netral',
          cue: 'Naufal mengangkat bahu, lalu mengeratkan pelukannya pada laptop.',
        },
      },
      {
        id: 'b', skillId: 'parafrase-ringkasan', next: 'na-b9',
        text: 'Jadi bersuara terasa berisiko dianggap cari perhatian, dan akhirnya kamu memilih diam?',
        reaction: {
          text: 'Yap, kira-kira gitu. Diam lebih aman. Makanya bagian merakit aku lancar, bagian nyampein ke orang yang macet.',
          expression: 'netral',
          cue: 'Naufal mengangguk singkat, lalu memeluk laptopnya sedikit lebih erat.',
        },
      },
      {
        id: 'c', skillId: 'nasihat-dini', next: TENSION,
        text: 'Protes saja langsung di rapat. Orang yang diam memang selalu dilewati.',
      },
      {
        id: 'd', skillId: 'pertanyaan-tertutup', next: 'na-b9',
        text: 'Jadi kamu memang pasrah saja dilewati, begitu?',
        reaction: {
          text: 'Bukan pasrah. Cuma udah capek nyoba.',
          expression: 'waspada',
          cue: 'Naufal mengerutkan dahi dan mengeratkan pelukan pada laptop.',
        },
      },
    ],
  },
  {
    id: 'na-b8',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 2,
    reply: {
      text: 'Kemarin aku udah ngetik di catatan: "Besok nggak usah bawa usul lagi, biar mereka kerja sendiri." Belum kututup. Masih kebuka di laptop ini.',
      expression: 'tertegun',
      cue: 'Naufal membuka laptop sedikit, memperlihatkan satu baris kalimat di layar, lalu menutupnya lagi dengan perlahan. Suaranya hampir tidak terdengar.',
    },
    marks: ['momen-terbuka'],
    gate: {
      conditions: [
        { type: 'trust-min', value: 64 }, { type: 'level-min', value: 1 },
        { type: 'flag', flag: 'isyarat-diperhatikan' },
      ],
      otherwise: 'na-b8-alt',
    },
    onEnter: { setFlags: ['momen-terbuka'] },
    choices: [
      {
        id: 'a', skillId: 'parafrase-ringkasan', best: true, next: 'na-b12',
        text: 'Jadi kamu hampir berhenti bawa usul, karena rasanya nggak ada yang nampung. Tepat?',
        reaction: {
          text: 'Hm, tepat. Rasanya kayak ngomong ke ruang kosong. Yang kuharapin sih sederhana, lebih sering ditanggapi aja. Selebihnya belum bisa kujelasin.',
          expression: 'netral',
          cue: 'Naufal menutup laptopnya perlahan, lalu menaruh telapak tangan di atasnya.',
        },
      },
      {
        id: 'b', skillId: 'afirmasi-kekuatan', next: 'na-b12',
        text: 'Kamu berani nulis jujur soal kecewamu. Itu nggak gampang.',
        reaction: {
          text: 'Itu cuma catatan, Dosen, bukan keberanian. Tapi... makasih. Kalau ada yang kuharapin, ya lebih sering ditanggapi aja. Aku belum bisa jelasin lebih jauh.',
          expression: 'netral',
          cue: 'Naufal menaruh kedua telapak tangannya di atas laptop yang sudah tertutup, lalu menatap meja.',
        },
      },
      {
        id: 'c', skillId: 'pertanyaan-terbuka', next: 'na-b12',
        text: 'Waktu ngetik kalimat itu, kamu ngerasa apa?',
        reaction: {
          text: 'Jengkel, terus lelah. Abis itu hampa aja. Kayaknya yang kuinginin cuma lebih sering ditanggapi, itu aja dulu.',
          expression: 'lelah',
          cue: 'Naufal mengembuskan napas, menutup laptopnya perlahan, dan menaruh telapak tangan di atasnya.',
        },
      },
      {
        id: 'd', skillId: 'interogasi', next: TENSION,
        text: 'Kenapa kamu mau berhenti? Itu menyerah, kan?',
      },
    ],
  },
  {
    id: 'na-b8-alt',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Nggak ada apa-apa. Aku cuma perlu lebih sabar. Mungkin giliranku nanti.',
      expression: 'netral',
      cue: 'Naufal tersenyum tipis dan menyelipkan ujung kabel charger ke bawah laptop yang tetap terkunci rapat.',
    },
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'na-b12',
        text: 'Kalau kamu sabar dan giliranmu tiba, apa yang sebenarnya ingin kamu lihat terjadi?',
        reaction: {
          text: 'Yang ingin kulihat? Ya... ada yang nanggepin usulku. Itu aja. Lebih sering ditanggapi. Selebihnya aku belum bisa jelasin.',
          expression: 'netral',
          cue: 'Naufal melonggarkan pelukannya pada laptop dan menaruhnya di meja.',
        },
      },
      {
        id: 'b', skillId: 'validasi-normalisasi', next: 'na-b12',
        text: 'Nggak apa-apa kalau belum mau cerita lebih dalam. Kita jalan pelan aja.',
        reaction: {
          text: 'Hm, nggak dipaksa ya. Oke, itu nilai tambah. Yang bisa kubilang sekarang cuma satu: aku pengin lebih sering ditanggapi.',
          expression: 'netral',
          cue: 'Naufal mengembuskan napas, lalu melepas pelukannya dan menaruh laptop di meja.',
        },
      },
      {
        id: 'c', skillId: 'sampaikan-pengamatan', options: { observationTone: 'faktual' }, next: 'na-b12',
        text: 'Kamu masih meluk laptopmu erat, padahal ruangannya udah sepi.',
        reaction: {
          text: 'Hm, ketahuan. Kebiasaan aja, Dosen. Kalau dilepas rasanya kosong. Tapi yang kuinginin sekarang cuma lebih sering ditanggapi, itu aja.',
          expression: 'netral',
          cue: 'Naufal melirik laptop di pelukannya, lalu perlahan menurunkannya ke meja.',
        },
      },
      {
        id: 'd', skillId: 'meremehkan', next: 'na-b12',
        text: 'Pasti nanti ada gilirannya. Jangan terlalu dipikirkan.',
        reaction: {
          text: 'Iya. Mungkin.',
          expression: 'menutup-diri',
          cue: 'Naufal mengangguk datar dan menatap pintu.',
        },
      },
    ],
  },
  {
    id: 'na-b9',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Padahal waktu merakit aku paling hidup. Minggu lalu kubuat dudukan sensor dari tutup botol dan sisa pipa, jadi dalam satu sore. Tapi begitu harus presentasi, aku langsung kehabisan kata.',
      expression: 'tersenyum',
      cue: 'Mata Naufal sempat berbinar saat menyebut tutup botol, lalu pelukannya pada laptop menguat ketika menyebut presentasi.',
    },
    gate: { conditions: [{ type: 'trust-min', value: 56 }], otherwise: 'na-b9-alt' },
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', next: 'na-b8',
        text: 'Waktu dudukan itu jadi sore itu, bagian mana yang paling bikin kamu senang?',
        reaction: {
          text: 'Pas tutup botolnya masuk ke pipa dan langsung pas, Dosen. Klik, selesai. Itu aja udah cukup. Soal yang lain, nggak ada apa-apa, aku cuma perlu lebih sabar.',
          expression: 'netral',
          cue: 'Naufal tersenyum tipis sekilas, lalu memeluk laptopnya lagi dan menatap meja.',
        },
      },
      {
        id: 'b', skillId: 'refleksi-perasaan', best: true, options: KECEWA, next: 'na-b8',
        text: 'Kamu bangga sama karyamu, tapi kesal karena nggak sampai ke telinga kelompok.',
        reaction: {
          text: 'Bangga, ya, lumayan. Kesal... ah, nggak juga. Aku cuma perlu lebih sabar. Mungkin tinggal nunggu giliran.',
          expression: 'netral',
          cue: 'Naufal mengerutkan dahi sebentar, lalu mengeratkan pelukan pada laptop.',
        },
      },
      {
        id: 'c', skillId: 'pertanyaan-tertutup', next: 'na-b8',
        text: 'Jadi kamu memang lebih cocok jadi perakit daripada pembicara?',
        reaction: {
          text: 'Mungkin. Tapi itu kedengarannya kayak alasan buat terus nggak diajak bicara.',
          expression: 'menunduk',
          cue: 'Naufal mengusap sudut matanya yang kering dan tertawa kecil.',
        },
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: TENSION,
        text: 'Kalau begitu cukup berkarya saja dan biarkan orang lain yang presentasi.',
      },
    ],
  },
  {
    id: 'na-b9-alt',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Ya, merakit lancar kok. Yang agak macet cuma pas nyampeinnya ke teman-teman.',
      expression: 'netral',
      cue: 'Naufal mengangkat bahu dan memutar-mutar tutup pulpen di antara jari tanpa melepas laptop dari pelukannya.',
    },
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'na-b8',
        text: 'Dari bagian menyampaikan itu, mana yang paling bikin kamu tersendat?',
        reaction: {
          text: 'Pas harus ngomong di depan semua orang, Dosen. Kata-katanya kayak kabur. Tapi nggak apa-apa, aku cuma perlu lebih sabar aja.',
          expression: 'netral',
          cue: 'Naufal mengerutkan dahi dan mengeratkan pelukan pada laptop.',
        },
      },
      {
        id: 'b', skillId: 'parafrase-ringkasan', next: 'na-b8',
        text: 'Jadi bikinnya lancar, tapi membawanya ke kelompok terasa macet.',
        reaction: {
          text: 'Tepat. Bikin lancar, bawanya yang macet. Tapi ya udah, nggak ada apa-apa kok, mungkin aku cuma perlu lebih sabar.',
          expression: 'netral',
          cue: 'Naufal mengangguk singkat, lalu memeluk laptopnya lebih erat.',
        },
      },
      {
        id: 'c', skillId: 'validasi-normalisasi', next: 'na-b8',
        text: 'Membawa karya ke depan orang yang sering menyela memang nggak mudah.',
        reaction: {
          text: 'Hm, jarang ada yang ngerti bagian itu. Oke, makasih. Tapi nggak apa-apa kok, mungkin giliranku nanti, aku cuma perlu sabar.',
          expression: 'netral',
          cue: 'Naufal mengusap sudut matanya yang kering dan tertawa kecil.',
        },
      },
      {
        id: 'd', skillId: 'pertanyaan-tertutup', next: 'na-b8',
        text: 'Cuma itu saja yang bikin kamu gelisah?',
        reaction: {
          text: 'Iya, cuma itu.',
          expression: 'menutup-diri',
          cue: 'Naufal menjawab pendek sambil menatap sudut ruangan.',
        },
      },
    ],
  },
  {
    id: 'na-b12',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 2,
    reply: {
      text: 'Sebenernya aku nggak minta dipuji. Aku cuma mau satu usulku dicatat dan ditanggapi, sampai selesai kalimat, dengan namaku di sana.',
      expression: 'lega',
      cue: 'Naufal akhirnya melepas pelukan, meletakkan laptop di meja, dan menaruh kedua telapak tangan di atasnya.',
    },
    gate: { conditions: [{ type: 'level-min', value: 1 }, { type: 'trust-min', value: 70 }], otherwise: 'na-b12-alt' },
    choices: [
      {
        id: 'a', skillId: 'parafrase-ringkasan', best: true, next: 'na-b13',
        text: 'Jadi kamu butuh usulmu didengar sampai habis, dicatat, dan diakui sebagai milikmu.',
        reaction: {
          text: 'Tepat banget. Makanya kupikir, sebelum rapat Jumat aku tulis satu usul aja di dokumen bersama, pakai namaku. Ketua kelompok kuminta bacain dulu sebelum yang lain nyahut.',
          expression: 'netral',
          cue: 'Naufal membuka laptop, mengetik satu baris judul, lalu menatap Dosen sambil membiarkan layarnya terbuka.',
        },
      },
      {
        id: 'b', skillId: 'afirmasi-kekuatan', next: 'na-b13',
        text: 'Kamu tahu persis apa yang kamu butuhin. Itu bukan permintaan berlebihan kok.',
        reaction: {
          text: 'Hm, makasih. Jarang ada yang bilang gitu. Mungkin aku bisa mulai dari yang kecil: satu usul aja di dokumen bersama, lengkap namaku, dan ketua kelompok bacain dulu sebelum yang lain nyahut.',
          expression: 'netral',
          cue: 'Naufal membuka laptop dan mengetik satu baris judul, lalu memutar layarnya sedikit ke arah Dosen.',
        },
      },
      {
        id: 'c', skillId: 'refleksi-perasaan', options: KECEWA, next: 'na-b13',
        text: 'Ada keinginan sederhana untuk terlihat, dan kecewa karena belum kejadian.',
        reaction: {
          text: 'Ya... itu. Terlihat. Jadi mungkin sebelum rapat Jumat aku taruh satu usul di dokumen bersama, ada namaku, dan ketua yang bacain duluan biar nggak langsung disahut.',
          expression: 'netral',
          cue: 'Naufal membuka laptop, mengetik judul sebuah dokumen, lalu menatap Dosen dengan layar dibiarkan terbuka.',
        },
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: TENSION,
        text: 'Kalau begitu minta saja Dito minta maaf di depan kelompok.',
      },
    ],
  },
  {
    id: 'na-b12-alt',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Intinya aku mau lebih sering ditanggapi. Itu aja. Aku belum bisa jelasin lebih jauh.',
      expression: 'netral',
      cue: 'Naufal menggeser laptop di pangkuan dan menatap lantai sambil menggigit bagian dalam pipinya.',
    },
    choices: [
      {
        id: 'a', skillId: 'validasi-normalisasi', best: true, next: 'na-b13',
        text: 'Ingin ditanggapi itu wajar. Nggak perlu dijelasin semuanya sekarang.',
        reaction: {
          text: 'Oke, makasih. Kalau gitu satu langkah kecil aja: sebelum rapat Jumat aku tulis satu usul di dokumen bersama pakai namaku, dan minta ketua bacain dulu.',
          expression: 'netral',
          cue: 'Naufal membuka laptop, mengetik satu baris judul, dan membiarkan layarnya terbuka.',
        },
      },
      {
        id: 'b', skillId: 'parafrase-ringkasan', next: 'na-b13',
        text: 'Jadi yang paling kamu mau sekarang itu lebih sering ditanggapi.',
        reaction: {
          text: 'Ya, itu. Makanya mungkin aku coba satu usul tertulis di dokumen bersama sebelum rapat Jumat, ada namaku. Ketua kelompok yang bacain, biar nggak keburu disahut.',
          expression: 'netral',
          cue: 'Naufal membuka laptop, mengetik judul dokumen, lalu menatap Dosen sambil membiarkan layarnya terbuka.',
        },
      },
      {
        id: 'c', skillId: 'pertanyaan-terbuka', next: 'na-b13',
        text: 'Kalau ada satu kesempatan kecil untuk ditanggapi minggu ini, seperti apa?',
        reaction: {
          text: 'Satu kesempatan kecil... mungkin usul tertulis di dokumen bersama sebelum rapat Jumat, lengkap sama namaku. Terus ketua kelompok bacain dulu sebelum yang lain nimbrung.',
          expression: 'netral',
          cue: 'Naufal membuka laptop dan mengetik satu baris di dokumen kosong, lalu membiarkan layarnya terbuka.',
        },
      },
      {
        id: 'd', skillId: 'meremehkan', next: 'na-b13',
        text: 'Nanti juga ditanggapi kalau kamu lebih sering bicara.',
        reaction: {
          text: 'Ya. Mungkin saja.',
          expression: 'menutup-diri',
          cue: 'Naufal menarik napas panjang dan memeluk laptopnya lagi.',
        },
      },
    ],
  },
];
