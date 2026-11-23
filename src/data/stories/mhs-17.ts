/**
 * Story_Graph penuh Sekar Wulandari (mhs-17 — Pojok Baca & Riset).
 */
import { buildAuthoredFullStory, mkLine } from './authoredBuilder';

export const STORY_MHS_17 = buildAuthoredFullStory({
  studentId: 'mhs-17',
  prefix: 'sk',
  firstName: 'Sekar',
  title: 'Percakapan dengan Sekar',
  labTitle: 'Pojok Baca & Riset',
  labCaption: 'Sekar duduk rapi di Pojok Baca bersama tiga buku referensi yang diberi pembatas warna-warni.',
  bkCaption: 'Ruang Konsultasi yang teduh dan hening dengan dua kursi nyaman menghadap jendela.',
  primaryNuance: 'ragu-kurang-percaya',
  openingReply: mkLine(
    'Selamat siang, Bu. Aku Sekar, sedang mencocokkan tabel batas tegangan dari buku panduan di Pojok Baca.',
    'netral',
    'Sekar menyelipkan pembatas kertas berwarna emas lalu menoleh sopan.',
  ),
  openingReactions: {
    'sapaan-hangat': mkLine('Siang Bu, terima kasih sudah menyapa pelan. Aku baru merampungkan catatan uji mutu.', 'tersenyum', 'Sekar tersenyum teduh sambil merapikan buku catatannya.'),
    'pertanyaan-terbuka': mkLine('Lagi merangkum syarat keamanan rangkaian sebelum teman-teman menyalakan catu daya sore ini.', 'netral', 'Sekar menunjuk tabel rapi bertanda stabilo.'),
    'pertanyaan-tertutup': mkLine('Lumayan lancar Bu, tinggal merapikan dua catatan terakhir.', 'netral', 'Sekar mengangguk lembut.'),
    'nasihat-dini': mkLine('Aku tetap menjaga waktu istirahat kok Bu, hanya ingin pastikan datanya akurat dulu.', 'waspada', 'Sekar merapatkan tepi syalnya pelan.'),
  },
  steps: {
    n1: {
      reply: mkLine('Tadi aku sudah menulis rangkuman tiga halaman, tapi masih ragu kapan waktu tepat menyerahkannya ke tim.', 'cemas', 'Sekar membolak-balik sudut halaman bukunya dengan tenang namun gelisah.'),
      choices: [
        { id: 'a', skillId: 'afirmasi-kekuatan', best: true, text: 'Susunan catatan uji mutumu rapi sekali, Sekar—jarang mahasiswa baru seteliti ini.', reaction: mkLine('Makasih Bu... dari Solo dulu aku memang terbiasa menulis rangkuman sebelum praktik.', 'tersenyum', 'Senyum lembut muncul di wajah Sekar.') },
        { id: 'b', skillId: 'jeda-hening', text: 'Silakan beri tanda dulu halaman yang penting, saya duduk tenang di sini.', reaction: mkLine('Terima kasih Bu, tinggal satu garis tabel lagi.', 'netral', 'Sekar menggarisbawahi satu angka dengan rapi.') },
        { id: 'c', skillId: 'validasi-normalisasi', text: 'Menunggu momen tepat untuk masuk ke diskusi yang cepat memang sering bikin ragu.', reaction: mkLine('Iya Bu, setiap kali mau bicara topiknya sudah loncat jauh.', 'cemas', 'Sekar mengangguk perlahan.') },
        { id: 'd', skillId: 'pertanyaan-tertutup', text: 'Catatan tiga halaman itu belum kamu bagikan sama sekali ke kelompok, ya?', reaction: mkLine('Belum Bu, tadi aku sempat berdiri di dekat meja mereka lalu balik lagi ke sini.', 'menunduk', 'Sekar menurunkan pandangannya.') },
      ],
    },
    n2: {
      reply: mkLine('Tadi suara rapat kelompok di Meja Diskusi kencang sekali, jadi aku balik lagi ke Pojok Baca ini.', 'menunduk', 'Sekar melirik koridor yang mengarah ke Meja Diskusi.', 'Terdengar gelak tawa dan perdebatan cepat dari arah ruang tengah.'),
      choices: [
        { id: 'a', skillId: 'validasi-normalisasi', best: true, text: 'Wajar sekali kamu butuh ruang hening dulu saat ritme diskusi di luar terasa terlalu cepat.', reaction: mkLine('Alhamdulillah ada yang mengerti, Bu. Aku bukan menjauhi teman, cuma butuh jeda berpikir.', 'lega', 'Bahu Sekar terlihat mengendur.') },
        { id: 'b', skillId: 'pertanyaan-terbuka', text: 'Apa yang paling kamu rasakan ketika berdiri di tepi diskusi yang serba cepat itu?', reaction: mkLine('Kepalaku mendadak penuh dan takut kalimatku terdengar terlalu kaku di tengah mereka.', 'cemas', 'Sekar menyentuh ujung bukunya pelan.') },
        { id: 'c', skillId: 'jeda-hening', text: 'Tidak apa-apa menepi sebentar sampai napasmu kembali tenang.', reaction: mkLine('Iya Bu, di Pojok Baca ini pikiranku baru bisa jernih lagi.', 'netral', 'Sekar menghela napas halus.') },
        { id: 'd', skillId: 'meremehkan', text: 'Anak kampus itu biasa berisik, kalau terlalu pemalu ya ketinggalan terus.', reaction: mkLine('Aku bukan sekadar pemalu Bu, aku cuma ingin data keselamatan yang kusampaikan tepat.', 'kesal', 'Sorot mata Sekar tampak sedikit terluka.') },
      ],
    },
    n3: {
      reply: mkLine('Sebentar lagi ada rombongan mahasiswa masuk Pojok Baca mencari referensi, agak kurang leluasa ngobrol di sini.', 'waspada', 'Sekar merapikan tiga buku ke tumpukan rapi.'),
      choices: [
        { id: 'a', skillId: 'sapaan-hangat', best: true, text: 'Kalau begitu kita lanjutkan ngobrol pelan di Ruang Konsultasi yuk, suasananya sama teduhnya.', reaction: mkLine('Boleh sekali Bu, mari kita ke sana sambil kubawa buku catatanku.', 'lega', 'Sekar berdiri dengan tenang.') },
        { id: 'b', skillId: 'pertanyaan-terbuka', text: 'Mau kita pindah ke ruangan mana supaya kamu nyaman bercerita?', reaction: mkLine('Ruang Konsultasi saja Bu, lebih tenang dan tidak mengganggu yang sedang membaca.', 'netral', 'Sekar berjalan ke arah pintu.') },
        { id: 'c', skillId: 'jeda-hening', text: 'Saya ikut ritmemu, kalau siap kita bisa berjalan bersama ke Ruang Konsultasi.', reaction: mkLine('Terima kasih Bu, ayo sekarang saja.', 'tersenyum', 'Sekar melangkah lembut.') },
        { id: 'd', skillId: 'pertanyaan-tertutup', text: 'Kita langsung ke Ruang Konsultasi sekarang saja ya?', reaction: mkLine('Baik Bu, silakan duluan.', 'netral', 'Sekar mengikuti dari samping.') },
      ],
    },
    n4: {
      reply: mkLine('Teduh sekali ruangan ini, Bu. Rasanya mirip perpustakaan kecil favoritku waktu sekolah di Solo.', 'lega', 'Sekar meletakkan buku catatannya di pangkuan dengan nyaman.'),
      choices: [
        { id: 'a', skillId: 'batas-kerahasiaan', best: true, setFlags: ['batas-dijelaskan'], text: 'Apa pun yang kamu sampaikan di ruangan ini tetap terjaga kerahasiaannya di antara kita.', reaction: mkLine('Terima kasih banyak Bu, aku jadi merasa aman sekali untuk bicara terbuka.', 'lega', 'Sekar tersenyum tulus.') },
        { id: 'b', skillId: 'sapaan-hangat', text: 'Senang kamu merasa nyaman di sini, Sekar—tidak ada yang perlu diburu-buru.', reaction: mkLine('Makasih Bu, di sini enak sekali untuk menyusun pikiran.', 'tersenyum', 'Sekar duduk rileks.') },
        { id: 'c', skillId: 'jeda-hening', text: 'Ambil waktu sejenak, baru cerita ketika kamu sudah merasa pas.', reaction: mkLine('Baik Bu, aku siap cerita sekarang.', 'netral', 'Sekar menarik napas lembut.') },
        { id: 'd', skillId: 'pertanyaan-tertutup', text: 'Suasana di ruangan ini jauh lebih enak daripada ruang tengah, kan?', reaction: mkLine('Iya Bu, jauh lebih tenang buatku.', 'netral', 'Sekar mengangguk sopan.') },
      ],
    },
    n5: {
      reply: mkLine('Sebagai mahasiswa angkatan baru 2026, aku sering kagum sekaligus kaget lihat teman-teman langsung merakit cepat.', 'netral', 'Sekar menatap halaman tabel referensi yang dibawanya.'),
      choices: [
        { id: 'a', skillId: 'pertanyaan-terbuka', best: true, text: 'Bagaimana biasanya kamu menyesuaikan diri saat gaya belajarmu berbeda dari teman satu kelompok?', reaction: mkLine('Biasanya aku diam mencatat dulu di Pojok Baca, baru setelah yakin benar aku berniat memberi masukan.', 'netral', 'Sekar menjelaskan dengan runtut.') },
        { id: 'b', skillId: 'afirmasi-kekuatan', text: 'Sikap memeriksa buku panduan lebih dulu itu justru mencegah kerusakan komponen praktikum.', reaction: mkLine('Betul Bu, kemarin pun ada kabel yang hampir terbalik polaritasnya kalau nggak dicek.', 'tersenyum', 'Sekar tersenyum malu-malu.') },
        { id: 'c', skillId: 'validasi-normalisasi', text: 'Setiap orang memang punya kecepatan dan gaya menyerap informasi yang berbeda-beda.', reaction: mkLine('Lega dengarnya Bu, kadang aku kira hanya aku yang terlalu lambat.', 'lega', 'Sekar mengangguk pelan.') },
        { id: 'd', skillId: 'nasihat-dini', text: 'Sebaiknya mulai minggu depan kamu kurangi waktu membaca dan langsung ikut merakit cepat.', reaction: mkLine('Kalau tanpa mengecek standar rangkaian dulu, aku justru cemas alatnya rusak, Bu.', 'waspada', 'Sekar merapatkan jari-jarinya.') },
      ],
    },
    n6: {
      reply: mkLine('Minggu lalu catatan revisi teganganku baru kuberi setelah mereka selesai merakit, jadi harus bongkar ulang.', 'menunduk', 'Sekar tampak menyesal sambil menatap stabilo emas di bukunya.'),
      choices: [
        { id: 'a', skillId: 'pertanyaan-terbuka', best: true, text: 'Apa yang menahanmu waktu itu sehingga catatannya baru disampaikan di akhir?', reaction: mkLine('Aku takut dikira menggurui kakak tingkat atau memperlambat pekerjaan mereka yang lagi semangat.', 'cemas', 'Suara Sekar terdengar sangat pelan.') },
        { id: 'b', skillId: 'jeda-hening', text: 'Saya dengarkan pelan-pelan, ceritakan saja kelanjutannya.', reaction: mkLine('Akhirnya mereka memang berterima kasih karena rangkaian jadi aman, tapi aku tetap merasa nggak enak.', 'menunduk', 'Sekar menghela napas halus.') },
        { id: 'c', skillId: 'validasi-normalisasi', text: 'Posisi serba salah antara menjaga mutu dan takut mengganggu ritme tim itu memang tidak ringan.', reaction: mkLine('Tepat sekali Bu, rasanya seperti berdiri di dua sisi yang saling tarik.', 'cemas', 'Sekar mengangguk lirih.') },
        { id: 'd', skillId: 'interogasi', text: 'Kenapa nggak langsung kamu potong saja pembicaraan mereka sebelum mulai merakit?', reaction: mkLine('Aku sungkan memotong ucapan orang yang bicara lebih cepat, Bu.', 'waspada', 'Sekar menunduk agak tegang.') },
      ],
    },
    n7: {
      reply: mkLine('Akhirnya hari ini aku sudah selesai lebih awal, tapi tetap merasa gugup mau melangkah ke meja mereka.', 'cemas', 'Sekar memeluk buku catatan risetnya di dada.'),
      choices: [
        { id: 'a', skillId: 'sampaikan-pengamatan', best: true, options: { observationTone: 'faktual' }, text: 'Saya perhatikan tanganmu langsung memeluk buku lebih erat setiap menyebut nama rapat kelompok.', reaction: mkLine('Iya Bu... jujur jantungku masih agak deg-degan kalau harus bicara di depan banyak suara sekaligus.', 'tertegun', 'Sekar tersenyum tipis menyadari gesturnya sendiri.') },
        { id: 'b', skillId: 'pertanyaan-terbuka', text: 'Suasana seperti apa yang membuatmu paling nyaman saat menyampaikan hasil pengecekan mutu?', reaction: mkLine('Kalau lewat ringkasan tertulis yang pendek atau ngobrol berdua dulu dengan koordinator sebelum mulai.', 'netral', 'Sekar menjawab dengan mata lebih tenang.') },
        { id: 'c', skillId: 'parafrase-ringkasan', text: 'Jadi datanya sebenarnya sudah siap, hanya pintu masuk komunikasinya yang belum terasa nyaman ya?', reaction: mkLine('Benar Bu, materinya sudah siap semua, aku cuma bingung cara masuknya.', 'lega', 'Sekar mengangguk mantap.') },
        { id: 'd', skillId: 'sampaikan-pengamatan', options: { observationTone: 'menilai' }, text: 'Kamu kelihatan terlalu penakut untuk bicara dengan teman sekelasmu sendiri.', reaction: mkLine('Aku bukan penakut Bu, aku hanya terbiasa berbicara teratur tanpa berebut suara.', 'kesal', 'Alis Sekar berkerut lembut.') },
      ],
    },
    n8: {
      reply: mkLine('Kadang aku takut gaya tenangku ini bikin aku dicap nggak cocok di jurusan teknik yang serba cepat.', 'menunduk', 'Sekar menatap ujung syal mustard-nya dengan raut sendu.'),
      choices: [
        { id: 'a', skillId: 'refleksi-perasaan', best: true, options: { reflectionNuance: 'ragu-kurang-percaya' }, text: 'Ada keraguan dalam hatimu apakah pribadi yang tenang dan teliti punya tempat berharga di lab ini.', reaction: mkLine('Iya Bu, persis sekali... aku suka elektronika dan dokumentasi, tapi takut caraku ini dianggap kurang pas.', 'tertegun', 'Mata Sekar tampak berkaca-kaca hangat.') },
        { id: 'b', skillId: 'validasi-normalisasi', text: 'Keraguan saat baru beradaptasi di lingkungan baru adalah hal yang sangat wajar.', reaction: mkLine('Makasih Bu, rasanya lega tidak merasa sendirian merasakan ini.', 'netral', 'Sekar mengangguk lembut.') },
        { id: 'c', skillId: 'jeda-hening', text: 'Terima kasih sudah mempercayakan kekhawatiran itu di sini, tarik napas pelan ya.', reaction: mkLine('Hati rasanya jauh lebih tenang setelah diucapkan, Bu.', 'lega', 'Sekar menarik napas panjang.') },
        { id: 'd', skillId: 'meremehkan', text: 'Ah, mahasiswa baru memang lebay mikirnya, nanti semester dua juga lupa sendiri.', reaction: mkLine('Buatku ini penting sekali untuk kenyamanan belajarku selama kuliah, Bu.', 'kesal', 'Sekar merapatkan bibirnya.') },
      ],
    },
    n8alt: {
      reply: mkLine('Aku cuma ingin tetap bisa bekerja teliti di Pojok Baca tanpa menyulitkan tim praktikum.', 'netral', 'Sekar merapikan ujung halaman catatannya.'),
      choices: [
        { id: 'a', skillId: 'pertanyaan-terbuka', best: true, text: 'Menurutmu peran apa yang paling pas untuk kekuatan dokumentasimu di dalam tim?', reaction: mkLine('Jadi penguji mutu dan penyiap daftar periksa sebelum alat dinyalakan, Bu.', 'tersenyum', 'Sekar tersenyum tenang.') },
        { id: 'b', skillId: 'validasi-normalisasi', text: 'Mencari ritme yang sehat antara fokus mandiri dan kerja tim itu langkah yang bijak.', reaction: mkLine('Iya Bu, aku ingin keduanya bisa jalan seimbang.', 'netral', 'Sekar mengangguk.') },
        { id: 'c', skillId: 'jeda-hening', text: 'Kita cari bentuk yang paling cocok dengan gaya tenangmu ya.', reaction: mkLine('Terima kasih banyak Bu.', 'lega', 'Sekar tersenyum tipis.') },
        { id: 'd', skillId: 'nasihat-dini', text: 'Kamu harus memaksa dirimu ikut setiap obrolan ramai supaya cepat akrab.', reaction: mkLine('Kalau terus-terusan di keramaian, konsentrasiku membaca data malah habis, Bu.', 'lelah', 'Sekar menggeleng pelan.') },
      ],
    },
    n9: {
      reply: mkLine('Di industri teknik sebenarnya bagian jaminan mutu dan dokumentasi standar itu memang butuh ketelitian hening ya, Bu?', 'tersenyum', 'Tatapan Sekar mulai berbinar penuh rasa ingin tahu.'),
      choices: [
        { id: 'a', skillId: 'afirmasi-kekuatan', best: true, text: 'Sangat betul, Sekar! Penguji mutu yang cermat seperti kamu adalah penjaga keselamatan seluruh tim.', reaction: mkLine('Wah, rasanya bangga banget dengar itu Bu—ternyata caraku belajar memang punya peran besar!', 'tersenyum', 'Wajah Sekar berseri cerah.') },
        { id: 'b', skillId: 'pertanyaan-terbuka', text: 'Bagaimana rasanya membayangkan dirimu memegang peran penguji mutu resmi di proyek semester ini?', reaction: mkLine('Rasanya pas sekali dengan diriku dan aku jadi lebih berani menyodorkan catatanku!', 'tersenyum', 'Sekar tersenyum mantap.') },
        { id: 'c', skillId: 'parafrase-ringkasan', text: 'Jadi kekuatan ketenanganmu bukan penghalang, melainkan keahlian inti di bidang uji mutu ya?', reaction: mkLine('Iya Bu, perspektifku langsung berubah total sekarang!', 'lega', 'Sekar mengangguk antusias.') },
        { id: 'd', skillId: 'pertanyaan-tertutup', text: 'Berarti kamu sekarang sudah tidak ragu lagi dengan gaya belajarmu, kan?', reaction: mkLine('Jauh lebih yakin dari tadi pagi, Bu.', 'tersenyum', 'Sekar tersenyum lembut.') },
      ],
    },
    n10: {
      reply: mkLine('Aku butuh cara menyampaikan temuan risetku secara ringkas dan tertulis agar tim terbantu tanpa aku harus berebut suara.', 'tertegun', 'Sekar menatap dengan sorot mata tenang dan sangat jernih.'),
      choices: [
        { id: 'a', skillId: 'refleksi-perasaan', best: true, options: { reflectionNuance: 'ragu-kurang-percaya' }, text: 'Kamu ingin suara dan ketelitianmu berdampak nyata bagi tim dengan cara yang tetap menghormati ketenangan dirimu.', reaction: mkLine('Ya Allah, kalimat Ibu tepat sekali! Itulah keseimbangan yang kucari sejak awal semester.', 'lega', 'Sekar tersenyum haru dengan napas sangat lega.') },
        { id: 'b', skillId: 'parafrase-ringkasan', text: 'Jadi kuncinya adalah format catatan ringkas yang mudah dibaca cepat oleh rekan timmu.', reaction: mkLine('Betul Bu, tiga halaman terlalu panjang buat meja praktik, tapi daftar periksa 5 poin pasti langsung dipakai!', 'tersenyum', 'Sekar mengangguk gembira.') },
        { id: 'c', skillId: 'validasi-normalisasi', text: 'Memilih media komunikasi yang selaras dengan kepribadianmu itu cerdas sekali, Sekar.', reaction: mkLine('Terima kasih Bu, aku tidak perlu berpura-pura jadi orang lain.', 'lega', 'Sekar tersenyum teduh.') },
        { id: 'd', skillId: 'refleksi-perasaan', toTension: true, options: { reflectionCorrectOverride: false }, text: 'Jadi sebenarnya kamu kesal dan tidak suka bergaul dengan teman satu kelompokmu ya?', reaction: mkLine('Bukan begitu Bu! Aku justru peduli keselamatan proyek mereka!', 'kesal', 'Sekar menegakkan bahu dengan raut kecewa.') },
      ],
    },
    n10alt: {
      reply: mkLine('Mungkin catatan tiga halaman tadi bisa kuringkas jadi satu kartu pegangan cepat untuk meja praktik.', 'tersenyum', 'Sekar mulai tersenyum melihat jalan keluarnya.'),
      choices: [
        { id: 'a', skillId: 'pertanyaan-terbuka', best: true, text: 'Poin apa saja yang paling krusial masuk ke kartu pegangan cepat itu, Sekar?', reaction: mkLine('Lima batas tegangan aman dan urutan pengecekan kabel sebelum tombol daya ditekan, Bu.', 'tersenyum', 'Sekar menjawab sangat sistematis.') },
        { id: 'b', skillId: 'parafrase-ringkasan', text: 'Jadi satu kartu ringkas itu menjembatani riset mendalammu di Pojok Baca dengan praktik cepat di lab.', reaction: mkLine('Iya Bu, sederhana tapi menyelamatkan semuanya.', 'lega', 'Sekar mengangguk mantap.') },
        { id: 'c', skillId: 'validasi-normalisasi', text: 'Ide merangkum jadi kartu pegangan itu kreatif dan sangat membantu tim.', reaction: mkLine('Terima kasih Bu, aku jadi semangat mengerjakannya.', 'tersenyum', 'Sekar tersenyum ramah.') },
        { id: 'd', skillId: 'meremehkan', toTension: true, text: 'Kalau cuma kartu 5 poin, kenapa tadi sampai butuh tiga buku segala?', reaction: mkLine('Justru untuk menyaring 5 poin paling akurat itu perlu mencocokkan tiga referensi, Bu!', 'kesal', 'Sekar menutup bukunya pelan dengan raut tersinggung.') },
      ],
    },
    n11: {
      reply: mkLine('Kalau aku titipkan kartu 5 poin itu sambil ngobrol 2 menit ke Raka atau Tania sebelum praktik, rasanya nyaman banget.', 'tersenyum', 'Sekar tampak jauh lebih santai dan percaya diri.'),
      choices: [
        { id: 'a', skillId: 'parafrase-ringkasan', best: true, text: 'Berarti riset tenang di Pojok Baca tetap jalan, lalu disalurkan lewat kartu 5 poin dan obrolan singkat empat mata ya?', reaction: mkLine('Betul Bu! Tim aman, dan ruang fokusku tetap terjaga tanpa kelelahan.', 'lega', 'Sekar tersenyum penuh keyakinan.') },
        { id: 'b', skillId: 'afirmasi-kekuatan', text: 'Cara komunikasimu yang terstruktur dan tenang itu benar-benar cerminan peneliti andal.', reaction: mkLine('Makasih banyak Bu, kepercayaan diriku langsung naik.', 'tersenyum', 'Sekar tersenyum hangat.') },
        { id: 'c', skillId: 'pertanyaan-terbuka', text: 'Kapan rencanamu menyusun kartu 5 poin uji mutu itu?', reaction: mkLine('Langsung setelah aku kembali ke Pojok Baca hari ini, Bu, cuma butuh sepuluh menit.', 'tersenyum', 'Sekar mengangguk mantap.') },
        { id: 'd', skillId: 'nasihat-dini', text: 'Lain kali jangan lupa juga harus ikut bicara keras di rapat besar ya.', reaction: mkLine('Aku bertahap mulai dari obrolan singkat dulu ya Bu.', 'netral', 'Sekar tersenyum sopan.') },
      ],
    },
    n12: {
      reply: mkLine('Aku mau tulis kartu 5 poin batas tegangan sekarang, lalu sampaikan dengan tenang sebelum pengujian sore.', 'tersenyum', 'Sekar menandai selembar kertas indeks kosong di bukunya.'),
      choices: [
        { id: 'a', skillId: 'afirmasi-kekuatan', best: true, setFlags: ['langkah-kecil'], text: 'Langkah yang lembut, terukur, dan berdampak langsung—hebat sekali, Sekar!', reaction: mkLine('Terima kasih Bu, aku merasa sangat didukung hari ini.', 'lega', 'Sekar tersenyum berseri.') },
        { id: 'b', skillId: 'pertanyaan-terbuka', setFlags: ['langkah-kecil'], text: 'Ada hal lain yang kamu butuhkan agar persiapan uji mutu sore nanti makin lancar?', reaction: mkLine('Cukup secangkir teh hangat dan sepuluh menit hening di Pojok Baca, Bu.', 'tersenyum', 'Sekar tertawa pelan.') },
        { id: 'c', skillId: 'batas-kerahasiaan', text: 'Kalau butuh tempat hening untuk menata pikiran lagi, pintu ruangan ini selalu aman dan rahasia.', reaction: mkLine('Terima kasih banyak Bu, senang sekali mendengarnya.', 'lega', 'Sekar mengangguk ramah.') },
        { id: 'd', skillId: 'janji-mutlak', text: 'Pasti seratus persen semua temanmu langsung menjadikanmu ketua uji mutu hari ini.', reaction: mkLine('Yang penting rangkaian mereka aman dulu saja, Bu.', 'netral', 'Sekar tersenyum lembut.') },
      ],
    },
    n13: {
      reply: mkLine('Terima kasih banyak ya Bu, sekarang aku tidak lagi merasa kecil hanya karena ritme belajarku lebih tenang.', 'lega', 'Sekar merapikan buku dan pulpennya dengan cermat.'),
      choices: [
        { id: 'a', skillId: 'pertanyaan-terbuka', best: true, text: 'Apa satu hal tentang dirimu hari ini yang paling ingin kamu syukuri, Sekar?', reaction: mkLine('Ketelitianku membaca referensi dan keberanian mencari cara komunikasi yang cocok dengan diriku sendiri.', 'tersenyum', 'Sekar mengucapkannya dengan suara teduh yang mantap.') },
        { id: 'b', skillId: 'validasi-normalisasi', text: 'Ketenanganmu justru memberi keseimbangan indah di laboratorium yang ramai ini.', reaction: mkLine('Terima kasih Bu, kalimat Ibu hangat sekali.', 'lega', 'Sekar tersenyum manis.') },
        { id: 'c', skillId: 'jeda-hening', text: 'Silakan simpan rasa tenang ini saat melangkah kembali ke Pojok Baca.', reaction: mkLine('Siap Bu, terima kasih waktunya.', 'tersenyum', 'Sekar mengangguk sopan.') },
        { id: 'd', skillId: 'nasihat-dini', text: 'Jangan lupa nanti tetap belajar lebih cepat bicara ya.', reaction: mkLine('Aku atur pelan-pelan sesuai kenyamananku, Bu.', 'netral', 'Sekar tersenyum singkat.') },
      ],
    },
    n14: {
      reply: mkLine('Aku kembali ke Pojok Baca dulu ya Bu untuk menyiapkan kartu 5 poin uji mutunya. Terima kasih banyak!', 'tersenyum', 'Sekar berdiri dengan langkah ringan dan wajah cerah.'),
      choices: [
        { id: 'a', skillId: 'parafrase-ringkasan', best: true, text: 'Hari ini kamu menemukan jembatan antara riset sunyimu dan kebutuhan tim lewat kartu 5 poin. Semangat terus, Sekar!', reaction: mkLine('Terima kasih banyak Bu, sampai jumpa di lab!', 'lega', 'Sekar melambai lembut.') },
        { id: 'b', skillId: 'afirmasi-kekuatan', text: 'Terus jaga ketelitian dan ketenanganmu ya, laboratorium ini butuh peneliti sepertimu!', reaction: mkLine('Siap Bu, terima kasih sudah menghargai caraku!', 'lega', 'Sekar tersenyum hangat.') },
        { id: 'c', skillId: 'validasi-normalisasi', text: 'Terima kasih sudah berbagi hari ini, silakan mampir lagi kapan pun kamu mau.', reaction: mkLine('Pasti Bu, permisi ya!', 'tersenyum', 'Sekar mengangguk ramah.') },
        { id: 'd', skillId: 'nasihat-dini', text: 'Segera serahkan catatannya sebelum sore biar tidak terlambat lagi.', reaction: mkLine('Baik Bu, aku permisi dulu.', 'netral', 'Sekar keluar dengan langkah tenang.') },
      ],
    },
  },
  tension: {
    awalReply: mkLine('Aku peduli sekali sama kelompokku, Bu—kenapa ketenanganku malah disangka tidak suka bergaul?', 'menutup-diri', 'Sekar memeluk buku catatannya erat dengan tatapan kecewa.'),
    perbaikanReply: mkLine('Iya Bu... ucapan tadi memang sempat bikin aku merasa caraku belajar salah.', 'waspada', 'Sekar menghela napas pelan namun tetap mendengarkan.'),
  },
  endings: {
    terbantu: mkLine('Terima kasih banyak Bu! Aku siap menyusun kartu 5 poin uji mutu dengan tenang di Pojok Baca!', 'lega', 'Sekar keluar dengan senyum teduh penuh percaya diri.'),
    kemajuan: mkLine('Makasih ya Bu, aku coba ringkas dulu catatanku pelan-pelan.', 'netral', 'Sekar mengangguk sopan sebelum melangkah keluar.'),
    menarik: mkLine('Permisi Bu, aku kembali membaca sendiri saja di Pojok Baca.', 'menutup-diri', 'Sekar melangkah keluar dengan pandangan menunduk.'),
  },
});
