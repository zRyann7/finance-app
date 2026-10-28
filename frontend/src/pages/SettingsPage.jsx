import { useState } from "react";
import { Save, UserRound } from "lucide-react";
import { useOutletContext } from "react-router";
import ModuleHeader from "../components/ui/ModuleHeader";
import { updateProfile } from "../services/api";

export default function SettingsPage() {
  const { session, profile, onProfileChange } = useOutletContext();
  const [form, setForm] = useState({ username: profile?.username || "", avatar_url: profile?.avatar_url || "" });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault(); setLoading(true); setMessage({ type: "", text: "" });
    try { const updated = await updateProfile({ username: form.username.trim(), avatar_url: form.avatar_url.trim() || null }); onProfileChange(updated); setMessage({ type: "success", text: "Perfil atualizado com sucesso." }); }
    catch (error) { setMessage({ type: "error", text: error.response?.data?.error || "Não foi possível atualizar o perfil." }); }
    finally { setLoading(false); }
  }

  return <div className="module-page"><ModuleHeader eyebrow="CONTA" title="Configurações" description="Gerencie as informações visíveis da sua conta pessoal." /><div className="settings-grid"><section className="module-card settings-profile"><div className="settings-avatar"><UserRound size={30} /></div><strong>{profile?.username}</strong><span>{session?.user?.email}</span></section><form className="module-card module-form" onSubmit={submit}><label>Nome de usuário<input required minLength={3} maxLength={20} pattern="[A-Za-z0-9_]+" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} /></label><label>URL do avatar (opcional)<input type="url" value={form.avatar_url} onChange={(event) => setForm({ ...form, avatar_url: event.target.value })} placeholder="https://…" /></label>{message.text && <div className={message.type === "error" ? "module-error" : "module-success"}>{message.text}</div>}<div className="form-actions"><button className="primary-action" disabled={loading}><Save size={15} /> {loading ? "Salvando…" : "Salvar alterações"}</button></div></form></div></div>;
}
