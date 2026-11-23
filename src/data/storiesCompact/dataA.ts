import { line, type CompactStudentScript } from './builder';

/**
 * Skrip 7-giliran yang ringkas, hangat, dan 100% menyambung untuk mhs-01 s.d. mhs-08.
 */
export const COMPACT_SCRIPTS_A: readonly CompactStudentScript[] = [
  // 01 — Raka Pratama (Koordinator IoT yang memikul semua sendiri)
  {
    studentId: 'mhs-01',
    firstName: 'Raka',
    title: 'Cerita Raka Pratama',
    labSceneTitle: 'Stasiun Elektronik & IoT',
    labSceneCaption: 'Raka berdiri di dekat papan sirkuit sambil berulang kali memeriksa daftar jadwal timnya.',
    opening: line(
      'Eh, siang Bu! Bentar ya, aku lagi ngecek dua poin terakhir di jadwal uji sensor. Minggu ini padat banget.',
      'tersenyum',
      'Raka mengetuk-ngetuk pulpen ke papan daftarnya sambil melirik jam tangan.',
    ),
    t1: [
      {
        id: 'sapa', skillId: 'sapaan-hangat', best: true,
        text: 'Halo Raka, semangat sekali ya. Gimana kabarmu hari ini di tengah jadwal padat itu?',
        reply: line(
          'Hehe, baik kok Bu... walau jujur kepalaku agak penuh. Baru saja kutandai tiga revisi, eh sudah ada lagi yang minta dicek.',
          'lelah',
          'Raka menghela napas pendek lalu menatap daftar tugas yang penuh coretan.',
        ),
      },
      {
        id: 'terbuka', skillId: 'pertanyaan-terbuka',
        text: 'Kelihatannya daftarnya panjang sekali. Lagi ada hal apa yang paling menyita pikiranmu?',
        reply: line(
          'Ini Bu, jadwal prototipe IoT timku. Tiap pagi sudah kususun rapi, tapi sorenya selalu ada saja yang meleset.',
          'netral',
          'Raka memutar pulpennya pelan sambil menunjuk tabel di kertasnya.',
        ),
      },
      {
        id: 'nasihat', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Kamu terlalu kaku bikin jadwal, Raka. Santai saja tidak usah dibikin ribet.',
        reply: line('Oh... begitu ya Bu. Maaf, aku lanjut beresin dulu.', 'menutup-diri', 'Senyum Raka langsung menghilang.'),
      },
    ],
    t2: [
      {
        id: 'amati', skillId: 'sampaikan-pengamatan', best: true,
        options: { observationTone: 'faktual' },
        text: 'Aku perhatikan tadi kamu beberapa kali melirik jam lalu menghela napas. Rasanya berat ya mengatur semuanya sendiri?',
        reply: line(
          'Ketahuan ya, Bu... iya, jujur terasa berat. Apalagi di lab ramai begini, aku nggak enak kelihatan kewalahan di depan anggota tim.',
          'cemas',
          'Raka merendahkan suaranya dan melirik sekilas ke meja teman-temannya.',
        ),
      },
      {
        id: 'validasi', skillId: 'validasi-normalisasi',
        text: 'Wajar banget capek kalau mengoordinasi proyek sebesar itu sendirian.',
        reply: line(
          'Makasih sudah ngerti, Bu. Sebenarnya pengin cerita lebih jujur, tapi di sini banyak anak tim lalu-lalang.',
          'lega',
          'Bahu Raka sedikit mengendur meski ia masih melirik sekeliling.',
        ),
      },
      {
        id: 'tertutup', skillId: 'pertanyaan-tertutup',
        text: 'Anggota timmu memang nggak ada yang bantu?',
        reply: line(
          'Bantu kok Bu, cuma... ah, nggak enak bahas tim di area terbuka begini.',
          'waspada',
          'Raka melipat kertas jadwalnya dengan cepat.',
        ),
      },
    ],
    t3: [
      {
        id: 'ajak-privat', skillId: 'batas-kerahasiaan', best: true,
        text: 'Kita pindah ke Ruang Konsultasi yuk, cuma berdua. Obrolan kita aman di antara kita, kecuali soal keselamatan.',
        reply: line(
          'Nah, di sini lebih tenang, Bu. Terima kasih ya sudah kasih tempat aman. Jujur, di kertas jadwalku ini... hampir semua kolom debug aku yang isi sendiri.',
          'lega',
          'Raka duduk di Ruang Konsultasi dan membentangkan jadwal penuh warna di meja.',
        ),
      },
      {
        id: 'ajak-hangat', skillId: 'validasi-normalisasi',
        text: 'Wajar banget butuh tempat tenang. Mau jalan pelan-pelan ke Ruang Konsultasi?',
        reply: line(
          'Boleh banget, Bu. Nah, akhirnya bisa napas lega di sini. Sebenarnya aku bingung... jadwal ini sudah kususun rapi, tapi hampir semua kerjaan berat tetap kupikul sendiri.',
          'netral',
          'Raka menyandarkan punggungnya di kursi Ruang Konsultasi.',
        ),
      },
      {
        id: 'janji', skillId: 'janji-mutlak', isMisstep: true,
        text: 'Ayo ikut saja, dijamin 100% semua masalah timmu langsung beres hari ini!',
        reply: line('Hmm... rasanya nggak semudah itu, Bu.', 'waspada', 'Raka mengerutkan kening.'),
      },
    ],
    t4: [
      {
        id: 'refleksi', skillId: 'refleksi-perasaan', best: true,
        options: { reflectionNuance: 'lelah-kewalahan' },
        text: 'Kedengarannya kamu lelah memikul beban tim, tapi sekaligus takut hasilnya rusak kalau dilepas ke orang lain.',
        reply: line(
          'Iya, persis banget, Bu! Sebenarnya... aku takut kalau proyek ini gagal, semua orang nyalahin aku sebagai koordinator. Jadi diam-diam aku begadang ngerjain bagian mereka juga.',
          'menunduk',
          'Raka menarik napas panjang, akhirnya menaruh pulpennya di meja.',
        ),
      },
      {
        id: 'terbuka', skillId: 'pertanyaan-terbuka',
        text: 'Apa yang paling kamu khawatirkan kalau sebagian tugas itu kamu bagikan ke anggota tim?',
        reply: line(
          'Aku takut hasilnya telat atau error pas demo, Bu. Sebagai koordinator rasanya nggak boleh bikin tim kecewa... akhirnya aku ambil semua sampai lupa istirahat.',
          'cemas',
          'Suara Raka melemah dan matanya menatap kolom istirahat yang kosong.',
        ),
      },
      {
        id: 'interogasi', skillId: 'interogasi', isMisstep: true,
        text: 'Kenapa sih kamu nggak percaya sama teman sendiri? Bukannya kalian satu tim?',
        reply: line('Bukan nggak percaya, Bu... ya sudahlah.', 'kesal', 'Raka melipat kertasnya kembali.'),
      },
    ],
    t5: [
      {
        id: 'parafrase', skillId: 'parafrase-ringkasan', best: true,
        text: 'Jadi rasa tanggung jawabmu yang besar justru membuatmu lupa memberi ruang untuk diri sendiri dan memberi kesempatan temanmu ikut belajar.',
        reply: line(
          'Iya juga ya, Bu... selama ini aku pikir melindungi mereka itu berarti ngerjain semuanya. Padahal akunya makin habis energinya, dan mereka malah nggak tahu aku butuh bantuan.',
          'tertegun',
          'Raka menatap jadwalnya dengan pandangan baru yang lebih jernih.',
        ),
      },
      {
        id: 'validasi', skillId: 'validasi-normalisasi',
        text: 'Niatmu menjaga tim itu baik sekali, Raka. Cuma tidak ada satu orang pun yang sanggup menanggung porsi lima orang terus-menerus.',
        reply: line(
          'Makasih sudah bilang begitu, Bu. Baru sadar juga, kalau aku tumbang duluan, timnya malah lebih repot lagi.',
          'lega',
          'Raka mengangguk pelan dengan senyum tipis.',
        ),
      },
      {
        id: 'tertutup', skillId: 'pertanyaan-tertutup',
        text: 'Berarti mulai besok kamu mau bagi tugas, kan?',
        reply: line(
          'Penginnya sih gitu Bu, walau masih mikir mulai dari bagian mana dulu.',
          'netral',
          'Raka mengetuk pelan pinggir jadwalnya.',
        ),
      },
    ],
    t6: [
      {
        id: 'afirmasi', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Kamu jago banget memetakan teknis sensor, Raka. Menurutmu, satu tugas kecil apa yang paling aman kamu percayakan ke teman minggu ini?',
        reply: line(
          'Hmm... dokumentasi uji dan cek kabel bisa kupercayakan ke Dimas dan Tania! Aku cukup dampingi di awal, lalu sisakan satu jam sore untuk benar-benar istirahat.',
          'tersenyum',
          'Raka langsung melingkari dua baris di kertas jadwalnya dengan mata berbinar.',
        ),
      },
      {
        id: 'terbuka', skillId: 'pertanyaan-terbuka',
        text: 'Langkah paling ringan apa yang bisa kamu coba di rapat tim nanti?',
        reply: line(
          'Aku mau jujur bilang butuh bantuan di bagian pengecekan kabel dan notulen, Bu. Rasanya jauh lebih masuk akal daripada kupikul semua.',
          'lega',
          'Raka tersenyum lega sambil melipat rapi kertasnya.',
        ),
      },
      {
        id: 'nasihat', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Pokoknya serahkan setengah tugasmu hari ini juga, titik.',
        reply: line('Kalau langsung setengah, aku malah makin panik, Bu...', 'cemas', 'Raka tampak ragu.'),
      },
    ],
    t7: [
      {
        id: 'tutup-hangat', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Langkah yang pas banget, Raka. Aku senang lihat kamu lebih lega—kalau mau cerita progresnya lagi nanti, pintuku selalu terbuka.',
        reply: line(
          'Makasih banyak, Bu! Rasanya seperti beban di pundakku turun setengah. Aku balik ke lab dulu ya, mau ngobrol bareng tim dengan kepala lebih ringan!',
          'tersenyum',
          'Raka berdiri dengan semangat baru dan melangkah keluar dengan senyum cerah.',
        ),
      },
      {
        id: 'tutup-ringkas', skillId: 'parafrase-ringkasan',
        text: 'Jadi rencanamu mulai dari berbagi tugas dokumentasi dan menjaga waktu istirahat. Semangat mencoba ya, Raka.',
        reply: line(
          'Siap, Bu! Terima kasih sudah mendengarkan tadi. Aku jadi lebih siap menghadapi rapat tim.',
          'lega',
          'Raka mengangguk mantap sebelum berpamitan.',
        ),
      },
      {
        id: 'tutup-singkat', skillId: 'sapaan-hangat',
        text: 'Oke, jaga kesehatan ya Raka.',
        reply: line('Iya Bu, makasih banyak sudah nemenin ngobrol.', 'tersenyum', 'Raka tersenyum sopan.'),
      },
    ],
    tensionOpening: line(
      'Maaf Bu, rasanya aku malah makin tertekan. Aku nggak bermaksud ribet kok...',
      'menutup-diri',
      'Raka memeluk map jadwalnya erat dan memalingkan pandangan.',
    ),
    tensionRecognized: line(
      'Iya Bu... aku cuma takut dikira nggak becus ngatur tim sendiri.',
      'menunduk',
      'Raka menghela napas pelan sambil menatap meja.',
    ),
    endings: {
      terbantu: line('Makasih banyak, Bu! Energiku balik lagi—aku mau langsung ngobrol santai sama tim dulu.', 'tersenyum', 'Raka tersenyum lebar penuh energi.'),
      kemajuanKecil: line('Makasih ya Bu, kepalaku sedikit lebih tenang. Nanti aku pikirkan pelan-pelan lagi.', 'netral', 'Raka mengangguk sopan sebelum kembali ke lab.'),
      menarikDiri: line('Aku permisi balik ke meja sensor dulu ya, Bu.', 'menutup-diri', 'Raka beranjak cepat tanpa menoleh lagi.'),
    },
  },

  // 02 — Dimas Aditya (Tekanan biaya kos sambil mengejar target praktikum)
  {
    studentId: 'mhs-02',
    firstName: 'Dimas',
    title: 'Cerita Dimas Aditya',
    labSceneTitle: 'Meja Solder Elektronik',
    labSceneCaption: 'Dimas duduk sendiri menyolder modul SMD, sesekali melirik layar ponsel lalu menghela napas.',
    opening: line(
      'Oh, siang Bu... maaf kaget. Aku lagi beresin solderan modul ini, sedikit lagi selesai kok.',
      'waspada',
      'Dimas cepat membalik layar ponselnya ke meja sambil memegang pinset solder.',
    ),
    t1: [
      {
        id: 'sapa', skillId: 'sapaan-hangat', best: true,
        text: 'Santai saja, Dimas. Gimana kabarmu hari ini? Sudah sempat istirahat atau makan siang?',
        reply: line(
          'Sudah kok Bu, tadi roti saja... sebenarnya agak capek sih, tapi tugas praktikum ini harus kelar sore ini.',
          'lelah',
          'Dimas menggosok pelan matanya lalu tersenyum canggung.',
        ),
      },
      {
        id: 'terbuka', skillId: 'pertanyaan-terbuka',
        text: 'Rapi sekali solderannya. Gimana jalannya minggu ini buatmu, Dimas?',
        reply: line(
          'Lumayan padat, Bu. Rasanya waktu sehari kurang terus buat ngejar praktikum sama urusan di luar lab.',
          'menunduk',
          'Dimas menatap ujung solder tanpa mengangkat pandangan.',
        ),
      },
      {
        id: 'nasihat', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Jangan main ponsel terus waktu praktikum, nanti komponennya malah rusak.',
        reply: line('Aku nggak lagi main-main, Bu... cuma ngecek pesan penting.', 'menutup-diri', 'Dimas menunduk kaku.'),
      },
    ],
    t2: [
      {
        id: 'amati', skillId: 'sampaikan-pengamatan', best: true,
        options: { observationTone: 'faktual' },
        text: 'Tadi aku lihat kamu sempat melirik ponsel lalu menghela napas panjang. Ada kabar yang bikin kepikiran?',
        reply: line(
          'Eh, kelihatan ya Bu... iya, ada pesan dari ibu kos. Tapi di sini agak ramai, aku malu kalau kedengaran anak-anak lain.',
          'cemas',
          'Dimas melirik teman-temannya di meja sebelah dengan wajah tegang.',
        ),
      },
      {
        id: 'validasi', skillId: 'validasi-normalisasi',
        text: 'Kelihatannya kamu lagi memikul cukup banyak hal sendirian hari ini.',
        reply: line(
          'Iya Bu, kepalaku bercabang ke mana-mana... cuma rasanya sungkan cerita di tengah lab begini.',
          'menunduk',
          'Dimas merapikan kabel sambil mengecilkan suaranya.',
        ),
      },
      {
        id: 'tertutup', skillId: 'pertanyaan-tertutup',
        text: 'Ada masalah di rumah atau di kos?',
        reply: line(
          'Di kos, Bu... tapi nggak enak cerita di sini, banyak orang.',
          'waspada',
          'Dimas memasukkan ponselnya ke saku jaket.',
        ),
      },
    ],
    t3: [
      {
        id: 'privasi', skillId: 'batas-kerahasiaan', best: true,
        text: 'Yuk pindah ke Ruang Konsultasi biar lebih nyaman. Yang kamu ceritakan tetap di antara kita berdua.',
        reply: line(
          'Makasih banyak, Bu... di sini jauh lebih tenang. Sebenarnya dua minggu ini aku kerja paruh waktu malam buat bayar kos, jadi di lab sering ngantuk dan jarang ngobrol sama teman.',
          'lega',
          'Dimas duduk di Ruang Konsultasi dan akhirnya menarik napas dalam.',
        ),
      },
      {
        id: 'hangat', skillId: 'validasi-normalisasi',
        text: 'Wajar banget jaga privasi. Mau kita lanjut sebentar di Ruang Konsultasi?',
        reply: line(
          'Boleh, Bu. Di sini enak, sepi... jadi begini Bu, uang kos bulan ini kurang dan aku ambil kerja malam biar nggak nyusahin orang tua. Akibatnya tenagaku habis terus di lab.',
          'lelah',
          'Dimas menautkan kedua tangannya di pangkuan.',
        ),
      },
      {
        id: 'janji', skillId: 'janji-mutlak', isMisstep: true,
        text: 'Tenang, ayo ke ruang BK, nanti pasti langsung ketemu bantuan dana hari ini juga.',
        reply: line('Eh, jangan janji begitu dulu Bu, aku malah nggak enak...', 'cemas', 'Dimas menggeleng ragu.'),
      },
    ],
    t4: [
      {
        id: 'refleksi', skillId: 'refleksi-perasaan', best: true,
        options: { reflectionNuance: 'tertekan-cemas' },
        text: 'Pasti berat sekali menanggung beban biaya sambil tetap berusaha tidak tertinggal praktikum, lalu merasa harus menyembunyikannya dari teman-teman.',
        reply: line(
          'Banget, Bu... jujur aku takut kalau teman-teman tahu, nanti mereka kasihan atau malah ngira aku nggak fokus di tim. Makanya aku milih diam dan menyolder sendiri terus.',
          'menunduk',
          'Mata Dimas sedikit berkaca-kaca, namun bahunya terasa lebih ringan.',
        ),
      },
      {
        id: 'terbuka', skillId: 'pertanyaan-terbuka',
        text: 'Bagian mana yang paling terasa menekan buatmu selama dua minggu terakhir ini?',
        reply: line(
          'Rasanya harus kelihatan baik-baik saja terus, Bu. Malam kurang tidur, siang di lab takut merepotkan tim, jadi aku menjauh biar nggak ditanya-tanya.',
          'cemas',
          'Dimas menatap lantai sejenak sebelum kembali memandang konselor.',
        ),
      },
      {
        id: 'interogasi', skillId: 'interogasi', isMisstep: true,
        text: 'Kenapa nggak langsung bilang ke orang tua dari kemarin?',
        reply: line('Kalau semudah itu, dari kemarin juga sudah kubilang, Bu...', 'kesal', 'Dimas mengeraskan rahangnya.'),
      },
    ],
    t5: [
      {
        id: 'validasi', skillId: 'validasi-normalisasi', best: true,
        text: 'Usahamu bertahan mandiri itu luar biasa, Dimas. Dan wajar kok kalau sesekali kamu butuh ruang atau teman bicara tanpa dianggap lemah.',
        reply: line(
          'Baru kali ini ada yang bilang begitu, Bu... rasanya lega banget akhirnya nggak harus pura-pura kuat sendirian.',
          'lega',
          'Senyum tulus akhirnya muncul di wajah Dimas.',
        ),
      },
      {
        id: 'parafrase', skillId: 'parafrase-ringkasan',
        text: 'Jadi selama ini kamu memilih menjauh bukan karena tidak peduli pada tim, melainkan karena takut membebani mereka.',
        reply: line(
          'Iya Bu, persis. Padahal kalau dipikir, teman-teman tim IoT juga nggak pernah menghakimi aku.',
          'tertegun',
          'Dimas mengangguk pelan seolah baru melihat sisi lain situasinya.',
        ),
      },
      {
        id: 'tertutup', skillId: 'pertanyaan-tertutup',
        text: 'Kamu mau coba cari info beasiswa atau atur ulang jadwal kerja?',
        reply: line(
          'Iya Bu, kayaknya memang harus mulai kuatur ulang biar nggak tumbang.',
          'netral',
          'Dimas mengangguk singkat.',
        ),
      },
    ],
    t6: [
      {
        id: 'afirmasi', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Ketekunanmu menyolder SMD itu paling rapi di lab, Dimas. Langkah kecil apa yang paling realistis kamu coba minggu ini supaya energimu nggak habis total?',
        reply: line(
          'Aku mau coba cek info bantuan keringanan kampus besok pagi, lalu bilang ke Raka biar jadwal kerjaku di lab bisa digilir sebelum aku terlalu capek. Sama... nggak makan roti doang terus, hehe.',
          'tersenyum',
          'Dimas tertawa kecil dan bahunya tampak jauh lebih tegap.',
        ),
      },
      {
        id: 'terbuka', skillId: 'pertanyaan-terbuka',
        text: 'Satu hal kecil apa yang bisa bikin minggu depan sedikit lebih ringan buatmu?',
        reply: line(
          'Aku mau mulai terbuka sedikit ke Raka soal jadwal shift-ku, dan coba tanya bagian kemahasiswaan soal opsi kerja asisten lab supaya lebih dekat dan nggak begadang jauh.',
          'lega',
          'Dimas tampak lebih optimis.',
        ),
      },
      {
        id: 'nasihat', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Berhenti saja dari kerja malammu hari ini, kuliah lebih penting.',
        reply: line('Kalau berhenti sekarang, bulan depan aku bayar kos pakai apa, Bu...', 'cemas', 'Dimas kembali murung.'),
      },
    ],
    t7: [
      {
        id: 'tutup', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Rencana yang sangat bijak, Dimas. Kamu nggak harus memikul semuanya diam-diam—kapan pun butuh ruang bicara, mampir saja ya.',
        reply: line(
          'Makasih banyak, Bu! Kepala rasanya plong banget. Aku balik ke lab dulu, sekalian mau nyapa Raka sama Tania.',
          'tersenyum',
          'Dimas berdiri dengan senyum hangat dan langkah yang jauh lebih ringan.',
        ),
      },
      {
        id: 'ringkas', skillId: 'parafrase-ringkasan',
        text: 'Jadi besok kamu cek info asisten lab dan komunikasi soal ritme kerja dengan Raka. Jaga istirahatmu ya, Dimas.',
        reply: line('Siap, Bu. Terima kasih banyak sudah dengerin tanpa menghakimi.', 'lega', 'Dimas mengangguk hangat.'),
      },
      {
        id: 'singkat', skillId: 'sapaan-hangat',
        text: 'Semangat terus ya Dimas, jangan lupa makan.',
        reply: line('Iya Bu, makasih banyak ya.', 'tersenyum', 'Dimas tersenyum tipis.'),
      },
    ],
    tensionOpening: line(
      'Maaf Bu, kayaknya aku nggak enak kalau diterusin. Aku balik nyolder saja.',
      'menutup-diri',
      'Dimas menarik kursinya mundur dan menunduk dalam.',
    ),
    tensionRecognized: line(
      'Iya Bu... aku cuma sensitif soal ini karena takut dikira cari alasan.',
      'menunduk',
      'Dimas mengembuskan napas pelan.',
    ),
    endings: {
      terbantu: line('Makasih banyak Bu, rasaku jauh lebih lega! Aku mau gabung lagi sama anak-anak lab.', 'tersenyum', 'Dimas tersenyum hangat penuh semangat.'),
      kemajuanKecil: line('Makasih waktunya ya Bu, setidaknya sekarang aku nggak sebingung tadi.', 'netral', 'Dimas mengangguk tenang.'),
      menarikDiri: line('Permisi dulu ya Bu, aku harus selesaikan modulnya.', 'menutup-diri', 'Dimas pergi dengan langkah cepat.'),
    },
  },

  // 03 — Tania Wijaya (Bimbang antara melamar asisten riset atau fokus lulus tepat waktu)
  {
    studentId: 'mhs-03',
    firstName: 'Tania',
    title: 'Cerita Tania Wijaya',
    labSceneTitle: 'Meja Osiloskop',
    labSceneCaption: 'Tania duduk menatap brosur asisten riset dan draf jadwal tugas akhirnya secara bergantian.',
    opening: line(
      'Eh, siang Bu! Baru saja selesai bantu adik tingkat cek sinyal osiloskop. Ada yang bisa kubantu, Bu?',
      'tersenyum',
      'Tania segera menggeser brosur di mejanya ke bawah buku catatan.',
    ),
    t1: [
      {
        id: 'sapa', skillId: 'sapaan-hangat', best: true,
        text: 'Halo Tania! Kamu selalu ramah bantu adik tingkat. Gimana kabarmu sendiri hari ini?',
        reply: line(
          'Baik Bu, senang sih ngajarin mereka... cuma pas sudah sepi begini, kepalaku balik muter lagi mikirin rencanaku sendiri.',
          'lelah',
          'Tania tersenyum kecil lalu melirik ujung brosur yang menyembul di bawah bukunya.',
        ),
      },
      {
        id: 'terbuka', skillId: 'pertanyaan-terbuka',
        text: 'Lagi sibuk memikirkan sesuatu ya, Tania? Kelihatannya cukup serius.',
        reply: line(
          'Iya Bu, dari kemarin bolak-balik mikirin dua pilihan yang sama—pengin daftar asisten riset, tapi tugas akhirku juga ngejar.',
          'cemas',
          'Tania mengetuk pelan sampul bukunya.',
        ),
      },
      {
        id: 'nasihat', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Fokus lulus dulu saja Tania, asisten riset nanti gampang dicari lagi.',
        reply: line('Hmm... mungkin iya ya Bu. Ya sudahlah.', 'menutup-diri', 'Tania tampak kehilangan semangat.'),
      },
    ],
    t2: [
      {
        id: 'amati', skillId: 'sampaikan-pengamatan', best: true,
        options: { observationTone: 'faktual' },
        text: 'Aku lihat tadi kamu memandangi brosur dan jadwal tugas akhirmu bergantian. Lagi bimbang menentukan arah ya?',
        reply: line(
          'Iya banget, Bu. Semua orang lihat aku selalu tenang dan bisa ngasih saran ke adik tingkat, padahal buat keputusanku sendiri aku lagi bingung berat.',
          'menunduk',
          'Tania menghela napas pelan sambil melirik ruang lab yang ramai.',
        ),
      },
      {
        id: 'validasi', skillId: 'validasi-normalisasi',
        text: 'Wajar banget merasa bimbang di semester akhir, apalagi saat ada dua peluang bagus datang bersamaan.',
        reply: line(
          'Betul Bu... aku sampai nggak enak cerita ke teman-teman, takut dikira sok sibuk. Padahal benar-benar buntu.',
          'lega',
          'Tania merendahkan suaranya.',
        ),
      },
      {
        id: 'tertutup', skillId: 'pertanyaan-tertutup',
        text: 'Batas daftar asisten risetnya minggu ini, ya?',
        reply: line(
          'Iya, Jumat ini, Bu. Makin dekat malah makin bingung.',
          'cemas',
          'Tania menggigit bibirnya pelan.',
        ),
      },
    ],
    t3: [
      {
        id: 'privasi', skillId: 'batas-kerahasiaan', best: true,
        text: 'Mau ngobrol tenang di Ruang Konsultasi? Obrolan kita cuma di antara kita, biar kamu bisa menimbang dengan lega.',
        reply: line(
          'Mau banget, Bu! Nah, di sini enak... jadi gini, kalau aku ambil asisten riset, itu jalur impianku. Tapi aku takut orang tuaku kecewa kalau wisudaku mundur satu semester.',
          'cemas',
          'Tania duduk di Ruang Konsultasi sambil membuka kedua berkasnya di meja.',
        ),
      },
      {
        id: 'ajak', skillId: 'validasi-normalisasi',
        text: 'Yuk pindah ke Ruang Konsultasi sebentar supaya kita bisa memetakannya pelan-pelan.',
        reply: line(
          'Makasih, Bu. Akhirnya bisa bahas ini tanpa terganggu. Intinya aku tarik-ulur antara peluang riset yang kusuka dan harapan keluarga supaya lulus tepat waktu.',
          'netral',
          'Tania menyandarkan punggung dengan napas lega.',
        ),
      },
      {
        id: 'janji', skillId: 'janji-mutlak', isMisstep: true,
        text: 'Ayo ke dalam, pasti langsung ketemu pilihan paling benar buat masa depanmu.',
        reply: line('Sebenarnya aku nggak butuh dipilih-pilih kan sih Bu, cuma pengin mikir jernih...', 'waspada', 'Tania ragu.'),
      },
    ],
    t4: [
      {
        id: 'refleksi', skillId: 'refleksi-perasaan', best: true,
        options: { reflectionNuance: 'ragu-kurang-percaya' },
        text: 'Kamu ingin mengejar hal yang benar-benar membuatmu bersemangat, tapi di sisi lain takut mengecewakan harapan orang tua.',
        reply: line(
          'Iya Bu, persis di situ nyangkutnya! Aku bahkan belum berani tanya ke dosen riset apakah jam kerjanya bisa disesuaikan sama bimbingan tugas akhir. Sudah keburu takut duluan.',
          'tertegun',
          'Mata Tania melebar kecil seolah baru menyadari sesuatu.',
        ),
      },
      {
        id: 'terbuka', skillId: 'pertanyaan-terbuka',
        text: 'Apa yang sebenarnya paling kamu takutkan terjadi kalau kamu memilih salah satunya?',
        reply: line(
          'Kalau nggak daftar, takut menyesal seumur hidup. Kalau daftar, takut keteteran dan bikin orang tua kecewa... padahal aku belum sempat tanya detail jadwal risetnya sih.',
          'cemas',
          'Tania mengusap pelipisnya pelan.',
        ),
      },
      {
        id: 'interogasi', skillId: 'interogasi', isMisstep: true,
        text: 'Kenapa dari kemarin belum tanya dosennya? Bukannya tinggal kirim pesan?',
        reply: line('Ya karena aku bingung dan takut salah langkah, Bu...', 'kesal', 'Tania menegangkan bahunya.'),
      },
    ],
    t5: [
      {
        id: 'parafrase', skillId: 'parafrase-ringkasan', best: true,
        text: 'Jadi pilihan ini belum tentu harus saling mengorbankan—kamu cuma butuh informasi yang jelas dulu soal fleksibilitas waktunya.',
        reply: line(
          'Benar banget, Bu! Dari kemarin aku stres membayangkan skenario terburuk, padahal belum cek faktanya dan belum ajak orang tua diskusi baik-baik.',
          'lega',
          'Wajah Tania langsung tampak jauh lebih cerah.',
        ),
      },
      {
        id: 'validasi', skillId: 'validasi-normalisasi',
        text: 'Memikirkan perasaan orang tua itu tanda kamu peduli, Tania. Dan wajar kok mengumpulkan fakta dulu sebelum memutuskan.',
        reply: line(
          'Iya Bu, rasanya kepalaku langsung lebih terurai. Nggak sebuntu tadi pagi.',
          'tersenyum',
          'Tania mengangguk mantap.',
        ),
      },
      {
        id: 'tertutup', skillId: 'pertanyaan-tertutup',
        text: 'Jadi mau coba tanya dosennya sore ini?',
        reply: line('Iya Bu, kayaknya itu paling masuk akal dulu.', 'netral', 'Tania tersenyum singkat.'),
      },
    ],
    t6: [
      {
        id: 'afirmasi', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Kamu terbiasa menuntun adik tingkat berpikir runtut, Tania. Langkah kecil apa yang ingin kamu lakukan lebih dulu sebelum hari Jumat?',
        reply: line(
          'Sore ini aku mau tanya langsung rincian jam asisten riset ke dosen pembimbing, lalu malamnya telepon orang tua buat cerita rencanaku secara terbuka. Baru besok aku putuskan dengan tenang!',
          'tersenyum',
          'Tania mencatat dua langkah itu di halaman bukunya dengan rapi.',
        ),
      },
      {
        id: 'terbuka', skillId: 'pertanyaan-terbuka',
        text: 'Langkah pertama apa yang paling nyaman buatmu lakukan hari ini?',
        reply: line(
          'Tanya kejelasan jadwal riset dulu sore ini, terus diskusi santai sama orang tua malam nanti. Biar keputusannya berdasarkan fakta, bukan panik.',
          'lega',
          'Tania tersenyum lega.',
        ),
      },
      {
        id: 'nasihat', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Daftar saja langsung sekarang, urusan orang tua nanti gampang.',
        reply: line('Aku nggak tega kalau nggak ajak mereka bicara dulu, Bu...', 'menunduk', 'Tania kembali ragu.'),
      },
    ],
    t7: [
      {
        id: 'tutup', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Keren banget, Tania! Keputusan yang diambil dengan kepala jernih pasti jauh lebih menenangkan. Nanti kabari ya hasilnya!',
        reply: line(
          'Pasti, Bu! Terima kasih banyak sudah bantu aku mengurai benang kusut di kepala. Aku jadi semangat lagi balik ke lab!',
          'tersenyum',
          'Tania tersenyum cerah dan memeluk bukunya dengan penuh percaya diri.',
        ),
      },
      {
        id: 'ringkas', skillId: 'parafrase-ringkasan',
        text: 'Cek jadwal riset sore ini, lalu diskusi tenang dengan orang tua malam ini. Semoga lancar ya, Tania.',
        reply: line('Aamiin, makasih banyak Bu sudah dengerin.', 'lega', 'Tania mengangguk hangat.'),
      },
      {
        id: 'singkat', skillId: 'sapaan-hangat',
        text: 'Semoga keputusannya terbaik ya, Tania.',
        reply: line('Makasih banyak, Bu!', 'tersenyum', 'Tania berpamitan dengan senyum.'),
      },
    ],
    tensionOpening: line(
      'Oh... iya Bu, maaf kalau kesannya aku kebanyakan mikir. Aku balik ke meja dulu ya.',
      'menutup-diri',
      'Tania segera menutup bukunya dan bersiap berdiri.',
    ),
    tensionRecognized: line(
      'Iya Bu, soalnya keputusan ini memang besar banget buatku...',
      'menunduk',
      'Tania menghela napas pelan.',
    ),
    endings: {
      terbantu: line('Makasih banyak Bu! Kepalaku jernih lagi, aku balik ke lab dengan semangat baru.', 'tersenyum', 'Tania melangkah ringan.'),
      kemajuanKecil: line('Makasih ya Bu, lumayan membantu menenangkan pikiran.', 'netral', 'Tania mengangguk sopan.'),
      menarikDiri: line('Permisi dulu ya Bu, aku mau lanjut cek alat.', 'menutup-diri', 'Tania beranjak cepat.'),
    },
  },

  // 04 — Kevin Gunawan (Standar kode tinggi yang memicu gesekan dengan tim)
  {
    studentId: 'mhs-04',
    firstName: 'Kevin',
    title: 'Cerita Kevin Gunawan',
    labSceneTitle: 'Stasiun Pemrograman & MCU',
    labSceneCaption: 'Kevin mengetik cepat dengan rahang menegang dan langsung diam saat teman satu timnya lewat.',
    opening: line(
      'Siang, Bu. Kalau soal progres firmware, kodenya sudah kuperbaiki sendiri tadi. Aman kok.',
      'waspada',
      'Kevin tetap menatap monitor dengan jari bertumpu di papan ketik.',
    ),
    t1: [
      {
        id: 'sapa', skillId: 'sapaan-hangat', best: true,
        text: 'Halo Kevin, fokus sekali ya. Boleh jeda semenit? Gimana suasanamu di lab hari ini?',
        reply: line(
          'Jujur agak gerah, Bu. Bukan AC-nya, tapi habis debat lagi soal struktur kode sama anak-anak tim.',
          'kesal',
          'Kevin menyandarkan punggungnya sambil menghela napas kasar.',
        ),
      },
      {
        id: 'terbuka', skillId: 'pertanyaan-terbuka',
        text: 'Kelihatannya kamu lagi cukup tegang di depan layar. Ada yang baru saja terjadi?',
        reply: line(
          'Tadi sempat adu argumen sedikit sama Gilang dan tim. Aku cuma ngoreksi bug, eh malah suasananya jadi dingin.',
          'kesal',
          'Kevin mengetuk meja pelan dengan ujung jarinya.',
        ),
      },
      {
        id: 'nasihat', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Kamu memang harus belajar lebih sabar, Kevin. Jangan keras-keras kalau bicara sama teman.',
        reply: line('Lho, aku kan cuma menjaga kualitas kode supaya nggak rusak pas demo!', 'kesal', 'Kevin menatap tajam.'),
      },
    ],
    t2: [
      {
        id: 'amati', skillId: 'sampaikan-pengamatan', best: true,
        options: { observationTone: 'faktual' },
        text: 'Aku lihat tadi suasana antara kamu dan teman tim jadi sunyi begitu mereka lewat. Pasti nggak nyaman kerja dalam suasana kaku begitu.',
        reply: line(
          'Iya sih Bu, jujur jadi canggung banget. Di sini terlalu dekat sama meja mereka, aku males kalau dikira lagi ngomongin di belakang.',
          'menunduk',
          'Kevin menurunkan suaranya dan melirik monitor sebelahnya.',
        ),
      },
      {
        id: 'validasi', skillId: 'validasi-normalisasi',
        text: 'Habis berbeda pendapat dengan teman tim memang bikin energi cepat terkuras ya.',
        reply: line(
          'Betul Bu. Niatku baik biar proyek nggak error, tapi ujungnya malah aku sendiri yang dijauhi. Nggak enak bahas di sini sih.',
          'lelah',
          'Kevin mengusap tengkuknya pelan.',
        ),
      },
      {
        id: 'tertutup', skillId: 'pertanyaan-tertutup',
        text: 'Kalian berdebat soal bagian kode yang sama lagi?',
        reply: line(
          'Iya Bu, soal memori bocor. Tapi nggak enak bahas di sini, teman-teman pada dengar.',
          'waspada',
          'Kevin menutup jendela editor kodenya.',
        ),
      },
    ],
    t3: [
      {
        id: 'privasi', skillId: 'batas-kerahasiaan', best: true,
        text: 'Kita ngobrol sebentar di Ruang Konsultasi yuk. Yang kamu sampaikan aman di antara kita, tidak aku teruskan ke siapa-siapa.',
        reply: line(
          'Oke Bu, makasih. Di sini enak... begini, tiap lihat kode yang rawan error, aku langsung refleks ngomong blak-blakan. Aku cuma takut pas penilaian alatnya mati total.',
          'netral',
          'Kevin duduk di Ruang Konsultasi dan mulai mengendurkan tangannya.',
        ),
      },
      {
        id: 'ajak', skillId: 'validasi-normalisasi',
        text: 'Biar lebih enak tanpa didengar orang lain, kita pindah ke Ruang Konsultasi sebentar?',
        reply: line(
          'Boleh Bu. Jadi intinya aku kesel karena kesannya cuma aku yang peduli kualitas kode, padahal kalau error pas demo kan semuanya kena.',
          'kesal',
          'Kevin menghela napas panjang di kursi.',
        ),
      },
      {
        id: 'janji', skillId: 'janji-mutlak', isMisstep: true,
        text: 'Ayo masuk, nanti aku bantu tegur timmu biar nurut sama standar kodemu.',
        reply: line('Eh jangan Bu, nanti mereka malah makin menjauh dariku...', 'cemas', 'Kevin menggeleng cepat.'),
      },
    ],
    t4: [
      {
        id: 'refleksi', skillId: 'refleksi-perasaan', best: true,
        options: { reflectionNuance: 'kecewa-kesal' },
        text: 'Di balik komentarmu yang tajam, sebenarnya kamu sangat peduli agar tim berhasil—dan rasanya kesepian ketika niat baikmu malah bikin jarak.',
        reply: line(
          '...Iya, Bu. Kena banget sih. Aku sebenarnya nggak benci mereka, malah pengin kita kompak. Cuma kalau sudah panik lihat bug, nadaku langsung ketus tanpa sadar.',
          'tertegun',
          'Wajah Kevin melunak drastis; ia menatap meja sambil berpikir.',
        ),
      },
      {
        id: 'terbuka', skillId: 'pertanyaan-terbuka',
        text: 'Menurutmu, apa yang dirasakan temanmu waktu mendengar masukanmu tadi?',
        reply: line(
          'Hmm... kalau dibalik aku yang dibilang "kode begini bikin jebol" di depan orang lain, aku juga bakal panas sih, Bu. Padahal niatku cuma mau menyelamatkan proyek.',
          'menunduk',
          'Kevin menggaruk pelan belakang kepalanya.',
        ),
      },
      {
        id: 'interogasi', skillId: 'interogasi', isMisstep: true,
        text: 'Kamu sadar nggak sih cara bicaramu tadi melukai perasaan mereka?',
        reply: line('Jadi semua salahku gitu, Bu? Oke deh.', 'kesal', 'Kevin menyilangkan tangannya.'),
      },
    ],
    t5: [
      {
        id: 'parafrase', skillId: 'parafrase-ringkasan', best: true,
        text: 'Jadi standarmu yang tinggi itu aset besar buat tim—tantangannya tinggal bagaimana cara menyampaikannya supaya temanmu merasa diajak, bukan disalahkan.',
        reply: line(
          'Masuk akal banget, Bu. Aku terlalu fokus membetulkan kodenya sampai lupa menjaga orang yang nulis kodenya.',
          'lega',
          'Kevin mengangguk mantap dengan senyum kecil.',
        ),
      },
      {
        id: 'validasi', skillId: 'validasi-normalisasi',
        text: 'Menyadari efek nada bicara kita sendiri itu bukan hal mudah, Kevin. Kamu sudah selangkah lebih dewasa.',
        reply: line(
          'Makasih Bu... jujur aku juga capek kerja sendirian terus, lebih enak kalau bisa ketawa bareng tim lagi.',
          'tersenyum',
          'Bahu Kevin turun santai.',
        ),
      },
      {
        id: 'tertutup', skillId: 'pertanyaan-tertutup',
        text: 'Mau coba ubah cara memberi masukan mulai besok?',
        reply: line('Iya Bu, aku mau coba lebih pelan ngomongnya.', 'netral', 'Kevin mengangguk.'),
      },
    ],
    t6: [
      {
        id: 'afirmasi', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Kemampuan optimasi kodemu luar biasa, Kevin. Satu cara kecil apa yang mau kamu coba saat bertemu tim di lab sebentar lagi?',
        reply: line(
          'Habis ini aku mau samperin Gilang sebentar, bilang maaf nadaku tadi ketus, lalu tawarin cek fungsi memorinya bareng—bukan langsung kuubah diam-diam.',
          'tersenyum',
          'Kevin tersenyum yakin, ketegangan di wajahnya hilang sepenuhnya.',
        ),
      },
      {
        id: 'terbuka', skillId: 'pertanyaan-terbuka',
        text: 'Kalimat pembuka seperti apa yang kira-kira enak kamu ucapkan ke teman tim nanti?',
        reply: line(
          'Mungkin mulai dari "Eh, bagian ini keren, boleh kita rapihin bareng bagian memorinya biar makin kenceng?" Kedengarannya jauh lebih adem ya, Bu.',
          'tersenyum',
          'Kevin tertawa kecil merasa lega.',
        ),
      },
      {
        id: 'nasihat', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Sudah, nanti kamu diam saja waktu rapat biar nggak bikin masalah lagi.',
        reply: line('Kalau aku diam saja, nanti error-nya nggak ada yang nemuin dong, Bu...', 'waspada', 'Kevin mengernyit.'),
      },
    ],
    t7: [
      {
        id: 'tutup', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Keren banget, Kevin! Timmu beruntung punya rekan sehebat kamu yang juga mau belajar menjaga komunikasi.',
        reply: line(
          'Makasih banyak ya Bu sudah dengerin tanpa ngecap aku galak. Aku balik ke lab dulu, mau cairin suasana sama anak-anak!',
          'tersenyum',
          'Kevin berdiri penuh energi dan melangkah keluar dengan senyum lebar.',
        ),
      },
      {
        id: 'ringkas', skillId: 'parafrase-ringkasan',
        text: 'Jadi nanti kamu cairkan suasana dan ajak review bareng dengan tenang. Semangat ya, Kevin.',
        reply: line('Siap Bu, terima kasih banyak!', 'lega', 'Kevin mengangguk mantap.'),
      },
      {
        id: 'singkat', skillId: 'sapaan-hangat',
        text: 'Semoga obrolan sama timnya lancar ya, Kevin.',
        reply: line('Makasih, Bu!', 'tersenyum', 'Kevin berpamitan sopan.'),
      },
    ],
    tensionOpening: line(
      'Ya sudah kalau menurut Ibu aku yang selalu salah. Aku balik ke komputerku saja.',
      'kesal',
      'Kevin menyilangkan lengan dan menatap tajam ke samping.',
    ),
    tensionRecognized: line(
      'Oke... makasih sudah mau dengerin sisiku juga, Bu. Aku cuma pengin proyeknya berhasil.',
      'netral',
      'Nada bicara Kevin turun dan rahangnya tidak lagi menegang.',
    ),
    endings: {
      terbantu: line('Makasih Bu, pikiranku adem lagi! Aku mau langsung ngobrol santai sama tim.', 'tersenyum', 'Kevin tersenyum lega.'),
      kemajuanKecil: line('Oke Bu, aku coba renungkan dulu ya cara bicaraku.', 'netral', 'Kevin mengangguk tenang.'),
      menarikDiri: line('Aku permisi dulu ya Bu, masih banyak bug yang harus kuberesisn sendiri.', 'menutup-diri', 'Kevin pergi cepat.'),
    },
  },

  // 05 — Ayu Permata (Ingin menjajaki jalur desain sistem interaktif tapi ragu melangkah)
  {
    studentId: 'mhs-05',
    firstName: 'Ayu',
    title: 'Cerita Ayu Permata',
    labSceneTitle: 'Meja Pemrograman & Desain',
    labSceneCaption: 'Ayu menggambar sketsa antarmuka di buku catatannya sambil sesekali menatap papan karier.',
    opening: line(
      'Hai Bu! Eh, aku lagi corat-coret tampilan dashboard telemetri nih, biar data sensornya lebih gampang dibaca.',
      'tersenyum',
      'Ayu menunjukkan sekilas sketsa warna-warni di bukunya lalu menutupnya lagi.',
    ),
    t1: [
      {
        id: 'sapa', skillId: 'sapaan-hangat', best: true,
        text: 'Wah, bagus sekali sketsanya, Ayu! Gimana perasaanmu hari ini di lab?',
        reply: line(
          'Hehe makasih Bu! Lagi semangat gambar sih, cuma agak kepikiran juga soal arah karierku habis lulus nanti.',
          'netral',
          'Ayu mengetuk pensilnya di tepi buku sketsa.',
        ),
      },
      {
        id: 'terbuka', skillId: 'pertanyaan-terbuka',
        text: 'Kelihatannya kamu suka sekali merancang antarmuka. Apa yang lagi ada di pikiranmu soal itu?',
        reply: line(
          'Iya Bu, aku betah banget di sini... tapi kadang ragu, jurusan kita kan teknik banget, masa aku mau fokus ke desain sistem interaktif?',
          'cemas',
          'Ayu memandang papan pengumuman lowongan di dinding lab.',
        ),
      },
      {
        id: 'nasihat', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Ikuti saja jalur standar anak teknik biar gampang dapat kerja.',
        reply: line('Oh... iya sih Bu, mungkin memang aman ikut jalur umum saja...', 'menunduk', 'Senyum Ayu memudar.'),
      },
    ],
    t2: [
      {
        id: 'amati', skillId: 'sampaikan-pengamatan', best: true,
        options: { observationTone: 'faktual' },
        text: 'Tadi matamu sempat berbinar waktu cerita desain, lalu langsung agak ragu saat menatap papan lowongan. Ada yang bikin sungkan?',
        reply: line(
          'Ketahuan deh, Bu... aku takut dikomentarin teman-teman kalau aku terlalu "nyeni" dan nggak serius di coding keras. Boleh cerita di tempat yang agak tenang nggak, Bu?',
          'cemas',
          'Ayu mengecilkan suaranya sambil memeluk buku sketsanya.',
        ),
      },
      {
        id: 'validasi', skillId: 'validasi-normalisasi',
        text: 'Wajar banget merasa ragu saat minat kita agak berbeda dari mayoritas teman seangkatan.',
        reply: line(
          'Iya Bu, rasanya kayak jalan sendirian... kalau Ibu luang, aku pengin ngobrol lebih santai tanpa didengar anak-anak lain.',
          'lega',
          'Ayu tersenyum lega mendengar responmu.',
        ),
      },
      {
        id: 'tertutup', skillId: 'pertanyaan-tertutup',
        text: 'Teman-temanmu pernah mengejek minat desainmu?',
        reply: line(
          'Nggak ngejek parah sih Bu, cuma bercanda gitu... tapi bikin kepikiran. Agak nggak enak bahas di sini.',
          'menunduk',
          'Ayu menatap ujung bukunya.',
        ),
      },
    ],
    t3: [
      {
        id: 'privasi', skillId: 'batas-kerahasiaan', best: true,
        text: 'Tentu, yuk ke Ruang Konsultasi! Ceritamu aman di antara kita, kamu bebas berekspresi tanpa dinilai.',
        reply: line(
          'Makasih Bu! Nah, di sini lega... sebenarnya setiap kali bikin visualisasi data uji, aku merasa paling hidup. Cuma aku takut jalurnya nggak dianggap serius di dunia industri vokasi.',
          'lega',
          'Ayu membuka halaman sketsa portofolionya di meja Ruang Konsultasi.',
        ),
      },
      {
        id: 'ajak', skillId: 'validasi-normalisasi',
        text: 'Yuk pindah ke Ruang Konsultasi biar kamu bisa cerita soal rencanamu dengan tenang.',
        reply: line(
          'Asyik, makasih Bu. Jadi aku tuh pengin banget bangun portofolio desain sistem interaktif, tapi sering minder duluan sebelum mulai.',
          'netral',
          'Ayu duduk santai menghadap konselor.',
        ),
      },
      {
        id: 'janji', skillId: 'janji-mutlak', isMisstep: true,
        text: 'Ayo masuk, nanti pasti langsung dapat perusahaan desain yang mau menerima kamu.',
        reply: line('Wah jangan gitu Bu, aku jadi makin tertekan...', 'cemas', 'Ayu tersenyum canggung.'),
      },
    ],
    t4: [
      {
        id: 'refleksi', skillId: 'refleksi-perasaan', best: true,
        options: { reflectionNuance: 'ragu-kurang-percaya' },
        text: 'Kamu punya gairah yang kuat di desain sistem, tapi takut dianggap salah jurusan atau kurang diakui.',
        reply: line(
          'Betul banget, Bu! Padahal justru karena aku ngerti teknis mikrokontrolernya, aku bisa bikin tampilan alat yang benar-benar dipahami operator. Cuma aku belum percaya diri nunjukin itu.',
          'tertegun',
          'Ayu tersenyum kecil menyadari keunggulannya sendiri.',
        ),
      },
      {
        id: 'terbuka', skillId: 'pertanyaan-terbuka',
        text: 'Menurutmu, apa kelebihan seseorang yang paham teknik sekaligus paham desain antarmuka?',
        reply: line(
          'Hmm... aku jadi bisa jadi jembatan antara insinyur dan pengguna alatnya sih, Bu! Nggak cuma cantik, tapi benar-benar nyambung sama datanya.',
          'tersenyum',
          'Mata Ayu kembali berbinar antusias.',
        ),
      },
      {
        id: 'interogasi', skillId: 'interogasi', isMisstep: true,
        text: 'Kenapa kamu peduli banget sama komentar teman? Kan masa depanmu sendiri.',
        reply: line('Ya namanya satu angkatan tiap hari ketemu, pasti kepikiran lah Bu...', 'kesal', 'Ayu menunduk.'),
      },
    ],
    t5: [
      {
        id: 'parafrase', skillId: 'parafrase-ringkasan', best: true,
        text: 'Jadi keunikanmu justru ada di persimpangan itu—kamu paham teknisnya sekaligus mampu membuatnya mudah dipahami manusia.',
        reply: line(
          'Wah, pas Ibu rangkum begitu, rasanya bukan "keluar jalur" ya, malah jadi nilai plus! Energi buat lanjut gambar langsung balik lagi nih.',
          'tersenyum',
          'Ayu tertawa ringan dengan wajah sumringah.',
        ),
      },
      {
        id: 'validasi', skillId: 'validasi-normalisasi',
        text: 'Wajar banget kok memulai karier dari irisan dua bidang, justru itu yang banyak dicari sekarang.',
        reply: line(
          'Bener juga ya, Bu. Aku jadi nggak perlu sembunyiin buku sketsaku lagi di lab.',
          'lega',
          'Ayu mengangguk mantap.',
        ),
      },
      {
        id: 'tertutup', skillId: 'pertanyaan-tertutup',
        text: 'Sudah punya satu proyek portofolio yang mau dirapikan?',
        reply: line('Ada Bu, tampilan telemetri proyek semester ini!', 'tersenyum', 'Ayu membuka bukunya.'),
      },
    ],
    t6: [
      {
        id: 'afirmasi', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Kreativitasmu merancang visualisasi telemetri itu keren banget, Ayu. Satu langkah kecil apa yang mau kamu mulai minggu ini?',
        reply: line(
          'Aku mau rapikan studi kasus dashboard telemetri proyek ini jadi halaman portofolio pertama, terus coba minta masukan ke teman tim dan alumni desain industri!',
          'tersenyum',
          'Ayu langsung mencatat rencana itu dengan semangat.',
        ),
      },
      {
        id: 'terbuka', skillId: 'pertanyaan-terbuka',
        text: 'Langkah awal apa yang paling seru buat kamu coba duluan?',
        reply: line(
          'Dokumentasiin sketsa dashboard proyek lab ini jadi portofolio rapi, Bu. Kecil dulu, yang penting jalan!',
          'lega',
          'Ayu tersenyum mantap.',
        ),
      },
      {
        id: 'nasihat', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Kalau mau serius, besok langsung kirim lamaran magang ke sepuluh studio sekaligus.',
        reply: line('Aduh sepuluh langsung? Portofolioku saja belum rapi, Bu...', 'cemas', 'Ayu tampak kewalahan.'),
      },
    ],
    t7: [
      {
        id: 'tutup', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Langkah pertama yang seru banget, Ayu! Nanti kalau portofoliomu sudah jadi, tunjukin ke aku juga ya.',
        reply: line(
          'Siap, Ibu yang pertama lihat nanti! Makasih banyak ya Bu, aku balik ke lab dengan semangat penuh!',
          'tersenyum',
          'Ayu berdiri ceria sambil melambai hangat.',
        ),
      },
      {
        id: 'ringkas', skillId: 'parafrase-ringkasan',
        text: 'Mulai dari merapikan satu proyek telemetri dulu jadi portofolio. Semangat berkarya, Ayu!',
        reply: line('Makasih banyak, Bu! Rasanya jauh lebih yakin sekarang.', 'lega', 'Ayu tersenyum hangat.'),
      },
      {
        id: 'singkat', skillId: 'sapaan-hangat',
        text: 'Sukses terus ya, Ayu.',
        reply: line('Makasih banyak, Bu!', 'tersenyum', 'Ayu berpamitan ceria.'),
      },
    ],
    tensionOpening: line(
      'Iya deh Bu, mungkin aku saja yang terlalu banyak ngayal. Aku balik ke meja dulu.',
      'menutup-diri',
      'Ayu menutup buku sketsanya rapat-rapat.',
    ),
    tensionRecognized: line(
      'Makasih Bu... aku cuma butuh ruang untuk berani percaya sama minatku sendiri.',
      'menunduk',
      'Ayu menghela napas pelan.',
    ),
    endings: {
      terbantu: line('Makasih banyak Bu! Aku semangat lagi mau ngerjain desain bareng teman-teman di lab!', 'tersenyum', 'Ayu melangkah ceria.'),
      kemajuanKecil: line('Makasih ya Bu, lumayan bikin lega.', 'netral', 'Ayu tersenyum tipis.'),
      menarikDiri: line('Aku permisi balik ke komputer dulu ya, Bu.', 'menutup-diri', 'Ayu pergi dengan murung.'),
    },
  },

  // 06 — Mita Rahmawati (Canggung meminta bantuan saat tertinggal materi)
  {
    studentId: 'mhs-06',
    firstName: 'Mita',
    title: 'Cerita Mita Rahmawati',
    labSceneTitle: 'Sudut Meja Pemrograman',
    labSceneCaption: 'Mita membuka-tutup halaman modul yang sama berulang kali tanpa bertanya ke siapa pun.',
    opening: line(
      'Eh, assalamualaikum Bu... maaf, aku lagi baca ulang modul praktikum minggu kemarin saja kok.',
      'waspada',
      'Mita merapikan lembaran modulnya dengan gerakan pelan dan menunduk.',
    ),
    t1: [
      {
        id: 'sapa', skillId: 'sapaan-hangat', best: true,
        text: 'Waalaikumsalam, Mita. Pelan-pelan saja, nggak usah buru-buru. Gimana kabarmu hari ini?',
        reply: line(
          'Alhamdulillah baik, Bu... cuma agak buntu sedikit di bab modul ini. Sudah kubaca tiga kali tapi masih belum klik.',
          'menunduk',
          'Mita menunjuk satu paragraf yang sudah penuh garis bawah pensil.',
        ),
      },
      {
        id: 'terbuka', skillId: 'pertanyaan-terbuka',
        text: 'Waalaikumsalam, Mita. Bagian mana dari modul itu yang lagi kamu tekuni?',
        reply: line(
          'Bagian logika pembacaan sensor ini, Bu. Anak-anak lain sudah lanjut ke tahap berikutnya, aku masih di halaman ini terus.',
          'cemas',
          'Mita melirik pelan ke meja teman-temannya.',
        ),
      },
      {
        id: 'nasihat', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Kalau nggak paham ya langsung tanya teman, Mita. Jangan diam saja di pojok.',
        reply: line('Iya Bu... maaf. Aku baca sendiri dulu saja.', 'menutup-diri', 'Mita langsung menunduk dalam.'),
      },
    ],
    t2: [
      {
        id: 'amati', skillId: 'sampaikan-pengamatan', best: true,
        options: { observationTone: 'faktual' },
        text: 'Aku lihat kamu tekun sekali mencari jawabannya sendiri di modul ini. Rasanya sungkan ya kalau mau bertanya di depan anak-anak lain?',
        reply: line(
          'Iya banget, Bu... aku takut ganggu mereka yang sudah cepat, takut kelihatan tertinggal juga. Di sini agak ramai ya, Bu...',
          'cemas',
          'Suara Mita melirih sambil merapatkan modul ke dadanya.',
        ),
      },
      {
        id: 'validasi', skillId: 'validasi-normalisasi',
        text: 'Wajar kok kalau suatu materi perlu dibaca berulang—kecepatan belajar tiap orang memang beda-beda.',
        reply: line(
          'Dengar Ibu bilang gitu bikin agak lega... tapi jujur aku masih canggung ngobrolin ini di tengah lab.',
          'lega',
          'Mita menghela napas kecil.',
        ),
      },
      {
        id: 'tertutup', skillId: 'pertanyaan-tertutup',
        text: 'Kamu memang belum pernah nanya ke teman sebelahmu?',
        reply: line(
          'Belum, Bu... sungkan. Nggak enak juga cerita di sini.',
          'menunduk',
          'Mita menggenggam pensilnya erat.',
        ),
      },
    ],
    t3: [
      {
        id: 'privasi', skillId: 'batas-kerahasiaan', best: true,
        text: 'Kita ngobrol sebentar di Ruang Konsultasi yuk, cuma berdua. Ceritamu terjaga di antara kita.',
        reply: line(
          'Terima kasih banyak, Bu. Di sini tenang sekali... sebenarnya sejak dua minggu lalu aku ketinggalan satu sesi, lalu makin ke sini aku makin malu buat bertanya.',
          'lega',
          'Mita duduk nyaman di Ruang Konsultasi sambil meletakkan modulnya.',
        ),
      },
      {
        id: 'ajak', skillId: 'validasi-normalisasi',
        text: 'Yuk pindah ke Ruang Konsultasi sebentar biar lebih nyaman dan nggak sungkan.',
        reply: line(
          'Iya Bu, makasih. Jadi aku tuh bingung, makin lama diam rasanya makin ketinggalan, tapi makin ketinggalan aku malah makin takut nanya.',
          'cemas',
          'Mita menatap sampul modulnya dengan jujur.',
        ),
      },
      {
        id: 'janji', skillId: 'janji-mutlak', isMisstep: true,
        text: 'Ayo masuk, nanti semua materi yang ketinggalan langsung beres dalam sepuluh menit.',
        reply: line('Hmm... rasanya nggak mungkin secepat itu deh, Bu.', 'waspada', 'Mita tampak ragu.'),
      },
    ],
    t4: [
      {
        id: 'refleksi', skillId: 'refleksi-perasaan', best: true,
        options: { reflectionNuance: 'ragu-kurang-percaya' },
        text: 'Rasanya seperti terjebak ya—pengin mengejar ketertinggalan, tapi rasa canggung membuatmu makin menarik diri dan kelelahan sendiri.',
        reply: line(
          'Persis sekali, Bu! Padahal kalau soal cari referensi artikel atau dokumentasi, aku lumayan bisa. Cuma pas harus nanya langsung ke teman, aku keburu mikir "nanti aku ngerepotin".',
          'tertegun',
          'Mita mengangkat wajahnya dan menatap konselor lebih terbuka.',
        ),
      },
      {
        id: 'terbuka', skillId: 'pertanyaan-terbuka',
        text: 'Pikiran apa yang biasanya muncul tepat sebelum kamu mengurungkan niat untuk bertanya?',
        reply: line(
          'Yang kepikiran selalu "nanti dikira nggak ngerti hal dasar" atau "mereka lagi sibuk, jangan ganggu". Akhirnya aku diam sendiri sampai sore dan capek sendiri, Bu.',
          'menunduk',
          'Mita berbicara pelan namun jujur.',
        ),
      },
      {
        id: 'interogasi', skillId: 'interogasi', isMisstep: true,
        text: 'Kenapa waktu itu nggak langsung minta catatan ke teman sebelum ketinggalan jauh?',
        reply: line('Maaf Bu, salahku memang...', 'menutup-diri', 'Mita menunduk lebih dalam.'),
      },
    ],
    t5: [
      {
        id: 'parafrase', skillId: 'parafrase-ringkasan', best: true,
        text: 'Jadi sebenarnya kamu bukan pasif—kamu sudah berusaha keras lewat referensi, hanya butuh satu jembatan yang nyaman untuk mulai bertanya.',
        reply: line(
          'Iya Bu... mendengar itu rasanya aku nggak seburuk yang kupikirkan tadi. Aku nggak perlu langsung tanya ke semua orang sekaligus, cukup satu teman yang bikin nyaman dulu ya.',
          'lega',
          'Senyum lembut mulai muncul di wajah Mita.',
        ),
      },
      {
        id: 'validasi', skillId: 'validasi-normalisasi',
        text: 'Bertanya saat sedang belajar itu bukan merepotkan, Mita. Justru temanmu bisa terbantu juga karena kamu jago mencari referensi.',
        reply: line(
          'Oh iya juga ya, Bu! Aku bisa tukar catatan referensi yang kucari sambil nanya bagian yang belum kupahami.',
          'tersenyum',
          'Mata Mita berbinar lega.',
        ),
      },
      {
        id: 'tertutup', skillId: 'pertanyaan-tertutup',
        text: 'Ada satu teman di lab yang paling nyaman buat kamu ajak diskusi?',
        reply: line('Ayu biasanya ramah banget sih, Bu.', 'netral', 'Mita tersenyum tipis.'),
      },
    ],
    t6: [
      {
        id: 'afirmasi', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Ketelitianmu merangkum referensi itu kekuatan besar, Mita. Satu langkah kecil apa yang terasa paling nyaman buat kamu coba hari ini?',
        reply: line(
          'Habis ini aku mau bawa rangkuman referensiku ke Ayu dan tanya satu saja bagian logika sensor yang masih bingung. Satu pertanyaan dulu, nggak usah banyak-banyak!',
          'tersenyum',
          'Mita tersenyum lebar dengan rasa percaya diri baru.',
        ),
      },
      {
        id: 'terbuka', skillId: 'pertanyaan-terbuka',
        text: 'Langkah kecil apa yang paling ringan untuk kamu mulai setelah keluar dari ruangan ini?',
        reply: line(
          'Aku mau sapa Ayu duluan dan tanya satu poin di halaman ini sambil berbagi catatan referensi yang kucari tadi, Bu.',
          'lega',
          'Mita menandai satu pertanyaan di modulnya.',
        ),
      },
      {
        id: 'nasihat', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Besok kamu harus berani presentasi di depan seluruh lab biar rasa malumu hilang.',
        reply: line('Waduh, kalau langsung di depan semua orang aku belum sanggup, Bu...', 'cemas', 'Mita mundur kecil.'),
      },
    ],
    t7: [
      {
        id: 'tutup', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Satu pertanyaan dulu sambil berbagi catatan—itu langkah yang keren banget, Mita! Aku yakin Ayu senang berdiskusi denganmu.',
        reply: line(
          'Terima kasih banyak, Bu! Hatiku hangat banget sekarang, nggak secanggung tadi. Aku balik ke lab dulu ya, Bu!',
          'tersenyum',
          'Mita berdiri dengan senyum cerah dan langkah mantap.',
        ),
      },
      {
        id: 'ringkas', skillId: 'parafrase-ringkasan',
        text: 'Jadi kamu mulai dengan satu pertanyaan ke Ayu sambil berbagi rangkuman referensi. Semangat ya, Mita.',
        reply: line('Iya Bu, makasih banyak sudah mendengarkan dengan sabar.', 'lega', 'Mita tersenyum lembut.'),
      },
      {
        id: 'singkat', skillId: 'sapaan-hangat',
        text: 'Semangat belajarnya ya, Mita.',
        reply: line('Makasih banyak, Bu!', 'tersenyum', 'Mita berpamitan sopan.'),
      },
    ],
    tensionOpening: line(
      'Maaf Bu, aku memang lambat... aku belajar sendiri saja di pojok.',
      'menutup-diri',
      'Mita menutup modulnya rapat dan menunduk.',
    ),
    tensionRecognized: line(
      'Iya Bu... aku cuma takut bikin orang lain kesal karena pertanyaanku.',
      'menunduk',
      'Mita menghela napas kecil.',
    ),
    endings: {
      terbantu: line('Makasih banyak Bu! Aku mau langsung nyapa Ayu di lab sekarang.', 'tersenyum', 'Mita tersenyum cerah.'),
      kemajuanKecil: line('Makasih Bu, aku sudah sedikit lebih tenang sekarang.', 'netral', 'Mita mengangguk pelan.'),
      menarikDiri: line('Permisi dulu ya Bu, assalamualaikum.', 'menutup-diri', 'Mita kembali ke pojok meja.'),
    },
  },

  // 07 — Bima Mahendra (Menimbang tawaran kerja bengkel fabrikasi sebelum wisuda)
  {
    studentId: 'mhs-07',
    firstName: 'Bima',
    title: 'Cerita Bima Mahendra',
    labSceneTitle: 'Stasiun Las (K3)',
    labSceneCaption: 'Bima merapikan sarung tangan las lalu melirik amplop surat tawaran di dalam tasnya.',
    opening: line(
      'Siang, Bu! Peralatan las sudah aman semua, arus sudah dimatikan sesuai K3. Ada perlu sama saya, Bu?',
      'tersenyum',
      'Bima menyeka dahinya lalu menutup ritsleting tas yang berisi amplop cokelat.',
    ),
    t1: [
      {
        id: 'sapa', skillId: 'sapaan-hangat', best: true,
        text: 'Halo Bima, disiplin K3-mu selalu jempolan. Gimana kabarmu minggu ini?',
        reply: line(
          'Sehat Bu, alhamdulillah. Cuma beberapa hari ini pikiran agak terbelah sama satu tawaran kerja bengkel yang baru masuk.',
          'netral',
          'Bima menepuk pelan tasnya tempat amplop itu tersimpan.',
        ),
      },
      {
        id: 'terbuka', skillId: 'pertanyaan-terbuka',
        text: 'Kelihatannya ada sesuatu yang lagi kamu pertimbangkan serius di sela praktikum. Mau cerita?',
        reply: line(
          'Iya Bu, minggu lalu tempat magangku nawarin langsung masuk kerja tetap bulan depan, padahal wisudaku masih satu semester lagi.',
          'cemas',
          'Bima bersandar ringan di tepi meja kerja.',
        ),
      },
      {
        id: 'nasihat', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Ambil saja langsung Bima, zaman sekarang cari kerja susah!',
        reply: line('Hmm... tapi kalau kuliahku terbengkalai gimana, Bu?', 'waspada', 'Bima mengernyit.'),
      },
    ],
    t2: [
      {
        id: 'amati', skillId: 'sampaikan-pengamatan', best: true,
        options: { observationTone: 'faktual' },
        text: 'Aku lihat kamu beberapa kali mengecek amplop di tasmu sambil termenung. Pasti berat ya menimbang peluang bagus di saat kuliah hampir selesai.',
        reply: line(
          'Iya banget, Bu. Di area las ini bising mesin, kalau Ibu ada waktu beberapa menit aku pengin mikir tenang di dalam.',
          'lega',
          'Bima melepas celemek lasnya dengan rapi.',
        ),
      },
      {
        id: 'validasi', skillId: 'validasi-normalisasi',
        text: 'Wajar banget bimbang—ditawari kerja sebelum lulus itu kabar baik sekaligus dilema besar.',
        reply: line(
          'Betul Bu, rasanya sayang kalau ditolak tapi takut keteteran kalau diterima. Boleh ngobrol sebentar di ruangan yang tenang?',
          'netral',
          'Bima mengangguk mantap.',
        ),
      },
      {
        id: 'tertutup', skillId: 'pertanyaan-tertutup',
        text: 'Kamu lebih condong menerima atau menolak tawarannya?',
        reply: line(
          'Justru itu yang belum tahu, Bu. Di sini ramai, susah mikir jernih.',
          'cemas',
          'Bima menggaruk pelan tengkuknya.',
        ),
      },
    ],
    t3: [
      {
        id: 'privasi', skillId: 'batas-kerahasiaan', best: true,
        text: 'Yuk masuk ke Ruang Konsultasi. Obrolan kita terjaga, kamu bisa menimbang untung-ruginya dengan bebas.',
        reply: line(
          'Makasih, Bu. Di sini tenang banget... jadi begini, bengkel fabrikasi itu cocok sama bidangku, tapi jam kerjanya penuh. Aku takut tugas akhirku malah mandek di garis finis.',
          'cemas',
          'Bima meletakkan surat tawaran itu di atas meja Ruang Konsultasi.',
        ),
      },
      {
        id: 'ajak', skillId: 'validasi-normalisasi',
        text: 'Ayo duduk sebentar di Ruang Konsultasi supaya kita bisa bedah pilihannya pelan-pelan.',
        reply: line(
          'Siap Bu. Intinya aku takut kehilangan pekerjaan bagus, tapi juga nggak mau perjuangan kuliah tiga tahun berhenti di ujung.',
          'netral',
          'Bima duduk tegak dan menghela napas.',
        ),
      },
      {
        id: 'janji', skillId: 'janji-mutlak', isMisstep: true,
        text: 'Ayo masuk, nanti pasti ada cara supaya kamu dapat gaji penuh tanpa capek sama sekali.',
        reply: line('Ah, masa iya tanpa capek Bu... aku maunya realistis saja.', 'waspada', 'Bima tersenyum kecut.'),
      },
    ],
    t4: [
      {
        id: 'refleksi', skillId: 'refleksi-perasaan', best: true,
        options: { reflectionNuance: 'tertekan-cemas' },
        text: 'Kamu sangat menghargai kesempatan kerja itu, tapi di saat yang sama ijazah dan tuntasnya kuliah juga punya arti besar buatmu.',
        reply: line(
          'Tepat banget, Bu! Orang tuaku bangga sekali kalau aku bisa wisuda tepat waktu. Tapi aku juga kepikiran pengin cepat bantu ekonomi rumah. Jadinya diam-diam stres sendiri.',
          'menunduk',
          'Bima menatap surat tawaran itu dengan tatapan jujur.',
        ),
      },
      {
        id: 'terbuka', skillId: 'pertanyaan-terbuka',
        text: 'Menurutmu, ada nggak ruang negosiasi dengan pihak bengkel soal jam kerja selama satu semester terakhir ini?',
        reply: line(
          'Eh... jujur belum kutanyakan, Bu! Aku langsung mikir harus pilih hitam atau putih—kerja penuh atau tolak total. Padahal kepala bengkelnya kenal baik denganku waktu magang.',
          'tertegun',
          'Alis Bima terangkat, wajahnya langsung lebih cerah.',
        ),
      },
      {
        id: 'interogasi', skillId: 'interogasi', isMisstep: true,
        text: 'Kenapa nggak dari kemarin kamu nego ke bos bengkelnya?',
        reply: line('Ya aku kan belum kepikiran sampai ke situ, Bu...', 'kesal', 'Bima menyandarkan bahu menjauh.'),
      },
    ],
    t5: [
      {
        id: 'parafrase', skillId: 'parafrase-ringkasan', best: true,
        text: 'Jadi ada kemungkinan jalan tengah—misalnya mulai paruh waktu atau kontrak mulai setelah sidang—yang baru bisa diketahui kalau kamu berani menanyakannya.',
        reply: line(
          'Iya banget, Bu! Kalau mereka mau nunggu atau kasih jam fleksibel, dua-duanya bisa jalan. Kalau nggak bisa pun, aku jadi tahu jelas dan nggak menyesal memilih.',
          'lega',
          'Bima tersenyum lebar dan mengangguk mantap.',
        ),
      },
      {
        id: 'validasi', skillId: 'validasi-normalisasi',
        text: 'Wajar kok sempat melihat ini sebagai dua pilihan kaku. Meminta kejelasan itu justru sikap profesional.',
        reply: line(
          'Bener juga ya, Bu. Perusahaan bagus pasti menghargai calon teknisi yang jujur soal komitmen kuliahnya.',
          'tersenyum',
          'Bima tampak jauh lebih mantap.',
        ),
      },
      {
        id: 'tertutup', skillId: 'pertanyaan-tertutup',
        text: 'Kamu punya nomor kepala bengkelnya untuk dihubungi besok?',
        reply: line('Punya Bu, beliau baik banget waktu aku magang.', 'netral', 'Bima mengangguk.'),
      },
    ],
    t6: [
      {
        id: 'afirmasi', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Kedisiplinan dan etos kerjamu itu alasan mereka menawarimu duluan, Bima. Langkah kecil apa yang mau kamu ambil minggu ini?',
        reply: line(
          'Besok pagi aku mau hubungi kepala bengkel dengan sopan untuk menanyakan opsi paruh waktu sampai sidang, lalu diskusikan hasilnya bareng orang tua di akhir pekan.',
          'tersenyum',
          'Bima memasukkan kembali surat itu ke tasnya dengan tenang.',
        ),
      },
      {
        id: 'terbuka', skillId: 'pertanyaan-terbuka',
        text: 'Apa rencana paling konkret yang membuat hatimu paling tenang?',
        reply: line(
          'Tanya opsi jam fleksibel besok, sekaligus cek sisa jadwal sidang sama dosen wali. Rasanya jauh lebih terarah sekarang, Bu!',
          'lega',
          'Bima tersenyum puas.',
        ),
      },
      {
        id: 'nasihat', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Tolak saja tawarannya, ijazah itu nomor satu.',
        reply: line('Sayang kalau kutolak tanpa nanya dulu, Bu...', 'waspada', 'Bima menggeleng pelan.'),
      },
    ],
    t7: [
      {
        id: 'tutup', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Mantap sekali rencanamu, Bima! Langkah profesional dan tetap tenang. Kabari ya perkembangan baiknya nanti!',
        reply: line(
          'Siap, Bu! Terima kasih banyak sudah bantu buka sudut pandang. Energiku balik penuh lagi—aku balik ke bengkel lab dulu ya!',
          'tersenyum',
          'Bima berdiri tegap dengan senyum penuh semangat.',
        ),
      },
      {
        id: 'ringkas', skillId: 'parafrase-ringkasan',
        text: 'Jadi besok konfirmasi opsi fleksibel ke bengkel dan sinkronkan jadwal sidang. Sukses terus, Bima.',
        reply: line('Terima kasih banyak, Bu!', 'lega', 'Bima mengangguk hangat.'),
      },
      {
        id: 'singkat', skillId: 'sapaan-hangat',
        text: 'Semoga lancar semuanya ya, Bima.',
        reply: line('Siap Bu, makasih banyak!', 'tersenyum', 'Bima berpamitan ramah.'),
      },
    ],
    tensionOpening: line(
      'Iya Bu, nanti aku pikir sendiri saja deh. Aku balik ke stasiun las dulu.',
      'menutup-diri',
      'Bima mengambil tasnya dengan wajah kaku.',
    ),
    tensionRecognized: line(
      'Makasih Bu, aku cuma nggak mau salah ambil keputusan buat masa depanku.',
      'netral',
      'Bima meletakkan kembali tasnya dengan tenang.',
    ),
    endings: {
      terbantu: line('Makasih banyak Bu! Pikiran plong, aku balik ke lab dengan semangat baru!', 'tersenyum', 'Bima melangkah mantap.'),
      kemajuanKecil: line('Makasih waktunya Bu, nanti aku timbang lagi baik-baik.', 'netral', 'Bima mengangguk sopan.'),
      menarikDiri: line('Permisi dulu ya Bu.', 'menutup-diri', 'Bima keluar cepat.'),
    },
  },

  // 08 — Hendra Wijaya (Sering diminta tolong mendadak hingga tugas pribadinya tertunda)
  {
    studentId: 'mhs-08',
    firstName: 'Hendra',
    title: 'Cerita Hendra Wijaya',
    labSceneTitle: 'Stasiun Cetak 3D',
    labSceneCaption: 'Hendra baru kembali ke mesin printer 3D setelah dipanggil dua teman berbeda; bahunya tampak letih.',
    opening: line(
      'Eh, halo Bu! Sori agak ngos-ngosan, baru saja bantu beresin nozzle printer sebelah yang mampet.',
      'lelah',
      'Hendra mengusap keningnya sambil menatap antrean cetaknya sendiri yang belum mulai.',
    ),
    t1: [
      {
        id: 'sapa', skillId: 'sapaan-hangat', best: true,
        text: 'Halo Hendra, kamu memang sigap banget bantu teman. Tapi kamu sendiri sudah sempat duduk sebentar?',
        reply: line(
          'Hehe, belum sempat dari pagi, Bu. Baru mau cetak prototipe sendiri, eh dipanggil lagi bantu kalibrasi.',
          'lelah',
          'Hendra tertawa lelah sambil melihat file cetaknya di layar.',
        ),
      },
      {
        id: 'terbuka', skillId: 'pertanyaan-terbuka',
        text: 'Kelihatannya pagi ini kamu sibuk mondar-mandir terus. Gimana progres tugasmu sendiri?',
        reply: line(
          'Nah itu dia, Bu... punyaku malah belum mulai dicetak dari kemarin karena keburu bantu yang lain dulu.',
          'cemas',
          'Hendra menggaruk pelan kepalanya.',
        ),
      },
      {
        id: 'nasihat', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Makanya jangan mau disuruh-suruh teman terus, Hendra. Bilang tidak saja.',
        reply: line('Nggak segampang itu bilang tidak ke teman sendiri, Bu...', 'kesal', 'Hendra terlihat kurang nyaman.'),
      },
    ],
    t2: [
      {
        id: 'amati', skillId: 'sampaikan-pengamatan', best: true,
        options: { observationTone: 'faktual' },
        text: 'Aku lihat tadi bahumu langsung turun waktu menatap antrean cetakmu sendiri. Rasanya kewalahan tapi nggak enak menolak ya?',
        reply: line(
          'Iya banget, Bu! Aku takut kalau nolak, mereka mikir aku pelit ilmu. Tapi di sini ramai, nanti malah kedengaran anak-anak yang tadi minta tolong.',
          'cemas',
          'Hendra melirik ke mesin printer di sebelahnya.',
        ),
      },
      {
        id: 'validasi', skillId: 'validasi-normalisasi',
        text: 'Menjadi orang yang diandalkan memang menyenangkan, tapi bisa sangat melelahkan kalau tugas sendiri ikut tertunda.',
        reply: line(
          'Betul sekali, Bu. Jujur energiku rasanya sudah habis padahal tugas pribadiku baru mulai.',
          'lelah',
          'Hendra menghela napas panjang.',
        ),
      },
      {
        id: 'tertutup', skillId: 'pertanyaan-tertutup',
        text: 'Sudah berapa kali hari ini kamu bantu orang lain?',
        reply: line(
          'Sudah tiga kali dari pagi, Bu. Nggak enak bahas di sini sih.',
          'lelah',
          'Hendra memelankan suaranya.',
        ),
      },
    ],
    t3: [
      {
        id: 'privasi', skillId: 'batas-kerahasiaan', best: true,
        text: 'Yuk istirahat duduk sebentar di Ruang Konsultasi, cuma berdua. Ceritamu aman di sini.',
        reply: line(
          'Wah makasih banyak, Bu, akhirnya bisa duduk! Jujur, aku senang kok bantu teman, tapi minggu ini tugasku sendiri sudah mepet tenggat dan aku bingung cara nolak tanpa bikin tersinggung.',
          'lega',
          'Hendra duduk santai di kursi Ruang Konsultasi.',
        ),
      },
      {
        id: 'ajak', skillId: 'validasi-normalisasi',
        text: 'Kita ngobrol santai lima menit di Ruang Konsultasi yuk, sekalian kamu tarik napas dulu.',
        reply: line(
          'Boleh banget, Bu! Rasanya kaki pegal banget. Sebenarnya aku bingung cara membagi waktu antara bantu teman dan beresin cetak 3D punyaku sendiri.',
          'lelah',
          'Hendra menyandarkan punggungnya lega.',
        ),
      },
      {
        id: 'janji', skillId: 'janji-mutlak', isMisstep: true,
        text: 'Ayo masuk, nanti aku larang semua mahasiswa minta bantuan ke kamu.',
        reply: line('Jangan dilarang gitu Bu, aku malah jadi sungkan sama teman-teman...', 'cemas', 'Hendra menggeleng cepat.'),
      },
    ],
    t4: [
      {
        id: 'refleksi', skillId: 'refleksi-perasaan', best: true,
        options: { reflectionNuance: 'lelah-kewalahan' },
        text: 'Kamu tetap ingin jadi teman yang suportif, tapi di saat yang sama kamu juga butuh waktu untuk menjaga tanggung jawabmu sendiri.',
        reply: line(
          'Iya Bu, persis! Selama ini aku selalu mikir kalau nggak bantu detik itu juga, berarti aku teman yang jahat. Padahal kalau aku bilang "sejam lagi ya, punyaku lagi jalan", mungkin mereka paham juga ya?',
          'tertegun',
          'Hendra memandang konselor dengan ekspresi baru tersadar.',
        ),
      },
      {
        id: 'terbuka', skillId: 'pertanyaan-terbuka',
        text: 'Menurutmu, apa bedanya menolak mentah-mentah dengan menunda bantuan ke jam tertentu?',
        reply: line(
          'Oh! Kalau bilang "sekarang aku lagi beresin punyaku dulu, habis jam dua kubantu ya", itu tetap ramah tapi waktuku tetap aman ya, Bu!',
          'tersenyum',
          'Senyum cerah mulai muncul di wajah Hendra.',
        ),
      },
      {
        id: 'interogasi', skillId: 'interogasi', isMisstep: true,
        text: 'Kenapa dari kemarin nggak kamu ajarin saja mereka memperbaiki nozzle sendiri?',
        reply: line('Sudah pernah sih Bu, cuma mereka tetap panggil aku kalau panik...', 'lelah', 'Hendra menunduk.'),
      },
    ],
    t5: [
      {
        id: 'parafrase', skillId: 'parafrase-ringkasan', best: true,
        text: 'Jadi menetapkan batas waktu bukan berarti berhenti membantu—justru itu cara agar kamu tetap bertenaga dan bisa terus menolong tanpa mengorbankan tugasmu.',
        reply: line(
          'Wah, kalimat itu ngena banget, Bu! Aku bisa bantu jauh lebih enak kalau tugasku sendiri sudah tenang.',
          'lega',
          'Hendra mengangguk mantap.',
        ),
      },
      {
        id: 'validasi', skillId: 'validasi-normalisasi',
        text: 'Teman yang baik pasti mengerti kok kalau kamu juga punya tenggat praktikum sendiri.',
        reply: line(
          'Iya Bu, bener banget. Aku saja yang selama ini keburu nggak enakan sendiri.',
          'tersenyum',
          'Hendra tertawa ringan.',
        ),
      },
      {
        id: 'tertutup', skillId: 'pertanyaan-tertutup',
        text: 'Kamu siap coba bilang "nanti jam dua ya" kalau ada yang memanggil mendadak?',
        reply: line('Siap Bu, kedengarannya ramah banget itu.', 'tersenyum', 'Hendra mengangguk.'),
      },
    ],
    t6: [
      {
        id: 'afirmasi', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Keahlianmu merawat printer 3D sangat berharga di lab ini, Hendra. Langkah kecil apa yang mau kamu terapkan mulai hari ini?',
        reply: line(
          'Aku mau pasang jadwal fokus 2 jam dulu buat cetak prototipeku, terus kalau ada yang minta bantuan mendadak, aku tawarin bantu bareng setelah sesi cetakku beres—sekalian ajarin cara cek nozzle dasar!',
          'tersenyum',
          'Hendra tampak penuh semangat dan segar kembali.',
        ),
      },
      {
        id: 'terbuka', skillId: 'pertanyaan-terbuka',
        text: 'Cara paling nyaman apa yang mau kamu pakai begitu kembali ke area Cetak 3D nanti?',
        reply: line(
          'Mulai nyalain cetakan punyaku duluan, lalu sampaikan baik-baik ke teman jam berapa aku bisa bantu. Simpel tapi bikin tenang, Bu!',
          'lega',
          'Hendra tersenyum lega.',
        ),
      },
      {
        id: 'nasihat', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Pasang saja tulisan "Jangan Ganggu" besar-besar di mejamu.',
        reply: line('Waduh, serem amat Bu, nanti teman-teman malah takut sama aku...', 'cemas', 'Hendra tertawa canggung.'),
      },
    ],
    t7: [
      {
        id: 'tutup', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Rencana yang ramah dan tegas, Hendra! Menjaga energimu sendiri juga bagian dari peduli sama lab ini.',
        reply: line(
          'Makasih banyak, Bu! Rasanya segar lagi habis ngobrol. Aku balik ke Cetak 3D dulu ya, kali ini cetakan punyaku yang duluan jalan!',
          'tersenyum',
          'Hendra berdiri penuh semangat dan melangkah keluar dengan ringan.',
        ),
      },
      {
        id: 'ringkas', skillId: 'parafrase-ringkasan',
        text: 'Fokus 2 jam untuk tugasmu dulu, lalu bantu teman di jam yang sudah kamu atur. Semangat ya, Hendra!',
        reply: line('Siap, Bu! Terima kasih banyak ya.', 'lega', 'Hendra mengangguk ceria.'),
      },
      {
        id: 'singkat', skillId: 'sapaan-hangat',
        text: 'Semangat ya Hendra, jangan lupa istirahat.',
        reply: line('Makasih, Bu!', 'tersenyum', 'Hendra berpamitan ramah.'),
      },
    ],
    tensionOpening: line(
      'Iya deh Bu, nanti aku atur sendiri. Aku balik ke mesin 3D dulu ya.',
      'menutup-diri',
      'Hendra bangkit dengan bahu masih tampak berat.',
    ),
    tensionRecognized: line(
      'Makasih Bu, aku cuma nggak mau dianggap sombong sama teman-teman lab.',
      'menunduk',
      'Hendra kembali duduk lebih rileks.',
    ),
    endings: {
      terbantu: line('Makasih banyak Bu! Badanku rasanya ringan lagi, mau langsung jalanin proyekku!', 'tersenyum', 'Hendra tersenyum cerah.'),
      kemajuanKecil: line('Makasih ya Bu, lumayan bikin tenang.', 'netral', 'Hendra mengangguk sopan.'),
      menarikDiri: line('Permisi dulu ya Bu, takut printer sebelah bunyi lagi.', 'menutup-diri', 'Hendra pergi cepat.'),
    },
  },
];
