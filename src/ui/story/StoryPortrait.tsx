import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { STRINGS } from '../../data/strings';
import type { StoryExpression } from '../../engine/story/storyTypes';
import type { AgentDemographicLabel } from '../../types';
import { DOSEN_ID } from '../characters/dosenLook';
import type { PortraitFacing } from '../characters/illustratedPortrait';
import { LivingPortrait } from './LivingPortrait';
import { speakerBrightness, speakerScale } from './portraitAnimation';
import { buildPortrait } from './portraitShapes';
import type { PortraitLayer, PortraitRole } from './portraitShapes';

export interface StoryPortraitProps {
  role: PortraitRole;
  /** Id mahasiswa (mis. mhs-01); dipakai untuk potret pixel. */
  studentId?: string;
  expression: StoryExpression;
  demographicLabel?: Pick<AgentDemographicLabel, 'avatarHue' | 'hairStyle'>;
  /** Nama mahasiswa untuk teks alternatif; diabaikan untuk dosen. */
  name?: string;
  reducedMotion: boolean;
  /** Warisan: pembicara tidak aktif. Dipakai hanya bila `isSpeaker` tidak diberikan (isSpeaker = !dim). */
  dim?: boolean;
  /** Skala bulat potret pixel (>= 1); bawaan 2. */
  scale?: number;
  /** Pembicara aktif; bila tidak diberikan diturunkan dari `dim`. */
  isSpeaker?: boolean;
  /** Teks sedang diketik (mulut bergerak untuk pembicara). */
  isTyping?: boolean;
  /** Milidetik sejak pembicara berganti. */
  msSinceSpeakerChange?: number;
  /** Arah hadap karakter 3/4 (bawaan: dosen kanan, mahasiswa kiri). */
  facing?: PortraitFacing;
  /** True bila ukuran mengikuti kontainer responsif (.vn-char). */
  fluid?: boolean;
  /** Reaksi cepat terhadap pilihan konselor (+12% tepat / -14% salah). */
  reactionKind?: 'tepat' | 'salah' | null;
  /** Teks dialog aktif untuk pemilihan pose P01-P20. */
  dialogueText?: string;
  /** True bila karakter sedang mendengarkan. */
  isListening?: boolean;
  className?: string;
}

function renderLayer(layer: PortraitLayer) {
  const common = {
    fill: layer.fill,
    stroke: layer.stroke,
    strokeWidth: layer.strokeWidth,
    opacity: layer.opacity,
  };
  if (layer.kind === 'ellipse') {
    return <ellipse key={layer.id} cx={layer.cx} cy={layer.cy} rx={layer.rx} ry={layer.ry} {...common} />;
  }
  return <path key={layer.id} d={layer.d} strokeLinecap={layer.strokeLinecap} {...common} />;
}

export function StoryPortrait({
  role,
  studentId,
  expression,
  demographicLabel,
  name,
  reducedMotion,
  dim = false,
  scale = 2,
  isSpeaker: isSpeakerProp,
  isTyping = false,
  msSinceSpeakerChange = Number.POSITIVE_INFINITY,
  facing,
  fluid = false,
  reactionKind = null,
  dialogueText,
  isListening = false,
  className,
}: StoryPortraitProps) {
  const portrait = useMemo(
    () => buildPortrait(role, expression, demographicLabel),
    [role, expression, demographicLabel],
  );

  // Lapisan wajah memudar singkat saat ekspresi berganti (dimatikan saat reducedMotion).
  const [faceVisible, setFaceVisible] = useState(true);
  useEffect(() => {
    if (reducedMotion) {
      setFaceVisible(true);
      return;
    }
    setFaceVisible(false);
    const id = requestAnimationFrame(() => setFaceVisible(true));
    return () => cancelAnimationFrame(id);
  }, [expression, reducedMotion]);

  const isSpeaker = isSpeakerProp ?? !dim;

  if (role === 'dosen' || (role === 'mahasiswa' && studentId)) {
    const resolvedFacing: PortraitFacing = facing ?? (role === 'dosen' ? 'kanan' : 'kiri');
    return (
      <div
        style={
          fluid
            ? { display: 'flex', width: '100%', height: '100%', alignItems: 'flex-end', justifyContent: 'center', lineHeight: 0 }
            : { display: 'inline-block', lineHeight: 0 }
        }
        data-role={role}
      >
        <LivingPortrait
          studentId={role === 'dosen' ? DOSEN_ID : (studentId as string)}
          name={role === 'dosen' ? STRINGS.story.speakerCounselor : name?.trim() || 'mahasiswa'}
          expression={expression}
          demographicLabel={demographicLabel}
          reducedMotion={reducedMotion}
          isSpeaker={isSpeaker}
          isTyping={isTyping}
          msSinceSpeakerChange={msSinceSpeakerChange}
          scale={scale}
          facing={resolvedFacing}
          fluid={fluid}
          reactionKind={reactionKind}
          dialogueText={dialogueText}
          isListening={isListening}
          className={className}
        />
      </div>
    );
  }

  const style: CSSProperties = {
    transform: `scale(${speakerScale(isSpeaker)})`,
    transformOrigin: 'bottom center',
    filter: `brightness(${speakerBrightness(isSpeaker)})`,
    transition: reducedMotion ? 'none' : 'filter 240ms ease, transform 240ms ease',
  };

  const label = STRINGS.story.portraitStudentAlt(name?.trim() || 'mahasiswa');

  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={portrait.viewBox}
      width={portrait.width}
      height={portrait.height}
      className={className}
      style={style}
      data-expression={expression}
      data-role={role}
    >
      <title>{label}</title>
      <g
        style={{
          opacity: faceVisible ? 1 : 0.6,
          transition: reducedMotion ? 'none' : 'opacity 200ms ease',
        }}
      >
        {portrait.layers.map(renderLayer)}
      </g>
    </svg>
  );
}

export default StoryPortrait;
