import { useEffect, useMemo, useState } from "react";
import { getSummary, getTransactions } from "../services/api";

const demoSummary = {
  month: "2026-10",
  income: 5976.98,
  expenses: 528.93,
  balance: 5478.05,
  transactions_count: 18,
};

const demoTransactions = [
  {
    id: "demo-1",
    description: "Gojo Ackerman",
    amount: "1800.00",
    type: "expense",
    date: "2026-10-24",
  },
];

export function useDashboardData({ demo, session }) {
  const month = useMemo(() => new Date().toISOString().slice(0, 7), []);
  const [summary, setSummary] = useState(demo ? demoSummary : null);
  const [transactions, setTransactions] = useState(demo ? demoTransactions : []);
  const [loading, setLoading] = useState(!demo);
  const [error, setError] = useState("");

  useEffect(() => {
    if (demo || !session) return;

    let active = true;
    setLoading(true);

    Promise.all([getSummary(month), getTransactions()])
      .then(([summaryData, transactionData]) => {
        if (!active) return;
        setSummary(summaryData);
        setTransactions(transactionData);
        setError("");
      })
      .catch((requestError) => {
        if (!active) return;
        setError(requestError.response?.data?.error || "Não foi possível carregar seus dados.");
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [demo, month, session]);

  return {
    summary: summary || { income: 0, expenses: 0, balance: 0, transactions_count: 0 },
    transactions,
    loading,
    error,
  };
}
