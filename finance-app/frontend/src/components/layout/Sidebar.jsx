import { CreditCard, FileText, Goal, LayoutDashboard, LogOut, Settings } from "lucide-react";
import { NavLink } from "react-router";
import BrandMark from "../ui/BrandMark";

const links = [
  [LayoutDashboard, "Dashboard", "/dashboard"],
  [FileText, "Movimentações", "/transactions"],
  [CreditCard, "Contas", "/bills"],
  [Goal, "Metas", "/goals"],
  [Settings, "Configurações", "/settings"],
];

export default function Sidebar({ onLogout }) {
  return (
    <aside className="sidebar" aria-label="Navegação principal">
      <NavLink className="sidebar-brand" aria-label="Início financeiro" to="/dashboard"><BrandMark /></NavLink>
      <nav className="sidebar-nav">
        {links.map(([Icon, label, path]) => (
          <NavLink key={path} to={path} className={({ isActive }) => `sidebar-button ${isActive ? "is-active" : ""}`} aria-label={label} data-tooltip={label}>
            <Icon size={17} strokeWidth={1.7} />
          </NavLink>
        ))}
      </nav>
      <button className="sidebar-button sidebar-logout" aria-label="Sair" data-tooltip="Sair" onClick={onLogout}>
        <LogOut size={17} strokeWidth={1.7} />
      </button>
    </aside>
  );
}
