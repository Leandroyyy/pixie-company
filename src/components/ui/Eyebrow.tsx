import type { ReactNode } from "react";

interface EyebrowProps {
  children: ReactNode;
}

export function Eyebrow({ children }: EyebrowProps) {
  return (
    <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-stone-400">
      {children}
    </div>
  );
}
