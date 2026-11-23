/**
 * Story_Graph penuh Farhan Pratama (mhs-16 — Studio Desain & Multimedia).
 */
import { buildAuthoredFullStory, mkLine } from './authoredBuilder';

export const STORY_MHS_16 = buildAuthoredFullStory({
  studentId: 'mhs-16',
  prefix: 'fa',
  firstName: 'Farhan',
  title: 'Percakapan dengan Farhan',
  labTitle: 'Studio Desain & Multimedia',
  labCaption: 'Farhan menunduk di depan pen tablet dan layar grafis di Studio Desain.',
  bkCaption: 'Ruang Konsultasi tenang berjendela taman, jauh dari hiruk-pikuk monitor studio.',
  primaryNuance: 'ragu-kurang-percaya',
  openingReply: mkLine(
    'Oh, siang Bu. Aku Farhan, baru ulang menggambar sketsa layar antarmuka proyek di Studio Desain.',
    'lelah',
    'Farhan memutar stylus di tangannya lalu melirik monitor grafis.',
  ),
  openingReactions: {
    'sapaan-hangat': mkLine('Terima kasih sudah mampir ke Studio Desain, Bu. Kabarku agak penat tapi masih jalan.', 'tersenyum', 'Farhan tersenyum sopan sambil menaruh stylus.'),
    'pertanyaan-terbuka': mkLine('Lagi merombak tata letak tombol peringatan alat untuk keempat kalinya hari ini, Bu.', 'lelah', 'Farhan menunjuk dua layar sketsa di depannya.'),
    'pertanyaan-tertutup': mkLine('Ya begitulah Bu, masih terus bongkar-pasang tampilan biar pas.', 'netral', 'Farhan mengangguk singkat.'),
    'nasihat-dini': mkLine('Aku memang lagi cari waktu jeda kok Bu, cuma sketsanya belum beres.', 'waspada', 'Farhan merapikan tepi tabletnya dengan kaku.'),
  },
  steps: {
    n1: {
      reply: mkLine('Dari pagi aku sudah bikin tiga versi tampilan dashboard, tapi semuanya kuhapus lagi.', 'lelah', 'Farhan menatap berkas revisi di monitor dengan bahu turun.'),
      choices: [
        { id: 'a', skillId: 'afirmasi-kekuatan', best: true, text: 'Ketelitianmu merapikan tata letak layar agar mudah dipakai itu kelihatan sekali, Farhan.', reaction: mkLine('Makasih Bu, jarang ada yang lihat detail tata letaknya dulu sebelum komentar.', 'tersenyum', 'Farhan menghela napas sedikit lebih ringan.') },
        { id: 'b', skillId: 'jeda-hening', text: 'Silakan selesaikan goresan terakhir itu, saya tunggu di sebelahmu.', reaction: mkLine('Sebentar ya Bu, aku simpan dulu salinan drafnya biar nggak hilang.', 'netral', 'Farhan menekan tombol simpan pelan.') },
        { id: 'c', skillId: 'validasi-normalisasi', text: 'Revisi berulang memang bikin mata dan pikiran cepat jenuh.', reaction: mkLine('Iya Bu, dari pagi layar terang terus rasanya perih di mata.', 'lelah', 'Farhan mengedip pelan.') },
        { id: 'd', skillId: 'pertanyaan-tertutup', text: 'Versi yang keempat ini sudah pasti selesai hari ini, kan?', reaction: mkLine('Belum tentu juga Bu, aku sendiri masih ragu cocok atau tidak.', 'cemas', 'Farhan menggigit bibirnya sebentar.') },
      ],
    },
    n2: {
      reply: mkLine('Tadi barusan ada anak stasiun sebelah lewat lalu nyeletuk sketsa ini cuma hiasan warna saja.', 'menunduk', 'Farhan mengecilkan suaranya sambil melirik pintu Studio Desain.', 'Terdengar langkah beberapa mahasiswa melintas di koridor luar studio.'),
      choices: [
        { id: 'a', skillId: 'validasi-normalisasi', best: true, text: 'Wajar rasanya mengganjal kalau kerja keras visualmu dianggap sekadar hiasan.', reaction: mkLine('Iya Bu, padahal aku menyusunnya biar operator nggak salah tekan tombol.', 'tertegun', 'Tatapan Farhan tertuju ke konselor.') },
        { id: 'b', skillId: 'pertanyaan-terbuka', text: 'Apa yang langsung terlintas di pikiranmu waktu mendengar celetukan itu?', reaction: mkLine('Aku langsung mikir jangan-jangan peran desain memang nggak dihargai di sini.', 'cemas', 'Farhan meremas pelan ujung flanelnya.') },
        { id: 'c', skillId: 'jeda-hening', text: 'Ambil napas dulu, tidak perlu buru-buru merespons komentar tadi.', reaction: mkLine('Iya Bu, aku coba tenang dulu biar nggak keburu emosi.', 'netral', 'Farhan menyandarkan punggungnya.') },
        { id: 'd', skillId: 'meremehkan', text: 'Ah, komentar sambil lewat begitu tidak usah dimasukkan hati.', reaction: mkLine('Mudah bilang begitu Bu, tapi komentarnya sudah berulang sejak minggu lalu.', 'kesal', 'Alis Farhan berkerut tajam.') },
      ],
    },
    n3: {
      reply: mkLine('Di studio ini agak ramai lalu-lalang, jadi aku sungkan cerita panjang soal timku.', 'waspada', 'Farhan melirik kursi kosong di dekat pintu studio.'),
      choices: [
        { id: 'a', skillId: 'sapaan-hangat', best: true, text: 'Kita jalan sebentar ke Ruang Konsultasi yuk, biar matamu istirahat dan obrolannya lebih tenang.', reaction: mkLine('Boleh banget Bu, aku matikan dulu layar pen tabletku sebentar.', 'lega', 'Farhan berdiri sambil menaruh stylus rapi.') },
        { id: 'b', skillId: 'pertanyaan-terbuka', text: 'Tempat mana yang terasa paling nyaman buatmu melanjutkan obrolan ini?', reaction: mkLine('Ruang Konsultasi saja Bu, di sana sepi dan nggak ada suara kipas komputer.', 'netral', 'Farhan mengangguk ke arah koridor.') },
        { id: 'c', skillId: 'jeda-hening', text: 'Kalau kamu siap pindah ke ruangan tenang, saya bisa jalan bersamamu.', reaction: mkLine('Ayo Bu, aku siap sekarang.', 'netral', 'Farhan melangkah pelan keluar studio.') },
        { id: 'd', skillId: 'pertanyaan-tertutup', text: 'Kamu mau ikut ke Ruang Konsultasi sekarang juga, kan?', reaction: mkLine('Iya Bu, aku ikut saja daripada makin ramai di sini.', 'waspada', 'Farhan mengikuti dengan langkah agak kaku.') },
      ],
    },
    n4: {
      reply: mkLine('Lumayan adem di sini, Bu. Mataku akhirnya bisa lepas sebentar dari garis kotak-kotak antarmuka.', 'lega', 'Farhan duduk santai di Ruang Konsultasi.'),
      choices: [
        { id: 'a', skillId: 'batas-kerahasiaan', best: true, setFlags: ['batas-dijelaskan'], text: 'Semua yang kamu ceritakan di ruangan ini tetap di antara kita, kecuali ada hal membahayakan.', reaction: mkLine('Syukurlah Bu, itu bikin aku jauh lebih berani cerita jujur soal dinamika tim.', 'lega', 'Bahu Farhan turun dengan tenang.') },
        { id: 'b', skillId: 'sapaan-hangat', text: 'Terima kasih sudah mau meluangkan waktu duduk sebentar bersama saya, Farhan.', reaction: mkLine('Sama-sama Bu, aku juga memang butuh teman ngobrol di luar monitor.', 'tersenyum', 'Farhan tersenyum ramah.') },
        { id: 'c', skillId: 'jeda-hening', text: 'Tidak usah terburu-buru, ceritakan saja dari bagian yang paling nyaman.', reaction: mkLine('Oke Bu, aku tarik napas dulu sebentar ya.', 'netral', 'Farhan menyandarkan tangan di pangkuan.') },
        { id: 'd', skillId: 'pertanyaan-tertutup', text: 'Sekarang di sini sudah cukup tenang buat cerita, kan?', reaction: mkLine('Iya Bu, sudah jauh lebih tenang.', 'netral', 'Farhan mengangguk singkat.') },
      ],
    },
    n5: {
      reply: mkLine('Sejak masuk vokasi dari Makassar, aku suka banget memadukan desain visual dengan sistem alat.', 'netral', 'Farhan menatap cangkir teh hangat di meja.'),
      choices: [
        { id: 'a', skillId: 'pertanyaan-terbuka', best: true, text: 'Apa yang paling kamu sukai dari merancang tampilan untuk alat laboratorium?', reaction: mkLine('Saat orang awam langsung paham cara pakai alat tanpa bingung baca manual tebal, itu puas banget Bu.', 'tersenyum', 'Mata Farhan tampak berbinar sebentar.') },
        { id: 'b', skillId: 'afirmasi-kekuatan', text: 'Kemampuan menjembatani teknologi rumit ke tampilan sederhana itu nilai tambah besar.', reaction: mkLine('Nah itu harapanku Bu, cuma di tim kadang terasa kurang dianggap.', 'netral', 'Farhan mengangguk pelan.') },
        { id: 'c', skillId: 'validasi-normalisasi', text: 'Memadukan rasa visual dengan ketepatan teknik memang jalur unik yang tidak semua orang bisa.', reaction: mkLine('Betul Bu, tapi justru karena unik itu aku kadang merasa sendirian di tengah tim.', 'menunduk', 'Farhan menatap ujung sepatunya.') },
        { id: 'd', skillId: 'nasihat-dini', text: 'Sebaiknya kamu lebih sering pamer kemampuan kodingmu supaya teman-teman segan.', reaction: mkLine('Aku nggak pengin pamer kode melulu Bu, aku ingin karyaku di desain juga dihargai.', 'waspada', 'Farhan menggeleng lembut.') },
      ],
    },
    n6: {
      reply: mkLine('Minggu ini pas rapat evaluasi, bagian tampilan yang kubuat cuma dibahas dua menit lalu dilewati.', 'menunduk', 'Farhan mengetuk jari pelan di sandaran kursi.'),
      choices: [
        { id: 'a', skillId: 'pertanyaan-terbuka', best: true, text: 'Ceritakan dong, bagian mana dari rapat evaluasi kemarin yang paling bikin kamu terganjal?', reaction: mkLine('Waktu aku mau jelasin alur tombol darurat di layar, langsung dipotong karena dianggap urusan akhir.', 'cemas', 'Suara Farhan sedikit bergetar.') },
        { id: 'b', skillId: 'jeda-hening', text: 'Saya menyimak penuh, silakan teruskan ceritanya.', reaction: mkLine('Sejak rapat itu, setiap kali aku buka tablet rasanya ingin hapus semua lalu mulai dari nol.', 'lelah', 'Farhan menghela napas berat.') },
        { id: 'c', skillId: 'validasi-normalisasi', text: 'Dilewati begitu cepat saat sudah menyiapkan bahan dengan rapi memang terasa mengecewakan.', reaction: mkLine('Iya Bu, padahal aku begadang dua malam menyiapkan prototipe klik-nya.', 'menunduk', 'Farhan mengangguk lirih.') },
        { id: 'd', skillId: 'interogasi', text: 'Kenapa kamu diam saja waktu rapat kemarin bukannya langsung menyanggah?', reaction: mkLine('Suasananya sudah cepat sekali pindah topik Bu, aku jadi kikuk sendiri.', 'waspada', 'Farhan menarik bahunya ke belakang.') },
      ],
    },
    n7: {
      reply: mkLine('Gara-gara itu, aku jadi terus mengulang sketsa sampai keempat kalinya karena takut nanti dikritik lagi.', 'cemas', 'Farhan mengusap pelipisnya pelan.'),
      choices: [
        { id: 'a', skillId: 'sampaikan-pengamatan', best: true, options: { observationTone: 'faktual' }, text: 'Saya perhatikan setiap menyebut revisi keempat, bahumu langsung tampak makin tegang.', reaction: mkLine('Iya ya Bu... baru sadar aku sendiri yang menekan diri supaya kelihatan sempurna tanpa celah.', 'tertegun', 'Farhan meraba pundaknya sendiri.') },
        { id: 'b', skillId: 'pertanyaan-terbuka', text: 'Apa yang kamu khawatirkan terjadi bila versi ketigamu yang tadi tetap dipertahankan?', reaction: mkLine('Aku takut mereka bilang desainku biasa saja dan makin menganggap remeh peran studio desain.', 'cemas', 'Farhan menunduk memandangi tangannya.') },
        { id: 'c', skillId: 'parafrase-ringkasan', text: 'Jadi revisi berulang ini cara kamu melindungi karyamu dari komentar meremehkan ya?', reaction: mkLine('Bisa dibilang begitu Bu, makin takut diremehkan malah makin nggak selesai-selesai.', 'lelah', 'Farhan mengangguk pelan.') },
        { id: 'd', skillId: 'sampaikan-pengamatan', options: { observationTone: 'menilai' }, text: 'Kelihatannya kamu terlalu perfeksionis dan tidak mau menerima kenyataan di tim.', reaction: mkLine('Aku bukan menolak kenyataan Bu, aku cuma ingin kualitas alurnya aman dipakai.', 'kesal', 'Wajah Farhan tampak tegang.') },
      ],
    },
    n8: {
      reply: mkLine('Jujur aku sering minder kalau dibandingkan sama teman yang hafal baris kode panjang, seolah gambaranku kelas dua.', 'menunduk', 'Farhan memutar ujung lengan flanel zamrudnya tanpa menatap ke atas.'),
      choices: [
        { id: 'a', skillId: 'refleksi-perasaan', best: true, options: { reflectionNuance: 'ragu-kurang-percaya' }, text: 'Kedengarannya kamu ragu apakah kekuatan visualmu dipandang setara di kampus vokasi ini.', reaction: mkLine('Persis itu Bu... di Makassar dulu aku bangga banget bisa menggambar alur, tapi di sini aku jadi ragu sendiri.', 'tertegun', 'Mata Farhan berkaca tipis namun lega.') },
        { id: 'b', skillId: 'validasi-normalisasi', text: 'Perasaan ragu saat kontribusi kita belum terlihat orang lain itu sangat manusiawi.', reaction: mkLine('Makasih Bu, setidaknya aku tahu rasa minderku ini nggak aneh sendiri.', 'netral', 'Farhan mengangguk pelan.') },
        { id: 'c', skillId: 'jeda-hening', text: 'Terima kasih sudah jujur menyebut rasa minder itu, ambil jeda sebentar ya.', reaction: mkLine('Baru kali ini aku berani mengucapkannya keras-keras, Bu.', 'lega', 'Farhan menarik napas panjang.') },
        { id: 'd', skillId: 'meremehkan', text: 'Jangan minder begitu, masalah antarmuka kan tinggal ikuti contoh dari internet saja.', reaction: mkLine('Kalau cuma salin dari internet, alat lab kita yang unik nggak bakal cocok alurnya, Bu.', 'kesal', 'Farhan mengerutkan keningnya.') },
      ],
    },
    n8alt: {
      reply: mkLine('Intinya aku cuma capek terus-terusan mengulang sketsa tapi belum yakin mana yang cukup.', 'lelah', 'Farhan mengangkat bahu singkat.'),
      choices: [
        { id: 'a', skillId: 'pertanyaan-terbuka', best: true, text: 'Menurutmu apa yang membuat sebuah rancangan layar terasa sudah cukup matang?', reaction: mkLine('Kalau orang lain coba pakai dan langsung ngerti tanpa aku perlu menjelaskan panjang lebar.', 'netral', 'Farhan menatap lurus ke depan.') },
        { id: 'b', skillId: 'validasi-normalisasi', text: 'Wajar kalau susah menentukan batas selesai ketika semua terasa mendesak.', reaction: mkLine('Iya Bu, apalagi kalau belum dapat umpan balik yang konkret.', 'lelah', 'Farhan mengangguk lirih.') },
        { id: 'c', skillId: 'jeda-hening', text: 'Kita urai satu per satu saja tanpa terburu-buru.', reaction: mkLine('Baik Bu, aku coba tenang dulu.', 'netral', 'Farhan menyandarkan punggungnya.') },
        { id: 'd', skillId: 'nasihat-dini', text: 'Lain kali tetapkan saja satu jam lalu langsung kirim tanpa pikir panjang.', reaction: mkLine('Kalau asal kirim tanpa uji alur, takutnya tombol pentingnya malah bikin bingung.', 'waspada', 'Farhan menggeleng pelan.') },
      ],
    },
    n9: {
      reply: mkLine('Padahal waktu simulasi alat pemanas kemarin, tombol peringatan merah rancanganku yang bikin operator cepat sadar.', 'tersenyum', 'Farhan tersenyum kecil mengingat uji coba minggu lalu.'),
      choices: [
        { id: 'a', skillId: 'afirmasi-kekuatan', best: true, text: 'Contoh tombol peringatan itu bukti nyata bahwa desainmu langsung menyangkut keselamatan kerja, Farhan!', reaction: mkLine('Benar juga ya Bu! Selama ini aku lupa menunjukkan dampak keselamatan itu waktu rapat.', 'tertegun', 'Wajah Farhan langsung tampak lebih cerah.') },
        { id: 'b', skillId: 'pertanyaan-terbuka', text: 'Bagaimana reaksi teman-temanmu waktu melihat tombol peringatan itu bekerja langsung?', reaction: mkLine('Mereka malah kaget dan bilang untung warnanya langsung mencolok di layar.', 'tersenyum', 'Farhan mengangguk mantap.') },
        { id: 'c', skillId: 'parafrase-ringkasan', text: 'Jadi kontribusi desainmu paling terasa justru saat diuji langsung pada skenario nyata ya?', reaction: mkLine('Iya Bu, bukan saat cuma dilihat sebagai gambar diam di slide presentasi.', 'tersenyum', 'Farhan tersenyum hangat.') },
        { id: 'd', skillId: 'pertanyaan-tertutup', text: 'Berarti sebenarnya temanmu sudah tahu desainmu penting, kan?', reaction: mkLine('Mereka ingat sebentar waktu kejadian, tapi pas rapat teori lupa lagi.', 'netral', 'Farhan tersenyum kecut.') },
      ],
    },
    n10: {
      reply: mkLine('Sebenarnya aku cuma ingin tim melihat desain antarmuka bukan sekadar kosmetik, tapi partner penting dari kode mereka.', 'tertegun', 'Farhan menatap jujur dengan suara yang akhirnya mantap.'),
      choices: [
        { id: 'a', skillId: 'refleksi-perasaan', best: true, options: { reflectionNuance: 'ragu-kurang-percaya' }, text: 'Kamu ingin peran desainmu diakui sebagai mitra teknis yang setara agar kamu bisa berkarya tenang.', reaction: mkLine('Persis itu Bu! Rasanya lega banget akhirnya bisa merumuskan apa yang selama ini mengganjal.', 'lega', 'Farhan menghela napas lega dengan mata cerah.') },
        { id: 'b', skillId: 'parafrase-ringkasan', text: 'Jadi kebutuhan utamamu adalah ruang kolaborasi di mana fungsi visual dan kode saling melengkapi.', reaction: mkLine('Iya Bu, kalau dua-duanya jalan bareng, produk lab kita pasti jauh lebih kuat.', 'tersenyum', 'Farhan mengangguk penuh semangat.') },
        { id: 'c', skillId: 'validasi-normalisasi', text: 'Keinginan untuk dihargai secara setara atas keahlianmu itu wajar dan sehat sekali.', reaction: mkLine('Terima kasih Bu sudah membantu aku melihatnya lebih jernih.', 'lega', 'Farhan tersenyum tipis.') },
        { id: 'd', skillId: 'refleksi-perasaan', toTension: true, options: { reflectionCorrectOverride: false }, text: 'Kamu pasti sangat marah dan iri pada teman-teman pemrogramanmu ya?', reaction: mkLine('Aku nggak iri sama sekali pada mereka, Bu!', 'kesal', 'Farhan menegakkan duduknya dengan raut tersinggung.') },
      ],
    },
    n10alt: {
      reply: mkLine('Aku mulai paham sih, mungkin selama ini aku kurang menunjukkan sisi fungsional desainku.', 'netral', 'Farhan mengangguk pelan.'),
      choices: [
        { id: 'a', skillId: 'pertanyaan-terbuka', best: true, text: 'Apa kebutuhan terbesarmu supaya kamu kembali bersemangat berkarya di Studio Desain?', reaction: mkLine('Aku ingin desainku diuji bareng tim sejak awal, bukan cuma diminta merapikan di akhir.', 'tersenyum', 'Farhan menatap penuh harapan.') },
        { id: 'b', skillId: 'parafrase-ringkasan', text: 'Jadi kamu butuh cara memperkenalkan nilai guna rancanganmu lebih awal ke tim.', reaction: mkLine('Iya Bu, biar mereka langsung lihat manfaatnya.', 'netral', 'Farhan mengangguk.') },
        { id: 'c', skillId: 'validasi-normalisasi', text: 'Menyadari celah komunikasi itu sudah kemajuan besar, Farhan.', reaction: mkLine('Makasih Bu, kepalaku terasa jauh lebih ringan.', 'lega', 'Farhan tersenyum tipis.') },
        { id: 'd', skillId: 'meremehkan', toTension: true, text: 'Kalau begitu memang salahmu sendiri tidak menjelaskan dari awal.', reaction: mkLine('Kok jadi aku semua yang disalahkan sih, Bu?', 'kesal', 'Farhan mengerutkan keningnya.') },
      ],
    },
    n11: {
      reply: mkLine('Aku jadi terpikir: daripada terus menghapus draf keempat, mending kuuji langsung versi ketiganya ke tim.', 'tersenyum', 'Farhan menepuk pelan lututnya dengan ide baru.'),
      choices: [
        { id: 'a', skillId: 'parafrase-ringkasan', best: true, text: 'Jadi kamu memilih berhenti terjebak revisi tanpa ujung dan mulai menguji fungsinya langsung bersama rekanmu?', reaction: mkLine('Betul Bu! Dengan uji coba singkat 5 menit, aku dapat masukan nyata bukan cuma menebak sendiri.', 'tersenyum', 'Farhan tersenyum cerah.') },
        { id: 'b', skillId: 'afirmasi-kekuatan', text: 'Keputusan menguji langsung prototipe itu tanda desainer yang matang.', reaction: mkLine('Hehe, makasih Bu, itu bikin aku tambah percaya diri.', 'tersenyum', 'Farhan tampak bersemangat.') },
        { id: 'c', skillId: 'pertanyaan-terbuka', text: 'Siapa rekan tim yang paling enak kamu ajak mencoba prototipe antarmuka itu duluan?', reaction: mkLine('Mungkin Ayu atau Bagas dulu Bu, mereka terbuka banget kalau diajak uji tampilan.', 'tersenyum', 'Farhan menyebut nama rekannya dengan yakin.') },
        { id: 'd', skillId: 'nasihat-dini', text: 'Pokoknya jangan pernah hapus sketsamu lagi mulai besok ya.', reaction: mkLine('Iya Bu, aku simpan riwayat versinya saja biar nggak mulai dari nol.', 'netral', 'Farhan mengangguk.') },
      ],
    },
    n12: {
      reply: mkLine('Hari ini aku mau simpan versi stabilnya lalu bikin demo klik 3 layar untuk kutunjukkan ke tim firmware.', 'tersenyum', 'Farhan mencatat rencana kecilnya di buku saku.'),
      choices: [
        { id: 'a', skillId: 'afirmasi-kekuatan', best: true, setFlags: ['langkah-kecil'], text: 'Demo klik 3 layar itu langkah kecil yang konkret dan langsung memperlihatkan nilai karyamu!', reaction: mkLine('Iya Bu, singkat, jelas, dan nggak bikin aku lembur menghapus gambar lagi.', 'lega', 'Farhan tersenyum puas.') },
        { id: 'b', skillId: 'pertanyaan-terbuka', setFlags: ['langkah-kecil'], text: 'Apa yang paling ingin kamu soroti saat menunjukkan demo 3 layar itu nanti?', reaction: mkLine('Kecepatan operator membaca tanda bahaya sensor, Bu—biar jelas ini soal keselamatan.', 'tersenyum', 'Farhan mengangguk tegas.') },
        { id: 'c', skillId: 'batas-kerahasiaan', text: 'Kalau setelah demo nanti mau cerita lagi, ruang ini tetap terbuka dan terjaga rahasianya.', reaction: mkLine('Makasih banyak Bu, tenang rasanya tahu ada tempat ngobrol aman.', 'lega', 'Farhan tersenyum hangat.') },
        { id: 'd', skillId: 'janji-mutlak', text: 'Saya jamin seratus persen timmu pasti langsung memuji dan tidak akan menyindir lagi.', reaction: mkLine('Semoga saja ya Bu, yang penting aku sudah berani menunjukkan fungsinya.', 'netral', 'Farhan tersenyum sopan.') },
      ],
    },
    n13: {
      reply: mkLine('Enak banget rasanya kepala sudah nggak penuh suara ragu lagi. Aku jadi kangen pegang stylus lagi.', 'lega', 'Farhan merapikan buku sakunya dan duduk tegak.'),
      choices: [
        { id: 'a', skillId: 'pertanyaan-terbuka', best: true, text: 'Apa satu pengingat baik untuk dirimu sendiri kalau rasa ragu itu sempat mampir lagi?', reaction: mkLine('Bahwa desain yang jelas menyelamatkan waktu dan keselamatan pengguna, bukan cuma hiasan.', 'tersenyum', 'Farhan mengucapkannya dengan suara mantap.') },
        { id: 'b', skillId: 'validasi-normalisasi', text: 'Senang melihat semangatmu di Studio Desain kembali menyala, Farhan.', reaction: mkLine('Makasih banget Bu sudah mau mendengarkan tanpa mengecilkan bidangku.', 'lega', 'Farhan tersenyum lebar.') },
        { id: 'c', skillId: 'jeda-hening', text: 'Nikmati dulu rasa lega itu sebelum kembali ke meja studio ya.', reaction: mkLine('Siap Bu, aku minum air sebentar sebelum lanjut kerja.', 'tersenyum', 'Farhan mengangguk santai.') },
        { id: 'd', skillId: 'nasihat-dini', text: 'Ingat, jangan terlalu sensitif lagi kalau ada komentar kecil dari teman.', reaction: mkLine('Aku coba fokus ke bukti fungsinya saja nanti, Bu.', 'netral', 'Farhan mengangguk singkat.') },
      ],
    },
    n14: {
      reply: mkLine('Terima kasih banyak ya Bu, aku balik ke Studio Desain buat menyimpan versi terbaik sketsaku sekarang.', 'tersenyum', 'Farhan berdiri dari kursi dengan langkah ringan.'),
      choices: [
        { id: 'a', skillId: 'parafrase-ringkasan', best: true, text: 'Hari ini kita mengurai keraguanmu dan menyusun demo 3 layar yang konkret. Selamat berkarya, Farhan!', reaction: mkLine('Siap Bu, terima kasih banyak!', 'lega', 'Farhan melambaikan tangan ramah.') },
        { id: 'b', skillId: 'afirmasi-kekuatan', text: 'Karya visualmu memberi jiwa pada teknologi lab kita. Semangat terus ya!', reaction: mkLine('Makasih Bu, ucapan Ibu bakal kuingat terus!', 'lega', 'Farhan tersenyum lebar.') },
        { id: 'c', skillId: 'validasi-normalisasi', text: 'Terima kasih sudah berbagi cerita jujur hari ini, pintu ruang ini selalu terbuka.', reaction: mkLine('Sampai jumpa di lab ya Bu!', 'tersenyum', 'Farhan mengangguk sopan.') },
        { id: 'd', skillId: 'nasihat-dini', text: 'Cepat selesaikan proyeknya biar tidak ketinggalan jadwal demo.', reaction: mkLine('Baik Bu, aku permisi dulu.', 'netral', 'Farhan keluar dengan langkah cepat.') },
      ],
    },
  },
  tension: {
    awalReply: mkLine('Aku bukan iri pada anak pemrograman, Bu! Kenapa perasaanku malah dituduh seperti itu?', 'menutup-diri', 'Farhan menyilangkan tangan dan menatap meja dengan kaku.'),
    perbaikanReply: mkLine('Hmm... iya Bu, kalimat barusan memang bikin aku merasa makin tidak dipahami.', 'waspada', 'Farhan melirik sebentar namun suaranya mulai melunak.'),
  },
  endings: {
    terbantu: mkLine('Makasih banyak Bu! Aku siap bawa demo klik 3 layar ke tim dan berkarya penuh percaya diri di Studio Desain!', 'lega', 'Farhan keluar Ruang Konsultasi dengan mata berbinar.'),
    kemajuan: mkLine('Makasih ya Bu sudah dengar, aku coba simpan dulu satu versi sketsaku pelan-pelan.', 'netral', 'Farhan mengangguk sopan sebelum keluar.'),
    menarik: mkLine('Permisi Bu, aku mau kembali merapikan mejaku sendiri dulu di Studio Desain.', 'menutup-diri', 'Farhan melangkah keluar dengan kepala tertunduk.'),
  },
});
