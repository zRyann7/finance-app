import { getFreshAccessToken } from "./api";
import { createSupabaseWithToken } from "./supabase";

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

const EXTENSION_BY_TYPE = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function uploadAvatar(file, userId) {
  if (!userId) {
    throw new Error("Não foi possível identificar o usuário. Entre novamente.");
  }

  // A extensão vem do tipo real do arquivo, não do nome (que o usuário controla).
  const extension = EXTENSION_BY_TYPE[file.type];
  if (!extension) {
    throw new Error("Envie uma imagem JPG, PNG, WebP ou GIF.");
  }

  if (file.size > AVATAR_MAX_BYTES) {
    throw new Error("A imagem deve ter no máximo 2 MB.");
  }

  const accessToken = await getFreshAccessToken();
  if (!accessToken) {
    throw new Error("Sua sessão expirou. Entre novamente.");
  }

  const storage = createSupabaseWithToken(accessToken).storage.from("avatars");

  // A policy do bucket só permite gravar dentro da pasta do próprio usuário: <user_id>/arquivo
  const filePath = `${userId}/${Date.now()}.${extension}`;

  const { error: uploadError } = await storage.upload(filePath, file, {
    upsert: false,
    contentType: file.type,
  });

  if (uploadError) {
    throw new Error(`Erro no upload: ${uploadError.message}`);
  }

  return storage.getPublicUrl(filePath).data.publicUrl;
}
