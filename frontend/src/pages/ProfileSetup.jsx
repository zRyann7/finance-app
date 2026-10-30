import { useState } from "react";
import { ArrowRight, UserRound } from "lucide-react";
import { useNavigate } from "react-router";
import BrandMark from "../components/ui/BrandMark";
import { createProfile } from "../services/api";

const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,20}$/;

// Tela exibida quando a conta existe mas ainda não tem perfil (rota /profile/setup).
// A foto de perfil pode ser definida depois, em Configurações.
export default function ProfileSetup({ onProfileCreated, onLogout }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const trimmed = username.trim();
    if (!USERNAME_PATTERN.test(trimmed)) {
      setError("Use de 3 a 20 letras, números ou underscore no username.");
      return;
    }

    setLoading(true);
    try {
      const profile = await createProfile({ username: trimmed });
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
        <span className="eyebrow">QUASE LÁ</span>
        <h1>Complete seu perfil</h1>
        <p>Escolha o nome de usuário que aparecerá no seu painel.</p>

        <form onSubmit={handleSubmit}>
          <label>
            <span>Nome de usuário</span>
            <div className="input-wrap">
              <UserRound size={16} />
              <input
                autoComplete="username"
                required
                minLength={3}
                maxLength={20}
                pattern="[A-Za-z0-9_]+"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="seu_username"
              />
            </div>
          </label>
          {error && <div className="login-error" role="alert">{error}</div>}
          <button className="login-submit" disabled={loading}>
            {loading ? "Salvando…" : "Continuar"}<ArrowRight size={16} />
          </button>
        </form>

        <p className="auth-switch">
          Não é você? <button type="button" onClick={onLogout}>Sair</button>
        </p>
      </section>
    </main>
  );
}
