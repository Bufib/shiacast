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
import { Colors } from "@/constants/Colors";
import { arabicLetters } from "../../../utils/arabicCurriculum";
import HeaderLeftBackButton from "@/components/HeaderLeftBackButton";
import { router } from "expo-router";
import { ThemedText } from "@/components/ThemedText";

export default function Level1_1() {
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
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={styles.headerRow}>
              <HeaderLeftBackButton size={30} color={Colors.universal.link} />
              <Text
                style={[
                  styles.headerTitle,
                  {
                    color: Colors[colorScheme].text,
                  },
                ]}
              >
                Buchstabenformen im Wort
              </Text>
            </View>

            <ThemedView
              style={[
                styles.tableHeader,
                {
                  borderColor: Colors[colorScheme].border,
                  backgroundColor: Colors[colorScheme].contrast,
                },
              ]}
            >
              <Text
                style={[styles.headerCell, { color: Colors[colorScheme].text }]}
              >
                Buchstabe
              </Text>
              <Text
                style={[styles.headerCell, { color: Colors[colorScheme].text }]}
              >
                Anfang
              </Text>
              <Text
                style={[styles.headerCell, { color: Colors[colorScheme].text }]}
              >
                Mitte
              </Text>
              <Text
                style={[styles.headerCell, { color: Colors[colorScheme].text }]}
              >
                Ende
              </Text>
            </ThemedView>
          </>
        }
        ListFooterComponent={
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.continueButton}
            >
              <ThemedText>Zurück</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/(arabicLevels)/level3")}
              style={styles.continueButton}
            >
              <ThemedText>Weiter</ThemedText>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <ThemedView
            style={[
              styles.tableRow,
              {
                borderColor: Colors[colorScheme].border,
                backgroundColor: Colors[colorScheme].contrast,
              },
            ]}
          >
            <View style={styles.cell}>
              <Text
                style={[styles.mainLetter, { color: Colors[colorScheme].text }]}
              >
                {item.isolated}
              </Text>
              <Text
                style={[styles.letterName, { color: Colors[colorScheme].text }]}
              >
                {item.name}
              </Text>
            </View>

            <View style={styles.cell}>
              <Text
                style={[styles.formLetter, { color: Colors[colorScheme].text }]}
              >
                {item.initial}
              </Text>
            </View>

            <View style={styles.cell}>
              <Text
                style={[styles.formLetter, { color: Colors[colorScheme].text }]}
              >
                {item.medial}
              </Text>
            </View>

            <View style={styles.cell}>
              <Text
                style={[styles.formLetter, { color: Colors[colorScheme].text }]}
              >
                {item.final}
              </Text>
            </View>
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
    gap: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 30,
    flexShrink: 1,
  },
  tableHeader: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  headerCell: {
    flex: 1,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
  },
  listContent: {
    paddingBottom: 24,
    gap: 12,
  },
  tableRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    minHeight: 96,
    alignItems: "center",
  },
  cell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  mainLetter: {
    fontSize: 32,
    textAlign: "center",
  },
  letterName: {
    fontSize: 12,
    textAlign: "center",
    opacity: 0.7,
  },
  formLetter: {
    fontSize: 28,
    textAlign: "center",
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
