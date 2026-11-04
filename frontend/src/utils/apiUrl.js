// VITE_API_URL pode vir com ou sem o sufixo /api (http://localhost:3000 ou http://localhost:3000/api):
// removemos barras finais e um /api final e acrescentamos /api uma única vez.
function normalizeApiOrigin(rawUrl) {
  return (rawUrl || "http://localhost:3000").trim().replace(/\/+$/, "").replace(/\/api$/, "");
}

export function buildApiBaseUrl(rawUrl) {
  return `${normalizeApiOrigin(rawUrl)}/api`;
}

// O /health do backend fica na raiz (fora de /api e do rate limit geral).
export function buildHealthUrl(rawUrl) {
  return `${normalizeApiOrigin(rawUrl)}/health`;
}
