const MONTH_PATTERN = /^20\d{2}-(0[1-9]|1[0-2])$/;
const PAGE_SIZE = 500;
const MAX_HISTORY_MONTHS = 12;

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

// "2026-10" + 1 -> "2026-11"; "2026-12" + 1 -> "2027-01"; também aceita deslocamento negativo.
function shiftMonth(month, delta) {
  const [year, monthNumber] = month.split("-").map(Number);
  const index = year * 12 + (monthNumber - 1) + delta;

  return `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, "0")}`;
}

// Percorre todas as páginas de transações do usuário no intervalo [startDate, endDate).
async function forEachTransaction(req, startDate, endDate, callback) {
  let offset = 0;

  while (true) {
    const { data, error } = await req.supabase
      .from("transactions")
      .select("id, amount, type, date")
      .eq("user_id", req.user.id)
      .gte("date", startDate)
      .lt("date", endDate)
      .order("id", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) throw error;

    for (const transaction of data) callback(transaction);

    if (data.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }
}

function addToTotals(totals, transaction) {
  const cents = parseAmountToCents(transaction.amount);

  if (transaction.type === "income") {
    totals.income += cents;
  } else if (transaction.type === "expense") {
    totals.expenses += cents;
  } else {
    throw new Error("Tipo de movimentação inválido retornado pelo banco.");
  }
}

async function getSummary(req, res) {
  const { month } = req.query;

  if (typeof month !== "string" || !MONTH_PATTERN.test(month)) {
    return res.status(400).json({
      error: "Informe um mês válido no formato AAAA-MM.",
    });
  }

  const totals = { income: 0n, expenses: 0n };
  let count = 0;

  try {
    await forEachTransaction(req, `${month}-01`, `${shiftMonth(month, 1)}-01`, (transaction) => {
      addToTotals(totals, transaction);
      count++;
    });

    return res.json({
      month,
      income: centsToNumber(totals.income),
      expenses: centsToNumber(totals.expenses),
      balance: centsToNumber(totals.income - totals.expenses),
      transactions_count: count,
    });
  } catch (error) {
    console.error("Erro no resumo:", error.message);

    return res.status(500).json({
      error: "Erro ao calcular resumo financeiro.",
    });
  }
}

// Totais mensais dos últimos N meses (padrão 6) terminando em `end`.
// Calculado no servidor sobre TODAS as transações, sem o limite de 500 da listagem.
async function getHistory(req, res) {
  const { end } = req.query;
  const months = req.query.months === undefined ? 6 : Number(req.query.months);

  if (typeof end !== "string" || !MONTH_PATTERN.test(end)) {
    return res.status(400).json({
      error: "Informe um mês final válido no formato AAAA-MM.",
    });
  }

  if (!Number.isInteger(months) || months < 1 || months > MAX_HISTORY_MONTHS) {
    return res.status(400).json({
      error: `Informe uma quantidade de meses entre 1 e ${MAX_HISTORY_MONTHS}.`,
    });
  }

  const keys = Array.from({ length: months }, (_, index) => shiftMonth(end, index - (months - 1)));
  const buckets = new Map(keys.map((key) => [key, { income: 0n, expenses: 0n }]));

  try {
    await forEachTransaction(req, `${keys[0]}-01`, `${shiftMonth(end, 1)}-01`, (transaction) => {
      const bucket = buckets.get(String(transaction.date).slice(0, 7));
      if (bucket) addToTotals(bucket, transaction);
    });

    return res.json(
      keys.map((key) => {
        const { income, expenses } = buckets.get(key);

        return {
          month: key,
          income: centsToNumber(income),
          expenses: centsToNumber(expenses),
          balance: centsToNumber(income - expenses),
        };
      }),
    );
  } catch (error) {
    console.error("Erro no histórico:", error.message);

    return res.status(500).json({
      error: "Erro ao calcular histórico financeiro.",
    });
  }
}

module.exports = { getSummary, getHistory, shiftMonth };
