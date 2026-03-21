import React, { useState, useCallback, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  useColorScheme,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { supabase } from "../../utils/supabase";
import { useAuthStore } from "../../stores/authStore";
import { Colors } from "@/constants/Colors";
import { ThemedText } from "@/components/ThemedText";
import { useConnectionStatus } from "../../hooks/useConnectionStatus";
import { DeleteUserModalPropsType } from "@/constants/Types";
import { useTranslation } from "react-i18next";

const API_TIMEOUT = 30000; // 30 seconds
const MAX_ATTEMPTS = 3;
const ATTEMPT_RESET_TIME = 300000; // 5 minutes in milliseconds

const DeleteUserModal: React.FC<DeleteUserModalPropsType> = ({
  isVisible,
  onClose,
  onDeleteSuccess,
  serverUrl,
}) => {
  const colorScheme = useColorScheme();
  const user = useAuthStore((state) => state.session?.user);
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(true);
  const [showPasswordInput, setShowPasswordInput] = useState<boolean>(false);
  const [attemptCount, setAttemptCount] = useState<number>(0);
  const [lastAttemptTime, setLastAttemptTime] = useState<number>(0);
  const hasInternet = useConnectionStatus();
  const { t } = useTranslation();
  // Reset attempt count after timeout
  useEffect(() => {
    if (attemptCount > 0) {
      const now = Date.now();
      if (now - lastAttemptTime > ATTEMPT_RESET_TIME) {
        setAttemptCount(0);
      }
    }
  }, [attemptCount, lastAttemptTime]);

  const fetchWithTimeout = useCallback(
    async (url: string, options: RequestInit) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    },
    []
  );

  const handleProceedToPassword = () => {
    setShowConfirmation(false);
    setShowPasswordInput(true);
  };

  const handleCancel = () => {
    setShowConfirmation(true);
    setShowPasswordInput(false);
    setPassword("");
    setError(null);
    setAttemptCount(0);
    onClose();
  };

  const handleConfirm = async () => {
    // Check rate limiting
    if (attemptCount >= MAX_ATTEMPTS) {
      const timeRemaining = Math.ceil(
        (ATTEMPT_RESET_TIME - (Date.now() - lastAttemptTime)) / 1000
      );
      setError(
        `${t("deleteUserToOftenText")} ${Math.ceil(timeRemaining / 60)} ${t(
          "deleteUserToOftenMinutesAgain"
        )}`
      );
      return;
    }

    setLoading(true);
    setError(null);
    setAttemptCount((prev) => prev + 1);
    setLastAttemptTime(Date.now());

    if (!user?.email) {
      setError(t("deleteUserNotLoggedIn"));
      setLoading(false);
      return;
    }

    try {
      // Re-authenticate using the provided password
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: user.email,
          password,
        });

      if (signInError) {
        if (signInError.message === "Network request failed") {
          setError(t("noInternetTitle"));
        } else {
          setError(signInError.message);
        }

        setLoading(false);
        return;
      }

      // Ensure accessToken is available
      const accessToken = data.session?.access_token;
      if (!accessToken) {
        setError(t("authFailed"));
        setLoading(false);
        return;
      }

      // Make DELETE request to your server with timeout
      const response = await fetchWithTimeout(`${serverUrl}/delete-account`, {
        method: "POST", // Changed to POST as our Edge Function expects POST
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const respJson = await response.json();
        throw new Error(respJson.error || t("errorDeleteAccount"));
      }

      // Handle success
      onDeleteSuccess?.();
      handleCancel();
    } catch (err: any) {
      if (err.name === "AbortError") {
        setError(t("timeOverStepped"));
      } else {
        setError(err.message || t("somethingWentWrong"));
        console.error("Error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContent, Colors[colorScheme].background]}>
          {showConfirmation && (
            <>
              <ThemedText style={styles.title} type="title">
                {t("deleteAccount")}
              </ThemedText>
              <ThemedText style={styles.warningText}>
                {t("deleteAccountConfirmation1")}
              </ThemedText>
              <ThemedText style={styles.warningSubText}>
                {t("deleteAccountConfirmation2")}
              </ThemedText>
              <View style={styles.buttonRow}>
                <Pressable
                  disabled={loading || !hasInternet}
                  style={[
                    styles.button,
                    styles.deleteButton,
                    (loading || !hasInternet) && styles.disabledButton,
                  ]}
                  onPress={handleProceedToPassword}
                >
                  <Text style={styles.buttonTextDelete}>
                    {t("yesDeleteAccount")}
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.button, styles.cancelButton]}
                  onPress={handleCancel}
                >
                  <Text style={styles.buttonTextCancel}>{t("abort")}</Text>
                </Pressable>
              </View>
            </>
          )}

          {showPasswordInput && (
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
              <View>
                <ThemedText style={styles.title} type="title">
                  {t("confirmPassowrdTitle")}
                </ThemedText>
                <ThemedText style={styles.subtitle}>
                  {t("confirmPasswordText")}
                </ThemedText>

                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.passwordInput, Colors[colorScheme].text]}
                    placeholder="Passwort"
                    placeholderTextColor={
                      colorScheme === "dark" ? "#888" : "#666"
                    }
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    autoCapitalize="none"
                  />
                  <Pressable
                    onPress={() => setShowPassword((prev) => !prev)}
                    style={styles.eyeIcon}
                  >
                    <Feather
                      name={showPassword ? "eye" : "eye-off"}
                      size={24}
                      color={colorScheme === "dark" ? "#fff" : "#000"}
                    />
                  </Pressable>
                </View>

                {error && <Text style={styles.error}>{error}</Text>}
                {loading && (
                  <ActivityIndicator
                    size="small"
                    color={Colors.universal.link}
                  />
                )}

                <View style={styles.buttonRow}>
                  <Pressable
                    style={[
                      styles.button,
                      styles.deleteButton,
                      loading || password.length === 0
                        ? styles.disabledButton
                        : null,
                    ]}
                    onPress={handleConfirm}
                    disabled={loading || password.length === 0}
                  >
                    <Text style={styles.buttonTextDelete}>{t("confirm")}</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.button, styles.cancelButton]}
                    onPress={handleCancel}
                    disabled={loading}
                  >
                    <Text style={styles.buttonTextCancel}>{t("abort")}</Text>
                  </Pressable>
                </View>
              </View>
            </TouchableWithoutFeedback>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    padding: 20,
    borderRadius: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 24,
    marginBottom: 15,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: "center",
    opacity: 0.8,
  },
  warningText: {
    fontSize: 16,
    marginBottom: 10,
    color: "#dc3545",
    textAlign: "center",
  },
  warningSubText: {
    fontSize: 14,
    marginBottom: 20,
    opacity: 0.5,
    textAlign: "center",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginVertical: 10,
    paddingHorizontal: 5,
  },
  passwordInput: {
    flex: 1,
    padding: 10,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  error: {
    color: "#dc3545",
    marginBottom: 10,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    gap: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderRadius: 8,
    minWidth: 120,
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
  },
  cancelButton: {
    backgroundColor: "#6c757d",
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonTextDelete: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonTextCancel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default DeleteUserModal;
