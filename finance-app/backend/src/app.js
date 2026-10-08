require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const summaryRoutes = require("./routes/summaryRoutes");
const goalRoutes = require("./routes/goalRoutes");
const profileRoutes = require("./routes/profileRoutes");
const { apiLimiter } = require("./middlewares/rateLimiters");

const app = express();

if (process.env.NODE_ENV === "production") {
  const trustProxyHops = process.env.TRUST_PROXY_HOPS || "1";

  if (!/^\d+$/.test(trustProxyHops)) {
    throw new Error("TRUST_PROXY_HOPS deve ser um número inteiro não negativo.");
  }

  app.set("trust proxy", Number(trustProxyHops));
}

app.use(cors());
app.use(express.json({ limit: "16kb" }));

app.get("/", (req, res) => {
  res.json({
    message: "API financeira funcionando!",
  });
});

app.use("/api", apiLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/summary", summaryRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/profile", profileRoutes);

app.use((err, req, res, next) => {
  console.error("Erro interno:", err.message);

  res.status(500).json({
    error: "Erro interno do servidor.",
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
