import { useEffect, useState } from "react";

/** Pathname atual, reativo a navegação via botão voltar/avançar do navegador.
 * O app só tem duas rotas estáticas (sem parâmetro), então não precisa de
 * uma lib de roteamento — só ler window.location. */
export function useRoute(): string {
  const [pathname, setPathname] = useState(() => window.location.pathname);

  useEffect(() => {
    function handlePopState() {
      setPathname(window.location.pathname);
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return pathname;
}
