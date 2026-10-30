import { useState } from "react";
import { Bell, CreditCard, MoreVertical, WalletCards } from "lucide-react";
import { useNavigate } from "react-router";

const formatMoney = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(Number(value));

function Metric({ icon: Icon, label, value }) {
  // Adicionamos flex-shrink-0 e um tamanho mínimo para garantir que 
  // os cards possam fazer scroll no mobile sem encolherem demais
  return (
    <div className="header-metric flex-shrink-0 min-w-[140px] md:min-w-0">
      <span className="metric-icon"><Icon size={12} strokeWidth={1.8} /></span>
      <span>
        <small>{label}</small>
        <strong>{value === null || value === undefined ? "—" : formatMoney(value)}</strong>
      </span>
    </div>
  );
}

export default function DashboardHeader({ summary, loading, notificationCount = 0 }) {
  const navigate = useNavigate();
  const [openPanel, setOpenPanel] = useState(null);

  // Extraímos os botões para um subcomponente interno.
  // Assim podemos renderizá-los em lugares diferentes (mobile vs desktop) sem duplicar código!
  const ActionButtons = () => (
    <>
      <button 
        aria-label={notificationCount > 0 ? `Notificações (${notificationCount} novas)` : "Notificações"} 
        className="round-action relative" 
        onClick={() => setOpenPanel(openPanel === "notifications" ? null : "notifications")}
      >
        <Bell size={17} strokeWidth={1.8} />
        {notificationCount > 0 && <span className="notification-dot" />}
      </button>
      <button 
        aria-label="Mais opções" 
        className="round-action" 
        onClick={() => setOpenPanel(openPanel === "menu" ? null : "menu")}
      >
        <MoreVertical size={17} strokeWidth={1.8} />
      </button>

      {/* Mantemos o fixed z-[999] para não quebrar a sobreposição do avatar. 
          Usamos top-16 no mobile para não sobrepor o título, e mt-2 no desktop */}
      {openPanel === "notifications" && (
        <div className="header-popover notification-popover fixed right-4 top-16 md:top-auto md:mt-2 z-[999] shadow-2xl" role="status">
          <strong>Notificações</strong><span>Nenhuma notificação no momento.</span>
        </div>
      )}

      {openPanel === "menu" && (
        <div className="header-popover menu-popover fixed right-4 top-16 md:top-auto md:mt-2 z-[999] shadow-2xl">
          <button onClick={() => { setOpenPanel(null); navigate("/transactions/new"); }}>Nova movimentação</button>
          <button onClick={() => { setOpenPanel(null); navigate("/settings"); }}>Configurações</button>
        </div>
      )}
    </>
  );

  return (
    // Transformamos o header num flex-col no mobile, e flex-row no desktop (md:)
    <header className="dashboard-header flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-30">
      
      {/* Linha 1 no mobile: Título na esquerda, Botões na direita */}
      <div className="flex items-center justify-between w-full md:w-auto">
        <div className="dashboard-title">
          <h1>Meu Dashboard</h1>
        </div>
        
        {/* Botões visíveis APENAS no mobile (md:hidden) */}
        <div className="header-actions flex md:hidden relative z-40">
          <ActionButtons />
        </div>
      </div>

      {/* Linha 2 no mobile: Métricas com scroll horizontal. 
          No desktop, perdem o w-full e ficam ao lado do título */}
      <div className={`metrics-bar flex overflow-x-auto gap-3 pb-2 md:pb-0 w-full md:w-auto scroll-smooth hide-scrollbar ${loading ? "is-loading" : ""}`}>
        <Metric icon={WalletCards} label="Saldo do mês" value={summary?.balance} />
        <Metric icon={CreditCard} label="Receitas" value={summary?.income} />
        <Metric icon={WalletCards} label="Despesas" value={summary?.expenses} />
      </div>

      {/* Botões visíveis APENAS no desktop (hidden md:flex) */}
      <div className="header-actions hidden md:flex relative z-40">
        <ActionButtons />
      </div>
    </header>
  );
}