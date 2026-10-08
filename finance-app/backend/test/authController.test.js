const test = require("node:test");
const assert = require("node:assert/strict");

const { getAuthErrorResponse } = require("../src/controllers/authController");

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
