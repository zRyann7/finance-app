import { useState } from "react";
import { ArrowRight, LogOut, UserRound } from "lucide-react";
import { useNavigate } from "react-router";
import BrandMark from "../components/ui/BrandMark";
import { createProfile } from "../services/api";

export default function ProfileSetup({ onProfileCreated, onLogout }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const profile = await createProfile({ username: username.trim() });
      onProfileCreated(profile);
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Não foi possível concluir seu perfil.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-scene">
      <div className="login-glow" />
      <section className="login-card">
        <div className="login-brand"><BrandMark /></div>
        <span className="eyebrow">PRIMEIRO ACESSO</span>
        <h1>Escolha seu username</h1>
        <p>Sua conta foi preservada. Defina como deseja aparecer no dashboard.</p>
        <form onSubmit={handleSubmit}>
          <label><span>Nome de usuário</span><div className="input-wrap"><UserRound size={16} /><input autoComplete="username" required minLength={3} maxLength={20} pattern="[A-Za-z0-9_]+" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="seu_username" /></div></label>
          {error && <div className="login-error" role="alert">{error}</div>}
          <button className="login-submit" disabled={loading}>{loading ? "Salvando…" : "Concluir perfil"}<ArrowRight size={16} /></button>
        </form>
        <button className="auth-secondary-action" onClick={onLogout}><LogOut size={14} /> Sair</button>
      </section>
    </main>
  );
}
