import {
  AlertTriangle,
  Check,
  CircleDot,
  Copy,
  Eye,
  EyeOff,
  FileKey2,
  KeyRound,
  LayoutGrid,
  Menu,
  Plus,
  QrCode,
  Radio,
  Settings2,
  ShieldCheck,
  Store,
  Terminal,
  TrendingDown,
  Upload,
  Wallet,
  X,
} from "lucide-react";
import { useRef, useState } from "react";

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

const BRL = (n) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const randCode = () => String(Math.floor(100000 + Math.random() * 900000));

const prefixFrom = (name) =>
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

const nowHM = () =>
  new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

const initialPdvs = [
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

// ---------------------------------------------------------------------------
// shared bits
// ---------------------------------------------------------------------------

function StatusPill({ status }) {
  const map = {
    ativo: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    pendente: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    matched: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    aguardando: "bg-stone-100 text-stone-500 ring-1 ring-stone-200",
    risco: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  };
  const label = {
    ativo: "Ativo",
    pendente: "Pendente",
    matched: "Conciliado",
    aguardando: "Aguardando",
    risco: "Atenção",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${map[status]}`}
    >
      <CircleDot className="h-3 w-3" strokeWidth={3} />
      {label[status]}
    </span>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-lg border border-stone-200 bg-white ${className}`}>
      {children}
    </div>
  );
}

function Eyebrow({ children }) {
  return (
    <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-stone-400">
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

function Sidebar({ page, setPage, open, onClose }) {
  const items = [
    { id: "dashboard", label: "Visão geral", icon: LayoutGrid },
    { id: "security", label: "Segurança e conexão", icon: ShieldCheck },
    { id: "pdvs", label: "Pontos de venda", icon: Store },
  ];
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
          <div className="flex items-center gap-2.5">
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
          </div>
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
            const active = page === it.id;
            return (
              <button
                key={it.id}
                onClick={() => {
                  setPage(it.id);
                  onClose();
                }}
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
              </button>
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
// Dashboard page
// ---------------------------------------------------------------------------

function KPI({ icon: Icon, eyebrow, value, sub, tone = "default" }) {
  const toneMap = {
    default: "text-stone-800",
    good: "text-emerald-700",
  };
  return (
    <Card className="px-4 py-3.5 sm:px-5 sm:py-4">
      <div className="mb-2.5 flex items-center justify-between sm:mb-3">
        <Eyebrow>{eyebrow}</Eyebrow>
        <Icon className="h-4 w-4 shrink-0 text-stone-300" strokeWidth={2} />
      </div>
      <div
        className={`font-display text-[20px] font-semibold leading-none tabular-nums sm:text-[26px] ${toneMap[tone]}`}
      >
        {value}
      </div>
      <div className="mt-1.5 text-[11.5px] text-stone-400 sm:text-[12px]">
        {sub}
      </div>
    </Card>
  );
}

function DashboardPage({ pdvs }) {
  const totalMonth = pdvs.reduce((s, p) => s + p.month, 0);
  const totalToday = pdvs.reduce((s, p) => s + p.today, 0);
  const savings = totalMonth * 0.01;
  const activePdvs = pdvs.filter((p) => p.status === "ativo").length;

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KPI
          icon={Wallet}
          eyebrow="Recebido hoje"
          value={BRL(totalToday)}
          sub={`${pdvs.reduce((s, p) => s + p.tx, 0)} transações no mês`}
        />
        <KPI
          icon={TrendingDown}
          eyebrow="Economia em taxas"
          value={BRL(savings)}
          sub="vs. 1% do Pix Comercial"
          tone="good"
        />
        <KPI
          icon={LayoutGrid}
          eyebrow="Volume do mês"
          value={BRL(totalMonth)}
          sub="acumulado, todos os PDVs"
        />
        <KPI
          icon={Store}
          eyebrow="PDVs ativos"
          value={`${activePdvs} / ${pdvs.length}`}
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
            {pdvs.map((p) => (
              <tr key={p.id} className="text-[13px] text-stone-700">
                <td className="px-5 py-3 font-medium">{p.name}</td>
                <td className="px-5 py-3 font-mono text-stone-500">
                  {p.prefix}-****
                </td>
                <td className="px-5 py-3 font-mono tabular-nums">
                  {BRL(p.today)}
                </td>
                <td className="px-5 py-3 font-mono tabular-nums text-stone-500">
                  {BRL(p.month)}
                </td>
                <td className="px-5 py-3">
                  <StatusPill status={p.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* stacked cards on mobile */}
        <div className="divide-y divide-stone-100 sm:hidden">
          {pdvs.map((p) => (
            <div key={p.id} className="px-4 py-3.5">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-[13.5px] font-medium text-stone-800">
                  {p.name}
                </div>
                <StatusPill status={p.status} />
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-mono text-stone-400">
                  {p.prefix}-****
                </span>
                <span className="font-mono tabular-nums text-stone-600">
                  hoje <span className="text-stone-800">{BRL(p.today)}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Security page
// ---------------------------------------------------------------------------

function Dropzone({
  label,
  hint,
  filled,
  filename,
  onDrop,
  accent = "emerald",
}) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef(null);
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        onDrop(e.dataTransfer.files?.[0]?.name || label);
      }}
      onClick={() => inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-3 py-6 text-center transition-colors sm:px-4 sm:py-7 ${
        drag
          ? "border-emerald-400 bg-emerald-50"
          : filled
            ? "border-emerald-200 bg-emerald-50/40"
            : "border-stone-200 bg-stone-50 hover:border-stone-300"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onDrop(e.target.files[0].name)}
      />
      {filled ? (
        <>
          <FileKey2 className="h-5 w-5 text-emerald-600" />
          <div className="font-mono text-[12px] text-emerald-700">
            {filename}
          </div>
          <div className="text-[11px] text-emerald-600">
            carregado · clique para substituir
          </div>
        </>
      ) : (
        <>
          <Upload className="h-5 w-5 text-stone-400" />
          <div className="text-[13px] font-medium text-stone-600">{label}</div>
          <div className="text-[11px] text-stone-400">{hint}</div>
        </>
      )}
    </div>
  );
}

function SecurityPage() {
  const [crt, setCrt] = useState(null);
  const [key, setKey] = useState(null);
  const [pixKeyType, setPixKeyType] = useState("cnpj");
  const [pixKey, setPixKey] = useState("12.345.678/0001-90");
  const [testing, setTesting] = useState(false);
  const [log, setLog] = useState([
    { t: "09:12:04", msg: "Certificado mTLS validado com sucesso", ok: true },
    {
      t: "09:12:05",
      msg: "Handshake TLS com api.bancointer.com.br concluído",
      ok: true,
    },
  ]);

  const runTest = () => {
    if (!crt || !key) return;
    setTesting(true);
    const steps = [
      "Iniciando handshake mTLS…",
      "Certificado apresentado e validado pelo Banco Inter",
      "Consultando endpoint de extrato (sandbox)…",
      "Conexão estabelecida — latência 312ms",
    ];
    steps.forEach((msg, i) => {
      setTimeout(
        () => {
          setLog((prev) => [...prev, { t: nowHM(), msg, ok: true }]);
          if (i === steps.length - 1) setTesting(false);
        },
        (i + 1) * 650,
      );
    });
  };

  const certsOk = crt && key;

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <Eyebrow>Autenticação bancária</Eyebrow>
              <div className="font-display text-[15px] font-semibold text-stone-800">
                Certificados mTLS
              </div>
            </div>
            {certsOk ? (
              <StatusPill status="ativo" />
            ) : (
              <StatusPill status="pendente" />
            )}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Dropzone
              label="Certificado (.crt)"
              hint="arraste o arquivo ou clique"
              filled={!!crt}
              filename={crt}
              onDrop={setCrt}
            />
            <Dropzone
              label="Chave privada (.key)"
              hint="arraste o arquivo ou clique"
              filled={!!key}
              filename={key}
              onDrop={setKey}
            />
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-md bg-stone-50 px-3 py-2.5 text-[11.5px] leading-relaxed text-stone-500">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-400" />
            Os arquivos são criptografados em repouso e isolados por conta.
            Nenhuma outra conta do Pixie tem acesso a estes certificados.
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="mb-4">
            <Eyebrow>Recebimento</Eyebrow>
            <div className="font-display text-[15px] font-semibold text-stone-800">
              Chave Pix principal
            </div>
          </div>
          <div className="mb-3 flex flex-wrap gap-1.5 rounded-md bg-stone-100 p-1">
            {["cnpj", "email", "telefone", "aleatória"].map((t) => (
              <button
                key={t}
                onClick={() => setPixKeyType(t)}
                className={`flex-1 rounded px-2 py-1.5 text-[12px] font-medium capitalize transition-colors ${
                  pixKeyType === t
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-stone-500 hover:text-stone-700"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <label className="mb-1.5 block text-[12px] font-medium text-stone-500">
            Chave
          </label>
          <div className="flex items-center gap-2 rounded-md border border-stone-200 px-3 py-2.5">
            <KeyRound className="h-4 w-4 shrink-0 text-stone-400" />
            <input
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              className="w-full bg-transparent font-mono text-[13px] text-stone-700 outline-none"
            />
          </div>
          <div className="mt-4 text-[12px] text-stone-500">
            Esta chave é usada para gerar todos os QR Codes estáticos da conta.
            Cada PDV adiciona um prefixo próprio ao{" "}
            <span className="font-mono text-stone-700">txid</span> para
            rastreabilidade.
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-stone-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <Eyebrow>Diagnóstico</Eyebrow>
            <div className="font-display text-[15px] font-semibold text-stone-800">
              Testar conexão
            </div>
          </div>
          <button
            onClick={runTest}
            disabled={!certsOk || testing}
            className={`flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-[13px] font-medium transition-colors sm:w-auto ${
              !certsOk
                ? "cursor-not-allowed bg-stone-100 text-stone-400"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            {testing ? "Testando…" : "Testar conexão"}
          </button>
        </div>
        {!certsOk && (
          <div className="flex items-center gap-2 bg-amber-50 px-4 py-2.5 text-[12px] text-amber-700 sm:px-5">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> Envie os dois
            arquivos (.crt e .key) para habilitar o teste.
          </div>
        )}
        <div className="max-h-52 overflow-y-auto bg-emerald-950 px-4 py-4 font-mono text-[11.5px] leading-relaxed sm:px-5 sm:text-[12px]">
          {log.map((l, i) => (
            <div
              key={i}
              className="flex flex-wrap gap-x-3 gap-y-0.5 text-emerald-300"
            >
              <span className="shrink-0 text-emerald-600">{l.t}</span>
              <span className="text-emerald-100/90">{l.msg}</span>
            </div>
          ))}
          {testing && <div className="text-emerald-500">▍</div>}
        </div>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PDVs page
// ---------------------------------------------------------------------------

function CodeReveal({ code }) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <div className="flex items-center gap-1.5">
      <span className="font-mono text-[13px] tabular-nums text-stone-700">
        {visible ? code : "••••••"}
      </span>
      <button
        onClick={() => setVisible((v) => !v)}
        className="text-stone-300 hover:text-stone-500"
      >
        {visible ? (
          <EyeOff className="h-3.5 w-3.5" />
        ) : (
          <Eye className="h-3.5 w-3.5" />
        )}
      </button>
      <button onClick={copy} className="text-stone-300 hover:text-stone-500">
        {copied ? (
          <Check className="h-3.5 w-3.5 text-emerald-500" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}

function CreatePdvModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const prefix = name.trim() ? prefixFrom(name) : "———";
  const [code] = useState(randCode());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 px-4">
      <Card className="w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
          <div className="font-display text-[15px] font-semibold text-stone-800">
            Novo ponto de venda
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
        <div className="space-y-4 px-5 py-5">
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-stone-500">
              Nome do PDV
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Caixa 2 — Loja Centro"
              className="w-full rounded-md border border-stone-200 px-3 py-2.5 text-[13.5px] text-stone-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md bg-stone-50 px-3 py-3">
              <div className="font-mono text-[10.5px] uppercase tracking-wider text-stone-400">
                Prefixo txid
              </div>
              <div className="mt-1 font-mono text-[16px] font-semibold text-emerald-700">
                {prefix}
              </div>
            </div>
            <div className="rounded-md bg-stone-50 px-3 py-3">
              <div className="font-mono text-[10.5px] uppercase tracking-wider text-stone-400">
                Código de acesso
              </div>
              <div className="mt-1 font-mono text-[16px] font-semibold text-stone-700">
                {code}
              </div>
            </div>
          </div>
          <div className="rounded-md bg-emerald-50/60 px-3 py-2.5 text-[11.5px] text-emerald-700">
            O vendedor usa apenas este código de 6 dígitos para entrar — sem
            e-mail ou senha.
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-stone-100 px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-md px-3.5 py-2 text-[13px] font-medium text-stone-500 hover:bg-stone-100"
          >
            Cancelar
          </button>
          <button
            disabled={!name.trim()}
            onClick={() =>
              name.trim() && onCreate({ name: name.trim(), prefix, code })
            }
            className={`rounded-md px-3.5 py-2 text-[13px] font-medium text-white transition-colors ${
              name.trim()
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "cursor-not-allowed bg-stone-300"
            }`}
          >
            Criar PDV
          </button>
        </div>
      </Card>
    </div>
  );
}

function PdvsPage({ pdvs, setPdvs }) {
  const [showModal, setShowModal] = useState(false);

  const handleCreate = ({ name, prefix, code }) => {
    setPdvs((prev) => [
      ...prev,
      {
        id: Date.now(),
        name,
        prefix,
        code,
        status: "pendente",
        today: 0,
        month: 0,
        tx: 0,
      },
    ]);
    setShowModal(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Eyebrow>{pdvs.length} pontos de venda</Eyebrow>
          <div className="font-display text-[16px] font-semibold text-stone-800">
            Pontos de venda
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-1.5 rounded-md bg-emerald-600 px-3.5 py-2 text-[13px] font-medium text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" /> Criar PDV
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {pdvs.map((p) => (
          <Card key={p.id} className="p-4 sm:p-5">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
                  <QrCode className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-medium text-stone-800">
                    {p.name}
                  </div>
                  <div className="font-mono text-[11px] text-stone-400">
                    prefixo {p.prefix}
                  </div>
                </div>
              </div>
              <StatusPill status={p.status} />
            </div>
            <div className="grid grid-cols-3 gap-2 border-t border-stone-100 pt-3 sm:gap-3">
              <div>
                <div className="text-[10.5px] text-stone-400">Hoje</div>
                <div className="font-mono text-[12.5px] tabular-nums text-stone-700 sm:text-[13px]">
                  {BRL(p.today)}
                </div>
              </div>
              <div>
                <div className="text-[10.5px] text-stone-400">Mês</div>
                <div className="font-mono text-[12.5px] tabular-nums text-stone-700 sm:text-[13px]">
                  {BRL(p.month)}
                </div>
              </div>
              <div>
                <div className="text-[10.5px] text-stone-400">Código</div>
                <CodeReveal code={p.code} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {showModal && (
        <CreatePdvModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// App shell
// ---------------------------------------------------------------------------

const pageMeta = {
  dashboard: { title: "Visão geral", desc: "Volume recebido e resumo por PDV" },
  security: {
    title: "Segurança e conexão",
    desc: "Certificados mTLS e chave Pix principal",
  },
  pdvs: {
    title: "Pontos de venda",
    desc: "Gerencie caixas, prefixos e códigos de acesso",
  },
};

export default function PixieOwnerPanel() {
  const [page, setPage] = useState("dashboard");
  const [pdvs, setPdvs] = useState(initialPdvs);
  const [navOpen, setNavOpen] = useState(false);
  const meta = pageMeta[page];

  return (
    <div className="flex h-full min-h-[720px] w-full bg-stone-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        body, .pixie-root { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
      `}</style>
      <Sidebar
        page={page}
        setPage={setPage}
        open={navOpen}
        onClose={() => setNavOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* mobile top bar */}
        <div className="flex items-center gap-3 border-b border-stone-200 bg-white px-4 py-3.5 lg:hidden">
          <button
            onClick={() => setNavOpen(true)}
            className="text-stone-500 hover:text-stone-700"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-600 text-white">
              <Radio className="h-3.5 w-3.5" strokeWidth={2.5} />
            </div>
            <span className="font-display text-[15px] font-semibold text-stone-800">
              Pixie
            </span>
          </div>
        </div>

        <main className="pixie-root flex-1 overflow-y-auto">
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
              <button className="hidden shrink-0 items-center gap-1.5 rounded-md border border-stone-200 bg-white px-3 py-2 text-[12.5px] font-medium text-stone-500 hover:bg-stone-50 sm:flex">
                <Settings2 className="h-3.5 w-3.5" /> Configurações
              </button>
              <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-stone-200 bg-white text-stone-500 hover:bg-stone-50 sm:hidden">
                <Settings2 className="h-4 w-4" />
              </button>
            </div>

            {page === "dashboard" && <DashboardPage pdvs={pdvs} />}
            {page === "security" && <SecurityPage />}
            {page === "pdvs" && <PdvsPage pdvs={pdvs} setPdvs={setPdvs} />}
          </div>
        </main>
      </div>
    </div>
  );
}
