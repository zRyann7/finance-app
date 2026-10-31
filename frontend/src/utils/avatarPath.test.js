import { describe, expect, it } from "vitest";
import { avatarPathFromUrl } from "./avatarPath";

const USER = "1478ccb8-ed05-47d5-a78c-c70e8def4974";
const BASE = "https://projeto.supabase.co/storage/v1/object/public/avatars";

describe("avatarPathFromUrl", () => {
  it("extrai o caminho de um arquivo na pasta do próprio usuário", () => {
    expect(avatarPathFromUrl(`${BASE}/${USER}/1793380914326.jpg`, USER)).toBe(`${USER}/1793380914326.jpg`);
  });

  it("não devolve caminho de outro usuário", () => {
    expect(avatarPathFromUrl(`${BASE}/outro-usuario/foto.jpg`, USER)).toBeNull();
  });

  it("ignora o formato antigo (arquivo solto na raiz do bucket)", () => {
    expect(avatarPathFromUrl(`${BASE}/${USER}-1793380914326.jpg`, USER)).toBeNull();
  });

  it("ignora URLs fora do bucket de avatares", () => {
    expect(avatarPathFromUrl(`https://projeto.supabase.co/storage/v1/object/public/outro/${USER}/a.jpg`, USER)).toBeNull();
    expect(avatarPathFromUrl("https://exemplo.com/foto.jpg", USER)).toBeNull();
  });

  it("rejeita tentativas de sair da pasta", () => {
    expect(avatarPathFromUrl(`${BASE}/${USER}/../outro/a.jpg`, USER)).toBeNull();
    expect(avatarPathFromUrl(`${BASE}/${USER}/%2e%2e/a.jpg`, USER)).toBeNull();
    expect(avatarPathFromUrl(`${BASE}/${USER}/sub/pasta/a.jpg`, USER)).toBeNull();
  });

  it("devolve null para entradas vazias ou inválidas", () => {
    expect(avatarPathFromUrl("", USER)).toBeNull();
    expect(avatarPathFromUrl(null, USER)).toBeNull();
    expect(avatarPathFromUrl("não é url", USER)).toBeNull();
    expect(avatarPathFromUrl(`${BASE}/${USER}/a.jpg`, "")).toBeNull();
  });
});
