import { useEffect, useRef } from "react";

// Fecha popovers e diálogos: tecla Escape e, opcionalmente, clique/toque fora da área indicada.
//   insideSelector: seletor CSS da área "de dentro" (ex.: ".header-actions"). Sem ele, só o Escape fecha.
export function useDismiss(onDismiss, { active = true, insideSelector } = {}) {
  const callback = useRef(onDismiss);

  useEffect(() => {
    callback.current = onDismiss;
  });

  useEffect(() => {
    if (!active) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") callback.current();
    }

    function handlePointerDown(event) {
      const target = event.target;
      if (target instanceof Element && target.closest(insideSelector)) return;
      callback.current();
    }

    document.addEventListener("keydown", handleKeyDown);
    if (insideSelector) document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (insideSelector) document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [active, insideSelector]);
}
