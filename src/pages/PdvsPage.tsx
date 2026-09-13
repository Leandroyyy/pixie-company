import { PdvsPage as PdvsContent } from "../components/pdvs/PdvsPage";
import { usePdvs } from "../contexts/PdvContext";

export default function PdvsPage() {
  const { pdvs, loading, error, addPdv, editPdv, rotateCode } = usePdvs();

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-[14px] font-medium text-stone-500">
          Carregando pontos de venda...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="text-[14px] font-semibold text-rose-600">
            Falha na conexão
          </div>
          <div className="text-[13px] text-stone-500 max-w-sm">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <PdvsContent
      pdvs={pdvs}
      onAddPdv={addPdv}
      onEditPdv={editPdv}
      onRotateCode={rotateCode}
    />
  );
}
