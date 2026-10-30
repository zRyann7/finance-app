const {
  createSupabaseClient,
  revokeSession,
} = require("../config/supabase");
const {
  isValidEmail,
  isValidPassword,
  isValidUsername,
  normalizeUsername,
} = require("../utils/validation");

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

const DUPLICATE_ACCOUNT_CODES = ["user_already_exists", "email_exists"];
const EMAIL_CONFIRMATION_MESSAGE = "Conta criada. Confirme seu email antes de entrar.";

function isDuplicateEmailError(error) {
  return DUPLICATE_ACCOUNT_CODES.includes(error?.code);
}

function getRegistrationErrorResponse(error) {
  if (error?.code === "weak_password") {
    return { status: 400, message: "A senha não atende aos requisitos de segurança." };
  }

  if (/database error saving new user|duplicate key|username/i.test(error?.message || "")) {
    return { status: 409, message: "Este nome de usuário já está em uso." };
  }

  if (error?.name === "AuthRetryableFetchError") {
    return { status: 503, message: "O serviço de cadastro está indisponível." };
  }

  return { status: 400, message: "Não foi possível criar a conta." };
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

    return res.status(response.status).json({ error: response.message });
  }

  return res.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_in: data.session.expires_in,
    user: getPublicUser(data.user),
  });
}

async function register(req, res) {
  const { email, password, confirmPassword } = req.body || {};
  const username = normalizeUsername(req.body?.username);

  if (!isValidUsername(username)) {
    return res.status(400).json({
      error: "O username deve ter de 3 a 20 caracteres: letras, números ou underscore.",
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Informe um email válido." });
  }

  if (!isValidPassword(password)) {
    return res.status(400).json({
      error: "A senha deve ter entre 8 e 72 caracteres.",
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "As senhas não coincidem." });
  }

  const supabase = createSupabaseClient();
  const { data: usernameAvailable, error: availabilityError } =
    await supabase.rpc("is_username_available", {
      candidate_username: username,
    });

  if (availabilityError) {
    console.error("Erro ao validar username:", availabilityError.message);
    return res.status(503).json({
      error: "O cadastro de perfis ainda não está disponível. Aplique a migração do Supabase.",
    });
  }

  if (!usernameAvailable) {
    return res.status(409).json({ error: "Este nome de usuário já está em uso." });
  }

  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: { username },
    },
  });

  if (error) {
    // Anti-enumeração: um e-mail já cadastrado recebe a MESMA resposta de uma conta nova,
    // para que o endpoint não sirva para descobrir quem já usa o sistema.
    if (isDuplicateEmailError(error)) {
      return res.status(201).json({
        requires_email_confirmation: true,
        message: EMAIL_CONFIRMATION_MESSAGE,
      });
    }

    const response = getRegistrationErrorResponse(error);
    console.warn("Falha no cadastro Supabase Auth:", {
      code: error.code || "unknown",
      name: error.name || "unknown",
      status: error.status || response.status,
    });
    return res.status(response.status).json({ error: response.message });
  }

  const requiresEmailConfirmation = !data.session;

  return res.status(201).json({
    requires_email_confirmation: requiresEmailConfirmation,
    message: requiresEmailConfirmation
      ? EMAIL_CONFIRMATION_MESSAGE
      : "Conta criada com sucesso.",
    ...(data.session && {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
      user: {
        ...getPublicUser(data.user),
        username,
      },
    }),
  });
}

async function refreshSession(req, res) {
  const { refreshToken } = req.body || {};
  if (typeof refreshToken !== "string" || !refreshToken || refreshToken.length > 2048) {
    return res.status(400).json({ error: "Refresh token inválido." });
  }

  const supabase = createSupabaseClient();
  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
  if (error || !data.session) {
    return res.status(401).json({ error: "Sua sessão expirou. Entre novamente." });
  }

  return res.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_in: data.session.expires_in,
    user: getPublicUser(data.user),
  });
}

async function logout(req, res) {
  try {
    await revokeSession(req.accessToken);
    return res.status(204).send();
  } catch (error) {
    console.error("Erro ao encerrar sessão:", error.message);
    return res.status(503).json({ error: "Não foi possível encerrar a sessão no momento." });
  }
}

function getCurrentUser(req, res) {
  return res.json(getPublicUser(req.user));
}

module.exports = {
  login,
  register,
  refreshSession,
  logout,
  getAuthErrorResponse,
  getRegistrationErrorResponse,
  isDuplicateEmailError,
  getCurrentUser,
  getUserDisplayName,
};
