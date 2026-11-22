import { useEffect, useMemo, useRef, useState } from 'react';
import type { StoryScene } from '../../engine/story/storyTypes';
import type { ZoneType } from '../../types';
import { BACKDROP_BLUR_PX, dustSpecs, parallaxOffsetPx } from '../motion/sceneDepth';
import { sceneTransitionKind } from '../motion/sceneTransition';
import type { TransitionKind } from '../motion/sceneTransition';
import { effectiveMs } from '../motion/motionTokens';
import { useAnimationClock, useReducedMotion } from '../motion/useMotion';
import { resolveSceneArt } from '../scene/sceneArt';
import type { SceneArtId, SceneVariant } from '../scene/sceneArt';
import { getPaintedSceneCanvas, onExternalSceneReady } from '../scene/paintedScene';
import { getSceneCanvas } from '../scene/sceneCache';
import { coverCrop } from './dialogLayout';

export interface StoryBackdropProps {
  setting: StoryScene['setting'];
  zoneId: ZoneType | null;
  variant: SceneVariant;
  /** Ukuran panggung (px); latar digambar sebagai cover. */
  size: { width: number; height: number };
  /** Viewport sempit: tanpa debu. */
  narrow: boolean;
  /** Bila tidak diberikan, memakai useReducedMotion. */
  reducedMotion?: boolean;
}

const DUST_COUNT = 10;
/** Skala kecil agar tepi tidak pernah terlihat saat parallax (±4 px) dan kabur. */
const BACKDROP_SCALE = 1.03;

function seedFor(artId: string): number {
  let h = 0;
  for (let i = 0; i < artId.length; i++) h = (Math.imul(h, 31) + artId.charCodeAt(i)) >>> 0;
  return h;
}

function ArtLayer({
  artId,
  variant,
  size,
  onFail,
  className,
  style,
}: {
  artId: SceneArtId;
  variant: SceneVariant;
  size: { width: number; height: number };
  onFail: () => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const paint = () => {
      const canvas = ref.current;
      const ctx = canvas?.getContext('2d');
      const surface = getPaintedSceneCanvas(artId, variant) ?? getSceneCanvas(artId, variant);
      if (!canvas || !ctx || !surface) {
        onFail();
        return;
      }
      const dw = Math.max(1, Math.round(size.width) || surface.width);
      const dh = Math.max(1, Math.round(size.height) || surface.height);
      canvas.width = dw;
      canvas.height = dh;
      ctx.imageSmoothingEnabled = true;
      const c = coverCrop(surface.width, surface.height, dw, dh);
      ctx.drawImage(surface as CanvasImageSource, c.sx, c.sy, c.sw, c.sh, 0, 0, dw, dh);
    };
    paint();
    return onExternalSceneReady(paint);
  }, [artId, variant, size.width, size.height, onFail]);
  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={className}
      style={style}
      data-scene-art={artId}
      data-scene-variant={variant}
    />
  );
}

export function StoryBackdrop({ setting, zoneId, variant, size, narrow, reducedMotion }: StoryBackdropProps) {
  const hookReduced = useReducedMotion();
  const reduced = reducedMotion ?? hookReduced;
  const artId = resolveSceneArt({ setting, zoneId });

  const [baseId, setBaseId] = useState<SceneArtId>(artId);
  const [overlay, setOverlay] = useState<{ id: SceneArtId; kind: Exclude<TransitionKind, 'none'> } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (artId === baseId && !overlay) return;
    const kind = sceneTransitionKind(baseId, artId, reduced);
    if (kind === 'none') {
      setOverlay(null);
      setBaseId(artId);
      return;
    }
    setOverlay({ id: artId, kind });
    const timer = window.setTimeout(() => {
      setBaseId(artId);
      setOverlay(null);
    }, effectiveMs('transisi-adegan', reduced));
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artId, reduced]);

  const timeMs = useAnimationClock(!reduced);
  const dx = parallaxOffsetPx(timeMs, reduced);
  const dust = useMemo(() => dustSpecs(seedFor(artId), DUST_COUNT, narrow), [artId, narrow]);
  const onFail = useMemo(() => () => setFailed(true), []);

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden" data-scene-backdrop={artId}>
      {failed ? (
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, var(--game-cream-edge) 0%, var(--game-wood-light) 100%)' }}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            transform: `translate3d(${dx.toFixed(2)}px, 0, 0) scale(${BACKDROP_SCALE})`,
            filter: `blur(${BACKDROP_BLUR_PX}px)`,
          }}
        >
          <ArtLayer
            artId={baseId}
            variant={variant}
            size={size}
            onFail={onFail}
            className="absolute inset-0 h-full w-full object-cover"
          />
          {overlay && (
            <ArtLayer
              key={overlay.id}
              artId={overlay.id}
              variant={variant}
              size={size}
              onFail={onFail}
              className={`absolute inset-0 h-full w-full object-cover ${overlay.kind === 'iris' ? 'fx-iris' : 'fx-fade'}`}
            />
          )}
        </div>
      )}

      {dust.map((d, i) => (
        <span
          key={i}
          className="fx-dust"
          style={{
            position: 'absolute',
            left: `${d.xPct}%`,
            top: `${d.yPct}%`,
            width: d.sizePx,
            height: d.sizePx,
            opacity: d.opacity,
            animationDuration: `${d.durationMs}ms`,
            animationDelay: `${d.delayMs}ms`,
          }}
        />
      ))}

      <div className="fx-vignette absolute inset-0" />
    </div>
  );
}

export default StoryBackdrop;
