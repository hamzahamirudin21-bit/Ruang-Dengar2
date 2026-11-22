import type { ReactNode } from "react";

export interface GameTabProps {
  icon?: ReactNode;
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  id?: string;
  controls?: string;
}

export function GameTab({ icon, selected, onClick, children, id, controls }: GameTabProps) {
  return (
    <button
      type="button"
      role="tab"
      id={id}
      aria-selected={selected}
      aria-controls={controls}
      tabIndex={selected ? 0 : -1}
      className="game-tab-ribbon"
      onClick={onClick}
    >
      {icon ? <span aria-hidden="true" className="inline-flex">{icon}</span> : null}
      {children}
    </button>
  );
}
