const LOCAL_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
];

function normalizeOrigin(origin) {
  return origin.trim().replace(/\/+$/, "");
}

function getAllowedOrigins() {
  const configured = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || "")
    .split(",")
    .map(normalizeOrigin)
    .filter(Boolean);

  if (process.env.NODE_ENV === "production") {
    if (configured.length === 0) {
      throw new Error(
        "Defina CORS_ORIGINS com as origens do frontend (separadas por vírgula) em produção.",
      );
    }

    return new Set(configured);
  }

  return new Set([...LOCAL_ORIGINS, ...configured]);
}

function createCorsOptions() {
  const allowedOrigins = getAllowedOrigins();

  return {
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    // A autenticação usa o header Authorization (Bearer), não cookies.
    credentials: false,
    origin(origin, callback) {
      // Requisições sem Origin (curl, health checks, server-to-server) não são de navegador.
      if (!origin) return callback(null, true);

      if (allowedOrigins.has(normalizeOrigin(origin))) {
        return callback(null, true);
      }

      console.warn(`[CORS] Origem não permitida: ${origin}`);
      return callback(null, false);
    },
  };
}

module.exports = { createCorsOptions, getAllowedOrigins };
