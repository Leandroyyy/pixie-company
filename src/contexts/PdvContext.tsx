import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  createPdv,
  fetchPdvs,
  rotatePdvAccessCode,
  updatePdv,
  type CreatePdvResponse,
  type PdvSummary,
  type RotateAccessCodeResponse,
} from "../lib/api";
import { useAuth } from "./AuthContext";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface PdvContextValue {
  pdvs: PdvSummary[];
  loading: boolean;
  error: string | null;
  refreshPdvs: () => Promise<void>;
  addPdv: (name: string) => Promise<CreatePdvResponse>;
  editPdv: (
    id: string,
    data: { name?: string; status?: "ativo" | "inativo" },
  ) => Promise<void>;
  rotateCode: (id: string) => Promise<RotateAccessCodeResponse>;
}

const PdvContext = createContext<PdvContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface PdvProviderProps {
  children: ReactNode;
}

export function PdvProvider({ children }: PdvProviderProps) {
  const [pdvs, setPdvs] = useState<PdvSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const refreshPdvs = async () => {
    try {
      if (!initialized) setLoading(true);
      setError(null);
      const data = await fetchPdvs();
      setPdvs(data);
      setInitialized(true);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar PDVs");
    } finally {
      if (!initialized) setLoading(false);
    }
  };

  const addPdv = async (name: string) => {
    const newPdv = await createPdv(name);
    await refreshPdvs(); // Refresh the list
    return newPdv;
  };

  const editPdv = async (
    id: string,
    data: { name?: string; status?: "ativo" | "inativo" },
  ) => {
    await updatePdv(id, data);
    await refreshPdvs();
  };

  const rotateCode = async (id: string) => {
    return await rotatePdvAccessCode(id);
  };

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      refreshPdvs();
    } else {
      setPdvs([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  return (
    <PdvContext.Provider
      value={{ pdvs, loading, error, refreshPdvs, addPdv, editPdv, rotateCode }}
    >
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
