import React from "react";
import {
  FlatList,
  StyleSheet,
  useColorScheme,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { arabicLetters } from "../../../utils/arabicCurriculum";
import HeaderLeftBackButton from "@/components/HeaderLeftBackButton";
import { router } from "expo-router";

export default function Level1() {
  const colorScheme = useColorScheme() || "light";

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: Colors[colorScheme].background,
        },
      ]}
      edges={["top"]}
    >
      <FlatList
        data={arabicLetters}
        keyExtractor={(item, index) => `${item.letter}-${index}`}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              marginBottom: 15,
            }}
          >
            <HeaderLeftBackButton size={30} color={Colors.universal.link} />
            <Text
              style={[
                styles.headerTitle,
                {
                  color: Colors[colorScheme].text,
                  alignSelf: "center",
                },
              ]}
            >
              Das arabische Alphabet
            </Text>
          </View>
        }
        ListFooterComponent={
          <TouchableOpacity
            onPress={() => router.push("/(arabicLevels)/level13")}
            style={styles.continueButton}
          >
            <ThemedText>Weiter</ThemedText>
          </TouchableOpacity>
        }
        renderItem={({ item }) => (
          <ThemedView
            style={[
              styles.card,
              {
                borderColor: Colors[colorScheme].border,
                backgroundColor: Colors[colorScheme].contrast,
              },
            ]}
          >
            <Text style={[styles.letter, { color: Colors[colorScheme].text }]}>
              {item.letter}
            </Text>
            <Text style={[styles.name, { color: Colors[colorScheme].text }]}>
              {item.name}
            </Text>
            <Text
              style={[
                styles.pronunciation,
                { color: Colors[colorScheme].text },
              ]}
            >
              {item.pronunciation}
            </Text>
          </ThemedView>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 20,
  },
  headerTitle: {
    fontSize: 30,
    textAlign: "center",
    flexShrink: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  card: {
    width: "48%",
    minHeight: 160,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingBottom: 10,
  },
  letter: {
    fontSize: 40,
    textAlign: "center",
  },
  name: {
    fontSize: 20,
    textAlign: "center",
  },
  pronunciation: {
    fontSize: 18,
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 28,
  },

  continueButton: {
    alignSelf: "flex-end",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    marginRight: 5,
    backgroundColor: "red",
  },
});
