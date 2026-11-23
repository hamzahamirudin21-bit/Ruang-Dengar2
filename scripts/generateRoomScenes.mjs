/**
 * Generator latar ruangan 1280x720 bergaya ilustrasi anime kampus hand-inked (SVG HD tajam 0% blur).
 * Menghasilkan 6 ruangan unik × 2 waktu (pagi & sore) di `public/assets/scenes/`:
 * - elektronik-{pagi|sore}.svg  (Lab Elektronika & IoT: osiloskop, solder, breadboard, laci SMD, skematik)
 * - pemrograman-{pagi|sore}.svg (Lab Pemrograman & MCU: rak server, triple monitor kode, papan algoritma)
 * - las-{pagi|sore}.svg         (Bengkel Pengelasan K3: bilik las tirai oranye, tabung gas, topeng las, APAR, garis K3)
 * - diskusi-{pagi|sore}.svg     (Area Meja Diskusi: papan sticky notes, meja kayu besar, laptop, sketsa tim)
 * - istirahat-{pagi|sore}.svg   (Sudut Istirahat: mesin minuman, sofa empuk, konter kopi, jam, tanaman)
 * - gudang-{pagi|sore}.svg      (Gudang Alat & Kalibrasi: rak besi bertingkat, boks instrumen, tangga, troli)
 */
import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.resolve(process.cwd(), 'public', 'assets', 'scenes');
fs.mkdirSync(OUT_DIR, { recursive: true });

const INK = '#3e2517';

function skyColors(v) {
  return v === 'sore'
    ? { top: '#f08b55', mid: '#f9c784', bot: '#fff1cc', bldg: '#b57b6c', leaf1: '#6c844a', leaf2: '#989f54', beam: 'rgba(255,205,120,0.18)', tint: 'rgba(245,138,58,0.12)' }
    : { top: '#6bb9ef', mid: '#b7e2fb', bot: '#eef8ff', bldg: '#8aa7c7', leaf1: '#4c8e5c', leaf2: '#70b376', beam: 'rgba(255,250,224,0.16)', tint: 'rgba(255,244,210,0.03)' };
}

function windowBlock(x, y, w, h, v, frameColor = '#8a5d3b', sillColor = '#b48358', withCurtains = false) {
  const s = skyColors(v);
  const clipId = `win-${x}-${y}`;
  return `
  <defs>
    <clipPath id="${clipId}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8"/></clipPath>
    <linearGradient id="sky-${clipId}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${s.top}"/><stop offset="55%" stop-color="${s.mid}"/><stop offset="100%" stop-color="${s.bot}"/>
    </linearGradient>
  </defs>
  <g clip-path="url(#${clipId})">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#sky-${clipId})"/>
    <!-- Awan lembut -->
    <ellipse cx="${x + w * 0.28}" cy="${y + h * 0.24}" rx="56" ry="18" fill="#ffffff" opacity="0.65"/>
    <ellipse cx="${x + w * 0.72}" cy="${y + h * 0.19}" rx="48" ry="15" fill="#ffffff" opacity="0.55"/>
    <!-- Gedung kampus di luar -->
    <rect x="${x + w * 0.06}" y="${y + h * 0.44}" width="${w * 0.28}" height="${h * 0.56}" fill="${s.bldg}" opacity="0.6"/>
    <rect x="${x + w * 0.58}" y="${y + h * 0.34}" width="${w * 0.34}" height="${h * 0.66}" fill="${s.bldg}" opacity="0.5"/>
    <!-- Jendela gedung kampus -->
    ${[0, 1, 2].map((r) => [0, 1, 2].map((c) => `<rect x="${x + w * 0.1 + c * 28}" y="${y + h * 0.52 + r * 26}" width="16" height="14" rx="2" fill="#fff7dc" opacity="0.65"/>`).join('')).join('')}
    ${[0, 1, 2].map((r) => [0, 1, 2].map((c) => `<rect x="${x + w * 0.63 + c * 32}" y="${y + h * 0.42 + r * 28}" width="18" height="15" rx="2" fill="#fff7dc" opacity="0.6"/>`).join('')).join('')}
    <!-- Tajuk pepohonan kampus -->
    <circle cx="${x + w * 0.14}" cy="${y + h * 0.92}" r="66" fill="${s.leaf1}"/>
    <circle cx="${x + w * 0.34}" cy="${y + h * 0.98}" r="58" fill="${s.leaf2}"/>
    <circle cx="${x + w * 0.62}" cy="${y + h * 0.96}" r="62" fill="${s.leaf1}"/>
    <circle cx="${x + w * 0.88}" cy="${y + h * 0.88}" r="72" fill="${s.leaf2}"/>
    <!-- Kusen kaca -->
    <line x1="${x + w / 3}" y1="${y}" x2="${x + w / 3}" y2="${y + h}" stroke="${frameColor}" stroke-width="8"/>
    <line x1="${x + (w * 2) / 3}" y1="${y}" x2="${x + (w * 2) / 3}" y2="${y + h}" stroke="${frameColor}" stroke-width="8"/>
    <line x1="${x}" y1="${y + h * 0.62}" x2="${x + w}" y2="${y + h * 0.62}" stroke="${frameColor}" stroke-width="8"/>
    ${withCurtains ? `
      <path d="M${x} ${y} H${x + 48} Q${x + 34} ${y + h * 0.5} ${x + 54} ${y + h} H${x} Z" fill="#f5e6cc" stroke="${INK}" stroke-width="2.5"/>
      <path d="M${x + w} ${y} H${x + w - 48} Q${x + w - 34} ${y + h * 0.5} ${x + w - 54} ${y + h} H${x + w} Z" fill="#f5e6cc" stroke="${INK}" stroke-width="2.5"/>
    ` : ''}
  </g>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="none" stroke="${frameColor}" stroke-width="10"/>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="none" stroke="${INK}" stroke-width="3"/>
  <rect x="${x - 14}" y="${y + h - 2}" width="${w + 28}" height="16" rx="5" fill="${sillColor}" stroke="${INK}" stroke-width="3"/>`;
}

function escapeXml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function signPlaque(x, y, w, h, title, bg = '#275b56', textCol = '#fff8dc', accent = '#f2c357') {
  return `
  <g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${bg}" stroke="${INK}" stroke-width="3.5"/>
    <rect x="${x + 6}" y="${y + 6}" width="${w - 12}" height="${h - 12}" rx="6" fill="none" stroke="${accent}" stroke-width="2" stroke-dasharray="6 4"/>
    <text x="${x + w / 2}" y="${y + h / 2 + 7}" text-anchor="middle" font-family="Fredoka, 'Segoe UI', sans-serif" font-size="21" font-weight="700" fill="${textCol}" letter-spacing="1.2">${escapeXml(title)}</text>
  </g>`;
}

function pottedPlant(cx, bottomY, scale = 1) {
  return `
  <g transform="translate(${cx},${bottomY}) scale(${scale})">
    <ellipse cx="0" cy="4" rx="34" ry="8" fill="rgba(62,37,23,0.22)"/>
    <path d="M-8 -58 C-42 -84 -54 -128 -22 -140 C-2 -146 6 -112 -2 -62 Z" fill="#3f8256" stroke="${INK}" stroke-width="3"/>
    <path d="M8 -58 C46 -84 56 -124 26 -138 C6 -146 -4 -110 2 -62 Z" fill="#4f9965" stroke="${INK}" stroke-width="3"/>
    <path d="M0 -62 C-18 -114 -16 -160 4 -168 C24 -160 22 -114 4 -62 Z" fill="#5fb074" stroke="${INK}" stroke-width="3"/>
    <path d="M-12 -52 C-52 -66 -66 -94 -44 -108 C-26 -118 -14 -88 -8 -54 Z" fill="#37734c" stroke="${INK}" stroke-width="3"/>
    <path d="M12 -52 C52 -66 66 -94 44 -108 C26 -118 14 -88 8 -54 Z" fill="#468a5c" stroke="${INK}" stroke-width="3"/>
    <path d="M-30 -58 L30 -58 L22 0 L-22 0 Z" fill="#d98758" stroke="${INK}" stroke-width="3.2"/>
    <rect x="-35" y="-68" width="70" height="14" rx="5" fill="#e69a6a" stroke="${INK}" stroke-width="3.2"/>
  </g>`;
}

function sunbeams(v) {
  const s = skyColors(v);
  return `
  <g pointer-events="none">
    <polygon points="340,0 500,0 240,720 80,720" fill="${s.beam}"/>
    <polygon points="620,0 780,0 520,720 360,720" fill="${s.beam}"/>
    <rect x="0" y="0" width="1280" height="720" fill="${s.tint}"/>
  </g>`;
}

function wrapSvg(body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720" shape-rendering="geometricPrecision">${body}</svg>`;
}

/* ============================================================================
 * 1. LAB ELEKTRONIKA & IoT
 * ============================================================================ */
function buildElektronik(v) {
  const wallTop = v === 'sore' ? '#e7e2d4' : '#e4eef4';
  const wallBot = v === 'sore' ? '#d4cbb8' : '#cadbe6';
  const floor = v === 'sore' ? '#b8b2a6' : '#aebcc7';
  const drawerColors = ['#d9534f', '#f0ad4e', '#4b8ac7', '#3f9c7e'];
  let drawers = '';
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 4; c++) {
      const dx = 48 + c * 52;
      const dy = 152 + r * 38;
      const col = drawerColors[(r + c) % drawerColors.length];
      drawers += `<rect x="${dx}" y="${dy}" width="46" height="32" rx="4" fill="${col}" stroke="${INK}" stroke-width="2.2"/>
                  <rect x="${dx + 12}" y="${dy + 7}" width="22" height="8" rx="2" fill="#fffdf6"/>
                  <line x1="${dx + 16}" y1="${dy + 23}" x2="${dx + 30}" y2="${dy + 23}" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
    }
  }
  return wrapSvg(`
  <defs>
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${wallTop}"/><stop offset="100%" stop-color="${wallBot}"/></linearGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${floor}"/><stop offset="100%" stop-color="#8b99a5"/></linearGradient>
  </defs>
  <rect width="1280" height="495" fill="url(#wall)"/>
  <rect y="495" width="1280" height="225" fill="url(#floor)"/>
  <!-- Plafon & lampu LED lab -->
  <rect width="1280" height="32" fill="#b7c6d2" stroke="${INK}" stroke-width="3"/>
  ${[180, 560, 940].map((lx) => `<rect x="${lx}" y="12" width="160" height="16" rx="6" fill="#fffdf2" stroke="${INK}" stroke-width="2.5"/>`).join('')}
  <!-- Garis ubin lantai perspektif -->
  <line x1="0" y1="495" x2="1280" y2="495" stroke="${INK}" stroke-width="4"/>
  ${[540, 595, 658].map((fy) => `<line x1="0" y1="${fy}" x2="1280" y2="${fy}" stroke="#5f6f7c" stroke-width="2" opacity="0.45"/>`).join('')}
  ${Array.from({ length: 11 }, (_, i) => `<line x1="${640 + (i - 5) * 115}" y1="495" x2="${640 + (i - 5) * 185}" y2="720" stroke="#5f6f7c" stroke-width="2" opacity="0.4"/>`).join('')}

  <!-- Jendela kampus tengah -->
  ${windowBlock(340, 128, 490, 260, v, '#5a6f82', '#95a8b8')}
  ${signPlaque(395, 52, 380, 52, 'LAB ELEKTRONIKA & IoT', '#1c5368', '#fff8e2', '#64d8e8')}

  <!-- Kabinet Laci Komponen SMD kiri -->
  <rect x="34" y="136" width="234" height="256" rx="10" fill="#46596b" stroke="${INK}" stroke-width="3.5"/>
  ${drawers}

  <!-- Poster Skematik Rangkaian & Mikrokontroler kanan -->
  <g transform="translate(886,120)">
    <rect width="346" height="228" rx="10" fill="#173a4c" stroke="${INK}" stroke-width="4"/>
    <rect x="12" y="12" width="322" height="204" rx="6" fill="none" stroke="#5cd6f0" stroke-width="1.8" stroke-dasharray="6 4"/>
    <text x="173" y="38" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="16" font-weight="700" fill="#8be8ff">SKEMATIK SENSOR IoT · MCU</text>
    <!-- Garis skematik menyala -->
    <path d="M40 90 H110 L120 74 L132 106 L144 74 L156 106 L166 90 H218 V152 H292" fill="none" stroke="#66e8ff" stroke-width="3"/>
    <rect x="200" y="64" width="66" height="54" rx="6" fill="#1f5870" stroke="#78f0c8" stroke-width="3"/>
    <text x="233" y="96" text-anchor="middle" font-family="monospace" font-size="14" font-weight="700" fill="#c7fff0">ESP32</text>
    <circle cx="88" cy="158" r="22" fill="none" stroke="#ffe17d" stroke-width="3"/>
    <path d="M74 158 Q88 138 102 158 Q116 178 130 158" fill="none" stroke="#78f0c8" stroke-width="3"/>
    <circle cx="292" cy="152" r="7" fill="#ff746c"/>
    <circle cx="40" cy="90" r="6" fill="#ffe17d"/>
  </g>
  <!-- Rak gantung kabel jumper warna-warni -->
  <g transform="translate(910,368)">
    <rect width="300" height="14" rx="5" fill="#70543e" stroke="${INK}" stroke-width="3"/>
    ${['#e5534b', '#f2ae30', '#38a87b', '#3a88c8', '#9b6bc7', '#f07c41', '#4bc5c5'].map((c, idx) =>
      `<path d="M${28 + idx * 40} 12 Q${22 + idx * 40} 62 ${30 + idx * 40} 102" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"/>`
    ).join('')}
  </g>

  <!-- Meja Praktikum Elektronika Panjang dengan Alas Anti-Statis (ESD) Hijau -->
  <g>
    <rect x="64" y="466" width="1152" height="32" rx="6" fill="#d9c6a3" stroke="${INK}" stroke-width="3.5"/>
    <rect x="92" y="458" width="1096" height="16" rx="4" fill="#2d7a64" stroke="${INK}" stroke-width="3"/>
    <rect x="98" y="498" width="26" height="142" fill="#4f5f6d" stroke="${INK}" stroke-width="3.5"/>
    <rect x="1156" y="498" width="26" height="142" fill="#4f5f6d" stroke="${INK}" stroke-width="3.5"/>
    <rect x="124" y="518" width="1032" height="14" fill="#647787" stroke="${INK}" stroke-width="2.5"/>

    <!-- Osiloskop Dual-Channel Kiri -->
    <g transform="translate(154,352)">
      <rect width="208" height="114" rx="10" fill="#e8e4d8" stroke="${INK}" stroke-width="3.5"/>
      <rect x="14" y="14" width="126" height="84" rx="6" fill="#0d2b2e" stroke="${INK}" stroke-width="3"/>
      <!-- Grid & gelombang sinus menyala -->
      <line x1="14" y1="56" x2="140" y2="56" stroke="#1f5e5a" stroke-width="1.5"/>
      <line x1="77" y1="14" x2="77" y2="98" stroke="#1f5e5a" stroke-width="1.5"/>
      <path d="M18 58 Q36 22 54 58 T90 58 T126 58 L136 46" fill="none" stroke="#4ff5b4" stroke-width="3.5"/>
      <path d="M18 70 Q42 46 66 70 T114 70 T136 62" fill="none" stroke="#ffe169" stroke-width="2.5" opacity="0.9"/>
      <!-- Kenop putar -->
      <circle cx="164" cy="34" r="10" fill="#596c7d" stroke="${INK}" stroke-width="2.5"/>
      <circle cx="190" cy="34" r="8" fill="#596c7d" stroke="${INK}" stroke-width="2.5"/>
      <circle cx="164" cy="64" r="10" fill="#d98b34" stroke="${INK}" stroke-width="2.5"/>
      <circle cx="190" cy="64" r="8" fill="#3aa08e" stroke="${INK}" stroke-width="2.5"/>
      <rect x="152" y="84" width="44" height="12" rx="3" fill="#3a4a58"/>
    </g>

    <!-- Breadboard + PCB Hijau + LED + Kabel Jumper di Tengah -->
    <g transform="translate(420,418)">
      <rect width="160" height="44" rx="5" fill="#fffdf6" stroke="${INK}" stroke-width="3"/>
      <line x1="10" y1="10" x2="150" y2="10" stroke="#e05248" stroke-width="2.2"/>
      <line x1="10" y1="34" x2="150" y2="34" stroke="#3a88c8" stroke-width="2.2"/>
      <rect x="52" y="14" width="32" height="16" rx="2" fill="#2e3640"/>
      <circle cx="30" cy="20" r="6" fill="#ff5a52" stroke="${INK}" stroke-width="2"/>
      <circle cx="108" cy="20" r="6" fill="#46e38f" stroke="${INK}" stroke-width="2"/>
      <circle cx="128" cy="20" r="6" fill="#4ecbff" stroke="${INK}" stroke-width="2"/>
      <path d="M30 16 Q50 -8 70 16" fill="none" stroke="#f5b83d" stroke-width="3"/>
      <path d="M84 16 Q100 -4 108 16" fill="none" stroke="#e5534b" stroke-width="3"/>
    </g>

    <!-- Stasiun Solder + Pena Solder Berpijar + Gulungan Timah -->
    <g transform="translate(650,382)">
      <rect width="96" height="82" rx="8" fill="#4978a6" stroke="${INK}" stroke-width="3.5"/>
      <rect x="14" y="14" width="68" height="26" rx="4" fill="#182b3a" stroke="${INK}" stroke-width="2.2"/>
      <text x="48" y="33" text-anchor="middle" font-family="monospace" font-size="17" font-weight="700" fill="#ff7648">350°C</text>
      <circle cx="48" cy="60" r="12" fill="#f2c357" stroke="${INK}" stroke-width="2.5"/>
      <!-- Dudukan & besi solder -->
      <path d="M118 80 L158 32 L166 38 L128 84 Z" fill="#3a4552" stroke="${INK}" stroke-width="2.8"/>
      <circle cx="164" cy="32" r="7" fill="#ff9e3d" opacity="0.85"/>
    </g>

    <!-- Multimeter Kuning Digital Kanan -->
    <g transform="translate(888,370)">
      <rect width="84" height="94" rx="10" fill="#f4be3b" stroke="${INK}" stroke-width="3.5"/>
      <rect x="12" y="12" width="60" height="30" rx="4" fill="#c7deb4" stroke="${INK}" stroke-width="2.5"/>
      <text x="42" y="33" text-anchor="middle" font-family="monospace" font-size="16" font-weight="700" fill="#223626">5.02V</text>
      <circle cx="42" cy="66" r="17" fill="#343d48" stroke="${INK}" stroke-width="2.5"/>
      <line x1="42" y1="66" x2="54" y2="56" stroke="#fffdf6" stroke-width="3.5" stroke-linecap="round"/>
    </g>

    <!-- Lampu Meja Praktikum -->
    <path d="M1070 462 L1096 364 L1030 330" fill="none" stroke="#3c4957" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M1006 322 L1056 312 L1068 344 L1002 350 Z" fill="#e56256" stroke="${INK}" stroke-width="3"/>
    <polygon points="1004,350 1066,344 1098,460 950,460" fill="rgba(255,240,180,0.22)"/>
  </g>
  ${pottedPlant(1218, 636, 0.85)}
  ${sunbeams(v)}`);
}

/* ============================================================================
 * 2. LAB PEMROGRAMAN & MCU
 * ============================================================================ */
function buildPemrograman(v) {
  const wallTop = v === 'sore' ? '#3f3557' : '#2d3254';
  const wallBot = v === 'sore' ? '#2c2440' : '#1e2440';
  const accent = v === 'sore' ? '#f6a868' : '#7aa2f7';
  const serverLeds = (sx) =>
    Array.from({ length: 8 }, (_, r) => `
      <rect x="${sx + 14}" y="${156 + r * 38}" width="112" height="28" rx="4" fill="#232a42" stroke="${INK}" stroke-width="2"/>
      <circle cx="${sx + 28}" cy="${170 + r * 38}" r="4" fill="${r % 2 === 0 ? '#4ff5b4' : '#6cc8ff'}"/>
      <circle cx="${sx + 42}" cy="${170 + r * 38}" r="4" fill="${r % 3 === 0 ? '#ffe169' : '#4ff5b4'}"/>
      <line x1="${sx + 60}" y1="${170 + r * 38}" x2="${sx + 114}" y2="${170 + r * 38}" stroke="#4e5c82" stroke-width="3"/>
    `).join('');

  const codeScreen = (mx, my, mw, mh, tintCol) => `
    <g transform="translate(${mx},${my})">
      <rect width="${mw}" height="${mh}" rx="10" fill="#1b2036" stroke="${INK}" stroke-width="4"/>
      <rect x="10" y="10" width="${mw - 20}" height="${mh - 24}" rx="5" fill="#0f1528"/>
      <rect x="10" y="10" width="${mw - 20}" height="16" rx="4" fill="#1e2745"/>
      <circle cx="22" cy="18" r="3.5" fill="#ff6b6b"/><circle cx="34" cy="18" r="3.5" fill="#ffd966"/><circle cx="46" cy="18" r="3.5" fill="#5bf0a4"/>
      ${[0, 1, 2, 3, 4, 5].map((ln) => `
        <rect x="${20 + (ln % 3) * 14}" y="${36 + ln * 16}" width="${44 + ((ln * 29) % 58)}" height="7" rx="3" fill="${ln % 2 === 0 ? tintCol : '#73e8b5'}" opacity="0.9"/>
        <rect x="${76 + (ln % 3) * 14 + ((ln * 29) % 58)}" y="${36 + ln * 16}" width="${26 + (ln % 2) * 22}" height="7" rx="3" fill="#ffd875" opacity="0.8"/>
      `).join('')}
      <rect x="${mw / 2 - 14}" y="${mh}" width="28" height="22" fill="#323b57" stroke="${INK}" stroke-width="3"/>
      <rect x="${mw / 2 - 42}" y="${mh + 18}" width="84" height="10" rx="4" fill="#465173" stroke="${INK}" stroke-width="3"/>
    </g>`;

  return wrapSvg(`
  <defs>
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${wallTop}"/><stop offset="100%" stop-color="${wallBot}"/></linearGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#3a3959"/><stop offset="100%" stop-color="#25243d"/></linearGradient>
  </defs>
  <rect width="1280" height="500" fill="url(#wall)"/>
  <rect y="500" width="1280" height="220" fill="url(#floor)"/>
  <!-- Strip lampu LED neon studio coding -->
  <rect x="40" y="28" width="1200" height="8" rx="4" fill="${accent}" opacity="0.85"/>
  <!-- Panel dinding akustik geometris -->
  ${Array.from({ length: 10 }, (_, i) => `<rect x="${42 + i * 122}" y="54" width="106" height="440" rx="8" fill="rgba(255,255,255,0.035)"/>`).join('')}
  <line x1="0" y1="500" x2="1280" y2="500" stroke="${INK}" stroke-width="4"/>

  <!-- Papan Nama Studio Coding -->
  ${signPlaque(410, 48, 420, 52, 'LAB PEMROGRAMAN & MCU', '#1a2342', '#e8f6ff', '#65e5b8')}

  <!-- Rak Server Kiri -->
  <rect x="42" y="136" width="140" height="340" rx="10" fill="#171d30" stroke="${INK}" stroke-width="4"/>
  ${serverLeds(42)}

  <!-- Jendela Kampus Tengah -->
  ${windowBlock(236, 126, 390, 224, v, '#3f4b6e', '#637199')}

  <!-- Papan Tulis Flowchart & Git Branch Kanan -->
  <g transform="translate(684,126)">
    <rect width="540" height="224" rx="12" fill="#f8fafc" stroke="#4f5f7a" stroke-width="8"/>
    <rect width="540" height="224" rx="12" fill="none" stroke="${INK}" stroke-width="3"/>
    <text x="28" y="38" font-family="Fredoka, sans-serif" font-size="18" font-weight="700" fill="#2d3a5c">ALUR FIRMWARE &amp; TELEMETRI</text>
    <rect x="34" y="64" width="110" height="44" rx="8" fill="#dbeafe" stroke="#2563eb" stroke-width="3"/>
    <text x="89" y="91" text-anchor="middle" font-family="monospace" font-size="14" font-weight="700" fill="#1e3a8a">sensor()</text>
    <line x1="144" y1="86" x2="196" y2="86" stroke="#3e2517" stroke-width="3"/>
    <rect x="196" y="64" width="122" height="44" rx="8" fill="#d1fae5" stroke="#059669" stroke-width="3"/>
    <text x="257" y="91" text-anchor="middle" font-family="monospace" font-size="14" font-weight="700" fill="#065f46">filter()</text>
    <line x1="318" y1="86" x2="370" y2="86" stroke="#3e2517" stroke-width="3"/>
    <rect x="370" y="64" width="134" height="44" rx="8" fill="#fef3c7" stroke="#d97706" stroke-width="3"/>
    <text x="437" y="91" text-anchor="middle" font-family="monospace" font-size="14" font-weight="700" fill="#92400e">sendMQTT()</text>
    <!-- Garis cabang Git -->
    <line x1="56" y1="168" x2="480" y2="168" stroke="#6366f1" stroke-width="4"/>
    <path d="M130 168 Q170 132 230 132 H340 Q380 132 410 168" fill="none" stroke="#ec4899" stroke-width="4"/>
    ${[90, 210, 320, 440].map((gx) => `<circle cx="${gx}" cy="168" r="8" fill="#fffdf6" stroke="#6366f1" stroke-width="4"/>`).join('')}
    <circle cx="284" cy="132" r="8" fill="#fffdf6" stroke="#ec4899" stroke-width="4"/>
  </g>

  <!-- Meja Kerja Panjang Coding + 3 Monitor -->
  <rect x="86" y="470" width="1108" height="30" rx="8" fill="#6f4f3b" stroke="${INK}" stroke-width="4"/>
  <rect x="118" y="500" width="26" height="150" fill="#2c334a" stroke="${INK}" stroke-width="3.5"/>
  <rect x="1136" y="500" width="26" height="150" fill="#2c334a" stroke="${INK}" stroke-width="3.5"/>

  ${codeScreen(160, 304, 240, 146, '#7aa2f7')}
  ${codeScreen(436, 286, 274, 164, '#c084fc')}
  ${codeScreen(744, 304, 240, 146, '#4ff5b4')}

  <!-- Keyboard mekanikal + Mug kopi + Headphone -->
  <rect x="466" y="454" width="212" height="18" rx="5" fill="#1e2438" stroke="${INK}" stroke-width="2.5"/>
  <line x1="478" y1="463" x2="664" y2="463" stroke="#a78bfa" stroke-width="4" stroke-dasharray="10 6"/>
  <!-- Mug kopi mengepul -->
  <g transform="translate(1038,418)">
    <rect width="38" height="48" rx="8" fill="#fffdf5" stroke="${INK}" stroke-width="3"/>
    <path d="M38 12 C52 12 52 34 38 34" fill="none" stroke="${INK}" stroke-width="4"/>
    <path d="M12 -6 Q16 -18 12 -28 M26 -8 Q30 -20 26 -30" fill="none" stroke="#fff7dc" stroke-width="3" stroke-linecap="round" opacity="0.7"/>
  </g>
  <!-- Headphone di stand -->
  <g transform="translate(1110,398)">
    <path d="M16 44 C16 8 64 8 64 44" fill="none" stroke="#e5534b" stroke-width="7"/>
    <rect x="8" y="38" width="16" height="28" rx="6" fill="#283044" stroke="${INK}" stroke-width="3"/>
    <rect x="56" y="38" width="16" height="28" rx="6" fill="#283044" stroke="${INK}" stroke-width="3"/>
  </g>
  ${sunbeams(v)}`);
}

/* ============================================================================
 * 3. BENGKEL PENGELASAN · AREA K3
 * ============================================================================ */
function buildLas(v) {
  const wallTop = v === 'sore' ? '#9c9288' : '#96a1ab';
  const wallBot = v === 'sore' ? '#7a726a' : '#737e88';
  let bricks = '';
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 18; c++) {
      const bx = c * 74 + (r % 2 ? 36 : 0) - 20;
      const by = 40 + r * 36;
      bricks += `<rect x="${bx}" y="${by}" width="68" height="30" rx="2" fill="rgba(255,255,255,0.06)" stroke="rgba(40,32,28,0.16)" stroke-width="2"/>`;
    }
  }
  const hazardStripes = Array.from({ length: 24 }, (_, i) =>
    `<polygon points="${i * 60 - 20},664 ${i * 60 + 12},664 ${i * 60 - 10},696 ${i * 60 - 42},696" fill="${i % 2 === 0 ? '#f4be32' : '#25282c'}"/>`
  ).join('');

  return wrapSvg(`
  <defs>
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${wallTop}"/><stop offset="100%" stop-color="${wallBot}"/></linearGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#7c8085"/><stop offset="100%" stop-color="#565a60"/></linearGradient>
    <radialGradient id="weldGlow" cx="50%" cy="55%" r="50%">
      <stop offset="0%" stop-color="#fff4b0" stop-opacity="0.9"/><stop offset="45%" stop-color="#ff9933" stop-opacity="0.45"/><stop offset="100%" stop-color="#ff6600" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1280" height="495" fill="url(#wall)"/>
  ${bricks}
  <rect y="495" width="1280" height="225" fill="url(#floor)"/>
  <line x1="0" y1="495" x2="1280" y2="495" stroke="${INK}" stroke-width="4.5"/>
  <!-- Garis Keselamatan K3 Kuning-Hitam -->
  <rect x="0" y="662" width="1280" height="36" fill="#25282c" stroke="${INK}" stroke-width="3"/>
  ${hazardStripes}

  <!-- Papan Nama Bengkel Las K3 -->
  ${signPlaque(390, 44, 480, 56, 'BENGKEL PENGELASAN · AREA K3', '#d97b1e', '#fffdf6', '#25282c')}

  <!-- Tabung Gas Oksigen (Biru) & Argon/Asetilen (Merah) di Kiri -->
  <g transform="translate(70,224)">
    <rect x="0" y="34" width="66" height="260" rx="28" fill="#2d74b8" stroke="${INK}" stroke-width="4"/>
    <rect x="20" y="8" width="26" height="30" rx="5" fill="#4f5b66" stroke="${INK}" stroke-width="3"/>
    <circle cx="33" cy="6" r="10" fill="#e5534b" stroke="${INK}" stroke-width="3"/>
    <rect x="86" y="54" width="62" height="240" rx="26" fill="#c9463c" stroke="${INK}" stroke-width="4"/>
    <rect x="104" y="28" width="26" height="30" rx="5" fill="#4f5b66" stroke="${INK}" stroke-width="3"/>
    <circle cx="117" cy="26" r="10" fill="#f4be32" stroke="${INK}" stroke-width="3"/>
    <!-- Rantai pengaman K3 -->
    <line x1="-10" y1="145" x2="160" y2="145" stroke="#25282c" stroke-width="6" stroke-dasharray="10 5"/>
    <line x1="-10" y1="225" x2="160" y2="225" stroke="#25282c" stroke-width="6" stroke-dasharray="10 5"/>
  </g>

  <!-- Bilik Las Utama dengan Tirai Keselamatan Oranye Transparan & Pijar Hangat -->
  <g transform="translate(278,128)">
    <rect width="600" height="366" rx="10" fill="#3a4048" stroke="${INK}" stroke-width="5"/>
    <!-- Cahaya pijar las lembut -->
    <circle cx="300" cy="220" r="190" fill="url(#weldGlow)"/>
    <!-- Meja baja & rangka logam di dalam bilik -->
    <rect x="70" y="256" width="460" height="26" rx="4" fill="#5e6873" stroke="${INK}" stroke-width="3.5"/>
    <rect x="100" y="282" width="22" height="84" fill="#454d56" stroke="${INK}" stroke-width="3"/>
    <rect x="478" y="282" width="22" height="84" fill="#454d56" stroke="${INK}" stroke-width="3"/>
    <!-- Rangka besi las + percikan -->
    <path d="M180 256 L240 180 H360 L420 256" fill="none" stroke="#9fb0be" stroke-width="14" stroke-linejoin="round"/>
    <path d="M180 256 L240 180 H360 L420 256" fill="none" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="300" cy="180" r="12" fill="#fff8c4"/>
    ${[[-36,-22],[42,-28],[-52,18],[48,20],[-18,-44],[26,-40]].map(([dx,dy]) =>
      `<line x1="300" y1="180" x2="${300+dx}" y2="${180+dy}" stroke="#ffe07a" stroke-width="3" stroke-linecap="round"/>`
    ).join('')}
    <!-- Tirai K3 Oranye Transparan kiri & kanan -->
    <rect x="14" y="16" width="136" height="338" rx="4" fill="#ea7328" opacity="0.72" stroke="${INK}" stroke-width="3"/>
    <rect x="450" y="16" width="136" height="338" rx="4" fill="#ea7328" opacity="0.72" stroke="${INK}" stroke-width="3"/>
    <line x1="8" y1="16" x2="592" y2="16" stroke="#c8d0d8" stroke-width="8"/>
  </g>

  <!-- Papan APD & Helm Las + APAR Merah di Kanan -->
  <g transform="translate(930,136)">
    <!-- Poster K3 -->
    <rect width="166" height="120" rx="8" fill="#f6c744" stroke="${INK}" stroke-width="3.5"/>
    <polygon points="83,20 128,84 38,84" fill="#25282c"/>
    <text x="83" y="76" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="38" font-weight="700" fill="#f6c744">!</text>
    <text x="83" y="108" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="14" font-weight="700" fill="#25282c">WAJIB APD K3</text>

    <!-- Helm Las Kuning di gantungan -->
    <g transform="translate(26,154)">
      <path d="M12 36 C12 0 98 0 98 36 L92 104 C74 118 36 118 18 104 Z" fill="#f0b634" stroke="${INK}" stroke-width="3.5"/>
      <rect x="28" y="34" width="54" height="30" rx="6" fill="#182a24" stroke="${INK}" stroke-width="3"/>
      <line x1="36" y1="44" x2="66" y2="44" stroke="#62f2b8" stroke-width="3" opacity="0.6"/>
    </g>

    <!-- APAR Pemadam Api Merah -->
    <g transform="translate(216,138)">
      <rect x="10" y="42" width="66" height="174" rx="22" fill="#d9382e" stroke="${INK}" stroke-width="4"/>
      <rect x="28" y="18" width="30" height="28" rx="4" fill="#2b3036" stroke="${INK}" stroke-width="3"/>
      <path d="M56 26 L92 14 M28 32 Q-6 58 6 132" fill="none" stroke="#25282c" stroke-width="7" stroke-linecap="round"/>
      <rect x="18" y="96" width="50" height="44" rx="4" fill="#fffdf6" stroke="${INK}" stroke-width="2.5"/>
      <text x="43" y="124" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="13" font-weight="700" fill="#c93026">APAR</text>
    </g>
  </g>

  <!-- Meja Landasan Baja & Pelat Logam Kanan Bawah -->
  <rect x="910" y="468" width="320" height="28" rx="5" fill="#4d5762" stroke="${INK}" stroke-width="3.5"/>
  <rect x="936" y="496" width="24" height="128" fill="#3a424b" stroke="${INK}" stroke-width="3.5"/>
  <rect x="1180" y="496" width="24" height="128" fill="#3a424b" stroke="${INK}" stroke-width="3.5"/>
  ${sunbeams(v)}`);
}

/* ============================================================================
 * 4. AREA MEJA DISKUSI BERSAMA
 * ============================================================================ */
function buildDiskusi(v) {
  const wallTop = v === 'sore' ? '#f5e4c8' : '#faf2e1';
  const wallBot = v === 'sore' ? '#e6cfa9' : '#ede0c7';
  const notes = [
    [40, 74, '#fef08a'], [96, 70, '#fbcfe8'], [152, 76, '#bbf7d0'],
    [44, 130, '#bae6fd'], [100, 128, '#fed7aa'], [156, 134, '#e9d5ff'],
    [226, 74, '#bbf7d0'], [282, 78, '#fef08a'], [230, 130, '#fbcfe8'],
  ];
  return wrapSvg(`
  <defs>
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${wallTop}"/><stop offset="100%" stop-color="${wallBot}"/></linearGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#d7ae78"/><stop offset="100%" stop-color="#b58852"/></linearGradient>
  </defs>
  <rect width="1280" height="476" fill="url(#wall)"/>
  <!-- Panel kayu bawah dinding -->
  <rect y="366" width="1280" height="110" fill="#c99c6d" stroke="${INK}" stroke-width="3.5"/>
  ${Array.from({ length: 16 }, (_, i) => `<line x1="${i * 80}" y1="366" x2="${i * 80}" y2="476" stroke="${INK}" stroke-width="2" opacity="0.22"/>`).join('')}
  <rect y="476" width="1280" height="244" fill="url(#floor)"/>
  <line x1="0" y1="476" x2="1280" y2="476" stroke="${INK}" stroke-width="4"/>
  ${[526, 586, 654].map((fy) => `<line x1="0" y1="${fy}" x2="1280" y2="${fy}" stroke="#875d34" stroke-width="2" opacity="0.35"/>`).join('')}

  <!-- Lampu gantung cozy -->
  ${[290, 990].map((lx) => `
    <line x1="${lx}" y1="0" x2="${lx}" y2="76" stroke="${INK}" stroke-width="4"/>
    <path d="M${lx - 42} 112 Q${lx} 56 ${lx + 42} 112 Z" fill="#f3c053" stroke="${INK}" stroke-width="3.5"/>
    <ellipse cx="${lx}" cy="112" rx="40" ry="9" fill="#fff7d6" stroke="${INK}" stroke-width="2.5"/>
  `).join('')}

  ${signPlaque(450, 38, 380, 52, 'AREA MEJA DISKUSI', '#2e8274', '#fffdf6', '#ffe494')}

  <!-- Jendela Kampus Tengah Cerah -->
  ${windowBlock(464, 118, 352, 224, v, '#8a5d3b', '#b9885a')}

  <!-- Papan Tulis Kanban & Sticky Notes Kiri -->
  <g transform="translate(56,120)">
    <rect width="366" height="224" rx="12" fill="#fffdf8" stroke="#9c714a" stroke-width="8"/>
    <rect width="366" height="224" rx="12" fill="none" stroke="${INK}" stroke-width="3"/>
    <text x="24" y="38" font-family="Fredoka, sans-serif" font-size="16" font-weight="700" fill="#3e2517">PAPAN IDE PROYEK TIM</text>
    <line x1="20" y1="50" x2="346" y2="50" stroke="#e2d1b5" stroke-width="2.5"/>
    <line x1="206" y1="54" x2="206" y2="206" stroke="#e2d1b5" stroke-width="2.5" stroke-dasharray="6 4"/>
    ${notes.map(([nx, ny, c]) => `<rect x="${nx}" y="${ny}" width="44" height="44" rx="4" fill="${c}" stroke="${INK}" stroke-width="2"/>`).join('')}
  </g>

  <!-- Rak Buku & Prototipe Kanan -->
  <g transform="translate(866,118)">
    <rect width="356" height="252" rx="10" fill="#9c6c46" stroke="${INK}" stroke-width="4"/>
    ${[0, 1, 2].map((row) => `
      <rect x="14" y="${16 + row * 78}" width="328" height="64" rx="4" fill="#6b452a"/>
      ${['#d9534f', '#3a88c8', '#3ba08e', '#f2b53b', '#8a6bb8', '#e57c4b', '#5da678'].map((col, idx) =>
        `<rect x="${24 + idx * 42}" y="${26 + row * 78 + (idx % 2) * 8}" width="26" height="${52 - (idx % 2) * 8}" rx="3" fill="${col}" stroke="${INK}" stroke-width="2"/>`
      ).join('')}
    `).join('')}
  </g>

  <!-- Karpet Hijau Sage + Meja Diskusi Besar + Kursi + Laptop -->
  <ellipse cx="640" cy="624" rx="430" ry="62" fill="#659479" stroke="${INK}" stroke-width="3.5"/>
  <ellipse cx="640" cy="624" rx="394" ry="48" fill="none" stroke="#e8cf8e" stroke-width="3" stroke-dasharray="10 8"/>
  <!-- Kursi belakang -->
  ${[410, 560, 720, 870].map((cx, i) => `
    <rect x="${cx - 32}" y="444" width="64" height="62" rx="14" fill="${i % 2 === 0 ? '#d9694b' : '#2e8274'}" stroke="${INK}" stroke-width="3.5"/>
  `).join('')}
  <!-- Meja Kayu Panjang Kolaborasi -->
  <rect x="280" y="492" width="720" height="42" rx="16" fill="#e8c38c" stroke="${INK}" stroke-width="4"/>
  <rect x="332" y="534" width="28" height="100" rx="6" fill="#9e6d42" stroke="${INK}" stroke-width="3.5"/>
  <rect x="920" y="534" width="28" height="100" rx="6" fill="#9e6d42" stroke="${INK}" stroke-width="3.5"/>
  <!-- Laptop & Buku Sketsa di Meja -->
  <path d="M404 492 L422 442 H522 L512 492 Z" fill="#3a4556" stroke="${INK}" stroke-width="3"/>
  <rect x="386" y="488" width="144" height="10" rx="4" fill="#cbd5e1" stroke="${INK}" stroke-width="2.5"/>
  <rect x="596" y="476" width="96" height="18" rx="4" fill="#fffdf6" stroke="${INK}" stroke-width="2.5"/>
  <rect x="748" y="458" width="30" height="36" rx="6" fill="#f3c053" stroke="${INK}" stroke-width="3"/>
  ${pottedPlant(112, 620, 1.05)}
  ${pottedPlant(1180, 626, 0.95)}
  ${sunbeams(v)}`);
}

/* ============================================================================
 * 5. SUDUT ISTIRAHAT MAHASISWA
 * ============================================================================ */
function buildIstirahat(v) {
  const wallTop = v === 'sore' ? '#e3e4d0' : '#d8ece0';
  const wallBot = v === 'sore' ? '#ced3bc' : '#bddac9';
  return wrapSvg(`
  <defs>
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${wallTop}"/><stop offset="100%" stop-color="${wallBot}"/></linearGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ddb988"/><stop offset="100%" stop-color="#be9562"/></linearGradient>
  </defs>
  <rect width="1280" height="482" fill="url(#wall)"/>
  <rect y="482" width="1280" height="238" fill="url(#floor)"/>
  <line x1="0" y1="482" x2="1280" y2="482" stroke="${INK}" stroke-width="4"/>

  ${signPlaque(430, 38, 420, 52, 'SUDUT ISTIRAHAT MAHASISWA', '#327a66', '#fffdf6', '#ffe494')}

  <!-- Mesin Penjual Minuman Retro Merah di Kiri -->
  <g transform="translate(58,128)">
    <rect width="212" height="356" rx="16" fill="#cf453d" stroke="${INK}" stroke-width="4"/>
    <rect x="18" y="22" width="128" height="224" rx="8" fill="#182a38" stroke="${INK}" stroke-width="3.5"/>
    ${[0, 1, 2, 3].map((r) => `
      <line x1="22" y1="${74 + r * 52}" x2="142" y2="${74 + r * 52}" stroke="#8ca2b3" stroke-width="4"/>
      ${['#f4be3b', '#4eb8e5', '#58c488', '#f2849e'].map((c, idx) =>
        `<rect x="${30 + idx * 28}" y="${38 + r * 52}" width="20" height="34" rx="5" fill="${c}" stroke="${INK}" stroke-width="2"/>`
      ).join('')}
    `).join('')}
    <rect x="158" y="54" width="38" height="84" rx="6" fill="#2c3540" stroke="${INK}" stroke-width="2.5"/>
    <circle cx="177" cy="78" r="6" fill="#5bf0a4"/><circle cx="177" cy="100" r="6" fill="#ffe169"/>
    <rect x="24" y="274" width="122" height="48" rx="8" fill="#141c24" stroke="${INK}" stroke-width="3"/>
  </g>

  <!-- Jendela Cerah Bertirai Tengah -->
  ${windowBlock(356, 120, 444, 240, v, '#8b6546', '#ba8f63', true)}

  <!-- Jam Dinding & Konter Kopi / Teh Hangat Kanan -->
  <g transform="translate(888,124)">
    <circle cx="52" cy="52" r="46" fill="#fffdf6" stroke="#8b6546" stroke-width="7"/>
    <circle cx="52" cy="52" r="46" fill="none" stroke="${INK}" stroke-width="3"/>
    <line x1="52" y1="52" x2="52" y2="26" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
    <line x1="52" y1="52" x2="74" y2="60" stroke="#cf453d" stroke-width="3.5" stroke-linecap="round"/>
  </g>

  <!-- Konter Kopi & Toples Camilan Kanan -->
  <g transform="translate(874,316)">
    <rect x="0" y="96" width="346" height="92" rx="10" fill="#e6cfa8" stroke="${INK}" stroke-width="4"/>
    <rect x="-8" y="84" width="362" height="20" rx="6" fill="#9c6c46" stroke="${INK}" stroke-width="3.5"/>
    <!-- Mesin Kopi -->
    <rect x="34" y="10" width="96" height="76" rx="10" fill="#374352" stroke="${INK}" stroke-width="3.5"/>
    <rect x="52" y="24" width="60" height="24" rx="4" fill="#d9534f"/>
    <rect x="64" y="54" width="34" height="30" rx="5" fill="#fffdf6" stroke="${INK}" stroke-width="2.5"/>
    <!-- Teko & Cangkir Teh + Toples Kue -->
    <circle cx="196" cy="58" r="24" fill="#5da68a" stroke="${INK}" stroke-width="3"/>
    <rect x="256" y="28" width="54" height="58" rx="10" fill="#fff7dc" stroke="${INK}" stroke-width="3"/>
    <circle cx="274" cy="64" r="9" fill="#c9854a"/><circle cx="294" cy="68" r="9" fill="#b36e38"/><circle cx="284" cy="50" r="9" fill="#d99a5b"/>
  </g>

  <!-- Karpet & Sofa Empuk Lounge -->
  <ellipse cx="590" cy="628" rx="340" ry="52" fill="#f2d699" stroke="${INK}" stroke-width="3.5"/>
  <!-- Sofa Biru-Teal -->
  <g transform="translate(332,424)">
    <rect x="16" y="0" width="234" height="76" rx="20" fill="#4285a8" stroke="${INK}" stroke-width="4"/>
    <rect x="0" y="52" width="266" height="62" rx="16" fill="#5399bd" stroke="${INK}" stroke-width="4"/>
    <rect x="44" y="22" width="44" height="40" rx="10" fill="#ffe184" stroke="${INK}" stroke-width="3"/>
    <rect x="178" y="22" width="44" height="40" rx="10" fill="#f08f6b" stroke="${INK}" stroke-width="3"/>
  </g>
  <!-- Sofa Oker Hangat -->
  <g transform="translate(646,434)">
    <rect x="14" y="0" width="194" height="70" rx="20" fill="#d98943" stroke="${INK}" stroke-width="4"/>
    <rect x="0" y="48" width="222" height="58" rx="16" fill="#e89f5a" stroke="${INK}" stroke-width="4"/>
  </g>
  <!-- Meja Kopi Rendah -->
  <rect x="498" y="576" width="190" height="24" rx="10" fill="#b88252" stroke="${INK}" stroke-width="3.5"/>
  <rect x="520" y="600" width="16" height="40" fill="#825632" stroke="${INK}" stroke-width="3"/>
  <rect x="650" y="600" width="16" height="40" fill="#825632" stroke="${INK}" stroke-width="3"/>
  ${pottedPlant(1214, 640, 0.95)}
  ${sunbeams(v)}`);
}

/* ============================================================================
 * 6. GUDANG ALAT & KALIBRASI
 * ============================================================================ */
function buildGudang(v) {
  const wallTop = v === 'sore' ? '#b09a7f' : '#a89f92';
  const wallBot = v === 'sore' ? '#8c7862' : '#857d72';
  const shelf = (sx, sy, sw, sh, rows) => {
    let out = `<rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" rx="6" fill="#4b5560" stroke="${INK}" stroke-width="4"/>`;
    const rh = (sh - 24) / rows;
    const boxCols = ['#d49c5a', '#4b86b4', '#589c78', '#c9684b', '#e0b84c'];
    for (let r = 0; r < rows; r++) {
      const y = sy + 14 + r * rh;
      out += `<rect x="${sx + 10}" y="${y}" width="${sw - 20}" height="${rh - 12}" fill="#2f3740"/>`;
      for (let b = 0; b < 4; b++) {
        const bw = (sw - 50) / 4;
        const bx = sx + 16 + b * (bw + 6);
        const col = boxCols[(r * 3 + b) % boxCols.length];
        out += `<rect x="${bx}" y="${y + 12}" width="${bw}" height="${rh - 26}" rx="4" fill="${col}" stroke="${INK}" stroke-width="2.5"/>
                <rect x="${bx + 10}" y="${y + 22}" width="${bw - 20}" height="12" rx="2" fill="#fffdf6"/>`;
      }
      out += `<rect x="${sx + 4}" y="${y + rh - 14}" width="${sw - 8}" height="10" fill="#8e9ba6" stroke="${INK}" stroke-width="2.5"/>`;
    }
    return out;
  };

  return wrapSvg(`
  <defs>
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${wallTop}"/><stop offset="100%" stop-color="${wallBot}"/></linearGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#8b877e"/><stop offset="100%" stop-color="#68645c"/></linearGradient>
    <radialGradient id="lamp" cx="50%" cy="15%" r="55%">
      <stop offset="0%" stop-color="#ffe7a3" stop-opacity="0.45"/><stop offset="100%" stop-color="#ffe7a3" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1280" height="492" fill="url(#wall)"/>
  ${Array.from({ length: 32 }, (_, i) => `<line x1="${i * 40}" y1="0" x2="${i * 40}" y2="492" stroke="rgba(40,30,22,0.12)" stroke-width="6"/>`).join('')}
  <rect y="492" width="1280" height="228" fill="url(#floor)"/>
  <line x1="0" y1="492" x2="1280" y2="492" stroke="${INK}" stroke-width="4"/>

  <!-- Lampu gantung gudang hangat -->
  <rect width="1280" height="720" fill="url(#lamp)"/>
  <line x1="640" y1="0" x2="640" y2="56" stroke="${INK}" stroke-width="5"/>
  <path d="M582 96 Q640 36 698 96 Z" fill="#3a434d" stroke="${INK}" stroke-width="3.5"/>
  <circle cx="640" cy="98" r="18" fill="#fff1b0"/>

  ${signPlaque(425, 114, 430, 52, 'GUDANG ALAT & KALIBRASI', '#d99826', '#2e1b0f', '#3e2517')}

  <!-- Rak Besi Bertingkat Kiri & Tengah -->
  ${shelf(54, 150, 340, 344, 4)}
  ${shelf(430, 190, 360, 304, 3)}

  <!-- Tangga Kayu Lipat & Troli Peralatan Kanan -->
  <g transform="translate(866,184)">
    <line x1="20" y1="0" x2="0" y2="334" stroke="#c89646" stroke-width="14" stroke-linecap="round"/>
    <line x1="130" y1="0" x2="150" y2="334" stroke="#c89646" stroke-width="14" stroke-linecap="round"/>
    <line x1="20" y1="0" x2="0" y2="334" stroke="${INK}" stroke-width="3"/>
    <line x1="130" y1="0" x2="150" y2="334" stroke="${INK}" stroke-width="3"/>
    ${[0, 1, 2, 3, 4, 5].map((s) => `<rect x="${12 - s * 2}" y="${42 + s * 46}" width="${126 + s * 4}" height="12" rx="4" fill="#e0b25c" stroke="${INK}" stroke-width="2.5"/>`).join('')}
  </g>
  <!-- Troli Biru dengan Kotak Kalibrasi -->
  <g transform="translate(1042,374)">
    <rect x="20" y="18" width="144" height="84" rx="8" fill="#c99456" stroke="${INK}" stroke-width="3.5"/>
    <rect x="52" y="34" width="80" height="22" rx="4" fill="#fffdf6" stroke="${INK}" stroke-width="2"/>
    <path d="M12 0 V132 H182" fill="none" stroke="#2f70b0" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="42" cy="148" r="18" fill="#2c333b" stroke="${INK}" stroke-width="3"/>
    <circle cx="152" cy="148" r="18" fill="#2c333b" stroke="${INK}" stroke-width="3"/>
  </g>
  <!-- Peti Kayu di Lantai Kiri -->
  <rect x="92" y="518" width="138" height="104" rx="8" fill="#c69156" stroke="${INK}" stroke-width="4"/>
  <line x1="92" y1="518" x2="230" y2="622" stroke="#996838" stroke-width="4"/>
  <line x1="230" y1="518" x2="92" y2="622" stroke="#996838" stroke-width="4"/>
  ${sunbeams(v)}`);
}

const BUILDERS = {
  elektronik: buildElektronik,
  pemrograman: buildPemrograman,
  las: buildLas,
  diskusi: buildDiskusi,
  istirahat: buildIstirahat,
  gudang: buildGudang,
};

for (const [name, fn] of Object.entries(BUILDERS)) {
  for (const variant of ['pagi', 'sore']) {
    const filePath = path.join(OUT_DIR, `${name}-${variant}.svg`);
    fs.writeFileSync(filePath, fn(variant), 'utf8');
    console.log('Generated:', path.relative(process.cwd(), filePath));
  }
}
