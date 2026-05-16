import { SizesType } from "@/constants/Types";

export const returnSize = (width: number, height: number): SizesType => {
  const isTablet = height >= 1000; // iPad & Co.
  const isLarge = !isTablet && height >= 800; // iPhone Pro Max, 14/15/16 Plus
  const isMedium = !isTablet && !isLarge && height >= 700; // Standard iPhones
  const isSmall = !isTablet && !isLarge && !isMedium; // SE, kleine Geräte

  return {
    imageSizePodcastPlayer: isTablet ? 70 : isLarge ? 55 : isMedium ? 50 : 39,
    fontSize: isTablet ? 15 : isLarge ? 13 : isMedium ? 12 : 11,
    badgeSize: isTablet ? 14 : isLarge ? 12 : isMedium ? 10 : 9,
    iconSize: isTablet ? 75 : isLarge ? 65 : isMedium ? 55 : 50,
    imageSize: isTablet ? 350 : isLarge ? 300 : isMedium ? 260 : 240,
    gap: isTablet ? 40 : isLarge ? 30 : isMedium ? 22 : 15,
    emptyIconSize: isTablet ? 80 : isLarge ? 60 : isMedium ? 40 : 30,
    emptyTextSize: isTablet ? 22 : isLarge ? 18 : isMedium ? 16 : 14,
    emptyGap: isTablet ? 14 : isLarge ? 10 : isMedium ? 6 : 5,
    previewSizes: isTablet ? 240 : isLarge ? 200 : isMedium ? 170 : 160,
    previewSizesPaddingHorizontal: isTablet ? 20 : 15,
    isTablet,
    isLarge,
    isMedium,
    isSmall,
    fontsizeHomeHeaders: isTablet ? 42 : isLarge ? 35 : isMedium ? 31 : 25,
    fontsizeHomeShowAll: isTablet ? 18 : isLarge ? 16 : isMedium ? 14 : 12,
  };
};
