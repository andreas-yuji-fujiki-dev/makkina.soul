import type { WriteError } from "@app-types/store.types";

export function describeWriteError(e: unknown): string {
  const code = (e as Partial<WriteError> | undefined)?.code;
  if (code === "quota_exceeded") {
    return "O quadro chegou no limite de armazenamento. Exclua cartões antigos de Feito para liberar espaço.";
  }
  return "Não consegui salvar essa mudança. Recarregue a página e tente de novo.";
}
