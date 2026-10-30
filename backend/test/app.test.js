const assert = require("node:assert/strict");
const test = require("node:test");

const { app } = require("../src/app");

async function withServer(run) {
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));

  try {
    await run(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test("responde ao health check", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/health`);

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: "ok" });
  });
});

test("JSON malformado devolve 400 com mensagem adequada, não 'erro interno'", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{oops",
    });

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: "JSON inválido na requisição." });
  });
});

test("corpo acima do limite devolve 413", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "a@b.co", password: "x".repeat(20_000) }),
    });

    assert.equal(response.status, 413);
  });
});

test("rota inexistente devolve 404 em JSON (inclui /api/api duplicado)", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/api/auth/login`, { method: "POST" });

    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { error: "Rota não encontrada." });
  });
});

test("preflight não libera origem arbitrária da Vercel", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/summary`, {
      method: "OPTIONS",
      headers: {
        Origin: "https://qualquer-coisa.vercel.app",
        "Access-Control-Request-Method": "GET",
      },
    });

    assert.equal(response.headers.get("access-control-allow-origin"), null);
  });
});
