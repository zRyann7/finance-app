import { useState } from "react";
import { ArrowRight, LockKeyhole, Mail, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router";
import BrandMark from "../components/ui/BrandMark";
import { register } from "../services/api";

const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,20}$/;

export default function Register({ onAuthenticated }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!USERNAME_PATTERN.test(form.username.trim())) {
      setError("Use de 3 a 20 letras, números ou underscore no username.");
      return;
    }
    if (form.password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      const result = await register({ ...form, username: form.username.trim() });
      if (result.requires_email_confirmation) {
        setSuccess(result.message);
        setForm({ username: "", email: "", password: "", confirmPassword: "" });
      } else {
        onAuthenticated(result);
        navigate("/dashboard", { replace: true });
      }
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Não foi possível criar sua conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-scene auth-register-scene">
      <div className="login-glow" />
      <section className="login-card register-card">
        <div className="login-brand"><BrandMark /></div>
        <span className="eyebrow">COMECE AGORA</span>
        <h1>Criar sua conta</h1>
        <p>Configure seu acesso ao painel financeiro pessoal.</p>
        <form onSubmit={handleSubmit}>
          <label><span>Nome de usuário</span><div className="input-wrap"><UserRound size={16} /><input autoComplete="username" required minLength={3} maxLength={20} pattern="[A-Za-z0-9_]+" value={form.username} onChange={(event) => update("username", event.target.value)} placeholder="seu_username" /></div></label>
          <label><span>Email</span><div className="input-wrap"><Mail size={16} /><input type="email" autoComplete="email" required value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="voce@exemplo.com" /></div></label>
          <div className="auth-field-grid">
            <label><span>Senha</span><div className="input-wrap"><LockKeyhole size={16} /><input type="password" autoComplete="new-password" required minLength={8} maxLength={72} value={form.password} onChange={(event) => update("password", event.target.value)} placeholder="••••••••" /></div></label>
            <label><span>Confirmar senha</span><div className="input-wrap"><LockKeyhole size={16} /><input type="password" autoComplete="new-password" required value={form.confirmPassword} onChange={(event) => update("confirmPassword", event.target.value)} placeholder="••••••••" /></div></label>
          </div>
          {error && <div className="login-error" role="alert">{error}</div>}
          {success && <div className="login-success" role="status">{success}</div>}
          <button className="login-submit" disabled={loading || Boolean(success)}>{loading ? "Criando…" : "Criar conta"}<ArrowRight size={16} /></button>
        </form>
        <p className="auth-switch">Já possui uma conta? <Link to="/login">Voltar ao login</Link></p>
      </section>
    </main>
  );
}
