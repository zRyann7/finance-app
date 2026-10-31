import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useSearchParams } from "react-router";
import ModuleHeader from "../components/ui/ModuleHeader";
import { createGoal, deleteGoal, getGoals, updateGoal } from "../services/api";
import { INVALID_AMOUNT_MESSAGE, formatMoney, parseBRL, toInputAmount } from "../utils/money";

export default function GoalsPage() {
  const [params] = useSearchParams();
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(params.get("new") === "1");
  const [form, setForm] = useState({ name: "", target_amount: "", saved_amount: "0", deadline: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState({ loading: true, error: "" });

  async function load() {
    try { setItems(await getGoals()); setStatus({ loading: false, error: "" }); }
    catch (error) { setStatus({ loading: false, error: error.response?.data?.error || "Não foi possível carregar suas metas." }); }
  }
  useEffect(() => { load(); }, []);

  async function submit(event) {
    event.preventDefault();
    const target_amount = parseBRL(form.target_amount);
    const saved_amount = parseBRL(form.saved_amount);
    const errors = {};
    if (target_amount === null) errors.target_amount = INVALID_AMOUNT_MESSAGE;
    if (saved_amount === null) errors.saved_amount = INVALID_AMOUNT_MESSAGE;
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    try {
      const goal = await createGoal({ ...form, target_amount, saved_amount, deadline: form.deadline || null });
      setItems((current) => [...current, goal]);
      setForm({ name: "", target_amount: "", saved_amount: "0", deadline: "" });
      setFieldErrors({});
      setShowForm(false);
    } catch (error) { setStatus({ loading: false, error: error.response?.data?.error || "Não foi possível criar a meta." }); }
  }

  async function changeProgress(goal) {
    const next = window.prompt("Quanto já foi reservado para esta meta?", toInputAmount(goal.saved_amount));
    if (next === null) return;
    const saved_amount = parseBRL(next);
    if (saved_amount === null) {
      setStatus({ loading: false, error: INVALID_AMOUNT_MESSAGE });
      return;
    }
    try {
      const updated = await updateGoal(goal.id, { saved_amount });
      setItems((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (error) { setStatus({ loading: false, error: error.response?.data?.error || "Não foi possível atualizar a meta." }); }
  }

  async function remove(goal) {
    if (!window.confirm(`Excluir a meta “${goal.name}”?`)) return;
    try { await deleteGoal(goal.id); setItems((current) => current.filter((item) => item.id !== goal.id)); }
    catch (error) { setStatus({ loading: false, error: error.response?.data?.error || "Não foi possível excluir a meta." }); }
  }

  return (
    <div className="module-page">
      <ModuleHeader eyebrow="PLANEJAMENTO" title="Metas financeiras" description="Defina objetivos reais e acompanhe o valor reservado." action={<button className="primary-action" onClick={() => setShowForm((value) => !value)}><Plus size={15} /> Adicionar meta</button>} />
      {status.error && <div className="module-error" role="alert">{status.error}</div>}
      {showForm && <form className="module-card module-form compact-form" onSubmit={submit}><div className="form-grid"><label>Nome<input required maxLength={120} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>Objetivo<input required inputMode="decimal" aria-invalid={Boolean(fieldErrors.target_amount)} aria-describedby={fieldErrors.target_amount ? "goal-target-error" : undefined} value={form.target_amount} onChange={(event) => setForm({ ...form, target_amount: event.target.value })} />{fieldErrors.target_amount && <small id="goal-target-error" className="field-error" role="alert">{fieldErrors.target_amount}</small>}</label><label>Valor já reservado<input required inputMode="decimal" aria-invalid={Boolean(fieldErrors.saved_amount)} aria-describedby={fieldErrors.saved_amount ? "goal-saved-error" : undefined} value={form.saved_amount} onChange={(event) => setForm({ ...form, saved_amount: event.target.value })} />{fieldErrors.saved_amount && <small id="goal-saved-error" className="field-error" role="alert">{fieldErrors.saved_amount}</small>}</label><label>Prazo opcional<input type="date" value={form.deadline} onChange={(event) => setForm({ ...form, deadline: event.target.value })} /></label></div><div className="form-actions"><button type="button" onClick={() => setShowForm(false)}>Cancelar</button><button className="primary-action">Criar meta</button></div></form>}
      <section className="module-grid">
        {status.loading && <p className="module-empty">Carregando metas…</p>}
        {!status.loading && items.length === 0 && <p className="module-empty">Você ainda não cadastrou metas.</p>}
        {items.map((goal) => { const progress = Math.min(100, Math.round((Number(goal.saved_amount) / Number(goal.target_amount)) * 100) || 0); return <article className="module-card goal-module-card" key={goal.id}><div className="module-card-heading"><div><span>{progress}% concluído</span><h2>{goal.name}</h2></div><button aria-label={`Excluir ${goal.name}`} onClick={() => remove(goal)}><Trash2 size={15} /></button></div><div className="progress-track"><div className="progress-value" style={{ width: `${progress}%` }} /></div><p>{formatMoney(goal.saved_amount)} de {formatMoney(goal.target_amount)}</p><button className="text-action" onClick={() => changeProgress(goal)}>Atualizar progresso</button></article>; })}
      </section>
    </div>
  );
}
