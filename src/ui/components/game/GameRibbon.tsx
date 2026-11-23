import type { ReactNode } from "react";

export interface GameRibbonProps {
  children: ReactNode;
  level?: 1 | 2 | 3;
  tone?: "merah" | "navy" | "kayu";
  shine?: boolean;
  className?: string;
}

export function GameRibbon({ children, level = 2, tone = "merah", shine = false, className }: GameRibbonProps) {
  const Tag = (`h${level}`) as "h1" | "h2" | "h3";
  const base = shine ? "game-ribbon fx-ribbon-shine" : "game-ribbon";
  return (
    <Tag className={className ? `${base} ${className}` : base} data-tone={tone}>
      {children}
    </Tag>
  );
}
