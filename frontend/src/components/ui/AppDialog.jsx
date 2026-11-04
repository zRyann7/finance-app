import { useEffect, useId, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useFocusTrap } from "../../hooks/useFocusTrap";

// Diálogo modal de confirmação ou de entrada de texto (visual do app, no lugar do pop-up do navegador).
// Resolve por onSettle: confirmação -> true | false; entrada -> texto | null (cancelado).
export default function AppDialog({ kind, options, onSettle }) {
  const {
    title,
    message,
    label,
    inputMode,
    validate,
    danger = false,
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
  } = options;
  const isPrompt = kind === "prompt";
  const dialogRef = useRef(null);
  const [value, setValue] = useState(options.defaultValue ?? "");
  const [error, setError] = useState("");
  const titleId = useId();
  const messageId = useId();
  const errorId = useId();

  useFocusTrap(dialogRef);

  useEffect(() => {
    if (isPrompt) dialogRef.current?.querySelector("input")?.select();
  }, [isPrompt]);

  // Escape é tratado na fase de captura e não segue adiante: assim, com este diálogo aberto por
  // cima de outro (ex.: histórico de transações), o Escape fecha só este e não o de baixo.
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      onSettle(isPrompt ? null : false);
    }

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isPrompt, onSettle]);

  function cancel() {
    onSettle(isPrompt ? null : false);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!isPrompt) return onSettle(true);

    const validationError = validate?.(value);
    if (validationError) {
      setError(validationError);
      return undefined;
    }
    return onSettle(value);
  }

  return (
    <div className="dialog-backdrop dialog-backdrop-top" role="presentation" onMouseDown={cancel}>
      <motion.form
        ref={dialogRef}
        tabIndex={-1}
        className="app-dialog"
        role={isPrompt ? "dialog" : "alertdialog"}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={message ? messageId : undefined}
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onSubmit={handleSubmit}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id={titleId}>{title}</h2>
        {message && <p id={messageId}>{message}</p>}

        {isPrompt && (
          <label className="app-dialog-field">
            <span>{label}</span>
            <input
              inputMode={inputMode}
              value={value}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId : undefined}
              onChange={(event) => {
                setValue(event.target.value);
                if (error) setError("");
              }}
            />
            {error && <small id={errorId} className="field-error" role="alert">{error}</small>}
          </label>
        )}

        <div className="app-dialog-actions">
          <button type="button" className="app-dialog-cancel" onClick={cancel}>{cancelLabel}</button>
          <button type="submit" className={`app-dialog-confirm${danger ? " is-danger" : ""}`}>{confirmLabel}</button>
        </div>
      </motion.form>
    </div>
  );
}
