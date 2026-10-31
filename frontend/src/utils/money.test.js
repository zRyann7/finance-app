import { describe, expect, it } from "vitest";
import { formatMoney, parseBRL, toInputAmount } from "./money";

// O Intl usa espaço não separável entre "R$" e o número.
const plain = (text) => text.replace(/\u00a0/g, " ");

describe("parseBRL", () => {
  it.each([
    ["1234", "1234"],
    ["1234,5", "1234.5"],
    ["1234,56", "1234.56"],
    ["1.234,56", "1234.56"],
    ["R$ 1.234,56", "1234.56"],
    ["12.50", "12.50"],
    ["0,99", "0.99"],
    ["007", "7"],
  ])("aceita %s", (input, expected) => {
    expect(parseBRL(input)).toBe(expected);
  });

  it.each([
    "",
    "   ",
    "abc",
    "-10",
    "1,234.56", // formato americano com milhar
    "1.23.456",
    "10,999", // mais de 2 casas
    "1..000",
    null,
    undefined,
  ])("rejeita %s", (input) => {
    expect(parseBRL(input)).toBeNull();
  });
});

describe("toInputAmount", () => {
  it("formata valores da API para o campo do formulário", () => {
    expect(toInputAmount("1234.5")).toBe("1234,50");
    expect(toInputAmount(10)).toBe("10,00");
  });

  it("devolve vazio para valores inválidos", () => {
    expect(toInputAmount("abc")).toBe("");
    expect(toInputAmount(undefined)).toBe("");
  });
});

describe("formatMoney", () => {
  it("formata em reais", () => {
    expect(plain(formatMoney(1234.5))).toBe("R$ 1.234,50");
    expect(plain(formatMoney("10"))).toBe("R$ 10,00");
  });

  it("trata valores inválidos como zero, sem exibir NaN", () => {
    expect(plain(formatMoney(undefined))).toBe("R$ 0,00");
    expect(plain(formatMoney(null))).toBe("R$ 0,00");
    expect(plain(formatMoney("abc"))).toBe("R$ 0,00");
  });
});
