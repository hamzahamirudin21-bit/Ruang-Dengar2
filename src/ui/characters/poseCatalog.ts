import type { StoryExpression } from '../../engine/story/storyTypes';
import { STUDENT_BLUEPRINTS } from '../../data/agents.seed';
import { STUDENT_BACKGROUNDS } from '../../data/studentBackgrounds';
import { STUDENT_APPEARANCES } from './appearance';
import { HAIR_COLORS, IDENTITY_COLORS, SKIN_TONES } from './characterPalette';

export type PoseId =
  | 'P01'
  | 'P02'
  | 'P03'
  | 'P04'
  | 'P05'
  | 'P06'
  | 'P07'
  | 'P08'
  | 'P09'
  | 'P10'
  | 'P11'
  | 'P12'
  | 'P13'
  | 'P14'
  | 'P15'
  | 'P16'
  | 'P17'
  | 'P18'
  | 'P19'
  | 'P20';

export type PoseEmotion =
  | 'neutral'
  | 'warm'
  | 'happy'
  | 'excited'
  | 'thinking'
  | 'curious'
  | 'confused'
  | 'surprised'
  | 'worried'
  | 'sad'
  | 'exhausted'
  | 'frustrated'
  | 'confident'
  | 'explaining'
  | 'pointing'
  | 'inviting'
  | 'listening'
  | 'reassuring'
  | 'shy'
  | 'focused';

export type PoseAnimationType =
  | 'subtle-idle'
  | 'talking-gesture'
  | 'excited-reaction'
  | 'surprise-transition'
  | 'listening-nod'
  | 'reflective-pause'
  | 'reassuring-sway';

export type PersonalityMotionArchetype =
  | 'quiet'
  | 'expressive'
  | 'confident'
  | 'empathetic'
  | 'analytical';

export interface PoseCatalogEntry {
  poseId: PoseId;
  fileSlug: string;
  pascalName: string;
  title: string;
  description: string;
  emotion: PoseEmotion;
  expression: StoryExpression;
  gesture: string;
  animationType: PoseAnimationType;
  /** Kemiringan tubuh halus (derajat) saat transisi */
  bodyTiltDeg: number;
  /** Durasi standar tampilan pose (ms) */
  defaultDurationMs: number;
}

export const POSE_CATALOG: readonly PoseCatalogEntry[] = [
  {
    poseId: 'P01',
    fileSlug: 'p01-neutral',
    pascalName: 'P01_Neutral',
    title: 'Neutral Idle',
    description: 'Berdiri atau duduk normal dengan ekspresi tenang',
    emotion: 'neutral',
    expression: 'netral',
    gesture: 'postur netral seimbang',
    animationType: 'subtle-idle',
    bodyTiltDeg: 0,
    defaultDurationMs: 2400,
  },
  {
    poseId: 'P02',
    fileSlug: 'p02-warm-smile',
    pascalName: 'P02_WarmSmile',
    title: 'Warm Smile',
    description: 'Senyum ramah dengan gestur santai',
    emotion: 'warm',
    expression: 'tersenyum',
    gesture: 'senyum hangat dan bahu rileks',
    animationType: 'reassuring-sway',
    bodyTiltDeg: 1.0,
    defaultDurationMs: 2600,
  },
  {
    poseId: 'P03',
    fileSlug: 'p03-happy-laugh',
    pascalName: 'P03_HappyLaugh',
    title: 'Happy Laugh',
    description: 'Tertawa dengan mata sedikit menyipit dan bahu bergerak',
    emotion: 'happy',
    expression: 'tersenyum',
    gesture: 'tawa ringan dan bahu terangkat',
    animationType: 'excited-reaction',
    bodyTiltDeg: -1.5,
    defaultDurationMs: 2400,
  },
  {
    poseId: 'P04',
    fileSlug: 'p04-excited',
    pascalName: 'P04_Excited',
    title: 'Excited',
    description: 'Antusias dengan mata berbinar dan gestur tangan terbuka',
    emotion: 'excited',
    expression: 'tersenyum',
    gesture: 'tangan terbuka antusias',
    animationType: 'excited-reaction',
    bodyTiltDeg: -1.2,
    defaultDurationMs: 2500,
  },
  {
    poseId: 'P05',
    fileSlug: 'p05-thinking',
    pascalName: 'P05_Thinking',
    title: 'Thinking',
    description: 'Tangan menyentuh dagu sambil berpikir',
    emotion: 'thinking',
    expression: 'tertegun',
    gesture: 'tangan menyentuh dagu',
    animationType: 'reflective-pause',
    bodyTiltDeg: 1.8,
    defaultDurationMs: 2700,
  },
  {
    poseId: 'P06',
    fileSlug: 'p06-curious',
    pascalName: 'P06_Curious',
    title: 'Curious',
    description: 'Kepala sedikit miring dengan ekspresi ingin tahu',
    emotion: 'curious',
    expression: 'waspada',
    gesture: 'kepala miring penuh rasa ingin tahu',
    animationType: 'listening-nod',
    bodyTiltDeg: 2.4,
    defaultDurationMs: 2400,
  },
  {
    poseId: 'P07',
    fileSlug: 'p07-confused',
    pascalName: 'P07_Confused',
    title: 'Confused',
    description: 'Alis sedikit terangkat dengan gestur kebingungan',
    emotion: 'confused',
    expression: 'tertegun',
    gesture: 'tangan terangkat ragu-ragu',
    animationType: 'reflective-pause',
    bodyTiltDeg: -2.0,
    defaultDurationMs: 2500,
  },
  {
    poseId: 'P08',
    fileSlug: 'p08-surprised',
    pascalName: 'P08_Surprised',
    title: 'Surprised',
    description: 'Mata membesar dan tangan bereaksi spontan',
    emotion: 'surprised',
    expression: 'terkejut',
    gesture: 'reaksi spontan tangan terangkat',
    animationType: 'surprise-transition',
    bodyTiltDeg: -1.8,
    defaultDurationMs: 2100,
  },
  {
    poseId: 'P09',
    fileSlug: 'p09-worried',
    pascalName: 'P09_Worried',
    title: 'Worried',
    description: 'Ekspresi khawatir dengan posisi tubuh lebih tegang',
    emotion: 'worried',
    expression: 'cemas',
    gesture: 'bahu menegang dan tangan di dada',
    animationType: 'reflective-pause',
    bodyTiltDeg: 1.5,
    defaultDurationMs: 2700,
  },
  {
    poseId: 'P10',
    fileSlug: 'p10-sad',
    pascalName: 'P10_Sad',
    title: 'Sad',
    description: 'Ekspresi sedih dan kepala sedikit menunduk',
    emotion: 'sad',
    expression: 'menunduk',
    gesture: 'kepala menunduk dan bahu turun',
    animationType: 'subtle-idle',
    bodyTiltDeg: 2.2,
    defaultDurationMs: 2800,
  },
  {
    poseId: 'P11',
    fileSlug: 'p11-exhausted',
    pascalName: 'P11_Exhausted',
    title: 'Exhausted',
    description: 'Terlihat lelah, bahu turun dan postur lebih santai',
    emotion: 'exhausted',
    expression: 'lelah',
    gesture: 'bahu turun dan postur lelah',
    animationType: 'subtle-idle',
    bodyTiltDeg: 1.6,
    defaultDurationMs: 2800,
  },
  {
    poseId: 'P12',
    fileSlug: 'p12-frustrated',
    pascalName: 'P12_Frustrated',
    title: 'Frustrated',
    description: 'Ekspresi frustrasi dengan gestur tangan yang wajar',
    emotion: 'frustrated',
    expression: 'kesal',
    gesture: 'gestur tangan tegang menahan kesal',
    animationType: 'talking-gesture',
    bodyTiltDeg: -1.6,
    defaultDurationMs: 2500,
  },
  {
    poseId: 'P13',
    fileSlug: 'p13-confident',
    pascalName: 'P13_Confident',
    title: 'Confident',
    description: 'Tangan menyilang atau posisi tubuh percaya diri',
    emotion: 'confident',
    expression: 'waspada',
    gesture: 'lengan menyilang penuh percaya diri',
    animationType: 'talking-gesture',
    bodyTiltDeg: -0.8,
    defaultDurationMs: 2500,
  },
  {
    poseId: 'P14',
    fileSlug: 'p14-explaining',
    pascalName: 'P14_Explaining',
    title: 'Explaining',
    description: 'Satu tangan bergerak menjelaskan sesuatu',
    emotion: 'explaining',
    expression: 'netral',
    gesture: 'satu tangan menjelaskan dengan terbuka',
    animationType: 'talking-gesture',
    bodyTiltDeg: -1.0,
    defaultDurationMs: 2500,
  },
  {
    poseId: 'P15',
    fileSlug: 'p15-pointing',
    pascalName: 'P15_Pointing',
    title: 'Pointing',
    description: 'Menunjuk ke arah objek atau papan di sekitarnya',
    emotion: 'pointing',
    expression: 'waspada',
    gesture: 'menunjuk ke arah objek atau skema',
    animationType: 'talking-gesture',
    bodyTiltDeg: -1.4,
    defaultDurationMs: 2300,
  },
  {
    poseId: 'P16',
    fileSlug: 'p16-open-invitation',
    pascalName: 'P16_OpenInvitation',
    title: 'Open Invitation',
    description: 'Kedua tangan terbuka mengajak berdiskusi',
    emotion: 'inviting',
    expression: 'lega',
    gesture: 'kedua tangan terbuka mengajak diskusi',
    animationType: 'reassuring-sway',
    bodyTiltDeg: 0.6,
    defaultDurationMs: 2600,
  },
  {
    poseId: 'P17',
    fileSlug: 'p17-listening',
    pascalName: 'P17_Listening',
    title: 'Listening',
    description: 'Gestur mendengarkan dengan perhatian',
    emotion: 'listening',
    expression: 'netral',
    gesture: 'anggukan ringan menyimak pembicaraan',
    animationType: 'listening-nod',
    bodyTiltDeg: 1.2,
    defaultDurationMs: 2800,
  },
  {
    poseId: 'P18',
    fileSlug: 'p18-reassuring',
    pascalName: 'P18_Reassuring',
    title: 'Reassuring',
    description: 'Senyum menenangkan dengan satu tangan terbuka',
    emotion: 'reassuring',
    expression: 'lega',
    gesture: 'satu tangan terbuka menenangkan',
    animationType: 'reassuring-sway',
    bodyTiltDeg: 0.8,
    defaultDurationMs: 2600,
  },
  {
    poseId: 'P19',
    fileSlug: 'p19-shy',
    pascalName: 'P19_Shy',
    title: 'Shy',
    description: 'Senyum malu dengan arah pandangan sedikit menghindar',
    emotion: 'shy',
    expression: 'menunduk',
    gesture: 'senyum malu dengan pandangan menepi',
    animationType: 'subtle-idle',
    bodyTiltDeg: 2.0,
    defaultDurationMs: 2600,
  },
  {
    poseId: 'P20',
    fileSlug: 'p20-serious-focus',
    pascalName: 'P20_SeriousFocus',
    title: 'Serious Focus',
    description: 'Ekspresi serius dan fokus terhadap pembicaraan',
    emotion: 'focused',
    expression: 'waspada',
    gesture: 'postur tegap dan tatapan fokus serius',
    animationType: 'talking-gesture',
    bodyTiltDeg: 0,
    defaultDurationMs: 2600,
  },
];

export const POSE_BY_ID: Readonly<Record<PoseId, PoseCatalogEntry>> = Object.fromEntries(
  POSE_CATALOG.map((p) => [p.poseId, p])
) as Readonly<Record<PoseId, PoseCatalogEntry>>;

export interface CharacterPoseProfile {
  studentId: string;
  slug: string;
  name: string;
  shortName: string;
  typeTag: string;
  personalityMotion: PersonalityMotionArchetype;
  skinHex: string;
  sleeveHex: string;
  hairHex: string;
  /** Skala intensitas gerak berdasarkan kepribadian asli (0.65..1.25) */
  gestureAmplitude: number;
}

const ARCHETYPE_BY_ID: Readonly<Record<string, PersonalityMotionArchetype>> = {
  'mhs-01': 'confident',
  'mhs-02': 'quiet',
  'mhs-03': 'empathetic',
  'mhs-04': 'analytical',
  'mhs-05': 'expressive',
  'mhs-06': 'quiet',
  'mhs-07': 'confident',
  'mhs-08': 'empathetic',
  'mhs-09': 'confident',
  'mhs-10': 'quiet',
  'mhs-11': 'analytical',
  'mhs-12': 'empathetic',
  'mhs-13': 'quiet',
  'mhs-14': 'empathetic',
  'mhs-15': 'expressive',
  'mhs-16': 'expressive',
  'mhs-17': 'analytical',
  'mhs-18': 'expressive',
};

const AMPLITUDE_BY_ARCHETYPE: Readonly<Record<PersonalityMotionArchetype, number>> = {
  quiet: 0.72,
  analytical: 0.85,
  empathetic: 0.95,
  confident: 1.05,
  expressive: 1.2,
};

export const CHARACTER_POSE_PROFILES: readonly CharacterPoseProfile[] = STUDENT_BLUEPRINTS.map(
  (bp) => {
    const firstName = bp.name.split(' ')[0];
    const slug = firstName.toLowerCase();
    const bg = STUDENT_BACKGROUNDS[bp.id];
    const app = STUDENT_APPEARANCES[bp.id];
    const skin = SKIN_TONES.find((s) => s.id === app?.body.skinId)?.base ?? '#eab98f';
    const sleeve = IDENTITY_COLORS[app?.outfit.topColor ?? 'navy']?.base ?? '#1f3a5f';
    const hair = HAIR_COLORS.find((h) => h.id === app?.hair.colorId)?.base ?? '#1e1a1a';
    const archetype = ARCHETYPE_BY_ID[bp.id] ?? 'empathetic';

    return {
      studentId: bp.id,
      slug,
      name: bp.name,
      shortName: firstName,
      typeTag: bg?.typeTag ?? 'Mahasiswa Vokasi',
      personalityMotion: archetype,
      skinHex: skin,
      sleeveHex: sleeve,
      hairHex: hair,
      gestureAmplitude: AMPLITUDE_BY_ARCHETYPE[archetype],
    };
  }
);

const PROFILE_BY_STUDENT_ID: Readonly<Record<string, CharacterPoseProfile>> = Object.fromEntries(
  CHARACTER_POSE_PROFILES.map((p) => [p.studentId, p])
);

export function getCharacterPoseProfile(studentId: string): CharacterPoseProfile | null {
  return PROFILE_BY_STUDENT_ID[studentId] ?? null;
}

export function getPoseAssetPath(studentId: string, poseId: PoseId): string | null {
  const prof = getCharacterPoseProfile(studentId);
  const pose = POSE_BY_ID[poseId];
  if (!prof || !pose) return null;
  return `/assets/characters/${prof.slug}/poses/${pose.fileSlug}.png`;
}

export interface DialoguePoseResolution {
  speakerId: string;
  emotion: PoseEmotion;
  expression: StoryExpression;
  poseId: PoseId;
  gesture: string;
  animationType: PoseAnimationType;
  transition: 'crossfade-smooth' | 'reaction-snap' | 'calm-settle';
  intensity: number;
  duration: number;
}

export interface ResolveDialoguePoseInput {
  speakerId: string;
  expression: StoryExpression;
  dialogueText?: string;
  isSpeaker: boolean;
  isListening?: boolean;
  reactionKind?: 'tepat' | 'salah' | null;
  previousPoseId?: PoseId | null;
}

/**
 * Menentukan pose P01–P20, emosi, jenis animasi, dan transisi secara deterministik
 * berdasarkan konteks dialog, ekspresi cerita, status pembicara/pendengar, dan kepribadian karakter.
 */
export function resolveDialoguePose(input: ResolveDialoguePoseInput): DialoguePoseResolution {
  const profile = getCharacterPoseProfile(input.speakerId);
  const amplitude = profile?.gestureAmplitude ?? 1.0;
  const text = (input.dialogueText ?? '').toLowerCase();

  // 1. Jika sedang dalam mode mendengarkan (lawan bicara yang berbicara)
  if (!input.isSpeaker || input.isListening) {
    let listenPose: PoseId = 'P17';
    if (input.expression === 'cemas' || input.expression === 'waspada') {
      listenPose = input.previousPoseId === 'P09' ? 'P09' : 'P17';
    } else if (input.expression === 'menunduk' || input.expression === 'menutup-diri') {
      listenPose = profile?.personalityMotion === 'quiet' ? 'P19' : 'P10';
    } else if (input.expression === 'tersenyum' || input.expression === 'lega') {
      listenPose = 'P02';
    }
    const meta = POSE_BY_ID[listenPose];
    return {
      speakerId: input.speakerId,
      emotion: meta.emotion,
      expression: input.expression,
      poseId: listenPose,
      gesture: meta.gesture,
      animationType: meta.animationType,
      transition: 'calm-settle',
      intensity: Number((0.75 * amplitude).toFixed(2)),
      duration: meta.defaultDurationMs,
    };
  }

  // 2. Reaksi langsung terhadap respons konselor (+12% tepat / -14% salah)
  if (input.reactionKind === 'tepat') {
    const poseId: PoseId =
      profile?.personalityMotion === 'expressive' ? 'P04' : 'P18';
    const meta = POSE_BY_ID[poseId];
    return {
      speakerId: input.speakerId,
      emotion: meta.emotion,
      expression: input.expression,
      poseId,
      gesture: meta.gesture,
      animationType: 'excited-reaction',
      transition: 'reaction-snap',
      intensity: Number((1.1 * amplitude).toFixed(2)),
      duration: meta.defaultDurationMs,
    };
  }
  if (input.reactionKind === 'salah') {
    const poseId: PoseId =
      profile?.personalityMotion === 'confident' ? 'P12' : 'P09';
    const meta = POSE_BY_ID[poseId];
    return {
      speakerId: input.speakerId,
      emotion: meta.emotion,
      expression: input.expression,
      poseId,
      gesture: meta.gesture,
      animationType: 'surprise-transition',
      transition: 'reaction-snap',
      intensity: Number((1.0 * amplitude).toFixed(2)),
      duration: meta.defaultDurationMs,
    };
  }

  // 3. Pemetaan berbasis isi teks dialog (konteks semantik)
  let chosenPose: PoseId | null = null;

  if (/\b(berhasil|sukses|mantap|hore|yeay|menang|siap jalan|selesai proyek)\b/.test(text)) {
    chosenPose = 'P04'; // Excited
  } else if (/\b(tertawa|haha|hehe|lucu|senang sekali)\b/.test(text)) {
    chosenPose = 'P03'; // Happy Laugh
  } else if (/\b(kelelahan|capek|lelah|letih|kurang tidur|ngantuk|habis tenaga)\b/.test(text)) {
    chosenPose = 'P11'; // Exhausted
  } else if (/\b(benarkah|serius\?|kok bisa|baru tahu|kaget|astaga|hah\?)\b/.test(text)) {
    chosenPose = 'P08'; // Surprised
  } else if (/\b(membagi pekerjaan|menurutku|solusinya|strategi|langkah|rencana|jelaskan|begini)\b/.test(text)) {
    chosenPose = profile?.personalityMotion === 'confident' ? 'P13' : 'P14'; // Confident / Explaining
  } else if (/\b(lihat|sebelah sana|papan|skema|alat itu|di meja|tunjukkan)\b/.test(text)) {
    chosenPose = 'P15'; // Pointing
  } else if (/\b(mari diskusi|ayo bahas|silakan|terbuka|bareng|bersama-sama)\b/.test(text)) {
    chosenPose = 'P16'; // Open Invitation
  } else if (/\b(tenang|tidak apa-apa|jangan khawatir|pelan-pelan|aku mengerti)\b/.test(text)) {
    chosenPose = 'P18'; // Reassuring
  } else if (/\b(bingung|maksudnya|kurang paham|gimana ya)\b/.test(text)) {
    chosenPose = 'P07'; // Confused
  } else if (/\b(penasaran|kenapa|bagaimana kalau|coba pikir)\b/.test(text)) {
    chosenPose = text.includes('?') ? 'P06' : 'P05'; // Curious / Thinking
  } else if (/\b(malu|sungkan|maaf merepotkan|canggung|grogi)\b/.test(text)) {
    chosenPose = 'P19'; // Shy
  }

  // 4. Fallback ke pemetaan ekspresi resmi cerita (StoryExpression) + kepribadian
  if (!chosenPose) {
    switch (input.expression) {
      case 'tersenyum':
        chosenPose = profile?.personalityMotion === 'expressive' ? 'P04' : 'P02';
        break;
      case 'lega':
        chosenPose = 'P18';
        break;
      case 'terkejut':
        chosenPose = 'P08';
        break;
      case 'tertegun':
        chosenPose = text.includes('?') ? 'P06' : 'P05';
        break;
      case 'cemas':
        chosenPose = 'P09';
        break;
      case 'menunduk':
        chosenPose = profile?.personalityMotion === 'quiet' ? 'P19' : 'P10';
        break;
      case 'lelah':
        chosenPose = 'P11';
        break;
      case 'kesal':
        chosenPose = 'P12';
        break;
      case 'menutup-diri':
        chosenPose = 'P10';
        break;
      case 'waspada':
        chosenPose = profile?.personalityMotion === 'confident' ? 'P20' : 'P06';
        break;
      case 'netral':
      default:
        // Hindari selalu kembali ke pose netral P01 saat sedang berbicara aktif
        chosenPose = input.previousPoseId && input.previousPoseId !== 'P01'
          ? 'P14'
          : profile?.personalityMotion === 'quiet'
            ? 'P01'
            : 'P14';
        break;
    }
  }

  const meta = POSE_BY_ID[chosenPose];
  const transition =
    chosenPose === 'P08' || chosenPose === 'P04'
      ? 'reaction-snap'
      : 'crossfade-smooth';

  return {
    speakerId: input.speakerId,
    emotion: meta.emotion,
    expression: input.expression,
    poseId: chosenPose,
    gesture: meta.gesture,
    animationType: meta.animationType,
    transition,
    intensity: Number(amplitude.toFixed(2)),
    duration: meta.defaultDurationMs,
  };
}
