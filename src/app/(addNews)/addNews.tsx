import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TitleSearchInput } from "@/components/TitleSearch";
import { Colors } from "@/constants/Colors";
import { useAddNews } from "../../../hooks/useAddNews";
import { useConnectionStatus } from "../../../hooks/useConnectionStatus";
import React from "react";
import { Controller } from "react-hook-form";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

export default function AddNews() {
  const {
    control,
    handleSubmit,
    selectedImages,
    uploading,
    pickImages,
    removeImage,
    onSubmit,
  } = useAddNews();

  const hasInternet = useConnectionStatus();
  const colorScheme = useColorScheme() || "light";

  const LanguageButton = ({ code, label, selected, onPress }: any) => (
    <Pressable
      style={[
        styles.langButton,
        selected ? styles.langButtonSelected : styles.langButtonUnselected,
      ]}
      onPress={() => onPress(code)}
    >
      <Text
        style={selected ? styles.langTextSelected : styles.langTextUnselected}
      >
        {label}
      </Text>
    </Pressable>
  );

  const renderForm = () => (
    <ThemedView>
      <View style={[styles.card, Colors[colorScheme].contrast]}>
        {/* Title Input */}
        <ThemedText style={styles.label}>Title</ThemedText>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, Colors[colorScheme].text]}
              onChangeText={onChange}
              value={value}
              placeholder="Gib einen Titel ein"
              placeholderTextColor="#888"
            />
          )}
        />

        {/* Body Input */}
        <ThemedText style={styles.label}>Nachricht</ThemedText>
        <Controller
          control={control}
          name="content"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, styles.textArea, Colors[colorScheme].text]}
              onChangeText={onChange}
              value={value}
              placeholder="Gib eine Nachricht ein"
              multiline
              placeholderTextColor="#888"
            />
          )}
        />

        {/* External URLs Input */}
        <ThemedText style={styles.label}>Externe URLs</ThemedText>
        <Controller
          control={control}
          name="external_urls"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, Colors[colorScheme].text]}
              onChangeText={onChange}
              value={value}
              placeholder="Kommagetrennte URLs mit http..."
              placeholderTextColor="#888"
            />
          )}
        />

        {/* Internal URLs Input */}
        <ThemedText style={styles.label}>Verlinke eine Frage</ThemedText>
        <Controller
          control={control}
          name="internal_urls"
          render={({ field: { onChange, value } }) => (
            <TitleSearchInput
              value={value || ""}
              onChangeText={onChange}
            />
          )}
        />

        {/* Language Selection Buttons */}
        <ThemedText style={styles.label}>Sprache</ThemedText>
        <Controller
          control={control}
          name="language_code"
          render={({ field: { onChange, value } }) => (
            <View style={styles.langContainer}>
              <LanguageButton
                code="de"
                label="DE"
                selected={value === "de"}
                onPress={onChange}
              />
              <LanguageButton
                code="ar"
                label="AR"
                selected={value === "ar"}
                onPress={onChange}
              />
              <LanguageButton
                code="en"
                label="EN"
                selected={value === "en"}
                onPress={onChange}
              />
            </View>
          )}
        />

        {/* Pinned Switch */}
        <ThemedText style={styles.label}>Nachricht fixieren?</ThemedText>
        <Controller
          control={control}
          name="is_pinned"
          render={({ field: { onChange, value } }) => (
            <Switch onValueChange={onChange} value={value} />
          )}
        />
      </View>

      {/* Pick Image Button */}
      {/* <TouchableOpacity style={styles.pickImageButton} onPress={pickImages}>
        <Text style={styles.imagePickerText}>
          {selectedImages.length ? "Mehr Bilder auswählen" : "Bilder hochladen"}
        </Text>
      </TouchableOpacity> */}

      {/* Submit Button */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          (uploading || !hasInternet) && styles.disabled,
        ]}
        onPress={handleSubmit(onSubmit)}
        disabled={uploading || !hasInternet}
      >
        <Text style={styles.submitButtonText}>
          {uploading ? "Wird hochgeladen..." : "Hochladen"}
        </Text>
      </TouchableOpacity>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollStyles}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderForm()}
        {!!selectedImages.length && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.imageRow}
            style={styles.scrollViewStyle}
          >
            {selectedImages.map((item) => (
              <View key={item.uri} style={styles.imageContainer}>
                <Image source={{ uri: item.uri }} style={styles.imagePreview} />
                <Pressable
                  style={[
                    styles.removeButton,
                    { backgroundColor: Colors[colorScheme].error },
                  ]}
                  onPress={() => removeImage(item.uri)}
                >
                  <Text style={styles.removeButtonText}>Entfernen</Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
  },
  scrollStyles: {},
  scrollContent: {
    padding: 10,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    gap: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  textArea: { textAlignVertical: "top", height: 200 },
  langContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  langButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: "center",
  },
  langButtonSelected: { backgroundColor: Colors.universal.primary },
  langButtonUnselected: {},
  langTextSelected: { color: "#fff", fontWeight: "600" },
  langTextUnselected: { color: Colors.universal.primary, fontWeight: "600" },
  pickImageButton: {
    padding: 15,
    borderRadius: 12,
    backgroundColor: Colors.universal.primary,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  imagePickerText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  submitButton: {
    padding: 15,
    borderRadius: 12,
    backgroundColor: Colors.universal.primary,
    alignItems: "center",
  },
  disabled: { opacity: 0.5 },
  submitButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  imageRow: { paddingRight: 20 },
  scrollViewStyle: { marginTop: 20, marginBottom: 20 },
  imageContainer: { marginRight: 15, alignItems: "center" },
  imagePreview: { width: 120, height: 120, borderRadius: 12, marginBottom: 8 },
  removeButton: { borderRadius: 8, paddingVertical: 5, paddingHorizontal: 10 },
  removeButtonText: { color: "#fff", fontSize: 12, fontWeight: "600" },
});
