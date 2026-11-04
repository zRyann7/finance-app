import { describe, expect, it } from "vitest";
import { describeRequestError } from "./requestError";

describe("describeRequestError", () => {
  it("prioriza a mensagem devolvida pela API", () => {
    const error = { response: { data: { error: "Credenciais inválidas." } }, code: "ERR_BAD_REQUEST" };
    expect(describeRequestError(error, "padrão")).toBe("Credenciais inválidas.");
  });

  it.each(["ECONNABORTED", "ETIMEDOUT"])("explica o estouro de tempo (%s)", (code) => {
    expect(describeRequestError({ code }, "padrão")).toMatch(/servidor demorou/i);
  });

  it("usa a mensagem padrão nas demais falhas", () => {
    expect(describeRequestError({ code: "ERR_NETWORK" }, "padrão")).toBe("padrão");
    expect(describeRequestError(undefined, "padrão")).toBe("padrão");
  });
});
