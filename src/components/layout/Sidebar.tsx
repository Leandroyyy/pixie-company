import {
  LayoutGrid,
  Menu,
  Radio,
  ShieldCheck,
  Store,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

const items: NavItem[] = [
  { to: "/", label: "Visão geral", icon: LayoutGrid },
  { to: "/seguranca", label: "Segurança e conexão", icon: ShieldCheck },
  { to: "/pdvs", label: "Pontos de venda", icon: Store },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const { pathname } = useLocation();

  return (
    <>
      {/* mobile overlay */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-stone-900/40 lg:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-64 shrink-0 -translate-x-full flex-col bg-emerald-950 text-stone-300 transition-transform duration-200 ease-out lg:static lg:z-auto lg:translate-x-0 ${
          open ? "translate-x-0" : ""
        }`}
      >
        <div className="flex items-center justify-between gap-2.5 px-6 py-6">
          <Link to="/" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-400 text-emerald-950">
              <Radio className="h-4 w-4" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-display text-[17px] font-semibold leading-none text-white">
                Pixie
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-500">
                PixFree
              </div>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-4 flex-1 px-3">
          {items.map((it) => {
            const Icon = it.icon;
            const active = pathname === it.to;
            return (
              <Link
                key={it.to}
                to={it.to}
                onClick={onClose}
                className={`group relative mb-1 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-[13.5px] transition-colors ${
                  active
                    ? "bg-emerald-900/70 text-white"
                    : "text-stone-400 hover:bg-emerald-900/40 hover:text-stone-100"
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-emerald-400" />
                )}
                <Icon className="h-[17px] w-[17px]" strokeWidth={2} />
                {it.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-emerald-900/70 px-4 py-4">
          <div className="flex items-center gap-2.5 rounded-md bg-emerald-900/40 px-3 py-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-700 font-mono text-[11px] font-semibold text-emerald-50">
              LB
            </div>
            <div className="min-w-0">
              <div className="truncate text-[12.5px] text-stone-100">
                Loja do Bairro Ltda
              </div>
              <div className="font-mono text-[10px] text-emerald-500">
                conta verificada
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

// ---------------------------------------------------------------------------
// Mobile top bar (usado no AppLayout)
// ---------------------------------------------------------------------------

interface MobileTopBarProps {
  onMenuClick: () => void;
}

export function MobileTopBar({ onMenuClick }: MobileTopBarProps) {
  return (
    <div className="flex items-center gap-3 border-b border-stone-200 bg-white px-4 py-3.5 lg:hidden">
      <button
        onClick={onMenuClick}
        className="text-stone-500 hover:text-stone-700"
      >
        <Menu className="h-5 w-5" />
      </button>
      <Link to="/" className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-600 text-white">
          <Radio className="h-3.5 w-3.5" strokeWidth={2.5} />
        </div>
        <span className="font-display text-[15px] font-semibold text-stone-800">
          Pixie
        </span>
      </Link>
    </div>
  );
}
