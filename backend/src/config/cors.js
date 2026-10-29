function getAllowedOrigins() {
  const envOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, "")) // Remove barra final se houver
    .filter(Boolean);

  const localOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "https://finance-app-roan-iota.vercel.app" 
  ];

  const allOrigins = Array.from(new Set([...localOrigins, ...envOrigins]));

  return allOrigins;
}

function createCorsOptions() {
  const allowedOrigins = getAllowedOrigins();

  return {
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.replace(/\/$/, "");

      const isAllowed =
        allowedOrigins.includes(cleanOrigin) ||
        cleanOrigin.endsWith(".vercel.app");

      if (isAllowed) {
        return callback(null, true);
      }

      console.log(`[CORS Bloqueado] Origem não permitida: ${origin}`);

      return callback(null, false);
    },
  };
}

module.exports = { createCorsOptions, getAllowedOrigins };