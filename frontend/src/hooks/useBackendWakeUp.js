import { useEffect, useState } from "react";
import { pingBackend } from "../services/api";

const SLOW_AFTER_MS = 2500; // só avisa se o servidor não responder rápido
const RETRY_DELAY_MS = 3000;
const MAX_ATTEMPTS = 3;

// Dispara um GET /health ao montar a tela, o que acorda o backend em hospedagem gratuita.
// Devolve `isWaking`: true quando o servidor demora a responder (provável cold start),
// para a tela avisar o usuário. Se o servidor realmente estiver fora do ar, o aviso some
// depois das tentativas e o erro normal do formulário assume.
export function useBackendWakeUp() {
  const [isWaking, setIsWaking] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const slowTimer = setTimeout(() => setIsWaking(true), SLOW_AFTER_MS);

    (async () => {
      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
        try {
          await pingBackend({ signal: controller.signal });
          break;
        } catch {
          if (controller.signal.aborted) return;
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        }
      }

      if (controller.signal.aborted) return;
      clearTimeout(slowTimer);
      setIsWaking(false);
    })();

    return () => {
      controller.abort();
      clearTimeout(slowTimer);
    };
  }, []);

  return isWaking;
}
