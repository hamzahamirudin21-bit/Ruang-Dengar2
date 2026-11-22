import type { ReactNode } from "react";
import { useCountUp } from "../../motion/useMotion";
export interface GameBadgeProps {
  icon: ReactNode;
  value: string;
  label: string;
  tone?: "emas" | "merah" | "navy" | "krem";
  /** Bila true dan value berisi satu angka bulat, angka dihitung-naik dan berdenyut saat berubah. */
  animateValue?: boolean;
}
export function GameBadge({ icon, value, label, tone = "krem", animateValue = false }: GameBadgeProps) {
  const m = /^(\D*)(\d+)(\D*)$/.exec(value);
  const target = animateValue && m ? Number(m[2]) : 0;
  const counted = useCountUp(target);
  const shown = animateValue && m ? `${m[1]}${Math.round(counted)}${m[3]}` : value;
  return (
    <span className="game-badge" data-tone={tone} role="group" aria-label={`${label}: ${value}`}>
      <span aria-hidden="true" className="inline-flex">{icon}</span>
      <span aria-hidden="true" key={animateValue ? value : undefined} className={animateValue ? "fx-pop" : undefined}>{shown}</span>
    </span>
  );
}
