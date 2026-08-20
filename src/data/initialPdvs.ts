// ---------------------------------------------------------------------------
// Tipos e dados iniciais de PDVs (pontos de venda)
// ---------------------------------------------------------------------------

export type PdvStatus = "ativo" | "pendente" | "matched" | "aguardando" | "risco";

export interface Pdv {
  id: number;
  name: string;
  prefix: string;
  code: string;
  status: PdvStatus;
  today: number;
  month: number;
  tx: number;
}

export const initialPdvs: Pdv[] = [
  {
    id: 1,
    name: "Caixa Balcão",
    prefix: "CXB",
    code: "482913",
    status: "ativo",
    today: 842.5,
    month: 18420.0,
    tx: 46,
  },
  {
    id: 2,
    name: "Loja Shopping Sul",
    prefix: "LSS",
    code: "119274",
    status: "ativo",
    today: 1230.0,
    month: 27110.4,
    tx: 71,
  },
  {
    id: 3,
    name: "Delivery / App",
    prefix: "DLV",
    code: "703355",
    status: "pendente",
    today: 0,
    month: 4210.0,
    tx: 12,
  },
];
