import { useState } from "react";
import { Bell, CreditCard, MoreVertical, WalletCards } from "lucide-react";
import { useNavigate } from "react-router";
import { useDismiss } from "../../hooks/useDismiss";
import { formatMoney } from "../../utils/money";

function Metric({ icon: Icon, label, value }) {
  // flex-shrink-0 + largura mínima no mobile (ver .header-metric no CSS): os cards
  // rolam na horizontal em vez de encolherem demais.
  return (
    <div className="header-metric flex-shrink-0">
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

  // Escape ou clique fora dos botões/popovers fecha o painel aberto.
  useDismiss(() => setOpenPanel(null), { active: openPanel !== null, insideSelector: ".header-actions" });

  // Os mesmos botões são exibidos em dois lugares (linha do título no mobile, canto direito no
  // desktop). É um elemento JSX, e não um componente interno, para o React não remontá-lo a cada render.
  const actionButtons = (
    <>
      <button
        aria-label={notificationCount > 0 ? `Notificações (${notificationCount} novas)` : "Notificações"}
        className="round-action"
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

      {/* Posição e z-index dos popovers ficam em .header-popover (CSS próprio): utilitários do
          Tailwind v4 perdem para CSS sem @layer, então fixed/z-[999] aqui não teriam efeito. */}
      {openPanel === "notifications" && (
        <div className="header-popover notification-popover" role="status">
          <strong>Notificações</strong><span>Nenhuma notificação no momento.</span>
        </div>
      )}

      {openPanel === "menu" && (
        <div className="header-popover menu-popover">
          <button onClick={() => { setOpenPanel(null); navigate("/transactions/new"); }}>Nova movimentação</button>
          <button onClick={() => { setOpenPanel(null); navigate("/settings"); }}>Configurações</button>
        </div>
      )}
    </>
  );

  return (
    // Transformamos o header num flex-col no mobile, e flex-row no desktop (md:)
    <header className="dashboard-header flex flex-col md:flex-row md:items-center justify-between gap-4">

      {/* Linha 1 no mobile: Título na esquerda, Botões na direita */}
      <div className="flex items-center justify-between w-full md:w-auto">
        <div className="dashboard-title">
          <h1>Meu Dashboard</h1>
        </div>

        {/* Botões visíveis APENAS no mobile (md:hidden) */}
        <div className="header-actions flex md:hidden">
          {actionButtons}
        </div>
      </div>

      {/* Linha 2 no mobile: Métricas com scroll horizontal.
          No desktop, perdem o w-full e ficam ao lado do título */}
      <div className={`metrics-bar flex overflow-x-auto gap-3 w-full md:w-auto scroll-smooth hide-scrollbar ${loading ? "is-loading" : ""}`}>
        <Metric icon={WalletCards} label="Saldo do mês" value={summary?.balance} />
        <Metric icon={CreditCard} label="Receitas" value={summary?.income} />
        <Metric icon={WalletCards} label="Despesas" value={summary?.expenses} />
      </div>

      {/* Botões visíveis APENAS no desktop (hidden md:flex) */}
      <div className="header-actions hidden md:flex">
        {actionButtons}
      </div>
    </header>
  );
}
