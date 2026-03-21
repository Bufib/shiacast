import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useConnectionStatus } from "../../../hooks/useConnectionStatus";
import { supabase } from "../../../utils/supabase";
import React, { useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useColorScheme,
  View,
} from "react-native";

const AddPushMessages: React.FC = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const hasInternet = useConnectionStatus();
  const colorScheme = useColorScheme() || "light";
  const [selectedLanguage, setSelectedLanguage] = useState("de");
  const handleSubmit = async () => {
    if (!title.trim() && !message.trim()) {
      Alert.alert("Fehler", "Bitte gebe einen Titel oder eine Nachricht ein!");
      return;
    }

    setIsSending(true);
    try {
      // Insert the notification into the notifications table
      const { error } = await supabase.from("push_notifications").insert({
        title: title.trim(),
        body: message.trim(),
        language_code: selectedLanguage.trim(),
      });

      if (error) throw error;

      Alert.alert("Erfolg", "Deine Nachricht wurde erfolgreich verschickt!");
      // Clear the form
      setTitle("");
      setMessage("");
    } catch (error) {
      console.error("Error sending notification:", error);
      Alert.alert("Fehler", "Fehler beim senden. Bitte versuche es erneut!");
    } finally {
      setIsSending(false);
    }
  };

  const LanguageButton: React.FC<{
    code: string;
    label: string;
    selected: boolean;
    onPress: () => void;
  }> = ({ code, label, selected, onPress }) => (
    <TouchableOpacity
      style={[
        styles.langButton,
        selected ? styles.langButtonSelected : styles.langButtonUnselected,
      ]}
      onPress={onPress}
    >
      <Text
        style={selected ? styles.langTextSelected : styles.langTextUnselected}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, Colors[colorScheme].background]}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      enabled
    >
      <ScrollView
        style={styles.scrollStyles}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <ThemedView style={{ flex: 1 }}>
            <ThemedText style={styles.label}>Title</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: Colors[colorScheme].contrast,
                  color: Colors[colorScheme].text,
                  borderWidth: 1,
                  borderColor: Colors[colorScheme].border,
                },
              ]}
              placeholder="Title deiner Nachricht"
              placeholderTextColor={"#888"}
              value={title}
              onChangeText={setTitle}
            />

            <ThemedText style={styles.label}>Message</ThemedText>
            <TextInput
              style={[
                styles.input,
                styles.multilineInput,
                {
                  backgroundColor: Colors[colorScheme].contrast,
                  color: Colors[colorScheme].text,
                  borderColor: Colors[colorScheme].border,
                },
              ]}
              placeholder="Der Nachrichtentext"
              placeholderTextColor={"#888"}
              value={message}
              onChangeText={setMessage}
              multiline
            />
            <View style={styles.langContainer}>
              <LanguageButton
                code="de"
                label="DE"
                selected={selectedLanguage === "de"}
                onPress={() => setSelectedLanguage("de")}
              />
              <LanguageButton
                code="ar"
                label="AR"
                selected={selectedLanguage === "ar"}
                onPress={() => setSelectedLanguage("ar")}
              />
              <LanguageButton
                code="en"
                label="EN"
                selected={selectedLanguage === "en"}
                onPress={() => setSelectedLanguage("en")}
              />
            </View>
            <TouchableOpacity
              style={[
                styles.button,
                (isSending || !hasInternet) && styles.disabled,
              ]}
              onPress={handleSubmit}
              disabled={isSending || !hasInternet}
            >
              <Text style={styles.buttonText}>
                {isSending ? "Wird gesendet..." : "Benachrichtigung senden"}
              </Text>
            </TouchableOpacity>
          </ThemedView>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollStyles: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
  },
  multilineInput: {
    height: 300,
    textAlignVertical: "top",
    borderWidth: 1,
  },
  button: {
    borderWidth: 1,
    borderRadius: 7,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
    backgroundColor: Colors.universal.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
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
  langTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  langTextUnselected: {
    color: Colors.universal.primary,
    fontWeight: "600",
  },
  langContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
});

export default AddPushMessages;
