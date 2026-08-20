import type { LucideIcon } from "lucide-react";
import { Card } from "../ui/Card";
import { Eyebrow } from "../ui/Eyebrow";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Tone = "default" | "good";

interface KPIProps {
  icon: LucideIcon;
  eyebrow: string;
  value: string;
  sub: string;
  tone?: Tone;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const toneMap: Record<Tone, string> = {
  default: "text-stone-800",
  good: "text-emerald-700",
};

export function KPI({ icon: Icon, eyebrow, value, sub, tone = "default" }: KPIProps) {
  return (
    <Card className="px-4 py-3.5 sm:px-5 sm:py-4">
      <div className="mb-2.5 flex items-center justify-between sm:mb-3">
        <Eyebrow>{eyebrow}</Eyebrow>
        <Icon className="h-4 w-4 shrink-0 text-stone-300" strokeWidth={2} />
      </div>
      <div
        className={`font-display text-[20px] font-semibold leading-none tabular-nums sm:text-[26px] ${toneMap[tone]}`}
      >
        {value}
      </div>
      <div className="mt-1.5 text-[11.5px] text-stone-400 sm:text-[12px]">
        {sub}
      </div>
    </Card>
  );
}
