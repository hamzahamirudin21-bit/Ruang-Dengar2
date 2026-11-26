import { STUDENT_BLUEPRINTS } from '../../data/agents.seed';
import { STUDENT_BACKGROUNDS } from '../../data/studentBackgrounds';
import { STUDENT_APPEARANCES, type CharacterAppearance } from '../characters/appearance';
import { HAIR_COLORS, IDENTITY_COLORS, SKIN_TONES } from '../characters/characterPalette';

export interface CharacterDesignBibleEntry {
  characterId: string;
  slug: string;
  name: string;
  shortName: string;
  cohort: number;
  faceShape: string;
  eyeStyle: string;
  eyeColor: string;
  hairStyle: string;
  hairColor: string;
  hairHex: string;
  skinHex: string;
  outfitSummary: string;
  outfitPrimaryHex: string;
  outfitAccentHex: string;
  bottomHex: string;
  accessories: readonly string[];
  bodyProportion: string;
  visualSignature: string;
  personalitySummary: string;
  sourcePortraitPath: string;
  masterReferencePath: string;
  appearance: CharacterAppearance;
}

const EYE_DESC_BY_ID: Readonly<Record<string, { style: string; color: string }>> = {
  'mhs-01': { style: 'Tajam ramah penuh fokus', color: 'Cokelat tua hangat' },
  'mhs-02': { style: 'Tenang sedikit menyipit di balik kacamata', color: 'Cokelat gelap' },
  'mhs-03': { style: 'Lembut sabar keibuan', color: 'Cokelat amber' },
  'mhs-04': { style: 'Analitis tegas berkacamata', color: 'Abu-cokelat gelap' },
  'mhs-05': { style: 'Lebar berbinar kreatif', color: 'Cokelat kastanye cerah' },
  'mhs-06': { style: 'Teduh pemalu', color: 'Cokelat lembut' },
  'mhs-07': { style: 'Tegas disiplin berwibawa', color: 'Hitam kecokelatan' },
  'mhs-08': { style: 'Ramah hangat mudah tersenyum', color: 'Cokelat hangat' },
  'mhs-09': { style: 'Berani ekspresif', color: 'Cokelat gelap' },
  'mhs-10': { style: 'Tenang fokus penuh ketelitian', color: 'Cokelat tua' },
  'mhs-11': { style: 'Reflektif tajam mengamati', color: 'Cokelat keunguan lembut' },
  'mhs-12': { style: 'Hangat komunikatif', color: 'Cokelat madu' },
  'mhs-13': { style: 'Peka lembut empatik', color: 'Cokelat tua teduh' },
  'mhs-14': { style: 'Antusias ingin tahu', color: 'Cokelat terang' },
  'mhs-15': { style: 'Cerah penuh ide eksperimental', color: 'Cokelat keemasan' },
  'mhs-16': { style: 'Estetis fokus detail', color: 'Cokelat gelap' },
  'mhs-17': { style: 'Tenang sistematis', color: 'Cokelat tua' },
  'mhs-18': { style: 'Bersemangat kolaboratif', color: 'Cokelat hangat' },
};

const HAIR_KIND_LABEL: Readonly<Record<string, string>> = {
  pendek: 'Rambut pendek rapi berlayer anime',
  sedang: 'Rambut sebahu lembut natural',
  ikat: 'Rambut terikat rapi (ponytail)',
  kerudung: 'Hijab modern rapi menyatu dengan busana',
};

const BODY_PROP_LABEL: Readonly<Record<string, string>> = {
  ramping: 'Proporsi anime 7-kepala ramping natural',
  sedang: 'Proporsi anime 7-kepala atletis seimbang',
  tegap: 'Proporsi anime 7.2-kepala bahu tegap',
};

/**
 * Character Design Bible permanen untuk seluruh 18 mahasiswa RUANG DENGAR.
 * Mengunci identitas wajah, rambut, warna pakaian, aksesori, proporsi tubuh,
 * dan kepribadian langsung dari database resmi proyek.
 */
export const CHARACTER_DESIGN_BIBLE: readonly CharacterDesignBibleEntry[] = STUDENT_BLUEPRINTS.map(
  (bp) => {
    const firstName = bp.name.split(' ')[0];
    const slug = firstName.toLowerCase();
    const bg = STUDENT_BACKGROUNDS[bp.id];
    const app = STUDENT_APPEARANCES[bp.id];
    const skin = SKIN_TONES.find((s) => s.id === app.body.skinId)?.base ?? '#eab98f';
    const hair = HAIR_COLORS.find((h) => h.id === app.hair.colorId) ?? HAIR_COLORS[0];
    const topTone = IDENTITY_COLORS[app.outfit.topColor] ?? IDENTITY_COLORS.navy;
    const accentTone = IDENTITY_COLORS[app.outfit.topAccent ?? 'mustard'] ?? IDENTITY_COLORS.mustard;
    const bottomTone = IDENTITY_COLORS[app.outfit.bottomColor] ?? IDENTITY_COLORS.navy;
    const eye = EYE_DESC_BY_ID[bp.id] ?? { style: 'Ekspresif anime natural', color: 'Cokelat tua' };

    return {
      characterId: bp.id,
      slug,
      name: bp.name,
      shortName: firstName,
      cohort: bp.cohort,
      faceShape: app.body.type === 'tegap' ? 'Rahang tegas anime semi-realistis' : 'Oval bersih anime semi-realistis',
      eyeStyle: eye.style,
      eyeColor: eye.color,
      hairStyle: HAIR_KIND_LABEL[app.hair.kind] ?? app.hair.kind,
      hairColor: app.hair.colorId.replace('rambut-', ''),
      hairHex: hair.base,
      skinHex: skin,
      outfitSummary: `${app.styleName} (${app.outfit.top} ${app.outfit.topColor}, ${app.outfit.bottom} ${app.outfit.bottomColor}, ${app.outfit.shoe} ${app.outfit.shoeColor})`,
      outfitPrimaryHex: topTone.base,
      outfitAccentHex: accentTone.base,
      bottomHex: bottomTone.base,
      accessories: app.accessories,
      bodyProportion: BODY_PROP_LABEL[app.body.type] ?? 'Proporsi anime 7-kepala seimbang',
      visualSignature: `${app.styleName} · ${app.accessories.join(', ') || 'gaya kasual lab'}`,
      personalitySummary: `${bg?.typeTag ?? 'Mahasiswa'} — ${bp.uniquePotential}`,
      sourcePortraitPath: `/assets/characters/${bp.id}-portrait.png`,
      masterReferencePath: `/assets/anime-characters/${slug}/reference/${slug}_master_model_sheet.png`,
      appearance: app,
    };
  }
);

const BIBLE_BY_ID: Readonly<Record<string, CharacterDesignBibleEntry>> = Object.fromEntries(
  CHARACTER_DESIGN_BIBLE.map((entry) => [entry.characterId, entry])
);

export function getDesignBibleEntry(characterId: string): CharacterDesignBibleEntry | null {
  return BIBLE_BY_ID[characterId] ?? null;
}
