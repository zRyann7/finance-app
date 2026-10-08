const assert = require("node:assert/strict");
const { once } = require("node:events");
const test = require("node:test");
const express = require("express");

const { loginLimiter } = require("../src/middlewares/rateLimiters");

test("bloqueia tentativas de login acima do limite", async (context) => {
  const app = express();
  app.post("/login", loginLimiter, (req, res) => {
    res.status(401).json({ error: "Credenciais inválidas." });
  });

  const server = app.listen(0, "127.0.0.1");
  context.after(() => server.close());
  await once(server, "listening");

  const { port } = server.address();
  let response;

  for (let attempt = 0; attempt < 11; attempt++) {
    response = await fetch(`http://127.0.0.1:${port}/login`, {
      method: "POST",
    });
  }

  assert.equal(response.status, 429);
  assert.match(response.headers.get("ratelimit"), /r=0/);
  assert.ok(response.headers.get("retry-after"));
  assert.deepEqual(await response.json(), {
    error: "Muitas tentativas de login. Tente novamente em 15 minutos.",
  });
});
