import { useState } from "react";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import BrandMark from "../components/ui/BrandMark";
import { login } from "../services/api";
import { saveSession } from "../services/session";

export default function Login({ onAuthenticated, onDemo }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const session = await login(form);
      saveSession(session);
      onAuthenticated(session);
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Não foi possível entrar. Verifique se o backend está ativo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-scene">
      <div className="login-glow" />
      <section className="login-card">
        <div className="login-brand"><BrandMark /></div>
        <span className="eyebrow">PERSONAL FINANCE</span>
        <h1>Welcome back</h1>
        <p>Sign in to open your financial dashboard.</p>

        <form onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <div className="input-wrap"><Mail size={16} /><input type="email" autoComplete="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" /></div>
          </label>
          <label>
            <span>Password</span>
            <div className="input-wrap"><LockKeyhole size={16} /><input type="password" autoComplete="current-password" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="••••••••" /></div>
          </label>
          {error && <div className="login-error" role="alert">{error}</div>}
          <button className="login-submit" disabled={loading}>{loading ? "Signing in…" : "Sign in"}<ArrowRight size={16} /></button>
        </form>

        <button className="demo-link" onClick={onDemo}>View interface with clearly labeled demo data</button>
      </section>
    </main>
  );
}
