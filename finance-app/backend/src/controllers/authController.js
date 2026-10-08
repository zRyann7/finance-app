const {
  createSupabaseClient,
} = require("../config/supabase");

function getAuthErrorResponse(error) {
  const responses = {
    email_not_confirmed: {
      status: 403,
      message: "Confirme seu email antes de entrar.",
    },
    user_banned: {
      status: 403,
      message: "Esta conta está temporariamente indisponível.",
    },
    over_request_rate_limit: {
      status: 429,
      message: "Muitas tentativas de login. Aguarde alguns minutos.",
    },
    request_timeout: {
      status: 503,
      message: "O serviço de autenticação demorou para responder.",
    },
  };

  return responses[error?.code] || {
    status: 401,
    message: "Email ou senha inválidos.",
  };
}

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
      email: email.trim(),
      password,
    });

  if (error) {
    const response = getAuthErrorResponse(error);

    console.warn("Falha no Supabase Auth:", {
      code: error.code || "unknown",
      status: error.status || response.status,
    });

    return res.status(response.status).json({
      error: response.message,
      auth_code: error.code || "unknown",
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

module.exports = { login, getAuthErrorResponse };
