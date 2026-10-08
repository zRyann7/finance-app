const test = require("node:test");
const assert = require("node:assert/strict");

const {
  getAuthErrorResponse,
  getCurrentUser,
  getUserDisplayName,
} = require("../src/controllers/authController");

test("diferencia email não confirmado de credenciais inválidas", () => {
  assert.deepEqual(getAuthErrorResponse({ code: "email_not_confirmed" }), {
    status: 403,
    message: "Confirme seu email antes de entrar.",
  });

  assert.deepEqual(getAuthErrorResponse({ code: "invalid_credentials" }), {
    status: 401,
    message: "Email ou senha inválidos.",
  });
});

test("informa bloqueio temporário por excesso de tentativas", () => {
  assert.deepEqual(getAuthErrorResponse({ code: "over_request_rate_limit" }), {
    status: 429,
    message: "Muitas tentativas de login. Aguarde alguns minutos.",
  });
});

test("não classifica falha de conexão como credencial inválida", () => {
  assert.deepEqual(getAuthErrorResponse({ name: "AuthRetryableFetchError" }), {
    status: 503,
    message: "Não foi possível conectar ao serviço de autenticação.",
  });
});

test("obtém o nome do usuário pelos metadados do Supabase", () => {
  assert.equal(
    getUserDisplayName({
      user_metadata: { full_name: "  Ryan Souza  ", name: "Outro nome" },
    }),
    "Ryan Souza",
  );

  assert.equal(
    getUserDisplayName({ user_metadata: { display_name: "Ryan" } }),
    "Ryan",
  );
  assert.equal(getUserDisplayName({ user_metadata: {} }), null);
});

test("retorna somente os dados públicos do usuário autenticado", () => {
  let responseBody;
  const req = {
    user: {
      id: "user-id",
      email: "usuario@example.com",
      user_metadata: { full_name: "Ryan Souza", segredo: "não retornar" },
    },
  };
  const res = {
    json(body) {
      responseBody = body;
      return body;
    },
  };

  getCurrentUser(req, res);

  assert.deepEqual(responseBody, {
    id: "user-id",
    email: "usuario@example.com",
    name: "Ryan Souza",
  });
});
