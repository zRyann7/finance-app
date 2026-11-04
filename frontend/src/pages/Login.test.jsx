import { act, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { login, pingBackend } from "../services/api";
import Login from "./Login";

vi.mock("../services/api", () => ({ login: vi.fn(), pingBackend: vi.fn() }));

const WAKE_TEXT = /iniciando o servidor/i;

function renderPage() {
  render(
    <MemoryRouter>
      <Login onAuthenticated={vi.fn()} />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.mocked(login).mockReset();
  vi.mocked(pingBackend).mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Login — aviso de servidor acordando", () => {
  it("não mostra o aviso quando o servidor responde rápido", async () => {
    vi.mocked(pingBackend).mockResolvedValue();
    renderPage();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    expect(screen.queryByText(WAKE_TEXT)).toBeNull();
  });

  it("mostra o aviso quando o servidor demora e o remove quando ele responde", async () => {
    let wake;
    vi.mocked(pingBackend).mockReturnValue(new Promise((resolve) => (wake = resolve)));
    renderPage();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(screen.queryByText(WAKE_TEXT)).not.toBeNull();

    await act(async () => {
      wake();
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(screen.queryByText(WAKE_TEXT)).toBeNull();
  });

  it("não exibe mais a mensagem 'verifique se o backend está ativo'", async () => {
    vi.mocked(pingBackend).mockResolvedValue();
    renderPage();
    expect(screen.queryByText(/backend/i)).toBeNull();
  });
});
