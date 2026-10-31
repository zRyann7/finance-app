// VITE_API_URL pode vir com ou sem o sufixo /api (http://localhost:3000 ou http://localhost:3000/api):
// removemos barras finais e um /api final e acrescentamos /api uma única vez.
export function buildApiBaseUrl(rawUrl) {
  const base = (rawUrl || "http://localhost:3000").trim().replace(/\/+$/, "").replace(/\/api$/, "");
  return `${base}/api`;
}
