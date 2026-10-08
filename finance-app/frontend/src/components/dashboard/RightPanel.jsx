import { ArrowRight, UserRound } from "lucide-react";
import QuickActions from "./QuickActions";
import BankCard from "./BankCard";

const formatMoney = (value) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return "";
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR").format(new Date(year, month - 1, day));
};

export default function RightPanel({ session, transactions, summary, onSeeAll }) {
  const latest = transactions[0];
  const name = session?.user?.name || "Usuário";

  return (
    <aside className="right-panel">
      <section className="profile-card">
        <div className="profile-avatar"><UserRound size={27} strokeWidth={1.35} /></div>
        <small>Conta pessoal</small>
        <h2>{name}</h2>
      </section>

      <QuickActions />
      <BankCard balance={summary.balance} />

      <section className="last-transaction" aria-labelledby="last-transaction-title">
        <h2 id="last-transaction-title">Última transação</h2>
        <article className="transaction-row">
          <div className="transaction-avatar">{latest?.description?.slice(0, 1)?.toUpperCase() || "–"}</div>
          <div className="transaction-copy">
            <strong>{latest?.description || "Nenhuma transação"}</strong>
            <small>{latest ? formatDate(latest.date) : "Suas movimentações aparecerão aqui"}</small>
          </div>
          {latest && (
            <div className={`transaction-value ${latest.type}`}>
              {latest.type === "income" ? "+" : "−"}{formatMoney(latest.amount)}
              <small>{latest.type === "income" ? "Receita" : "Despesa"}</small>
            </div>
          )}
        </article>
        <button className="see-all" onClick={onSeeAll}>Ver todas as transações <ArrowRight size={14} /></button>
      </section>
    </aside>
  );
}
