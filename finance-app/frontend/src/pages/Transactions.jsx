import { useEffect, useMemo, useState } from "react";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";
import ModuleHeader from "../components/ui/ModuleHeader";
import { deleteTransaction, getTransactions, updateTransaction } from "../services/api";

const money = (value) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value) || 0);
const date = (value) => value ? new Intl.DateTimeFormat("pt-BR").format(new Date(`${value}T12:00:00`)) : "Sem data";

export default function Transactions() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState(null);
  const [status, setStatus] = useState({ loading: true, error: "" });

  async function load() {
    setStatus({ loading: true, error: "" });
    try {
      setItems(await getTransactions({ limit: 500 }));
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

  async function saveEdit(event) {
    event.preventDefault();
    try {
      const updated = await updateTransaction(editing.id, { description: editing.description, amount: editing.amount, type: editing.type, date: editing.date });
      setItems((current) => current.map((item) => item.id === updated.id ? updated : item));
      setEditing(null);
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
            <button aria-label={`Editar ${item.description}`} onClick={() => setEditing({ ...item })}><Edit3 size={15} /></button>
            <button aria-label={`Excluir ${item.description}`} onClick={() => remove(item)}><Trash2 size={15} /></button>
          </article>
        ))}
      </section>
      {editing && (
        <div className="inline-editor-backdrop" onMouseDown={() => setEditing(null)}>
          <form className="module-form inline-editor" onSubmit={saveEdit} onMouseDown={(event) => event.stopPropagation()}>
            <h2>Editar movimentação</h2>
            <label>Descrição<input required maxLength={200} value={editing.description} onChange={(event) => setEditing({ ...editing, description: event.target.value })} /></label>
            <div className="form-grid"><label>Valor<input required inputMode="decimal" value={editing.amount} onChange={(event) => setEditing({ ...editing, amount: event.target.value.replace(",", ".") })} /></label><label>Tipo<select value={editing.type} onChange={(event) => setEditing({ ...editing, type: event.target.value })}><option value="income">Receita</option><option value="expense">Despesa</option></select></label></div>
            <label>Data<input type="date" required value={editing.date?.slice(0, 10) || ""} onChange={(event) => setEditing({ ...editing, date: event.target.value })} /></label>
            <div className="form-actions"><button type="button" onClick={() => setEditing(null)}>Cancelar</button><button className="primary-action">Salvar</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
