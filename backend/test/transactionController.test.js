const test = require("node:test");
const assert = require("node:assert/strict");

const { deleteTransaction } = require("../src/controllers/transactionController");

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
    send() {
      return this;
    },
  };
}

test("exclui a transação somente quando pertence ao usuário autenticado", async () => {
  const filters = [];
  const query = {
    delete() { return this; },
    eq(column, value) {
      filters.push([column, value]);
      return this;
    },
    select(columns) {
      assert.equal(columns, "id");
      return this;
    },
    maybeSingle() {
      return Promise.resolve({ data: { id: "tx-123" }, error: null });
    },
  };
  const req = {
    params: { id: "tx-123" },
    user: { id: "user-456" },
    supabase: {
      from(table) {
        assert.equal(table, "transactions");
        return query;
      },
    },
  };
  const res = createResponse();

  await deleteTransaction(req, res);

  assert.equal(res.statusCode, 204);
  assert.deepEqual(filters, [["id", "tx-123"], ["user_id", "user-456"]]);
});

test("retorna 404 sem revelar transações de outro usuário", async () => {
  const query = {
    delete() { return this; },
    eq() { return this; },
    select() { return this; },
    maybeSingle() {
      return Promise.resolve({ data: null, error: null });
    },
  };
  const req = {
    params: { id: "tx-inexistente" },
    user: { id: "user-456" },
    supabase: { from: () => query },
  };
  const res = createResponse();

  await deleteTransaction(req, res);

  assert.equal(res.statusCode, 404);
});
