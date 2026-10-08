function parseAmountToCents(value) {
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(String(value));

  if (!match) {
    throw new Error("Valor monetário inválido retornado pelo banco.");
  }

  return BigInt(match[1]) * 100n + BigInt((match[2] || "").padEnd(2, "0"));
}

function centsToNumber(cents) {
  const value = Number(cents) / 100;

  if (!Number.isSafeInteger(Number(cents))) {
    throw new Error("Total monetário excede o limite seguro da aplicação.");
  }

  return value;
}

async function getSummary(req, res) {
  const { month } = req.query;

  if (
    typeof month !== "string" ||
    !/^20\d{2}-(0[1-9]|1[0-2])$/.test(month)
  ) {
    return res.status(400).json({
      error: "Informe um mês válido no formato AAAA-MM.",
    });
  }

  const [year, monthNumber] = month.split("-").map(Number);
  const startDate = `${month}-01`;
  const nextYear = monthNumber === 12 ? year + 1 : year;
  const nextMonth = monthNumber === 12 ? 1 : monthNumber + 1;
  const endDate = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

  let incomeCents = 0n;
  let expensesCents = 0n;
  let count = 0;
  let offset = 0;
  const pageSize = 500;

  while (true) {
    const { data, error } = await req.supabase
      .from("transactions")
      .select("id, amount, type")
      .eq("user_id", req.user.id)
      .gte("date", startDate)
      .lt("date", endDate)
      .order("id", { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error("Erro no resumo:", error.message);

      return res.status(500).json({
        error: "Erro ao calcular resumo financeiro.",
      });
    }

    try {
      for (const transaction of data) {
        const cents = parseAmountToCents(transaction.amount);

        if (transaction.type === "income") {
          incomeCents += cents;
        } else if (transaction.type === "expense") {
          expensesCents += cents;
        } else {
          throw new Error("Tipo de movimentação inválido retornado pelo banco.");
        }

        count++;
      }
    } catch (error) {
      console.error("Erro no resumo:", error.message);

      return res.status(500).json({
        error: "Erro ao calcular resumo financeiro.",
      });
    }

    if (data.length < pageSize) break;
    offset += pageSize;
  }

  try {
    return res.json({
      month,
      income: centsToNumber(incomeCents),
      expenses: centsToNumber(expensesCents),
      balance: centsToNumber(incomeCents - expensesCents),
      transactions_count: count,
    });
  } catch (error) {
    console.error("Erro no resumo:", error.message);

    return res.status(500).json({
      error: "Erro ao calcular resumo financeiro.",
    });
  }
}

module.exports = { getSummary };
