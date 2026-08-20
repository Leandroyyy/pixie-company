import { PdvsPage as PdvsContent } from "../components/pdvs/PdvsPage";
import { usePdvs } from "../contexts/PdvContext";

export default function PdvsPage() {
  const { pdvs, setPdvs } = usePdvs();
  return <PdvsContent pdvs={pdvs} setPdvs={setPdvs} />;
}
