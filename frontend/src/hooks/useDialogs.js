import { createContext, useContext } from "react";

export const DialogContext = createContext(null);

// Substitui window.confirm / window.prompt por diálogos do próprio app (ver DialogProvider).
//   confirm({ title, message, confirmLabel, cancelLabel, danger }) -> Promise<boolean>
//   prompt({ title, message, label, defaultValue, inputMode, validate, confirmLabel, cancelLabel })
//     -> Promise<string | null>   (null = cancelado; `validate(texto)` devolve a mensagem de erro ou "")
export function useDialogs() {
  const context = useContext(DialogContext);
  if (!context) throw new Error("useDialogs precisa estar dentro de <DialogProvider>.");
  return context;
}
