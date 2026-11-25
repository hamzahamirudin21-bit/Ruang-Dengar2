import {
  HAIR_COLORS,
  IDENTITY_COLORS,
  SKIN_TONES,
  type IdentityColorId,
} from '../characters/characterPalette';
import { CharacterSkeletalPose } from './CharacterAnimationEngine';
import {
  ComicCharacterProfile,
  PanelActorSpec,
  getCharacterProfile,
} from './StoryTimeline';

export interface RenderedActorAnchor {
  characterId: string;
  name: string;
  orderNumber: string;
  /** Posisi X mulut karakter dalam koordinat piksel kanvas */
  mouthX: number;
  /** Posisi Y mulut karakter dalam koordinat piksel kanvas */
  mouthY: number;
  /** Posisi Y puncak kepala dalam koordinat piksel kanvas */
  headTopY: number;
  /** Posisi X pusat tubuh dalam koordinat piksel kanvas */
  centerX: number;
  /** Posisi normalisasi (0..1) untuk penargetan ekor balon dialog */
  xNorm?: number;
  yNorm?: number;
}

const characterImageCache = new Map<string, HTMLImageElement>();
const characterLoadListeners = new Set<() => void>();

export function onCharacterAssetLoaded(cb: () => void): () => void {
  characterLoadListeners.add(cb);
  return () => {
    characterLoadListeners.delete(cb);
  };
}

function getOrLoadCharacterCutout(url: string): HTMLImageElement | null {
  if (!url || typeof window === 'undefined' || typeof Image === 'undefined') return null;
  const cached = characterImageCache.get(url);
  if (cached) {
    return cached.complete && cached.naturalWidth > 0 ? cached : null;
  }
  const img = new Image();
  img.onload = () => {
    characterLoadListeners.forEach((fn) => fn());
  };
  img.src = url;
  characterImageCache.set(url, img);
  return null;
}

function getSkinColor(skinId: string): { base: string; shade: string } {
  return SKIN_TONES.find((s) => s.id === skinId) ?? SKIN_TONES[1];
}

function getHairColor(colorId: string): { base: string; shade: string } {
  return HAIR_COLORS.find((h) => h.id === colorId) ?? HAIR_COLORS[0];
}

function getOutfitColor(colorId: IdentityColorId | undefined, fallback: IdentityColorId = 'navy') {
  return IDENTITY_COLORS[colorId ?? fallback] ?? IDENTITY_COLORS.navy;
}

function drawRoundedLimb(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  thickness: number,
  fill: string,
  outline = '#141824'
): void {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = outline;
  ctx.lineWidth = thickness + 3.2;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();

  ctx.strokeStyle = fill;
  ctx.lineWidth = thickness;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.restore();
}

/**
 * Merender karakter 2D anime bertubuh penuh (full-body articulated character) langsung di atas
 * kanvas lingkungan laboratorium sesuai identitas asli database (wajah, gaya rambut/hijab,
 * kacamata/headphone/helm las, pakaian/jaket/rompi/apron, gerakan kaki, ayunan tangan, dan alat).
 * TIDAK menggunakan kartu potret kotak.
 */
export function renderFullBodyComicCharacter(
  ctx: CanvasRenderingContext2D,
  actor: PanelActorSpec,
  pose: CharacterSkeletalPose,
  canvasWidth: number,
  canvasHeight: number
): RenderedActorAnchor {
  const profile: ComicCharacterProfile = getCharacterProfile(actor.characterId);
  const app = profile.appearance;
  const skin = getSkinColor(app.body.skinId);
  const hair = getHairColor(app.hair.colorId);
  const topTone = getOutfitColor(app.outfit.topColor, 'navy');
  const accentTone = getOutfitColor(app.outfit.topAccent, 'mustard');
  const bottomTone = getOutfitColor(app.outfit.bottomColor, 'navy');
  const shoeTone = getOutfitColor(app.outfit.shoeColor, 'maroon');

  const baseHeight = Math.min(canvasHeight * 0.56, 210) * actor.scale;
  const unit = baseHeight / 100;

  const footX = pose.xNorm * canvasWidth;
  const footY = pose.yNorm * canvasHeight;
  const dir = pose.facingSign;

  // Bayangan kontak lantai oval 2D
  ctx.save();
  ctx.fillStyle = 'rgba(9, 13, 22, 0.36)';
  ctx.beginPath();
  ctx.ellipse(footX, footY + 2 * unit, 18 * unit, 5.5 * unit, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Posisi panggul & bahu
  const hipX = footX + Math.sin(pose.torsoLeanRad) * 6 * unit * dir;
  const hipY = footY - 38 * unit + pose.hipBobPx * unit * 0.6;
  const torsoLen = 28 * unit;
  const shoulderX = hipX + Math.sin(pose.torsoLeanRad) * torsoLen * dir;
  const shoulderY = hipY - Math.cos(pose.torsoLeanRad) * torsoLen;

  const cutoutImg = getOrLoadCharacterCutout(profile.portraitUrl);

  // ==========================================================================
  // 1. KAKI BELAKANG & KAKI DEPAN (Artikulasi Paha, Lutut, Betis & Sepatu)
  // ==========================================================================
  const thighLen = 19 * unit;
  const calfLen = 19 * unit;

  const renderLeg = (thighRad: number, kneeRad: number, hipOffsetX: number, isBack: boolean) => {
    const hx = hipX + hipOffsetX * unit * dir;
    const hy = hipY;
    const kx = hx + Math.sin(thighRad) * thighLen * dir;
    const ky = hy + Math.cos(thighRad) * thighLen;
    const ax = kx + Math.sin(thighRad - kneeRad * 0.7) * calfLen * dir;
    const ay = ky + Math.cos(thighRad - kneeRad * 0.7) * calfLen;

    const legColor = isBack ? bottomTone.shade : bottomTone.base;
    drawRoundedLimb(ctx, hx, hy, kx, ky, 8.5 * unit, legColor);
    drawRoundedLimb(ctx, kx, ky, ax, ay, 7.5 * unit, legColor);

    // Sepatu / Sneakers / Bot K3
    ctx.save();
    ctx.translate(ax, ay);
    ctx.fillStyle = isBack ? shoeTone.shade : shoeTone.base;
    ctx.strokeStyle = '#141824';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(-5 * unit, -3 * unit, 14 * unit * dir, 7 * unit, 3 * unit);
    ctx.fill();
    ctx.stroke();
    // Sol sepatu terang
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(
      dir > 0 ? -5 * unit : -9 * unit,
      2.2 * unit,
      14 * unit,
      1.8 * unit
    );
    ctx.restore();
  };

  renderLeg(pose.leftThighRad, pose.leftKneeRad, -3.5, true);

  // Bila karakter mengenakan rok / tunik panjang, gambar siluet rok di atas pangkal paha
  if (app.outfit.bottom === 'rok') {
    ctx.save();
    ctx.fillStyle = bottomTone.base;
    ctx.strokeStyle = '#141824';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(hipX - 11 * unit, hipY - 2 * unit);
    ctx.lineTo(hipX + 11 * unit, hipY - 2 * unit);
    ctx.lineTo(hipX + 14 * unit, hipY + 18 * unit);
    ctx.lineTo(hipX - 14 * unit, hipY + 18 * unit);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  renderLeg(pose.rightThighRad, pose.rightKneeRad, 3.5, false);

  const headRadius = 13.5 * unit;
  const headX = shoulderX + Math.sin(pose.headTiltRad) * 4 * unit * dir;
  const headY = shoulderY - headRadius * 1.05 + pose.headNodPx * unit * 0.35;
  const upperArmLen = 15 * unit;
  const forearmLen = 15 * unit;

  // ==========================================================================
  // 2A. JIKA ASET CUTOUT ANIME TRANSPARAN TERSEDIA:
  // Gambar tubuh atas & wajah asli karakter (tanpa kotak/bingkai!) menyatu
  // dengan kaki beranimasi di bawahnya dan tangan beranimasi memegang alat di depannya.
  // ==========================================================================
  if (cutoutImg) {
    const drawH = 66 * unit;
    const aspect = cutoutImg.naturalWidth / Math.max(1, cutoutImg.naturalHeight);
    const drawW = drawH * aspect;

    ctx.save();
    ctx.translate(shoulderX, hipY + 6 * unit);
    ctx.rotate(pose.torsoLeanRad * 0.55 * dir);
    if (dir < 0) {
      ctx.scale(-1, 1);
    }
    ctx.drawImage(cutoutImg, -drawW * 0.5, -drawH, drawW, drawH);
    ctx.restore();

    // Helm Las K3 turun menutupi wajah saat Bima (#07) sedang mengelas
    if (app.accessories.includes('helm-las') && pose.action === 'weld-k3') {
      ctx.save();
      ctx.translate(headX, headY - 2 * unit);
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#fb923c';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.roundRect(-headRadius * 0.9, -headRadius * 0.9, headRadius * 1.8, headRadius * 1.7, 5 * unit);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = pose.toolPulse01 > 0.5 ? '#38bdf8' : '#0284c7';
      ctx.fillRect(-3 * unit, -3 * unit, 12 * unit * dir, 5.5 * unit);
      ctx.restore();
    }

    // Lengan & Tangan Artikulasi Aktif di Depan Tubuh (Mengetik, Menyolder, Mengelas, Menunjuk)
    const frontShoulderX = shoulderX + 5 * unit * dir;
    const frontShoulderY = shoulderY + 5 * unit;
    const frontElbowX = frontShoulderX + Math.sin(pose.rightUpperArmRad) * upperArmLen * dir;
    const frontElbowY = frontShoulderY + Math.cos(pose.rightUpperArmRad) * upperArmLen;
    const frontHandX = frontElbowX + Math.cos(pose.rightForearmRad) * forearmLen * dir;
    const frontHandY = frontElbowY + Math.sin(pose.rightForearmRad) * forearmLen;

    drawRoundedLimb(ctx, frontShoulderX, frontShoulderY, frontElbowX, frontElbowY, 6.8 * unit, topTone.base);
    drawRoundedLimb(ctx, frontElbowX, frontElbowY, frontHandX, frontHandY, 6.0 * unit, topTone.light);

    ctx.save();
    ctx.fillStyle = app.accessories.includes('sarung-tangan') ? '#fb923c' : skin.base;
    ctx.strokeStyle = '#141824';
    ctx.lineWidth = 1.9;
    ctx.beginPath();
    ctx.arc(frontHandX, frontHandY, 3.9 * unit, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Tangan kiri tambahan saat mengetik di keyboard atau menyolder PCB
    if (pose.action === 'typing-firmware' || pose.action === 'solder-pcb' || pose.action === 'weld-k3') {
      const leftElbowX = shoulderX - 5 * unit * dir + Math.sin(pose.leftUpperArmRad) * upperArmLen * dir;
      const leftElbowY = frontShoulderY + Math.cos(pose.leftUpperArmRad) * upperArmLen;
      const leftHandX = leftElbowX + Math.cos(pose.leftForearmRad) * forearmLen * dir;
      const leftHandY = leftElbowY + Math.sin(pose.leftForearmRad) * forearmLen;
      drawRoundedLimb(ctx, leftElbowX, leftElbowY, leftHandX, leftHandY, 5.6 * unit, topTone.shade);
      ctx.save();
      ctx.fillStyle = app.accessories.includes('sarung-tangan') ? '#ea580c' : skin.shade;
      ctx.strokeStyle = '#141824';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(leftHandX, leftHandY, 3.6 * unit, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    renderHandToolProp(ctx, actor.toolProp, frontHandX, frontHandY, dir, unit, pose.toolPulse01);

    return {
      characterId: actor.characterId,
      name: profile.name,
      orderNumber: profile.orderNumber,
      mouthX: headX + 4 * unit * dir,
      mouthY: headY + 4 * unit,
      headTopY: headY - headRadius * 1.35,
      centerX: shoulderX,
    };
  }

  // ==========================================================================
  // 2B. FALLBACK VEKTOR PENUH (Sebelum Image selesai dimuat / lingkungan Node)
  // ==========================================================================
  const backShoulderX = shoulderX - 5 * unit * dir;
  const backShoulderY = shoulderY + 3 * unit;
  const backElbowX = backShoulderX + Math.sin(pose.leftUpperArmRad) * upperArmLen * dir;
  const backElbowY = backShoulderY + Math.cos(pose.leftUpperArmRad) * upperArmLen;
  const backHandX = backElbowX + Math.cos(pose.leftForearmRad) * forearmLen * dir;
  const backHandY = backElbowY + Math.sin(pose.leftForearmRad) * forearmLen;

  drawRoundedLimb(ctx, backShoulderX, backShoulderY, backElbowX, backElbowY, 6.8 * unit, topTone.shade);
  drawRoundedLimb(ctx, backElbowX, backElbowY, backHandX, backHandY, 6.0 * unit, topTone.shade);
  ctx.save();
  ctx.fillStyle = skin.shade;
  ctx.strokeStyle = '#141824';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(backHandX, backHandY, 3.8 * unit, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // ==========================================================================
  // 3. BATANG TUBUH & PAKAIAN KHAS (Kemeja, Hoodie, Rompi K3, Apron, Blazer)
  // ==========================================================================
  ctx.save();
  const bodyWidth = app.body.type === 'tegap' ? 24 * unit : app.body.type === 'ramping' ? 19 * unit : 21.5 * unit;
  ctx.fillStyle = topTone.base;
  ctx.strokeStyle = '#141824';
  ctx.lineWidth = 2.6;

  ctx.beginPath();
  ctx.moveTo(shoulderX - bodyWidth * 0.52, shoulderY);
  ctx.lineTo(shoulderX + bodyWidth * 0.52, shoulderY);
  ctx.lineTo(hipX + bodyWidth * 0.46, hipY + 3 * unit);
  ctx.lineTo(hipX - bodyWidth * 0.46, hipY + 3 * unit);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Shading sisi belakang pakaian
  ctx.fillStyle = topTone.shade;
  ctx.beginPath();
  ctx.moveTo(shoulderX - bodyWidth * 0.5 * dir, shoulderY + 1 * unit);
  ctx.lineTo(shoulderX - bodyWidth * 0.15 * dir, shoulderY + 1 * unit);
  ctx.lineTo(hipX - bodyWidth * 0.15 * dir, hipY + 2 * unit);
  ctx.lineTo(hipX - bodyWidth * 0.44 * dir, hipY + 2 * unit);
  ctx.closePath();
  ctx.fill();

  // Detail kerah / rompi / apron / jaket / batik
  if (app.outfit.top === 'rompi' || app.outfit.top === 'apron') {
    ctx.fillStyle = accentTone.base;
    ctx.fillRect(shoulderX - bodyWidth * 0.36, hipY - 12 * unit, bodyWidth * 0.72, 4.5 * unit);
  } else if (app.outfit.top === 'jaket' || app.outfit.top === 'cardigan') {
    // Bukaan tengah blazer/cardigan
    ctx.fillStyle = accentTone.light;
    ctx.fillRect(shoulderX - 2.5 * unit, shoulderY + 2 * unit, 5 * unit, torsoLen - 2 * unit);
  }

  // Lencana ID Card laboratorium bila karakter memilikinya
  if (app.accessories.includes('id-card') || actor.characterId === 'dosen') {
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(shoulderX - 4 * unit, shoulderY + 1 * unit);
    ctx.lineTo(shoulderX, shoulderY + 12 * unit);
    ctx.lineTo(shoulderX + 4 * unit, shoulderY + 1 * unit);
    ctx.stroke();
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(shoulderX - 3.2 * unit, shoulderY + 12 * unit, 6.4 * unit, 8 * unit);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(shoulderX - 3.2 * unit, shoulderY + 12 * unit, 6.4 * unit, 2.4 * unit);
  }
  ctx.restore();

  // ==========================================================================
  // 4. KEPALA, WAJAH EKSPRESIF, RAMBUT/HIJAB & AKSESORI (Kacamata, Helm Las, Headphone)
  // ==========================================================================

  ctx.save();
  ctx.translate(headX, headY);
  ctx.rotate(pose.headTiltRad * 0.45 * dir);

  // Leher
  ctx.fillStyle = skin.shade;
  ctx.fillRect(-3.5 * unit, headRadius * 0.65, 7 * unit, 6 * unit);

  // Tudung Hijab / Rambut Belakang
  if (app.hair.kind === 'kerudung' || app.accessories.includes('hijab')) {
    ctx.fillStyle = topTone.base;
    ctx.strokeStyle = '#141824';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 1 * unit, headRadius * 1.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    // Siluet rambut belakang / kuncir ikat
    ctx.fillStyle = hair.shade;
    ctx.strokeStyle = '#141824';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(-1.5 * unit * dir, -1 * unit, headRadius * 1.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (app.hair.kind === 'ikat') {
      ctx.beginPath();
      ctx.ellipse(-headRadius * 1.15 * dir, 2 * unit, 5.5 * unit, 9 * unit, -0.35 * dir, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  // Wajah Anime Cel-Shaded
  ctx.fillStyle = skin.base;
  ctx.strokeStyle = '#141824';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(0, 0, headRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Poni Rambut / Bingkai Hijab Atas
  ctx.fillStyle = app.hair.kind === 'kerudung' ? topTone.shade : hair.base;
  ctx.beginPath();
  ctx.arc(0, -2.5 * unit, headRadius * 1.02, Math.PI * 0.92, Math.PI * 2.08);
  ctx.fill();

  // Mata Ekspresif (Berkedip nyata sesuai pose.eyeOpen01)
  const eyeOffsetX = 4.2 * unit * dir;
  const eyeLeftX = eyeOffsetX - 3.8 * unit;
  const eyeRightX = eyeOffsetX + 4.4 * unit;
  const eyeY = -0.8 * unit;

  // Alis
  ctx.strokeStyle = hair.shade;
  ctx.lineWidth = 1.9;
  ctx.beginPath();
  ctx.moveTo(eyeLeftX - 2.4 * unit, eyeY - 3.8 * unit);
  ctx.lineTo(eyeLeftX + 2.4 * unit, eyeY - 3.3 * unit);
  ctx.moveTo(eyeRightX - 2.4 * unit, eyeY - 3.3 * unit);
  ctx.lineTo(eyeRightX + 2.4 * unit, eyeY - 3.8 * unit);
  ctx.stroke();

  if (pose.eyeOpen01 < 0.25) {
    // Mata tertutup (berkedip)
    ctx.strokeStyle = '#141824';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(eyeLeftX - 2.4 * unit, eyeY);
    ctx.lineTo(eyeLeftX + 2.4 * unit, eyeY);
    ctx.moveTo(eyeRightX - 2.4 * unit, eyeY);
    ctx.lineTo(eyeRightX + 2.4 * unit, eyeY);
    ctx.stroke();
  } else {
    const eyeH = 3.2 * unit * pose.eyeOpen01;
    for (const ex of [eyeLeftX, eyeRightX]) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(ex, eyeY, 2.5 * unit, eyeH, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.ellipse(ex + 0.4 * unit * dir, eyeY, 1.6 * unit, eyeH * 0.85, 0, 0, Math.PI * 2);
      ctx.fill();
      // Highlight mata anime
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ex - 0.5 * unit, eyeY - 0.8 * unit, 0.7 * unit, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Kacamata / Goggles bila karakter memilikinya
  if (app.accessories.includes('kacamata') || actor.characterId === 'dosen') {
    ctx.strokeStyle = actor.characterId === 'mhs-18' ? '#38bdf8' : '#1e293b';
    ctx.lineWidth = 1.8;
    ctx.strokeRect(eyeLeftX - 3.2 * unit, eyeY - 2.4 * unit, 6.4 * unit, 4.8 * unit);
    ctx.strokeRect(eyeRightX - 3.2 * unit, eyeY - 2.4 * unit, 6.4 * unit, 4.8 * unit);
    ctx.beginPath();
    ctx.moveTo(eyeLeftX + 3.2 * unit, eyeY);
    ctx.lineTo(eyeRightX - 3.2 * unit, eyeY);
    ctx.stroke();
  }

  // Headphone / Penutup Telinga (Kevin #04, Maya #11)
  if (app.accessories.includes('headphone') || app.accessories.includes('penutup-telinga')) {
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.arc(0, -1 * unit, headRadius * 1.12, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(-headRadius * 0.95, 1 * unit, 3 * unit, 5 * unit, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Topi Teknisi (Teguh #10)
  if (app.accessories.includes('topi')) {
    ctx.fillStyle = accentTone.base;
    ctx.strokeStyle = '#141824';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(0, -4 * unit, headRadius * 1.04, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(-2 * unit, -6 * unit, 16 * unit * dir, 3.2 * unit, 1.5 * unit);
    ctx.fill();
    ctx.stroke();
  }

  // Helm Las K3 (Bima #07 saat mengelas)
  if (app.accessories.includes('helm-las') && pose.action === 'weld-k3') {
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#fb923c';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(-headRadius * 0.85, -headRadius * 0.85, headRadius * 1.75, headRadius * 1.65, 5 * unit);
    ctx.fill();
    ctx.stroke();
    // Kaca pelindung las menyala hijau-sian terkena busur las
    ctx.fillStyle = pose.toolPulse01 > 0.5 ? '#38bdf8' : '#0284c7';
    ctx.fillRect(-3 * unit, -3 * unit, 12 * unit * dir, 5.5 * unit);
  }

  // Mulut Beranimasi (sinkron dengan dialog / senyum ekspresif)
  const mouthLocalX = 3.2 * unit * dir;
  const mouthLocalY = 5.4 * unit;
  if (pose.mouthOpen01 > 0.12) {
    ctx.fillStyle = '#9f1239';
    ctx.strokeStyle = '#141824';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(
      mouthLocalX,
      mouthLocalY,
      2.6 * unit,
      (1.2 + pose.mouthOpen01 * 2.6) * unit,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.strokeStyle = '#141824';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(mouthLocalX, mouthLocalY - 1 * unit, 2.6 * unit, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }

  ctx.restore();

  // ==========================================================================
  // 5. LENGAN DEPAN (Kanan) & ALAT PRAKTIKUM AKTIF DI TANGAN
  // ==========================================================================
  const frontShoulderX = shoulderX + 4 * unit * dir;
  const frontShoulderY = shoulderY + 3 * unit;
  const frontElbowX = frontShoulderX + Math.sin(pose.rightUpperArmRad) * upperArmLen * dir;
  const frontElbowY = frontShoulderY + Math.cos(pose.rightUpperArmRad) * upperArmLen;
  const frontHandX = frontElbowX + Math.cos(pose.rightForearmRad) * forearmLen * dir;
  const frontHandY = frontElbowY + Math.sin(pose.rightForearmRad) * forearmLen;

  drawRoundedLimb(ctx, frontShoulderX, frontShoulderY, frontElbowX, frontElbowY, 7.2 * unit, topTone.base);
  drawRoundedLimb(ctx, frontElbowX, frontElbowY, frontHandX, frontHandY, 6.4 * unit, topTone.light);

  ctx.save();
  ctx.fillStyle = app.accessories.includes('sarung-tangan') ? '#fb923c' : skin.base;
  ctx.strokeStyle = '#141824';
  ctx.lineWidth = 1.9;
  ctx.beginPath();
  ctx.arc(frontHandX, frontHandY, 4.0 * unit, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Gambar Alat Praktikum di Tangan (Solder, Probe Osiloskop, Stang Las, Tablet CAD, Buku Skema, Remote Rover)
  renderHandToolProp(ctx, actor.toolProp, frontHandX, frontHandY, dir, unit, pose.toolPulse01);

  return {
    characterId: actor.characterId,
    name: profile.name,
    orderNumber: profile.orderNumber,
    mouthX: headX + 4 * unit * dir,
    mouthY: headY + 4 * unit,
    headTopY: headY - headRadius * 1.25,
    centerX: shoulderX,
  };
}

function renderHandToolProp(
  ctx: CanvasRenderingContext2D,
  toolProp: PanelActorSpec['toolProp'],
  handX: number,
  handY: number,
  dir: 1 | -1,
  unit: number,
  pulse01: number
): void {
  if (!toolProp) return;
  ctx.save();
  ctx.translate(handX, handY);

  switch (toolProp) {
    case 'soldering-iron': {
      // Gagang solder & ujung logam panas menyala + asap tipis
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4 * unit;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(10 * unit * dir, 6 * unit);
      ctx.stroke();

      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2.2 * unit;
      ctx.beginPath();
      ctx.moveTo(10 * unit * dir, 6 * unit);
      ctx.lineTo(18 * unit * dir, 12 * unit);
      ctx.stroke();

      // Titik pijar timah solder
      ctx.fillStyle = pulse01 > 0.35 ? '#fef08a' : '#fb923c';
      ctx.beginPath();
      ctx.arc(18 * unit * dir, 12 * unit, (2.2 + pulse01 * 2.4) * unit, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'oscilloscope-probe': {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3 * unit;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(14 * unit * dir, 5 * unit);
      ctx.stroke();
      break;
    }
    case 'welding-torch': {
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 4.5 * unit;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(13 * unit * dir, 4 * unit);
      ctx.stroke();

      // Kilatan busur las (Arc Flash) & percikan api
      const flashR = (5 + pulse01 * 11) * unit;
      const grad = ctx.createRadialGradient(
        15 * unit * dir,
        5 * unit,
        1,
        15 * unit * dir,
        5 * unit,
        flashR
      );
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.45, '#38bdf8');
      grad.addColorStop(0.8, '#fb923c');
      grad.addColorStop(1, 'rgba(251, 146, 60, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(15 * unit * dir, 5 * unit, flashR, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'tablet-cad':
    case 'clipboard':
    case 'schematic-book': {
      ctx.fillStyle = toolProp === 'tablet-cad' ? '#0f172a' : '#fef3c7';
      ctx.strokeStyle = toolProp === 'tablet-cad' ? '#38bdf8' : '#78350f';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(2 * unit * dir, -6 * unit, 13 * unit * dir, 10 * unit, 2 * unit);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'rover-remote':
    case 'multimeter':
    case '3d-caliper': {
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(1 * unit * dir, -4 * unit, 10 * unit * dir, 8 * unit, 2 * unit);
      ctx.fill();
      ctx.stroke();
      break;
    }
    default:
      break;
  }

  ctx.restore();
}
