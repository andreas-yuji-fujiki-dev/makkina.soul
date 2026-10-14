import { useEffect, useRef } from "react";

const EDGE = 72;
const MAX_SPEED = 22;

/** Rola a página automaticamente enquanto `active` (um drag em andamento)
 * e o ponteiro está perto do topo/fim da tela — pra alcançar itens fora da
 * área visível sem precisar soltar o drag pra rolar manualmente.
 *
 * O listener de dragover é em fase de captura: handlers de drag nas linhas
 * e cartões chamam stopPropagation (pra não deixar o container pai
 * sobrescrever onde soltar), o que impediria um listener normal (bubble) na
 * window de receber a posição do ponteiro na maior parte do tempo. */
export function useAutoScroll(active: boolean) {
  const pointerY = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;

    function handleDragOver(e: DragEvent) {
      pointerY.current = e.clientY;
    }
    window.addEventListener("dragover", handleDragOver, true);

    let raf = requestAnimationFrame(function tick() {
      const y = pointerY.current;
      if (y != null) {
        const h = window.innerHeight;
        if (y < EDGE) {
          window.scrollBy(0, -MAX_SPEED * (1 - y / EDGE));
        } else if (y > h - EDGE) {
          window.scrollBy(0, MAX_SPEED * (1 - (h - y) / EDGE));
        }
      }
      raf = requestAnimationFrame(tick);
    });

    return () => {
      window.removeEventListener("dragover", handleDragOver, true);
      cancelAnimationFrame(raf);
      pointerY.current = null;
    };
  }, [active]);
}
