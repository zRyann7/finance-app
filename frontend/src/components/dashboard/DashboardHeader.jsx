import { useState } from "react";
import { Bell, CreditCard, Menu, MoreVertical, WalletCards } from "lucide-react";
import { useNavigate } from "react-router";

const formatMoney = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(Number(value));

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="header-metric">
      <span className="metric-icon"><Icon size={12} strokeWidth={1.8} /></span>
      <span>
        <small>{label}</small>
        <strong>{value === null || value === undefined ? "—" : formatMoney(value)}</strong>
      </span>
    </div>
  );
}

export default function DashboardHeader({ summary, loading }) {
  const navigate = useNavigate();
  const [openPanel, setOpenPanel] = useState(null);

  return (
    <header className="dashboard-header">
      <div className="dashboard-title">
        <h1>Meu Dashboard</h1>
        <Menu size={18} strokeWidth={2.2} />
      </div>

      <div className={`metrics-bar ${loading ? "is-loading" : ""}`}>
        <Metric icon={WalletCards} label="Saldo do mês" value={summary?.balance} />
        <Metric icon={CreditCard} label="Receitas" value={summary?.income} />
        <Metric icon={WalletCards} label="Despesas" value={summary?.expenses} />
      </div>

      <div className="header-actions">
        <button aria-label="Notificações" className="round-action" onClick={() => setOpenPanel(openPanel === "notifications" ? null : "notifications")}>
          <Bell size={17} strokeWidth={1.8} />
          <span className="notification-dot" />
        </button>
        <button aria-label="Mais opções" className="round-action" onClick={() => setOpenPanel(openPanel === "menu" ? null : "menu")}>
          <MoreVertical size={17} strokeWidth={1.8} />
        </button>
        {openPanel === "notifications" && (
          <div className="header-popover notification-popover" role="status">
            <strong>Notificações</strong><span>Nenhuma notificação no momento.</span>
          </div>
        )}
        {openPanel === "menu" && (
          <div className="header-popover menu-popover">
            <button onClick={() => navigate("/transactions/new")}>Nova movimentação</button>
            <button onClick={() => navigate("/settings")}>Configurações</button>
          </div>
        )}
      </div>
    </header>
  );
}
