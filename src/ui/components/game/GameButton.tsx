import type { ButtonHTMLAttributes, ReactNode } from "react";
import { buttonClass, type ButtonSize, type ButtonVariant } from "./gameTheme";

export interface GameButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  badge?: ReactNode;
  bounce?: boolean;
}

export function GameButton({
  variant = "primer",
  size = "md",
  icon,
  badge,
  bounce = false,
  type = "button",
  className,
  children,
  ...rest
}: GameButtonProps) {
  const cls = [buttonClass(variant, { size }), bounce ? "fx-bounce" : "", className].filter(Boolean).join(" ");
  return (
    <button type={type} className={cls} data-size={size} {...rest}>
      {icon ? <span aria-hidden="true" className="inline-flex">{icon}</span> : null}
      {children}
      {badge ? <span aria-hidden="true" className="inline-flex">{badge}</span> : null}
    </button>
  );
}
