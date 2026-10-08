const {
  createSupabaseClient,
} = require("../config/supabase");

function getUserDisplayName(user) {
  const metadata = user?.user_metadata || {};
  const candidates = [
    metadata.full_name,
    metadata.name,
    metadata.display_name,
    metadata.nome,
  ];
  const displayName = candidates.find(
    (candidate) => typeof candidate === "string" && candidate.trim(),
  );

  return displayName ? displayName.trim().slice(0, 80) : null;
}

function getPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: getUserDisplayName(user),
  };
}

function getAuthErrorResponse(error) {
  if (error?.name === "AuthRetryableFetchError") {
    return {
      status: 503,
      message: "Não foi possível conectar ao serviço de autenticação.",
    };
  }

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
      name: error.name || "unknown",
      status: error.status || response.status,
    });

    return res.status(response.status).json({
      error: response.message,
      auth_code: error.code || error.name || "unknown",
    });
  }

  return res.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_in: data.session.expires_in,
    user: getPublicUser(data.user),
  });
}

function getCurrentUser(req, res) {
  return res.json(getPublicUser(req.user));
}

module.exports = {
  login,
  getAuthErrorResponse,
  getCurrentUser,
  getUserDisplayName,
};
