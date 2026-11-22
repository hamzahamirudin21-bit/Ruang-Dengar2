import type { ReactNode } from "react";
import { frameClass, type FrameVariant } from "./gameTheme";

export interface GameFrameProps {
  variant?: FrameVariant;
  nails?: boolean;
  animateIn?: boolean;
  as?: "div" | "section" | "aside" | "header" | "main";
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
}

export function GameFrame({
  variant = "krem",
  nails = false,
  animateIn = false,
  as: Tag = "div",
  className,
  children,
  "aria-label": ariaLabel,
}: GameFrameProps) {
  const cls = [frameClass(variant, { nails }), animateIn ? "fx-panel-in" : "", className].filter(Boolean).join(" ");
  return (
    <Tag className={cls} aria-label={ariaLabel}>
      {children}
    </Tag>
  );
}
