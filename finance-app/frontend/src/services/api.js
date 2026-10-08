import axios from "axios";
import { getSession } from "./session";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = getSession()?.access_token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export async function login(credentials) {
  const { data } = await api.post("/auth/login", credentials);
  return data;
}

export async function getCurrentUser() {
  const { data } = await api.get("/auth/me");
  return data;
}

export async function getSummary(month) {
  const { data } = await api.get("/summary", { params: { month } });
  return data;
}

export async function getTransactions() {
  const { data } = await api.get("/transactions");
  return data;
}

export async function getGoals() {
  const { data } = await api.get("/goals");
  return data;
}

export async function createTransaction(transaction) {
  const { data } = await api.post("/transactions", transaction);
  return data;
}

export async function deleteTransaction(id) {
  await api.delete(`/transactions/${encodeURIComponent(id)}`);
}

export default api;
