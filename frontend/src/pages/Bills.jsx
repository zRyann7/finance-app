import { useEffect, useState } from "react";
import { Plus, Power, Trash2 } from "lucide-react";
import ModuleHeader from "../components/ui/ModuleHeader";
import { createBill, deleteBill, getBills, updateBill } from "../services/api";
import { INVALID_AMOUNT_MESSAGE, formatMoney, parseBRL } from "../utils/money";

export default function Bills() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ description: "", amount: "", due_day: "" });
  const [status, setStatus] = useState({ loading: true, error: "" });
  const [amountError, setAmountError] = useState("");

  useEffect(() => { getBills().then((data) => { setItems(data); setStatus({ loading: false, error: "" }); }).catch((error) => setStatus({ loading: false, error: error.response?.data?.error || "Não foi possível carregar as contas." })); }, []);

  async function submit(event) {
    event.preventDefault();
    const amount = parseBRL(form.amount);
    if (amount === null) {
      setAmountError(INVALID_AMOUNT_MESSAGE);
      return;
    }
    setAmountError("");
    try {
      const bill = await createBill({ description: form.description, amount, due_day: Number(form.due_day) });
      setItems((current) => [...current, bill].sort((a, b) => a.due_day - b.due_day));
      setForm({ description: "", amount: "", due_day: "" }); setShowForm(false);
    } catch (error) { setStatus({ loading: false, error: error.response?.data?.error || "Não foi possível cadastrar a conta." }); }
  }

  async function toggle(item) {
    try { const updated = await updateBill(item.id, { active: !item.active }); setItems((current) => current.map((bill) => bill.id === updated.id ? updated : bill)); }
    catch (error) { setStatus({ loading: false, error: error.response?.data?.error || "Não foi possível atualizar a conta." }); }
  }

  async function remove(item) {
    if (!window.confirm(`Excluir a conta “${item.description}”?`)) return;
    try { await deleteBill(item.id); setItems((current) => current.filter((bill) => bill.id !== item.id)); }
    catch (error) { setStatus({ loading: false, error: error.response?.data?.error || "Não foi possível excluir a conta." }); }
  }

  return <div className="module-page"><ModuleHeader eyebrow="RECORRÊNCIAS" title="Contas recorrentes" description="Cadastre compromissos mensais sem lançá-los automaticamente como pagos." action={<button className="primary-action" onClick={() => setShowForm((value) => !value)}><Plus size={15} /> Nova conta</button>} />{status.error && <div className="module-error" role="alert">{status.error}</div>}{showForm && <form className="module-card module-form compact-form" onSubmit={submit}><div className="form-grid three-columns"><label>Descrição<input required maxLength={200} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label><label>Valor<input required inputMode="decimal" aria-invalid={Boolean(amountError)} aria-describedby={amountError ? "bill-amount-error" : undefined} value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} />{amountError && <small id="bill-amount-error" className="field-error" role="alert">{amountError}</small>}</label><label>Dia do vencimento<input required type="number" min="1" max="31" value={form.due_day} onChange={(event) => setForm({ ...form, due_day: event.target.value })} /></label></div><div className="form-actions"><button type="button" onClick={() => setShowForm(false)}>Cancelar</button><button className="primary-action">Cadastrar</button></div></form>}<section className="module-card module-list">{status.loading && <p className="module-empty">Carregando contas…</p>}{!status.loading && items.length === 0 && <p className="module-empty">Nenhuma conta recorrente cadastrada.</p>}{items.map((item) => <article className={`module-list-row bill-row ${item.active ? "" : "is-inactive"}`} key={item.id}><span className="bill-day">{item.due_day}</span><div><strong>{item.description}</strong><small>Vence todo dia {item.due_day} · {item.active ? "Ativa" : "Pausada"}</small></div><b>{formatMoney(item.amount)}</b><button aria-label={item.active ? "Pausar conta" : "Ativar conta"} onClick={() => toggle(item)}><Power size={15} /></button><button aria-label={`Excluir ${item.description}`} onClick={() => remove(item)}><Trash2 size={15} /></button></article>)}</section></div>;
}
