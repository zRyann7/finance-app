function getTransactionUpdates(body, partial = false) {
  const updates = {};
  const input = body || {};

  if (!partial || Object.hasOwn(input, "description")) {
    if (typeof input.description !== "string" || !input.description.trim() || input.description.length > 200) return null;
    updates.description = input.description.trim();
  }

  if (!partial || Object.hasOwn(input, "amount")) {
    const amount = String(input.amount ?? "");
    if (!/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(amount) || Number(amount) <= 0) return null;
    updates.amount = amount;
  }

  if (!partial || Object.hasOwn(input, "type")) {
    if (!["income", "expense"].includes(input.type)) return null;
    updates.type = input.type;
  }

  if (Object.hasOwn(input, "date")) {
    const validDate = typeof input.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input.date) && !Number.isNaN(Date.parse(input.date)) && new Date(input.date).toISOString().slice(0, 10) === input.date;
    if (!validDate) return null;
    updates.date = input.date;
  }

  return updates;
}

async function listTransactions(req, res) {
  const requestedLimit = Number(req.query?.limit ?? 500);
  const limit = Number.isInteger(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 500) : 500;

  let query = req.supabase
    .from("transactions")
    .select("id, description, amount, type, date, category_id")
    .eq("user_id", req.user.id)
    .order("date", { ascending: false })
    .limit(limit);

  if (["income", "expense"].includes(req.query?.type)) query = query.eq("type", req.query.type);

  if (typeof req.query?.month === "string" && /^20\d{2}-(0[1-9]|1[0-2])$/.test(req.query.month)) {
    const [year, month] = req.query.month.split("-").map(Number);
    const nextYear = month === 12 ? year + 1 : year;
    const nextMonth = month === 12 ? 1 : month + 1;
    query = query.gte("date", `${req.query.month}-01`).lt("date", `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Erro ao listar:", error.message);
    return res.status(500).json({ error: "Erro ao consultar movimentações." });
  }
  return res.json(data);
}

async function createTransaction(req, res) {
  const values = getTransactionUpdates(req.body);
  if (!values) return res.status(400).json({ error: "Descrição, valor, tipo ou data inválidos." });

  const { data, error } = await req.supabase
    .from("transactions")
    .insert({ ...values, user_id: req.user.id })
    .select("id, description, amount, type, date, category_id")
    .single();

  if (error) {
    console.error("Erro ao cadastrar:", error.message);
    return res.status(500).json({ error: "Erro ao salvar movimentação." });
  }
  return res.status(201).json(data);
}

async function updateTransaction(req, res) {
  const { id } = req.params;
  const updates = getTransactionUpdates(req.body, true);
  if (!/^[a-zA-Z0-9-]{1,100}$/.test(id || "")) return res.status(400).json({ error: "Identificador de transação inválido." });
  if (!updates || Object.keys(updates).length === 0) return res.status(400).json({ error: "Nenhuma alteração válida foi informada." });

  const { data, error } = await req.supabase
    .from("transactions")
    .update(updates)
    .eq("id", id)
    .eq("user_id", req.user.id)
    .select("id, description, amount, type, date, category_id")
    .maybeSingle();

  if (error) {
    console.error("Erro ao atualizar transação:", error.message);
    return res.status(500).json({ error: "Erro ao atualizar movimentação." });
  }
  if (!data) return res.status(404).json({ error: "Transação não encontrada." });
  return res.json(data);
}

async function deleteTransaction(req, res) {
  const { id } = req.params;
  if (typeof id !== "string" || !/^[a-zA-Z0-9-]{1,100}$/.test(id)) return res.status(400).json({ error: "Identificador de transação inválido." });

  const { data, error } = await req.supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", req.user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Erro ao excluir transação:", error.message);
    return res.status(500).json({ error: "Erro ao excluir transação." });
  }
  if (!data) return res.status(404).json({ error: "Transação não encontrada." });
  return res.status(204).send();
}

module.exports = { listTransactions, createTransaction, updateTransaction, deleteTransaction, getTransactionUpdates };
