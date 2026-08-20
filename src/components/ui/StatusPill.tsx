import { CircleDot } from "lucide-react";
import type { PdvStatus } from "../../data/initialPdvs";

interface StatusPillProps {
  status: PdvStatus;
}

const styleMap: Record<PdvStatus, string> = {
  ativo: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  pendente: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  matched: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  aguardando: "bg-stone-100 text-stone-500 ring-1 ring-stone-200",
  risco: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
};

const labelMap: Record<PdvStatus, string> = {
  ativo: "Ativo",
  pendente: "Pendente",
  matched: "Conciliado",
  aguardando: "Aguardando",
  risco: "Atenção",
};

export function StatusPill({ status }: StatusPillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${styleMap[status]}`}
    >
      <CircleDot className="h-3 w-3" strokeWidth={3} />
      {labelMap[status]}
    </span>
  );
}
