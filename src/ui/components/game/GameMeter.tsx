import type { ReactNode } from "react";
import { meterFraction, meterPercentText, meterTone } from "./gameTheme";

export interface GameMeterProps {
  label: string;
  icon: ReactNode;
  value: number;
  max: number;
  higherIsBetter?: boolean;
  showValue?: boolean;
}

export function GameMeter({
  label,
  icon,
  value,
  max,
  higherIsBetter = true,
  showValue = true,
}: GameMeterProps) {
  const fraction = meterFraction(value, max);
  const tone = meterTone(fraction, higherIsBetter);
  const safeMax = Number.isFinite(max) && max > 0 ? max : 0;
  const safeValue = Number.isFinite(value) ? Math.min(safeMax, Math.max(0, value)) : 0;
  return (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden="true" className="inline-flex">{icon}</span>
      <span className="text-xs font-bold">{label}</span>
      <span
        className="game-meter"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={safeValue}
        aria-valuetext={meterPercentText(fraction)}
        data-tone={tone}
        style={{ minWidth: "5rem" }}
      >
        <span data-meter-fill style={{ width: `${Math.round(fraction * 100)}%` }} />
      </span>
      {showValue ? <span className="text-xs font-bold">{meterPercentText(fraction)}</span> : null}
    </span>
  );
}
