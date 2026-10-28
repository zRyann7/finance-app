import { ArrowDownLeft, ArrowUpRight, ReceiptText, WalletCards } from "lucide-react";
import { useNavigate } from "react-router";

const actions = [
  [ArrowUpRight, "Transferir", "/transfers"],
  [ArrowDownLeft, "Receber", "/transactions/new?type=income"],
  [ReceiptText, "Contas", "/bills"],
  [WalletCards, "Adicionar", "/transactions/new?type=expense"],
];

export default function QuickActions() {
  const navigate = useNavigate();
  return (
    <div className="quick-actions">
      {actions.map(([Icon, label, path]) => (
        <button key={label} aria-label={label} onClick={() => navigate(path)}>
          <span><Icon size={17} strokeWidth={1.7} /></span>
          <small>{label}</small>
        </button>
      ))}
    </div>
  );
}
