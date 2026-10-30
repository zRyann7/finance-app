import { useEffect, useMemo, useState } from "react";
import {
  TRANSACTIONS_LIMIT,
  deleteTransaction,
  getGoals,
  getSummary,
  getSummaryHistory,
  getTransactions,
} from "../services/api";
import { monthKeysEndingAt, toMonthKey } from "../utils/date";

const CHART_MONTHS = 6;
const monthFormatter = new Intl.DateTimeFormat("pt-BR", { month: "short" });

function monthLabel(key) {
  const [year, month] = key.split("-").map(Number);

  return monthFormatter
    .format(new Date(year, month - 1, 1))
    .replace(".", "")
    .replace(/^./, (letter) => letter.toUpperCase());
}

// Os totais por mês vêm do backend (/summary/history), calculados sobre TODAS as transações.
// Somar no cliente a lista de transações (limitada a 500) deixava meses antigos incompletos.
function buildMonthlyChart(history, currentMonth) {
  const byMonth = new Map(history.map((item) => [item.month, item]));

  return monthKeysEndingAt(currentMonth, CHART_MONTHS).map((key) => {
    const item = byMonth.get(key);

    return {
      key,
      month: monthLabel(key),
      income: Number(item?.income) || 0,
      expenses: Number(item?.expenses) || 0,
      balance: Number(item?.balance) || 0,
    };
  });
}

export function useDashboardData({ session }) {
  const month = useMemo(() => toMonthKey(), []);
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const chartData = useMemo(() => buildMonthlyChart(history, month), [history, month]);

  useEffect(() => {
    if (!session) return;

    let active = true;
    setLoading(true);

    Promise.allSettled([
      getSummary(month),
      getTransactions({ limit: TRANSACTIONS_LIMIT }),
      getGoals(),
      getSummaryHistory(month, CHART_MONTHS),
    ])
      .then((results) => {
        if (!active) return;

        const [summaryResult, transactionResult, goalResult, historyResult] = results;

        setSummary(summaryResult.status === "fulfilled" ? summaryResult.value : null);
        setTransactions(transactionResult.status === "fulfilled" ? transactionResult.value : []);
        setGoals(goalResult.status === "fulfilled" ? goalResult.value : []);
        setHistory(historyResult.status === "fulfilled" ? historyResult.value : []);

        const failures = results
          .filter((result) => result.status === "rejected")
          .map((result) => result.reason?.response?.data?.error)
          .filter(Boolean);
        const failedCount = results.filter((result) => result.status === "rejected").length;
        setError(failures[0] || (failedCount ? "Parte dos seus dados não pôde ser carregada." : ""));
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
      const [summaryData, transactionData, historyData] = await Promise.all([
        getSummary(month),
        getTransactions({ limit: TRANSACTIONS_LIMIT }),
        getSummaryHistory(month, CHART_MONTHS),
      ]);
      setSummary(summaryData);
      setTransactions(transactionData);
      setHistory(historyData);
    } catch (requestError) {
      const message = requestError.response?.data?.error || "Não foi possível excluir a transação.";
      setError(message);
      throw requestError;
    } finally {
      setDeletingId(null);
    }
  }

  return {
    summary,
    transactions,
    goals,
    chartData,
    loading,
    deletingId,
    error,
    removeTransaction,
  };
}
