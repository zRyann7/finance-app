const assert = require("node:assert/strict");
const test = require("node:test");

const { getAllowedOrigins } = require("../src/config/cors");

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
