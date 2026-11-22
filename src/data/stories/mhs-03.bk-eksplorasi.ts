/**
 * Cerita Tania Wijaya (mhs-03), adegan Ruang BK bagian eksplorasi: ta-b0, ta-b2, ta-b4, ta-b5.
 * Tujuan di luar berkas ini: ta-b6 (bk-pemahaman) dan ta-tegang-bk (bk-rencana).
 * Dirakit di mhs-03.ts. Seluruh teks Bahasa Indonesia, tanpa Istilah_Diagnosis.
 */
import type { StoryNode } from '../../engine/story/storyTypes';

const SCENE = 'bk';
const TEGANG = 'ta-tegang-bk';

export const MHS03_BK_EKSPLORASI_NODES: StoryNode[] = [
  {
    id: 'ta-b0',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: {
      text: 'Wah, tenang banget di sini. Bu, aku boleh langsung cerita? Soalnya kalau mikir sendirian, aku muter-muter terus, capek banget sumpah.',
      expression: 'tersenyum',
      cue: 'Tania duduk, mengeluarkan dua map dari tasnya, lalu mengetuk-ngetukkan pulpen ke map teratas.',
    },
    choices: [
      {
        id: 'a', skillId: 'batas-kerahasiaan', best: true, next: 'ta-b2',
        text: 'Boleh banget. Ceritamu tetap di sini, kecuali ada hal yang membahayakan keselamatanmu.',
        reaction: { text: 'Beneran? Syukurlah, Bu. Aku jadi berani ngomong lebih jujur.', expression: 'lega', cue: 'Tania menyandarkan punggung dan mengembuskan napas.' },
      },
      {
        id: 'b', skillId: 'sapaan-hangat', next: 'ta-b2',
        text: 'Makasih sudah mau datang, Tania. Cerita aja dengan caramu sendiri.',
        reaction: { text: 'Sama-sama, Bu. Oke, aku cerita pelan-pelan ya, takut loncat-loncat.', expression: 'tersenyum', cue: 'Tania duduk bersila kecil di kursinya sambil tersenyum.' },
      },
      {
        id: 'c', skillId: 'pertanyaan-terbuka', next: 'ta-b2',
        text: 'Apa yang paling sering muter-muter di kepalamu belakangan ini?',
        reaction: { text: 'Yang muter? Dua pilihan itu, Bu. Aku bolak-balik mikirinnya.', expression: 'cemas', cue: 'Tania mengacak rambutnya sebentar.' },
      },
      {
        id: 'd', skillId: 'interogasi', next: TEGANG,
        text: 'Sebenarnya kamu takut apa? Jawab jujur saja.',
      },
    ],
  },
  {
    id: 'ta-b2',
    sceneId: SCENE,
    stage: 'eksplorasi',
    depth: 0,
    reply: {
      text: 'Gini, Bu, aku tuh lagi galau banget. Ada lowongan asisten riset di lab, tapi kalau kuambil, skripsiku mungkin molor satu semester. Kalau lulus tepat waktu, aku lepas kesempatan itu. Menurut Ibu mending mana?',
      expression: 'cemas',
      cue: 'Tania bicara cepat, tangannya bergantian menepuk map kiri dan map kanan seperti menimbang.',
    },
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'ta-b4',
        text: 'Sebelum kujawab, coba bayangkan dua jalan itu. Apa yang kamu rasakan di masing-masing?',
        reaction: { text: 'Duh, ditanya balik, hehe. Jalan satu terasa mantap, jalan dua terasa rugi kalau dilepas.', expression: 'cemas', cue: 'Tania menggigit bibir sambil menatap dua jarinya.' },
      },
      {
        id: 'b', skillId: 'refleksi-perasaan', next: 'ta-b4',
        options: { reflectionNuance: 'tertekan-cemas' },
        text: 'Kedengarannya kamu tertekan, karena dua-duanya terasa penting dan kamu harus memilih.',
        reaction: { text: 'Iya, Bu, tepat banget. Dua-duanya penting, makanya aku pusing.', expression: 'lelah', cue: 'Tania memijat pelipisnya.' },
      },
      {
        id: 'c', skillId: 'pertanyaan-tertutup', next: 'ta-b4',
        text: 'Jadi kamu lebih condong ke lulus tepat waktu, ya?',
        reaction: {
          text: 'Hmm, bisa jadi. Eh, nggak juga sih. Ya itu, makanya aku nanya Ibu.',
          expression: 'cemas',
          cue: 'Tania tertawa pendek lalu membuka-tutup tutup pulpennya.',
        },
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: TEGANG,
        text: 'Ambil saja yang lulus tepat waktu. Itu pilihan paling aman, Tania.',
      },
    ],
  },
  {
    id: 'ta-b4',
    sceneId: SCENE,
    stage: 'eksplorasi',
    depth: 1,
    reply: {
      text: 'Nih, Bu. Daftar plus-minusnya sudah kubuat tiga versi. Yang terakhir malah kuhapus semua tadi pagi. Aneh ya? Aku sendiri bingung.',
      expression: 'tertegun',
      cue: 'Tania membentangkan tiga lembar kertas. Lembar terakhir kosong dengan bekas hapusan yang menghitam.',
      aside: 'Di pojok lembar kosong itu, ada satu kalimat yang tidak sempat terhapus.',
    },
    marks: ['kejutan', 'isyarat-nonverbal'],
    choices: [
      {
        id: 'a', skillId: 'sampaikan-pengamatan', best: true, next: 'ta-b5',
        options: { observationTone: 'faktual' },
        text: 'Kamu menghapus versi terakhir sampai kosong. Mungkin ada yang lebih berat dari daftarnya.',
        reaction: { text: 'Eh, kelihatan banget ya? Iya, Bu, yang terakhir kuhapus semua tadi pagi.', expression: 'menunduk', cue: 'Tania menyentuh pinggir kertas kosong itu.' },
      },
      {
        id: 'b', skillId: 'afirmasi-kekuatan', next: 'ta-b5',
        text: 'Kamu mau menimbang sampai tiga kali. Itu tanda kamu serius dan teliti.',
        reaction: { text: 'Hehe, iya sih, Bu. Aku emang tipe yang ngecek berkali-kali.', expression: 'tersenyum', cue: 'Tania tertawa kecil dan menunjuk daftar bertumpuk.' },
      },
      {
        id: 'c', skillId: 'janji-mutlak', next: 'ta-b5',
        text: 'Serahkan saja ke saya. Pilihanmu pasti benar, saya jamin.',
        reaction: {
          text: 'Hehe, makasih, Bu. Tapi jangan janji dulu deh, takutnya aku yang kecewain Ibu.',
          expression: 'waspada',
          cue: 'Tania cepat menarik tiga lembar kertas itu dan menumpuknya terbalik.',
        },
      },
      {
        id: 'd', skillId: 'interogasi', next: TEGANG,
        text: 'Kenapa kamu hapus? Apa yang kamu sembunyikan dari daftar itu?',
      },
    ],
  },
  {
    id: 'ta-b5',
    sceneId: SCENE,
    stage: 'eksplorasi',
    depth: 1,
    reply: {
      text: 'Teman-teman satu tim bilang aku pasti diterima. Dosen pembimbingku juga bilang aku cocok. Makin banyak yang yakin, aku makin takut kalau ternyata nggak. Serem banget, Bu.',
      expression: 'menunduk',
      cue: 'Tania berhenti mengetuk pulpen, lalu memandangi lembar yang terbalik di bawah tangannya.',
    },
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'ta-b6',
        text: 'Kalau ternyata tidak diterima, apa yang kamu bayangkan akan terjadi?',
        reaction: { text: 'Kalau nggak diterima? Aduh, Bu, kebayangnya malu banget sama semua orang.', expression: 'cemas', cue: 'Tania menutup wajahnya sebentar dengan kedua tangan.' },
      },
      {
        id: 'b', skillId: 'validasi-normalisasi', next: 'ta-b6',
        text: 'Makin banyak yang berharap, beban merasa harus berhasil memang ikut membesar.',
        reaction: { text: 'Nah itu, Bu! Makin berharap makin berat. Makasih udah ngerti.', expression: 'lega', cue: 'Tania mengangguk berkali-kali.' },
      },
      {
        id: 'c', skillId: 'refleksi-perasaan', next: 'ta-b6',
        options: { reflectionNuance: 'kecewa-kesal', reflectionCorrectOverride: false },
        text: 'Kamu pasti kesal pada teman-teman yang terlalu yakin padamu.',
        reaction: {
          text: 'Bukan kesal, Bu. Aku cuma takut mengecewakan mereka.',
          expression: 'menunduk',
          cue: 'Tania menggeleng pelan, senyum cerianya sudah tidak ada.',
        },
      },
      {
        id: 'd', skillId: 'meremehkan', next: 'ta-b6',
        text: 'Kalau semua orang yakin, kamu pasti diterima. Tidak usah cemas.',
        reaction: {
          text: 'Iya, Bu. Mungkin benar.',
          expression: 'menutup-diri',
          cue: 'Tania mengangguk sopan, pandangannya kembali ke tumpukan kertas.',
        },
      },
    ],
  },
];
