import { useState } from "react";
import { Save, UserRound, Upload, Loader2 } from "lucide-react";
import { useOutletContext } from "react-router";
import ModuleHeader from "../components/ui/ModuleHeader";
import { updateProfile } from "../services/api";
import { uploadAvatar } from "../services/avatar"; // Ou './ProfileSetup' se a função estiver lá

export default function SettingsPage() {
  const { session, profile, onProfileChange } = useOutletContext();
  const [form, setForm] = useState({
    username: profile?.username || "",
    avatar_url: profile?.avatar_url || ""
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Manipula o envio da foto escolhida
  async function handleFileChange(event) {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setMessage({ type: "", text: "" });

    try {
      // 1. Faz o upload para o Supabase Storage
      const publicUrl = await uploadAvatar(file, session?.user?.id);

      // 2. Preenche o estado do avatar com a URL gerada
      setForm((prev) => ({ ...prev, avatar_url: publicUrl }));
      setMessage({
        type: "success",
        text: "Foto enviada! Clique em 'Salvar alterações' para confirmar no perfil."
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Erro ao fazer upload da foto."
      });
    } finally {
      setUploading(false);
    }
  }

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const updated = await updateProfile({
        username: form.username.trim(),
        avatar_url: form.avatar_url.trim() || null
      });
      onProfileChange(updated);
      setMessage({ type: "success", text: "Perfil atualizado com sucesso." });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Não foi possível atualizar o perfil."
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="module-page">
      <ModuleHeader
        eyebrow="CONTA"
        title="Configurações"
        description="Gerencie as informações visíveis da sua conta pessoal."
      />

      <div className="settings-grid">
        {/* Card do Perfil com Preview do Avatar */}
        <section className="module-card settings-profile">
          <div className="settings-avatar overflow-hidden relative flex items-center justify-center">
            {form.avatar_url ? (
              <img
                src={form.avatar_url}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <UserRound size={30} />
            )}
          </div>
          <strong>{profile?.username}</strong>
          <span>{session?.user?.email}</span>
        </section>

        {/* Formulário de Edição */}
        <form className="module-card module-form" onSubmit={submit}>
          <label>
            Nome de usuário
            <input
              required
              minLength={3}
              maxLength={20}
              pattern="[A-Za-z0-9_]+"
              value={form.username}
              onChange={(event) =>
                setForm({ ...form, username: event.target.value })
              }
            />
          </label>

          {/* Botão de Seleção de Arquivo */}
          <div className="form-group">
            <label className="block mb-2">Foto de perfil</label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white text-sm px-4 py-2 rounded-md transition">
                {uploading ? (
                  <Loader2 className="animate-spin" size={15} />
                ) : (
                  <Upload size={15} />
                )}
                {uploading ? "Enviando..." : "Escolher arquivo"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          {message.text && (
            <div
              className={
                message.type === "error" ? "module-error" : "module-success"
              }
            >
              {message.text}
            </div>
          )}

          <div className="form-actions">
            <button className="primary-action" disabled={loading || uploading}>
              <Save size={15} /> {loading ? "Salvando…" : "Salvar alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}