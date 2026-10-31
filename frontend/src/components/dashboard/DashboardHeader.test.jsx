import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import DashboardHeader from "./DashboardHeader";

const NO_NOTIFICATIONS = "Nenhuma notificação no momento.";

function renderHeader(props = {}) {
  return render(
    <MemoryRouter>
      <DashboardHeader summary={{ income: 1000, expenses: 250, balance: 750 }} {...props} />
    </MemoryRouter>,
  );
}

// Os botões aparecem duas vezes no DOM (linha do título no mobile e canto direito no desktop);
// o CSS esconde uma das cópias conforme a largura da tela.
const bellButtons = () => screen.getAllByRole("button", { name: "Notificações" });

describe("DashboardHeader", () => {
  it("mostra as métricas formatadas em reais", () => {
    renderHeader();

    expect(screen.getByText(/750,00/)).toBeTruthy();
    expect(screen.getByText(/250,00/)).toBeTruthy();
  });

  it("mostra um traço quando ainda não há resumo", () => {
    renderHeader({ summary: null });

    expect(screen.getAllByText("—")).toHaveLength(3);
  });

  it("abre o painel de notificações sem recriar o botão (o foco do teclado se mantém)", async () => {
    const user = userEvent.setup();
    renderHeader();

    const [bell] = bellButtons();
    await user.click(bell);

    expect(screen.getAllByText(NO_NOTIFICATIONS).length).toBeGreaterThan(0);
    // Regressão: quando os botões eram um componente declarado dentro do render, o React
    // trocava o elemento a cada clique e o foco ia para o <body>.
    expect(bellButtons()[0]).toBe(bell);
    expect(document.activeElement).toBe(bell);
  });

  it("fecha o painel com Escape", async () => {
    const user = userEvent.setup();
    renderHeader();

    await user.click(bellButtons()[0]);
    expect(screen.queryAllByText(NO_NOTIFICATIONS).length).toBeGreaterThan(0);

    await user.keyboard("{Escape}");
    expect(screen.queryAllByText(NO_NOTIFICATIONS)).toHaveLength(0);
  });

  it("fecha o painel ao clicar fora, mas não ao clicar dentro dele", async () => {
    const user = userEvent.setup();
    renderHeader();

    await user.click(bellButtons()[0]);
    await user.click(screen.getAllByText(NO_NOTIFICATIONS)[0]);
    expect(screen.queryAllByText(NO_NOTIFICATIONS).length).toBeGreaterThan(0);

    await user.click(document.body);
    expect(screen.queryAllByText(NO_NOTIFICATIONS)).toHaveLength(0);
  });

  it("trocar de painel mantém só um aberto", async () => {
    const user = userEvent.setup();
    renderHeader();

    await user.click(bellButtons()[0]);
    await user.click(screen.getAllByRole("button", { name: "Mais opções" })[0]);

    expect(screen.queryAllByText(NO_NOTIFICATIONS)).toHaveLength(0);
    expect(screen.getAllByRole("button", { name: "Configurações" }).length).toBeGreaterThan(0);
  });

  it("informa a quantidade de notificações novas no nome do botão", () => {
    renderHeader({ notificationCount: 3 });

    expect(screen.getAllByRole("button", { name: "Notificações (3 novas)" }).length).toBeGreaterThan(0);
  });
});
