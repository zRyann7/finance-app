function getBillValues(body, partial = false) {
  const input = body || {};
  const values = {};

  if (!partial || Object.hasOwn(input, "description")) {
    if (typeof input.description !== "string" || !input.description.trim() || input.description.length > 200) return null;
    values.description = input.description.trim();
  }

  if (!partial || Object.hasOwn(input, "amount")) {
    const amount = String(input.amount ?? "");
    if (!/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(amount) || Number(amount) <= 0) return null;
    values.amount = amount;
  }

  if (!partial || Object.hasOwn(input, "due_day")) {
    const dueDay = Number(input.due_day);
    if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 31) return null;
    values.due_day = dueDay;
  }

  if (Object.hasOwn(input, "active")) {
    if (typeof input.active !== "boolean") return null;
    values.active = input.active;
  } else if (!partial) values.active = true;

  return values;
}

async function listBills(req, res) {
  const { data, error } = await req.supabase.from("recurring_expenses").select("id, description, amount, due_day, active, created_at").eq("user_id", req.user.id).order("due_day", { ascending: true });
  if (error) {
    console.error("Erro ao listar contas:", error.message);
    return res.status(500).json({ error: "Erro ao consultar contas recorrentes." });
  }
  return res.json(data);
}

async function createBill(req, res) {
  const values = getBillValues(req.body);
  if (!values) return res.status(400).json({ error: "Dados da conta recorrente inválidos." });
  const { data, error } = await req.supabase.from("recurring_expenses").insert({ ...values, user_id: req.user.id }).select("id, description, amount, due_day, active, created_at").single();
  if (error) {
    console.error("Erro ao criar conta:", error.message);
    return res.status(500).json({ error: "Erro ao cadastrar conta recorrente." });
  }
  return res.status(201).json(data);
}

async function updateBill(req, res) {
  const values = getBillValues(req.body, true);
  if (!values || Object.keys(values).length === 0) return res.status(400).json({ error: "Nenhuma alteração válida foi informada." });
  const { data, error } = await req.supabase.from("recurring_expenses").update(values).eq("id", req.params.id).eq("user_id", req.user.id).select("id, description, amount, due_day, active, created_at").maybeSingle();
  if (error) {
    console.error("Erro ao atualizar conta:", error.message);
    return res.status(500).json({ error: "Erro ao atualizar conta recorrente." });
  }
  if (!data) return res.status(404).json({ error: "Conta recorrente não encontrada." });
  return res.json(data);
}

async function deleteBill(req, res) {
  const { data, error } = await req.supabase.from("recurring_expenses").delete().eq("id", req.params.id).eq("user_id", req.user.id).select("id").maybeSingle();
  if (error) {
    console.error("Erro ao excluir conta:", error.message);
    return res.status(500).json({ error: "Erro ao excluir conta recorrente." });
  }
  if (!data) return res.status(404).json({ error: "Conta recorrente não encontrada." });
  return res.status(204).send();
}

module.exports = { listBills, createBill, updateBill, deleteBill, getBillValues };
