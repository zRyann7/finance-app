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
  // 1. Declaração de estados PRIMEIRO
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  // 2. Variáveis dependentes
  const month = useMemo(() => {
    const current = new Date();
    return `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  const API_OPTIONS = { limit: 500 };
  
  // Agora funciona, pois 'transactions' já existe
  const chartData = useMemo(() => buildMonthlyChart(transactions), [transactions]);

  // 3. Busca inicial de dados
  useEffect(() => {
    async function fetchInitialData() {
      setLoading(true);
      try {
        const results = await Promise.allSettled([
          getSummary(month), 
          getTransactions(API_OPTIONS), 
          getGoals()
        ]);
        
        // Exemplo de como extrair os dados (adapte conforme sua API)
        if (results[0].status === 'fulfilled') setSummary(results[0].value);
        if (results[1].status === 'fulfilled') setTransactions(results[1].value);
        if (results[2].status === 'fulfilled') setGoals(results[2].value);
      } catch (err) {
        setError("Erro ao carregar os dados.");
      } finally {
        setLoading(false);
      }
    }

    fetchInitialData();
  }, [month]);

  // 4. Função de remover transação (onde o Promise.all com await se encaixa)
  async function removeTransaction(id) {
    setDeletingId(id);
    try {
      // Seu código para deletar a transação na API iria aqui
      // ex: await api.delete(`/transactions/${id}`);

      // Atualiza os dados no final da função:
      const [summaryData, transactionData] = await Promise.all([
        getSummary(month), 
        getTransactions(API_OPTIONS)
      ]);
      
      setSummary(summaryData);
      setTransactions(transactionData);
    } catch (err) {
      console.error("Erro ao remover transação", err);
    } finally {
      setDeletingId(null);
    }
  }

  return {
    summary,
    transactions,
    goals,
    loading,
    error,
    deletingId,
    chartData,
    removeTransaction
  };
}
