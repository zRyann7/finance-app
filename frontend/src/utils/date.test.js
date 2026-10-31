import { describe, expect, it } from "vitest";
import { monthKeysEndingAt, toLocalDateInput, toMonthKey } from "./date";

describe("fuso horário dos testes", () => {
  it("roda em America/Fortaleza (UTC-3), definido em vitest.global-setup.js", () => {
    expect(new Date("2026-06-01T12:00:00Z").getTimezoneOffset()).toBe(180);
  });
});

describe("toLocalDateInput / toMonthKey", () => {
  // 31/10/2026 às 22:30 em Fortaleza = 01/11/2026 às 01:30 em UTC.
  const noite = new Date("2026-11-01T01:30:00Z");

  it("usa a data local, não a UTC (bug antigo: o lançamento caía no mês seguinte)", () => {
    expect(noite.toISOString().slice(0, 10)).toBe("2026-11-01"); // o que o código antigo gerava
    expect(toLocalDateInput(noite)).toBe("2026-10-31");
    expect(toMonthKey(noite)).toBe("2026-10");
  });

  it("completa mês e dia com zero à esquerda", () => {
    expect(toLocalDateInput(new Date(2026, 0, 5, 12))).toBe("2026-01-05");
  });
});

describe("monthKeysEndingAt", () => {
  it("lista os meses do mais antigo ao mais novo, atravessando o ano", () => {
    expect(monthKeysEndingAt("2026-02", 6)).toEqual([
      "2025-09",
      "2025-10",
      "2025-11",
      "2025-12",
      "2026-01",
      "2026-02",
    ]);
  });

  it("com 1 mês devolve só o próprio mês", () => {
    expect(monthKeysEndingAt("2026-10", 1)).toEqual(["2026-10"]);
  });
});
