import { useEffect } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Mantém o foco do teclado dentro de um diálogo: ao abrir, foca o primeiro elemento; Tab e
// Shift+Tab circulam só entre os elementos do diálogo; ao fechar, o foco volta para quem o abriu.
// O container precisa de tabIndex={-1} (usado quando não há nenhum elemento focável dentro).
export function useFocusTrap(containerRef, active = true) {
  useEffect(() => {
    const container = containerRef.current;
    if (!active || !container) return undefined;

    const previouslyFocused = document.activeElement;
    const focusables = () => Array.from(container.querySelectorAll(FOCUSABLE));

    (focusables()[0] || container).focus();

    function handleKeyDown(event) {
      if (event.key !== "Tab") return;

      const items = focusables();
      if (items.length === 0) {
        event.preventDefault();
        container.focus();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;

      if (event.shiftKey && (current === first || current === container)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    }

    container.addEventListener("keydown", handleKeyDown);

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [containerRef, active]);
}
