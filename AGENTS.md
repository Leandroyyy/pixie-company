# AGENTS.md — Pixie (PixFree)

Guia de orientação para agentes de IA (Claude Code, Cursor, Copilot, etc.) trabalhando neste repositório. Leia isto antes de gerar ou alterar código.

## O que é o projeto

**Pixie** é o produto interno; **PixFree** é o nome comercial. É uma plataforma de checkout e conciliação de pagamentos Pix para pequenos negócios com PDV físico e SaaS que hoje pagam ~1% de taxa por transação usando a API de Cobrança (Pix Comercial) do banco para confirmar pedidos automaticamente.

**O que o produto faz de diferente:** em vez da API de Cobrança paga, o sistema gera um **QR Code Pix estático** com um `txid` único embutido no payload, e confirma o pagamento fazendo **polling na API de Extrato Bancário** (gratuita) até localizar esse `txid` no extrato. Isso elimina a taxa de cobrança, mas depende inteiramente do Banco Inter e de premissas técnicas ainda não validadas (ver seção de Riscos).

Ao gerar código ou sugerir features, um agente deve sempre lembrar que **o core do produto é esse mecanismo de detecção via extrato**, não o checkout em si — qualquer decisão de arquitetura deve proteger a confiabilidade e a latência desse fluxo.

## Estrutura de plataformas

O produto tem duas superfícies de UI completamente distintas, com públicos e necessidades diferentes:

### 1. Painel do Dono da Conta (gestão)
- Web, desktop-first mas responsivo.
- Volume financeiro total recebido e economia gerada (taxas não pagas vs. 1% do Pix Comercial).
- Tela de "Segurança e Conexão": upload de certificados mTLS (`.crt` / `.key`), configuração da chave Pix principal.
- Criação de Pontos de Venda (PDVs) com Código de Acesso de 6 dígitos e prefixo automático de `txid` por PDV (rastreabilidade por caixa).
- Design system: verde (Emerald).
- **Protótipo já existe:** `pixie-painel-dono.jsx` neste diretório — componente React único cobrindo as 3 telas (Visão geral, Segurança e conexão, Pontos de venda). Use-o como referência de tokens visuais e de comportamento antes de propor algo novo; não redesenhe do zero sem necessidade.

### 2. Tela do Vendedor (PixFree PDV)
- Mobile-first, uso no balcão.
- Acesso via código de 6 dígitos (sem e-mail/senha).
- Tela principal: "Recebimentos de Hoje".
- Botão flutuante "Novo Recebimento" → calculadora com teclado numérico.
- Geração de QR Code com valor + txid, confirmação visual automática ao detectar pagamento.
- **Ainda não implementada** — é a próxima fase de UI (Fase 2 do roadmap abaixo).

## Stack técnico

| Camada | Tecnologia |
|---|---|
| Frontend | React |
| Build/Dev | Vite |
| Estilo | Tailwind CSS v4 |
| Ícones | Lucide (`lucide-react`) |
| Animações | Framer Motion |
| Gráficos (quando necessário) | Recharts |
| Integração bancária | Banco Inter API (Extrato + mTLS) |

Convenções observadas no protótipo existente, para manter consistência:
- Componentes funcionais, hooks (`useState`/`useEffect`), sem classes.
- Formatação de moeda sempre via `toLocaleString("pt-BR", { style: "currency", currency: "BRL" })`.
- Textos de UI em **português (pt-BR)**, tom direto e sem gírias técnicas voltadas ao usuário final (ex: "Recebido hoje", não "receita bruta diária").
- Dados numéricos (valores, txid, códigos de acesso) sempre em fonte monoespaçada com `tabular-nums`.

## Design system

- **Cor primária:** paleta Emerald (Tailwind), usada com intenção — não é "verde genérico de fintech". Emerald 600/700 para ações e destaques positivos; Emerald 950 para superfícies escuras (sidebar, terminal de log).
- **Neutros:** paleta Stone, não Gray/Slate puro — mantém um viés levemente quente/verde na base.
- **Estados funcionais:** Amber para pendente/aguardando, Rose para risco/erro. Nunca usar essas cores fora desse significado.
- **Tipografia:** Space Grotesk para display/headings, Inter para corpo, IBM Plex Mono para todo dado tabular (valores, txid, códigos, logs). Essa combinação está carregada via `@import` de Google Fonts dentro do componente — se migrar para um app Vite real, mover para `index.html` ou `@font-face` no CSS global.
- **Motivo do mono em tudo que é dado:** o produto inteiro gira em torno de ler um `txid` num extrato bancário — a estética de "livro-razão" (hairlines finas, números tabulares, linguagem de terminal no diagnóstico de conexão) é proposital e deve ser preservada em novas telas, inclusive na Tela do Vendedor.

## Riscos e pontos de validação crítica

Estes pontos **precisam ser validados antes de investir em polimento de UI adicional** — qualquer um pode inviabilizar o modelo de negócio. Um agente não deve assumir que esses pontos já estão resolvidos só porque existe UI para eles:

1. **Confiabilidade do txid no extrato estático** — o QR estático não garante formalmente que o identificador embutido no payload retorne de forma íntegra e legível no extrato; depende do banco pagador e de como o Pix Copia-e-Cola é processado. Risco técnico central do produto.
2. **Matching de pagamentos ambíguos** — lógica para diferenciar múltiplos pagamentos de valor semelhante no mesmo PDV (janela de tempo + prefixo txid + valor) ainda não está definida em produção.
3. **Rate limit da API de Extrato** — APIs gratuitas de extrato tendem a ter limites de chamada restritos; múltiplos PDVs em polling simultâneo pode virar gargalo e comprometer a promessa de confirmação "imediata".
4. **Custódia de certificados mTLS** — `.crt`/`.key` de clientes precisam de criptografia em repouso, isolamento por tenant e política de rotação. Trate como credencial bancária, não como upload de arquivo comum.
5. **Conformidade com Termos de Uso do banco** — ainda não verificado se os Termos de Uso da API de Extrato do Banco Inter permitem esse tipo de uso automatizado para conciliação comercial de terceiros.
6. **Lock-in em banco único** — todo o diferencial depende do Banco Inter; mercado endereçável limitado até haver integração equivalente com outros bancos.

## Roadmap

- **Fase 0 — Spike técnico:** validar unicidade/legibilidade do txid no extrato real, medir latência de polling. (Não é trabalho de UI.)
- **Fase 1 — Painel do Dono (núcleo mínimo):** ✅ protótipo de UI feito (upload de certificados, config de chave Pix, criação de PDVs, dashboard básico).
- **Fase 2 — Tela do Vendedor:** login por código de 6 dígitos, geração de QR + confirmação automática, tela de recebimentos do dia. **Próximo passo de UI.**
- **Fase 3 — Robustez operacional:** tratamento de rate limit/fila de polling, lógica de matching, monitoramento de falhas de conciliação.

## Perguntas em aberto (não resolver sem confirmar com o time)

- SLA real de latência entre pagamento e aparição no extrato do Banco Inter.
- Comportamento do produto se o banco mudar a política de uso da API de Extrato.
- Plano de expansão multi-banco e quais bancos oferecem extrato gratuito + mTLS de forma semelhante.
- Como validar unicidade de txid entre diferentes PDVs do mesmo dono de conta.

## Como trabalhar neste repo

- Antes de criar uma tela nova, releia o protótipo existente (`pixie-painel-dono.jsx`) para reaproveitar tokens, componentes (`Card`, `StatusPill`, `Eyebrow`, etc.) e o padrão de responsividade (mobile: sidebar vira drawer, tabelas viram cards empilhados, grids colapsam para 1 coluna).
- Não introduzir dependências fora da stack listada acima sem justificar.
- Qualquer feature que toque em certificados mTLS, chave Pix ou dados de extrato deve ser tratada como dado sensível por padrão (sem logs em texto claro, sem exposição em client-side sem necessidade).
- Copy da interface é em português, escrita do ponto de vista de quem usa (dono de loja, vendedor de balcão) — evitar jargão técnico ou termos de sistema.