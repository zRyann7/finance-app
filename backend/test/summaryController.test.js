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

const { getHistory, shiftMonth } = require("../src/controllers/summaryController");

test("shiftMonth atravessa a virada de ano nos dois sentidos", () => {
  assert.equal(shiftMonth("2026-12", 1), "2027-01");
  assert.equal(shiftMonth("2026-01", -1), "2025-12");
  assert.equal(shiftMonth("2026-10", -5), "2026-05");
});

test("histórico soma todas as páginas por mês, sem o limite de 500 da listagem", async () => {
  const bounds = [];
  const firstPage = Array.from({ length: 500 }, (_, index) => ({
    id: index + 1,
    amount: "1.00",
    type: "income",
    date: "2026-08-15",
  }));
  const secondPage = [
    { id: 501, amount: "10.50", type: "expense", date: "2026-10-01" },
    { id: 502, amount: "0.50", type: "expense", date: "2026-10-31" },
  ];
  const pages = [firstPage, secondPage];
  const req = {
    query: { end: "2026-10", months: "3" },
    user: { id: "user-123" },
    supabase: {
      from() {
        return {
          select() { return this; },
          eq() { return this; },
          gte(column, value) { bounds.push([column, value]); return this; },
          lt(column, value) { bounds.push([column, value]); return this; },
          order() { return this; },
          range() { return Promise.resolve({ data: pages.shift(), error: null }); },
        };
      },
    },
  };
  const res = createResponse();

  await getHistory(req, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(bounds.slice(0, 2), [["date", "2026-08-01"], ["date", "2026-11-01"]]);
  assert.deepEqual(res.body, [
    { month: "2026-08", income: 500, expenses: 0, balance: 500 },
    { month: "2026-09", income: 0, expenses: 0, balance: 0 },
    { month: "2026-10", income: 0, expenses: 11, balance: -11 },
  ]);
});

test("histórico valida mês final e quantidade de meses antes de consultar o banco", async () => {
  for (const query of [{}, { end: "2026-13" }, { end: "2026-10", months: "0" }, { end: "2026-10", months: "13" }, { end: "2026-10", months: "abc" }]) {
    const res = createResponse();
    await getHistory({ query }, res);
    assert.equal(res.statusCode, 400, JSON.stringify(query));
  }
});
