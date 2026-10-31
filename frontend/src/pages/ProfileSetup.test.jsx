import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createProfile } from "../services/api";
import ProfileSetup from "./ProfileSetup";

vi.mock("../services/api", () => ({ createProfile: vi.fn() }));

function renderPage(props = {}) {
  const handlers = { onProfileCreated: vi.fn(), onLogout: vi.fn(), ...props };

  render(
    <MemoryRouter initialEntries={["/profile/setup"]}>
      <Routes>
        <Route path="/profile/setup" element={<ProfileSetup {...handlers} />} />
        <Route path="/dashboard" element={<p>Tela do dashboard</p>} />
      </Routes>
    </MemoryRouter>,
  );

  return handlers;
}

beforeEach(() => {
  vi.mocked(createProfile).mockReset();
});

describe("ProfileSetup", () => {
  it("cria o perfil, avisa o App e segue para o dashboard", async () => {
    const user = userEvent.setup();
    const profile = { id: "u1", username: "ryan_01", avatar_url: null };
    vi.mocked(createProfile).mockResolvedValue(profile);
    const { onProfileCreated } = renderPage();

    await user.type(screen.getByLabelText("Nome de usuário"), "  ryan_01  ".trim());
    await user.click(screen.getByRole("button", { name: /Continuar/ }));

    await waitFor(() => expect(screen.getByText("Tela do dashboard")).toBeTruthy());
    expect(createProfile).toHaveBeenCalledWith({ username: "ryan_01" });
    expect(onProfileCreated).toHaveBeenCalledWith(profile);
  });

  it("mostra o erro da API e não avança quando o username já está em uso", async () => {
    const user = userEvent.setup();
    vi.mocked(createProfile).mockRejectedValue({
      response: { data: { error: "Este nome de usuário já está em uso." } },
    });
    const { onProfileCreated } = renderPage();

    await user.type(screen.getByLabelText("Nome de usuário"), "ryan_01");
    await user.click(screen.getByRole("button", { name: /Continuar/ }));

    expect((await screen.findByRole("alert")).textContent).toBe("Este nome de usuário já está em uso.");
    expect(onProfileCreated).not.toHaveBeenCalled();
    expect(screen.queryByText("Tela do dashboard")).toBeNull();
  });

  it("permite sair da conta", async () => {
    const user = userEvent.setup();
    const { onLogout } = renderPage();

    await user.click(screen.getByRole("button", { name: "Sair" }));

    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});
