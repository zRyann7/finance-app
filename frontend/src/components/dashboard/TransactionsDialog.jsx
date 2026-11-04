import { useRef } from "react";
import { motion } from "framer-motion";
import { Trash2, X } from "lucide-react";
import { useDismiss } from "../../hooks/useDismiss";
import { useDialogs } from "../../hooks/useDialogs";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { formatMoney } from "../../utils/money";

function formatDate(value) {
  if (!value) return "Sem data";
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR").format(new Date(year, month - 1, day));
}

export default function TransactionsDialog({ transactions, deletingId, onDelete, onClose }) {
  const dialogRef = useRef(null);
  const { confirm } = useDialogs();

  useDismiss(onClose);
  useFocusTrap(dialogRef);

  async function handleDelete(transaction) {
    const confirmed = await confirm({
      title: "Excluir transação",
      message: `Excluir a transação “${transaction.description}”? Esta ação não pode ser desfeita.`,
      confirmLabel: "Excluir",
      danger: true,
    });

    if (!confirmed) return;

    try {
      await onDelete(transaction.id);
    } catch {
      // A mensagem é apresentada pelo estado global do dashboard.
    }
  }

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <motion.section
        ref={dialogRef}
        tabIndex={-1}
        className="transactions-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="transactions-dialog-title"
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <div>
            <span>HISTÓRICO</span>
            <h2 id="transactions-dialog-title">Todas as transações</h2>
          </div>
          <button aria-label="Fechar" onClick={onClose}><X size={18} /></button>
        </header>

        <div className="transactions-list">
          {transactions.length === 0 && (
            <p className="transactions-empty">Nenhuma transação cadastrada.</p>
          )}
          {transactions.map((transaction) => (
            <article key={transaction.id}>
              <div className={`transaction-type-icon ${transaction.type}`}>
                {transaction.type === "income" ? "+" : "−"}
              </div>
              <div className="dialog-transaction-copy">
                <strong>{transaction.description}</strong>
                <small>{formatDate(transaction.date)} · {transaction.type === "income" ? "Receita" : "Despesa"}</small>
              </div>
              <strong className={`dialog-transaction-value ${transaction.type}`}>
                {transaction.type === "income" ? "+" : "−"}{formatMoney(transaction.amount)}
              </strong>
              <button
                className="delete-transaction"
                aria-label={`Excluir ${transaction.description}`}
                disabled={deletingId === transaction.id}
                onClick={() => handleDelete(transaction)}
              >
                <Trash2 size={15} />
              </button>
            </article>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
