import { useEffect, useState } from "react";
import { DashboardPage as DashboardContent } from "../components/dashboard/DashboardPage";
import { fetchDashboardOverview } from "../lib/api";
import type { DashboardOverviewResponse } from "../lib/api";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchDashboardOverview();
        if (mounted) {
          setData(result);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || "Erro ao carregar os dados do dashboard.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-[14px] font-medium text-stone-500">
          Carregando dados do dashboard...
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
          <div className="text-[13px] text-stone-500 max-w-sm">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return <DashboardContent data={data} />;
}
