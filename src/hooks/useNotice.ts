import { useCallback, useState } from "react";

export function useNotice() {
  const [notice, setNotice] = useState("");
  const showNotice = useCallback((text: string) => setNotice(text), []);
  return { notice, showNotice };
}
