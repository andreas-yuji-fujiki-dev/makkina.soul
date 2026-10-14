import { useRoute } from "@hooks/useRoute";
import { LandingPage } from "@components/landing/LandingPage";
import { SelfManagerApp } from "./SelfManagerApp";

export function App() {
  const pathname = useRoute();

  if (pathname === "/self-manager") {
    return <SelfManagerApp />;
  }

  return <LandingPage />;
}
