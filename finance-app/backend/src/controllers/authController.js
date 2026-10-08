const {
  createSupabaseClient,
} = require("../config/supabase");

async function login(req, res) {
  const { email, password } = req.body || {};

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    return res.status(400).json({
      error: "Email e senha são obrigatórios.",
    });
  }

  const supabase = createSupabaseClient();

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (error) {
    return res.status(401).json({
      error: "Email ou senha inválidos.",
    });
  }

  return res.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_in: data.session.expires_in,
    user: {
      id: data.user.id,
      email: data.user.email,
    },
  });
}

module.exports = { login };
