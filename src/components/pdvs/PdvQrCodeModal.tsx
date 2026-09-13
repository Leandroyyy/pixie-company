import { AlertTriangle, Check, Copy, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchPdvQrCode, type PdvQrCodeInfo } from "../../lib/api";
import { Card } from "../ui/Card";

interface PdvQrCodeModalProps {
  pdvId: string;
  pdvName: string;
  onClose: () => void;
}

export function PdvQrCodeModal({
  pdvId,
  pdvName,
  onClose,
}: PdvQrCodeModalProps) {
  const [info, setInfo] = useState<PdvQrCodeInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPdvQrCode(pdvId);
        setInfo(data);
      } catch (err: any) {
        // We know that if it's inactive, the API will probably return 400 or 404 or 409
        setError(err.message || "Não foi possível carregar o QR Code.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [pdvId]);

  const handleCopy = () => {
    if (info?.emvPayload) {
      navigator.clipboard.writeText(info.emvPayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 px-4">
      <Card className="w-full max-w-sm overflow-hidden flex flex-col">
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4 shrink-0">
          <div>
            <div className="font-display text-[15px] font-semibold text-stone-800">
              QR Code Pix
            </div>
            <div className="text-[12px] text-stone-500 mt-0.5">
              PDV: <span className="font-medium text-stone-700">{pdvName}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 rounded-md p-1 hover:bg-stone-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 bg-stone-50/50 flex flex-col items-center">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-stone-400">
              <Loader2 className="h-8 w-8 animate-spin mb-3" />
              <p className="text-[13px] font-medium">Gerando imagem...</p>
            </div>
          ) : error || !info ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <AlertTriangle className="h-8 w-8 text-rose-400 mb-3" />
              <div className="text-[14px] font-semibold text-rose-700 mb-1">
                QR Code não disponível
              </div>
              <div className="text-[13px] text-stone-500 max-w-[250px]">
                {error === "Não autorizado"
                  ? "Verifique se o PDV está Ativo. O QR Code só é gerado quando o PDV está funcionando."
                  : "O PDV precisa estar ativo para exibir o QR Code."}
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
              <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm mb-5">
                <img
                  src={info.imageUrlSvg}
                  alt="QR Code do PDV"
                  className="w-48 h-48 object-contain"
                />
              </div>

              <div className="w-full space-y-1">
                <label className="text-[11.5px] font-medium text-stone-500 uppercase tracking-wider">
                  Pix Copia e Cola
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 overflow-hidden rounded-md border border-stone-200 bg-white px-3 py-2">
                    <div className="truncate font-mono text-[12px] text-stone-600">
                      {info.emvPayload}
                    </div>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex shrink-0 h-9 w-9 items-center justify-center rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                    title="Copiar código"
                  >
                    {copied ? (
                      <Check className="h-4.5 w-4.5" />
                    ) : (
                      <Copy className="h-4.5 w-4.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="w-full mt-4 rounded-md bg-stone-100 px-3 py-2.5 text-[11.5px] text-stone-500 text-center">
                Recebedor:{" "}
                <span className="font-semibold text-stone-700">
                  {info.merchantName}
                </span>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
