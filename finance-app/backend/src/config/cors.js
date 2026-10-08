function getAllowedOrigins() {
  const configured = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (process.env.NODE_ENV === "production") {
    if (configured.length === 0) {
      throw new Error("Configure CORS_ORIGINS no ambiente de produção.");
    }
    return new Set(configured);
  }

  return new Set([
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    ...configured,
  ]);
}

function createCorsOptions() {
  const allowedOrigins = getAllowedOrigins();
  return {
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) return callback(null, true);
      const error = new Error("Origem não autorizada pelo CORS.");
      error.status = 403;
      return callback(error);
    },
  };
}

module.exports = { createCorsOptions, getAllowedOrigins };
