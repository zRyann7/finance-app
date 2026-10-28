export function parseBRL(value) {
  if (typeof value === "number") return value;
  if (!value) return NaN;
  

  let clean = String(value).trim().replace(/[R$\s]/g, "");
  // Se houver vírgula, assume como separador decimal
  if (clean.includes(",")) {
    clean = clean.replace(/\./g, "").replace(",", ".");
  }
  
  const number = parseFloat(clean);
  return isNaN(number) ? NaN : number;
}

export function formatMoney(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

export function formatDate(dateString) {
  if (!dateString) return "";
  return new Intl.DateTimeFormat("pt-BR").format(new Date(dateString));
}