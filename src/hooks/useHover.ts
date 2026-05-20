import { useCallback, useState } from "react";
import { Platform } from "react-native";

const IS_WEB = Platform.OS === "web";

type HoverResult = {
  hovered: boolean;
  /**
   * Auf eine View / Touchable spreadbare Props. Auf Nativ ist das Objekt leer,
   * sodass das Anhaengen auf jeder Plattform unbedenklich ist.
   */
  hoverProps: object;
};

/**
 * Web-only Hover-State. Auf nativen Plattformen bleibt `hovered` immer `false`
 * und `hoverProps` leer – so aendert sich das Verhalten der mobilen App nicht.
 */
export function useHover(): HoverResult {
  const [hovered, setHovered] = useState(false);

  const onMouseEnter = useCallback(() => setHovered(true), []);
  const onMouseLeave = useCallback(() => setHovered(false), []);

  if (!IS_WEB) {
    return { hovered: false, hoverProps: {} };
  }

  return {
    hovered,
    hoverProps: { onMouseEnter, onMouseLeave },
  };
}
