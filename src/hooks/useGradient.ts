// src/hooks/useGradient.ts
import { gradientColorPalette } from "@/constants/Gradients";
import { UseGradientOptionsType } from "@/constants/Types";
import { useCallback, useEffect, useState } from "react";

export function useGradient(options: UseGradientOptionsType = {}) {
  const { customGradients, defaultIndex = 0 } = options;

  // Use custom gradients or defaults
  const gradients = customGradients || gradientColorPalette;

  // Set initial gradient
  const initialIndex = defaultIndex < gradients.length ? defaultIndex : 0;
  const [gradientColors, setGradientColors] = useState<any>(
    gradients[initialIndex]
  );

  // Function to select a random preset gradient
  const selectRandomPreset = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * gradients.length);
    setGradientColors(gradients[randomIndex]);
  }, [gradients, setGradientColors]);

  // Function to select a specific gradient by index
  const selectGradient = (index: number) => {
    if (index >= 0 && index < gradients.length) {
      setGradientColors(gradients[index]);
    }
  };

  // Initialize with a random gradient on mount
  useEffect(() => {
    selectRandomPreset();
  }, [selectRandomPreset]);

  return {
    gradientColors,
    selectRandomPreset,
    selectGradient,
    availableGradients: gradients,
  };
}