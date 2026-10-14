import { useCigarros } from "@hooks/useCigarros";
import { CigStartPanel } from "./CigStartPanel";
import { CigRunPanel } from "./CigRunPanel";
import "@styles/cigarros.css";

interface CigarrosViewProps {
  showNotice: (text: string) => void;
}

export function CigarrosView({ showNotice }: CigarrosViewProps) {
  const { cig, start, bump, reset } = useCigarros(showNotice);

  return (
    <section
      id="view-cigarros"
      role="tabpanel"
      aria-labelledby="tab-cigarros"
      style={{ display: "flex", flexDirection: "column", gap: 14 }}
    >
      {cig.start ? (
        <CigRunPanel cig={cig} onBump={bump} onReset={reset} />
      ) : (
        <CigStartPanel onStart={start} />
      )}
    </section>
  );
}
