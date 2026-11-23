import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { StoryExpression } from '../../engine/story/storyTypes';
import type { AgentDemographicLabel } from '../../types';
import { portraitAltText } from './altText';
import { STRINGS } from '../../data/strings';
import { DOSEN_ID } from './dosenLook';
import { drawIllustratedPortrait, ILLUSTRATED_H, ILLUSTRATED_W } from './illustratedPortrait';
import {
  loadManifest,
  preloadImage,
  resolvePortraitSource,
  transformForExpression,
  assetUrl,
} from './assetSlots';
import type { AssetManifest } from './assetSlots';
import { PORTRAIT_H, PORTRAIT_W } from './portraitExpressions';

export interface PixelPortraitProps {
  studentId: string;
  name: string;
  expression: StoryExpression;
  /** Bilangan bulat >= 1. */
  scale: number;
  reducedMotion: boolean;
  demographicLabel?: Pick<AgentDemographicLabel, 'avatarHue' | 'hairStyle'>;
  /** Mode pemangkasan gambar studio: `contain` untuk badan penuh, `cover-head` untuk kartu & avatar bulat. */
  fit?: 'contain' | 'cover-head';
  className?: string;
}

/* Manifest & URL tercache dimuat sekali di latar belakang agar tidak pernah berkedip ke kanvas prosedural. */
let manifestPromise: Promise<AssetManifest | null> | null = null;
let cachedManifest: AssetManifest | null = null;
const cachedLoadedUrls = new Set<string>();

function getManifest(): Promise<AssetManifest | null> {
  if (!manifestPromise) {
    manifestPromise = loadManifest().then((m) => {
      cachedManifest = m;
      return m;
    });
  }
  return manifestPromise;
}

function useAssetState(studentId: string): {
  manifest: AssetManifest | null;
  loaded: ReadonlySet<string>;
  ready: boolean;
  version: number;
} {
  const [state, setState] = useState<{
    manifest: AssetManifest | null;
    version: number;
    ready: boolean;
  }>(() => ({
    manifest: cachedManifest,
    version: 0,
    ready: cachedManifest !== null,
  }));
  useEffect(() => {
    let cancelled = false;
    void getManifest().then(async (manifest) => {
      const entry = manifest?.characters[studentId];
      if (!manifest || !entry) {
        if (!cancelled) setState((prev) => ({ manifest, version: prev.version + 1, ready: true }));
        return;
      }
      const names = [entry.portrait, ...Object.values(entry.expressions ?? {})].filter(
        (n): n is string => typeof n === 'string',
      );
      const urls = names.map(assetUrl);
      const pending = urls.filter((u) => !cachedLoadedUrls.has(u));
      if (pending.length > 0) {
        const ok = await Promise.all(pending.map((u) => preloadImage(u)));
        pending.forEach((u, i) => {
          if (ok[i]) cachedLoadedUrls.add(u);
        });
      }
      if (cancelled) return;
      setState((prev) => ({ manifest, version: prev.version + 1, ready: true }));
    });
    return () => {
      cancelled = true;
    };
  }, [studentId]);
  return { manifest: state.manifest, loaded: cachedLoadedUrls, ready: state.ready, version: state.version };
}

export function PixelPortrait({
  studentId,
  name,
  expression,
  scale,
  reducedMotion,
  demographicLabel,
  fit = 'contain',
  className,
}: PixelPortraitProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasOk, setCanvasOk] = useState(true);
  const [visible, setVisible] = useState(true);
  const s = Math.max(1, Math.floor(Number.isFinite(scale) ? scale : 1));
  const label = studentId === DOSEN_ID ? STRINGS.story.portraitCounselorAlt : portraitAltText(name);

  const { manifest, loaded, ready, version } = useAssetState(studentId);
  const source = useMemo(
    () => resolvePortraitSource(studentId, expression, manifest, loaded),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [studentId, expression, manifest, version, ready],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setCanvasOk(false);
      return;
    }
    ctx.imageSmoothingEnabled = true;
    drawIllustratedPortrait(ctx, {
      id: studentId,
      expression,
      eyesClosed: false,
      mouth: 'tutup',
      facing: 'depan',
      fallback: demographicLabel,
    });
  }, [studentId, expression, demographicLabel, source.kind]);

  // Pudar singkat saat ekspresi berganti (dimatikan saat reducedMotion).
  useEffect(() => {
    if (reducedMotion) {
      setVisible(true);
      return;
    }
    setVisible(false);
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [expression, reducedMotion]);

  const width = PORTRAIT_W * s;
  const height = PORTRAIT_H * s;
  const fade = reducedMotion ? 'none' : 'opacity 200ms ease';
  const baseStyle: CSSProperties = {
    width,
    height,
    opacity: visible ? 1 : 0.6,
    transition: fade,
  };

  if (!canvasOk) {
    return (
      <div
        role="img"
        aria-label={label}
        className={className}
        style={{ width, height, background: '#d9d3e0' }}
        data-expression={expression}
      />
    );
  }

  if (source.kind === 'aset') {
    const t = source.specificExpression || expression === 'netral' ? null : transformForExpression(expression);
    const isCoverHead = fit === 'cover-head';
    const style: CSSProperties = {
      ...baseStyle,
      objectFit: isCoverHead ? 'cover' : 'contain',
      objectPosition: isCoverHead ? '50% 10%' : 'center bottom',
      filter: t ? `brightness(${t.brightness})` : undefined,
      transform: t ? `translateY(${t.dyPercent}%) rotate(${t.rotateDeg}deg)` : undefined,
    };
    return (
      <img
        src={source.url}
        alt={label}
        role="img"
        aria-label={label}
        className={className}
        style={style}
        data-expression={expression}
        draggable={false}
      />
    );
  }

  if (!ready) {
    return (
      <div
        aria-hidden="true"
        className={className}
        style={{ width, height }}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={label}
      width={ILLUSTRATED_W}
      height={ILLUSTRATED_H}
      className={className}
      style={baseStyle}
      data-expression={expression}
    />
  );
}

export default PixelPortrait;
