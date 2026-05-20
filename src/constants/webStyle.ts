import { Platform } from "react-native";

const IS_WEB = Platform.OS === "web";

/**
 * CSS-Transition-Helfer fuer die Web-Version.
 *
 * React Natives Style-Typen kennen `transition*` nicht und die Properties sind
 * auf nativen Plattformen ohnehin wirkungslos. Daher liefert dieser Helfer auf
 * Nativ `null` und nur auf Web ein echtes Style-Objekt. Rueckgabe ist `any`,
 * damit Aufrufstellen (View-, Text- und Image-Styles) typsicher bleiben.
 */
export function webTransition(
  property: string,
  duration = 220,
  timing = "cubic-bezier(0.22, 0.61, 0.36, 1)",
): any {
  if (!IS_WEB) return null;

  return {
    transitionProperty: property,
    transitionDuration: `${duration}ms`,
    transitionTimingFunction: timing,
  };
}
