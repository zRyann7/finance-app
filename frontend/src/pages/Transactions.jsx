import { useEffect, useMemo, useState } from "react";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";
import ModuleHeader from "../components/ui/ModuleHeader";
import { TRANSACTIONS_LIMIT, deleteTransaction, getTransactions, updateTransaction } from "../services/api";
import { INVALID_AMOUNT_MESSAGE, parseBRL, toInputAmount } from "../utils/money";

const money = (value) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value) || 0);
// Aceita "AAAA-MM-DD" e timestamps ISO; data inválida vira "Sem data" em vez de derrubar a tela.
const date = (value) => {
  if (!value) return "Sem data";
  const parsed = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? "Sem data" : new Intl.DateTimeFormat("pt-BR").format(parsed);
};

export default function Transactions() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState(null);
  const [amountError, setAmountError] = useState("");
  const [status, setStatus] = useState({ loading: true, error: "" });

  async function load() {
    setStatus({ loading: true, error: "" });
    try {
      setItems(await getTransactions({ limit: TRANSACTIONS_LIMIT }));
      setStatus({ loading: false, error: "" });
    } catch (error) {
      setStatus({ loading: false, error: error.response?.data?.error || "Não foi possível carregar as movimentações." });
    }
  }

  useEffect(() => { load(); }, []);
  const visible = useMemo(() => filter === "all" ? items : items.filter((item) => item.type === filter), [filter, items]);

  async function remove(item) {
    if (!window.confirm(`Excluir “${item.description}”?`)) return;
    try {
      await deleteTransaction(item.id);
      setItems((current) => current.filter((candidate) => candidate.id !== item.id));
    } catch (error) {
      setStatus({ loading: false, error: error.response?.data?.error || "Não foi possível excluir a movimentação." });
    }
  }

  function openEditor(item) {
    setAmountError("");
    setEditing({ ...item, amount: toInputAmount(item.amount), date: item.date?.slice(0, 10) || "" });
  }

  function closeEditor() {
    setAmountError("");
    setEditing(null);
  }

  async function saveEdit(event) {
    event.preventDefault();
    const amount = parseBRL(editing.amount);
    if (amount === null) {
      setAmountError(INVALID_AMOUNT_MESSAGE);
      return;
    }
    setAmountError("");
    try {
      const updated = await updateTransaction(editing.id, { description: editing.description, amount, type: editing.type, date: editing.date });
      setItems((current) => current.map((item) => item.id === updated.id ? updated : item));
      closeEditor();
    } catch (error) {
      setStatus({ loading: false, error: error.response?.data?.error || "Não foi possível atualizar a movimentação." });
    }
  }

  return (
    <div className="module-page">
      <ModuleHeader eyebrow="MOVIMENTAÇÕES" title="Histórico financeiro" description="Receitas e despesas vinculadas à sua conta." action={<button className="primary-action" onClick={() => navigate("/transactions/new")}><Plus size={15} /> Nova movimentação</button>} />
      <div className="module-toolbar" role="group" aria-label="Filtrar movimentações">
        {[['all','Todas'],['income','Receitas'],['expense','Despesas']].map(([value,label]) => <button key={value} className={filter === value ? "is-active" : ""} onClick={() => setFilter(value)}>{label}</button>)}
      </div>
      {status.error && <div className="module-error" role="alert">{status.error}</div>}
      <section className="module-card module-list">
        {status.loading && <p className="module-empty">Carregando movimentações…</p>}
        {!status.loading && visible.length === 0 && <p className="module-empty">Nenhuma movimentação encontrada neste filtro.</p>}
        {visible.map((item) => (
          <article className="module-list-row" key={item.id}>
            <span className={`list-indicator ${item.type}`} />
            <div><strong>{item.description}</strong><small>{date(item.date)} · {item.type === "income" ? "Receita" : "Despesa"}</small></div>
            <b className={item.type}>{item.type === "income" ? "+" : "−"}{money(item.amount)}</b>
            <button aria-label={`Editar ${item.description}`} onClick={() => openEditor(item)}><Edit3 size={15} /></button>
            <button aria-label={`Excluir ${item.description}`} onClick={() => remove(item)}><Trash2 size={15} /></button>
          </article>
        ))}
      </section>
      {editing && (
        <div className="inline-editor-backdrop" onMouseDown={closeEditor}>
          <form className="module-form inline-editor" onSubmit={saveEdit} onMouseDown={(event) => event.stopPropagation()}>
            <h2>Editar movimentação</h2>
            <label>Descrição<input required maxLength={200} value={editing.description} onChange={(event) => setEditing({ ...editing, description: event.target.value })} /></label>
            <div className="form-grid"><label>Valor<input required inputMode="decimal" aria-invalid={Boolean(amountError)} aria-describedby={amountError ? "edit-amount-error" : undefined} value={editing.amount} onChange={(event) => setEditing({ ...editing, amount: event.target.value })} />{amountError && <small id="edit-amount-error" className="field-error" role="alert">{amountError}</small>}</label><label>Tipo<select value={editing.type} onChange={(event) => setEditing({ ...editing, type: event.target.value })}><option value="income">Receita</option><option value="expense">Despesa</option></select></label></div>
            <label>Data<input type="date" required value={editing.date} onChange={(event) => setEditing({ ...editing, date: event.target.value })} /></label>
            <div className="form-actions"><button type="button" onClick={closeEditor}>Cancelar</button><button className="primary-action">Salvar</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
