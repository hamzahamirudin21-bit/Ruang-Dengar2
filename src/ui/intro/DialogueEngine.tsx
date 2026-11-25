import React from 'react';
import {
  ComicPanelBlueprint,
  PanelDialogueSpec,
  PanelSfxTypographySpec,
} from './StoryTimeline';
import { RenderedActorAnchor } from './ComicCharacterRenderer';

export interface DialogueEngineProps {
  panel: ComicPanelBlueprint;
  pageElapsedMs: number;
  actorAnchors: Readonly<Record<string, RenderedActorAnchor>>;
}

function getVisibleTypewriterText(
  fullText: string,
  elapsedSinceStartMs: number,
  revealWindowMs = 1150
): string {
  if (!fullText) return '';
  if (elapsedSinceStartMs <= 0) return '';
  const p = Math.max(0, Math.min(1, elapsedSinceStartMs / Math.max(150, revealWindowMs)));
  const chars = Math.max(1, Math.round(fullText.length * p));
  return fullText.slice(0, chars);
}

const NARRATION_DOCK_CLASSES: Readonly<
  Record<NonNullable<ComicPanelBlueprint['narrationDock']>, string>
> = {
  'top-left': 'top-2.5 left-2.5',
  'top-right': 'top-2.5 right-2.5',
  'bottom-left': 'bottom-2.5 left-2.5',
  'bottom-right': 'bottom-2.5 right-2.5',
};

/**
 * Merender elemen tipografi komik asli di dalam panel:
 * 1. Narration Box (kotak narasi komik kuning-perkamen yang menyatu di sudut panel)
 * 2. Speech Bubble & Thought Bubble (balon komik organik dengan ekor SVG mengarah ke mulut karakter)
 * 3. Sound Effect Typography (TAP... TAP..., KLIK!, SWOOSH!, TZZT!, KZRRT!)
 */
export const DialogueEngine: React.FC<DialogueEngineProps> = ({
  panel,
  pageElapsedMs,
  actorAnchors,
}) => {
  const panelElapsed = Math.max(0, pageElapsedMs - panel.revealAtMs);

  const activeDialogues: Array<{
    spec: PanelDialogueSpec;
    visibleText: string;
    targetXNorm: number;
    targetYNorm: number;
  }> = [];

  for (const dlg of panel.dialogues) {
    if (
      pageElapsedMs >= dlg.startOffsetMs &&
      pageElapsedMs <= dlg.startOffsetMs + dlg.durationMs
    ) {
      const sinceStart = pageElapsedMs - dlg.startOffsetMs;
      const visibleText = getVisibleTypewriterText(dlg.text, sinceStart);
      const speakerAnchor = dlg.speakerId ? actorAnchors[dlg.speakerId] : undefined;
      const actorSpec = dlg.speakerId
        ? panel.actors.find((a) => a.characterId === dlg.speakerId)
        : undefined;

      const targetXNorm =
        speakerAnchor?.xNorm !== undefined
          ? speakerAnchor.xNorm
          : actorSpec
            ? actorSpec.xNorm
            : dlg.bubbleXNorm;
      const targetYNorm =
        speakerAnchor?.yNorm !== undefined
          ? speakerAnchor.yNorm
          : actorSpec
            ? Math.max(0.38, actorSpec.yNorm - 0.34)
            : Math.min(0.85, dlg.bubbleYNorm + 0.25);

      activeDialogues.push({
        spec: dlg,
        visibleText,
        targetXNorm,
        targetYNorm,
      });
    }
  }

  const activeSfx: PanelSfxTypographySpec[] = panel.sfxTexts.filter(
    (s) => pageElapsedMs >= s.revealAtMs
  );

  const narrationVisible = panel.narrationText
    ? getVisibleTypewriterText(panel.narrationText, panelElapsed, 1100)
    : '';

  return (
    <div className="comic-dialogue-layer pointer-events-none absolute inset-0 z-20 overflow-hidden select-none">
      {/* 1. Kotak Narasi Komik (Narration Box) */}
      {panel.narrationText && narrationVisible && (
        <div
          className={`comic-narration-box absolute z-20 max-w-[86%] sm:max-w-[74%] ${
            NARRATION_DOCK_CLASSES[panel.narrationDock ?? 'top-left']
          }`}
          data-testid={`comic-narration-${panel.id}`}
        >
          <div className="border-[2.5px] border-slate-950 bg-gradient-to-r from-[#fef08a] via-[#fef9c3] to-[#fde047] px-2.5 py-1 text-slate-950 shadow-[3px_3px_0_#020617]">
            <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] leading-snug font-extrabold tracking-tight text-slate-950 italic sm:text-xs">
              {narrationVisible}
            </p>
          </div>
        </div>
      )}

      {/* 2. Sound Effect Typography (Onomatopoeia Komik) */}
      {activeSfx.map((sfx) => (
        <div
          key={sfx.id}
          className="comic-sfx-typography absolute z-20"
          style={{
            left: `${sfx.xNorm * 100}%`,
            top: `${sfx.yNorm * 100}%`,
            transform: `translate(-50%, -50%) rotate(${sfx.rotationDeg}deg) scale(${sfx.scale ?? 1})`,
          }}
          data-testid={`comic-sfx-${sfx.id}`}
        >
          <span
            className="inline-block font-['Fredoka',sans-serif] text-base font-black tracking-wider uppercase sm:text-xl"
            style={{
              color: sfx.color,
              WebkitTextStroke: `2px ${sfx.strokeColor}`,
              textShadow: `3px 3px 0 ${sfx.strokeColor}`,
            }}
          >
            {sfx.text}
          </span>
        </div>
      ))}

      {/* 3. Ekor SVG Balon Komik yang Mengarah Langsung ke Mulut Karakter */}
      <svg
        className="pointer-events-none absolute inset-0 z-20 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {activeDialogues.map(({ spec, targetXNorm, targetYNorm }) => {
          const bx = spec.bubbleXNorm * 100;
          const by = spec.bubbleYNorm * 100 + 6;
          const tx = targetXNorm * 100;
          const ty = Math.max(by + 6, Math.min(82, targetYNorm * 100));

          if (spec.kind === 'thought') {
            return (
              <g key={`tail-${spec.id}`}>
                <circle
                  cx={bx + (tx - bx) * 0.45}
                  cy={by + (ty - by) * 0.45}
                  r="1.6"
                  fill="#fffdf9"
                  stroke="#0f172a"
                  strokeWidth="0.6"
                />
                <circle
                  cx={bx + (tx - bx) * 0.75}
                  cy={by + (ty - by) * 0.75}
                  r="1.0"
                  fill="#fffdf9"
                  stroke="#0f172a"
                  strokeWidth="0.5"
                />
              </g>
            );
          }

          return (
            <polygon
              key={`tail-${spec.id}`}
              points={`${bx - 2.6},${by} ${bx + 2.6},${by} ${tx},${ty}`}
              fill="#fffdf9"
              stroke="#0f172a"
              strokeWidth="0.85"
              strokeLinejoin="round"
            />
          );
        })}
      </svg>

      {/* 4. Balon Percakapan Komik (Speech Bubble / Thought Bubble) */}
      {activeDialogues.map(({ spec, visibleText }) => (
        <div
          key={spec.id}
          className="comic-speech-bubble absolute z-30 max-w-[78%] sm:max-w-[66%]"
          style={{
            left: `${spec.bubbleXNorm * 100}%`,
            top: `${spec.bubbleYNorm * 100}%`,
            transform: 'translate(-50%, -50%)',
          }}
          data-testid={`comic-bubble-${spec.id}`}
          data-speaker-id={spec.speakerId}
        >
          <div
            className={`relative border-[2.5px] border-slate-950 bg-[#fffdf9] px-3 py-1.5 text-slate-950 shadow-[3px_4px_0_#020617] ${
              spec.kind === 'thought' ? 'rounded-[26px] border-dashed' : 'rounded-[20px]'
            }`}
          >
            {spec.speakerName && (
              <span className="mr-1.5 inline-block rounded bg-amber-300 px-1.5 py-0.2 font-['Fredoka',sans-serif] text-[10px] font-black tracking-wide uppercase text-slate-950">
                {spec.speakerName}
              </span>
            )}
            <span className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] leading-snug font-extrabold text-slate-950 sm:text-xs">
              {visibleText}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
