import { useEffect, useMemo, useState } from "react";
import { deleteTransaction, getGoals, getSummary, getTransactions } from "../services/api";

function buildMonthlyChart(transactions) {
  const formatter = new Intl.DateTimeFormat("pt-BR", { month: "short" });
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    return {
      key,
      month: formatter.format(date).replace(".", "").replace(/^./, (letter) => letter.toUpperCase()),
      income: 0,
      expenses: 0,
      balance: 0,
    };
  });
  const byMonth = new Map(months.map((item) => [item.key, item]));

  for (const transaction of transactions) {
    const item = byMonth.get(String(transaction.date).slice(0, 7));
    if (!item) continue;

    const amount = Number(transaction.amount) || 0;
    if (transaction.type === "income") item.income += amount;
    if (transaction.type === "expense") item.expenses += amount;
    item.balance = item.income - item.expenses;
  }

  return months;
}

export function useDashboardData({ session }) {
  const month = useMemo(() => new Date().toISOString().slice(0, 7), []);
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session) return;

    let active = true;
    setLoading(true);

    Promise.allSettled([getSummary(month), getTransactions(), getGoals()])
      .then(([summaryResult, transactionResult, goalResult]) => {
        if (!active) return;

        if (summaryResult.status === "rejected") throw summaryResult.reason;
        if (transactionResult.status === "rejected") throw transactionResult.reason;

        setSummary(summaryResult.value);
        setTransactions(transactionResult.value);
        setGoals(goalResult.status === "fulfilled" ? goalResult.value : []);
        setError(goalResult.status === "rejected" ? "Resumo carregado, mas as metas estão indisponíveis." : "");
      })
      .catch((requestError) => {
        if (!active) return;
        setError(requestError.response?.data?.error || "Não foi possível carregar seus dados.");
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [month, session]);

  async function removeTransaction(id) {
    setDeletingId(id);
    setError("");

    try {
      await deleteTransaction(id);
      const [summaryData, transactionData] = await Promise.all([
        getSummary(month),
        getTransactions(),
      ]);
      setSummary(summaryData);
      setTransactions(transactionData);
    } catch (requestError) {
      const message = requestError.response?.data?.error || "Não foi possível excluir a transação.";
      setError(message);
      throw requestError;
    } finally {
      setDeletingId(null);
    }
  }

  return {
    summary: summary || { income: 0, expenses: 0, balance: 0, transactions_count: 0 },
    transactions,
    goals,
    chartData: buildMonthlyChart(transactions),
    loading,
    deletingId,
    error,
    removeTransaction,
  };
}
