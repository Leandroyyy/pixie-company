import { LayoutGrid, Store, TrendingDown, Wallet } from "lucide-react";
import type { DashboardOverviewResponse } from "../../lib/api";
import { BRL } from "../../lib/helpers";
import { Card } from "../ui/Card";
import { Eyebrow } from "../ui/Eyebrow";
import { StatusPill } from "../ui/StatusPill";
import { KPI } from "./KPI";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DashboardPageProps {
  data: DashboardOverviewResponse;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DashboardPage({ data }: DashboardPageProps) {

  const totalTransactions = data.pdvs.reduce(
    (s, p) => s + p.transactionsThisMonth,
    0
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KPI
          icon={Wallet}
          eyebrow="Recebido hoje"
          value={BRL(data.totalTodayCents / 100)}
          sub={`${totalTransactions} transações no mês`}
        />
        <KPI
          icon={TrendingDown}
          eyebrow="Economia em taxas"
          value={BRL(data.estimatedSavingsCents / 100)}
          sub="vs. 1% do Pix Comercial"
          tone="good"
        />
        <KPI
          icon={LayoutGrid}
          eyebrow="Volume do mês"
          value={BRL(data.totalMonthCents / 100)}
          sub="acumulado, todos os PDVs"
        />
        <KPI
          icon={Store}
          eyebrow="PDVs ativos"
          value={`${data.activePdvs} / ${data.totalPdvs}`}
          sub="pontos de venda conectados"
        />
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-stone-100 px-4 py-4 sm:px-5">
          <div>
            <Eyebrow>Pontos de venda</Eyebrow>
            <div className="font-display text-[15px] font-semibold text-stone-800">
              Resumo por PDV
            </div>
          </div>
        </div>

        {/* table on sm+ */}
        <table className="hidden w-full sm:table">
          <thead>
            <tr className="text-left font-mono text-[10.5px] uppercase tracking-wider text-stone-400">
              <th className="px-5 py-2.5 font-medium">PDV</th>
              <th className="px-5 py-2.5 font-medium">Prefixo txid</th>
              <th className="px-5 py-2.5 font-medium">Hoje</th>
              <th className="px-5 py-2.5 font-medium">Mês</th>
              <th className="px-5 py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {data.pdvs.map((p) => (
              <tr key={p.id} className="text-[13px] text-stone-700">
                <td className="px-5 py-3 font-medium">{p.name}</td>
                <td className="px-5 py-3 font-mono text-stone-500">
                  {p.prefix}-****
                </td>
                <td className="px-5 py-3 font-mono tabular-nums">
                  {BRL(p.todayCents / 100)}
                </td>
                <td className="px-5 py-3 font-mono tabular-nums text-stone-500">
                  {BRL(p.monthCents / 100)}
                </td>
                <td className="px-5 py-3">
                  <StatusPill status={p.status as any} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* stacked cards on mobile */}
        <div className="divide-y divide-stone-100 sm:hidden">
          {data.pdvs.map((p) => (
            <div key={p.id} className="px-4 py-3.5">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-[13.5px] font-medium text-stone-800">
                  {p.name}
                </div>
                <StatusPill status={p.status as any} />
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-mono text-stone-400">
                  {p.prefix}-****
                </span>
                <span className="font-mono tabular-nums text-stone-600">
                  hoje <span className="text-stone-800">{BRL(p.todayCents / 100)}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
