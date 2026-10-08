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

function validateAvatarUrl(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string" || value.length > 2048) return undefined;

  try {
    const parsed = new URL(value);
    return ["http:", "https:"].includes(parsed.protocol) ? value : undefined;
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
    const avatarUrl = validateAvatarUrl(req.body.avatar_url);
    if (avatarUrl === undefined) {
      return res.status(400).json({ error: "Informe uma URL de avatar válida." });
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
