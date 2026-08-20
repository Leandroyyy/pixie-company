import { DashboardPage as DashboardContent } from "../components/dashboard/DashboardPage";
import { usePdvs } from "../contexts/PdvContext";

export default function DashboardPage() {
  const { pdvs } = usePdvs();
  return <DashboardContent pdvs={pdvs} />;
}
