import axios from "axios";
import { clearSession, getSession, saveSession } from "./session";

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

let refreshRequest = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    const session = getSession();
    const canRefresh =
      error.response?.status === 401 &&
      request &&
      !request._retried &&
      session?.refresh_token &&
      !request.url?.startsWith("/auth/");

    if (!canRefresh) return Promise.reject(error);

    request._retried = true;
    try {
      refreshRequest ||= axios
        .post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken: session.refresh_token })
        .then(({ data }) => {
          saveSession(data);
          return data;
        })
        .finally(() => {
          refreshRequest = null;
        });

      const refreshed = await refreshRequest;
      request.headers.Authorization = `Bearer ${refreshed.access_token}`;
      return api(request);
    } catch (refreshError) {
      clearSession();
      window.location.assign("/login");
      return Promise.reject(refreshError);
    }
  },
);

export async function login(credentials) {
  const { data } = await api.post("/auth/login", credentials);
  return data;
}

export async function register(credentials) {
  const { data } = await api.post("/auth/register", credentials);
  return data;
}

export async function logout() {
  await api.post("/auth/logout");
}

export async function getCurrentUser() {
  const { data } = await api.get("/auth/me");
  return data;
}

export async function getProfile() {
  const { data } = await api.get("/profile");
  return data;
}

export async function createProfile(profile) {
  const { data } = await api.post("/profile", profile);
  return data;
}

export async function updateProfile(profile) {
  const { data } = await api.patch("/profile", profile);
  return data;
}

export async function getSummary(month) {
  const { data } = await api.get("/summary", { params: { month } });
  return data;
}

export async function getTransactions(params) {
  const { data } = await api.get("/transactions", { params });
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

export async function updateTransaction(id, transaction) {
  const { data } = await api.patch(`/transactions/${encodeURIComponent(id)}`, transaction);
  return data;
}

export async function deleteTransaction(id) {
  await api.delete(`/transactions/${encodeURIComponent(id)}`);
}

export async function createGoal(goal) {
  const { data } = await api.post("/goals", goal);
  return data;
}

export async function updateGoal(id, goal) {
  const { data } = await api.patch(`/goals/${encodeURIComponent(id)}`, goal);
  return data;
}

export async function deleteGoal(id) {
  await api.delete(`/goals/${encodeURIComponent(id)}`);
}

export async function getBills() {
  const { data } = await api.get("/bills");
  return data;
}

export async function createBill(bill) {
  const { data } = await api.post("/bills", bill);
  return data;
}

export async function updateBill(id, bill) {
  const { data } = await api.patch(`/bills/${encodeURIComponent(id)}`, bill);
  return data;
}

export async function deleteBill(id) {
  await api.delete(`/bills/${encodeURIComponent(id)}`);
}

export default api;
