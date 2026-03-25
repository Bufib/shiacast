import { PropsWithChildren, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "./ui/IconSymbol";
import { useColorScheme } from "../../hooks/useColorScheme";
import { Image } from "expo-image";
import { useFontSizeStore } from "../../stores/fontSizeStore";
import { Colors } from "@/constants/Colors";

export function Collapsible({
  children,
  title,
  marja,
  style,
  alignItems = "center",
  useFontSize = true,
}: PropsWithChildren & {
  title: string;
  marja?: string;
  style?: any;
  alignItems?: any;
  useFontSize?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const colorScheme = useColorScheme() || "light";
  const { getFontSize, getLineHeight } = useFontSizeStore();

  return (
    <ThemedView style={style}>
      <TouchableOpacity
        style={[styles.heading, { alignItems: alignItems }]}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}
      >
        <IconSymbol
          name="chevron.right"
          size={18}
          weight="medium"
          color={colorScheme === "dark" ? "#fff" : "#000"}
          style={{ transform: [{ rotate: isOpen ? "90deg" : "0deg" }] }}
        />
        {marja && (
          <Image
            source={
              marja === "khamenei"
                ? require("@/assets/images/khamenei.png")
                : require("@/assets/images/sistani.png")
            }
            contentFit="contain"
            style={styles.image}
          />
        )}

        {useFontSize ? (
          <ThemedText
            type="latin"
            style={{
              fontWeight: "600",
            }}
          >
            {title}
          </ThemedText>
        ) : (
          <ThemedText
            type="defaultSemiBold"
            style={{
              fontSize: 16,
              lineHeight: 24,
              fontWeight: "600",
            }}
          >
            {title}
          </ThemedText>
        )}
      </TouchableOpacity>
      {isOpen && (
        <View
          style={[
            styles.content,
            {
              backgroundColor: Colors[colorScheme].contrast,
            },
          ]}
        >
          {children}
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: "row",
    gap: 6,
  },
  content: {
    marginTop: 5,
    marginHorizontal: 5,
    padding: 12,
    borderRadius: 7,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
});
