/**
 * Geometri potret kepala-bahu bergaya visual novel (data murni, tanpa JSX/DOM).
 * Semua koordinat dalam viewBox 200x260. Fungsi pembangun deterministik:
 * masukan yang sama selalu menghasilkan struktur data yang sama.
 * Label demografis hanya memengaruhi tampilan (warna dan gaya rambut).
 */
import type { StoryExpression } from '../../engine/story/storyTypes';
import type { AgentDemographicLabel } from '../../types';

export const PORTRAIT_VIEWBOX = { width: 200, height: 260 } as const;
export const PORTRAIT_VIEWBOX_STRING = `0 0 ${PORTRAIT_VIEWBOX.width} ${PORTRAIT_VIEWBOX.height}`;

export type PortraitHairStyle = AgentDemographicLabel['hairStyle'];
export type PortraitRole = 'dosen' | 'mahasiswa';

/* ------------------------------------------------------------------ */
/* Tabel ekspresi                                                      */
/* ------------------------------------------------------------------ */

export interface BrowShape {
  /** Pergeseran vertikal ujung luar alis (positif = turun). */
  outerDy: number;
  /** Pergeseran vertikal ujung dalam alis (positif = turun). */
  innerDy: number;
  /** Lengkung ke atas pada titik tengah alis. */
  arch: number;
}

export interface EyeShape {
  /** Faktor keterbukaan mata (1 = normal, <=0.35 = hampir terpejam). */
  open: number;
  pupilDx: number;
  pupilDy: number;
  pupilR: number;
}

export interface MouthShape {
  /** Path SVG mulut, berpusat di x=100. */
  d: string;
  /** True bila mulut diisi (terbuka), false bila hanya garis. */
  filled: boolean;
}

export interface ExpressionShape {
  brow: BrowShape;
  eye: EyeShape;
  mouth: MouthShape;
  /** Opasitas rona pipi (0 = tanpa rona). */
  blush: number;
  /** Tetes keringat di pelipis. */
  sweat: boolean;
}

export const STORY_EXPRESSIONS: readonly StoryExpression[] = [
  'netral', 'waspada', 'menunduk', 'cemas', 'lega', 'tersenyum',
  'lelah', 'kesal', 'terkejut', 'tertegun', 'menutup-diri',
];

export const PORTRAIT_SHAPES: Record<StoryExpression, ExpressionShape> = {
  netral: {
    brow: { outerDy: 0, innerDy: 0, arch: 2 },
    eye: { open: 1, pupilDx: 0, pupilDy: 0, pupilR: 3.4 },
    mouth: { d: 'M90,142 Q100,144 110,142', filled: false },
    blush: 0,
    sweat: false,
  },
  waspada: {
    brow: { outerDy: 2, innerDy: -3, arch: 1 },
    eye: { open: 1.15, pupilDx: 0, pupilDy: 0, pupilR: 3.2 },
    mouth: { d: 'M91,143 L109,143', filled: false },
    blush: 0,
    sweat: false,
  },
  menunduk: {
    brow: { outerDy: 2, innerDy: -1, arch: 1 },
    eye: { open: 0.45, pupilDx: 0, pupilDy: 2.5, pupilR: 3.2 },
    mouth: { d: 'M92,144 Q100,142 108,144', filled: false },
    blush: 0,
    sweat: false,
  },
  cemas: {
    brow: { outerDy: 4, innerDy: -5, arch: 0 },
    eye: { open: 1.2, pupilDx: 0, pupilDy: -1, pupilR: 3 },
    mouth: { d: 'M90,146 Q95,141 100,145 Q105,141 110,146', filled: false },
    blush: 0,
    sweat: true,
  },
  lega: {
    brow: { outerDy: 0, innerDy: -1, arch: 3 },
    eye: { open: 0.7, pupilDx: 0, pupilDy: 0.5, pupilR: 3.4 },
    mouth: { d: 'M90,141 Q100,150 110,141', filled: false },
    blush: 0.25,
    sweat: false,
  },
  tersenyum: {
    brow: { outerDy: -1, innerDy: -1, arch: 3 },
    eye: { open: 0.6, pupilDx: 0, pupilDy: 0, pupilR: 3.4 },
    mouth: { d: 'M86,139 Q100,157 114,139 Q100,143 86,139 Z', filled: true },
    blush: 0.35,
    sweat: false,
  },
  lelah: {
    brow: { outerDy: 3, innerDy: -1, arch: 1 },
    eye: { open: 0.4, pupilDx: 0, pupilDy: 1, pupilR: 3.2 },
    mouth: { d: 'M91,145 Q100,142 109,146', filled: false },
    blush: 0,
    sweat: false,
  },
  kesal: {
    brow: { outerDy: -3, innerDy: 4, arch: 0 },
    eye: { open: 0.8, pupilDx: 0, pupilDy: 0, pupilR: 3.4 },
    mouth: { d: 'M91,146 Q100,139 109,146', filled: false },
    blush: 0.2,
    sweat: false,
  },
  terkejut: {
    brow: { outerDy: -4, innerDy: -5, arch: 4 },
    eye: { open: 1.4, pupilDx: 0, pupilDy: 0, pupilR: 2.4 },
    mouth: { d: 'M95,140 Q100,136 105,140 Q108,150 100,152 Q92,150 95,140 Z', filled: true },
    blush: 0,
    sweat: false,
  },
  tertegun: {
    brow: { outerDy: -1, innerDy: -2, arch: 2 },
    eye: { open: 1.1, pupilDx: 0, pupilDy: 0, pupilR: 2.8 },
    mouth: { d: 'M94,143 Q100,148 106,143 Q100,141 94,143 Z', filled: true },
    blush: 0,
    sweat: false,
  },
  'menutup-diri': {
    brow: { outerDy: 2, innerDy: -3, arch: 0 },
    eye: { open: 0.3, pupilDx: 0, pupilDy: 3, pupilR: 3 },
    mouth: { d: 'M93,145 L107,145', filled: false },
    blush: 0,
    sweat: false,
  },
};

/* ------------------------------------------------------------------ */
/* Tipe lapisan                                                        */
/* ------------------------------------------------------------------ */

interface LayerBase {
  /** Pengenal stabil, dipakai sebagai key dan untuk pengujian. */
  id: string;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
}

export interface PathLayer extends LayerBase {
  kind: 'path';
  d: string;
  strokeLinecap?: 'round' | 'butt';
}

export interface EllipseLayer extends LayerBase {
  kind: 'ellipse';
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

export type PortraitLayer = PathLayer | EllipseLayer;

export interface PortraitData {
  role: PortraitRole;
  viewBox: string;
  width: number;
  height: number;
  expression: StoryExpression;
  /** Urutan gambar dari belakang ke depan. */
  layers: PortraitLayer[];
}

/* ------------------------------------------------------------------ */
/* Warna dan helper                                                    */
/* ------------------------------------------------------------------ */

export const SKIN_COLOR = '#f1c9a5';
export const SKIN_SHADE = '#d9a982';
export const OUTLINE_COLOR = '#3b2a22';
const EYE_WHITE = '#ffffff';
const PUPIL_COLOR = '#2a1d17';
const BLUSH_COLOR = '#ef7f7f';
const SWEAT_COLOR = '#9fd4f5';
const MOUTH_INSIDE = '#8a2f35';

/** Normalisasi hue ke bilangan bulat 0..359; nilai tak valid menjadi 0. */
export function normalizeHue(hue: number): number {
  if (!Number.isFinite(hue)) return 0;
  return ((Math.round(hue) % 360) + 360) % 360;
}

export function hairColor(hue: number): string {
  return `hsl(${normalizeHue(hue)}, 28%, 20%)`;
}

export function clothesColor(hue: number): string {
  return `hsl(${normalizeHue(hue)}, 46%, 44%)`;
}

export function clothesShadeColor(hue: number): string {
  return `hsl(${normalizeHue(hue)}, 46%, 34%)`;
}

const r = (n: number): number => Math.round(n * 100) / 100;

/* ------------------------------------------------------------------ */
/* Geometri dasar                                                      */
/* ------------------------------------------------------------------ */

export const HEAD = { cx: 100, cy: 110, rx: 42, ry: 50 } as const;
export const EYE_Y = 110;
export const EYE_X = { left: 82, right: 118 } as const;
export const BROW_Y = 92;

export const SHOULDERS_PATH = 'M18,260 Q18,206 68,194 L132,194 Q182,206 182,260 Z';
export const NECK_PATH = 'M86,166 L114,166 L114,196 Q100,206 86,196 Z';

/** Path alis untuk sisi tertentu; sisi kanan adalah cermin sisi kiri terhadap x=100. */
export function browPath(brow: BrowShape, side: 'left' | 'right'): string {
  const outerX = side === 'left' ? 66 : 134;
  const innerX = side === 'left' ? 92 : 108;
  const midX = (outerX + innerX) / 2;
  const outerY = BROW_Y + brow.outerDy;
  const innerY = BROW_Y + brow.innerDy;
  const ctrlY = (outerY + innerY) / 2 - brow.arch;
  return `M${outerX},${r(outerY)} Q${midX},${r(ctrlY)} ${innerX},${r(innerY)}`;
}

/** Path kelopak untuk mata hampir terpejam. */
function lidPath(cx: number, droop: number): string {
  return `M${cx - 8},${EYE_Y} Q${cx},${r(EYE_Y + 3 + droop)} ${cx + 8},${EYE_Y}`;
}

const CLOSED_EYE_THRESHOLD = 0.35;

/* ------------------------------------------------------------------ */
/* Rambut                                                              */
/* ------------------------------------------------------------------ */

export interface HairShape {
  /** Digambar sebelum bahu dan kepala. */
  back: string[];
  /** Digambar setelah kepala dan wajah. */
  front: string[];
}

const FRINGE = 'M58,100 Q56,52 100,48 Q144,52 142,100 Q132,76 100,72 Q68,76 58,100 Z';

export const HAIR_SHAPES: Record<PortraitHairStyle, HairShape> = {
  pendek: {
    back: [],
    front: [FRINGE],
  },
  sedang: {
    back: ['M54,110 Q50,50 100,46 Q150,50 146,110 L150,164 Q130,152 128,122 L72,122 Q70,152 50,164 Z'],
    front: [FRINGE],
  },
  kerudung: {
    back: ['M46,118 Q44,40 100,38 Q156,40 154,118 Q158,172 142,204 L58,204 Q42,172 46,118 Z'],
    front: [
      'M56,100 Q58,58 100,56 Q142,58 144,100 Q130,76 100,74 Q70,76 56,100 Z',
      'M52,150 Q60,192 100,202 Q140,192 148,150 Q140,170 100,174 Q60,170 52,150 Z',
    ],
  },
  ikat: {
    back: ['M138,78 Q176,82 170,138 Q164,112 138,106 Z'],
    front: [
      FRINGE,
      'M132,58 Q152,50 160,66 Q150,72 138,70 Z',
    ],
  },
};

/** Rambut Dosen BK: rapi, pendek, warna abu gelap tetap. */
export const DOSEN_HAIR_COLOR = '#4a4a52';
const DOSEN_HAIR: HairShape = {
  back: [],
  front: ['M56,102 Q52,48 100,44 Q148,48 144,102 Q134,70 108,68 Q76,66 56,102 Z'],
};

/* ------------------------------------------------------------------ */
/* Pembangun lapisan                                                   */
/* ------------------------------------------------------------------ */

function face(expression: StoryExpression): PortraitLayer[] {
  const shape = PORTRAIT_SHAPES[expression];
  const layers: PortraitLayer[] = [];

  if (shape.blush > 0) {
    for (const side of ['left', 'right'] as const) {
      layers.push({
        kind: 'ellipse',
        id: `blush-${side}`,
        cx: side === 'left' ? 72 : 128,
        cy: 128,
        rx: 9,
        ry: 5,
        fill: BLUSH_COLOR,
        opacity: shape.blush,
      });
    }
  }

  for (const side of ['left', 'right'] as const) {
    const cx = EYE_X[side];
    const { eye } = shape;
    if (eye.open <= CLOSED_EYE_THRESHOLD) {
      layers.push({
        kind: 'path',
        id: `eye-${side}`,
        d: lidPath(cx, eye.pupilDy),
        fill: 'none',
        stroke: OUTLINE_COLOR,
        strokeWidth: 2.4,
        strokeLinecap: 'round',
      });
    } else {
      layers.push({
        kind: 'ellipse',
        id: `eye-${side}`,
        cx,
        cy: EYE_Y,
        rx: 8,
        ry: r(6.5 * eye.open),
        fill: EYE_WHITE,
        stroke: OUTLINE_COLOR,
        strokeWidth: 1.6,
      });
      layers.push({
        kind: 'ellipse',
        id: `pupil-${side}`,
        cx: r(cx + eye.pupilDx),
        cy: r(EYE_Y + eye.pupilDy),
        rx: eye.pupilR,
        ry: eye.pupilR,
        fill: PUPIL_COLOR,
      });
    }
  }

  for (const side of ['left', 'right'] as const) {
    layers.push({
      kind: 'path',
      id: `brow-${side}`,
      d: browPath(shape.brow, side),
      fill: 'none',
      stroke: OUTLINE_COLOR,
      strokeWidth: 3,
      strokeLinecap: 'round',
    });
  }

  layers.push({
    kind: 'path',
    id: 'mouth',
    d: shape.mouth.d,
    fill: shape.mouth.filled ? MOUTH_INSIDE : 'none',
    stroke: OUTLINE_COLOR,
    strokeWidth: 2.2,
    strokeLinecap: 'round',
  });

  layers.push({
    kind: 'path',
    id: 'nose',
    d: 'M100,118 Q97,128 101,131',
    fill: 'none',
    stroke: SKIN_SHADE,
    strokeWidth: 1.8,
    strokeLinecap: 'round',
  });

  if (shape.sweat) {
    layers.push({
      kind: 'path',
      id: 'sweat',
      d: 'M144,92 Q150,102 144,108 Q138,102 144,92 Z',
      fill: SWEAT_COLOR,
      stroke: '#5aa5d6',
      strokeWidth: 1,
    });
  }

  return layers;
}

function hairLayers(hair: HairShape, part: 'back' | 'front', color: string): PortraitLayer[] {
  return hair[part].map((d, i) => ({
    kind: 'path' as const,
    id: `hair-${part}-${i}`,
    d,
    fill: color,
  }));
}

function baseHead(): PortraitLayer[] {
  return [
    { kind: 'path', id: 'neck', d: NECK_PATH, fill: SKIN_SHADE },
    {
      kind: 'ellipse',
      id: 'head',
      cx: HEAD.cx,
      cy: HEAD.cy,
      rx: HEAD.rx,
      ry: HEAD.ry,
      fill: SKIN_COLOR,
      stroke: OUTLINE_COLOR,
      strokeWidth: 1.6,
    },
    {
      kind: 'ellipse',
      id: 'ear-left',
      cx: 57,
      cy: 112,
      rx: 5,
      ry: 9,
      fill: SKIN_COLOR,
      stroke: OUTLINE_COLOR,
      strokeWidth: 1.2,
    },
    {
      kind: 'ellipse',
      id: 'ear-right',
      cx: 143,
      cy: 112,
      rx: 5,
      ry: 9,
      fill: SKIN_COLOR,
      stroke: OUTLINE_COLOR,
      strokeWidth: 1.2,
    },
  ];
}

export interface StudentPortraitInput {
  demographicLabel: Pick<AgentDemographicLabel, 'avatarHue' | 'hairStyle'>;
  expression: StoryExpression;
}

/** Potret mahasiswa: rambut dan pakaian mengikuti hairStyle dan avatarHue. */
export function buildStudentPortrait(input: StudentPortraitInput): PortraitData {
  const { avatarHue, hairStyle } = input.demographicLabel;
  const hair = HAIR_SHAPES[hairStyle] ?? HAIR_SHAPES.pendek;
  const hc = hairColor(avatarHue);
  const layers: PortraitLayer[] = [
    ...hairLayers(hair, 'back', hc),
    {
      kind: 'path',
      id: 'shoulders',
      d: SHOULDERS_PATH,
      fill: clothesColor(avatarHue),
      stroke: clothesShadeColor(avatarHue),
      strokeWidth: 2,
    },
    {
      kind: 'path',
      id: 'collar',
      d: 'M84,196 Q100,214 116,196',
      fill: 'none',
      stroke: clothesShadeColor(avatarHue),
      strokeWidth: 3,
      strokeLinecap: 'round',
    },
    ...baseHead(),
    ...face(input.expression),
    ...hairLayers(hair, 'front', hc),
  ];
  return {
    role: 'mahasiswa',
    viewBox: PORTRAIT_VIEWBOX_STRING,
    width: PORTRAIT_VIEWBOX.width,
    height: PORTRAIT_VIEWBOX.height,
    expression: input.expression,
    layers,
  };
}

export const DOSEN_BLAZER_COLOR = '#2f3b52';
export const DOSEN_BLAZER_SHADE = '#222b3d';
export const DOSEN_SHIRT_COLOR = '#f4f4f0';
export const DOSEN_LANYARD_COLOR = '#d9822b';

/** Potret Dosen BK: rambut tetap, blazer, kemeja, lanyard dengan kartu nama. */
export function buildDosenPortrait(expression: StoryExpression = 'netral'): PortraitData {
  const layers: PortraitLayer[] = [
    ...hairLayers(DOSEN_HAIR, 'back', DOSEN_HAIR_COLOR),
    {
      kind: 'path',
      id: 'shoulders',
      d: SHOULDERS_PATH,
      fill: DOSEN_BLAZER_COLOR,
      stroke: DOSEN_BLAZER_SHADE,
      strokeWidth: 2,
    },
    {
      kind: 'path',
      id: 'shirt',
      d: 'M84,196 L100,240 L116,196 Q100,208 84,196 Z',
      fill: DOSEN_SHIRT_COLOR,
    },
    ...baseHead(),
    ...face(expression),
    ...hairLayers(DOSEN_HAIR, 'front', DOSEN_HAIR_COLOR),
    {
      kind: 'path',
      id: 'lapel-left',
      d: 'M84,196 L96,246 L70,226 L66,200 Z',
      fill: DOSEN_BLAZER_SHADE,
    },
    {
      kind: 'path',
      id: 'lapel-right',
      d: 'M116,196 L104,246 L130,226 L134,200 Z',
      fill: DOSEN_BLAZER_SHADE,
    },
    {
      kind: 'path',
      id: 'lanyard',
      d: 'M88,198 L100,238 M112,198 L100,238',
      fill: 'none',
      stroke: DOSEN_LANYARD_COLOR,
      strokeWidth: 3,
      strokeLinecap: 'round',
    },
    {
      kind: 'path',
      id: 'id-card',
      d: 'M91,238 L109,238 L109,258 L91,258 Z',
      fill: '#ffffff',
      stroke: DOSEN_LANYARD_COLOR,
      strokeWidth: 1.6,
    },
  ];
  return {
    role: 'dosen',
    viewBox: PORTRAIT_VIEWBOX_STRING,
    width: PORTRAIT_VIEWBOX.width,
    height: PORTRAIT_VIEWBOX.height,
    expression,
    layers,
  };
}

/** Pembangun umum: Dosen mengabaikan label demografis. */
export function buildPortrait(
  role: PortraitRole,
  expression: StoryExpression,
  demographicLabel?: Pick<AgentDemographicLabel, 'avatarHue' | 'hairStyle'>,
): PortraitData {
  if (role === 'dosen') return buildDosenPortrait(expression);
  return buildStudentPortrait({
    demographicLabel: demographicLabel ?? { avatarHue: 200, hairStyle: 'pendek' },
    expression,
  });
}
