import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { useDialogs } from "../../hooks/useDialogs";
import DialogProvider from "./DialogProvider";

function Harness({ onResult }) {
  const { confirm, prompt } = useDialogs();

  return (
    <>
      <button onClick={async () => onResult(await confirm({ title: "Excluir item", message: "Tem certeza?", confirmLabel: "Excluir", danger: true }))}>
        pedir confirmação
      </button>
      <button
        onClick={async () =>
          onResult(
            await prompt({
              title: "Atualizar valor",
              label: "Valor",
              defaultValue: "10,00",
              validate: (text) => (/^\d+(,\d{2})?$/.test(text) ? "" : "Valor inválido."),
            }),
          )
        }
      >
        pedir valor
      </button>
    </>
  );
}

function setup() {
  const onResult = vi.fn();
  render(
    <DialogProvider>
      <Harness onResult={onResult} />
    </DialogProvider>,
  );
  return { user: userEvent.setup(), onResult };
}

describe("DialogProvider — confirm", () => {
  it("resolve true ao confirmar e false ao cancelar", async () => {
    const { user, onResult } = setup();

    await user.click(screen.getByRole("button", { name: "pedir confirmação" }));
    expect(screen.getByRole("alertdialog", { name: "Excluir item" })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Excluir" }));
    expect(onResult).toHaveBeenLastCalledWith(true);
    expect(screen.queryByRole("alertdialog")).toBeNull();

    await user.click(screen.getByRole("button", { name: "pedir confirmação" }));
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onResult).toHaveBeenLastCalledWith(false);
  });

  it("começa com o foco em Cancelar (padrão seguro para exclusões)", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "pedir confirmação" }));
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Cancelar" }));
  });

  it("Escape cancela e devolve o foco a quem abriu", async () => {
    const { user, onResult } = setup();
    const trigger = screen.getByRole("button", { name: "pedir confirmação" });
    await user.click(trigger);

    await user.keyboard("{Escape}");

    expect(onResult).toHaveBeenLastCalledWith(false);
    expect(document.activeElement).toBe(trigger);
  });
});

describe("DialogProvider — prompt", () => {
  it("abre com o valor atual selecionado e devolve o texto confirmado", async () => {
    const { user, onResult } = setup();
    await user.click(screen.getByRole("button", { name: "pedir valor" }));

    const input = screen.getByRole("textbox", { name: "Valor" });
    expect(document.activeElement).toBe(input);
    expect(input.value).toBe("10,00");

    await user.keyboard("250,50{Enter}"); // digita por cima do texto selecionado e envia com Enter
    expect(onResult).toHaveBeenLastCalledWith("250,50");
  });

  it("mostra o erro dentro do diálogo e só fecha quando o valor é válido", async () => {
    const { user, onResult } = setup();
    await user.click(screen.getByRole("button", { name: "pedir valor" }));

    await user.keyboard("abc{Enter}");
    expect(screen.getByRole("alert").textContent).toBe("Valor inválido.");
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(onResult).not.toHaveBeenCalled();

    await user.keyboard("{Control>}a{/Control}12,00{Enter}");
    expect(onResult).toHaveBeenLastCalledWith("12,00");
  });

  it("resolve null ao cancelar", async () => {
    const { user, onResult } = setup();
    await user.click(screen.getByRole("button", { name: "pedir valor" }));
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onResult).toHaveBeenLastCalledWith(null);
  });
});
