-- Baseline das tabelas financeiras, exportado do projeto "Financas" em 30/10/2026.
-- Estas tabelas foram criadas pelo painel do Supabase e não estavam versionadas.
-- Em um ambiente NOVO isto recria o schema; em produção o estado já é este.

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz default now(),
  constraint categories_id_user_id_key unique (id, user_id)
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  description text not null,
  amount numeric not null constraint transactions_amount_check check (amount > 0),
  type text not null constraint transactions_type_check check (type = any (array['income', 'expense'])),
  category_id uuid,
  date date not null default current_date,
  created_at timestamptz default now(),
  constraint transactions_category_id_user_id_fkey
    foreign key (category_id, user_id) references public.categories (id, user_id)
);

create table if not exists public.financial_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric not null constraint financial_goals_target_amount_check check (target_amount > 0),
  saved_amount numeric not null default 0 constraint financial_goals_saved_amount_check check (saved_amount >= 0),
  deadline date,
  created_at timestamptz default now()
);

create table if not exists public.recurring_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  description text not null,
  amount numeric not null constraint recurring_expenses_amount_check check (amount > 0),
  due_day integer not null constraint recurring_expenses_due_day_check check (due_day >= 1 and due_day <= 31),
  active boolean not null default true,
  created_at timestamptz default now()
);

-- RLS: cada usuário só enxerga e altera as próprias linhas.
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.financial_goals enable row level security;
alter table public.recurring_expenses enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['categories', 'transactions', 'financial_goals', 'recurring_expenses']
  loop
    execute format('drop policy if exists "Read own" on public.%I', t);
    execute format('drop policy if exists "Insert own" on public.%I', t);
    execute format('drop policy if exists "Update own" on public.%I', t);
    execute format('drop policy if exists "Delete own" on public.%I', t);

    execute format('create policy "Read own" on public.%I for select to authenticated using ((select auth.uid()) = user_id)', t);
    execute format('create policy "Insert own" on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)', t);
    execute format('create policy "Update own" on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', t);
    execute format('create policy "Delete own" on public.%I for delete to authenticated using ((select auth.uid()) = user_id)', t);
  end loop;
end
$$;
