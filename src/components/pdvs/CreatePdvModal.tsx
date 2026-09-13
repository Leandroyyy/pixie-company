import { CheckCircle2, Key, Power, X } from "lucide-react";
import { useState } from "react";
import type { CreatePdvResponse } from "../../lib/api";
import { Card } from "../ui/Card";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CreatePdvModalProps {
  onClose: () => void;
  onCreate: (name: string) => Promise<CreatePdvResponse>;
  onActivate: (id: string) => Promise<void>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CreatePdvModal({
  onClose,
  onCreate,
  onActivate,
}: CreatePdvModalProps) {
  const [name, setName] = useState("");
  const [step, setStep] = useState<"form" | "loading" | "success">("form");
  const [createdData, setCreatedData] = useState<CreatePdvResponse | null>(
    null,
  );

  // Ações de sucesso
  const [isActivated, setIsActivated] = useState(false);
  const [activating, setActivating] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setStep("loading");
    try {
      const data = await onCreate(name.trim());
      setCreatedData(data);
      setStep("success");
    } catch (err) {
      setStep("form");
      alert("Erro ao criar PDV");
    }
  };

  const handleActivate = async () => {
    if (!createdData || isActivated) return;
    setActivating(true);
    try {
      await onActivate(createdData.id);
      setIsActivated(true);
    } catch (err) {
      alert("Erro ao ativar PDV");
    } finally {
      setActivating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 px-4">
      <Card className="w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
          <div className="font-display text-[15px] font-semibold text-stone-800">
            {step === "success" ? "PDV Criado!" : "Novo ponto de venda"}
          </div>
          {step !== "success" && (
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          )}
        </div>

        {step === "form" || step === "loading" ? (
          <>
            <div className="space-y-4 px-5 py-5">
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-stone-500">
                  Nome do PDV
                </label>
                <input
                  autoFocus
                  disabled={step === "loading"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Caixa 2 — Loja Centro"
                  className="w-full rounded-md border border-stone-200 px-3 py-2.5 text-[13.5px] text-stone-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 disabled:opacity-50"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && name.trim()) handleCreate();
                  }}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-stone-100 px-5 py-4">
              <button
                onClick={onClose}
                disabled={step === "loading"}
                className="rounded-md px-3.5 py-2 text-[13px] font-medium text-stone-500 hover:bg-stone-100 cursor-pointer transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                disabled={!name.trim() || step === "loading"}
                onClick={handleCreate}
                className={`flex items-center justify-center min-w-[100px] rounded-md px-3.5 py-2 text-[13px] font-medium text-white transition-colors ${
                  name.trim() && step !== "loading"
                    ? "bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                    : "cursor-not-allowed bg-stone-300"
                }`}
              >
                {step === "loading" ? "Criando..." : "Criar PDV"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center justify-center px-5 py-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-[16px] font-semibold text-stone-800">
                Ponto de venda configurado
              </h3>
              <p className="mt-1.5 text-[13.5px] text-stone-500 max-w-[280px]">
                O PDV <strong>{createdData?.name}</strong> foi criado com o
                prefixo <strong>{createdData?.prefix}</strong>. O que deseja
                fazer agora?
              </p>

              <div className="mt-6 flex w-full flex-col gap-2.5">
                <button
                  onClick={handleActivate}
                  disabled={isActivated || activating}
                  className={`flex w-full items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-[13.5px] font-medium transition-all ${
                    isActivated
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 cursor-default"
                      : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50 hover:border-stone-300 cursor-pointer"
                  }`}
                >
                  {isActivated ? (
                    <>
                      <CheckCircle2 className="h-4.5 w-4.5" /> PDV Ativado
                    </>
                  ) : (
                    <>
                      <Power className="h-4.5 w-4.5" />{" "}
                      {activating ? "Ativando..." : "Ativar PDV"}
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowCode(true)}
                  disabled={showCode}
                  className={`flex w-full flex-col items-center justify-center gap-1 rounded-md border px-4 py-2.5 transition-all ${
                    showCode
                      ? "border-stone-200 bg-stone-50 cursor-default"
                      : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50 hover:border-stone-300 cursor-pointer"
                  }`}
                >
                  {!showCode ? (
                    <div className="flex items-center gap-2 text-[13.5px] font-medium">
                      <Key className="h-4.5 w-4.5" /> Resgatar código de acesso
                    </div>
                  ) : (
                    <>
                      <div className="text-[11.5px] text-stone-500 font-medium">
                        Código do Vendedor
                      </div>
                      <div className="font-mono text-[18px] font-bold tracking-wider text-stone-800">
                        {createdData?.accessCode}
                      </div>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="border-t border-stone-100 bg-stone-50 px-5 py-4 flex justify-center">
              <button
                onClick={onClose}
                className="rounded-md bg-stone-800 px-6 py-2.5 text-[13.5px] font-medium text-white hover:bg-stone-900 cursor-pointer transition-colors"
              >
                Continuar operações
              </button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
