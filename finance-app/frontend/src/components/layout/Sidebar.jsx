import {
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  WalletCards,
} from "lucide-react";
import BrandMark from "../ui/BrandMark";

const links = [
  [LayoutDashboard, "Dashboard"],
  [WalletCards, "Carteira"],
  [FileText, "Transações"],
  [CreditCard, "Cartões"],
  [Settings, "Configurações"],
];

export default function Sidebar({ onLogout }) {
  return (
    <aside className="sidebar" aria-label="Navegação principal">
      <button className="sidebar-brand" aria-label="Início financeiro">
        <BrandMark />
      </button>

      <nav className="sidebar-nav">
        {links.map(([Icon, label], index) => (
          <button
            key={label}
            className={`sidebar-button ${index === 0 ? "is-active" : ""}`}
            aria-label={label}
            data-tooltip={label}
          >
            <Icon size={17} strokeWidth={1.7} />
          </button>
        ))}
      </nav>

      <button className="sidebar-button sidebar-logout" aria-label="Sair" data-tooltip="Sair" onClick={onLogout}>
        <LogOut size={17} strokeWidth={1.7} />
      </button>
    </aside>
  );
}
