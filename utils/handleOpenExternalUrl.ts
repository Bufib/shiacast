// src/utils/handleOpenExternalUrl.ts
import { Linking } from "react-native";
import Toast from "react-native-toast-message";
import i18n from "./i18n";

const handleOpenExternalUrl = async (url: string) => {
  if (!url) return;

  try {
    // show an “opening link” toast
    Toast.show({
      type: "info",
      text1: i18n.t("openingLink"),
      position: "bottom",
      visibilityTime: 1000,
    });

    // check the URL
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      // unsupported URL
      Toast.show({
        type: "error",
        text1: i18n.t("urlNotSupported"),
        position: "bottom",
      });
    }
  } catch (error) {
    console.error(i18n.t("errorOpeningUrl"), error);
    Toast.show({
      type: "error",
      text1: i18n.t("errorOpeningUrl"),
      position: "bottom",
    });
  }
};

export default handleOpenExternalUrl;
