-- Defesa em profundidade: o RLS já nega acesso ao papel "anon" (todas as policies são "to authenticated"),
-- mas o Supabase concede ALL a anon/authenticated por padrão em tabelas novas do schema public.
-- Revogamos de anon para que um erro futuro numa policy nunca exponha dados financeiros sem login.
-- O backend sempre chama a API com o JWT do usuário (papel "authenticated"), então nada muda para o app.

revoke all on table public.categories         from anon;
revoke all on table public.transactions       from anon;
revoke all on table public.financial_goals    from anon;
revoke all on table public.recurring_expenses from anon;

-- O usuário logado só precisa do CRUD; nada de TRUNCATE/REFERENCES/TRIGGER via API.
revoke all on table public.categories         from authenticated;
revoke all on table public.transactions       from authenticated;
revoke all on table public.financial_goals    from authenticated;
revoke all on table public.recurring_expenses from authenticated;

grant select, insert, update, delete on table public.categories         to authenticated;
grant select, insert, update, delete on table public.transactions       to authenticated;
grant select, insert, update, delete on table public.financial_goals    to authenticated;
grant select, insert, update, delete on table public.recurring_expenses to authenticated;
