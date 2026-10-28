import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useSearchParams } from "react-router";
import ModuleHeader from "../components/ui/ModuleHeader";
import { createGoal, deleteGoal, getGoals, updateGoal } from "../services/api";

const money = (value) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value) || 0);

export default function GoalsPage() {
  const [params] = useSearchParams();
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(params.get("new") === "1");
  const [form, setForm] = useState({ name: "", target_amount: "", saved_amount: "0", deadline: "" });
  const [status, setStatus] = useState({ loading: true, error: "" });

  async function load() {
    try { setItems(await getGoals()); setStatus({ loading: false, error: "" }); }
    catch (error) { setStatus({ loading: false, error: error.response?.data?.error || "Não foi possível carregar suas metas." }); }
  }
  useEffect(() => { load(); }, []);

  async function submit(event) {
    event.preventDefault();
    try {
      const goal = await createGoal({ ...form, target_amount: form.target_amount.replace(",", "."), saved_amount: form.saved_amount.replace(",", "."), deadline: form.deadline || null });
      setItems((current) => [...current, goal]);
      setForm({ name: "", target_amount: "", saved_amount: "0", deadline: "" });
      setShowForm(false);
    } catch (error) { setStatus({ loading: false, error: error.response?.data?.error || "Não foi possível criar a meta." }); }
  }

  async function changeProgress(goal) {
    const next = window.prompt("Quanto já foi reservado para esta meta?", goal.saved_amount);
    if (next === null) return;
    try {
      const updated = await updateGoal(goal.id, { saved_amount: next.replace(",", ".") });
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
      {showForm && <form className="module-card module-form compact-form" onSubmit={submit}><div className="form-grid"><label>Nome<input required maxLength={120} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>Objetivo<input required inputMode="decimal" value={form.target_amount} onChange={(event) => setForm({ ...form, target_amount: event.target.value })} /></label><label>Valor já reservado<input required inputMode="decimal" value={form.saved_amount} onChange={(event) => setForm({ ...form, saved_amount: event.target.value })} /></label><label>Prazo opcional<input type="date" value={form.deadline} onChange={(event) => setForm({ ...form, deadline: event.target.value })} /></label></div><div className="form-actions"><button type="button" onClick={() => setShowForm(false)}>Cancelar</button><button className="primary-action">Criar meta</button></div></form>}
      <section className="module-grid">
        {status.loading && <p className="module-empty">Carregando metas…</p>}
        {!status.loading && items.length === 0 && <p className="module-empty">Você ainda não cadastrou metas.</p>}
        {items.map((goal) => { const progress = Math.min(100, Math.round((Number(goal.saved_amount) / Number(goal.target_amount)) * 100) || 0); return <article className="module-card goal-module-card" key={goal.id}><div className="module-card-heading"><div><span>{progress}% concluído</span><h2>{goal.name}</h2></div><button aria-label={`Excluir ${goal.name}`} onClick={() => remove(goal)}><Trash2 size={15} /></button></div><div className="progress-track"><div className="progress-value" style={{ width: `${progress}%` }} /></div><p>{money(goal.saved_amount)} de {money(goal.target_amount)}</p><button className="text-action" onClick={() => changeProgress(goal)}>Atualizar progresso</button></article>; })}
      </section>
    </div>
  );
}
