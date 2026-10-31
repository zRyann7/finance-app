import { describe, expect, it } from "vitest";
import { buildApiBaseUrl } from "./apiUrl";

describe("buildApiBaseUrl", () => {
  it.each([
    [undefined, "http://localhost:3000/api"],
    ["", "http://localhost:3000/api"],
    ["http://localhost:3000", "http://localhost:3000/api"],
    ["http://localhost:3000/", "http://localhost:3000/api"],
    ["http://localhost:3000/api", "http://localhost:3000/api"], // não duplica /api
    ["http://localhost:3000/api/", "http://localhost:3000/api"],
    ["  https://minha-api.onrender.com  ", "https://minha-api.onrender.com/api"],
  ])("%j -> %s", (input, expected) => {
    expect(buildApiBaseUrl(input)).toBe(expected);
  });
});
