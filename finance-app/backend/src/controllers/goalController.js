function getGoalValues(body, partial = false) {
  const input = body || {};
  const values = {};

  if (!partial || Object.hasOwn(input, "name")) {
    if (typeof input.name !== "string" || !input.name.trim() || input.name.length > 120) return null;
    values.name = input.name.trim();
  }

  for (const field of ["target_amount", "saved_amount"]) {
    if (!partial || Object.hasOwn(input, field)) {
      const value = String(input[field] ?? (field === "saved_amount" ? "0" : ""));
      if (!/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(value)) return null;
      if (field === "target_amount" && Number(value) <= 0) return null;
      values[field] = value;
    }
  }

  if (Object.hasOwn(input, "deadline")) {
    if (input.deadline === null || input.deadline === "") values.deadline = null;
    else {
      const validDate = typeof input.deadline === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input.deadline) && !Number.isNaN(Date.parse(input.deadline));
      if (!validDate) return null;
      values.deadline = input.deadline;
    }
  }
  return values;
}

async function listGoals(req, res) {
  const goals = [];
  const pageSize = 500;
  let offset = 0;
  while (true) {
    const { data, error } = await req.supabase.from("financial_goals").select("id, name, target_amount, saved_amount, deadline, created_at").eq("user_id", req.user.id).order("id", { ascending: true }).range(offset, offset + pageSize - 1);
    if (error) {
      console.error("Erro ao listar metas:", error.message);
      return res.status(500).json({ error: "Erro ao consultar metas financeiras." });
    }
    goals.push(...data);
    if (data.length < pageSize) break;
    offset += pageSize;
  }
  return res.json(goals);
}

async function createGoal(req, res) {
  const values = getGoalValues(req.body);
  if (!values) return res.status(400).json({ error: "Dados da meta inválidos." });
  const { data, error } = await req.supabase.from("financial_goals").insert({ ...values, user_id: req.user.id }).select("id, name, target_amount, saved_amount, deadline, created_at").single();
  if (error) {
    console.error("Erro ao criar meta:", error.message);
    return res.status(500).json({ error: "Erro ao criar meta financeira." });
  }
  return res.status(201).json(data);
}

async function updateGoal(req, res) {
  const values = getGoalValues(req.body, true);
  if (!values || Object.keys(values).length === 0) return res.status(400).json({ error: "Nenhuma alteração válida foi informada." });
  const { data, error } = await req.supabase.from("financial_goals").update(values).eq("id", req.params.id).eq("user_id", req.user.id).select("id, name, target_amount, saved_amount, deadline, created_at").maybeSingle();
  if (error) {
    console.error("Erro ao atualizar meta:", error.message);
    return res.status(500).json({ error: "Erro ao atualizar meta financeira." });
  }
  if (!data) return res.status(404).json({ error: "Meta não encontrada." });
  return res.json(data);
}

async function deleteGoal(req, res) {
  const { data, error } = await req.supabase.from("financial_goals").delete().eq("id", req.params.id).eq("user_id", req.user.id).select("id").maybeSingle();
  if (error) {
    console.error("Erro ao excluir meta:", error.message);
    return res.status(500).json({ error: "Erro ao excluir meta financeira." });
  }
  if (!data) return res.status(404).json({ error: "Meta não encontrada." });
  return res.status(204).send();
}

module.exports = { listGoals, createGoal, updateGoal, deleteGoal, getGoalValues };
