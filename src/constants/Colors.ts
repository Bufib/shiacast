const tintColorLight = "#2ea853";
const tintColorDark = "#fff";

type ThemePalette = {
  // Navigation
  tint: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;

  // TabView
  indicatorColor: string;
  inactiveLabelColor: string;
  activeLabelColor: string;

  // General
  text: string;
  inversTextColor: string;
  background: string;
  backgroundElement: string;
  contrast: string;
  border: string;
  shadow: string;
  loadingIndicator: string;
  error: string;
  defaultIcon: string;
  devider: string;

  // Switch
  trackColor: string;
  thumbColor: string;
};

type UniversalPalette = {
  primary: string;
  secondary: string;
  third: string;
  grayedOut: string;
  link: string;
  externalLinkIcon: string;
  favorite: string;
  error: string;
};

type ColorsType = {
  light: ThemePalette;
  dark: ThemePalette;
  universal: UniversalPalette;
};

export const Colors: ColorsType = {
  light: {
    // Navigation
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,

    // TabView
    indicatorColor: "#000",
    inactiveLabelColor: "#000",
    activeLabelColor: "#555",

    // General
    text: "#11181C",
    inversTextColor: "#ECEDEE",
    background: "#f2f2f2",
    backgroundElement: "#F0F0F3",
    contrast: "#fff",
    border: "#000",
    shadow: "#000",
    loadingIndicator: "#000",
    error: "#d32f2f",
    defaultIcon: "#000",
    devider: "rgba(0,0,0,1)",

    // Switch
    trackColor: "#767577",
    thumbColor: "#f4f3f4",
  },

  dark: {
    // Navigation
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,

    // TabView
    indicatorColor: "#fff",
    inactiveLabelColor: "#fff",
    activeLabelColor: "#aaa",

    // General
    text: "#ECEDEE",
    inversTextColor: "#11181C",
    background: "#242c40",
    backgroundElement: "#212225",
    contrast: "#34495e",
    border: "#fff",
    shadow: "#fff",
    loadingIndicator: "#fff",
    error: "#f44336",
    defaultIcon: "#fff",
    devider: "rgba(255,255,255,1)",

    // Switch
    trackColor: "#057958",
    thumbColor: "#f4f3f4",
  },

  universal: {
    primary: "#2ea853",
    secondary: "#1D3E53",
    third: "#08832d",
    grayedOut: "#888",
    link: "#0a84ff",
    externalLinkIcon: "#057958",
    favorite: "#F59E0B",
    error: "#f44336",
  },
};
