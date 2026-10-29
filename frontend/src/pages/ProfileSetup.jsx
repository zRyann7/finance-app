import { useState } from "react";
import { uploadAvatar } from "../services/avatar";

export function AvatarUpload({ userId, currentAvatarUrl, onUploadSuccess }) {
  const [preview, setPreview] = useState(currentAvatarUrl || "/default-avatar.png");
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview local imediato
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    setLoading(true);
    try {
      // Faz o upload direto para o bucket 'avatars' no Supabase Storage
      const publicUrl = await uploadAvatar(file, userId);

      if (onUploadSuccess) {
        onUploadSuccess(publicUrl);
      }
    } catch (error) {
      console.error("Erro ao enviar foto de perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300">
        <img
          src={preview}
          alt="Foto de perfil"
          className="w-full h-full object-cover"
        />
        {loading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs">
            Carregando...
          </div>
        )}
      </div>

      <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md font-medium transition">
        Escolher foto
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
}

// Export default exigido pelo App.jsx
export default function ProfileSetup() {
  return (
    <div className="module-page p-6">
      <h2 className="text-xl font-bold mb-4">Configuração Inicial de Perfil</h2>
      <AvatarUpload />
    </div>
  );
}