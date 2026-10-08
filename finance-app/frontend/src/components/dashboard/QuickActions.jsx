import { ArrowDownLeft, ArrowUpRight, ReceiptText, WalletCards } from "lucide-react";

const actions = [
  [ArrowUpRight, "Transferir"],
  [ArrowDownLeft, "Receber"],
  [ReceiptText, "Contas"],
  [WalletCards, "Adicionar"],
];

export default function QuickActions() {
  return (
    <div className="quick-actions">
      {actions.map(([Icon, label]) => (
        <button key={label} aria-label={label}>
          <span><Icon size={17} strokeWidth={1.7} /></span>
          <small>{label}</small>
        </button>
      ))}
    </div>
  );
}
