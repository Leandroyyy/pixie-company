import { AlertTriangle, KeyRound, ShieldCheck, Terminal } from "lucide-react";
import { useState } from "react";
import { nowHM } from "../../lib/helpers";
import { Card } from "../ui/Card";
import { Eyebrow } from "../ui/Eyebrow";
import { StatusPill } from "../ui/StatusPill";
import { Dropzone } from "./Dropzone";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LogEntry {
  t: string;
  msg: string;
  ok: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SecurityPage() {
  const [crt, setCrt] = useState<string | null>(null);
  const [key, setKey] = useState<string | null>(null);
  const [pixKeyType, setPixKeyType] = useState("cnpj");
  const [pixKey, setPixKey] = useState("12.345.678/0001-90");
  const [testing, setTesting] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([
    { t: "09:12:04", msg: "Certificado mTLS validado com sucesso", ok: true },
    {
      t: "09:12:05",
      msg: "Handshake TLS com api.bancointer.com.br concluído",
      ok: true,
    },
  ]);

  const runTest = () => {
    if (!crt || !key) return;
    setTesting(true);
    const steps = [
      "Iniciando handshake mTLS…",
      "Certificado apresentado e validado pelo Banco Inter",
      "Consultando endpoint de extrato (sandbox)…",
      "Conexão estabelecida — latência 312ms",
    ];
    steps.forEach((msg, i) => {
      setTimeout(
        () => {
          setLog((prev) => [...prev, { t: nowHM(), msg, ok: true }]);
          if (i === steps.length - 1) setTesting(false);
        },
        (i + 1) * 650,
      );
    });
  };

  const certsOk = crt && key;

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <Eyebrow>Autenticação bancária</Eyebrow>
              <div className="font-display text-[15px] font-semibold text-stone-800">
                Certificados mTLS
              </div>
            </div>
            {certsOk ? (
              <StatusPill status="ativo" />
            ) : (
              <StatusPill status="pendente" />
            )}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Dropzone
              label="Certificado (.crt)"
              hint="arraste o arquivo ou clique"
              filled={!!crt}
              filename={crt}
              onDrop={setCrt}
            />
            <Dropzone
              label="Chave privada (.key)"
              hint="arraste o arquivo ou clique"
              filled={!!key}
              filename={key}
              onDrop={setKey}
            />
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-md bg-stone-50 px-3 py-2.5 text-[11.5px] leading-relaxed text-stone-500">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-400" />
            Os arquivos são criptografados em repouso e isolados por conta.
            Nenhuma outra conta do Pixie tem acesso a estes certificados.
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="mb-4">
            <Eyebrow>Recebimento</Eyebrow>
            <div className="font-display text-[15px] font-semibold text-stone-800">
              Chave Pix principal
            </div>
          </div>
          <div className="mb-3 flex flex-wrap gap-1.5 rounded-md bg-stone-100 p-1">
            {(["cnpj", "email", "telefone", "aleatória"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setPixKeyType(t)}
                className={`flex-1 rounded px-2 py-1.5 text-[12px] font-medium capitalize transition-colors ${
                  pixKeyType === t
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-stone-500 hover:text-stone-700"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <label className="mb-1.5 block text-[12px] font-medium text-stone-500">
            Chave
          </label>
          <div className="flex items-center gap-2 rounded-md border border-stone-200 px-3 py-2.5">
            <KeyRound className="h-4 w-4 shrink-0 text-stone-400" />
            <input
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              className="w-full bg-transparent font-mono text-[13px] text-stone-700 outline-none"
            />
          </div>
          <div className="mt-4 text-[12px] text-stone-500">
            Esta chave é usada para gerar todos os QR Codes estáticos da conta.
            Cada PDV adiciona um prefixo próprio ao{" "}
            <span className="font-mono text-stone-700">txid</span> para
            rastreabilidade.
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-stone-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <Eyebrow>Diagnóstico</Eyebrow>
            <div className="font-display text-[15px] font-semibold text-stone-800">
              Testar conexão
            </div>
          </div>
          <button
            onClick={runTest}
            disabled={!certsOk || testing}
            className={`flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-[13px] font-medium transition-colors sm:w-auto ${
              !certsOk
                ? "cursor-not-allowed bg-stone-100 text-stone-400"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            {testing ? "Testando…" : "Testar conexão"}
          </button>
        </div>
        {!certsOk && (
          <div className="flex items-center gap-2 bg-amber-50 px-4 py-2.5 text-[12px] text-amber-700 sm:px-5">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> Envie os dois
            arquivos (.crt e .key) para habilitar o teste.
          </div>
        )}
        <div className="max-h-52 overflow-y-auto bg-emerald-950 px-4 py-4 font-mono text-[11.5px] leading-relaxed sm:px-5 sm:text-[12px]">
          {log.map((l, i) => (
            <div
              key={i}
              className="flex flex-wrap gap-x-3 gap-y-0.5 text-emerald-300"
            >
              <span className="shrink-0 text-emerald-600">{l.t}</span>
              <span className="text-emerald-100/90">{l.msg}</span>
            </div>
          ))}
          {testing && <div className="text-emerald-500">▍</div>}
        </div>
      </Card>
    </div>
  );
}
