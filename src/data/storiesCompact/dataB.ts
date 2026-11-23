import { line, type CompactStudentScript } from './builder';

/**
 * Skrip 7-giliran yang ringkas, hangat, dan 100% menyambung untuk mhs-09 s.d. mhs-15.
 */
export const COMPACT_SCRIPTS_B: readonly CompactStudentScript[] = [
  // 09 — Gilang Ramadhan (Mudah tersinggung saat dikoreksi di depan kelompok)
  {
    studentId: 'mhs-09',
    firstName: 'Gilang',
    title: 'Cerita Gilang Ramadhan',
    labSceneTitle: 'Tepi Meja Diskusi',
    labSceneCaption: 'Gilang menyandarkan bahu menjauh dari Meja Diskusi sejak purwarupa mekaniknya dikomentari.',
    opening: line(
      'Iya, Bu? Aku lagi istirahat sebentar di pinggir saja. Tadi diskusi di meja agak panas.',
      'kesal',
      'Gilang melipat tangan di dada sambil menatap ke arah jendela.',
    ),
    t1: [
      {
        id: 'sapa', skillId: 'sapaan-hangat', best: true,
        text: 'Halo Gilang, boleh aku duduk di sebelahmu sebentar? Kelihatannya baru saja ada hal yang bikin kesal ya.',
        reply: line(
          'Silakan, Bu. Iya, jujur masih agak panas. Susah-susah aku uji purwarupa mekaniknya, eh langsung dipotong di depan semua orang.',
          'kesal',
          'Gilang menurunkan tangannya sedikit dan menghela napas.',
        ),
      },
      {
        id: 'terbuka', skillId: 'pertanyaan-terbuka',
        text: 'Apa yang barusan terjadi di Meja Diskusi sampai kamu memilih menepi dulu?',
        reply: line(
          'Rancanganku dikritik keras banget di depan tim, Bu. Seolah-olah aku kerja asal-asalan saja.',
          'kesal',
          'Gilang mengetuk lututnya pelan.',
        ),
      },
      {
        id: 'nasihat', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Namanya kerja kelompok ya wajar dikritik, Gilang. Jangan langsung baper begitu.',
        reply: line('Ibu belum dengar kejadiannya tapi langsung bilang aku baper?', 'kesal', 'Gilang menatap tajam.'),
      },
    ],
    t2: [
      {
        id: 'amati', skillId: 'sampaikan-pengamatan', best: true,
        options: { observationTone: 'faktual' },
        text: 'Kelihatannya kamu tetap berusaha menahan emosi dengan menepi dulu, meski rasanya masih mengganjal.',
        reply: line(
          'Iya Bu, daripada aku balas ngegas di depan anak-anak lain. Cuma di sini masih kedengaran suara mereka, bikin susah tenang.',
          'waspada',
          'Gilang melirik meja diskusi dengan rahang masih sedikit tegang.',
        ),
      },
      {
        id: 'validasi', skillId: 'validasi-normalisasi',
        text: 'Siapa pun pasti merasa nggak enak kalau usahanya dikomentari tajam di depan banyak orang.',
        reply: line(
          'Makasih sudah ngerti, Bu. Rasanya langsung jatuh banget harga diriku tadi. Boleh ngobrol di tempat sepi sebentar?',
          'lega',
          'Ekspresi Gilang mulai melunak.',
        ),
      },
      {
        id: 'tertutup', skillId: 'pertanyaan-tertutup',
        text: 'Yang mengkritik tadi Kevin lagi?',
        reply: line(
          'Iya, siapa lagi... tapi nggak enak bahas nama orang di tengah lab begini.',
          'kesal',
          'Gilang merendahkan suaranya.',
        ),
      },
    ],
    t3: [
      {
        id: 'privasi', skillId: 'batas-kerahasiaan', best: true,
        text: 'Yuk pindah ke Ruang Konsultasi biar lebih adem. Yang kamu ceritakan cuma di antara kita berdua.',
        reply: line(
          'Oke Bu, di sini jauh lebih enak. Jujur, aku nggak anti kritik kok. Aku cuma nggak tahan kalau cara ngomongnya kayak meremehkan seluruh usahaku di depan umum.',
          'menunduk',
          'Gilang duduk di Ruang Konsultasi dan mulai berbicara lebih tenang.',
        ),
      },
      {
        id: 'ajak', skillId: 'validasi-normalisasi',
        text: 'Kita pindah sebentar ke Ruang Konsultasi yuk, biar kamu bisa tarik napas dengan tenang.',
        reply: line(
          'Makasih Bu. Rasanya langsung agak dingin kepalaku di sini. Sebenarnya aku tuh berani ambil risiko uji alat biar cepat ketemu masalahnya, tapi malah dianggap ceroboh.',
          'cemas',
          'Gilang menyandarkan punggungnya di kursi.',
        ),
      },
      {
        id: 'janji', skillId: 'janji-mutlak', isMisstep: true,
        text: 'Ayo masuk, nanti aku panggil mereka supaya minta maaf ke kamu.',
        reply: line('Nggak usah sampai dipanggil gitu Bu, aku malah malu...', 'cemas', 'Gilang menggeleng.'),
      },
    ],
    t4: [
      {
        id: 'refleksi', skillId: 'refleksi-perasaan', best: true,
        options: { reflectionNuance: 'kecewa-kesal' },
        text: 'Kamu sebenarnya sudah berani turun tangan menguji purwarupa demi tim, jadi ketika yang disorot cuma kekurangannya, rasanya seperti usahamu tidak dihargai.',
        reply: line(
          'Iya, Bu! Pas banget! Aku jadi langsung defensif karena rasanya diriku yang dinilai gagal, bukan cuma sambungan mekaniknya. Padahal sebagian catatan teknis mereka... ya ada benarnya juga sih.',
          'tertegun',
          'Gilang menarik napas dalam dan menatap konselor lebih jujur.',
        ),
      },
      {
        id: 'terbuka', skillId: 'pertanyaan-terbuka',
        text: 'Kalau dipisahkan antara cara menyampaikannya dan isi koreksi teknisnya, mana bagian yang sebenarnya paling mengganggu?',
        reply: line(
          'Cara penyampaiannya yang di depan umum itu, Bu. Kalau soal koreksi sambungannya, sebenarnya aku setuju memang perlu diperkuat lagi.',
          'netral',
          'Gilang mengangguk pelan sambil merenung.',
        ),
      },
      {
        id: 'interogasi', skillId: 'interogasi', isMisstep: true,
        text: 'Tapi secara teknis, purwarupamu tadi memang ada salahnya kan?',
        reply: line('Ya memang ada, tapi bukan berarti pantas dipermalukan begitu!', 'kesal', 'Gilang kembali menegang.'),
      },
    ],
    t5: [
      {
        id: 'parafrase', skillId: 'parafrase-ringkasan', best: true,
        text: 'Jadi koreksi teknis itu tetap berguna buat alatnya, dan kamu juga berhak menyampaikan dengan tenang bahwa kamu lebih nyaman menerima masukan secara konstruktif.',
        reply: line(
          'Bener juga ya, Bu. Selama ini aku cuma punya dua mode: langsung meledak atau langsung pergi menjauh. Padahal aku bisa bilang baik-baik sambil tetap pakai masukan teknisnya.',
          'lega',
          'Senyum tipis akhirnya muncul di wajah Gilang.',
        ),
      },
      {
        id: 'validasi', skillId: 'validasi-normalisasi',
        text: 'Bisa memisahkan kritik terhadap karya dari nilai dirimu sendiri itu skill yang keren banget, Gilang.',
        reply: line(
          'Hehe, baru kerasa sih Bu sekarang. Tadi kepalaku terlalu panas buat bedain dua hal itu.',
          'tersenyum',
          'Bahu Gilang tampak jauh lebih santai.',
        ),
      },
      {
        id: 'tertutup', skillId: 'pertanyaan-tertutup',
        text: 'Sekarang emosimu sudah lebih tenang untuk kembali ke tim?',
        reply: line('Sudah jauh lebih adem, Bu.', 'lega', 'Gilang mengangguk.'),
      },
    ],
    t6: [
      {
        id: 'afirmasi', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Keberanianmu langsung menguji prototipe itu bikin tim cepat maju, Gilang. Langkah kecil apa yang mau kamu coba waktu balik ke Meja Diskusi nanti?',
        reply: line(
          'Aku mau cek lagi sambungan mekanik yang tadi dibahas, terus bilang ke tim: "Masukannya masuk akal, lain kali kasih tahu aku pelan-pelan ya biar kita enaknya bareng."',
          'tersenyum',
          'Gilang tersenyum mantap penuh percaya diri.',
        ),
      },
      {
        id: 'terbuka', skillId: 'pertanyaan-terbuka',
        text: 'Cara apa yang paling pas menurutmu untuk kembali masuk ke diskusi tanpa rasa canggung?',
        reply: line(
          'Langsung bawa revisi kecilnya sambil ngobrol santai, Bu. Biar semua lihat aku tetap fokus ke proyek, tapi juga jujur soal cara komunikasi.',
          'lega',
          'Gilang tersenyum lega.',
        ),
      },
      {
        id: 'nasihat', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Pokoknya nanti kamu minta maaf duluan saja biar cepat damai.',
        reply: line('Lho, kok aku yang harus langsung salahin diri sendiri, Bu?', 'kesal', 'Gilang mengerutkan kening.'),
      },
    ],
    t7: [
      {
        id: 'tutup', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Dewasa banget caramu menyikapinya, Gilang! Semangat lanjut uji purwarupanya ya.',
        reply: line(
          'Makasih banyak, Bu! Lega banget habis ngobrol—panasnya hilang semua. Aku balik ke tim sekarang ya!',
          'tersenyum',
          'Gilang berdiri tegap dan melangkah keluar dengan senyum cerah.',
        ),
      },
      {
        id: 'ringkas', skillId: 'parafrase-ringkasan',
        text: 'Ambil masukan teknisnya dan sampaikan batas komunikasi dengan tenang. Hebat, Gilang.',
        reply: line('Siap, Bu! Makasih banyak sudah dengerin.', 'lega', 'Gilang mengangguk hangat.'),
      },
      {
        id: 'singkat', skillId: 'sapaan-hangat',
        text: 'Semoga diskusinya makin kompak ya, Gilang.',
        reply: line('Makasih, Bu!', 'tersenyum', 'Gilang berpamitan ramah.'),
      },
    ],
    tensionOpening: line(
      'Ya sudahlah Bu, memang susah kalau dari awal sudah dianggap gampang marah.',
      'kesal',
      'Gilang membuang muka dan menyilangkan lengan.',
    ),
    tensionRecognized: line(
      'Oke Bu... makasih sudah mau dengar ceritaku dulu. Tadi aku memang masih kebawa emosi.',
      'netral',
      'Gilang menurunkan tangannya dan kembali duduk tenang.',
    ),
    endings: {
      terbantu: line('Makasih banyak Bu! Suasana hatiku jauh lebih adem, aku balik gabung tim sekarang.', 'tersenyum', 'Gilang tersenyum lega.'),
      kemajuanKecil: line('Makasih ya Bu, kepalaku sudah lebih dingin sekarang.', 'netral', 'Gilang mengangguk sopan.'),
      menarikDiri: line('Permisi dulu ya Bu, aku mau cari angin sebentar.', 'menutup-diri', 'Gilang pergi cepat.'),
    },
  },

  // 10 — Teguh Santosa (Mandiri sehat, menyiapkan uji kompetensi instrumentasi)
  {
    studentId: 'mhs-10',
    firstName: 'Teguh',
    title: 'Cerita Teguh Santosa',
    labSceneTitle: 'Gudang Alat & Kalibrasi',
    labSceneCaption: 'Teguh menata alat ukur elektronik dengan tenang di sudut gudang, jarang terlihat di koridor.',
    opening: line(
      'Selamat siang, Bu. Saya sedang mengecek kalibrasi multimeter untuk latihan uji kompetensi.',
      'netral',
      'Teguh merapikan kabel probe dengan sangat teliti lalu menyapa ramah.',
    ),
    t1: [
      {
        id: 'sapa', skillId: 'sapaan-hangat', best: true,
        text: 'Siang, Teguh! Rapi banget alat-alatnya. Gimana kabarmu hari ini—nyaman kerja di suasana tenang begini?',
        reply: line(
          'Alhamdulillah nyaman sekali, Bu. Saya memang lebih mudah fokus di sudut yang sunyi, tapi senang juga sekali-kali disapa.',
          'tersenyum',
          'Teguh tersenyum hangat dan meletakkan alat ukurnya.',
        ),
      },
      {
        id: 'terbuka', skillId: 'pertanyaan-terbuka',
        text: 'Kelihatannya kamu sedang serius menyiapkan uji kompetensi. Gimana persiapannya sejauh ini?',
        reply: line(
          'Secara teknis sudah cukup siap, Bu. Cuma kadang kepikiran juga soal bagian wawancara teknisnya nanti.',
          'netral',
          'Teguh memandang catatan kalibrasinya.',
        ),
      },
      {
        id: 'nasihat', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Kamu terlalu sering menyendiri di gudang, Teguh. Harus lebih sering bergaul dong.',
        reply: line('Saya nyaman bekerja tenang di sini, Bu, bukan berarti bermasalah.', 'waspada', 'Teguh menjawab sopan namun sedikit menjaga jarak.'),
      },
    ],
    t2: [
      {
        id: 'amati', skillId: 'sampaikan-pengamatan', best: true,
        options: { observationTone: 'faktual' },
        text: 'Aku perhatikan kamu tenang dan sangat produktif saat mandiri. Tapi waktu menyebut bagian wawancara tadi, nadamu sedikit berubah—ada yang mengganjal?',
        reply: line(
          'Wah, Ibu jeli sekali. Iya, saya terbiasa langsung praktik dengan alat, tapi kalau harus menjelaskan langkah kerja ke penguji secara lisan, kadang saya malah kaku.',
          'tertegun',
          'Teguh tersenyum kecil sambil mengangguk.',
        ),
      },
      {
        id: 'validasi', skillId: 'validasi-normalisasi',
        text: 'Nyaman bekerja mandiri itu bukan kekurangan kok, Teguh. Justru banyak ahli instrumentasi yang punya ketenangan sepertimu.',
        reply: line(
          'Terima kasih, Bu. Senang dengar itu. Cuma untuk uji kompetensi nanti ada sesi tanya jawab lisan yang lumayan bikin saya mikir.',
          'lega',
          'Bahu Teguh tampak makin rileks.',
        ),
      },
      {
        id: 'tertutup', skillId: 'pertanyaan-tertutup',
        text: 'Uji kompetensinya masih lama atau sudah dekat?',
        reply: line(
          'Dua minggu lagi, Bu. Lumayan dekat, makanya saya ngebut latihan sendiri di sini.',
          'netral',
          'Teguh melihat catatan jadwalnya.',
        ),
      },
    ],
    t3: [
      {
        id: 'privasi', skillId: 'batas-kerahasiaan', best: true,
        text: 'Kalau mau ngobrol santai sebentar di Ruang Konsultasi biar lebih nyaman, yuk. Tanpa gangguan siapa-siapa.',
        reply: line(
          'Boleh, Bu, sekalian saya rehat lima menit. Di ruang ini tenang sekali... jujur saya nyaman sendiri, tapi sadar juga kalau latihan bicara di depan orang tetap butuh teman latihan.',
          'tersenyum',
          'Teguh duduk tenang di Ruang Konsultasi.',
        ),
      },
      {
        id: 'ajak', skillId: 'validasi-normalisasi',
        text: 'Yuk duduk sebentar di Ruang Konsultasi, sekalian kamu istirahat mata dari layar ukur.',
        reply: line(
          'Terima kasih, Bu. Nah, pas sekali suasananya. Sebenarnya saya cuma khawatir saat ditanya penguji nanti, saya bingung menyusun penjelasan meski praktiknya hafal.',
          'netral',
          'Teguh melipat tangannya dengan sopan.',
        ),
      },
      {
        id: 'janji', skillId: 'janji-mutlak', isMisstep: true,
        text: 'Ayo masuk, dijamin kamu pasti lulus sertifikasi dengan nilai sempurna.',
        reply: line('Hasilnya tetap bergantung pada latihan saya nanti, Bu.', 'waspada', 'Teguh tersenyum tipis.'),
      },
    ],
    t4: [
      {
        id: 'refleksi', skillId: 'refleksi-perasaan', best: true,
        options: { reflectionNuance: 'ragu-kurang-percaya' },
        text: 'Kamu sangat menguasai praktiknya, hanya belum terbiasa menerjemahkan proses di kepalamu menjadi penjelasan lisan di depan orang lain.',
        reply: line(
          'Tepat sekali, Bu. Biasanya saya kerja dalam diam. Kalau tiba-tiba disuruh menjelaskan dari awal, takutnya terpotong-potong dan penguji mengira saya tidak paham.',
          'lega',
          'Teguh mengangguk mantap merasa dipahami.',
        ),
      },
      {
        id: 'terbuka', skillId: 'pertanyaan-terbuka',
        text: 'Menurutmu, situasi latihan seperti apa yang tetap nyaman buatmu yang menyukai ketenangan?',
        reply: line(
          'Kalau ramai-ramai pasti saya tidak nyaman, Bu. Tapi kalau cuma berdua dengan satu teman yang teliti, misalnya Maya atau Bima, saya rasa jauh lebih enak untuk simulasi.',
          'tersenyum',
          'Teguh tampak menemukan ide yang cocok dengan gayanya.',
        ),
      },
      {
        id: 'interogasi', skillId: 'interogasi', isMisstep: true,
        text: 'Kenapa kamu nggak ikut diskusi kelompok besar saja biar terbiasa ngomong?',
        reply: line('Saya sudah coba dulu, Bu, tapi suasana ramai justru bikin saya cepat lelah.', 'menutup-diri', 'Teguh menunduk sopan.'),
      },
    ],
    t5: [
      {
        id: 'parafrase', skillId: 'parafrase-ringkasan', best: true,
        text: 'Jadi kamu tidak perlu memaksakan diri jadi ramai—cukup latihan berdua dalam suasana tenang agar terbiasa menjelaskan langkah kalibrasimu secara runtut.',
        reply: line(
          'Nah, itu cocok sekali dengan karakter saya, Bu! Tidak menguras tenaga, tapi langsung kena ke kebutuhan uji kompetensi.',
          'tersenyum',
          'Wajah Teguh tampak lega dan puas.',
        ),
      },
      {
        id: 'validasi', skillId: 'validasi-normalisasi',
        text: 'Mengenali ritme nyamanmu sendiri itu justru kekuatan, Teguh. Latihan satu-lawan-satu jauh lebih efektif buatmu.',
        reply: line(
          'Benar, Bu. Saya juga bisa sekalian bantu teman memahami kalibrasi alat ukur.',
          'lega',
          'Teguh mengangguk hangat.',
        ),
      },
      {
        id: 'tertutup', skillId: 'pertanyaan-tertutup',
        text: 'Sudah kepikiran mau ajak siapa untuk latihan singkat minggu ini?',
        reply: line('Maya atau Bima biasanya tenang dan enak diajak diskusi singkat, Bu.', 'netral', 'Teguh tersenyum.'),
      },
    ],
    t6: [
      {
        id: 'afirmasi', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Ketelitianmu merawat alat ukur itu sudah level teknisi profesional, Teguh. Satu langkah kecil apa yang mau kamu mulai minggu ini?',
        reply: line(
          'Besok saya mau ajak Maya atau Bima simulasi tanya-jawab kalibrasi 15 menit saja, sambil saya catat poin-poin inti biar lancar menjelaskan.',
          'tersenyum',
          'Teguh tersenyum mantap.',
        ),
      },
      {
        id: 'terbuka', skillId: 'pertanyaan-terbuka',
        text: 'Langkah persiapan ringan apa yang terasa paling pas buatmu?',
        reply: line(
          'Latihan menjelaskan tiga prosedur kalibrasi ke satu teman selama 15 menit besok siang, Bu. Singkat dan terukur.',
          'lega',
          'Teguh mengangguk tenang.',
        ),
      },
      {
        id: 'nasihat', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Kamu harus mulai rajin nongkrong di Meja Diskusi setiap hari.',
        reply: line('Kalau setiap hari di tempat ramai, fokus saya malah buyar, Bu.', 'waspada', 'Teguh menggeleng sopan.'),
      },
    ],
    t7: [
      {
        id: 'tutup', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Simulasi 15 menit berdua itu pas banget dengan gayamu, Teguh! Semoga uji kompetensinya lancar jaya ya.',
        reply: line(
          'Terima kasih banyak, Bu. Obrolan singkat ini sangat menyegarkan. Saya izin kembali ke lab dan menyapa teman sebentar.',
          'tersenyum',
          'Teguh tersenyum hangat dan berdiri dengan tenang.',
        ),
      },
      {
        id: 'ringkas', skillId: 'parafrase-ringkasan',
        text: 'Latihan singkat 15 menit berdua untuk merapikan penjelasan lisanmu. Semangat, Teguh!',
        reply: line('Baik Bu, terima kasih banyak waktunya.', 'lega', 'Teguh mengangguk sopan.'),
      },
      {
        id: 'singkat', skillId: 'sapaan-hangat',
        text: 'Sukses uji kompetensinya ya, Teguh.',
        reply: line('Terima kasih, Bu!', 'tersenyum', 'Teguh berpamitan ramah.'),
      },
    ],
    tensionOpening: line(
      'Saya nyaman dengan cara kerja saya, Bu. Mohon maaf, saya kembali ke gudang alat dulu.',
      'menutup-diri',
      'Teguh merapikan catatannya dengan raut datar.',
    ),
    tensionRecognized: line(
      'Terima kasih sudah menghargai gaya kerja saya, Bu. Saya menghargainya.',
      'netral',
      'Sikap Teguh kembali hangat dan terbuka.',
    ),
    endings: {
      terbantu: line('Terima kasih, Bu! Saya merasa lebih siap dan segar untuk melanjutkan hari ini.', 'tersenyum', 'Teguh tersenyum tenang.'),
      kemajuanKecil: line('Terima kasih atas waktunya, Bu.', 'netral', 'Teguh mengangguk sopan.'),
      menarikDiri: line('Permisi, Bu. Saya kembali mengecek alat.', 'menutup-diri', 'Teguh beranjak tenang.'),
    },
  },

  // 11 — Maya Puspita (Mandiri sehat, ingin sesekali bertukar gagasan dengan mentor)
  {
    studentId: 'mhs-11',
    firstName: 'Maya',
    title: 'Cerita Maya Puspita',
    labSceneTitle: 'Meja Analisis Sensor',
    labSceneCaption: 'Maya membaca pola grafik data sensor sendiri di pojok meja dengan catatan rapi penuh ide.',
    opening: line(
      'Hai Bu! Aku lagi membandingkan grafik sinyal sensor kemarin sama pagi ini—ternyata polanya menarik banget.',
      'tersenyum',
      'Maya memutar sedikit buku catatannya yang penuh grafik rapi.',
    ),
    t1: [
      {
        id: 'sapa', skillId: 'sapaan-hangat', best: true,
        text: 'Halo Maya, teliti sekali catatanmu! Gimana kabarmu hari ini di sudut tenang ini?',
        reply: line(
          'Baik Bu, betah banget di sini. Cuma kadang habis nemu pola unik begini, aku bingung mau cerita atau diskusiin ke siapa ya.',
          'netral',
          'Maya mengetuk pelan ujung pensilnya ke grafik.',
        ),
      },
      {
        id: 'terbuka', skillId: 'pertanyaan-terbuka',
        text: 'Wah, pola menarik apa yang baru saja kamu temukan di data itu?',
        reply: line(
          'Ada lonjakan kecil tiap suhu ruang naik, Bu. Pengin banget bahas ide ini bareng mentor, tapi aku agak canggung mulai duluan.',
          'cemas',
          'Maya tersenyum malu sambil melihat catatannya.',
        ),
      },
      {
        id: 'nasihat', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Jangan kerja di pojok terus, Maya. Gabung ke meja tengah biar gampang diskusi.',
        reply: line('Kalau di meja tengah terlalu berisik, aku malah nggak bisa baca datanya, Bu...', 'waspada', 'Maya mengerutkan kening.'),
      },
    ],
    t2: [
      {
        id: 'amati', skillId: 'sampaikan-pengamatan', best: true,
        options: { observationTone: 'faktual' },
        text: 'Kelihatannya kamu punya banyak gagasan segar di buku itu, cuma masih ragu bagaimana cara membawanya ke obrolan tanpa kehilangan ketenanganmu.',
        reply: line(
          'Iya banget, Bu! Aku nggak suka forum yang ramai berebut bicara, tapi diam-diam pengin punya teman tukar pikiran yang nyambung.',
          'lega',
          'Maya mengangguk antusias.',
        ),
      },
      {
        id: 'validasi', skillId: 'validasi-normalisasi',
        text: 'Butuh ruang tenang untuk berpikir sekaligus butuh satu-dua teman diskusi itu kombinasi yang sehat banget, Maya.',
        reply: line(
          'Hehe, syukurlah kalau itu wajar, Bu. Kadang aku kira aku aneh karena pengin ngobrol tapi nggak tahan keramaian.',
          'tersenyum',
          'Wajah Maya tampak lega.',
        ),
      },
      {
        id: 'tertutup', skillId: 'pertanyaan-tertutup',
        text: 'Kamu sudah sempat kasih lihat catatan itu ke senior atau dosen?',
        reply: line(
          'Belum, Bu... masih ragu-ragu mulai dari mana.',
          'menunduk',
          'Maya membalik halaman bukunya.',
        ),
      },
    ],
    t3: [
      {
        id: 'privasi', skillId: 'batas-kerahasiaan', best: true,
        text: 'Yuk pindah ke Ruang Konsultasi sebentar—suasananya tenang dan kamu bisa cerita idemu tanpa gangguan.',
        reply: line(
          'Wah cocok banget ruangannya, Bu! Jadi aku sebenarnya punya ide metode baca sensor yang lebih hemat waktu, tapi tiap mau nyapa Tania atau dosen di lab, keburu segan duluan.',
          'lega',
          'Maya membuka bukunya dengan nyaman di Ruang Konsultasi.',
        ),
      },
      {
        id: 'ajak', skillId: 'validasi-normalisasi',
        text: 'Kita lanjut ngobrol di Ruang Konsultasi yuk, tempatnya tenang seperti yang kamu suka.',
        reply: line(
          'Makasih, Bu. Nah, di sini enak... aku tuh ingin sekali bertukar ide sama mentor, tapi bingung cara membuka obrolan yang santai tanpa terasa memaksakan diri.',
          'netral',
          'Maya duduk rileks.',
        ),
      },
      {
        id: 'janji', skillId: 'janji-mutlak', isMisstep: true,
        text: 'Ayo masuk, nanti pasti idemu langsung dijadikan proyek utama lab.',
        reply: line('Eh, belum tentu sejauh itu juga Bu, masih ide awal kok...', 'cemas', 'Maya tersenyum canggung.'),
      },
    ],
    t4: [
      {
        id: 'refleksi', skillId: 'refleksi-perasaan', best: true,
        options: { reflectionNuance: 'ragu-kurang-percaya' },
        text: 'Kamu antusias banget dengan temuanmu, hanya sedikit ragu apakah idemu cukup matang untuk dibagikan.',
        reply: line(
          'Iya Bu! Selalu kepikiran "tunggu sempurna dulu deh baru kutunjukin". Eh, gara-gara nunggu sempurna, malah disimpan sendiri terus sampai energiku turun karena stuck.',
          'tertegun',
          'Maya tertawa kecil menyadari kebiasaannya sendiri.',
        ),
      },
      {
        id: 'terbuka', skillId: 'pertanyaan-terbuka',
        text: 'Kalau kamu memosisikan diri sebagai Tania atau mentor, gimana perasaanmu kalau ada adik tingkat datang membawa catatan grafik serapi ini?',
        reply: line(
          'Hmm... pasti senang sih Bu, karena kelihatan sudah usaha dan niat belajar! Oh iya ya, nggak harus langsung sempurna buat mulai diskusi.',
          'tersenyum',
          'Wajah Maya langsung berbinar.',
        ),
      },
      {
        id: 'interogasi', skillId: 'interogasi', isMisstep: true,
        text: 'Kenapa nggak dari minggu lalu langsung kamu tanyakan?',
        reply: line('Ya karena aku masih ragu-ragu tadi, Bu...', 'menunduk', 'Maya mengecilkan suaranya.'),
      },
    ],
    t5: [
      {
        id: 'parafrase', skillId: 'parafrase-ringkasan', best: true,
        text: 'Jadi diskusi justru tempat untuk mematangkan ide bareng, bukan ujian yang menuntut idemu sempurna dulu.',
        reply: line(
          'Kalimat itu bikin plong banget, Bu! Dan aku tetap bisa pilih diskusi berdua saja yang tenang, nggak harus di forum besar.',
          'lega',
          'Maya mengangguk mantap penuh semangat.',
        ),
      },
      {
        id: 'validasi', skillId: 'validasi-normalisasi',
        text: 'Berbagi ide mentah dengan satu orang yang kamu percaya itu cara paling ramah untuk berkembang.',
        reply: line(
          'Betul Bu, aku merasa jauh lebih ringan membayangkannya sekarang.',
          'tersenyum',
          'Maya tersenyum hangat.',
        ),
      },
      {
        id: 'tertutup', skillId: 'pertanyaan-tertutup',
        text: 'Jadi mau coba tunjukkan catatanmu ke Tania minggu ini?',
        reply: line('Iya Bu, Tania sabar dan enak diajak ngobrol berdua.', 'tersenyum', 'Maya mengangguk.'),
      },
    ],
    t6: [
      {
        id: 'afirmasi', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Kepekaanmu membaca pola data itu langka banget, Maya. Langkah kecil apa yang mau kamu coba duluan?',
        reply: line(
          'Habis ini aku mau pilih satu grafik yang paling menarik, lalu ajak Tania atau Teguh diskusi santai sepuluh menit di sudut tenang!',
          'tersenyum',
          'Maya menandai satu halaman terbaik di buku catatannya.',
        ),
      },
      {
        id: 'terbuka', skillId: 'pertanyaan-terbuka',
        text: 'Satu langkah ringan apa yang paling nyaman buatmu lakukan hari ini?',
        reply: line(
          'Tunjukin satu grafik saja ke Tania saat jeda nanti, sekalian tukar pendapat. Kecil tapi pasti seru!',
          'lega',
          'Maya tersenyum antusias.',
        ),
      },
      {
        id: 'nasihat', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Langsung bikin presentasi besar saja di depan seluruh kelas besok.',
        reply: line('Aduh, kalau langsung di depan semua orang aku belum nyaman, Bu...', 'cemas', 'Maya menggeleng.'),
      },
    ],
    t7: [
      {
        id: 'tutup', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Ide yang brilian, Maya! Tetap jaga ruang tenangmu sambil membuka jendela kecil untuk berbagi gagasan ya.',
        reply: line(
          'Makasih banyak, Bu! Aku jadi semangat banget sekarang. Mau langsung nyari Tania sebentar di lab!',
          'tersenyum',
          'Maya berdiri dengan senyum cerah dan langkah ringan.',
        ),
      },
      {
        id: 'ringkas', skillId: 'parafrase-ringkasan',
        text: 'Pilih satu grafik lalu diskusi santai sepuluh menit dengan Tania. Semangat ya, Maya!',
        reply: line('Siap Bu, terima kasih banyak sudah dengerin!', 'lega', 'Maya tersenyum lembut.'),
      },
      {
        id: 'singkat', skillId: 'sapaan-hangat',
        text: 'Semoga diskusinya seru ya, Maya.',
        reply: line('Makasih banyak, Bu!', 'tersenyum', 'Maya berpamitan ceria.'),
      },
    ],
    tensionOpening: line(
      'Iya Bu, aku memang lebih cocok kerja sendiri saja sepertinya.',
      'menutup-diri',
      'Maya menutup buku grafiknya dengan pelan.',
    ),
    tensionRecognized: line(
      'Makasih Bu, aku memang butuh cara diskusi yang tetap tenang dan nggak terburu-buru.',
      'netral',
      'Maya tersenyum tipis kembali rileks.',
    ),
    endings: {
      terbantu: line('Makasih banyak Bu! Ideku terasa hidup lagi, aku mau ngobrol sama teman dulu.', 'tersenyum', 'Maya melangkah ceria.'),
      kemajuanKecil: line('Makasih waktunya ya Bu, aku jadi punya gambaran.', 'netral', 'Maya mengangguk sopan.'),
      menarikDiri: line('Permisi dulu ya Bu, aku balik ke meja sensor.', 'menutup-diri', 'Maya pergi pelan.'),
    },
  },

  // 12 — Sari Melati (Populer & selalu menengahi kelompok hingga diam-diam kelelahan)
  {
    studentId: 'mhs-12',
    firstName: 'Sari',
    title: 'Cerita Sari Melati',
    labSceneTitle: 'Meja Diskusi',
    labSceneCaption: 'Meja Diskusi baru saja selesai ramai; Sari masih tersenyum ramah meski bahunya tampak sangat lesu.',
    opening: line(
      'Hai Bu! Wah, pas banget baru kelar mediasi tim firmware sama hardware. Semuanya aman kok, Bu!',
      'tersenyum',
      'Sari memutar pulpennya sambil menyembunyikan helaan napas panjang.',
    ),
    t1: [
      {
        id: 'sapa', skillId: 'sapaan-hangat', best: true,
        text: 'Halo Sari! Kamu selalu hadir untuk semua orang. Tapi aku mau tanya soal kamu sendiri—capek nggak hari ini?',
        reply: line(
          'Eh... jarang ada yang nanya begitu, Bu. Biasanya orang nanya "Sar, bantu ini dong". Jujur... lumayan pegal sih kepala dari pagi.',
          'lelah',
          'Senyum formal Sari melunak menjadi ekspresi letih yang jujur.',
        ),
      },
      {
        id: 'terbuka', skillId: 'pertanyaan-terbuka',
        text: 'Semua orang kelihatannya mengandalkanmu di meja ini. Gimana rasanya jadi penghubung buat semua tim?',
        reply: line(
          'Awalnya seru kok Bu, senang bikin suasana cair. Cuma belakangan ini... rasanya kayak bateraiku dipakai terus tapi lupa dicharge.',
          'lelah',
          'Sari menaruh pulpennya di meja dan menyenderkan bahu.',
        ),
      },
      {
        id: 'nasihat', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Kamu kan anak paling populer di lab, Sari. Masa baru segitu sudah capek?',
        reply: line('Hehe... iya sih Bu, nggak apa-apa kok. Aku kuat.', 'menutup-diri', 'Sari langsung memasang senyum kaku lagi.'),
      },
    ],
    t2: [
      {
        id: 'amati', skillId: 'sampaikan-pengamatan', best: true,
        options: { observationTone: 'faktual' },
        text: 'Barusan kamu langsung tersenyum ceria, tapi begitu tenang bahumu langsung turun. Rasanya berat ya harus selalu kelihatan baik-baik saja?',
        reply: line(
          'Duh, Ibu bisa lihat ya... iya Bu, rasanya berat. Tapi di Meja Diskusi ini sebentar lagi pasti ada yang manggil lagi, nggak enak kelihatan lemas.',
          'cemas',
          'Sari melirik ke arah koridor dengan wajah lelah.',
        ),
      },
      {
        id: 'validasi', skillId: 'validasi-normalisasi',
        text: 'Orang yang ramah dan aktif pun tetap manusia biasa yang bisa kehabisan tenaga, Sari.',
        reply: line(
          'Makasih sudah ngomong begitu, Bu... rasanya pengin duduk lima menit tanpa ada yang minta bantuan dulu.',
          'lega',
          'Sari mengembuskan napas panjang.',
        ),
      },
      {
        id: 'tertutup', skillId: 'pertanyaan-tertutup',
        text: 'Tadi teman-temanmu ribut lagi soal pembagian tugas?',
        reply: line(
          'Iya Bu, biasa deh... tapi nggak enak cerita di meja tengah begini.',
          'lelah',
          'Sari merapikan catatannya.',
        ),
      },
    ],
    t3: [
      {
        id: 'privasi', skillId: 'batas-kerahasiaan', best: true,
        text: 'Yuk istirahat sebentar di Ruang Konsultasi. Di sana nggak ada yang minta tolong, dan ceritamu aman di antara kita.',
        reply: line(
          'Ya ampun, hening banget di sini... makasih Bu. Jujur aku takut kalau aku bilang capek atau nggak ikut menengahi, nanti grupnya pecah dan aku nggak berguna lagi buat mereka.',
          'menunduk',
          'Sari duduk di Ruang Konsultasi dan akhirnya membiarkan bahunya benar-benar rileks.',
        ),
      },
      {
        id: 'ajak', skillId: 'validasi-normalisasi',
        text: 'Kita menepi sebentar ke Ruang Konsultasi yuk, giliran kamu yang didengarkan hari ini.',
        reply: line(
          'Boleh banget, Bu. Baru sadar sudah seminggu aku nggak punya waktu buat diriku sendiri—tiap ada yang beda pendapat, semua langsung nengok ke aku.',
          'lelah',
          'Sari duduk dan menyandarkan punggungnya.',
        ),
      },
      {
        id: 'janji', skillId: 'janji-mutlak', isMisstep: true,
        text: 'Ayo masuk, nanti semua konflik di lab langsung hilang biar kamu nggak capek lagi.',
        reply: line('Hehe, kalau lab tanpa beda pendapat sih kayaknya mustahil, Bu...', 'netral', 'Sari tersenyum kecut.'),
      },
    ],
    t4: [
      {
        id: 'refleksi', skillId: 'refleksi-perasaan', best: true,
        options: { reflectionNuance: 'lelah-kewalahan' },
        text: 'Kamu peduli banget sama keutuhan teman-temanmu, sampai tanpa sadar merasa seluruh kedamaian kelompok ada di pundakmu sendiri.',
        reply: line(
          'Iya Bu, persis itu! Aku capek banget pura-pura ceria terus. Padahal tugasku sendiri juga butuh fokus, dan kadang mereka sebenarnya bisa kok menyelesaikannya berdua tanpa aku.',
          'tertegun',
          'Mata Sari berkaca-kaca sedikit, lalu ia tersenyum lega.',
        ),
      },
      {
        id: 'terbuka', skillId: 'pertanyaan-terbuka',
        text: 'Kira-kira apa yang terjadi kalau sekali saja kamu memberi ruang pada dua temanmu untuk bicara langsung berdua?',
        reply: line(
          'Hmm... mungkin awalnya agak canggung, tapi mereka kan sama-sama dewasa, Bu! Aku saja yang selama ini refleks langsung loncat jadi penengah.',
          'tertegun',
          'Sari tampak memikirkan hal itu dengan tenang.',
        ),
      },
      {
        id: 'interogasi', skillId: 'interogasi', isMisstep: true,
        text: 'Kenapa kamu selalu ikut campur kalau orang lain berbeda pendapat?',
        reply: line('Bukan ikut campur, Bu! Mereka yang selalu manggil aku...', 'kesal', 'Sari menegangkan bahu.'),
      },
    ],
    t5: [
      {
        id: 'parafrase', skillId: 'parafrase-ringkasan', best: true,
        text: 'Jadi memberi jeda untuk dirimu sendiri bukan berarti kamu berhenti peduli—justru kamu memberi kesempatan temanmu ikut belajar berkomunikasi.',
        reply: line(
          'Betul banget, Bu! Dan aku juga tetap berharga di lab ini meski lagi nggak jadi "penengah darurat" hari itu.',
          'lega',
          'Senyum hangat yang benar-benar tulus kembali ke wajah Sari.',
        ),
      },
      {
        id: 'validasi', skillId: 'validasi-normalisasi',
        text: 'Teman-temanmu sayang sama kamu karena pribadimu, Sari, bukan cuma karena kamu selalu mengiyakan semuanya.',
        reply: line(
          'Aduh, terharu dengernya, Bu. Rasanya bateraiku langsung keisi lagi!',
          'tersenyum',
          'Sari tersenyum cerah.',
        ),
      },
      {
        id: 'tertutup', skillId: 'pertanyaan-tertutup',
        text: 'Mau coba ambil waktu istirahat khusus untuk dirimu sendiri hari ini?',
        reply: line('Mau banget, Bu!', 'tersenyum', 'Sari mengangguk cepat.'),
      },
    ],
    t6: [
      {
        id: 'afirmasi', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Kehangatanmu luar biasa, Sari—sekarang saatnya kamu berbagi kehangatan itu buat dirimu sendiri juga. Satu langkah kecil apa yang mau kamu coba?',
        reply: line(
          'Hari ini aku mau kasih jatah 30 menit tenang buat kerjain bagianku dulu, dan kalau ada yang ribut kecil, aku bilang ramah: "Kalian obrolin berdua dulu ya, nanti aku nyusul kalau butuh."',
          'tersenyum',
          'Sari tersenyum lega dengan mata berbinar.',
        ),
      },
      {
        id: 'terbuka', skillId: 'pertanyaan-terbuka',
        text: 'Batas kecil yang ramah seperti apa yang nyaman kamu ucapkan saat mulai lelah?',
        reply: line(
          'Bilang jujur saja "Aku rehat 20 menit dulu ya biar nggak oleng". Simpel tapi selama ini nggak pernah kucoba, hehe.',
          'lega',
          'Sari tertawa ringan.',
        ),
      },
      {
        id: 'nasihat', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Mulai besok jauhi saja Meja Diskusi dan kerja sendiri terus.',
        reply: line('Wah kalau dijauhin total, aku malah kehilangan semangat juga, Bu...', 'cemas', 'Sari menggeleng.'),
      },
    ],
    t7: [
      {
        id: 'tutup', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Keren banget, Sari! Ingat, penghubung paling hebat pun butuh mengisi ulang energinya sendiri.',
        reply: line(
          'Makasih banyak, Bu! Lega banget akhirnya bisa jujur tanpa harus jaga image. Aku balik ke lab dengan senyum beneran sekarang!',
          'tersenyum',
          'Sari berdiri segar dan melambai ceria.',
        ),
      },
      {
        id: 'ringkas', skillId: 'parafrase-ringkasan',
        text: 'Sisihkan jeda tenang untuk tugasmu dan beri teman ruang berdiskusi mandiri. Jaga energimu ya, Sari!',
        reply: line('Siap, Bu! Terima kasih banyak sudah dengerin aku.', 'lega', 'Sari tersenyum hangat.'),
      },
      {
        id: 'singkat', skillId: 'sapaan-hangat',
        text: 'Jangan lupa rehat ya, Sari.',
        reply: line('Iya Bu, makasih banyak!', 'tersenyum', 'Sari berpamitan hangat.'),
      },
    ],
    tensionOpening: line(
      'Haha, nggak apa-apa kok Bu, aku baik-baik saja. Aku balik ke meja teman-teman dulu ya.',
      'menutup-diri',
      'Sari kembali memasang senyum kaku dan bersiap pergi.',
    ),
    tensionRecognized: line(
      'Makasih Bu... jujur aku memang lagi capek banget cuma malu ngakuinnya.',
      'menunduk',
      'Sari mengembuskan napas panjang dan kembali duduk.',
    ),
    endings: {
      terbantu: line('Makasih banyak Bu! Energiku balik penuh lagi, kali ini dengan ritme yang lebih sehat!', 'tersenyum', 'Sari melangkah ceria.'),
      kemajuanKecil: line('Makasih ya Bu, lumayan bikin lega sebentar.', 'netral', 'Sari tersenyum sopan.'),
      menarikDiri: line('Permisi dulu ya Bu, anak-anak kayaknya nyariin aku.', 'menutup-diri', 'Sari pergi cepat.'),
    },
  },

  // 13 — Nisa Nurhaliza (Selalu menampung curhatan teman hingga ikut terbebani emosional)
  {
    studentId: 'mhs-13',
    firstName: 'Nisa',
    title: 'Cerita Nisa Nurhaliza',
    labSceneTitle: 'Sudut Istirahat Lab',
    labSceneCaption: 'Nisa baru saja mendengarkan curhatan dua temannya bergantian, kini duduk terdiam menatap gelas airnya.',
    opening: line(
      'Siang, Bu! Ibu sendiri apa kabar? Sudah makan belum? Kayaknya hari Ibu padat banget juga deh.',
      'tersenyum',
      'Nisa tersenyum ramah sambil menggenggam gelas airnya, meski matanya tampak sedikit lelah.',
    ),
    t1: [
      {
        id: 'sapa', skillId: 'sapaan-hangat', best: true,
        text: 'Kabar Ibu baik, Nisa, makasih ya perhatiannya. Nah, sekarang gantian—Nisa sendiri gimana rasanya dari pagi?',
        reply: line(
          'Hehe, aku sih baik Bu... cuma habis dengerin cerita dua teman yang lagi mumet, rasanya kepalaku ikut penuh sedikit.',
          'lelah',
          'Nisa menunduk menatap permukaan air di gelasnya.',
        ),
      },
      {
        id: 'terbuka', skillId: 'pertanyaan-terbuka',
        text: 'Makasih sudah tanya, Nisa. Aku lihat dari tadi kamu setia menemani teman-teman bercerita—apa yang kamu rasakan sekarang?',
        reply: line(
          'Jujur agak berat di dada, Bu. Senang sih mereka percaya cerita ke aku, tapi kadang masalah mereka ikut kebawa sampai malam.',
          'cemas',
          'Nisa menarik napas pelan.',
        ),
      },
      {
        id: 'nasihat', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Jangan suka dengerin curhatan orang kalau bikin kamu ikut stres, Nisa.',
        reply: line('Tapi mereka kan teman-temanku, Bu... nggak tega lah aku biarin.', 'menutup-diri', 'Nisa menunduk murung.'),
      },
    ],
    t2: [
      {
        id: 'amati', skillId: 'sampaikan-pengamatan', best: true,
        options: { observationTone: 'faktual' },
        text: 'Bahkan tadi kalimat pertamamu langsung menanyakan kabar Ibu dulu. Kamu peka sekali sama perasaan orang lain—sampai perasaanmu sendiri kadang dinomorduakan ya?',
        reply: line(
          'Eh... iya juga ya, Bu. Aku terbiasa jadi tempat cerita, sampai lupa kalau aku sendiri juga lagi capek. Boleh ngobrol di dalam nggak, Bu? Takut temanku yang tadi lewat.',
          'tertegun',
          'Nisa melirik pintu ruang istirahat dengan suara pelan.',
        ),
      },
      {
        id: 'validasi', skillId: 'validasi-normalisasi',
        text: 'Menampung cerita berat dari banyak orang memang bisa menguras energi emosional, Nisa. Itu manusiawi sekali.',
        reply: line(
          'Dengar Ibu bilang gitu bikin lega... aku kira aku yang kurang ikhlas bantu teman. Boleh kita pindah ke tempat yang lebih sepi?',
          'lega',
          'Nisa mengangguk lembut.',
        ),
      },
      {
        id: 'tertutup', skillId: 'pertanyaan-tertutup',
        text: 'Kamu sering merasa lelah setelah jadi tempat curhat?',
        reply: line(
          'Sering, Bu... tapi sungkan cerita di sini, takut kedengaran mereka.',
          'menunduk',
          'Nisa merapatkan gelasnya.',
        ),
      },
    ],
    t3: [
      {
        id: 'privasi', skillId: 'batas-kerahasiaan', best: true,
        text: 'Yuk masuk ke Ruang Konsultasi. Semua yang kamu ceritakan aman di sini, hari ini giliran Nisa yang boleh lega.',
        reply: line(
          'Makasih banyak, Bu... rasanya hangat banget akhirnya boleh duduk dan nggak harus mikirin solusi buat orang lain. Jujur aku takut kalau aku bilang lagi nggak sanggup dengerin, mereka merasa aku nggak peduli.',
          'lega',
          'Nisa duduk di Ruang Konsultasi dengan bahu yang mulai turun santai.',
        ),
      },
      {
        id: 'ajak', skillId: 'validasi-normalisasi',
        text: 'Ayo duduk nyaman di Ruang Konsultasi, kita ngobrol santai berdua saja.',
        reply: line(
          'Iya Bu, makasih. Jadi aku tuh serba salah—pengin selalu ada buat teman, tapi tugas dan energiku sendiri makin habis karena ikut mikirin beban mereka.',
          'lelah',
          'Nisa menghela napas dalam.',
        ),
      },
      {
        id: 'janji', skillId: 'janji-mutlak', isMisstep: true,
        text: 'Ayo masuk, nanti pasti beban teman-temanmu nggak akan membebanimu lagi selamanya.',
        reply: line('Hmm, aku tetap peduli sama mereka kok Bu, cuma lagi capek saja...', 'waspada', 'Nisa tampak canggung.'),
      },
    ],
    t4: [
      {
        id: 'refleksi', skillId: 'refleksi-perasaan', best: true,
        options: { reflectionNuance: 'lelah-kewalahan' },
        text: 'Kepekaanmu itu tulus banget, Nisa—tapi ketika kamu ikut memikul beban mereka tanpa jeda, wajar kalau hatimu terasa penuh dan lelah.',
        reply: line(
          'Iya Bu... rasanya kayak gelas yang terus dituangin air sampai meluber. Aku nggak pernah tahu gimana bilang "aku butuh istirahat dulu" tanpa menyakiti mereka.',
          'menunduk',
          'Nisa mengangguk pelan dengan tatapan jujur.',
        ),
      },
      {
        id: 'terbuka', skillId: 'pertanyaan-terbuka',
        text: 'Menurutmu, apa bedanya mendengarkan teman dengan ikut menanggung masalah mereka sepenuhnya?',
        reply: line(
          'Oh... kalau mendengarkan, aku cukup nemenin ya Bu, nggak harus ikut stres semalaman cariin solusinya. Dan kalau memang berat, aku bisa ajak mereka cerita ke Ibu juga.',
          'tertegun',
          'Wajah Nisa tampak tercerahkan.',
        ),
      },
      {
        id: 'interogasi', skillId: 'interogasi', isMisstep: true,
        text: 'Kenapa kamu terus-terusan membiarkan mereka curhat padahal kamu tahu sedang capek?',
        reply: line('Karena aku nggak tega lihat teman sedih, Bu...', 'cemas', 'Nisa menunduk.'),
      },
    ],
    t5: [
      {
        id: 'parafrase', skillId: 'parafrase-ringkasan', best: true,
        text: 'Jadi kamu tetap bisa menjadi teman yang hangat, sambil jujur menjaga kapasitas energimu sendiri dan tidak memikul tanggung jawab yang bukan milikmu.',
        reply: line(
          'Melegakan banget dengar itu, Bu! Peduli itu nggak berarti harus mengosongkan diriku sendiri ya.',
          'tersenyum',
          'Senyum hangat dan jernih kembali di wajah Nisa.',
        ),
      },
      {
        id: 'validasi', skillId: 'validasi-normalisasi',
        text: 'Teman yang benar-benar menghargaimu pasti mau mengerti saat kamu sedang butuh waktu menenangkan diri.',
        reply: line(
          'Iya Bu, benar banget. Selama ini aku saja yang takut duluan.',
          'lega',
          'Nisa tersenyum lega.',
        ),
      },
      {
        id: 'tertutup', skillId: 'pertanyaan-tertutup',
        text: 'Sudah ada bayangan kalimat lembut kalau kamu lagi butuh jeda?',
        reply: line('Sudah mulai kebayang, Bu!', 'tersenyum', 'Nisa mengangguk.'),
      },
    ],
    t6: [
      {
        id: 'afirmasi', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Hati yang peka sepertimu itu anugerah, Nisa. Satu kebiasaan kecil apa yang mau kamu mulai biar energimu tetap terjaga?',
        reply: line(
          'Aku mau belajar bilang lembut: "Aku peduli sama kamu, boleh kita ngobrol habis aku beresin tugasku 30 menit lagi?" Dan kalau ada cerita yang terlalu berat, aku tawarkan ditemani ke Ruang BK!',
          'tersenyum',
          'Nisa tersenyum penuh rasa syukur dan lega.',
        ),
      },
      {
        id: 'terbuka', skillId: 'pertanyaan-terbuka',
        text: 'Langkah kecil apa yang paling nyaman untuk menjaga ruang dirimu mulai hari ini?',
        reply: line(
          'Ambil jeda minum dan tenang sendirian 15 menit tiap habis mendengarkan curhatan berat, terus berani jujur kalau aku lagi butuh waktu.',
          'lega',
          'Nisa mengangguk mantap.',
        ),
      },
      {
        id: 'nasihat', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Mulai sekarang tolak semua teman yang mau cerita masalah pribadi.',
        reply: line('Waduh, kalau nolak semua nanti hubunganku sama teman jadi dingin, Bu...', 'cemas', 'Nisa menggeleng.'),
      },
    ],
    t7: [
      {
        id: 'tutup', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Indah banget batas sehat yang kamu pilih, Nisa! Kapan pun kamu butuh gantian didengarkan, Ruang Dengar selalu terbuka buatmu.',
        reply: line(
          'Terima kasih banyak, Bu! Hatiku enteng banget sekarang. Aku balik ke lab dulu ya, siap beraktivitas lagi!',
          'tersenyum',
          'Nisa berdiri dengan senyum cerah dan langkah penuh semangat.',
        ),
      },
      {
        id: 'ringkas', skillId: 'parafrase-ringkasan',
        text: 'Tetap peduli sambil menjaga jeda dan batas sehatmu sendiri. Hebat, Nisa!',
        reply: line('Makasih banyak, Bu!', 'lega', 'Nisa tersenyum hangat.'),
      },
      {
        id: 'singkat', skillId: 'sapaan-hangat',
        text: 'Jaga diri baik-baik ya, Nisa.',
        reply: line('Siap Bu, terima kasih banyak!', 'tersenyum', 'Nisa berpamitan ramah.'),
      },
    ],
    tensionOpening: line(
      'Maaf Bu, aku malah jadi bingung. Aku balik ke ruang istirahat dulu ya.',
      'menutup-diri',
      'Nisa menunduk sambil menggenggam gelasnya.',
    ),
    tensionRecognized: line(
      'Makasih Bu... aku cuma takut dianggap teman yang egois kalau mulai jaga jarak sedikit.',
      'menunduk',
      'Nisa menarik napas pelan.',
    ),
    endings: {
      terbantu: line('Makasih banyak Bu! Rasanya hangat dan lega banget, aku balik ke lab ya!', 'tersenyum', 'Nisa melangkah ceria.'),
      kemajuanKecil: line('Makasih waktunya Bu, aku sudah lebih tenang sekarang.', 'netral', 'Nisa mengangguk lembut.'),
      menarikDiri: line('Permisi dulu ya Bu.', 'menutup-diri', 'Nisa pergi pelan.'),
    },
  },

  // 14 — Rani Safitri (Terisolasi-introver, takut dianggap bodoh, teliti menggambar skema)
  {
    studentId: 'mhs-14',
    firstName: 'Rani',
    title: 'Cerita Rani Safitri',
    labSceneTitle: 'Sudut Lab',
    labSceneCaption: 'Rani duduk sendiri di sudut meja; begitu melihat orang lewat, ia cepat-cepat menutup buku catatannya.',
    opening: line(
      'Eh... siang, Bu. Aku cuma lagi nyatet ulang skema rangkaian saja kok, bukan apa-apa.',
      'waspada',
      'Rani segera menutup setengah buku catatannya saat Dosen mendekat.',
    ),
    t1: [
      {
        id: 'sapa', skillId: 'sapaan-hangat', best: true,
        text: 'Halo Rani, santai saja ya—Ibu nggak bermaksud mengagetkan. Gimana kabarmu hari ini?',
        reply: line(
          'Baik kok Bu... maaf agak kaget tadi. Aku cuma lagi coba pahami rangkaian kemarin biar nggak salah lagi.',
          'cemas',
          'Rani sedikit melonggarkan genggamannya pada sampul buku.',
        ),
      },
      {
        id: 'terbuka', skillId: 'pertanyaan-terbuka',
        text: 'Kelihatannya kamu sedang serius menggambar skema. Lagi belajar bagian mana, Rani?',
        reply: line(
          'Bagian sensor dasar, Bu. Aku masih belajar pelan-pelan dari awal, jadi kucatat sendiri di belakang buku.',
          'menunduk',
          'Rani memutar ujung pulpennya dengan gugup.',
        ),
      },
      {
        id: 'nasihat', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Jangan menyendiri terus di pojok, Rani. Harus berani gabung sama teman-teman!',
        reply: line('Oh... iya Bu, maaf. Aku lanjut nyatet dulu ya.', 'menutup-diri', 'Rani langsung menarik bukunya menjauh.'),
      },
    ],
    t2: [
      {
        id: 'amati', skillId: 'sampaikan-pengamatan', best: true,
        options: { observationTone: 'faktual' },
        text: 'Tadi aku lihat kamu cepat-cepat menutup bukumu tiap ada teman lewat. Nggak nyaman ya kalau dilihat banyak orang di sini?',
        reply: line(
          'Ketahuan ya, Bu... iya, refleks saja. Di sini ramai banget, aku selalu kepikiran nanti teman-teman lihat dan ngira catatanku aneh.',
          'cemas',
          'Rani melirik dua temannya di meja seberang lalu merendahkan suara.',
        ),
      },
      {
        id: 'validasi', skillId: 'validasi-normalisasi',
        text: 'Wajar banget butuh tempat tenang saat sedang fokus memahami materi baru.',
        reply: line(
          'Makasih Bu nggak langsung nyalahin... jujur di tengah lab begini aku agak canggung ngobrol lama-lama.',
          'lega',
          'Bahu Rani sedikit turun.',
        ),
      },
      {
        id: 'tertutup', skillId: 'pertanyaan-tertutup',
        text: 'Kamu memang nggak nyaman ngobrol di area lab yang ramai?',
        reply: line(
          'Iya Bu, agak sesak rasanya kalau banyak orang lihat.',
          'menunduk',
          'Rani memandangi ujung meja.',
        ),
      },
    ],
    t3: [
      {
        id: 'privasi', skillId: 'batas-kerahasiaan', best: true,
        text: 'Kalau nyaman, kita pindah ke Ruang Konsultasi yuk, berdua saja. Ceritamu aman di antara kita, dan kamu boleh berhenti kapan saja.',
        reply: line(
          'Boleh berhenti kapan saja ya, Bu?... Oke, itu bikin jauh lebih tenang. Nah, di sini sepi. Sebenarnya... aku jarang berani nanya saat praktikum karena takut kedengaran bodoh.',
          'menunduk',
          'Rani duduk di Ruang Konsultasi sambil memegangi buku catatannya di pangkuan.',
        ),
      },
      {
        id: 'ajak', skillId: 'validasi-normalisasi',
        text: 'Wajar banget kurang nyaman di tempat ramai. Mau jalan pelan-pelan ke Ruang Konsultasi?',
        reply: line(
          'Iya Bu, pelan-pelan ya... wah ruangannya tenang. Jadi jujur saja, aku selalu kerjakan dan gambar ulang sendiri sampai malam karena takut bertanya di lab.',
          'cemas',
          'Rani mengembuskan napas pendek setelah duduk.',
        ),
      },
      {
        id: 'janji', skillId: 'janji-mutlak', isMisstep: true,
        text: 'Ayo ikut saja, dijamin 100% semua rasa takutmu langsung hilang habis ini!',
        reply: line('Hmm... aku nggak yakin bisa langsung hilang gitu, Bu...', 'waspada', 'Rani mengerutkan dahi.'),
      },
    ],
    t4: [
      {
        id: 'refleksi', skillId: 'refleksi-perasaan', best: true,
        options: { reflectionNuance: 'ragu-kurang-percaya' },
        text: 'Kamu sebenarnya pengin sekali belajar dengan baik, tapi rasa takut dinilai kurang pintar bikin kamu memilih diam dan menanggung semuanya sendiri.',
        reply: line(
          'Iya, Bu... persis banget. Nih, di halaman belakang ini aku gambar ulang rangkaian yang kemarin salah pakai pensil dan penggaris. Kayaknya sudah benar, tapi aku nggak berani nunjukin ke siapa-siapa.',
          'tertegun',
          'Rani membuka halaman belakang bukunya dengan dua tangan—skemanya sangat rapi dan teliti!',
        ),
      },
      {
        id: 'terbuka', skillId: 'pertanyaan-terbuka',
        text: 'Boleh aku lihat sedikit catatan yang tadi kamu kerjakan dengan tekun itu? Atau ceritakan saja bagian mana yang paling bikin deg-degan.',
        reply: line(
          'Ini, Bu... aku gambar ulang rangkaian kemarin pelan-pelan biar paham. Sebenarnya aku pengin nanya apakah ini sudah benar, tapi takut dianggap merepotkan dan bodoh.',
          'menunduk',
          'Rani membuka halaman belakang yang penuh skema rapi.',
        ),
      },
      {
        id: 'interogasi', skillId: 'interogasi', isMisstep: true,
        text: 'Kenapa kamu sampai takut banget sama teman sendiri? Mereka kan nggak pernah marahin kamu.',
        reply: line('Ibu nggak tahu rasanya jadi anak baru yang takut salah...', 'menutup-diri', 'Rani menutup bukunya cepat.'),
      },
    ],
    t5: [
      {
        id: 'afirmasi', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Rani, lihat deh skema yang kamu gambar ini—rapi dan teliti sekali! Orang yang belajar dengan kesungguhan sebesar ini sama sekali bukan "bodoh".',
        reply: line(
          'Beneran rapi ya, Bu?... Kemarin bahkan ada teman yang sempat bilang skemaku membantu kelompoknya, aku kira dia cuma basa-basi. Ternyata usahaku ada artinya juga ya.',
          'tersenyum',
          'Pipi Rani memerah hangat dan senyum tulus pertamanya muncul!',
        ),
      },
      {
        id: 'validasi', skillId: 'validasi-normalisasi',
        text: 'Wajar banget merasa gugup di tahun pertama, Rani. Tapi ketelitian catatanmu ini justru sesuatu yang sangat dibutuhkan di lab.',
        reply: line(
          'Makasih banyak, Bu... rasanya dada yang tadi sesak jadi lega banget. Aku jadi berani menatap catatanku tanpa malu lagi.',
          'lega',
          'Rani menatap halaman bukunya dengan senyum kecil.',
        ),
      },
      {
        id: 'tertutup', skillId: 'pertanyaan-tertutup',
        text: 'Rangkaian yang kamu gambar ulang ini sudah benar, kan?',
        reply: line('Kayaknya sudah, Bu... tinggal konfirmasi satu jalur saja.', 'netral', 'Rani mengangguk kecil.'),
      },
    ],
    t6: [
      {
        id: 'terbuka', skillId: 'pertanyaan-terbuka', best: true,
        text: 'Keren banget, Rani! Menurutmu, satu langkah kecil yang paling aman untuk kamu coba minggu ini apa—supaya kamu nggak terus sendirian?',
        reply: line(
          'Aku belum berani ngomong ke kelompok besar sih, Bu... tapi aku mau coba tunjukin skema ini ke Sari dulu buat minta dicek satu jalurnya. Kayaknya sama Sari aku lebih tenang.',
          'tersenyum',
          'Rani tersenyum hangat sambil menutup bukunya tanpa rasa takut.',
        ),
      },
      {
        id: 'parafrase', skillId: 'parafrase-ringkasan',
        text: 'Nggak perlu langsung ke semua orang kok. Mulai dari satu teman yang ramah menurutmu gimana?',
        reply: line(
          'Iya Bu! Aku mau coba nyapa Sari duluan di lab habis ini buat cek satu jalur rangkaianku.',
          'lega',
          'Rani mengangguk mantap.',
        ),
      },
      {
        id: 'nasihat', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Besok langsung maju ke depan papan tulis jelasin skemamu ke semua orang!',
        reply: line('Aduh jangan Bu, kalau langsung ke depan papan tulis aku gemetaran...', 'cemas', 'Rani kembali tegang.'),
      },
    ],
    t7: [
      {
        id: 'tutup', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Mulai dari satu orang yang bikin nyaman—itu langkah berani banget, Rani! Ibu bangga sama ketelitianmu. Kapan pun mau cerita lagi, mampir saja ya.',
        reply: line(
          'Makasih banyak, Bu! Aku nggak nyangka ngobrol di Ruang BK bisa sehangat ini. Energiku terasa penuh lagi—aku mau nyapa Sari di lab sekarang!',
          'tersenyum',
          'Rani berdiri dengan senyum cerah dan langkah yang jauh lebih percaya diri.',
        ),
      },
      {
        id: 'ringkas', skillId: 'parafrase-ringkasan',
        text: 'Jadi langkah kecilmu mulai dengan menunjukkan skema ke Sari. Pelan-pelan saja ya, Rani!',
        reply: line('Siap, Bu! Terima kasih banyak sudah mendengarkan dengan sabar.', 'lega', 'Rani tersenyum hangat.'),
      },
      {
        id: 'singkat', skillId: 'sapaan-hangat',
        text: 'Semangat ya Rani, kamu pasti bisa.',
        reply: line('Makasih banyak, Bu!', 'tersenyum', 'Rani berpamitan dengan senyum.'),
      },
    ],
    tensionOpening: line(
      'Oh... iya. Maaf Bu. Aku balik nyatet sendiri saja.',
      'menutup-diri',
      'Rani menutup bukunya rapat dan menggeser kursinya menjauh.',
    ),
    tensionRecognized: line(
      'Aku... kaget saja tadi, Bu. Rasanya kayak ketahuan salah di depan orang.',
      'menunduk',
      'Rani menghela napas pelan sambil melonggarkan pegangan pada bukunya.',
    ),
    endings: {
      terbantu: line('Makasih banyak Bu! Aku jauh lebih berani dan lega sekarang, mau nyapa Sari dulu!', 'tersenyum', 'Rani tersenyum cerah penuh energi.'),
      kemajuanKecil: line('Makasih ya Bu, hari ini lumayan bikin aku lebih tenang.', 'netral', 'Rani mengangguk pelan.'),
      menarikDiri: line('Permisi dulu ya Bu, aku balik ke mejaku.', 'menutup-diri', 'Rani pergi cepat sambil memeluk bukunya.'),
    },
  },

  // 15 — Naufal Hakim (Terabaikan, kecewa idenya sering dilewati saat rapat kelompok)
  {
    studentId: 'mhs-15',
    firstName: 'Naufal',
    title: 'Cerita Naufal Hakim',
    labSceneTitle: 'Sudut Cetak 3D',
    labSceneCaption: 'Naufal terdiam cukup lama di sudut meja Cetak 3D sambil memutar purwarupa unik dari komponen daur ulang.',
    opening: line(
      'Eh, siang Bu... nggak apa-apa kok, aku cuma lagi utak-atik sisa komponen bekas buat purwarupa sendiri.',
      'menunduk',
      'Naufal memutar rangka mungil di tangannya tanpa melirik meja rapat di belakangnya.',
    ),
    t1: [
      {
        id: 'sapa', skillId: 'sapaan-hangat', best: true,
        text: 'Halo Naufal! Unik banget bentuk purwarupamu. Gimana kabarmu hari ini?',
        reply: line(
          'Lumayan sih Bu... makasih sudah bilang unik. Jarang ada yang ngeh sama eksperimen kecilku di sudut sini.',
          'tertegun',
          'Naufal mengangkat pandangan sedikit dengan senyum tipis.',
        ),
      },
      {
        id: 'terbuka', skillId: 'pertanyaan-terbuka',
        text: 'Wah, kreatif banget pakai komponen daur ulang. Lagi bikin eksperimen apa, Naufal?',
        reply: line(
          'Cuma dudukan sensor hemat biaya, Bu. Kemarin sempat mau kuusulin di rapat kelompok, tapi nggak jadi.',
          'menunduk',
          'Naufal meletakkan purwarupanya pelan di meja.',
        ),
      },
      {
        id: 'nasihat', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Kamu harus lebih aktif ngomong di rapat kelompok, Naufal. Kalau diam terus ya nggak didengar.',
        reply: line('Aku sudah pernah ngomong kok Bu, cuma memang nggak digubris...', 'kesal', 'Naufal membuang muka.'),
      },
    ],
    t2: [
      {
        id: 'amati', skillId: 'sampaikan-pengamatan', best: true,
        options: { observationTone: 'faktual' },
        text: 'Tadi kamu sempat terdiam cukup lama di sudut ini sementara teman lain berdiskusi. Rasanya malas bergabung lagi ya?',
        reply: line(
          'Iya Bu, jujur jadi agak males. Dua kali rapat kemarin ideku langsung dilewati begitu saja. Nggak enak sih cerita keras-keras di sini.',
          'cemas',
          'Naufal melirik singkat ke arah Meja Diskusi.',
        ),
      },
      {
        id: 'validasi', skillId: 'validasi-normalisasi',
        text: 'Pasti kecewa banget kalau sudah capek-capek mikir gagasan, lalu merasa terlewat begitu saja.',
        reply: line(
          'Banget, Bu... rasanya percuma ikut duduk di sana. Boleh ngobrol sebentar di tempat tenang?',
          'lega',
          'Naufal menghela napas panjang.',
        ),
      },
      {
        id: 'tertutup', skillId: 'pertanyaan-tertutup',
        text: 'Idemu ditolak sama teman sekelompok kemarin?',
        reply: line(
          'Bukan ditolak langsung sih, lebih ke dilewati saja. Agak nggak enak bahas di sini, Bu.',
          'menunduk',
          'Naufal menyimpan purwarupanya di saku.',
        ),
      },
    ],
    t3: [
      {
        id: 'privasi', skillId: 'batas-kerahasiaan', best: true,
        text: 'Yuk pindah ke Ruang Konsultasi biar kamu bisa cerita leluasa. Obrolan kita aman di antara kita berdua.',
        reply: line(
          'Makasih Bu. Di sini enak... jadi gini, aku memang nggak jago ngomong cepat di rapat yang rame. Pas aku baru mau jelasin ide dudukan daur ulang ini, sudah keburu dipotong topik lain. Lama-lama aku capek dan milih diam.',
          'menunduk',
          'Naufal meletakkan purwarupa kecilnya di meja Ruang Konsultasi.',
        ),
      },
      {
        id: 'ajak', skillId: 'validasi-normalisasi',
        text: 'Kita lanjut di Ruang Konsultasi yuk, biar kamu bisa cerita tentang rancanganmu dengan tenang.',
        reply: line(
          'Boleh Bu. Sebenarnya aku suka banget bikin purwarupa cepat, tapi tiap rapat rasanya suaraku nggak pernah masuk hitungan.',
          'lelah',
          'Naufal duduk menyender dengan wajah murung.',
        ),
      },
      {
        id: 'janji', skillId: 'janji-mutlak', isMisstep: true,
        text: 'Ayo masuk, nanti Ibu pastikan idemu yang dipilih jadi proyek utama.',
        reply: line('Jangan dipaksa lewat Ibu dong, nanti teman-teman makin aneh lihat aku...', 'waspada', 'Naufal menggeleng.'),
      },
    ],
    t4: [
      {
        id: 'refleksi', skillId: 'refleksi-perasaan', best: true,
        options: { reflectionNuance: 'kecewa-kesal' },
        text: 'Rasanya seperti tidak terlihat ya—padahal kamu punya ide nyata yang sudah kamu wujudkan jadi bentuk fisik, bukan cuma omongan.',
        reply: line(
          'Iya, Bu! Persis banget! Aku memang kalah cepat kalau adu bicara, tapi kalau aku tunjukin barang jadinya langsung di meja... sebenarnya aku belum pernah bawa purwarupa ini pas rapat sih.',
          'tertegun',
          'Mata Naufal melebar kecil menatap purwarupa di tangannya.',
        ),
      },
      {
        id: 'terbuka', skillId: 'pertanyaan-terbuka',
        text: 'Waktu rapat kemarin, kamu menjelaskan idenya secara lisan saja atau sambil membawa contoh fisiknya?',
        reply: line(
          'Cuma ngomong pelan saja, Bu, barangnya masih di tas. Pas denger pertanyaannya... iya juga ya, orang mungkin belum kebayang kalau belum lihat barangnya langsung!',
          'tertegun',
          'Naufal memutar purwarupanya dengan ekspresi baru tersadar.',
        ),
      },
      {
        id: 'interogasi', skillId: 'interogasi', isMisstep: true,
        text: 'Kenapa kemarin nggak kamu potong balik saja biar mereka dengerin kamu?',
        reply: line('Aku nggak suka teriak-teriak di rapat, Bu...', 'kesal', 'Naufal menarik bahunya.'),
      },
    ],
    t5: [
      {
        id: 'afirmasi', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Bakatmu mengubah barang sederhana jadi purwarupa cepat itu keren banget, Naufal! Kadang karya nyata bicara jauh lebih kuat daripada suara paling keras di rapat.',
        reply: line(
          'Wah... baru kepikiran dari sisi itu, Bu! Kalau aku taruh purwarupa ini di meja sebelum rapat mulai, atau kasih lihat dulu ke Nisa dan satu teman lain, mereka pasti langsung paham maksudku!',
          'tersenyum',
          'Senyum bersemangat akhirnya kembali penuh di wajah Naufal.',
        ),
      },
      {
        id: 'parafrase', skillId: 'parafrase-ringkasan',
        text: 'Jadi kekecewaanmu wajar sekali, dan kekuatanmu justru ada pada membawa bukti fisik yang langsung bisa dilihat dan dipegang tim.',
        reply: line(
          'Betul banget, Bu! Aku nggak perlu jadi orang paling cerewet, cukup tunjukin hasilnya langsung.',
          'lega',
          'Naufal mengangguk mantap.',
        ),
      },
      {
        id: 'tertutup', skillId: 'pertanyaan-tertutup',
        text: 'Mau coba bawa purwarupa ini ke pertemuan berikutnya?',
        reply: line('Mau banget, Bu! Lebih pede kalau bawa barangnya.', 'tersenyum', 'Naufal mengangguk.'),
      },
    ],
    t6: [
      {
        id: 'terbuka', skillId: 'pertanyaan-terbuka', best: true,
        text: 'Langkah kecil pertama apa yang bikin kamu paling semangat untuk dicoba hari ini?',
        reply: line(
          'Habis ini aku mau tunjukin purwarupa dudukan ini dulu ke Nisa atau Hendra di lab biar dapat masukan ringan, baru nanti kubawa ke meja rapat kelompok!',
          'tersenyum',
          'Naufal mengangkat purwarupanya dengan bangga.',
        ),
      },
      {
        id: 'parafrase', skillId: 'parafrase-ringkasan',
        text: 'Jadi mulai dari menunjukkan ke satu teman yang nyaman dulu sebelum masuk ke rapat kelompok ya?',
        reply: line(
          'Iya Bu! Jauh lebih enak dan nggak bikin minder duluan.',
          'lega',
          'Naufal tersenyum lega.',
        ),
      },
      {
        id: 'nasihat', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Besok kamu harus langsung jadi pemimpin rapat biar semua orang mendengarkanmu.',
        reply: line('Waduh, kalau langsung mimpin rapat aku malah tambah grogi, Bu...', 'cemas', 'Naufal menggeleng.'),
      },
    ],
    t7: [
      {
        id: 'tutup', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Keren banget, Naufal! Jangan simpan kreativitasmu di sudut sendirian—teman-temanmu pasti terpukau lihat hasil karyamu.',
        reply: line(
          'Makasih banyak, Bu! Semangatku balik full lagi nih. Aku balik ke lab sekarang, mau tunjukin ini ke Nisa sama anak-anak!',
          'tersenyum',
          'Naufal berdiri dengan mata berbinar dan langkah yang sangat ringan.',
        ),
      },
      {
        id: 'ringkas', skillId: 'parafrase-ringkasan',
        text: 'Tunjukkan purwarupamu ke satu teman dulu lalu bawa ke rapat. Semangat berkarya, Naufal!',
        reply: line('Siap, Bu! Terima kasih banyak sudah menghargai ideku.', 'lega', 'Naufal tersenyum hangat.'),
      },
      {
        id: 'singkat', skillId: 'sapaan-hangat',
        text: 'Semangat terus ya, Naufal.',
        reply: line('Makasih banyak, Bu!', 'tersenyum', 'Naufal berpamitan ceria.'),
      },
    ],
    tensionOpening: line(
      'Ya sudah Bu, memang dari awal nggak ada yang benar-benar mau denger. Aku balik saja.',
      'menutup-diri',
      'Naufal memasukkan purwarupanya ke saku dengan wajah murung.',
    ),
    tensionRecognized: line(
      'Makasih Bu... aku cuma pengin ideku dilihat sekali saja tanpa langsung dilewati.',
      'menunduk',
      'Naufal kembali mengeluarkan purwarupanya pelan.',
    ),
    endings: {
      terbantu: line('Makasih banyak Bu! Energiku naik lagi—aku mau langsung tunjukin purwarupaku ke teman lab!', 'tersenyum', 'Naufal tersenyum lebar.'),
      kemajuanKecil: line('Makasih ya Bu, lumayan lega habis cerita.', 'netral', 'Naufal mengangguk tenang.'),
      menarikDiri: line('Permisi dulu ya Bu, aku balik ke sudut Cetak 3D.', 'menutup-diri', 'Naufal beranjak pelan.'),
    },
  },
];
