import { useEffect, useState } from "react";
import { useColorScheme as useRNColorScheme } from "react-native";

/**
 * Web-Variante: erst nach Hydration auf System-Scheme wechseln, sonst Hydration-Mismatch.
 * Liefert garantiert "light" | "dark" zurück.
 */
export function useColorScheme(): "light" | "dark" {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const scheme = useRNColorScheme();

  if (hasHydrated) {
    return scheme === "dark" ? "dark" : "light";
  }

  return "light";
}
