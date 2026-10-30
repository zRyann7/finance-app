const assert = require("node:assert/strict");
const test = require("node:test");

const { createCorsOptions, getAllowedOrigins } = require("../src/config/cors");

test("permite somente origens locais conhecidas em desenvolvimento", () => {
  const previousEnvironment = process.env.NODE_ENV;
  const previousOrigins = process.env.CORS_ORIGINS;
  process.env.NODE_ENV = "development";
  process.env.CORS_ORIGINS = "";

  const origins = getAllowedOrigins();
  assert.equal(origins.has("http://localhost:5173"), true);
  assert.equal(origins.has("https://malicious.example"), false);

  process.env.NODE_ENV = previousEnvironment;
  if (previousOrigins === undefined) delete process.env.CORS_ORIGINS;
  else process.env.CORS_ORIGINS = previousOrigins;
});

test("exige uma origem explícita em produção", () => {
  const previousEnvironment = process.env.NODE_ENV;
  const previousOrigins = process.env.CORS_ORIGINS;
  process.env.NODE_ENV = "production";
  delete process.env.CORS_ORIGINS;

  assert.throws(() => getAllowedOrigins(), /CORS_ORIGINS/);

  process.env.NODE_ENV = previousEnvironment;
  if (previousOrigins === undefined) delete process.env.CORS_ORIGINS;
  else process.env.CORS_ORIGINS = previousOrigins;
});

test("em produção aceita só as origens configuradas e rejeita qualquer *.vercel.app", () => {
  const previousEnvironment = process.env.NODE_ENV;
  const previousOrigins = process.env.CORS_ORIGINS;
  process.env.NODE_ENV = "production";
  process.env.CORS_ORIGINS = "https://meu-app.vercel.app/";

  try {
    const { origin } = createCorsOptions();
    const decide = (value) => {
      let allowed;
      origin(value, (error, result) => {
        assert.equal(error, null);
        allowed = result;
      });
      return allowed;
    };

    assert.equal(decide("https://meu-app.vercel.app"), true);
    assert.equal(decide("https://app-do-atacante.vercel.app"), false);
    assert.equal(decide("http://localhost:5173"), false);
    assert.equal(decide(undefined), true);
  } finally {
    process.env.NODE_ENV = previousEnvironment;
    if (previousOrigins === undefined) delete process.env.CORS_ORIGINS;
    else process.env.CORS_ORIGINS = previousOrigins;
  }
});
