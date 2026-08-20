import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { initialPdvs } from "../data/initialPdvs";
import type { Pdv } from "../data/initialPdvs";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface PdvContextValue {
  pdvs: Pdv[];
  setPdvs: Dispatch<SetStateAction<Pdv[]>>;
}

const PdvContext = createContext<PdvContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface PdvProviderProps {
  children: ReactNode;
}

export function PdvProvider({ children }: PdvProviderProps) {
  const [pdvs, setPdvs] = useState<Pdv[]>(initialPdvs);

  return (
    <PdvContext.Provider value={{ pdvs, setPdvs }}>
      {children}
    </PdvContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function usePdvs(): PdvContextValue {
  const ctx = useContext(PdvContext);
  if (!ctx) {
    throw new Error("usePdvs deve ser usado dentro de <PdvProvider>");
  }
  return ctx;
}
