/**
 * Hendra Wijaya (mhs-08), adegan Ruang BK bagian pemahaman.
 * Simpul (urutan jalur): he-b6, he-b9, he-b8, he-b12, ditambah alternatif he-b9-alt, he-b8-alt, he-b12-alt.
 *
 * Titik sambung:
 *  - masuk dari `he-b5` (berkas bk-eksplorasi) ke `he-b6`.
 *  - keluar dari `he-b12` dan `he-b12-alt` ke `he-b13` (berkas bk-rencana).
 *  - Ketegangan memakai `he-tegang-bk` (berkas bk-rencana).
 *
 * Gerbang: `he-b8` (Momen_Terbuka) butuh trust >= HENDRA_B8_TRUST_MIN, level >= 1, dan bendera
 * `isyarat-diperhatikan` (dari he-l2); `he-b9` butuh trust >= HENDRA_B9_TRUST_MIN;
 * `he-b12` (inti kebutuhan, kedalaman 2) butuh level >= 2.
 * Bila gagal, alur memakai simpul alternatif yang tetap menuju tulang punggung cerita.
 */
import type { StoryNode } from '../../engine/story/storyTypes';

const SCENE = 'bk';
const TENSION = 'he-tegang-bk';
const LELAH = { reflectionNuance: 'lelah-kewalahan' } as const;

export const HENDRA_B9_TRUST_MIN = 60;
export const HENDRA_B8_TRUST_MIN = 68;

export const HENDRA_BK_PEMAHAMAN_NODES: StoryNode[] = [
  {
    id: 'he-b6',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Kalau aku bilang nanti dulu, rasanya kayak bukan teman yang bisa diandalkan lagi.',
      expression: 'cemas',
      cue: 'Hendra memutar-mutar cincin karet di pergelangan tangannya, lalu berhenti dan meluruskan jarinya di atas lutut.',
    },
    choices: [
      {
        id: 'a', skillId: 'parafrase-ringkasan', best: true, next: 'he-b9',
        reaction: {
          text: 'Iya, Dosen, pas banget. Kalau nggak jadi andalan, aku nggak tahu tempatku di mana.',
          expression: 'tertegun',
          cue: 'Hendra terdiam sebentar, lalu menatap sampul buku catatannya.',
        },
        text: 'Jadi menunda permintaan terasa kayak kehilangan tempatmu sebagai andalan teman?',
      },
      {
        id: 'b', skillId: 'validasi-normalisasi', next: 'he-b9',
        reaction: {
          text: 'Hehe, ternyata ada namanya ya, Dosen. Lega dengernya, kukira aku aja yang lebay.',
          expression: 'lega',
          cue: 'Hendra tertawa kecil dan bahunya turun sedikit.',
        },
        text: 'Wajar kalau berat. Orang yang suka membantu sering sungkan bikin orang kecewa.',
      },
      {
        id: 'c', skillId: 'nasihat-dini', next: TENSION,
        text: 'Latihan aja bilang nggak ke semua orang mulai besok. Itu satu-satunya cara.',
      },
      {
        id: 'd', skillId: 'pertanyaan-tertutup', next: 'he-b9',
        text: 'Jadi kamu takut kehilangan teman, begitu?',
        reaction: {
          text: 'Bukan takut kehilangan juga... ya, mungkin dikit gitu sih.',
          expression: 'waspada',
          cue: 'Hendra tertawa kecil, tetapi pandangannya melayang ke arah pintu.',
        },
      },
    ],
  },
  {
    id: 'he-b8',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 2,
    reply: {
      text: 'Tiap ada yang minta tolong, jempolku udah ngetik "maaf, aku lagi kejar tugas". Terus kuhapus dan kuganti jadi "siap". Tenggat casing-ku Jumat, filenya aja belum kubuka.',
      expression: 'tertegun',
      cue: 'Hendra menyodorkan layar ponselnya, menunjukkan kolom ketik yang berisi kalimat setengah terhapus, lalu menariknya kembali dengan suara yang jauh lebih pelan.',
    },
    marks: ['momen-terbuka'],
    gate: {
      conditions: [
        { type: 'trust-min', value: HENDRA_B8_TRUST_MIN }, { type: 'level-min', value: 1 },
        { type: 'flag', flag: 'isyarat-diperhatikan' },
      ],
      otherwise: 'he-b8-alt',
    },
    onEnter: { setFlags: ['momen-terbuka'] },
    choices: [
      {
        id: 'a', skillId: 'refleksi-perasaan', best: true, options: LELAH, next: 'he-b12',
        reaction: {
          text: 'Iya, Dosen. Capek nahan, tapi jujur lebih takut casing-ku nggak kelar.',
          expression: 'tertegun',
          cue: 'Hendra menunduk dan menggenggam ponselnya erat tanpa menyalakannya.',
        },
        text: 'Kamu ingin menolak, tapi capek menahan diri dan khawatir tugasmu terbengkalai.',
      },
      {
        id: 'b', skillId: 'afirmasi-kekuatan', next: 'he-b12',
        reaction: {
          text: 'Makasih, Dosen. Aku sendiri nggak nyangka bisa nunjukin ini. Jempolku aja masih agak gemetar.',
          expression: 'menunduk',
          cue: 'Hendra menatap jempolnya dan menyembunyikannya di bawah genggaman tangan kiri.',
        },
        text: 'Kamu berani nunjukin ini ke aku. Itu nggak mudah buat orang yang biasa melayani.',
      },
      {
        id: 'c', skillId: 'pertanyaan-terbuka', next: 'he-b12',
        reaction: {
          text: 'Rasanya nyesek dikit, Dosen. Kayak ada yang mau keluar, terus kutelan lagi.',
          expression: 'menunduk',
          cue: 'Hendra menyentuh dadanya sekilas dan menghela napas pendek.',
        },
        text: 'Saat kalimat "maaf, aku lagi kejar tugas" itu terhapus, apa yang kamu rasakan?',
      },
      {
        id: 'd', skillId: 'interogasi', next: TENSION,
        text: 'Kenapa kamu hapus terus? Tinggal kirim aja, kan?',
      },
    ],
  },
  {
    id: 'he-b8-alt',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Ah, nggak ada apa-apa, cuma perlu atur waktu lebih disiplin aja. Gampang itu.',
      expression: 'netral',
      cue: 'Hendra tersenyum lebar, tetapi tangannya menekan ponsel yang baru bergetar ke dalam saku.',
    },
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'he-b12',
        reaction: {
          text: 'Tugasku sendiri dulu, Dosen. Itu aja kayaknya yang pertama.',
          expression: 'netral',
          cue: 'Hendra tersenyum tipis dan memandang meja tanpa banyak menambahkan.',
        },
        text: 'Kalau waktunya sudah rapi, apa yang sebenarnya ingin kamu kerjakan lebih dulu?',
      },
      {
        id: 'b', skillId: 'validasi-normalisasi', next: 'he-b12',
        reaction: {
          text: 'Makasih, Dosen. Pelan-pelan gini lebih enak buatku.',
          expression: 'lega',
          cue: 'Hendra mengangguk sambil menghela napas pelan.',
        },
        text: 'Nggak apa-apa kalau belum mau bahas lebih dalam. Kita jalan pelan aja.',
      },
      {
        id: 'c', skillId: 'sampaikan-pengamatan', options: { observationTone: 'faktual' }, next: 'he-b12',
        reaction: {
          text: 'Oh, itu... nggak sengaja, Dosen. Lagi pengin fokus ngobrol sama Dosen aja.',
          expression: 'waspada',
          cue: 'Hendra menepuk saku tempat ponselnya disimpan, lalu menatap Dosen sedikit canggung.',
        },
        text: 'Kamu tadi masukin ponsel ke saku pas bergetar, padahal belum kamu baca.',
      },
      {
        id: 'd', skillId: 'meremehkan', next: 'he-b12',
        text: 'Kamu pasti bisa. Orang selincah kamu mana mungkin keteteran.',
        reaction: {
          text: 'Hehe, iya juga. Mungkin akunya aja yang kebanyakan mikir.',
          expression: 'menutup-diri',
          cue: 'Hendra tertawa pendek lalu merogoh saku untuk melihat ponselnya lagi.',
        },
      },
    ],
  },
  {
    id: 'he-b9',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Padahal aku paling seneng kalau nozzle mampet. Kemarin printer lab mati tiga hari, ketemu penyebabnya filamen lembap. Tapi kalau ditanya tugasku sendiri, aku malah bingung mulai dari mana.',
      expression: 'tersenyum',
      cue: 'Mata Hendra menyala saat menyebut nozzle, lalu pundaknya turun ketika kalimatnya sampai pada tugas pribadi.',
    },
    gate: { conditions: [{ type: 'trust-min', value: HENDRA_B9_TRUST_MIN }], otherwise: 'he-b9-alt' },
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'he-b8',
        reaction: {
          text: 'Pas ketemu penyebabnya, Dosen! Kayak teka-teki beres. Printernya nyala lagi, aku sampai loncat kecil.',
          expression: 'tersenyum',
          cue: 'Hendra tertawa lepas dan memperagakan lompatan kecil dengan kedua tangannya.',
        },
        text: 'Saat menemukan filamen yang lembap itu, apa yang paling membuatmu puas?',
      },
      {
        id: 'b', skillId: 'refleksi-perasaan', options: LELAH, next: 'he-b8',
        reaction: {
          text: 'Iya, Dosen, kontras banget ya. Alat orang itu seru, giliran punyaku kayak berat dibuka.',
          expression: 'netral',
          cue: 'Hendra menggaruk dagu dan terkekeh pelan dengan mata menerawang.',
        },
        text: 'Kamu semangat benerin alat orang lain, tapi buat dirimu sendiri terasa melelahkan.',
      },
      {
        id: 'c', skillId: 'pertanyaan-tertutup', next: 'he-b8',
        text: 'Jadi kamu lebih suka bantu orang daripada ngerjain tugas sendiri?',
        reaction: {
          text: 'Hmm, kedengarannya gitu ya. Tapi aku mau tugasku kelar juga, sumpah.',
          expression: 'menunduk',
          cue: 'Hendra mengusap tengkuk dan tertawa tanpa suara.',
        },
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: TENSION,
        text: 'Kalau gitu berhenti aja benerin printer orang lain dan fokus ke tugasmu.',
      },
    ],
  },
  {
    id: 'he-b9-alt',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Ya, urusan mesin lancar kok. Tugas pribadiku aja yang agak molor, nanti kukejar.',
      expression: 'netral',
      cue: 'Hendra mengangkat bahu ringan sambil mengelap telapak tangan ke celananya.',
    },
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'he-b8',
        reaction: {
          text: 'Mulainya, Dosen. Begitu duduk, ada aja yang manggil. Jadi bagian awalnya nggak pernah jadi.',
          expression: 'netral',
          cue: 'Hendra menggeser buku catatannya sedikit dan mengangkat bahu.',
        },
        text: 'Dari tugas yang molor itu, bagian mana yang paling mengganjal?',
      },
      {
        id: 'b', skillId: 'parafrase-ringkasan', next: 'he-b8',
        reaction: {
          text: 'Iya, Dosen, persis. Mesin lancar, tugas pribadiku yang ketinggalan.',
          expression: 'netral',
          cue: 'Hendra mengangguk sambil menunjuk printer di sudut ruangan.',
        },
        text: 'Jadi urusan mesin aman, sedangkan tugas pribadimu yang tertunda.',
      },
      {
        id: 'c', skillId: 'validasi-normalisasi', next: 'he-b8',
        reaction: {
          text: 'Berat, Dosen. Kadang malam baru sempat pegang punyaku, itu pun udah ngantuk.',
          expression: 'lelah',
          cue: 'Hendra mengucek matanya dan menguap kecil.',
        },
        text: 'Mengurus alat banyak orang sambil mengejar tugas sendiri memang berat.',
      },
      {
        id: 'd', skillId: 'pertanyaan-tertutup', next: 'he-b8',
        text: 'Cuma itu aja yang menahanmu?',
        reaction: {
          text: 'Iya, cuma itu.',
          expression: 'menutup-diri',
          cue: 'Hendra tersenyum seperti biasa dan melirik ponselnya yang menyala.',
        },
      },
    ],
  },
  {
    id: 'he-b12',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 2,
    reply: {
      text: 'Kayaknya aku cuma pengin boleh bilang "nanti dulu" tanpa dikira pelit, dan punya waktu buat tugasku sendiri.',
      expression: 'lega',
      cue: 'Hendra meletakkan ponsel menelungkup di meja, menarik napas dalam, dan untuk pertama kalinya duduk bersandar penuh.',
    },
    gate: { conditions: [{ type: 'level-min', value: 2 }], otherwise: 'he-b12-alt' },
    choices: [
      {
        id: 'a', skillId: 'parafrase-ringkasan', best: true, next: 'he-b13',
        reaction: {
          text: 'Tepat banget, Dosen. Tadi aku nggak bisa nyusun kalimatnya, Dosen malah udah rapi.',
          expression: 'tertegun',
          cue: 'Hendra menatap Dosen sambil mengangguk, matanya agak berkaca.',
        },
        text: 'Jadi kamu ingin boleh menunda tanpa dicap pelit, dan punya ruang buat tugasmu. Tepat?',
      },
      {
        id: 'b', skillId: 'afirmasi-kekuatan', next: 'he-b13',
        reaction: {
          text: 'Hehe, boleh ya, Dosen? Kedengarannya agak aneh, tapi enak didengar.',
          expression: 'tersenyum',
          cue: 'Hendra tertawa kecil dan mengusap lehernya yang agak memerah.',
        },
        text: 'Kamu tahu persis yang kamu butuhkan. Peduli ke diri sendiri juga boleh banget.',
      },
      {
        id: 'c', skillId: 'refleksi-perasaan', options: LELAH, next: 'he-b13',
        reaction: {
          text: 'Iya, Dosen. Pengin ada jam yang nggak harus kujawab siapa pun.',
          expression: 'lega',
          cue: 'Hendra menarik napas dalam dan menghembuskannya perlahan.',
        },
        text: 'Ada keinginan bernapas lebih lega, tanpa harus selalu siap sedia buat semua orang.',
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: TENSION,
        text: 'Kalau gitu berhenti aja peduli sama permintaan orang mulai sekarang.',
      },
    ],
  },
  {
    id: 'he-b12-alt',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Intinya aku pengin lebih tenang. Belum tahu jelasnya gimana, tapi mungkin butuh waktu kosong dikit.',
      expression: 'netral',
      cue: 'Hendra mengetuk-ngetukkan ujung sepatu ke lantai sambil menatap ke arah jendela.',
    },
    choices: [
      {
        id: 'a', skillId: 'validasi-normalisasi', best: true, next: 'he-b13',
        reaction: {
          text: 'Makasih, Dosen. Berarti aku nggak aneh ya cuma pengin tenang.',
          expression: 'lega',
          cue: 'Hendra tersenyum tipis dan bersandar ke kursi.',
        },
        text: 'Pengin lebih tenang itu wajar. Nggak perlu dijelasin semuanya sekarang.',
      },
      {
        id: 'b', skillId: 'parafrase-ringkasan', next: 'he-b13',
        reaction: {
          text: 'Iya, Dosen, itu. Sedikit waktu kosong aja udah cukup.',
          expression: 'netral',
          cue: 'Hendra mengangguk sambil menutup bukunya perlahan.',
        },
        text: 'Jadi yang kamu cari saat ini adalah sedikit waktu kosong yang lebih tenang.',
      },
      {
        id: 'c', skillId: 'pertanyaan-terbuka', next: 'he-b13',
        reaction: {
          text: 'Satu jam? Kayaknya... buka file casing-ku, Dosen. Atau tidur sih, jujur.',
          expression: 'tersenyum',
          cue: 'Hendra tertawa pendek dan menguap sedikit.',
        },
        text: 'Kalau ada satu jam kosong minggu ini, apa yang pengin kamu lakukan?',
      },
      {
        id: 'd', skillId: 'meremehkan', next: 'he-b13',
        text: 'Nanti juga tenang sendiri kalau semester ini lewat.',
        reaction: {
          text: 'Iya, mungkin gitu. Tunggu aja.',
          expression: 'menutup-diri',
          cue: 'Hendra mengangguk sopan, lalu melirik ponselnya yang baru menyala.',
        },
      },
    ],
  },
];
