
async function listTransactions(req, res) {
  const { data, error } = await req.supabase
    .from("transactions")
    .select("id, description, amount, type, date, category_id")
    .eq("user_id", req.user.id)
    .order("date", { ascending: false });

  if (error) {
    console.error("Erro ao listar:", error.message);

    return res.status(500).json({
      error: "Erro ao consultar movimentações.",
    });
  }

  return res.json(data);
}

async function createTransaction(req, res) {
  const { description, amount, type, date } = req.body || {};

  const validDescription =
    typeof description === "string" &&
    description.trim().length > 0 &&
    description.length <= 200;

  const amountText = String(amount ?? "");
  const validAmount =
    /^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(amountText) &&
    Number(amountText) > 0;

  if (
    !validDescription ||
    !validAmount ||
    !["income", "expense"].includes(type)
  ) {
    return res.status(400).json({
      error: "Descrição, valor ou tipo inválido.",
    });
  }

  if (date !== undefined) {
    const validDate =
      typeof date === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(date) &&
      !Number.isNaN(Date.parse(date)) &&
      new Date(date).toISOString().slice(0, 10) === date;

    if (!validDate) {
      return res.status(400).json({
        error: "Data inválida. Use AAAA-MM-DD.",
      });
    }
  }

  const transaction = {
    description: description.trim(),
    amount: amountText,
    type,
    user_id: req.user.id,
  };

  if (date !== undefined) {
    transaction.date = date;
  }

  const { data, error } = await req.supabase
    .from("transactions")
    .insert(transaction)
    .select()
    .single();

  if (error) {
    console.error("Erro ao cadastrar:", error.message);

    return res.status(500).json({
      error: "Erro ao salvar movimentação.",
    });
  }

  return res.status(201).json(data);
}

async function deleteTransaction(req, res) {
  const { id } = req.params;

  if (typeof id !== "string" || !/^[a-zA-Z0-9-]{1,100}$/.test(id)) {
    return res.status(400).json({
      error: "Identificador de transação inválido.",
    });
  }

  const { data, error } = await req.supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", req.user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Erro ao excluir transação:", error.message);

    return res.status(500).json({
      error: "Erro ao excluir transação.",
    });
  }

  if (!data) {
    return res.status(404).json({
      error: "Transação não encontrada.",
    });
  }

  return res.status(204).send();
}

module.exports = {
  listTransactions,
  createTransaction,
  deleteTransaction,
};
