import { useMemo, useState } from "react";
import { Save } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import ModuleHeader from "../components/ui/ModuleHeader";
import { createTransaction } from "../services/api";
import { INVALID_AMOUNT_MESSAGE, parseBRL } from "../utils/money";

export default function TransactionForm() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialType = useMemo(() => params.get("type") === "income" ? "income" : "expense", [params]);
  const [form, setForm] = useState({ description: "", amount: "", type: initialType, date: new Date().toISOString().slice(0, 10) });
  const [error, setError] = useState("");
  const [amountError, setAmountError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    const amount = parseBRL(form.amount);
    if (amount === null) {
      setAmountError(INVALID_AMOUNT_MESSAGE);
      return;
    }
    setAmountError("");
    setLoading(true);
    try {
      await createTransaction({ ...form, amount });
      navigate("/transactions", { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Não foi possível salvar a movimentação.");
    } finally { setLoading(false); }
  }

  return (
    <div className="module-page">
      <ModuleHeader eyebrow="NOVA MOVIMENTAÇÃO" title={form.type === "income" ? "Adicionar receita" : "Adicionar despesa"} description="O lançamento será associado somente à sua conta." />
      <form className="module-card module-form form-narrow" onSubmit={submit}>
        <label>Descrição<input required maxLength={200} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Ex.: Spotify, salário, mercado" /></label>
        <div className="form-grid"><label>Valor em reais<input required inputMode="decimal" aria-invalid={Boolean(amountError)} aria-describedby={amountError ? "amount-error" : undefined} value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="0,00" />{amountError && <small id="amount-error" className="field-error" role="alert">{amountError}</small>}</label><label>Tipo<select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}><option value="income">Receita</option><option value="expense">Despesa</option></select></label></div>
        <label>Data<input type="date" required value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></label>
        {error && <div className="module-error" role="alert">{error}</div>}
        <div className="form-actions"><button type="button" onClick={() => navigate("/transactions")}>Cancelar</button><button className="primary-action" disabled={loading}><Save size={15} /> {loading ? "Salvando…" : "Salvar"}</button></div>
      </form>
    </div>
  );
}
