// ---------------------------------------------------------------------------
// Configurações da API
// ---------------------------------------------------------------------------

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3333";

// ---------------------------------------------------------------------------
// Tipos de Dados da API
// ---------------------------------------------------------------------------

export interface Owner {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  lastLoginAt: string;
}

export interface Account {
  id: string;
  businessName: string;
  document: string;
  status: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  owner: Owner;
  account: Account;
}

export interface RefreshResponse {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
}

export type PdvStatus = "ativo" | "pendente" | "inativo";

export interface PdvSummary {
  id: string;
  name: string;
  prefix: string;
  status: PdvStatus;
  todayCents: number;
  monthCents: number;
  transactionsThisMonth: number;
}

export interface DashboardOverviewResponse {
  totalTodayCents: number;
  totalMonthCents: number;
  estimatedSavingsCents: number;
  activePdvs: number;
  totalPdvs: number;
  pdvs: PdvSummary[];
}

export interface BankConnectionStatus {
  configured: boolean;
  provider?: string;
  integrationNotAfter?: string;
  daysUntilExpiry?: number;
  status: "ok" | "expiring_soon" | "expired" | "not_configured";
  handshakeVerified?: boolean;
  updatedAt?: string;
}

export type PixKeyType = "cpf" | "cnpj" | "email" | "telefone" | "evp";

export interface PixKeyInfo {
  key: string;
  type: PixKeyType;
}

export interface ErrorResponse {
  message: string;
  detail?: string;
}

export interface CreatePdvRequest {
  name: string;
}

export interface CreatePdvResponse {
  id: string;
  name: string;
  prefix: string;
  status: PdvStatus;
  accessCode: string;
}

export interface RotateAccessCodeResponse {
  accessCode: string;
}

export interface PdvSession {
  id: string;
  startedAt: string;
  lastSeenAt: string;
  userAgent: string;
  isActive: boolean;
}

export interface PdvQrCodeInfo {
  emvPayload: string;
  imageUrlSvg: string;
  imageUrlPng: string;
  version: number;
  merchantName: string;
}

// ---------------------------------------------------------------------------
// Gerenciamento de Tokens
// ---------------------------------------------------------------------------

export function getAccessToken() {
  return localStorage.getItem("@Pixie:accessToken");
}

export function getRefreshToken() {
  return localStorage.getItem("@Pixie:refreshToken");
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem("@Pixie:accessToken", access);
  localStorage.setItem("@Pixie:refreshToken", refresh);
}

export function clearTokens() {
  localStorage.removeItem("@Pixie:accessToken");
  localStorage.removeItem("@Pixie:refreshToken");
  localStorage.removeItem("@Pixie:owner");
  localStorage.removeItem("@Pixie:account");
}

// ---------------------------------------------------------------------------
// Cliente Fetch com Auth
// ---------------------------------------------------------------------------

let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = getAccessToken();
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Prepara request
  const reqOptions: RequestInit = {
    ...options,
    headers,
  };

  let response = await fetch(`${API_BASE_URL}${endpoint}`, reqOptions);

  if (
    response.status === 401 &&
    !endpoint.includes("/api/auth/login") &&
    !endpoint.includes("/api/auth/refresh")
  ) {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      window.location.href = "/#/login";
      throw new Error("Sessão expirada.");
    }

    if (isRefreshing) {
      return new Promise<Response>((resolve, reject) => {
        failedQueue.push({
          resolve: () => resolve(fetchWithAuth(endpoint, options)),
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!refreshRes.ok) {
        throw new Error("Falha ao renovar token");
      }

      const refreshData = (await refreshRes.json()) as RefreshResponse;
      setTokens(refreshData.accessToken, refreshData.refreshToken);
      processQueue(null, refreshData.accessToken);

      // Refaz a requisição original com novo token
      headers.set("Authorization", `Bearer ${refreshData.accessToken}`);
      reqOptions.headers = headers;
      response = await fetch(`${API_BASE_URL}${endpoint}`, reqOptions);
    } catch (err) {
      processQueue(err as Error, null);
      clearTokens();
      window.location.href = "/#/login";
      throw new Error("Sessão expirada.");
    } finally {
      isRefreshing = false;
    }
  }

  if (!response.ok) {
    let errorMsg = "Erro na requisição.";
    try {
      const clone = response.clone();
      const errorData = (await clone.json()) as ErrorResponse;
      if (errorData.message) errorMsg = errorData.message;
    } catch {
      // Ignora erro de parse
    }
    throw new Error(errorMsg);
  }

  return response;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export async function fetchDashboardOverview(): Promise<DashboardOverviewResponse> {
  const res = await fetchWithAuth("/api/dashboard");
  return res.json();
}

export async function fetchPdvs(): Promise<PdvSummary[]> {
  const res = await fetchWithAuth("/api/pdvs");
  // Assumindo que a resposta possa ser o array direto ou um objeto com a propriedade pdvs
  const data = await res.json();
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.pdvs)) return data.pdvs;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
}

export async function createPdv(name: string): Promise<CreatePdvResponse> {
  const res = await fetchWithAuth("/api/pdvs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return res.json();
}

export async function updatePdv(
  id: string,
  data: { name?: string; status?: "ativo" | "inativo" },
): Promise<void> {
  await fetchWithAuth(`/api/pdvs/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function rotatePdvAccessCode(
  id: string,
): Promise<RotateAccessCodeResponse> {
  const res = await fetchWithAuth(`/api/pdvs/${id}/rotate-access-code`, {
    method: "POST",
  });
  return res.json();
}

export async function fetchPdvSessions(pdvId: string): Promise<PdvSession[]> {
  const res = await fetchWithAuth(`/api/pdvs/${pdvId}/sessions`);
  return res.json();
}

export async function fetchPdvQrCode(pdvId: string): Promise<PdvQrCodeInfo> {
  const res = await fetchWithAuth(`/api/pdvs/${pdvId}/qrcode`);
  return res.json();
}

export async function configureBankConnection(formData: FormData): Promise<void> {
  const res = await fetchWithAuth("/api/connection/bank-credentials", {
    method: "POST",
    body: formData,
    headers: {}, // fetch automatically sets multipart/form-data boundary
  });
  if (!res.ok) {
    throw new Error("Erro de validação ou certificado rejeitado");
  }
}

export async function revokeBankConnection(): Promise<void> {
  const res = await fetchWithAuth("/api/connection/bank-credentials", {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("Erro ao revogar conexão bancária");
  }
}

export async function fetchPixKey(): Promise<PixKeyInfo> {
  const res = await fetchWithAuth("/api/pix-keys");
  return res.json();
}

export async function configurePixKey(data: PixKeyInfo): Promise<void> {
  const res = await fetchWithAuth("/api/pix-keys", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("Erro ao configurar chave Pix");
  }
}

export async function fetchBankConnectionStatus(): Promise<BankConnectionStatus> {
  const res = await fetchWithAuth("/api/connection/bank-credentials/status");
  return res.json();
}

export async function endPdvSession(
  pdvId: string,
  sessionId: string,
): Promise<void> {
  await fetchWithAuth(`/api/pdvs/${pdvId}/sessions/${sessionId}`, {
    method: "DELETE",
  });
}

export async function logoutAccount(): Promise<void> {
  await fetchWithAuth("/api/auth/logout", {
    method: "DELETE",
  }).catch(() => {
    // Ignorar erros na deslogada via API, para forçar limpeza local
  });
}
