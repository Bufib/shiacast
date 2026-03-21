
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Pressable,
  useColorScheme,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Feather from "@expo/vector-icons/Feather";
import { supabase } from "../../../utils/supabase";
import { useAuthStore } from "../../../stores/authStore";
import { ThemedText } from "@/components/ThemedText";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { Colors } from "@/constants/Colors";
import { useConnectionStatus } from "../../../hooks/useConnectionStatus";
import useNotificationStore from "../../../stores/notificationStore";
import { useTranslation } from "react-i18next";
import i18n from "../../../utils/i18n";

// Login data schema
// ✅ Zod v4 login schema
const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { error: i18n.t("pleaseEnterEmail") }) // empty => "please enter email"
    .pipe(z.email({ error: i18n.t("pleaseEnterValidEmail") })), // invalid => "please enter valid email"

  password: z.string().min(1, { error: i18n.t("pleaseEnterPassword") }), // empty => "please enter password"
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const colorScheme = useColorScheme() || "light";
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
    reset,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const hasInternet = useConnectionStatus();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  const onSubmit = async (formData: LoginFormValues) => {
    if (!hasInternet) {
      Alert.alert(t("noInternetConnection"), t("checkInternet"));
      return;
    }
    const { email, password } = getValues();
    await loginWithSupabase(email, password);
  };

  async function loginWithSupabase(email: string, password: string) {
    if (isLoggedIn) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          Alert.alert(t("loginFailed"), t("invalidCredentials"));
        } else if (error.message.includes("User not found")) {
          Alert.alert(t("loginFailed"), t("userNotFound"));
        } else if (error.message.includes("Email not confirmed")) {
          Alert.alert(t("loginFailed"), t("emailNotConfirmed"));
        } else {
          Alert.alert(t("loginFailed"), error.message);
        }
        return;
      }

      // ✅ Success
      const notificationStore = useNotificationStore.getState();
      if (notificationStore.permissionStatus === "undetermined") {
        await notificationStore.toggleGetNotifications();
      }

      reset();
      Toast.show({
        type: "success",
        text1: t("loginSuccess"),
        text1Style: { fontSize: 14, fontWeight: "600" },
        topOffset: 60,
      });

      router.replace("/(askQuestion)");
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(t("loginFailed"), error.message);
      } else {
        Alert.alert(t("loginFailed"), t("loginErrorGeneric"));
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, Colors[colorScheme].background]}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      enabled
    >
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        overScrollMode="never"
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formWrapper}>
          <View style={[styles.contentContainer, Colors[colorScheme].contrast]}>
            <ThemedText style={styles.title} type="title">
              {t("login")}
            </ThemedText>

            {/* EMAIL FIELD */}
            <View style={styles.inputWrapper}>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, { color: Colors[colorScheme].text }]}
                    placeholder={t("emailPlaceholder")}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.email && (
                <Text style={styles.error}>{errors.email.message}</Text>
              )}
            </View>

            {/* PASSWORD FIELD */}
            <View style={styles.inputWrapper}>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={[
                        styles.passwordInput,
                        { color: Colors[colorScheme].text },
                      ]}
                      placeholder={t("passwordPlaceholder")}
                      secureTextEntry={!showPassword}
                      onChangeText={onChange}
                      value={value}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="off"
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
                )}
              />
              {errors.password && (
                <Text style={styles.error}>{errors.password.message}</Text>
              )}
            </View>

            {/* FORGOT PASSWORD */}
            <View style={styles.forgotPasswordContainer}>
              <Pressable
                onPress={() => router.replace("/forgotPassword")}
                style={styles.forgotPasswordButton}
              >
                <ThemedText style={{ textDecorationLine: "underline" }}>
                  {t("forgotPassword")}
                </ThemedText>
              </Pressable>
            </View>

            {/* LOGIN BUTTON */}
            <View style={{ flexDirection: "column", gap: 3, marginTop: 10 }}>
              <Pressable
                style={[
                  styles.buttonContainer,
                  (isLoading || !hasInternet) && styles.disabled,
                ]}
                onPress={handleSubmit(onSubmit)}
                disabled={isLoading || !hasInternet}
              >
                <Text style={[styles.buttonText, { color: "#fff" }]}>
                  {isLoading ? t("loadingButton") : t("loginButton")}
                </Text>
              </Pressable>

              {/* SIGNUP BUTTON */}
              <Pressable
                style={[
                  styles.buttonContainer,
                  { backgroundColor: "transparent", borderColor: "#057958" },
                ]}
                onPress={() => router.replace("/signup")}
              >
                <ThemedText
                  style={[
                    styles.buttonText,
                    { fontSize: 16, textDecorationLine: "underline" },
                  ]}
                >
                  {t("signupNow")}
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 20,
  },
  formWrapper: {
    flex: 1,
    justifyContent: "center",
    minHeight: Platform.OS === "ios" ? 500 : 450,
  },
  inputWrapper: {
    marginBottom: 8,
  },
  contentContainer: {
    borderWidth: 1,
    padding: 20,
    borderRadius: 12,
    minHeight: 400,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
    fontSize: 20,
  },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  error: {
    color: Colors.universal.error,
    marginBottom: 12,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
  },
  eyeIcon: {
    padding: 10,
  },
  forgotPasswordContainer: {
    marginBottom: 10,
    alignSelf: "flex-end",
  },
  buttonContainer: {
    width: "100%",
    backgroundColor: "#057958",
    alignSelf: "center",
    justifyContent: "center",
    borderRadius: 7,
  },
  buttonText: {
    fontSize: 18,
    padding: 10,
    textAlign: "center",
  },
  disabled: {
    opacity: 0.5,
  },
  forgotPasswordButton: {},
  stayLoggedInText: {
    marginLeft: 8,
    fontSize: 16,
  },
});
