const pad = (value) => String(value).padStart(2, "0");


export function toLocalDateInput(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Mês local no formato AAAA-MM.
export function toMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

// Lista de `count` meses (AAAA-MM) terminando em `endKey`, do mais antigo ao mais novo.
export function monthKeysEndingAt(endKey, count) {
  const [year, month] = endKey.split("-").map(Number);

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(year, month - 1 - (count - 1 - index), 1);
    return toMonthKey(date);
  });
}
