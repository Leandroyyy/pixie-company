import {
  AlertTriangle,
  KeyRound,
  Save,
  ShieldCheck,
  Terminal,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  configureBankConnection,
  configurePixKey,
  fetchBankConnectionStatus,
  fetchPixKey,
  revokeBankConnection,
  type BankConnectionStatus,
  type PixKeyType,
} from "../../lib/api";
import { nowHM } from "../../lib/helpers";
import { Card } from "../ui/Card";
import { Eyebrow } from "../ui/Eyebrow";
import { StatusPill } from "../ui/StatusPill";
import { Dropzone } from "./Dropzone";

interface LogEntry {
  t: string;
  msg: string;
  ok: boolean;
}

export function SecurityPage() {
  const [crt, setCrt] = useState<string | null>(null);
  const [crtFile, setCrtFile] = useState<File | null>(null);
  const [key, setKey] = useState<string | null>(null);
  const [keyFile, setKeyFile] = useState<File | null>(null);

  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");

  const [pixKeyType, setPixKeyType] = useState<PixKeyType>("cnpj");
  const [pixKey, setPixKey] = useState("");
  const [currentPixKey, setCurrentPixKey] = useState<{
    key: string;
    type: PixKeyType;
  } | null>(null);
  const [savingPix, setSavingPix] = useState(false);

  const [testing, setTesting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<BankConnectionStatus | null>(null);

  const [log, setLog] = useState<LogEntry[]>([]);

  useEffect(() => {
    async function loadStatus() {
      try {
        const [connData, pixData] = await Promise.all([
          fetchBankConnectionStatus().catch(() => null),
          fetchPixKey().catch(() => null),
        ]);

        if (connData) {
          setStatus(connData);
          if (connData.configured && connData.handshakeVerified) {
            setLog([
              {
                t: nowHM(),
                msg: `Certificado válido até ${new Date(connData.integrationNotAfter!).toLocaleDateString("pt-BR")} (${connData.daysUntilExpiry} dias restantes)`,
                ok: true,
              },
            ]);
          }
        }

        if (pixData) {
          setCurrentPixKey(pixData);
          setPixKey(pixData.key);
          setPixKeyType(pixData.type);
        }
      } catch (err) {
        // fail silently
      }
    }
    loadStatus();
  }, []);

  const addLog = (msg: string) => {
    setLog((prev) => [...prev, { t: nowHM(), msg, ok: true }]);
  };

  const handleUpload = async () => {
    if (!crtFile || !keyFile || !clientId || !clientSecret) return;

    setUploading(true);
    addLog("Iniciando upload e validação de credenciais mTLS...");

    try {
      const formData = new FormData();
      formData.append("clientId", clientId);
      formData.append("clientSecret", clientSecret);
      formData.append("certificate", crtFile);
      formData.append("privateKey", keyFile);

      await configureBankConnection(formData);

      addLog("Certificado apresentado e validado pelo Banco Inter com sucesso");
      addLog("Conexão estabelecida e credenciais salvas no cofre");

      const newStatus = await fetchBankConnectionStatus();
      setStatus(newStatus);
    } catch (err: any) {
      addLog(`Falha na validação: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleRevoke = async () => {
    if (
      !window.confirm(
        "Tem certeza que deseja revogar as credenciais do banco? Os PDVs não poderão verificar pagamentos novos.",
      )
    )
      return;

    setUploading(true);
    addLog("Revogando credenciais do cofre...");

    try {
      await revokeBankConnection();
      addLog("Credenciais revogadas com sucesso. Conexão desativada.");

      const newStatus = await fetchBankConnectionStatus();
      setStatus(newStatus);
    } catch (err: any) {
      addLog(`Falha ao revogar conexão: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSavePixKey = async () => {
    if (!pixKey.trim()) return;
    setSavingPix(true);
    addLog(`Atualizando chave Pix para o tipo: ${pixKeyType}...`);
    try {
      await configurePixKey({ key: pixKey.trim(), type: pixKeyType });
      setCurrentPixKey({ key: pixKey.trim(), type: pixKeyType });
      addLog("Chave Pix atualizada com sucesso. PDVs recriando QR Codes...");
    } catch (err: any) {
      addLog(`Erro ao salvar chave Pix: ${err.message}`);
      
    } finally {
      setSavingPix(false);
    }
  };

  const runTest = async () => {
    if (!isConnected || testing) return;
    setTesting(true);
    addLog("Consultando status da conexão mTLS no cofre...");

    try {
      const data = await fetchBankConnectionStatus();
      setStatus(data);

      if (data.configured && data.handshakeVerified) {
        addLog(`Conexão OK. Provedor: ${data.provider}`);
        addLog(
          `Certificado expira em: ${new Date(data.integrationNotAfter!).toLocaleDateString("pt-BR")} (${data.daysUntilExpiry} dias)`,
        );
      } else if (data.configured && !data.handshakeVerified) {
        addLog(
          "Aviso: Configuração presente, mas o teste inicial (handshake) falhou.",
        );
      } else {
        addLog("Nenhuma conexão configurada no momento.");
      }
    } catch (err: any) {
      addLog(`Falha ao consultar status: ${err.message}`);
    } finally {
      setTesting(false);
    }
  };

  const certsOk = crtFile && keyFile && clientId && clientSecret;
  const isConnected = status?.configured === true;

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <Eyebrow>Autenticação bancária</Eyebrow>
              <div className="font-display text-[15px] font-semibold text-stone-800">
                Certificados mTLS e API
              </div>
            </div>
            {isConnected ? (
              <StatusPill status="ativo" />
            ) : (
              <StatusPill status="pendente" />
            )}
          </div>
          
          <div className="mb-5 text-[13px] leading-relaxed text-stone-500">
            Para que o Pixie consiga identificar os pagamentos no seu extrato e confirmar recebimentos automaticamente, é <strong>obrigatório</strong> conectar as credenciais e certificados da API do seu Banco Inter.
          </div>

          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] font-medium text-stone-500 uppercase tracking-wider">
                Client ID
              </label>
              <input
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="Ex: bd23a-f432-..."
                className="w-full rounded-md border border-stone-200 px-3 py-2 text-[13px] text-stone-700 outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium text-stone-500 uppercase tracking-wider">
                Client Secret
              </label>
              <input
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                type="password"
                placeholder="Ex: 8f42d..."
                className="w-full rounded-md border border-stone-200 px-3 py-2 text-[13px] text-stone-700 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Dropzone
              label="Certificado (.crt)"
              hint="arraste o arquivo ou clique"
              filled={!!crt}
              filename={crt}
              onDrop={(name, file) => {
                setCrt(name);
                if (file) setCrtFile(file);
              }}
            />
            <Dropzone
              label="Chave privada (.key)"
              hint="arraste o arquivo ou clique"
              filled={!!key}
              filename={key}
              onDrop={(name, file) => {
                setKey(name);
                if (file) setKeyFile(file);
              }}
            />
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
            {!isConnected ? (
              <button
                onClick={handleUpload}
                disabled={!certsOk || uploading}
                className={`flex w-full items-center justify-center gap-2 rounded-md px-3.5 py-2 text-[13px] font-medium transition-colors sm:w-auto ${
                  !certsOk
                    ? "cursor-not-allowed bg-stone-100 text-stone-400"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                <UploadCloud className="h-4 w-4" />
                {uploading ? "Configurando..." : "Salvar Configuração"}
              </button>
            ) : (
              <button
                onClick={handleRevoke}
                disabled={uploading}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-rose-50 px-3.5 py-2 text-[13px] font-medium text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-colors sm:w-auto"
              >
                <Trash2 className="h-4 w-4" />
                {uploading ? "Aguarde..." : "Revogar conexão"}
              </button>
            )}
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-md bg-stone-50 px-3 py-2.5 text-[11.5px] leading-relaxed text-stone-500">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-400" />
            Os arquivos são criptografados em repouso e isolados por conta.
            Nenhuma outra conta do Pixie tem acesso a estes certificados.
          </div>
        </Card>

        <Card className="p-4 sm:p-5 flex flex-col">
          <div className="mb-4">
            <Eyebrow>Recebimento</Eyebrow>
            <div className="font-display text-[15px] font-semibold text-stone-800">
              Chave Pix principal
            </div>
          </div>

          {currentPixKey && (
            <div className="mb-5 rounded-md border border-emerald-100 bg-emerald-50/50 p-3 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium text-emerald-600 uppercase tracking-wider mb-1">
                  Chave Ativa
                </div>
                <div className="font-mono text-[13px] text-emerald-900 font-medium">
                  {currentPixKey.key}
                </div>
              </div>
              <div className="rounded bg-white border border-emerald-100 px-2 py-1 text-[11px] font-medium text-emerald-600 uppercase">
                {currentPixKey.type === "evp"
                  ? "Aleatória"
                  : currentPixKey.type}
              </div>
            </div>
          )}

          <div className="mb-3 flex flex-wrap gap-1.5 rounded-md bg-stone-100 p-1 ">
            {(["cpf", "cnpj", "email", "telefone", "evp"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setPixKeyType(t)}
                className={`flex-1 rounded px-2 py-1.5 text-[12px] font-medium capitalize transition-colors cursor-pointer ${
                  pixKeyType === t
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-stone-500 hover:text-stone-700"
                }`}
              >
                {t === "evp" ? "Aleatória" : t}
              </button>
            ))}
          </div>
          <label className="mb-1.5 block text-[12px] font-medium text-stone-500">
            {currentPixKey ? "Nova Chave" : "Chave"}
          </label>
          <div className="flex items-center gap-2 rounded-md border border-stone-200 px-3 py-2.5">
            <KeyRound className="h-4 w-4 shrink-0 text-stone-400" />
            <input
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              placeholder="Digite sua chave Pix"
              className="w-full bg-transparent font-mono text-[13px] text-stone-700 outline-none"
            />
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleSavePixKey}
              disabled={!pixKey.trim() || savingPix}
              className={`flex w-full items-center justify-center gap-2 rounded-md px-3.5 py-2 text-[13px] font-medium transition-colors sm:w-auto cursor-pointer ${
                !pixKey.trim() || savingPix
                  ? "cursor-not-allowed bg-stone-100 text-stone-400"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              <Save className="h-4 w-4" />
              {savingPix ? "Salvando..." : "Salvar Chave Pix"}
            </button>
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
              Terminal de Conexão
            </div>
          </div>
          <button
            onClick={runTest}
            disabled={!isConnected || testing}
            className={`flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-[13px] font-medium transition-colors sm:w-auto ${
              !isConnected
                ? "cursor-not-allowed bg-stone-100 text-stone-400"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            {testing ? "Testando…" : "Testar conexão"}
          </button>
        </div>
        {!isConnected && (
          <div className="flex items-center gap-2 bg-amber-50 px-4 py-2.5 text-[12px] text-amber-700 sm:px-5">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> Salve a
            configuração de certificados para habilitar o teste.
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
