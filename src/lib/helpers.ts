// ---------------------------------------------------------------------------
// helpers — formatação, geração de códigos, utilidades comuns
// ---------------------------------------------------------------------------

/** Formata um número como moeda brasileira (R$). */
export const BRL = (n: number): string =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Gera um código numérico aleatório de 6 dígitos. */
export const randCode = (): string =>
  String(Math.floor(100000 + Math.random() * 900000));

/** Deriva um prefixo de txid (até 4 chars) a partir de um nome. */
export const prefixFrom = (name: string): string =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .trim()
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 4)
    .padEnd(3, "X");

/** Retorna a hora atual formatada como HH:MM:SS. */
export const nowHM = (): string =>
  new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
