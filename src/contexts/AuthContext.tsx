import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Account, Owner } from "../lib/api";
import {
  clearTokens,
  getAccessToken,
  logoutAccount,
  setTokens,
} from "../lib/api";

interface AuthContextType {
  isAuthenticated: boolean;
  owner: Owner | null;
  account: Account | null;
  login: (
    access: string,
    refresh: string,
    owner: Owner,
    account: Account,
  ) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [owner, setOwner] = useState<Owner | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check initial state from localStorage
    const token = getAccessToken();
    const storedOwner = localStorage.getItem("@Pixie:owner");
    const storedAccount = localStorage.getItem("@Pixie:account");

    if (token && storedOwner && storedAccount) {
      setIsAuthenticated(true);
      try {
        setOwner(JSON.parse(storedOwner));
        setAccount(JSON.parse(storedAccount));
      } catch {
        // failed to parse, force logout
        clearTokens();
        setIsAuthenticated(false);
      }
    }

    setIsLoading(false);
  }, []);

  const login = (
    access: string,
    refresh: string,
    ownerData: Owner,
    accountData: Account,
  ) => {
    setTokens(access, refresh);
    localStorage.setItem("@Pixie:owner", JSON.stringify(ownerData));
    localStorage.setItem("@Pixie:account", JSON.stringify(accountData));

    setOwner(ownerData);
    setAccount(accountData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await logoutAccount();
    } finally {
      clearTokens();
      setOwner(null);
      setAccount(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, owner, account, login, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
