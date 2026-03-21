import React from "react";
import { View, Text, StyleSheet, Alert, useColorScheme } from "react-native";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import Entypo from "@expo/vector-icons/Entypo";
import { deleteNewsItem } from "../../utils/deleteNewsItem";
import { toggleIsPinnedStatus } from "../../utils/toggleIsPinnedStatus";
import { newsDeletedSuccessToast } from "@/constants/messages";
import { Colors } from "@/constants/Colors";
export default function NewsMenu({
  id,
  is_pinned,
}: {
  id: number;
  is_pinned: boolean;
}) {
  const colorScheme = useColorScheme() || "light";

  return (
    <View style={styles.container}>
      <Menu>
        {/* Trigger the menu */}
        <MenuTrigger>
          <Entypo
            name="dots-three-horizontal"
            size={24}
            color={Colors[colorScheme].defaultIcon}
            style={styles.triggerIcon}
          />
        </MenuTrigger>

        {/* Menu options */}
        <MenuOptions
          customStyles={{
            optionsContainer: [
              styles.optionsContainer,
              {
                backgroundColor: Colors[colorScheme].contrast,
                borderColor: Colors[colorScheme].border,
              },
            ],
            optionWrapper: styles.optionWrapper,
            optionText: styles.optionText,
          }}
        >
          <MenuOption onSelect={() => toggleIsPinnedStatus(id)}>
            <Text
              style={[styles.optionText, { color: Colors[colorScheme].text }]}
            >
              {is_pinned ? "Nicht mehr fixieren" : "Fixieren"}
            </Text>
          </MenuOption>

          <MenuOption
            onSelect={() => {
              Alert.alert(
                "Löschen Bestätigen", // Title
                "Bist du sicher, dass du diesen Beitrag löschen möchtest?",
                [
                  {
                    text: "Abbrechen",
                    style: "cancel",
                    onPress: () => console.log("Löschen Abgebrochen"),
                  },
                  {
                    text: "Löschen",
                    style: "destructive",
                    onPress: async () => {
                      deleteNewsItem(id);
                      newsDeletedSuccessToast();
                    },
                  },
                ],
              );
            }}
          >
            <Text
              style={[styles.optionText, { color: Colors[colorScheme].error }]}
            >
              Löschen
            </Text>
          </MenuOption>
        </MenuOptions>
      </Menu>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  triggerIcon: {
    padding: 10,
  },
  optionsContainer: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 5,
    elevation: 4, // For Android shadow
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4, // For iOS shadow
  },
  optionWrapper: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  optionText: {
    fontSize: 18,
  },
});
