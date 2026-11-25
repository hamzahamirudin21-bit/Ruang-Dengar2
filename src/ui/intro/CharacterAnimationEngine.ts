import { ComicActionState, PanelActorSpec } from './StoryTimeline';

export interface CharacterSkeletalPose {
  action: ComicActionState;
  /** Posisi X aktual di kanvas (0..1) setelah interpolasi jalan */
  xNorm: number;
  yNorm: number;
  facingSign: 1 | -1;
  /** Offset vertikal panggul/tubuh saat melangkah atau bernapas (px) */
  hipBobPx: number;
  /** Kemiringan batang tubuh (radian) */
  torsoLeanRad: number;
  /** Rotasi kepala (radian) & anggukan vertikal (px) */
  headTiltRad: number;
  headNodPx: number;
  /** Sudut paha & lutut kiri/kanan (radian) untuk siklus jalan & berdiri */
  leftThighRad: number;
  leftKneeRad: number;
  rightThighRad: number;
  rightKneeRad: number;
  /** Sudut lengan atas & lengan bawah kiri/kanan (radian) untuk interaksi alat */
  leftUpperArmRad: number;
  leftForearmRad: number;
  rightUpperArmRad: number;
  rightForearmRad: number;
  /** Bukaan kelopak mata (0 = berkedip tertutup, 1 = terbuka penuh) */
  eyeOpen01: number;
  /** Bukaan mulut saat berbicara (0 = tertutup, 1 = terbuka vokal) */
  mouthOpen01: number;
  /** Intensitas aksi alat (0..1), mis. percikan solder/las atau ketikan */
  toolPulse01: number;
  /** Fase langkah (0..2π) */
  stridePhaseRad: number;
}

export interface CloseupFeetPose {
  stepCycleRad: number;
  leftShoeXNorm: number;
  leftShoeYNorm: number;
  leftShoeAngleRad: number;
  rightShoeXNorm: number;
  rightShoeYNorm: number;
  rightShoeAngleRad: number;
  dustPuff01: number;
}

export interface CloseupHandDoorPose {
  reachProgress01: number;
  handXNorm: number;
  handYNorm: number;
  wristAngleRad: number;
  handlePressRad: number;
  latchClicked: boolean;
  clickSpark01: number;
}

/**
 * Menghitung kinematika rangka 2D karakter (kaki, lutut, ayunan lengan, posisi tubuh,
 * gerakan kepala, kedipan mata, dan sinkronisasi mulut) secara nyata pada waktu `pageElapsedMs`.
 */
export function computeCharacterSkeletalPose(
  actor: PanelActorSpec,
  pageElapsedMs: number,
  pageDurationMs: number,
  isSpeaking: boolean,
  reducedMotion = false
): CharacterSkeletalPose {
  const facingSign: 1 | -1 = actor.facing === 'left' ? -1 : 1;
  const seedPhase =
    actor.characterId.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) * 0.37;

  if (reducedMotion) {
    return {
      action: actor.action,
      xNorm: actor.walkToXNorm !== undefined ? (actor.xNorm + actor.walkToXNorm) * 0.5 : actor.xNorm,
      yNorm: actor.yNorm,
      facingSign,
      hipBobPx: 0,
      torsoLeanRad: 0,
      headTiltRad: 0,
      headNodPx: 0,
      leftThighRad: -0.06,
      leftKneeRad: 0.05,
      rightThighRad: 0.06,
      rightKneeRad: 0.05,
      leftUpperArmRad: 0.25,
      leftForearmRad: -0.35,
      rightUpperArmRad: -0.35,
      rightForearmRad: -0.55,
      eyeOpen01: 1,
      mouthOpen01: isSpeaking ? 0.45 : 0,
      toolPulse01: 0.5,
      stridePhaseRad: 0,
    };
  }

  const tSec = Math.max(0, pageElapsedMs) / 1000;
  const pageProgress = Math.max(0, Math.min(1, pageElapsedMs / Math.max(1, pageDurationMs)));

  // Kedipan mata alami setiap ~3.4 detik
  const blinkCycle = (tSec + seedPhase) % 3.4;
  const eyeOpen01 =
    blinkCycle > 3.22 && blinkCycle < 3.36
      ? Math.max(0.08, Math.abs(blinkCycle - 3.29) / 0.07)
      : 1;

  // Gerakan mulut suku kata saat karakter sedang berbicara
  const mouthOpen01 = isSpeaking
    ? Math.max(0.08, Math.min(1, 0.5 + 0.45 * Math.sin(tSec * 15.5 + seedPhase) * Math.cos(tSec * 7.2)))
    : 0;

  let xNorm = actor.xNorm;
  let hipBobPx = Math.sin(tSec * 2.4 + seedPhase) * 1.4;
  let torsoLeanRad = 0;
  let headTiltRad = Math.sin(tSec * 1.8 + seedPhase) * 0.035;
  let headNodPx = Math.cos(tSec * 2.4 + seedPhase) * 1.0;

  let leftThighRad = -0.07;
  let leftKneeRad = 0.06;
  let rightThighRad = 0.07;
  let rightKneeRad = 0.06;

  let leftUpperArmRad = 0.22;
  let leftForearmRad = -0.28;
  let rightUpperArmRad = -0.22;
  let rightForearmRad = -0.32;
  let toolPulse01 = 0.5 + 0.5 * Math.sin(tSec * 6 + seedPhase);
  let stridePhaseRad = 0;

  switch (actor.action) {
    case 'walk-campus':
    case 'walk-corridor': {
      const targetX = actor.walkToXNorm ?? Math.min(0.9, actor.xNorm + 0.22);
      const smoothP = pageProgress < 0.5
        ? 2 * pageProgress * pageProgress
        : 1 - Math.pow(-2 * pageProgress + 2, 2) / 2;
      xNorm = actor.xNorm + (targetX - actor.xNorm) * smoothP;

      // Siklus jalan 2 langkah penuh per detik
      const freq = actor.action === 'walk-corridor' ? 7.2 : 6.4;
      stridePhaseRad = tSec * freq + seedPhase;
      const s = Math.sin(stridePhaseRad);
      const c = Math.cos(stridePhaseRad);

      // Pergantian frame paha & tekukan lutut nyata
      leftThighRad = s * 0.46;
      leftKneeRad = Math.max(0.05, -c * 0.38 + 0.22);
      rightThighRad = -s * 0.46;
      rightKneeRad = Math.max(0.05, c * 0.38 + 0.22);

      // Ayunan tangan berlawanan dengan kaki
      leftUpperArmRad = -s * 0.38;
      leftForearmRad = -0.28 - Math.max(0, s) * 0.25;
      rightUpperArmRad = s * 0.38;
      rightForearmRad = -0.28 - Math.max(0, -s) * 0.25;

      // Perubahan posisi vertikal tubuh & kepala ringan saat melangkah
      hipBobPx = Math.abs(s) * -4.5;
      torsoLeanRad = 0.055;
      headTiltRad = s * 0.04;
      headNodPx = Math.cos(stridePhaseRad * 2) * 1.6;
      break;
    }

    case 'solder-pcb': {
      // Condong ke meja praktikum, tangan kanan memegang solder dengan gerakan presisi
      torsoLeanRad = 0.14;
      headTiltRad = 0.16 + Math.sin(tSec * 3.2) * 0.03;
      headNodPx = 2.5 + Math.sin(tSec * 4.5) * 1.2;
      leftUpperArmRad = -0.45;
      leftForearmRad = -0.68 + Math.sin(tSec * 2.8) * 0.06; // memegang timah/PCB
      rightUpperArmRad = -0.62 + Math.sin(tSec * 5.4) * 0.08;
      rightForearmRad = -0.78 + Math.cos(tSec * 7.5) * 0.11; // menyentuhkan ujung solder
      toolPulse01 = Math.max(0, Math.sin(tSec * 8.5 + seedPhase));
      break;
    }

    case 'probe-oscilloscope': {
      torsoLeanRad = 0.08;
      headTiltRad = 0.06 + Math.sin(tSec * 2.2) * 0.05;
      leftUpperArmRad = -0.32;
      leftForearmRad = -0.55;
      rightUpperArmRad = -0.78 + Math.sin(tSec * 3.1) * 0.09;
      rightForearmRad = -0.62 + Math.cos(tSec * 4.2) * 0.1;
      toolPulse01 = 0.5 + 0.5 * Math.sin(tSec * 10);
      break;
    }

    case 'typing-firmware': {
      // Gerakan kedua lengan bawah mengetik cepat di atas keyboard + kepala memindai monitor ganda
      torsoLeanRad = 0.09;
      headTiltRad = Math.sin(tSec * 2.1 + seedPhase) * 0.09; // melihat kiri-kanan layar kode
      headNodPx = 1.2;
      leftUpperArmRad = -0.42;
      leftForearmRad = -0.72 + Math.sin(tSec * 18.0 + seedPhase) * 0.12;
      rightUpperArmRad = -0.46;
      rightForearmRad = -0.74 + Math.cos(tSec * 19.5 + seedPhase) * 0.12;
      toolPulse01 = 0.5 + 0.5 * Math.sin(tSec * 16);
      break;
    }

    case 'operate-3d-printer': {
      torsoLeanRad = 0.06;
      headTiltRad = 0.08 + Math.sin(tSec * 2.6) * 0.05;
      leftUpperArmRad = -0.25;
      leftForearmRad = -0.48;
      rightUpperArmRad = -0.72 + Math.sin(tSec * 3.4) * 0.12;
      rightForearmRad = -0.52 + Math.cos(tSec * 3.4) * 0.1;
      toolPulse01 = (tSec * 0.85) % 1;
      break;
    }

    case 'weld-k3': {
      // Kuda-kuda kokoh K3, kedua tangan menahan stang las dengan getaran busur listrik
      leftThighRad = -0.14;
      rightThighRad = 0.16;
      torsoLeanRad = 0.15;
      headTiltRad = 0.18;
      const tremor = Math.sin(tSec * 28) * 0.03;
      leftUpperArmRad = -0.55;
      leftForearmRad = -0.75 + tremor;
      rightUpperArmRad = -0.68 + Math.sin(tSec * 4.2) * 0.06;
      rightForearmRad = -0.82 + tremor;
      toolPulse01 = 0.4 + 0.6 * Math.abs(Math.sin(tSec * 14 + seedPhase));
      break;
    }

    case 'inspect-instrument': {
      torsoLeanRad = 0.05;
      headTiltRad = 0.09 + Math.sin(tSec * 2.0) * 0.04;
      leftUpperArmRad = -0.35;
      leftForearmRad = -0.65;
      rightUpperArmRad = -0.52 + Math.sin(tSec * 2.8) * 0.08;
      rightForearmRad = -0.74;
      break;
    }

    case 'discuss-point': {
      // Gestur tangan aktif menunjuk skema/layar saat berdiskusi
      const gestureWave = Math.sin(tSec * 3.8 + seedPhase);
      torsoLeanRad = 0.04 * gestureWave;
      headTiltRad = 0.06 * Math.cos(tSec * 3.0 + seedPhase);
      leftUpperArmRad = -0.22 + gestureWave * 0.08;
      leftForearmRad = -0.45;
      rightUpperArmRad = -0.82 + gestureWave * 0.18;
      rightForearmRad = -0.55 + Math.cos(tSec * 4.5) * 0.16;
      break;
    }

    case 'read-schematic': {
      torsoLeanRad = 0.07;
      headTiltRad = 0.12 + Math.sin(tSec * 1.9) * 0.04;
      leftUpperArmRad = -0.48;
      leftForearmRad = -0.82;
      rightUpperArmRad = -0.44;
      rightForearmRad = -0.76 + Math.sin(tSec * 3.6) * 0.08;
      break;
    }

    case 'drive-rover': {
      torsoLeanRad = 0.05;
      headTiltRad = 0.05 + Math.sin(tSec * 3.2) * 0.05;
      leftUpperArmRad = -0.46;
      leftForearmRad = -0.72;
      rightUpperArmRad = -0.50;
      rightForearmRad = -0.76 + Math.sin(tSec * 7.5) * 0.09;
      toolPulse01 = (tSec * 0.55) % 1;
      break;
    }

    case 'mentor-guide': {
      const wave = Math.sin(tSec * 2.8 + seedPhase);
      torsoLeanRad = 0.03;
      headTiltRad = wave * 0.05;
      leftUpperArmRad = -0.38;
      leftForearmRad = -0.75; // memegang clipboard
      rightUpperArmRad = -0.68 + wave * 0.14;
      rightForearmRad = -0.48 + wave * 0.12;
      break;
    }

    case 'community-wave': {
      const wave = Math.sin(tSec * 5.2 + seedPhase);
      hipBobPx = Math.sin(tSec * 3.0 + seedPhase) * -2.2;
      headTiltRad = wave * 0.06;
      leftUpperArmRad = 0.18;
      leftForearmRad = -0.25;
      rightUpperArmRad = -1.25 + wave * 0.18;
      rightForearmRad = -0.65 + Math.cos(tSec * 5.2 + seedPhase) * 0.26;
      break;
    }
  }

  return {
    action: actor.action,
    xNorm,
    yNorm: actor.yNorm,
    facingSign,
    hipBobPx,
    torsoLeanRad,
    headTiltRad,
    headNodPx,
    leftThighRad,
    leftKneeRad,
    rightThighRad,
    rightKneeRad,
    leftUpperArmRad,
    leftForearmRad,
    rightUpperArmRad,
    rightForearmRad,
    eyeOpen01,
    mouthOpen01,
    toolPulse01,
    stridePhaseRad,
  };
}

/**
 * Animasi khusus Panel Close-Up Langkah Kaki (PAGE 2 — Panel 2B: TAP... TAP...)
 */
export function computeCloseupFeetPose(
  pageElapsedMs: number,
  reducedMotion = false
): CloseupFeetPose {
  if (reducedMotion) {
    return {
      stepCycleRad: 0.6,
      leftShoeXNorm: 0.34,
      leftShoeYNorm: 0.72,
      leftShoeAngleRad: -0.12,
      rightShoeXNorm: 0.64,
      rightShoeYNorm: 0.78,
      rightShoeAngleRad: 0.04,
      dustPuff01: 0.5,
    };
  }
  const tSec = Math.max(0, pageElapsedMs) / 1000;
  const cycle = tSec * 5.6;
  const s = Math.sin(cycle);
  const c = Math.cos(cycle);

  return {
    stepCycleRad: cycle,
    leftShoeXNorm: 0.34 + s * 0.11,
    leftShoeYNorm: 0.76 - Math.max(0, c) * 0.12,
    leftShoeAngleRad: -c * 0.22,
    rightShoeXNorm: 0.62 - s * 0.11,
    rightShoeYNorm: 0.76 - Math.max(0, -c) * 0.12,
    rightShoeAngleRad: c * 0.22,
    dustPuff01: Math.max(0, Math.abs(s) - 0.5) * 2,
  };
}

/**
 * Animasi khusus Panel Close-Up Tangan Meraih & Menekan Gagang Pintu (PAGE 2 — Panel 2C: KLIK!)
 */
export function computeCloseupHandDoorPose(
  panelElapsedMs: number,
  reducedMotion = false
): CloseupHandDoorPose {
  if (reducedMotion) {
    return {
      reachProgress01: 1,
      handXNorm: 0.54,
      handYNorm: 0.52,
      wristAngleRad: 0.24,
      handlePressRad: 0.38,
      latchClicked: true,
      clickSpark01: 0.8,
    };
  }
  const tSec = Math.max(0, panelElapsedMs) / 1000;
  // 0.0s..0.7s tangan meraih gagang; 0.7s..1.4s menekan tuas ke bawah -> KLIK!
  const reachProgress01 = Math.max(0, Math.min(1, tSec / 0.75));
  const pressPhase = Math.max(0, Math.min(1, (tSec - 0.65) / 0.55));
  const handlePressRad = pressPhase * 0.42;
  const latchClicked = pressPhase > 0.55;
  const clickSpark01 = latchClicked ? 0.5 + 0.5 * Math.sin(tSec * 14) : 0;

  return {
    reachProgress01,
    handXNorm: 0.22 + reachProgress01 * 0.32,
    handYNorm: 0.64 - reachProgress01 * 0.12 + pressPhase * 0.05,
    wristAngleRad: -0.15 + pressPhase * 0.36,
    handlePressRad,
    latchClicked,
    clickSpark01,
  };
}
