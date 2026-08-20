import { X } from "lucide-react";
import { useState } from "react";
import { prefixFrom, randCode } from "../../lib/helpers";
import { Card } from "../ui/Card";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NewPdvData {
  name: string;
  prefix: string;
  code: string;
}

interface CreatePdvModalProps {
  onClose: () => void;
  onCreate: (data: NewPdvData) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CreatePdvModal({ onClose, onCreate }: CreatePdvModalProps) {
  const [name, setName] = useState("");
  const prefix = name.trim() ? prefixFrom(name) : "———";
  const [code] = useState(randCode);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 px-4">
      <Card className="w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
          <div className="font-display text-[15px] font-semibold text-stone-800">
            Novo ponto de venda
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
        <div className="space-y-4 px-5 py-5">
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-stone-500">
              Nome do PDV
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Caixa 2 — Loja Centro"
              className="w-full rounded-md border border-stone-200 px-3 py-2.5 text-[13.5px] text-stone-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md bg-stone-50 px-3 py-3">
              <div className="font-mono text-[10.5px] uppercase tracking-wider text-stone-400">
                Prefixo txid
              </div>
              <div className="mt-1 font-mono text-[16px] font-semibold text-emerald-700">
                {prefix}
              </div>
            </div>
            <div className="rounded-md bg-stone-50 px-3 py-3">
              <div className="font-mono text-[10.5px] uppercase tracking-wider text-stone-400">
                Código de acesso
              </div>
              <div className="mt-1 font-mono text-[16px] font-semibold text-stone-700">
                {code}
              </div>
            </div>
          </div>
          <div className="rounded-md bg-emerald-50/60 px-3 py-2.5 text-[11.5px] text-emerald-700">
            O vendedor usa apenas este código de 6 dígitos para entrar — sem
            e-mail ou senha.
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-stone-100 px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-md px-3.5 py-2 text-[13px] font-medium text-stone-500 hover:bg-stone-100"
          >
            Cancelar
          </button>
          <button
            disabled={!name.trim()}
            onClick={() =>
              name.trim() && onCreate({ name: name.trim(), prefix, code })
            }
            className={`rounded-md px-3.5 py-2 text-[13px] font-medium text-white transition-colors ${
              name.trim()
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "cursor-not-allowed bg-stone-300"
            }`}
          >
            Criar PDV
          </button>
        </div>
      </Card>
    </div>
  );
}
