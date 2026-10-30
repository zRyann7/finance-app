const {
  isValidUsername,
  normalizeUsername,
} = require("../utils/validation");

const PROFILE_COLUMNS = "id, username, avatar_url, created_at, updated_at";

function isDuplicateUsernameError(error) {
  return (
    error?.code === "23505" ||
    /profiles_username_lower_key|duplicate key|unique constraint/i.test(
      error?.message || "",
    )
  );
}

// O avatar só pode apontar para o bucket público "avatars" do PRÓPRIO projeto Supabase e para um
// arquivo do próprio usuário. Aceitar qualquer URL permitiria rastreamento (pixel externo),
// conteúdo misto (http) e imagem de terceiros exibida na interface.
//   novo:   <supabase>/storage/v1/object/public/avatars/<user_id>/<arquivo>
//   legado: <supabase>/storage/v1/object/public/avatars/<user_id>-<arquivo>
const AVATAR_PUBLIC_PATH = "/storage/v1/object/public/avatars/";
const AVATAR_FILE_PATTERN = /^[A-Za-z0-9._-]{1,120}$/;

function validateAvatarUrl(value, { userId, supabaseUrl = process.env.SUPABASE_URL } = {}) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string" || value.length > 2048) return undefined;
  if (typeof userId !== "string" || !userId || !supabaseUrl) return undefined;

  try {
    const parsed = new URL(value);
    const allowedOrigin = new URL(supabaseUrl).origin;

    if (parsed.origin !== allowedOrigin || parsed.search || parsed.hash) return undefined;
    if (parsed.username || parsed.password) return undefined;
    if (!parsed.pathname.startsWith(AVATAR_PUBLIC_PATH)) return undefined;

    const objectPath = parsed.pathname.slice(AVATAR_PUBLIC_PATH.length);
    const [folder, file, ...rest] = objectPath.split("/");

    if (folder === userId && file && rest.length === 0 && AVATAR_FILE_PATTERN.test(file)) {
      return value;
    }

    if (folder.startsWith(`${userId}-`) && file === undefined && AVATAR_FILE_PATTERN.test(folder)) {
      return value;
    }

    return undefined;
  } catch {
    return undefined;
  }
}

async function getProfile(req, res) {
  const { data, error } = await req.supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", req.user.id)
    .maybeSingle();

  if (error) {
    console.error("Erro ao consultar perfil:", error.message);
    return res.status(500).json({ error: "Erro ao consultar seu perfil." });
  }

  if (!data) {
    return res.status(404).json({
      error: "Complete seu perfil para continuar.",
      code: "PROFILE_REQUIRED",
    });
  }

  return res.json(data);
}

async function createProfile(req, res) {
  const username = normalizeUsername(req.body?.username);

  if (!isValidUsername(username)) {
    return res.status(400).json({
      error: "O username deve ter de 3 a 20 caracteres: letras, números ou underscore.",
    });
  }

  const { data, error } = await req.supabase
    .from("profiles")
    .insert({ id: req.user.id, username })
    .select(PROFILE_COLUMNS)
    .single();

  if (error) {
    if (isDuplicateUsernameError(error)) {
      return res.status(409).json({ error: "Este nome de usuário já está em uso." });
    }

    console.error("Erro ao criar perfil:", error.message);
    return res.status(500).json({ error: "Erro ao concluir seu perfil." });
  }

  return res.status(201).json(data);
}

async function updateProfile(req, res) {
  const updates = {};

  if (Object.hasOwn(req.body || {}, "username")) {
    const username = normalizeUsername(req.body.username);
    if (!isValidUsername(username)) {
      return res.status(400).json({
        error: "O username deve ter de 3 a 20 caracteres: letras, números ou underscore.",
      });
    }
    updates.username = username;
  }

  if (Object.hasOwn(req.body || {}, "avatar_url")) {
    const avatarUrl = validateAvatarUrl(req.body.avatar_url, { userId: req.user.id });
    if (avatarUrl === undefined) {
      return res.status(400).json({ error: "Use uma foto enviada pelo próprio aplicativo." });
    }
    updates.avatar_url = avatarUrl;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "Nenhuma alteração válida foi informada." });
  }

  const { data, error } = await req.supabase
    .from("profiles")
    .update(updates)
    .eq("id", req.user.id)
    .select(PROFILE_COLUMNS)
    .maybeSingle();

  if (error) {
    if (isDuplicateUsernameError(error)) {
      return res.status(409).json({ error: "Este nome de usuário já está em uso." });
    }

    console.error("Erro ao atualizar perfil:", error.message);
    return res.status(500).json({ error: "Erro ao atualizar seu perfil." });
  }

  if (!data) {
    return res.status(404).json({
      error: "Complete seu perfil antes de alterá-lo.",
      code: "PROFILE_REQUIRED",
    });
  }

  return res.json(data);
}

module.exports = {
  getProfile,
  createProfile,
  updateProfile,
  isDuplicateUsernameError,
  validateAvatarUrl,
};
