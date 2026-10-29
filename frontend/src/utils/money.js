// Converte o texto digitado pelo usuário (formato brasileiro) para o decimal
// com ponto que a API espera, ex.: "1.234,56" -> "1234.56".
// Retorna null quando o valor é inválido.
//
// Aceita: "1234", "1234,5", "1234,56", "1.234,56", "R$ 1.234,56" e "12.50".
// Rejeita: negativos, mais de 2 casas decimais, separadores fora de lugar
// e formato americano com milhar ("1,234.56").
const BR_FORMAT = /^([1-9]\d{0,2}(\.\d{3})+|\d+)(,\d{1,2})?$/;
const DOT_DECIMAL = /^\d+(\.\d{1,2})?$/;

export const INVALID_AMOUNT_MESSAGE = "Informe um valor válido, como 1.234,56.";

export function parseBRL(value) {
  if (value === null || value === undefined) return null;

  const text = String(value).trim().replace(/^R\$\s*/i, "").replace(/\s+/g, "");
  if (!text) return null;

  let normalized = null;
  if (BR_FORMAT.test(text)) {
    normalized = text.replace(/\./g, "").replace(",", ".");
  } else if (DOT_DECIMAL.test(text)) {
    normalized = text;
  }

  if (normalized === null) return null;
  return normalized.replace(/^0+(?=\d)/, "");
}

// Valor vindo da API ("1234.5" ou 1234.5) -> texto para exibir no campo ("1234,50").
export function toInputAmount(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(2).replace(".", ",") : "";
}
