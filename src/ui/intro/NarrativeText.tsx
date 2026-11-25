import React from 'react';

export interface NarrativeTextProps {
  sceneCode: string;
  text: string;
  position?: 'top' | 'bottom';
}

export const NarrativeText: React.FC<NarrativeTextProps> = ({
  sceneCode,
  text,
  position = 'bottom',
}) => {
  if (!text) return null;

  return (
    <div
      className={`comic-intro-narrative pointer-events-none z-30 mx-auto w-full max-w-4xl px-3 ${
        position === 'top' ? 'mb-2' : 'mt-2'
      }`}
      data-narrative-position={position}
    >
      <div className="relative flex items-center gap-3 rounded-xl border-[3px] border-slate-950 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 px-4 py-2.5 text-slate-950 shadow-[4px_5px_0_#020617]">
        <span className="shrink-0 rounded-md border-2 border-slate-950 bg-amber-400 px-2 py-0.5 text-[10px] font-black tracking-wider uppercase text-slate-950">
          {sceneCode}
        </span>
        <p className="text-xs leading-relaxed font-extrabold tracking-wide text-slate-950 italic sm:text-sm">
          “{text}”
        </p>
      </div>
    </div>
  );
};
