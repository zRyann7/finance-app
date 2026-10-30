import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

function originOf(value) {
  try {
    return value ? new URL(value).origin : null;
  } catch {
    return null;
  }
}

// Content-Security-Policy gerada no BUILD a partir das variáveis do ambiente de deploy
// (Vercel, Docker...). Assim o `connect-src` só libera a API e o Supabase REAIS do ambiente,
// sem hardcode de URL. Vai numa <meta> porque o host estático não conhece essas URLs; as diretivas
// que <meta> não suporta (frame-ancestors etc.) ficam nos headers de vercel.json / nginx.
// Se um script externo ou injetado tentar rodar, o navegador bloqueia (script-src 'self').
function contentSecurityPolicy(env) {
  const apiOrigin = originOf(env.VITE_API_URL || "http://localhost:3000");
  const supabaseOrigin = originOf(env.VITE_SUPABASE_URL);

  const connect = ["'self'", apiOrigin, supabaseOrigin].filter(Boolean);
  const images = ["'self'", "data:", supabaseOrigin].filter(Boolean);

  return [
    "default-src 'self'",
    "script-src 'self'",
    // O React/Recharts/framer-motion aplicam estilos inline via atributo `style`.
    "style-src 'self' 'unsafe-inline'",
    `img-src ${images.join(" ")}`,
    "font-src 'self' data:",
    `connect-src ${connect.join(" ")}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

function cspPlugin(env) {
  return {
    name: "finance-csp",
    apply: "build",
    transformIndexHtml() {
      return [
        {
          tag: "meta",
          attrs: { "http-equiv": "Content-Security-Policy", content: contentSecurityPolicy(env) },
          injectTo: "head-prepend",
        },
      ];
    },
  };
}

export default defineConfig(({ mode }) => {
  // Lê as VITE_* de process.env (Vercel/Docker build args) e dos arquivos .env.
  const env = loadEnv(mode, process.cwd(), "VITE_");

  return {
    plugins: [react(), tailwindcss(), cspPlugin(env)],
    server: {
      port: 5173,
    },
  };
});
