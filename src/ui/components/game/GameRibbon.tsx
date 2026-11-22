import type { ReactNode } from "react";

export interface GameRibbonProps {
  children: ReactNode;
  level?: 1 | 2 | 3;
  tone?: "merah" | "navy" | "kayu";
  shine?: boolean;
}

export function GameRibbon({ children, level = 2, tone = "merah", shine = false }: GameRibbonProps) {
  const Tag = (`h${level}`) as "h1" | "h2" | "h3";
  return (
    <Tag className={shine ? "game-ribbon fx-ribbon-shine" : "game-ribbon"} data-tone={tone}>
      {children}
    </Tag>
  );
}
