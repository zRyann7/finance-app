import { supabase } from "./supabase";

export async function uploadAvatar(file, userId) {
  const fileExt = file.name.split(".").pop();
  const filePath = `${userId}-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    throw new Error(`Erro no upload: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}