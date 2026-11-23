/**
 * Story_Graph penuh Bagas Saputra (mhs-18 — Koordinator Robotika Lintas-Lab).
 */
import { buildAuthoredFullStory, mkLine } from './authoredBuilder';

export const STORY_MHS_18 = buildAuthoredFullStory({
  studentId: 'mhs-18',
  prefix: 'bg',
  firstName: 'Bagas',
  title: 'Percakapan dengan Bagas',
  labTitle: 'Studio Desain & Multimedia',
  labCaption: 'Bagas membawa rangka robotika dari Cetak 3D ke Studio Desain sambil menaikkan goggles ke dahinya.',
  bkCaption: 'Ruang Konsultasi yang tenang, memberi jeda singkat dari riuh koordinasi lintas stasiun.',
  primaryNuance: 'lelah-kewalahan',
  openingReply: mkLine(
    'Eh, siang Bu! Aku Bagas, baru bawa dudukan motor dari Cetak 3D ke Studio Desain buat cek ukuran layar.',
    'lelah',
    'Bagas menyandarkan rangka aluminium di tepi meja sambil mengatur napas.',
  ),
  openingReactions: {
    'sapaan-hangat': mkLine('Siang Bu! Aman kok, cuma agak ngos-ngosan sedikit habis muter tiga stasiun dari pagi.', 'lelah', 'Bagas nyengir lelah sambil menaikkan goggles-nya.'),
    'pertanyaan-terbuka': mkLine('Lagi menyocokkan baut rangka mekanik, cetakan 3D, sama layar kendali robotika proyek angkatan, Bu.', 'netral', 'Bagas menunjuk bagian sambungan di tangannya.'),
    'pertanyaan-tertutup': mkLine('Lumayan sibuk Bu, semua stasiun lagi minta dicek barengan hari ini.', 'lelah', 'Bagas mengangguk cepat.'),
    'nasihat-dini': mkLine('Nanti aku istirahat kok Bu, tanggung ini dua stasiun lagi nunggu kabar.', 'waspada', 'Bagas melirik arlojinya sedikit gelisah.'),
  },
  steps: {
    n1: {
      reply: mkLine('Dari jam delapan pagi belum sempat duduk lama, tiap beres satu stasiun langsung dipanggil stasiun sebelah.', 'lelah', 'Bagas memijat bahunya sendiri yang tampak pegal.'),
      choices: [
        { id: 'a', skillId: 'afirmasi-kekuatan', best: true, text: 'Kemampuanmu membaca kaitan antar-stasiun dari rangka sampai kendali itu luar biasa, Bagas.', reaction: mkLine('Hehe makasih Bu, cuma kalau semua lewat tanganku sendiri, lama-lama capek juga.', 'tersenyum', 'Bagas tersenyum kecil sambil menghela napas.') },
        { id: 'b', skillId: 'jeda-hening', text: 'Taruh dulu rangkanya di meja, ambil napas sebentar tanpa buru-buru.', reaction: mkLine('Iya Bu, berat juga ternyata digotong bolak-balik koridor.', 'lelah', 'Bagas meletakkan rangka dengan lega.') },
        { id: 'c', skillId: 'validasi-normalisasi', text: 'Bolak-balik mengurus tiga stasiun tanpa jeda sejak pagi pasti menguras tenaga sekali.', reaction: mkLine('Beneran kerasa di punggung nih Bu, apalagi semua minta cepat.', 'lelah', 'Bagas mengangguk pelan.') },
        { id: 'd', skillId: 'pertanyaan-tertutup', text: 'Proyek robotikamu hari ini sudah hampir beres semua, kan?', reaction: mkLine('Belum Bu, baru setengah jalan tapi tenaga sudah berasa habis.', 'cemas', 'Bagas mengusap keningnya.') },
      ],
    },
    n2: {
      reply: mkLine('Tuh kan, baru berhenti semenit ponselku sudah bunyi lagi dari anak Cetak 3D minta dicek dudukan bautnya.', 'cemas', 'Bagas melirik layar ponselnya yang menyala bertubi-tubi.', 'Terdengar panggilan samar "Gas, tolong lihat ini sebentar!" dari koridor.'),
      choices: [
        { id: 'a', skillId: 'validasi-normalisasi', best: true, text: 'Rasanya seperti tidak punya ruang bernapas ya saat semua stasiun mengandalkan satu orang?', reaction: mkLine('Persis banget Bu! Senang sih dipercaya, tapi kalau nonstop begini kepalaku mulai penuh.', 'tertegun', 'Bagas menaruh ponselnya menghadap ke bawah.') },
        { id: 'b', skillId: 'pertanyaan-terbuka', text: 'Apa yang biasanya terjadi kalau kamu tidak langsung menjawab panggilan mereka?', reaction: mkLine('Aku kepikiran jangan-jangan mereka macet terus jadwal lomba kita molor, Bu.', 'cemas', 'Bagas menatap rangkanya dengan tegang.') },
        { id: 'c', skillId: 'jeda-hening', text: 'Biarkan ponselnya diam sebentar dulu, dunia lab tidak akan runtuh dalam lima menit.', reaction: mkLine('Hehe iya juga ya Bu, lima menit doang masa nggak boleh.', 'tersenyum', 'Bagas menghela napas sedikit lega.') },
        { id: 'd', skillId: 'meremehkan', text: 'Makanya jangan kebanyakan gaya jadi koordinator kalau ternyata gampang capek.', reaction: mkLine('Aku nggak pernah cari gaya Bu, aku cuma tanggung jawab sama proyek bareng ini!', 'kesal', 'Rahang Bagas mengeras seketika.') },
      ],
    },
    n3: {
      reply: mkLine('Kalau kita berdiri terus di dekat pintu Studio Desain, sebentar lagi pasti ada yang manggil lagi nih, Bu.', 'lelah', 'Bagas melirik koridor yang mulai ramai mahasiswa.'),
      choices: [
        { id: 'a', skillId: 'sapaan-hangat', best: true, text: 'Yuk kita menepi lima menit ke Ruang Konsultasi—bebas panggilan dulu sambil kamu meluruskan punggung.', reaction: mkLine('Ide terbaik hari ini, Bu! Aku titip dulu rangkanya di meja pojok.', 'lega', 'Bagas tersenyum lega lalu berjalan santai.') },
        { id: 'b', skillId: 'pertanyaan-terbuka', text: 'Di mana tempat yang paling tenang supaya kita bisa ngobrol sebentar?', reaction: mkLine('Ruang Konsultasi saja Bu, pintu sana aman dari kejaran anak-anak.', 'tersenyum', 'Bagas melangkah ke arah lorong.') },
        { id: 'c', skillId: 'jeda-hening', text: 'Kita jalan pelan ke Ruang Konsultasi begitu kamu siap.', reaction: mkLine('Siap Bu, ayo sekarang sebelum dipanggil lagi.', 'netral', 'Bagas berjalan beriringan.') },
        { id: 'd', skillId: 'pertanyaan-tertutup', text: 'Kamu bisa tinggalkan stasiun sebentar buat ikut ke Ruang Konsultasi, kan?', reaction: mkLine('Bisa Bu, lima menit saja aman kok.', 'netral', 'Bagas mengangguk dan ikut berjalan.') },
      ],
    },
    n4: {
      reply: mkLine('Waduh, duduk di kursi empuk tanpa suara printer 3D ternyata nikmat banget ya, Bu.', 'lega', 'Bagas bersandar penuh di kursi Ruang Konsultasi.'),
      choices: [
        { id: 'a', skillId: 'batas-kerahasiaan', best: true, setFlags: ['batas-dijelaskan'], text: 'Semua yang kita obrolkan di ruangan ini terjaga kerahasiaannya, jadi kamu boleh cerita apa adanya.', reaction: mkLine('Makasih Bu, enak banget nggak perlu jaga wibawa jadi senior kuat terus di sini.', 'lega', 'Bagas menarik napas dalam-dalam.') },
        { id: 'b', skillId: 'sapaan-hangat', text: 'Terima kasih sudah mengizinkan dirimu berhenti sejenak hari ini, Bagas.', reaction: mkLine('Sama-sama Bu, aku baru sadar betapa tegangnya badanku tadi.', 'tersenyum', 'Bagas meregangkan pundaknya pelan.') },
        { id: 'c', skillId: 'jeda-hening', text: 'Santai saja, tidak usah langsung masuk ke laporan proyek—tarik napas dulu.', reaction: mkLine('Siap Bu, akhirnya ada yang nggak nanya progres duluan.', 'lega', 'Bagas tertawa pelan.') },
        { id: 'd', skillId: 'pertanyaan-tertutup', text: 'Sekarang sudah lebih enak buat bahas beban tugasmu, kan?', reaction: mkLine('Iya Bu, kepalaku sudah lumayan adem.', 'netral', 'Bagas mengangguk.') },
      ],
    },
    n5: {
      reply: mkLine('Dari dulu di Balikpapan aku anak sulung, terbiasa beresin hal teknis sendiri biar orang rumah nggak repot.', 'netral', 'Bagas menatap goggles yang ia lepas di atas meja.'),
      choices: [
        { id: 'a', skillId: 'pertanyaan-terbuka', best: true, text: 'Bagaimana kebiasaan jadi andalan di rumah itu terbawa ke caramu bekerja di laboratorium?', reaction: mkLine('Begitu lihat sambungan meleset sedikit, tanganku otomatis langsung ambil alih daripada menunggu teman.', 'netral', 'Bagas mengangguk menyadari polanya.') },
        { id: 'b', skillId: 'afirmasi-kekuatan', text: 'Rasa tanggung jawab besar itu lahir dari kepedulianmu yang tinggi terhadap tim.', reaction: mkLine('Betul Bu, aku sayang banget sama tim robotika angkatan ini.', 'tersenyum', 'Bagas tersenyum hangat.') },
        { id: 'c', skillId: 'validasi-normalisasi', text: 'Kebiasaan memikul semuanya sendiri sering terasa otomatis sampai badan sendiri yang protes.', reaction: mkLine('Kena banget Bu, baru kerasa minggu ini energiku turun drastis.', 'lelah', 'Bagas menghela napas panjang.') },
        { id: 'd', skillId: 'nasihat-dini', text: 'Seharusnya dari semester awal kamu sudah tegas menolak semua permintaan bantuan teman.', reaction: mkLine('Bukan soal nolak semua bantuan Bu, proyek lintas-lab memang harus nyambung antar-stasiun.', 'waspada', 'Bagas menggeleng pelan.') },
      ],
    },
    n6: {
      reply: mkLine('Kemarin malam aku sampai lembur merakit ulang dudukan sensor yang sebenarnya jatah divisi lain.', 'lelah', 'Bagas mengusap tengkuknya dengan ekspresi penat.'),
      choices: [
        { id: 'a', skillId: 'pertanyaan-terbuka', best: true, text: 'Apa yang membuatmu akhirnya memilih mengerjakan ulang sendiri daripada mendiskusikannya dengan divisi itu?', reaction: mkLine('Takut mereka tersinggung atau kelamaan, terus aku mikir kalau kupegang sendiri beres dalam dua jam.', 'cemas', 'Bagas menatap lantai sebentar.') },
        { id: 'b', skillId: 'jeda-hening', text: 'Saya menyimak, silakan lanjutkan cerita semalam.', reaction: mkLine('Hasilnya memang jadi rapi sih Bu, tapi pagi ini giliranku yang kehabisan bensin.', 'lelah', 'Bagas tersenyum tipis yang letih.') },
        { id: 'c', skillId: 'validasi-normalisasi', text: 'Mengambil alih karena ingin cepat beres itu jebakan yang sering dialami koordinator andal.', reaction: mkLine('Iya Bu, awalnya niat bantu sekali saja eh malah jadi kebiasaan.', 'netral', 'Bagas mengangguk jujur.') },
        { id: 'd', skillId: 'interogasi', text: 'Kenapa kamu tidak langsung menegur divisi itu karena kerjanya lamban?', reaction: mkLine('Mereka bukan malas Bu, mereka cuma belum biasa sama toleransi ukuran rangka.', 'waspada', 'Bagas menjawab dengan nada membela timnya.') },
      ],
    },
    n7: {
      reply: mkLine('Lama-lama aku takut kalau aku mulai bagi tugas, teman-teman mengira aku senior yang lepas tangan.', 'cemas', 'Bagas memutar-mutar tali goggles-nya dengan gelisah.'),
      choices: [
        { id: 'a', skillId: 'sampaikan-pengamatan', best: true, options: { observationTone: 'faktual' }, text: 'Saya perhatikan setiap kali bicara soal membagi tugas, ekspresimu langsung terlihat gelisah.', reaction: mkLine('Ketahuan banget ya Bu... aku memang masih canggung kalau harus mengandalkan orang lain.', 'tertegun', 'Bagas menghentikan tangannya dan menatap konselor.') },
        { id: 'b', skillId: 'pertanyaan-terbuka', text: 'Menurutmu apa bedanya “lepas tangan” dengan “mempercayakan peran” dalam tim?', reaction: mkLine('Kalau mempercayakan peran, aku tetap kasih ukuran standarnya dulu lalu biar mereka yang eksekusi.', 'netral', 'Bagas tampak mulai berpikir jernih.') },
        { id: 'c', skillId: 'parafrase-ringkasan', text: 'Jadi yang kamu jaga bukan cuma rangka robot, tapi juga citra sebagai senior yang selalu bisa diandalkan ya?', reaction: mkLine('Iya Bu, malu rasanya kalau sampai dibilang nggak sanggup.', 'menunduk', 'Bagas mengangguk pelan.') },
        { id: 'd', skillId: 'sampaikan-pengamatan', options: { observationTone: 'menilai' }, text: 'Kelihatannya kamu memang tipe yang susah percaya pada kemampuan orang lain.', reaction: mkLine('Bukan nggak percaya Bu, jadwalnya saja yang mepet terus!', 'kesal', 'Bahu Bagas langsung menegang.') },
      ],
    },
    n8: {
      reply: mkLine('Jujur aku capek banget harus selalu kelihatan kuat di depan semua stasiun, padahal kepalaku juga sering buntu.', 'menunduk', 'Bagas menundukkan kepala dan melepaskan tarikan napas berat.'),
      choices: [
        { id: 'a', skillId: 'refleksi-perasaan', best: true, options: { reflectionNuance: 'lelah-kewalahan' }, text: 'Kamu merasa lelah memikul ekspektasi serba bisa sendirian sementara sebenarnya kamu juga butuh rekan yang berbagi beban.', reaction: mkLine('Iya Bu... baru sekarang aku berani mengakuinya. Capek banget kalau semua pintu lari ke satu orang.', 'tertegun', 'Wajah Bagas tampak sangat lega bisa jujur.') },
        { id: 'b', skillId: 'validasi-normalisasi', text: 'Senior paling tangguh sekalipun tetap manusia yang punya batas tenaga, Bagas.', reaction: mkLine('Makasih Bu, diingatkan begitu rasanya beban di dadaku turun separuh.', 'lega', 'Bagas tersenyum tipis.') },
        { id: 'c', skillId: 'jeda-hening', text: 'Terima kasih sudah jujur tanpa harus memasang wajah kuat di sini.', reaction: mkLine('Lega banget rasanya, Bu.', 'lega', 'Bagas menghela napas panjang.') },
        { id: 'd', skillId: 'meremehkan', text: 'Baru proyek lab saja sudah capek, nanti di industri jauh lebih berat lho.', reaction: mkLine('Di industri kan kerjanya per divisi sesuai peran Bu, bukan satu orang pegang semua.', 'kesal', 'Bagas menatap lurus dengan raut kecewa.') },
      ],
    },
    n8alt: {
      reply: mkLine('Intinya jadwal lintas-lab ini memang terlalu padat buat ditangani satu orang terus-terusan.', 'lelah', 'Bagas menyandarkan sikunya di lutut.'),
      choices: [
        { id: 'a', skillId: 'pertanyaan-terbuka', best: true, text: 'Bagian mana yang paling menyita waktumu dan sebenarnya bisa dipegang rekan lain?', reaction: mkLine('Pengecekan cetak 3D dan kabel antarmuka sebenarnya Hendra dan Farhan jauh lebih lincah.', 'netral', 'Bagas mulai memetakan nama rekannya.') },
        { id: 'b', skillId: 'validasi-normalisasi', text: 'Menyadari batas kapasitas sendiri itu awal dari kerja tim yang sehat.', reaction: mkLine('Betul Bu, kalau aku tumbang malah proyeknya berhenti total.', 'netral', 'Bagas mengangguk.') },
        { id: 'c', skillId: 'jeda-hening', text: 'Kita pilah pelan-pelan mana yang benar-benar butuh tanganmu.', reaction: mkLine('Oke Bu, ayo kita lihat satu per satu.', 'netral', 'Bagas duduk lebih tegak.') },
        { id: 'd', skillId: 'nasihat-dini', text: 'Lepas saja tanggung jawab koordinatormu hari ini biar tidak pusing.', reaction: mkLine('Jangan dilepas total Bu, aku masih sangat peduli proyek ini selesai baik.', 'waspada', 'Bagas menggeleng cepat.') },
      ],
    },
    n9: {
      reply: mkLine('Kalau kupikir-pikir, waktu aku ajari Hendra menyetel toleransi baut minggu lalu, dia langsung jago dan cepat banget!', 'tersenyum', 'Senyum antusias kembali muncul di wajah Bagas.'),
      choices: [
        { id: 'a', skillId: 'afirmasi-kekuatan', best: true, text: 'Nah, itu bukti bahwa kamu bukan cuma jago merakit sendiri, tapi juga hebat menumbuhkan kemampuan timmu!', reaction: mkLine('Bener banget Bu! Justru kalau kuajari sekali terus kupercayakan, semua anak ikut berkembang!', 'tertegun', 'Mata Bagas berbinar penuh semangat.') },
        { id: 'b', skillId: 'pertanyaan-terbuka', text: 'Bagaimana perasaanmu melihat Hendra akhirnya bisa menangani toleransi baut tanpa kamu cek terus?', reaction: mkLine('Bangga dan lega banget Bu, rasaku seperti punya partner setara di bengkel!', 'tersenyum', 'Bagas tersenyum lebar.') },
        { id: 'c', skillId: 'parafrase-ringkasan', text: 'Jadi berbagi cara kerja justru membuat tim lebih mandiri sekaligus menjaga energimu ya?', reaction: mkLine('Tepat sekali Bu, dua-duanya untung!', 'tersenyum', 'Bagas mengangguk bersemangat.') },
        { id: 'd', skillId: 'pertanyaan-tertutup', text: 'Berarti teman-temanmu sebenarnya mampu kalau diberi kesempatan, kan?', reaction: mkLine('Mampu banget Bu, aku saja yang selama ini keburu panik mengambil alih.', 'tersenyum', 'Bagas nyengir jujur.') },
      ],
    },
    n10: {
      reply: mkLine('Yang kubutuhkan bukan mundur dari tim, tapi keberanian membagi peran dengan jelas supaya aku fokus di integrasi inti.', 'tertegun', 'Bagas menatap mantap dengan postur jauh lebih ringan.'),
      choices: [
        { id: 'a', skillId: 'refleksi-perasaan', best: true, options: { reflectionNuance: 'lelah-kewalahan' }, text: 'Kamu ingin tetap setia mengawal proyek robotika ini, tapi dengan kepemimpinan yang sehat dan saling menopang.', reaction: mkLine('Seratus persen tepat, Bu! Itu definisi koordinator yang selama ini kucari.', 'lega', 'Bagas menghela napas lega dengan senyum mantap.') },
        { id: 'b', skillId: 'parafrase-ringkasan', text: 'Jadi kuncinya adalah mempercayakan eksekusi tiap stasiun ke penanggung jawabnya sambil kamu menjaga jalur integrasi.', reaction: mkLine('Betul Bu, kalau begitu aku nggak perlu lari keliling lima ruangan tiap jam!', 'tersenyum', 'Bagas tertawa ringan.') },
        { id: 'c', skillId: 'validasi-normalisasi', text: 'Berani mendelegasikan bukan tanda melemah, justru tanda kamu percaya pada timmu.', reaction: mkLine('Kalimat itu bakal kupasang di kepalaku terus, Bu.', 'lega', 'Bagas mengangguk tegas.') },
        { id: 'd', skillId: 'refleksi-perasaan', toTension: true, options: { reflectionCorrectOverride: false }, text: 'Jadi selama ini kamu memborong kerjaan karena takut tersaingi oleh adik tingkat ya?', reaction: mkLine('Mana ada aku takut tersaingi Bu! Aku justru pengin tim angkatan kita menang bareng!', 'kesal', 'Bagas langsung mengerutkan kening dengan tersinggung.') },
      ],
    },
    n10alt: {
      reply: mkLine('Aku rasa kalau pembagian stasiunnya ditulis jelas, aku nggak akan dipanggil untuk urusan kecil terus.', 'netral', 'Bagas mengangguk mantap.'),
      choices: [
        { id: 'a', skillId: 'pertanyaan-terbuka', best: true, text: 'Stasiun mana saja yang paling siap kamu serahkan penuh ke penanggung jawabnya minggu ini?', reaction: mkLine('Cetak 3D ke Hendra dan Naufal, lalu antarmuka kontrol ke Farhan, Bu!', 'tersenyum', 'Bagas menyebutnya dengan yakin.') },
        { id: 'b', skillId: 'parafrase-ringkasan', text: 'Jadi kamu akan menyusun batas peran tertulis agar setiap stasiun bisa bergerak mandiri.', reaction: mkLine('Iya Bu, jelas dan enak buat semua orang.', 'tersenyum', 'Bagas tersenyum ringan.') },
        { id: 'c', skillId: 'validasi-normalisasi', text: 'Langkah menata pembagian peran itu sangat dewasa, Bagas.', reaction: mkLine('Makasih Bu, aku jadi jauh lebih tenang.', 'lega', 'Bagas mengangguk.') },
        { id: 'd', skillId: 'meremehkan', toTension: true, text: 'Kalau dari awal ditulis kan kamu tidak perlu capek sendiri seperti ini.', reaction: mkLine('Situasinya di lapangan berubah cepat Bu, tidak sesederhana menulis di kertas.', 'kesal', 'Bagas menyilangkan tangannya.') },
      ],
    },
    n11: {
      reply: mkLine('Sore ini aku mau ajak Hendra, Naufal, dan Farhan duduk 10 menit buat bagi titik periksa tiap stasiun.', 'tersenyum', 'Bagas meraih goggles-nya kembali dengan wajah penuh tenaga.'),
      choices: [
        { id: 'a', skillId: 'parafrase-ringkasan', best: true, text: 'Jadi kamu memilih diskusi singkat 10 menit untuk berbagi kendali, bukan lagi memikul semua stasiun sendirian?', reaction: mkLine('Siap Bu! Sekalian aku bisa kasih mereka kepercayaan penuh di bidang jagoan masing-masing.', 'tersenyum', 'Bagas tersenyum cerah.') },
        { id: 'b', skillId: 'afirmasi-kekuatan', text: 'Cara kamu mengajak mereka duduk setara itu contoh kepemimpinan kolaboratif yang keren.', reaction: mkLine('Makasih Bu, rasanya semangat proyekku balik penuh lagi!', 'lega', 'Bagas mengangguk mantap.') },
        { id: 'c', skillId: 'pertanyaan-terbuka', text: 'Apa yang mau kamu lakukan di waktu luang kecil yang berhasil kamu hemat nanti?', reaction: mkLine('Istirahat makan siang tenang di Ruang Istirahat tanpa lari-larian bawa rangka!', 'tersenyum', 'Bagas tertawa hangat.') },
        { id: 'd', skillId: 'nasihat-dini', text: 'Pastikan mereka menuruti semua jadwalmu tanpa alasan lagi ya.', reaction: mkLine('Kami atur bareng biar sama-sama nyaman saja, Bu.', 'netral', 'Bagas tersenyum sopan.') },
      ],
    },
    n12: {
      reply: mkLine('Pertama, aku kirim catatan ukuran dudukan 3D ke Hendra & Naufal, lalu koordinasi antarmuka bareng Farhan.', 'tersenyum', 'Bagas menuliskan tiga poin ringkas di ponselnya.'),
      choices: [
        { id: 'a', skillId: 'afirmasi-kekuatan', best: true, setFlags: ['langkah-kecil'], text: 'Pembagian ke Hendra, Naufal, dan Farhan itu konkret dan langsung memulihkan ritme kerjamu!', reaction: mkLine('Betul Bu, aku akhirnya bisa fokus penuh di integrasi inti robotikanya!', 'lega', 'Bagas tampak bersemangat sekali.') },
        { id: 'b', skillId: 'pertanyaan-terbuka', setFlags: ['langkah-kecil'], text: 'Bagaimana kamu akan membuka obrolan pembagian peran ini supaya mereka merasa dipercaya?', reaction: mkLine('Aku bilang langsung: aku butuh keahlian kalian pegang stasiun ini penuh biar integrasi kita makin mantap!', 'tersenyum', 'Bagas tersenyum yakin.') },
        { id: 'c', skillId: 'batas-kerahasiaan', text: 'Kalau suatu hari beban koordinasinya terasa penuh lagi, ruang ini tetap aman untuk berbagi.', reaction: mkLine('Siap Bu, makasih banget sudah jadi tempat istirahat yang aman.', 'lega', 'Bagas mengangguk tulus.') },
        { id: 'd', skillId: 'janji-mutlak', text: 'Saya jamin proyek robotikamu pasti langsung juara tanpa ada kendala lagi.', reaction: mkLine('Aamiin Bu, yang penting timnya sehat dan kompak dulu!', 'tersenyum', 'Bagas nyengir santai.') },
      ],
    },
    n13: {
      reply: mkLine('Serius Bu, jeda lima menit ngobrol di sini efeknya kayak ngecas baterai dari merah balik ke hijau penuh!', 'lega', 'Bagas berdiri tegak dan memasang goggles-nya kembali di dahi.'),
      choices: [
        { id: 'a', skillId: 'pertanyaan-terbuka', best: true, text: 'Apa satu pengingat utama yang mau kamu bawa kembali ke bengkel dan studio nanti?', reaction: mkLine('Koordinator hebat itu membesarkan timnya, bukan memborong semua baut sendirian!', 'tersenyum', 'Bagas tersenyum bangga.') },
        { id: 'b', skillId: 'validasi-normalisasi', text: 'Senang melihat energimu kembali segar dan pikiranmu jauh lebih lapang, Bagas.', reaction: mkLine('Makasih banyak Bu atas waktunya yang super menenangkan.', 'lega', 'Bagas mengangguk hangat.') },
        { id: 'c', skillId: 'jeda-hening', text: 'Nikmati dulu rasa ringan ini sebelum kembali ke Studio Desain ya.', reaction: mkLine('Siap Bu, habis ini aku minum air dulu baru ngobrol sama tim.', 'tersenyum', 'Bagas tersenyum ramah.') },
        { id: 'd', skillId: 'nasihat-dini', text: 'Ingat, jangan mengulangi kebiasaan lembur sendirian lagi ya.', reaction: mkLine('Iya Bu, aku jaga ritmeku mulai hari ini.', 'netral', 'Bagas mengangguk singkat.') },
      ],
    },
    n14: {
      reply: mkLine('Aku balik ke Studio Desain dulu ya Bu buat koordinasi pembagian peran bareng anak-anak. Makasih banyak!', 'tersenyum', 'Bagas melangkah ke pintu dengan senyum penuh percaya diri.'),
      choices: [
        { id: 'a', skillId: 'parafrase-ringkasan', best: true, text: 'Hari ini kamu memilih berbagi peran lintas stasiun sambil menjaga energimu tetap utuh. Semangat integrasinya, Bagas!', reaction: mkLine('Siap Bu, terima kasih banyak!', 'lega', 'Bagas mengangkat jempol dengan senyum cerah.') },
        { id: 'b', skillId: 'afirmasi-kekuatan', text: 'Tim robotika beruntung punya koordinator yang peduli dan mau terus belajar sepertimu!', reaction: mkLine('Makasih Bu, sampai ketemu di lab!', 'lega', 'Bagas tersenyum lebar.') },
        { id: 'c', skillId: 'validasi-normalisasi', text: 'Terima kasih sudah berbagi jujur hari ini, jaga selalu waktu istirahatmu ya.', reaction: mkLine('Pasti Bu, permisi ya!', 'tersenyum', 'Bagas mengangguk sopan.') },
        { id: 'd', skillId: 'nasihat-dini', text: 'Cepat kumpulkan timmu sekarang sebelum jadwal sore penuh.', reaction: mkLine('Baik Bu, aku permisi dulu.', 'netral', 'Bagas melangkah keluar cepat.') },
      ],
    },
  },
  tension: {
    awalReply: mkLine('Aku sama sekali nggak takut tersaingi adik tingkat, Bu! Rasanya nggak enak banget dituduh begitu.', 'menutup-diri', 'Bagas melipat lengan dengan tatapan tegas namun kecewa.'),
    perbaikanReply: mkLine('Oke Bu... kalimat barusan memang sempat bikin aku merasa niat baikku disalahpahami.', 'waspada', 'Bagas menurunkan bahunya sedikit dan kembali menyimak.'),
  },
  endings: {
    terbantu: mkLine('Makasih banyak Bu! Aku siap bagi peran lintas stasiun bareng tim dan jaga energiku buat integrasi inti!', 'lega', 'Bagas keluar Ruang Konsultasi dengan langkah ringan dan wajah cerah.'),
    kemajuan: mkLine('Makasih ya Bu, aku coba atur ulang pembagian tugasku bareng anak-anak nanti.', 'netral', 'Bagas mengangguk sopan sebelum keluar.'),
    menarik: mkLine('Permisi Bu, aku mau lanjut bereskan rangkanya sendiri dulu.', 'menutup-diri', 'Bagas melangkah keluar dengan wajah lelah.'),
  },
});
