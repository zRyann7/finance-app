const test = require("node:test");
const assert = require("node:assert/strict");

const { getSummary } = require("../src/controllers/summaryController");

function createResponse() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

function createSupabase(pages, capturedRanges) {
  return {
    from(table) {
      assert.equal(table, "transactions");

      const query = {
        select() { return this; },
        eq(column, value) {
          assert.equal(column, "user_id");
          assert.equal(value, "user-123");
          return this;
        },
        gte(column, value) {
          assert.deepEqual([column, value], ["date", "2026-10-01"]);
          return this;
        },
        lt(column, value) {
          assert.deepEqual([column, value], ["date", "2026-11-01"]);
          return this;
        },
        order() { return this; },
        range(start, end) {
          capturedRanges.push([start, end]);
          return Promise.resolve({ data: pages.shift(), error: null });
        },
      };

      return query;
    },
  };
}

test("calcula o resumo em centavos e percorre todas as páginas", async () => {
  const firstPage = Array.from({ length: 500 }, (_, index) => ({
    id: index + 1,
    amount: "0.01",
    type: "income",
  }));
  const ranges = [];
  const req = {
    query: { month: "2026-10" },
    user: { id: "user-123" },
    supabase: createSupabase([
      firstPage,
      [{ id: 501, amount: "2.35", type: "expense" }],
    ], ranges),
  };
  const res = createResponse();

  await getSummary(req, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, {
    month: "2026-10",
    income: 5,
    expenses: 2.35,
    balance: 2.65,
    transactions_count: 501,
  });
  assert.deepEqual(ranges, [[0, 499], [500, 999]]);
});

test("rejeita mês inválido antes de consultar o banco", async () => {
  const req = { query: { month: "2026-13" } };
  const res = createResponse();

  await getSummary(req, res);

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, {
    error: "Informe um mês válido no formato AAAA-MM.",
  });
});
