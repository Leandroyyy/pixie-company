import { MailWarning, Settings2 } from "lucide-react";
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { MobileTopBar, Sidebar } from "./Sidebar";

// ---------------------------------------------------------------------------
// Page metadata derivada da rota
// ---------------------------------------------------------------------------

interface PageMeta {
  title: string;
  desc: string;
}

const routeMeta: Record<string, PageMeta> = {
  "/": { title: "Visão geral", desc: "Volume recebido e resumo por PDV" },
  "/seguranca": {
    title: "Segurança e conexão",
    desc: "Certificados mTLS e chave Pix principal",
  },
  "/pdvs": {
    title: "Pontos de venda",
    desc: "Gerencie caixas, prefixos e códigos de acesso",
  },
};

const fallbackMeta: PageMeta = { title: "Pixie", desc: "" };

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

export function AppLayout() {
  const [navOpen, setNavOpen] = useState(false);
  const { pathname } = useLocation();
  const meta = routeMeta[pathname] ?? fallbackMeta;
  const { owner } = useAuth();

  return (
    <div className="flex h-full min-h-[720px] w-full bg-stone-50">
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* mobile top bar */}
        <MobileTopBar onMenuClick={() => setNavOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
            <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6">
              <div className="min-w-0">
                <div className="truncate font-display text-[18px] font-semibold text-stone-800 sm:text-[20px]">
                  {meta.title}
                </div>
                <div className="truncate text-[12.5px] text-stone-400 sm:text-[13px]">
                  {meta.desc}
                </div>
              </div>
              <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-stone-200 bg-white text-stone-500 hover:bg-stone-50 sm:hidden">
                <Settings2 className="h-4 w-4" />
              </button>
            </div>

            {owner && !owner.emailVerified && (
              <div className="mb-5 rounded-md border border-amber-200 bg-amber-50 p-4 sm:mb-6">
                <div className="flex">
                  <div className="shrink-0">
                    <MailWarning
                      className="h-5 w-5 text-amber-500"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-amber-800">
                      Conta aguardando ativação
                    </h3>
                    <div className="mt-1 text-sm text-amber-700">
                      <p>
                        Enviamos um link de confirmação para o seu e-mail (
                        <strong>{owner.email}</strong>). Por favor, verifique
                        sua caixa de entrada para ativar sua conta e ter acesso
                        completo ao sistema.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
