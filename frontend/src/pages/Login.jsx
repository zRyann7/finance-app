import { useState } from "react";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router";
import BrandMark from "../components/ui/BrandMark";
import ServerWakeNotice from "../components/ui/ServerWakeNotice";
import { useBackendWakeUp } from "../hooks/useBackendWakeUp";
import { login } from "../services/api";
import { describeRequestError } from "../utils/requestError";

export default function Login({ onAuthenticated }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isWaking = useBackendWakeUp();

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const session = await login(form);
      onAuthenticated(session);
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(describeRequestError(requestError, "Não foi possível entrar. Tente novamente em instantes."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-scene">
      <div className="login-glow" />
      <section className="login-card">
        <div className="login-brand"><BrandMark /></div>
        <span className="eyebrow">FINANÇAS PESSOAIS</span>
        <h1>Bem-vindo de volta</h1>
        <p>Entre para acessar o seu painel financeiro.</p>

        <form onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <div className="input-wrap"><Mail size={16} /><input type="email" autoComplete="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" /></div>
          </label>
          <label>
            <span>Senha</span>
            <div className="input-wrap"><LockKeyhole size={16} /><input type="password" autoComplete="current-password" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="••••••••" /></div>
          </label>
          {isWaking && <ServerWakeNotice />}
          {error && <div className="login-error" role="alert">{error}</div>}
          <button className="login-submit" disabled={loading}>{loading ? "Entrando…" : "Entrar"}<ArrowRight size={16} /></button>
        </form>
        <p className="auth-switch">Ainda não tem uma conta? <Link to="/register">Criar conta</Link></p>
      </section>
    </main>
  );
}
