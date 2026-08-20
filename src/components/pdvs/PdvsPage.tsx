import { Plus, QrCode } from "lucide-react";
import { useState } from "react";
import type { Pdv } from "../../data/initialPdvs";
import { BRL } from "../../lib/helpers";
import { Card } from "../ui/Card";
import { Eyebrow } from "../ui/Eyebrow";
import { StatusPill } from "../ui/StatusPill";
import { CodeReveal } from "./CodeReveal";
import { CreatePdvModal } from "./CreatePdvModal";
import type { NewPdvData } from "./CreatePdvModal";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PdvsPageProps {
  pdvs: Pdv[];
  setPdvs: React.Dispatch<React.SetStateAction<Pdv[]>>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PdvsPage({ pdvs, setPdvs }: PdvsPageProps) {
  const [showModal, setShowModal] = useState(false);

  const handleCreate = ({ name, prefix, code }: NewPdvData) => {
    setPdvs((prev) => [
      ...prev,
      {
        id: Date.now(),
        name,
        prefix,
        code,
        status: "pendente",
        today: 0,
        month: 0,
        tx: 0,
      },
    ]);
    setShowModal(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Eyebrow>{pdvs.length} pontos de venda</Eyebrow>
          <div className="font-display text-[16px] font-semibold text-stone-800">
            Pontos de venda
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-1.5 rounded-md bg-emerald-600 px-3.5 py-2 text-[13px] font-medium text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" /> Criar PDV
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {pdvs.map((p) => (
          <Card key={p.id} className="p-4 sm:p-5">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
                  <QrCode className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-medium text-stone-800">
                    {p.name}
                  </div>
                  <div className="font-mono text-[11px] text-stone-400">
                    prefixo {p.prefix}
                  </div>
                </div>
              </div>
              <StatusPill status={p.status} />
            </div>
            <div className="grid grid-cols-3 gap-2 border-t border-stone-100 pt-3 sm:gap-3">
              <div>
                <div className="text-[10.5px] text-stone-400">Hoje</div>
                <div className="font-mono text-[12.5px] tabular-nums text-stone-700 sm:text-[13px]">
                  {BRL(p.today)}
                </div>
              </div>
              <div>
                <div className="text-[10.5px] text-stone-400">Mês</div>
                <div className="font-mono text-[12.5px] tabular-nums text-stone-700 sm:text-[13px]">
                  {BRL(p.month)}
                </div>
              </div>
              <div>
                <div className="text-[10.5px] text-stone-400">Código</div>
                <CodeReveal code={p.code} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {showModal && (
        <CreatePdvModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}
