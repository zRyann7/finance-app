const PUBLIC_PREFIX = "/storage/v1/object/public/avatars/";

// Extrai o caminho do arquivo dentro do bucket a partir da URL pública, ex.:
//   https://xyz.supabase.co/storage/v1/object/public/avatars/<user_id>/123.jpg -> "<user_id>/123.jpg"
// Só devolve caminhos que estejam na pasta do próprio usuário: é o único lugar onde a policy
// do bucket permite apagar. Arquivos no formato antigo (<user_id>-arquivo, na raiz) e URLs
// de outros usuários ou de fora do bucket retornam null.
export function avatarPathFromUrl(url, userId) {
  if (!url || !userId) return null;

  let pathname;
  try {
    pathname = new URL(url).pathname;
  } catch {
    return null;
  }

  if (!pathname.startsWith(PUBLIC_PREFIX)) return null;

  const path = decodeURIComponent(pathname.slice(PUBLIC_PREFIX.length));
  const [folder, file, ...rest] = path.split("/");

  if (folder !== userId || !file || rest.length > 0 || file === "." || file === "..") return null;
  return path;
}
