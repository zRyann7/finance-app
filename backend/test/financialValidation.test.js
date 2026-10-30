const assert = require("node:assert/strict");
const test = require("node:test");

const { getBillValues } = require("../src/controllers/billController");
const { getGoalValues } = require("../src/controllers/goalController");
const { getTransactionUpdates } = require("../src/controllers/transactionController");

test("valida movimentações completas e atualizações parciais", () => {
  assert.deepEqual(getTransactionUpdates({ description: "Salário", amount: "1500.50", type: "income" }), { description: "Salário", amount: "1500.50", type: "income" });
  assert.deepEqual(getTransactionUpdates({ amount: "20.00" }, true), { amount: "20.00" });
  assert.equal(getTransactionUpdates({ amount: "-1" }, true), null);
});

test("valida metas usando as colunas existentes", () => {
  assert.deepEqual(getGoalValues({ name: "Reserva", target_amount: "1000", saved_amount: "50" }), { name: "Reserva", target_amount: "1000", saved_amount: "50" });
  assert.equal(getGoalValues({ name: "", target_amount: "0" }), null);
});

test("valida dia de vencimento e estado de contas recorrentes", () => {
  assert.deepEqual(getBillValues({ description: "Internet", amount: "99.90", due_day: 10 }), { description: "Internet", amount: "99.90", due_day: 10, active: true });
  assert.equal(getBillValues({ description: "Conta", amount: "10", due_day: 32 }), null);
});

test("metas rejeitam datas impossíveis e null em atualização parcial", () => {
  const base = { name: "Viagem", target_amount: "1000" };

  assert.equal(getGoalValues({ ...base, deadline: "2026-02-31" }), null);
  assert.equal(getGoalValues({ ...base, deadline: "2026-04-31" }), null);
  assert.equal(getGoalValues({ ...base, deadline: "2026-13-01" }), null);
  assert.equal(getGoalValues({ ...base, deadline: "2028-02-29" }).deadline, "2028-02-29");
  assert.equal(getGoalValues({ ...base, deadline: "" }).deadline, null);

  assert.equal(getGoalValues({ saved_amount: null }, true), null);
  assert.deepEqual(getGoalValues({ saved_amount: "0" }, true), { saved_amount: "0" });
});

test("transações rejeitam datas impossíveis", () => {
  const base = { description: "Mercado", amount: "10", type: "expense" };

  assert.equal(getTransactionUpdates({ ...base, date: "2026-02-31" }), null);
  assert.equal(getTransactionUpdates({ ...base, date: "2026-10-31" }).date, "2026-10-31");
});
