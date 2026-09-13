import {
  AlertTriangle,
  Laptop,
  Loader2,
  Power,
  Smartphone,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  endPdvSession,
  fetchPdvSessions,
  type PdvSession,
} from "../../lib/api";
import { Card } from "../ui/Card";

interface PdvSessionsModalProps {
  pdvId: string;
  pdvName: string;
  onClose: () => void;
}

export function PdvSessionsModal({
  pdvId,
  pdvName,
  onClose,
}: PdvSessionsModalProps) {
  const [sessions, setSessions] = useState<PdvSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [endingSessionId, setEndingSessionId] = useState<string | null>(null);

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPdvSessions(pdvId);
      setSessions(data);
    } catch (err) {
      setError("Não foi possível carregar as sessões.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdvId]);

  const handleEndSession = async (sessionId: string) => {
    if (
      !window.confirm(
        "O vendedor precisará do código de acesso novamente para entrar. Deseja encerrar a sessão?",
      )
    ) {
      return;
    }

    setEndingSessionId(sessionId);
    try {
      await endPdvSession(pdvId, sessionId);
      await loadSessions();
    } catch (err) {
      
    } finally {
      setEndingSessionId(null);
    }
  };

  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 px-4">
      <Card className="w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4 shrink-0">
          <div>
            <div className="font-display text-[15px] font-semibold text-stone-800">
              Sessões Ativas
            </div>
            <div className="text-[12px] text-stone-500 mt-0.5">
              PDV: <span className="font-medium text-stone-700">{pdvName}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 rounded-md p-1 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 bg-stone-50/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-stone-400">
              <Loader2 className="h-8 w-8 animate-spin mb-3" />
              <p className="text-[13px] font-medium">
                Buscando dispositivos...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <AlertTriangle className="h-8 w-8 text-rose-400 mb-3" />
              <div className="text-[14px] font-semibold text-rose-700 mb-1">
                Falha na conexão
              </div>
              <div className="text-[13px] text-stone-500 max-w-xs">{error}</div>
              <button
                onClick={loadSessions}
                className="mt-4 text-[13px] font-medium text-emerald-600 hover:text-emerald-700 underline"
              >
                Tentar novamente
              </button>
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-stone-500">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 mb-3">
                <Laptop className="h-5 w-5 text-stone-400" />
              </div>
              <p className="text-[13.5px] font-medium text-stone-700">
                Nenhum dispositivo conectado
              </p>
              <p className="text-[12px] mt-1 max-w-[250px]">
                O vendedor ainda não inseriu o código de acesso para este PDV.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => {
                const isMobile =
                  session.userAgent.toLowerCase().includes("mobile") ||
                  session.userAgent.toLowerCase().includes("android") ||
                  session.userAgent.toLowerCase().includes("iphone");
                return (
                  <div
                    key={session.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-stone-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-50 text-stone-500 border border-stone-100 mt-0.5">
                        {isMobile ? (
                          <Smartphone className="h-5 w-5" />
                        ) : (
                          <Laptop className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-[13px] font-semibold text-stone-800 line-clamp-1 break-all"
                            title={session.userAgent}
                          >
                            {session.userAgent || "Navegador Desconhecido"}
                          </span>
                          {session.isActive ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wider shrink-0">
                              Ativa
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-500 uppercase tracking-wider shrink-0">
                              Expirada
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col text-[11.5px] text-stone-500">
                          <span>
                            Acesso:{" "}
                            <span className="text-stone-700">
                              {formatDate(session.startedAt)}
                            </span>
                          </span>
                          <span>
                            Visto por último:{" "}
                            <span className="text-stone-700">
                              {formatDate(session.lastSeenAt)}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {session.isActive && (
                      <button
                        onClick={() => handleEndSession(session.id)}
                        disabled={endingSessionId === session.id}
                        className={`shrink-0 flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-[12px] font-medium transition-colors ${
                          endingSessionId === session.id
                            ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                            : "bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 border border-rose-100"
                        }`}
                      >
                        {endingSessionId === session.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Power className="h-3.5 w-3.5" />
                        )}
                        Desconectar
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
