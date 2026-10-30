require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { createCorsOptions } = require("./config/cors");
const { getSupabaseConfig } = require("./config/supabase");

const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const summaryRoutes = require("./routes/summaryRoutes");
const goalRoutes = require("./routes/goalRoutes");
const profileRoutes = require("./routes/profileRoutes");
const billRoutes = require("./routes/billRoutes");
const { apiLimiter } = require("./middlewares/rateLimiters");

const app = express();

app.disable("x-powered-by");

if (process.env.NODE_ENV === "production") {
  const trustProxyHops = process.env.TRUST_PROXY_HOPS || "1";

  if (!/^\d+$/.test(trustProxyHops)) {
    throw new Error("TRUST_PROXY_HOPS deve ser um número inteiro não negativo.");
  }

  app.set("trust proxy", Number(trustProxyHops));
}

app.use(cors(createCorsOptions()));
app.use(express.json({ limit: "16kb" }));

app.get("/", (req, res) => {
  res.json({
    message: "API financeira funcionando!",
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", apiLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/summary", summaryRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/bills", billRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada." });
});

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);

  // Erros do body-parser são culpa do cliente, não do servidor.
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "JSON inválido na requisição." });
  }

  if (err.type === "entity.too.large") {
    return res.status(413).json({ error: "Corpo da requisição grande demais." });
  }

  console.error("Erro interno:", err.message);

  res.status(err.status || 500).json({
    error: err.status === 403 ? err.message : "Erro interno do servidor.",
  });
});

function start() {
  // Falha cedo, com mensagem clara, se o Supabase não estiver configurado.
  getSupabaseConfig();

  const PORT = process.env.PORT || 3000;

  return app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

if (require.main === module) {
  start();
}

module.exports = { app, start };
