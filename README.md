# Finance App

Painel de finanças pessoais: receitas e despesas, metas, contas recorrentes e resumo mensal.

| Parte | Tecnologias |
|---|---|
| `backend/` | Node 22, Express 5, Supabase (Auth + Postgres com RLS) |
| `frontend/` | React 19, Vite 8, Tailwind v4, React Router 8, Recharts, framer-motion |
| `backend/supabase/migrations/` | Schema, RLS, Storage e índices do banco |

## Rodando localmente

Requisitos: Node 22+ e um projeto no Supabase.

```bash
# 1) Banco: aplique as migrations de backend/supabase/migrations/ em ordem (veja "Banco de dados")

# 2) Backend (http://localhost:3000)
cd backend
cp .env.example .env        # preencha SUPABASE_URL e SUPABASE_KEY (chave publicável/anon)
npm ci
npm run dev

# 3) Frontend (http://localhost:5173)
cd frontend
cp .env.example .env        # preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
npm ci
npm run dev
```

Com Docker: copie `backend/.env.example` para `backend/.env`, crie um `.env` na raiz com as `VITE_*` e rode
`docker compose up --build` (frontend em `localhost:8080`, API em `localhost:3000`).

## Variáveis de ambiente

**Backend** (`backend/.env`)

| Variável | Obrigatória | Descrição |
|---|---|---|
| `SUPABASE_URL`, `SUPABASE_KEY` | sim | URL do projeto e chave **publicável/anon**. Nunca use a `service_role`. |
| `CORS_ORIGINS` | **em produção** | Origens do frontend, separadas por vírgula. Sem ela o servidor não sobe com `NODE_ENV=production`. Em desenvolvimento, `localhost:5173` e `:8080` já são aceitos. |
| `TRUST_PROXY_HOPS` | não (padrão `1`) | Quantos proxies existem na frente do Express em produção. Use `0` sem proxy (ex.: compose local). |
| `NODE_ENV`, `PORT` | não | `production` ativa as regras de produção; porta padrão `3000`. |

**Frontend** (lidas no *build*, ficam dentro do bundle)

| Variável | Descrição |
|---|---|
| `VITE_API_URL` | Endereço da API, com ou sem o sufixo `/api` (o código normaliza). Padrão `http://localhost:3000`. |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Usadas só no upload de foto de perfil. Também alimentam a CSP gerada no build. |

## API

Tudo sob `/api`, exceto `GET /health`. Rotas marcadas com 🔒 exigem `Authorization: Bearer <access_token>`.

| Rota | Descrição |
|---|---|
| `POST /auth/register` · `POST /auth/login` · `POST /auth/refresh` | Cadastro (5/hora), login (10/15 min) e renovação de sessão |
| 🔒 `GET /auth/me` · `POST /auth/logout` | Usuário atual e encerramento da sessão |
| 🔒 `GET·POST·PATCH /profile` | Perfil (username e avatar) |
| 🔒 `GET·POST /transactions` · `PATCH·DELETE /transactions/:id` | Movimentações (a listagem devolve no máximo 500) |
| 🔒 `GET /summary?month=AAAA-MM` | Receitas, despesas e saldo do mês |
| 🔒 `GET /summary/history?end=AAAA-MM&months=6` | Totais por mês (1 a 12 meses), calculados sobre todas as transações |
| 🔒 `/goals` · `/bills` | CRUD de metas e de contas recorrentes |

Limite geral: 300 requisições por 15 minutos por IP.

## Banco de dados (Supabase)

Aplique em ordem os arquivos de `backend/supabase/migrations/`:

1. `…_create_profiles.sql` — tabela `profiles`, trigger de criação no cadastro e `is_username_available`.
2. `…170000_core_tables_baseline.sql` — `categories`, `transactions`, `financial_goals`, `recurring_expenses` e RLS (cada usuário só acessa as próprias linhas).
3. `…170100_avatars_storage_policies.sql` — bucket `avatars` (2 MB; JPG, PNG, WebP, GIF) e policies por dono.
4. `…170200_indexes_and_function_grants.sql` — índices por `user_id`/`date` e `revoke` da função de trigger.
5. `…170300_revoke_anon_core_tables.sql` — privilégios mínimos nas tabelas financeiras.

> O projeto de produção já tem tudo isso. As migrations `170100`, `170200` e `170300` foram aplicadas pelo painel/MCP e
> aparecem no histórico do Supabase com timestamps próprios; a `170000` não foi reaplicada porque as tabelas já existiam.
> Se for adotar a CLI do Supabase, rode `supabase migration repair` antes do primeiro `db push`.

Ajustes manuais no painel do Supabase (não dá para fazer por SQL):

- **Auth → proteção contra senhas vazadas** (*leaked password protection*): ativar (pode depender do plano).
- **Auth → confirmação de e-mail**: o backend funciona com ela ligada ou desligada.

Avatares ficam em `avatars/<user_id>/<timestamp>.<ext>`. Ao trocar a foto, o arquivo antigo é apagado do bucket.

## Deploy

- **Frontend (Vercel):** defina `VITE_API_URL`, `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` nas variáveis do projeto
  (valem para o *build*). O `vercel.json` já tem o rewrite de SPA e os cabeçalhos de segurança.
- **Backend:** `NODE_ENV=production`, `SUPABASE_URL`, `SUPABASE_KEY`, `CORS_ORIGINS=https://seu-front.vercel.app` e,
  atrás de um único proxy/plataforma, `TRUST_PROXY_HOPS=1`. A imagem Docker roda como usuário não-root e tem `HEALTHCHECK` em `/health`.

## Testes e CI

```bash
cd backend  && npm test     # node --test (sem .env, sem Supabase)
cd frontend && npm test     # Vitest + Testing Library (fuso fixo America/Fortaleza)
```

O GitHub Actions (`.github/workflows/ci.yml`) roda os dois conjuntos de testes, o build do frontend e o build das duas
imagens Docker em cada push e pull request. O Dependabot abre PRs semanais de dependências.

## Convenções que já deram problema

- **Datas:** use `utils/date.js`. `new Date().toISOString().slice(0, 10)` devolve a data em UTC e, no Brasil, depois das 21h já é o dia (e às vezes o mês) seguinte.
- **Dinheiro:** use `formatMoney`/`parseBRL` de `utils/money.js`. No backend os valores são somados em centavos (`BigInt`).
- **CSS:** os estilos ficam em `frontend/src/styles/`, importados por `index.css`. O CSS próprio **não usa `@layer`**, então ele
  vence os utilitários do Tailwind v4 (um `fixed`/`z-[999]` no JSX perde para `position`/`z-index` definidos aqui) e a ordem dos
  imports importa: `responsive.css` deve ser sempre o último.
- **Popovers e diálogos:** feche com Escape e clique fora usando `hooks/useDismiss.js`; prenda o foco em diálogos com `hooks/useFocusTrap.js`.
- **Segredos:** só a chave publicável/anon do Supabase aparece no projeto. `.env` nunca entra no Git nem na imagem Docker.
