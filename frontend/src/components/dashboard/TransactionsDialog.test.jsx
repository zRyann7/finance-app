import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import TransactionsDialog from "./TransactionsDialog";

const transactions = [
  { id: "t1", description: "Salário", amount: "5000.00", type: "income", date: "2026-10-05" },
  { id: "t2", description: "Mercado", amount: "320.50", type: "expense", date: "2026-10-12" },
];

function Harness({ onDelete = vi.fn() }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Abrir histórico</button>
      {open && (
        <TransactionsDialog
          transactions={transactions}
          deletingId={null}
          onDelete={onDelete}
          onClose={() => setOpen(false)}
        />
      )}
    </>
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

  it("só exclui depois da confirmação", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const confirm = vi.spyOn(window, "confirm");
    render(<Harness onDelete={onDelete} />);
    await user.click(screen.getByRole("button", { name: "Abrir histórico" }));

    confirm.mockReturnValueOnce(false);
    await user.click(screen.getByRole("button", { name: "Excluir Salário" }));
    expect(onDelete).not.toHaveBeenCalled();

    confirm.mockReturnValueOnce(true);
    await user.click(screen.getByRole("button", { name: "Excluir Salário" }));
    expect(onDelete).toHaveBeenCalledWith("t1");
  });
});
