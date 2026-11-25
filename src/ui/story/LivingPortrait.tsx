import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { STRINGS } from '../../data/strings';
import type { StoryExpression } from '../../engine/story/storyTypes';
import type { AgentDemographicLabel } from '../../types';
import { portraitAltText } from '../characters/altText';
import {
  assetUrl,
  loadManifest,
  preloadImage,
  resolvePortraitSource,
  transformForExpression,
  type AssetManifest,
} from '../characters/assetSlots';
import { DOSEN_ID } from '../characters/dosenLook';
import {
  drawIllustratedPortrait,
  ILLUSTRATED_H,
  ILLUSTRATED_W,
  type PortraitFacing,
} from '../characters/illustratedPortrait';
import { PixelPortrait } from '../characters/PixelPortrait';
import { FrameCache, frameKey } from '../characters/portraitFrameCache';
import { PORTRAIT_H, PORTRAIT_W } from '../characters/portraitExpressions';
import { useAnimationClock, useReducedMotion } from '../motion/useMotion';
import { portraitPose, speakerBrightness, speakerScale } from './portraitAnimation';

export interface LivingPortraitProps {
  /** `dosen` atau id mahasiswa. */
  studentId: string;
  name?: string;
  expression: StoryExpression;
  demographicLabel?: Pick<AgentDemographicLabel, 'avatarHue' | 'hairStyle'>;
  reducedMotion: boolean;
  isSpeaker: boolean;
  isTyping: boolean;
  msSinceSpeakerChange: number;
  /** Skala tampil relatif terhadap 80×96; boleh diisi bebas atau mengikuti CSS kontainer. */
  scale: number;
  /** Arah hadap 3/4 karakter di panggung VN. */
  facing?: PortraitFacing;
  /** True bila ukuran diatur oleh kontainer responsif (.vn-char). */
  fluid?: boolean;
  /** Reaksi instan saat konselor memilih jawaban tepat (+12%) atau salah (-14%). */
  reactionKind?: 'tepat' | 'salah' | null;
  className?: string;
}

type Surface = HTMLCanvasElement;

const frames = new FrameCache<Surface | null>();

let sharedManifestPromise: Promise<AssetManifest | null> | null = null;
const loadedAssetUrls = new Set<string>();

function getSharedManifest(): Promise<AssetManifest | null> {
  if (!sharedManifestPromise) sharedManifestPromise = loadManifest();
  return sharedManifestPromise;
}

function usePortraitAsset(studentId: string, expression: StoryExpression) {
  const [state, setState] = useState<{ manifest: AssetManifest | null; version: number; ready: boolean }>({
    manifest: null,
    version: 0,
    ready: false,
  });

  useEffect(() => {
    let cancelled = false;
    void getSharedManifest().then(async (manifest) => {
      const entry = manifest?.characters[studentId];
      if (!manifest || !entry) {
        if (!cancelled) setState((prev) => ({ manifest, version: prev.version + 1, ready: true }));
        return;
      }
      const names = [entry.portrait, ...Object.values(entry.expressions ?? {})].filter(
        (n): n is string => typeof n === 'string',
      );
      const urls = names.map(assetUrl);
      const pending = urls.filter((u) => !loadedAssetUrls.has(u));
      if (pending.length > 0) {
        const results = await Promise.all(pending.map((u) => preloadImage(u)));
        pending.forEach((u, i) => {
          if (results[i]) loadedAssetUrls.add(u);
        });
      }
      if (cancelled) return;
      setState((prev) => ({ manifest, version: prev.version + 1, ready: true }));
    });
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  const source = useMemo(
    () => resolvePortraitSource(studentId, expression, state.manifest, loadedAssetUrls),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [studentId, expression, state.manifest, state.version],
  );
  return { source, ready: state.ready };
}

function createSurface(w: number, h: number): Surface | null {
  try {
    if (typeof document === 'undefined') return null;
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c.getContext('2d') ? c : null;
  } catch {
    return null;
  }
}

function renderFrame(
  look: { id: string; fallback?: Pick<AgentDemographicLabel, 'avatarHue' | 'hairStyle'> },
  expression: StoryExpression,
  eyesClosed: boolean,
  mouth: 'tutup' | 'setengah' | 'buka',
  facing: PortraitFacing,
): Surface | null {
  const surface = createSurface(ILLUSTRATED_W, ILLUSTRATED_H);
  const ctx = surface?.getContext('2d');
  if (!surface || !ctx) return null;
  drawIllustratedPortrait(ctx, {
    id: look.id,
    expression,
    eyesClosed,
    mouth,
    facing,
    fallback: look.fallback,
  });
  return surface;
}

export function LivingPortrait({
  studentId,
  name,
  expression,
  demographicLabel,
  reducedMotion,
  isSpeaker,
  isTyping,
  msSinceSpeakerChange,
  scale,
  facing = 'depan',
  fluid = false,
  reactionKind = null,
  className,
}: LivingPortraitProps) {
  const hookReduced = useReducedMotion();
  const reduced = reducedMotion || hookReduced;
  const { source: assetSource, ready: assetReady } = usePortraitAsset(studentId, expression);
  const timeMs = useAnimationClock(!reduced && assetSource.kind !== 'aset');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const s = Math.max(1, Math.floor(Number.isFinite(scale) ? scale : 1));
  const pose = portraitPose({
    timeMs,
    seedId: studentId,
    isSpeaker,
    isTyping,
    msSinceSpeakerChange,
    reduced,
  });

  const look = useMemo(
    () => ({ id: studentId, fallback: demographicLabel }),
    [studentId, demographicLabel],
  );
  const key = `${frameKey(studentId, expression, pose.eyesClosed, pose.mouth)}|${facing}`;
  const frame = useMemo(
    () => (!assetReady || assetSource.kind === 'aset' ? null : frames.get(key, () => renderFrame(look, expression, pose.eyesClosed, pose.mouth, facing))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key, look, assetSource.kind, assetReady],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !frame) return;
    ctx.imageSmoothingEnabled = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(frame, 0, 0);
  }, [frame]);

  const label =
    studentId === DOSEN_ID
      ? STRINGS.story.portraitCounselorAlt
      : portraitAltText(name?.trim() || 'mahasiswa');

  const width = PORTRAIT_W * s;
  const height = PORTRAIT_H * s;
  const sizeScale = speakerScale(isSpeaker);
  const bright = reduced ? speakerBrightness(isSpeaker) : pose.brightness;

  if (assetSource.kind === 'aset') {
    const expr = assetSource.specificExpression ? null : transformForExpression(expression);
    const isWarm =
      reactionKind === 'tepat' || expression === 'tersenyum' || expression === 'lega';
    const isDowncast =
      reactionKind === 'salah' ||
      expression === 'menunduk' ||
      expression === 'menutup-diri' ||
      expression === 'lelah';
    const totalBright =
      bright *
      (expr ? expr.brightness : 1) *
      (reactionKind === 'tepat' ? 1.04 : reactionKind === 'salah' ? 0.94 : 1);
    const sat = reactionKind === 'tepat' ? 1.05 : isDowncast ? 0.92 : isWarm ? 1.02 : 1;
    const spriteStyle: CSSProperties = {
      display: fluid ? 'flex' : 'inline-block',
      alignItems: fluid ? 'flex-end' : undefined,
      justifyContent: fluid ? 'center' : undefined,
      lineHeight: 0,
      width: fluid ? '100%' : width,
      height: fluid ? '100%' : height,
      transformOrigin: 'bottom center',
      transform: 'none',
      filter: `brightness(${totalBright}) saturate(${sat})`,
      transition: reduced ? 'none' : 'filter 200ms ease',
    };

    return (
      <div
        className={(className ?? '').trim()}
        style={spriteStyle}
        data-speaker={isSpeaker ? 'true' : undefined}
        data-expression={expression}
        data-reaction={reactionKind ?? undefined}
      >
        <img
          src={assetSource.url}
          alt={label}
          role="img"
          aria-label={label}
          className="vn-sprite-img"
          draggable={false}
        />
      </div>
    );
  }

  if (!assetReady) {
    return (
      <div
        className={className}
        style={{ width: fluid ? '100%' : width, height: fluid ? '100%' : height }}
        aria-hidden="true"
      />
    );
  }

  if (!frame) {
    return (
      <PixelPortrait
        studentId={studentId}
        name={name?.trim() || 'mahasiswa'}
        expression={expression}
        scale={s}
        reducedMotion={reduced}
        demographicLabel={demographicLabel}
        className={className}
      />
    );
  }

  const style: CSSProperties = {
    display: fluid ? 'flex' : 'inline-block',
    alignItems: fluid ? 'flex-end' : undefined,
    justifyContent: fluid ? 'center' : undefined,
    lineHeight: 0,
    width: fluid ? '100%' : width,
    height: fluid ? '100%' : height,
    transformOrigin: 'bottom center',
    transform: `translateY(${pose.breathDy * (fluid ? 2.5 : s)}px) scale(${pose.scaleX * sizeScale}, ${pose.scaleY * sizeScale})`,
    filter: `brightness(${bright})`,
    transition: reduced ? 'none' : 'filter 240ms ease',
    willChange: reduced ? undefined : 'transform',
  };

  return (
    <div style={style} data-speaker={isSpeaker ? 'true' : undefined}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={label}
        width={ILLUSTRATED_W}
        height={ILLUSTRATED_H}
        className={className}
        style={
          fluid
            ? { width: '100%', height: '100%', objectFit: 'contain' }
            : { width, height }
        }
        data-expression={expression}
      />
    </div>
  );
}

export default LivingPortrait;
