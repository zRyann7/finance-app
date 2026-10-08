import { Bell, CreditCard, Menu, MoreVertical, WalletCards } from "lucide-react";

const formatMoney = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(Number(value) || 0);

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="header-metric">
      <span className="metric-icon"><Icon size={12} strokeWidth={1.8} /></span>
      <span>
        <small>{label}</small>
        <strong>{formatMoney(value)}</strong>
      </span>
    </div>
  );
}

export default function DashboardHeader({ summary, loading }) {
  return (
    <header className="dashboard-header">
      <div className="dashboard-title">
        <h1>Meu Dashboard</h1>
        <Menu size={18} strokeWidth={2.2} />
      </div>

      <div className={`metrics-bar ${loading ? "is-loading" : ""}`}>
        <Metric icon={WalletCards} label="Saldo do mês" value={summary.balance} />
        <Metric icon={CreditCard} label="Receitas" value={summary.income} />
        <Metric icon={WalletCards} label="Despesas" value={summary.expenses} />
      </div>

      <div className="header-actions">
        <button aria-label="Notificações" className="round-action">
          <Bell size={17} strokeWidth={1.8} />
          <span className="notification-dot" />
        </button>
        <button aria-label="Mais opções" className="round-action">
          <MoreVertical size={17} strokeWidth={1.8} />
        </button>
      </div>
    </header>
  );
}
