import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DialogContext } from "../../hooks/useDialogs";
import AppDialog from "./AppDialog";

// Mantém um único diálogo aberto por vez e entrega o resultado como Promise, para o código que
// chama continuar parecido com window.confirm: `if (!(await confirm({ ... }))) return;`
export default function DialogProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const pending = useRef(null);

  const open = useCallback(
    (kind, options) =>
      new Promise((resolve) => {
        // Se já havia um diálogo aberto, ele é cancelado para a Promise anterior não ficar pendurada.
        pending.current?.resolve(pending.current.cancelValue);
        pending.current = { resolve, cancelValue: kind === "confirm" ? false : null };
        setDialog({ kind, options });
      }),
    [],
  );

  const settle = useCallback((value) => {
    const current = pending.current;
    pending.current = null;
    setDialog(null);
    current?.resolve(value);
  }, []);

  useEffect(
    () => () => {
      pending.current?.resolve(pending.current.cancelValue);
      pending.current = null;
    },
    [],
  );

  const api = useMemo(
    () => ({
      confirm: (options) => open("confirm", options),
      prompt: (options) => open("prompt", options),
    }),
    [open],
  );

  return (
    <DialogContext.Provider value={api}>
      {children}
      {dialog && createPortal(<AppDialog kind={dialog.kind} options={dialog.options} onSettle={settle} />, document.body)}
    </DialogContext.Provider>
  );
}
