-- Índices: o backend filtra tudo por user_id (e por faixa de date em transações/resumos).
-- Sem eles, cada consulta e cada checagem de RLS varre a tabela inteira conforme os dados crescem.
create index if not exists transactions_user_date_idx on public.transactions (user_id, date desc);
create index if not exists transactions_category_user_idx on public.transactions (category_id, user_id);
create index if not exists financial_goals_user_idx on public.financial_goals (user_id);
create index if not exists recurring_expenses_user_idx on public.recurring_expenses (user_id);
create index if not exists categories_user_idx on public.categories (user_id);

-- Função de trigger (SECURITY DEFINER) não precisa ser chamável via /rest/v1/rpc.
-- O trigger continua funcionando: o EXECUTE só é checado quando o trigger é criado.
revoke execute on function public.handle_new_user_profile() from public, anon, authenticated;
