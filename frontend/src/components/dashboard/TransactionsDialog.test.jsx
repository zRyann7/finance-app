import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import DialogProvider from "../ui/DialogProvider";
import TransactionsDialog from "./TransactionsDialog";

const transactions = [
  { id: "t1", description: "Salário", amount: "5000.00", type: "income", date: "2026-10-05" },
  { id: "t2", description: "Mercado", amount: "320.50", type: "expense", date: "2026-10-12" },
];

function Harness({ onDelete = vi.fn() }) {
  const [open, setOpen] = useState(false);

  return (
    <DialogProvider>
      <button onClick={() => setOpen(true)}>Abrir histórico</button>
      {open && (
        <TransactionsDialog
          transactions={transactions}
          deletingId={null}
          onDelete={onDelete}
          onClose={() => setOpen(false)}
        />
      )}
    </DialogProvider>
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("TransactionsDialog", () => {
  it("lista as transações com sinal e valor em reais", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Abrir histórico" }));

    expect(screen.getByRole("dialog", { name: "Todas as transações" })).toBeTruthy();
    expect(screen.getByText("Salário")).toBeTruthy();
    expect(screen.getByText(/\+R\$\s*5\.000,00/)).toBeTruthy();
    expect(screen.getByText(/−R\$\s*320,50/)).toBeTruthy();
  });

  it("move o foco para dentro do diálogo ao abrir", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Abrir histórico" }));

    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Fechar" }));
  });

  it("fecha com Escape e devolve o foco a quem abriu", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const trigger = screen.getByRole("button", { name: "Abrir histórico" });
    await user.click(trigger);

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("prende o Tab dentro do diálogo, nos dois sentidos", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Abrir histórico" }));

    const close = screen.getByRole("button", { name: "Fechar" });
    const lastDelete = screen.getByRole("button", { name: "Excluir Mercado" });

    lastDelete.focus();
    await user.tab(); // do último elemento volta para o primeiro
    expect(document.activeElement).toBe(close);

    await user.tab({ shift: true }); // do primeiro vai para o último
    expect(document.activeElement).toBe(lastDelete);
  });

  it("só exclui depois da confirmação no diálogo do app", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const nativeConfirm = vi.spyOn(window, "confirm");
    render(<Harness onDelete={onDelete} />);
    await user.click(screen.getByRole("button", { name: "Abrir histórico" }));

    // Cancelar não exclui
    await user.click(screen.getByRole("button", { name: "Excluir Salário" }));
    const confirmation = screen.getByRole("alertdialog", { name: "Excluir transação" });
    await user.click(within(confirmation).getByRole("button", { name: "Cancelar" }));
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(onDelete).not.toHaveBeenCalled();

    // Confirmar exclui
    await user.click(screen.getByRole("button", { name: "Excluir Salário" }));
    await user.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Excluir" }));
    expect(onDelete).toHaveBeenCalledWith("t1");
    expect(nativeConfirm).not.toHaveBeenCalled(); // nada de pop-up nativo do navegador
  });

  it("Escape fecha só a confirmação e mantém o histórico aberto", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<Harness onDelete={onDelete} />);
    await user.click(screen.getByRole("button", { name: "Abrir histórico" }));
    await user.click(screen.getByRole("button", { name: "Excluir Salário" }));

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(screen.getByRole("dialog", { name: "Todas as transações" })).toBeTruthy();
    expect(onDelete).not.toHaveBeenCalled();

    await user.keyboard("{Escape}"); // agora sim fecha o histórico
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
