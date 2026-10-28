const test = require("node:test");
const assert = require("node:assert/strict");

const { listGoals } = require("../src/controllers/goalController");

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

function createSupabase(pages, ranges) {
  return {
    from(table) {
      assert.equal(table, "financial_goals");

      return {
        select(columns) {
          assert.equal(columns, "id, name, target_amount, saved_amount, deadline, created_at");
          return this;
        },
        eq(column, value) {
          assert.deepEqual([column, value], ["user_id", "user-123"]);
          return this;
        },
        order(column) {
          assert.equal(column, "id");
          return this;
        },
        range(start, end) {
          ranges.push([start, end]);
          return Promise.resolve({ data: pages.shift(), error: null });
        },
      };
    },
  };
}

test("lista somente metas do usuário e percorre todas as páginas", async () => {
  const firstPage = Array.from({ length: 500 }, (_, index) => ({ id: index + 1 }));
  const ranges = [];
  const req = {
    user: { id: "user-123" },
    supabase: createSupabase([firstPage, [{ id: 501 }]], ranges),
  };
  const res = createResponse();

  await listGoals(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.length, 501);
  assert.deepEqual(ranges, [[0, 499], [500, 999]]);
});
