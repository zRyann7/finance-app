import { ArrowDownLeft, ArrowUpRight, ReceiptText, WalletCards } from "lucide-react";

const actions = [
  [ArrowUpRight, "Transfer"],
  [ArrowDownLeft, "Receive"],
  [ReceiptText, "Bill"],
  [WalletCards, "Top Up"],
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
