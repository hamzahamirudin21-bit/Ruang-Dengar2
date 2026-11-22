/**
 * Bima Mahendra (mhs-07), adegan Ruang BK bagian pemahaman.
 * Simpul (urutan jalur): bi-b6, bi-b9, bi-b8, bi-b12, ditambah alternatif bi-b9-alt, bi-b8-alt, bi-b12-alt.
 *
 * Titik sambung:
 *  - masuk dari `bi-b5` (berkas bk-eksplorasi) ke `bi-b6`.
 *  - keluar dari `bi-b12` dan `bi-b12-alt` ke `bi-b13` (berkas bk-rencana).
 *  - Ketegangan memakai `bi-tegang-bk` (berkas bk-rencana).
 *
 * Gerbang: `bi-b8` (Momen_Terbuka) butuh trust >= 80, level >= 1, dan bendera `isyarat-diperhatikan` (dari bi-l2);
 * `bi-b9` butuh trust >= 70; `bi-b12` (inti kebutuhan, kedalaman 2) butuh level >= 2.
 * Bila gagal, alur memakai simpul alternatif yang tetap menuju tulang punggung cerita.
 */
import type { StoryNode } from '../../engine/story/storyTypes';

const SCENE = 'bk';
const TENSION = 'bi-tegang-bk';
const RAGU = { reflectionNuance: 'ragu-kurang-percaya' } as const;

export const BIMA_BK_PEMAHAMAN_NODES: StoryNode[] = [
  {
    id: 'bi-b6',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Kalau kuambil kerjaan itu, rasanya kayak bilang kuliah ini percuma. Padahal bukan gitu. Aku cuma pengin ngerjain yang aku paham betul.',
      expression: 'cemas',
      cue: 'Bima meletakkan helm di lantai di antara kakinya, lalu menepuk-nepuk kubahnya seperti menenangkan sesuatu.',
    },
    choices: [
      {
        id: 'a', skillId: 'parafrase-ringkasan', best: true, next: 'bi-b9',
        reaction: {
          text: 'Iya, Bu, pas banget. Susah jelasinnya ke orang, tapi tadi Ibu bilangnya enak didengar.',
          expression: 'tertegun',
          cue: 'Bima menatap Dosen sejenak, lalu mengangguk lega kecil.',
        },
        text: 'Jadi milih bengkel terasa kayak menyangkal kuliahmu, padahal kamu ingin menekuni keahlian?',
      },
      {
        id: 'b', skillId: 'validasi-normalisasi', next: 'bi-b9',
        reaction: {
          text: 'Oh, banyak juga ya yang gitu? Lumayan lega dengernya, Bu. Kupikir cuma aku yang aneh.',
          expression: 'lega',
          cue: 'Bima mengembuskan napas panjang dan bahunya turun perlahan.',
        },
        text: 'Wajar kok bimbang. Banyak mahasiswa teknik ditawari kerja sebelum lulus.',
      },
      {
        id: 'c', skillId: 'nasihat-dini', next: TENSION,
        text: 'Ambil dulu kerjanya, kuliah bisa dilanjut nanti. Beres perkara.',
      },
      {
        id: 'd', skillId: 'pertanyaan-tertutup', next: 'bi-b9',
        text: 'Jadi sebenarnya kamu sudah males kuliah, gitu?',
        reaction: {
          text: 'Bukan males, Bu. Kuliahku tetap jalan. Cuma, ya, kedengarannya gitu sih.',
          expression: 'waspada',
          cue: 'Bima mengangkat alis dan mengambil kembali helmnya dari lantai.',
        },
      },
    ],
  },
  {
    id: 'bi-b9',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Padahal aku paling yakin waktu menyetel arus las. Pak Hendri dari bengkel bilang sambunganku paling rapi, dan K3-nya selalu kujaga. Tapi urusan milih jalan hidup, aku nggak punya alat ukurnya.',
      expression: 'tersenyum',
      cue: 'Mata Bima menyala waktu bercerita soal sambungan las, lalu ia menunduk dan mengusap bekas gosong di sarung tangannya.',
    },
    gate: { conditions: [{ type: 'trust-min', value: 70 }], otherwise: 'bi-b9-alt' },
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'bi-b8',
        reaction: {
          text: 'Rasanya tenang, Bu. Pas arusnya pas dan percikannya rata, kepala berhenti ngitung sebentar.',
          expression: 'tersenyum',
          cue: 'Bima tersenyum kecil, jari-jarinya bergerak seolah memegang pegangan las.',
        },
        text: 'Pas nyetel arus dan sambunganmu dipuji, kamu rasanya gimana?',
      },
      {
        id: 'b', skillId: 'refleksi-perasaan', options: RAGU, next: 'bi-b8',
        reaction: {
          text: 'Persis, Bu. Las ada standarnya, arah hidup nggak ada angka yang bisa kubaca.',
          expression: 'menunduk',
          cue: 'Bima mengangguk pelan dan menyilangkan kedua lengannya di dada.',
        },
        text: 'Soal las kamu yakin, tapi soal arah hidup kamu belum punya pegangan.',
      },
      {
        id: 'c', skillId: 'pertanyaan-tertutup', next: 'bi-b8',
        text: 'Jadi kamu lebih cocok jadi tukang las daripada insinyur?',
        reaction: {
          text: 'Hmm, jangan dibilang tukang doang dong. Tapi, ya... kedengarannya gitu juga.',
          expression: 'menunduk',
          cue: 'Bima tertawa kecil tanpa suara dan menggaruk pelipis dengan punggung tangan.',
        },
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: TENSION,
        text: 'Kalau sudah jago las, ya ambil aja kerjanya. Gampang, kan?',
      },
    ],
  },
  {
    id: 'bi-b9-alt',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Kerjaan lasku aman kok, Bu. Yang belum ketemu angkanya cuma soal milih tawaran ini.',
      expression: 'netral',
      cue: 'Bima mengangkat bahu sambil memutar helm sekali, seolah soal itu tak perlu dibahas panjang.',
    },
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'bi-b8',
        reaction: {
          text: 'Yang paling nyita itu milih mana yang duluan, Bu. Dua-duanya kerasa sama beratnya di kepala.',
          expression: 'netral',
          cue: 'Bima mengetuk pelipisnya dengan dua jari, lalu menghela napas.',
        },
        text: 'Dari urusan milih itu, bagian mana yang paling menyita pikiranmu?',
      },
      {
        id: 'b', skillId: 'parafrase-ringkasan', next: 'bi-b8',
        reaction: {
          text: 'Iya, Bu, gitu. Lasnya aman, yang belum jalan tinggal keputusannya.',
          expression: 'netral',
          cue: 'Bima mengangguk singkat dan merapikan kertas di depannya.',
        },
        text: 'Jadi las lancar, tapi keputusan soal tawaran itu yang belum ketemu jawabnya.',
      },
      {
        id: 'c', skillId: 'validasi-normalisasi', next: 'bi-b8',
        reaction: {
          text: 'Capek, Bu. Tangan masih sibuk ngelas, kepala sibuk ngitung. Kadang aku ngantuk sendiri.',
          expression: 'lelah',
          cue: 'Bima mengucek matanya dengan punggung tangan dan menguap pendek.',
        },
        text: 'Mutusin hal besar sambil tetap kerja memang capek.',
      },
      {
        id: 'd', skillId: 'pertanyaan-tertutup', next: 'bi-b8',
        text: 'Cuma itu yang bikin kamu bimbang?',
        reaction: {
          text: 'Iya, cuma itu.',
          expression: 'menutup-diri',
          cue: 'Bima menjawab singkat dan menatap sarung tangannya.',
        },
      },
    ],
  },
  {
    id: 'bi-b8',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 2,
    reply: {
      text: 'Surat tawarannya kubawa terus, kuselipin di dalam helm. Kolom tanda tangannya masih kosong. Batas jawabnya Jumat, dan aku belum berani bilang ke Ayah.',
      expression: 'tertegun',
      cue: 'Bima membuka pelapis helm, menarik selembar kertas terlipat, memperlihatkan kolom tanda tangan yang kosong, lalu menyelipkannya kembali. Suaranya jauh lebih pelan.',
    },
    marks: ['momen-terbuka'],
    gate: {
      conditions: [
        { type: 'trust-min', value: 80 }, { type: 'level-min', value: 1 },
        { type: 'flag', flag: 'isyarat-diperhatikan' },
      ],
      otherwise: 'bi-b8-alt',
    },
    onEnter: { setFlags: ['momen-terbuka'] },
    choices: [
      {
        id: 'a', skillId: 'refleksi-perasaan', best: true, options: RAGU, next: 'bi-b12',
        reaction: {
          text: 'Iya, Bu... kurang lebih gitu. Pengin banget, tapi takut bayarnya mahal di mata Ayah.',
          expression: 'tertegun',
          cue: 'Bima menunduk dalam, jari-jarinya mengepal di atas lutut.',
        },
        text: 'Kamu takut kalau tanda tangan, Ayah kecewa, padahal kamu pengin banget milihnya.',
      },
      {
        id: 'b', skillId: 'afirmasi-kekuatan', next: 'bi-b12',
        reaction: {
          text: 'Hehe, iya juga ya, Bu. Kukira cuma kebiasaan nggak bisa lepas. Kalau dibilang serius, ya, mungkin.',
          expression: 'tersenyum',
          cue: 'Bima menyentuh helm yang ada di pangkuannya, senyumnya muncul tipis dan salah tingkah.',
        },
        text: 'Suratnya kamu bawa terus sejauh ini. Itu tanda kamu serius menanggapinya.',
      },
      {
        id: 'c', skillId: 'pertanyaan-terbuka', next: 'bi-b12',
        reaction: {
          text: 'Campur, Bu. Hangat sebentar karena ada yang percaya sama aku, terus mendadak berat, kayak megang barang pinjaman.',
          expression: 'tertegun',
          cue: 'Bima mengusap bagian dalam helm dengan ibu jari, lalu menarik tangannya perlahan.',
        },
        text: 'Apa yang kamu rasain tiap kali menyentuh surat itu di dalam helm?',
      },
      {
        id: 'd', skillId: 'interogasi', next: TENSION,
        text: 'Kenapa suratnya kamu sembunyiin? Ayahmu belum tahu sama sekali?',
      },
    ],
  },
  {
    id: 'bi-b8-alt',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Ah, masih hitung-hitungan aja, Bu. Tenang, nanti juga ketemu hasilnya sendiri.',
      expression: 'netral',
      cue: 'Bima tersenyum lebar dan menepuk-nepuk bagian dalam helmnya seolah memastikan ada sesuatu yang tetap di sana.',
    },
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'bi-b12',
        reaction: {
          text: 'Maunya hasil yang nggak ada yang rugi, Bu. Tapi namanya hitungan, pasti ada yang kepotong.',
          expression: 'netral',
          cue: 'Bima tertawa pendek tanpa suara dan menggeleng pelan.',
        },
        text: 'Kalau hitungannya sudah selesai, kamu maunya hasilnya kayak apa?',
      },
      {
        id: 'b', skillId: 'validasi-normalisasi', next: 'bi-b12',
        reaction: {
          text: 'Makasih, Bu. Aku memang lebih enak kalau pelan-pelan begini.',
          expression: 'lega',
          cue: 'Bima menarik napas dalam dan bersandar ke kursi dengan bahu yang lebih longgar.',
        },
        text: 'Nggak apa-apa kalau belum mau bahas lebih dalam. Kita jalan pelan aja.',
      },
      {
        id: 'c', skillId: 'sampaikan-pengamatan', options: { observationTone: 'faktual' }, next: 'bi-b12',
        reaction: {
          text: 'Iya, Bu, tiga-tiganya seri. Makanya kutaruh dulu, daripada dihitung lagi nggak ketemu.',
          expression: 'netral',
          cue: 'Bima membalik kertas tabel itu menghadap meja dan menepuknya sekali.',
        },
        text: 'Tabelmu sudah tiga versi, tapi hasilnya masih sama.',
      },
      {
        id: 'd', skillId: 'meremehkan', next: 'bi-b12',
        text: 'Pasti ketemu. Kamu kan jago ngitung, jangan dibuat ribet.',
        reaction: {
          text: 'Bener juga. Mungkin aku yang kebanyakan mikir.',
          expression: 'menutup-diri',
          cue: 'Bima tertawa pendek dan kembali memutar helm cepat-cepat.',
        },
      },
    ],
  },
  {
    id: 'bi-b12',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 2,
    reply: {
      text: 'Kayaknya aku cuma butuh izin, Bu. Boleh milih jalanku sendiri, dan tetap dianggap anak yang tahu terima kasih.',
      expression: 'lega',
      cue: 'Bima melepas sarung tangan satunya, meletakkannya di atas helm, dan menarik napas panjang sampai bahunya turun.',
    },
    gate: { conditions: [{ type: 'level-min', value: 2 }], otherwise: 'bi-b12-alt' },
    choices: [
      {
        id: 'a', skillId: 'parafrase-ringkasan', best: true, next: 'bi-b13',
        reaction: {
          text: 'Tepat, Bu. Persis itu. Dari kemarin kalimatnya nggak ketemu kata-katanya.',
          expression: 'tertegun',
          cue: 'Bima menatap Dosen lekat-lekat, lalu mengangguk dua kali pelan.',
        },
        text: 'Jadi kamu ingin boleh milih sendiri tanpa merasa nggak tahu terima kasih. Tepat?',
      },
      {
        id: 'b', skillId: 'afirmasi-kekuatan', next: 'bi-b13',
        reaction: {
          text: 'Hm, baru kepikiran gitu, Bu. Makasih ya, kedengarannya lebih masuk akal daripada rasa bersalahku.',
          expression: 'tertegun',
          cue: 'Bima terdiam, lalu mengusap tengkuk sambil tersenyum tipis yang agak goyah.',
        },
        text: 'Kamu tahu persis apa yang kamu butuhkan. Itu tanda kamu menghargai orang tuamu.',
      },
      {
        id: 'c', skillId: 'refleksi-perasaan', options: RAGU, next: 'bi-b13',
        reaction: {
          text: 'Iya, Bu. Aku pengin milih tanpa ngerasa ngutang. Kalau jujur, itu yang paling kuharapin.',
          expression: 'lega',
          cue: 'Bima menarik napas panjang dan bahunya turun seperti baru meletakkan beban.',
        },
        text: 'Kamu pengin milih tanpa harus dibayar dengan rasa bersalah.',
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: TENSION,
        text: 'Kalau gitu putusin aja sendiri dan jangan pikirin perasaan orang lain.',
      },
    ],
  },
  {
    id: 'bi-b12-alt',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Intinya aku mau keputusan yang nggak bikin siapa pun kecewa. Lebih dari itu belum bisa kubilang.',
      expression: 'netral',
      cue: 'Bima mengetuk-ngetukkan jari ke tempurung helm dan menatap rak buku di sudut ruangan.',
    },
    choices: [
      {
        id: 'a', skillId: 'validasi-normalisasi', best: true, next: 'bi-b13',
        reaction: {
          text: 'Syukurlah wajar, Bu. Kupikir aku cuma terlalu pengin semua orang senang.',
          expression: 'lega',
          cue: 'Bima tertawa kecil lega dan menurunkan topeng di pangkuannya.',
        },
        text: 'Pengin keputusan yang nggak melukai siapa pun itu wajar. Nggak perlu dijelasin sekarang.',
      },
      {
        id: 'b', skillId: 'parafrase-ringkasan', next: 'bi-b13',
        reaction: {
          text: 'Ya, kurang lebih, Bu. Damai buat semua, termasuk buat kepalaku sendiri.',
          expression: 'netral',
          cue: 'Bima mengangguk dan menatap meja sambil merapikan tepi kertasnya.',
        },
        text: 'Jadi yang paling kamu mau sekarang: keputusan yang terasa damai buat semua.',
      },
      {
        id: 'c', skillId: 'pertanyaan-terbuka', next: 'bi-b13',
        reaction: {
          text: 'Mungkin kalau tabelnya nggak kupikirin tiap malam, Bu. Sehari aja nggak ngitung, kepala rasanya ringan.',
          expression: 'netral',
          cue: 'Bima menatap langit-langit, lalu tersenyum tipis membayangkannya.',
        },
        text: 'Kalau ada satu hal kecil yang bikin keputusan ini lebih ringan, apa itu?',
      },
      {
        id: 'd', skillId: 'meremehkan', next: 'bi-b13',
        text: 'Nanti juga ada jalannya sendiri. Nggak usah terlalu dipikirin.',
        reaction: {
          text: 'Mungkin ya. Lihat aja nanti.',
          expression: 'menutup-diri',
          cue: 'Bima mengangguk santai dan menatap jam dinding.',
        },
      },
    ],
  },
];
