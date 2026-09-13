import {
  Edit2,
  MonitorSmartphone,
  Plus,
  Power,
  QrCode,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import type { CreatePdvResponse, PdvSummary } from "../../lib/api";
import { BRL } from "../../lib/helpers";
import { Card } from "../ui/Card";
import { Eyebrow } from "../ui/Eyebrow";
import { StatusPill } from "../ui/StatusPill";
import { CreatePdvModal } from "./CreatePdvModal";
import { PdvQrCodeModal } from "./PdvQrCodeModal";
import { PdvSessionsModal } from "./PdvSessionsModal";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PdvsPageProps {
  pdvs: PdvSummary[];
  onAddPdv: (name: string) => Promise<CreatePdvResponse>;
  onEditPdv: (
    id: string,
    data: { name?: string; status?: "ativo" | "inativo" },
  ) => Promise<void>;
  onRotateCode: (id: string) => Promise<{ accessCode: string }>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PdvsPage({
  pdvs,
  onAddPdv,
  onEditPdv,
  onRotateCode,
}: PdvsPageProps) {
  const [showModal, setShowModal] = useState(false);
  const [sessionsModalPdv, setSessionsModalPdv] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [qrCodeModalPdv, setQrCodeModalPdv] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [generatedCode, setGeneratedCode] = useState<{
    code: string;
    pdvName: string;
  } | null>(null);

  const handleCreate = async (name: string) => {
    // The modal handles its own success state now
    return await onAddPdv(name);
  };

  const handleRename = async (id: string, currentName: string) => {
    const newName = window.prompt("Novo nome do PDV:", currentName);
    if (newName && newName.trim() !== "" && newName !== currentName) {
      try {
        await onEditPdv(id, { name: newName });
      } catch (err) {
        
      }
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "ativo" ? "inativo" : "ativo";
    if (
      window.confirm(
        `Deseja realmente ${newStatus === "ativo" ? "ativar" : "desativar"} este PDV?`,
      )
    ) {
      try {
        await onEditPdv(id, { status: newStatus });
      } catch (err) {
        
      }
    }
  };

  const handleRotateCode = async (id: string, pdvName: string) => {
    if (
      window.confirm(
        "Gerar um novo código invalidará o código anterior. Deseja continuar?",
      )
    ) {
      try {
        const result = await onRotateCode(id);
        setGeneratedCode({ code: result.accessCode, pdvName });
        window.scrollTo(0, 0);
      } catch (err) {
        
      }
    }
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
          onClick={() => {
            setGeneratedCode(null);
            setShowModal(true);
          }}
          className="flex items-center justify-center gap-1.5 rounded-md bg-emerald-600 px-3.5 py-2 text-[13px] font-medium text-white hover:bg-emerald-700 cursor-pointer transition-colors"
        >
          <Plus className="h-4 w-4" /> Criar PDV
        </button>
      </div>

      {generatedCode && (
        <div className="rounded-md bg-emerald-50 p-4 border border-emerald-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-emerald-800">
              Código gerado com sucesso!
            </h3>
            <p className="text-sm text-emerald-700 mt-1">
              O código de acesso para o PDV{" "}
              <strong>{generatedCode.pdvName}</strong> é{" "}
              <span className="font-mono font-bold">{generatedCode.code}</span>.
              Guarde-o, pois não será exibido novamente.
            </p>
          </div>
          <button
            onClick={() => setGeneratedCode(null)}
            className="text-emerald-700 hover:text-emerald-900 text-sm font-medium"
          >
            Fechar
          </button>
        </div>
      )}

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
                  {BRL(p.todayCents / 100)}
                </div>
              </div>
              <div>
                <div className="text-[10.5px] text-stone-400">Mês</div>
                <div className="font-mono text-[12.5px] tabular-nums text-stone-700 sm:text-[13px]">
                  {BRL(p.monthCents / 100)}
                </div>
              </div>
              <div>
                <div className="text-[10.5px] text-stone-400">Transações</div>
                <div className="font-mono text-[12.5px] tabular-nums text-stone-700 sm:text-[13px]">
                  {p.transactionsThisMonth}
                </div>
              </div>
            </div>
            <div className="mt-4 border-t border-stone-100 pt-3 flex flex-wrap gap-2">
              <button
                onClick={() => handleRename(p.id, p.name)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded bg-stone-50 px-2 py-1.5 text-[11.5px] font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-800 transition-colors cursor-pointer min-w-[100px]"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Renomear
              </button>
              <button
                onClick={() => handleToggleStatus(p.id, p.status)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded px-2 py-1.5 text-[11.5px] font-medium transition-colors cursor-pointer min-w-[100px] ${
                  p.status === "ativo"
                    ? "bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700"
                    : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700"
                }`}
              >
                <Power className="h-3.5 w-3.5" />
                {p.status === "ativo" ? "Desativar" : "Ativar"}
              </button>
              <button
                onClick={() => handleRotateCode(p.id, p.name)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded bg-stone-50 px-2 py-1.5 text-[11.5px] font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-800 transition-colors cursor-pointer min-w-[100px]"
                title="Gerar novo código de acesso"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Novo Código
              </button>
              <button
                onClick={() => setSessionsModalPdv({ id: p.id, name: p.name })}
                className="flex flex-1 items-center justify-center gap-1.5 rounded bg-stone-50 px-2 py-1.5 text-[11.5px] font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-800 transition-colors cursor-pointer min-w-[100px]"
                title="Ver sessões ativas"
              >
                <MonitorSmartphone className="h-3.5 w-3.5" />
                Sessões
              </button>
              <button
                onClick={() =>
                  p.status === "ativo" &&
                  setQrCodeModalPdv({ id: p.id, name: p.name })
                }
                className={`flex w-full items-center justify-center gap-1.5 rounded px-2 py-2 text-[11.5px] font-medium transition-colors ${
                  p.status === "ativo"
                    ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 cursor-pointer"
                    : "bg-stone-50 text-stone-400 cursor-not-allowed opacity-70"
                }`}
                title={
                  p.status === "ativo"
                    ? "Ver QR Code do PDV"
                    : "Ative o PDV para ver o QR Code"
                }
              >
                <QrCode className="h-3.5 w-3.5" />
                Mostrar QR Code
              </button>
            </div>
          </Card>
        ))}
      </div>

      {showModal && (
        <CreatePdvModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
          onActivate={async (id) => {
            await onEditPdv(id, { status: "ativo" });
          }}
        />
      )}

      {sessionsModalPdv && (
        <PdvSessionsModal
          pdvId={sessionsModalPdv.id}
          pdvName={sessionsModalPdv.name}
          onClose={() => setSessionsModalPdv(null)}
        />
      )}

      {qrCodeModalPdv && (
        <PdvQrCodeModal
          pdvId={qrCodeModalPdv.id}
          pdvName={qrCodeModalPdv.name}
          onClose={() => setQrCodeModalPdv(null)}
        />
      )}
    </div>
  );
}
