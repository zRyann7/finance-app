async function listGoals(req, res) {
  const goals = [];
  const pageSize = 500;
  let offset = 0;

  while (true) {
    const { data, error } = await req.supabase
      .from("financial_goals")
      .select("*")
      .eq("user_id", req.user.id)
      .order("id", { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error("Erro ao listar metas:", error.message);

      return res.status(500).json({
        error: "Erro ao consultar metas financeiras.",
      });
    }

    goals.push(...data);

    if (data.length < pageSize) break;
    offset += pageSize;
  }

  return res.json(goals);
}

module.exports = { listGoals };
