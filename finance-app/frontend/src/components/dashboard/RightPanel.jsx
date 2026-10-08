import { ArrowRight, UserRound } from "lucide-react";
import QuickActions from "./QuickActions";
import BankCard from "./BankCard";

const formatMoney = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value) || 0);

export default function RightPanel({ session, demo, transactions }) {
  const latest = transactions[0];
  const name = demo ? "Rizasyah Somadudin" : (session?.user?.email?.split("@")[0] || "Finance User");

  return (
    <aside className="right-panel">
      <section className="profile-card">
        <div className="profile-avatar"><UserRound size={27} strokeWidth={1.35} /></div>
        <small>{demo ? "Team Card · Demo" : "Personal Account"}</small>
        <h2>{name}</h2>
      </section>

      <QuickActions />
      <BankCard />

      <section className="last-transaction" aria-labelledby="last-transaction-title">
        <h2 id="last-transaction-title">Last Transaction</h2>
        <article className="transaction-row">
          <div className="transaction-avatar">{latest?.description?.slice(0, 1)?.toUpperCase() || "–"}</div>
          <div className="transaction-copy">
            <strong>{latest?.description || "No transactions yet"}</strong>
            <small>{latest?.date || "Your latest item will appear here"}</small>
          </div>
          {latest && (
            <div className={`transaction-value ${latest.type}`}>
              {latest.type === "income" ? "+" : "−"}{formatMoney(latest.amount)}
              <small>{latest.type === "income" ? "Income" : "Expense"}</small>
            </div>
          )}
        </article>
        <button className="see-all">See all transactions <ArrowRight size={14} /></button>
      </section>
    </aside>
  );
}
