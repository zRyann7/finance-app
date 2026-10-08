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
  [WalletCards, "Wallet"],
  [FileText, "Transactions"],
  [CreditCard, "Cards"],
  [Settings, "Settings"],
];

export default function Sidebar({ onLogout }) {
  return (
    <aside className="sidebar" aria-label="Main navigation">
      <button className="sidebar-brand" aria-label="Finance home">
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

      <button className="sidebar-button sidebar-logout" aria-label="Log out" data-tooltip="Log out" onClick={onLogout}>
        <LogOut size={17} strokeWidth={1.7} />
      </button>
    </aside>
  );
}
