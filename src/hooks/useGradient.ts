import { gradientColorPalette } from "@/constants/Gradients";
import { UseGradientOptionsType } from "@/constants/Types";
import { useMemo } from "react";

// Stabiler FNV-1a-Hash. Identische Inputs → identische Outputs.
function hashSeed(seed: string | number): number {
  const str = typeof seed === "number" ? String(seed) : seed;
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

type Options = UseGradientOptionsType & {
  /** Stabiler Schlüssel (z.B. Video-ID), damit der Gradient nicht springt. */
  seed?: string | number;
};

export function useGradient(options: Options = {}) {
  const { customGradients, defaultIndex = 0, seed } = options;

  const gradients = customGradients ?? gradientColorPalette;

  const gradientColors = useMemo(() => {
    if (gradients.length === 0) return [] as string[];

    if (seed !== undefined && seed !== null) {
      const idx = hashSeed(seed) % gradients.length;
      return gradients[idx];
    }

    const safeIndex =
      defaultIndex >= 0 && defaultIndex < gradients.length ? defaultIndex : 0;
    return gradients[safeIndex];
  }, [gradients, seed, defaultIndex]);

  return {
    gradientColors,
    availableGradients: gradients,
  };
}
