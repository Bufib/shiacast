
import React, { useRef, useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Feather from "@expo/vector-icons/Feather";
import ConfirmHcaptcha from "@hcaptcha/react-native-hcaptcha";
import { supabase } from "../../../utils/supabase";
import { router } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import Toast from "react-native-toast-message";
import { useConnectionStatus } from "../../../hooks/useConnectionStatus";
import { useLanguage } from "../../../contexts/LanguageContext";
import { SignUpFormValues } from "@/constants/Types";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/Colors";

// Max verification attempts for entering the code
const MAX_VERIFICATION_ATTEMPTS = 3;
// Max resend attempts to get a new code
const MAX_RESEND_ATTEMPTS = 3;

// hCaptcha constants
const HCAPTCHA_SITE_KEY = "46059823-5a16-4179-98ac-347075bcf465";
const HCAPTCHA_BASE_URL = "https://hcaptcha.com";

export default function SignUpScreen() {
  const { t } = useTranslation();

  // Create schema inside component to use t()
  const schema = useMemo(
    () =>
      z
        .object({
          username: z
            .string()
            .trim()
            .min(1, { error: t("signUpUsernameNotEmpty") })
            .min(3, { error: t("signUpUserNameMin") })
            .regex(/^[a-zA-Z0-9_-]+$/, {
              error: t("signUpUsernameInvalidChars"),
            }),

          email: z
            .string()
            .trim()
            .min(1, { error: t("signUpEmailNotEmpty") })
            .pipe(z.email({ error: t("signUpEmailInvalid") })),

          password: z
            .string()
            .min(1, { error: t("signUpPasswordNotEmpty") })
            .min(8, { error: t("signUpUserPasswordMin") })
            .regex(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=\-\[\]{};\:"\\|'<>?,./~]).{8,}$/,
              { error: t("signUpUserPasswordFormat") },
            ),

          confirmPassword: z
            .string()
            .min(1, { error: t("signUpPasswordNotEmpty") })
            .min(8, { error: t("signUpUserPasswordMin") }),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: t("signUpUserPasswordConformation"),
          path: ["confirmPassword"],
        }),
    [t],
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(schema),
  });

  // Theming
  const colorScheme = useColorScheme();
  const { lang } = useLanguage();
  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // hCaptcha ref
  const captchaRef = useRef<ConfirmHcaptcha | null>(null);
  const hasInternet = useConnectionStatus();

  // Email verification
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [currentUsername, setCurrentUsername] = useState("");
  const [customErrors, setCustomErrors] = useState({
    username: "",
    email: "",
  });

  // Track verification attempts
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  // Track resend attempts
  const [resendAttempts, setResendAttempts] = useState(0);

  // Reset custom errors when inputs change
  useEffect(() => {
    setCustomErrors({ username: "", email: "" });
  }, [control._formValues.username, control._formValues.email]);

  // Listen for Supabase auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        try {
          if (!currentEmail || !currentUsername) {
            console.log("Missing email or username, waiting for data...");
            return;
          }

          // Insert user into database
          const { error: userError } = await supabase.from("users").insert([
            {
              user_id: session.user.id,
              username: currentUsername,
              email: currentEmail,
            },
          ]);

          if (userError) {
            console.error("Error inserting user:", userError);
            Alert.alert(t("signUpErrorGeneral"), userError.message);
            return;
          }

          // ✅ Sign out immediately to prevent auth store from trying to fetch
          // The user will log in on the next screen
          await supabase.auth.signOut();

          setShowVerificationModal(false);
          Toast.show({
            type: "success",
            text1: t("registrationSuccessToast"),
            text1Style: { fontSize: 14, fontWeight: "600" },
            topOffset: 60,
          });
          router.replace("/login");
        } catch (error) {
          console.error("Error in auth state change:", error);
          Alert.alert(t("signUpErrorGeneral"), t("errorGeneral"));
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [currentEmail, currentUsername, t]);

  /**
   *  Reset attempts (verification & resend) whenever the modal closes and reset TextInput
   */
  useEffect(() => {
    if (!showVerificationModal) {
      setVerificationAttempts(0);
      setResendAttempts(0);
      setVerificationCode("");
    }
  }, [showVerificationModal]);

  /** Check if username or email exists */
  const checkUserExists = async (username: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("username, email")
        .or(`username.ilike.${username},email.ilike.${email}`);

      if (error) {
        Alert.alert(t("signUpErrorGeneral"), error.message);
        return { usernameExists: false, emailExists: false };
      }

      const usernameExists = data.some((user) => user.username === username);
      const emailExists = data.some((user) => user.email === email);

      return { usernameExists, emailExists };
    } catch (error: any) {
      Alert.alert(t("signUpErrorGeneral"), error.message);
      return { usernameExists: false, emailExists: false };
    }
  };

  /**
   *  Main function that checks network & user existence, then shows captcha
   */
  const handleSignup = async (formData: SignUpFormValues) => {
    setIsLoading(true);
    setCustomErrors({ username: "", email: "" });
    try {
      // 1) Check network
      if (!hasInternet) {
        Alert.alert(t("noInternetHeader"), t("noInternetBody"));
        setIsLoading(false);
        return;
      }

      // 2) Check username/email duplicates
      const { usernameExists, emailExists } = await checkUserExists(
        formData.username,
        formData.email,
      );

      if (usernameExists || emailExists) {
        setCustomErrors({
          username: usernameExists ? t("signUpUserNameAlreadyInUsage") : "",
          email: emailExists ? t("signUpUserEmailAlreadyInUsage") : "",
        });
        setIsLoading(false);
        return;
      }

      // 3) All good → launch hCaptcha
      formDataRef.current = formData; // stash for later
      captchaRef.current?.show();
    } catch (error: any) {
      Alert.alert(t("signUpErrorGeneral"), error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // We'll keep the last‐valid formData around so that after hCaptcha returns a token,
  // we have username/email/password to call Supabase.signUp().
  const formDataRef = useRef<SignUpFormValues | null>(null);

  /** Actual Supabase signup function after captcha success */
  const signUpWithSupabase = async (
    username: string,
    email: string,
    password: string,
    captchaToken: string,
  ) => {
    try {
      setIsLoading(true);

      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username },
            captchaToken,
          },
        });

      if (signUpError) {
        Alert.alert(t("signUpErrorGeneral"), signUpError.message);
        return;
      }

      if (signUpData.user) {
        setCurrentEmail(email);
        setCurrentUsername(username);
        setShowVerificationModal(true);
      }
    } catch (error: any) {
      Alert.alert(t("signUpErrorGeneral"), error.message);
    } finally {
      setIsLoading(false);
    }
  };

  /** Handle final email verification */
  const handleVerification = async () => {
    if (verificationAttempts >= MAX_VERIFICATION_ATTEMPTS) {
      Alert.alert(t("tooManyAttemptsTitle"), t("tooManyAttemptsMessage"), [
        {
          text: t("cancelButton"),
          style: "cancel",
          onPress: () => setShowVerificationModal(false),
        },
        {
          text: t("resendCodeButton"),
          onPress: resendVerificationCode,
        },
      ]);
      return;
    }
    setVerificationAttempts((prev) => prev + 1);

    const TIMEOUT = 60000; // 60 sek
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Verification timeout")), TIMEOUT),
    );

    try {
      setIsLoading(true);
      await Promise.race([
        timeoutPromise,
        (async () => {
          const { error } = await supabase.auth.verifyOtp({
            email: currentEmail,
            token: verificationCode,
            type: "signup",
          });
          if (error) throw new Error(error.message);
        })(),
      ]);
    } catch (error: any) {
      if (error.message === "Verification timeout") {
        Alert.alert(t("errorTitle"), t("verificationTimeoutMessage"));
      } else {
        Alert.alert(t("signUpErrorGeneral"), error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  /** Resend email verification code */
  const resendVerificationCode = async () => {
    if (resendAttempts >= MAX_RESEND_ATTEMPTS) {
      Alert.alert(t("errorTitle"), t("maxResendAttemptsMessage"));
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: currentEmail,
      });
      if (error) throw error;
      setResendAttempts((prev) => prev + 1);
      Alert.alert(t("successTitle"), t("codeResentMessage"));
    } catch (error: any) {
      Alert.alert(t("errorTitle"), error.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * hCaptcha callback: use the new `event.success`, `event.markUsed()`, and `event.reset()` patterns.
   */
  const onCaptchaMessage = async (event: any) => {
    if (!event || !event.nativeEvent || !event.nativeEvent.data) {
      return;
    }

    const data = event.nativeEvent.data;

    // 1) When widget is open
    if (data === "open") {
      return;
    }

    // 2) When having a token
    if (event.success) {
      const token = data;
      captchaRef.current?.hide();
      event.markUsed();

      const latestForm = formDataRef.current;
      if (latestForm) {
        await signUpWithSupabase(
          latestForm.username,
          latestForm.email,
          latestForm.password,
          token,
        );
      }
      return;
    }

    // 3) When challenge is expired
    if (data === "challenge-expired") {
      event.reset();
      return;
    }

    // 4) Else && cancel
    captchaRef.current?.hide();
    setTimeout(() => {
      Alert.alert(t("errorTitle"), t("cancelCaptcha"));
    }, 100);
  };

  /** onSubmit Handler: validate form → hCaptcha starten */
  const onSubmit = async (formData: SignUpFormValues) => {
    handleSignup(formData);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, Colors[colorScheme].background]}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      enabled
    >
      <ScrollView
        style={styles.scrollViewContainer}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={[styles.contentContainer, Colors[colorScheme].contrast]}>
          <ThemedText style={styles.title} type="subtitle">
            {t("signupTitle")}
          </ThemedText>

          {/* Username Field */}
          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, Colors[colorScheme].text]}
                placeholder={t("usernamePlaceholder")}
                placeholderTextColor="gray"
                onChangeText={onChange}
                value={value}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
              />
            )}
          />
          {(errors.username || customErrors.username) && (
            <Text style={styles.error}>
              {errors.username?.message || customErrors.username}
            </Text>
          )}

          {/* Email Field */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, Colors[colorScheme].text]}
                placeholder={t("emailPlaceholder")}
                placeholderTextColor="gray"
                onChangeText={onChange}
                value={value}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            )}
          />
          {(errors.email || customErrors.email) && (
            <Text style={styles.error}>
              {errors.email?.message || customErrors.email}
            </Text>
          )}

          {/* Password Field */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.passwordInput, Colors[colorScheme].text]}
                  placeholder={t("passwordPlaceholder")}
                  placeholderTextColor="gray"
                  onChangeText={onChange}
                  value={value}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="new-password"
                  textContentType="newPassword"
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

          {/* Confirm Password Field */}
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.passwordInput, Colors[colorScheme].text]}
                  placeholder={t("confirmPasswordPlaceholder")}
                  placeholderTextColor="gray"
                  onChangeText={onChange}
                  value={value}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="off"
                  textContentType="none"
                />
                <Pressable
                  onPress={() => setShowConfirmPassword((prev) => !prev)}
                  style={styles.eyeIcon}
                >
                  <Feather
                    name={showConfirmPassword ? "eye" : "eye-off"}
                    size={24}
                    color={colorScheme === "dark" ? "#fff" : "#000"}
                  />
                </Pressable>
              </View>
            )}
          />
          {errors.confirmPassword && (
            <Text style={styles.error}>{errors.confirmPassword.message}</Text>
          )}

          {/* Sign-Up Button */}
          {isLoading ? (
            <ActivityIndicator />
          ) : (
            <Pressable
              style={styles.signUpButton}
              disabled={isLoading}
              onPress={handleSubmit(onSubmit)}
            >
              <ThemedText style={styles.signUpText}>
                {t("registerButton")}
              </ThemedText>
            </Pressable>
          )}

          {/* Link to Login */}
          <View style={styles.logInContainer}>
            <Pressable onPress={() => router.replace("/login")}>
              <ThemedText style={styles.loginText}>
                {t("alreadyHaveAccount")}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Always render hCaptcha; we call `.show()` when needed */}
      <ConfirmHcaptcha
        ref={captchaRef}
        siteKey={HCAPTCHA_SITE_KEY}
        baseUrl={HCAPTCHA_BASE_URL}
        languageCode={lang}
        onMessage={onCaptchaMessage}
        size="invisible"
      />

      {/* Email Verification Modal */}
      <Modal
        visible={showVerificationModal}
        transparent={true}
        animationType="fade"
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, Colors[colorScheme].contrast]}>
              <ThemedText style={styles.modalTitle}>
                {t("emailVerificationTitle")}
              </ThemedText>
              <ThemedText style={[styles.modalSubtitle, { fontWeight: 500 }]}>
                {t("emailVerificationSubtitle", { email: currentEmail })}
              </ThemedText>
              <ThemedText
                style={[
                  styles.modalSubtitle,
                  {
                    fontStyle: "italic",
                    fontWeight: 300,
                  },
                ]}
              >
                {t("emailVerificationNote")}
              </ThemedText>
              <TextInput
                style={[styles.input, Colors[colorScheme].text]}
                placeholder={t("verificationCodePlaceholder")}
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="number-pad"
                autoCapitalize="none"
              />
              {isLoading ? (
                <ActivityIndicator style={styles.modalButton} />
              ) : (
                <View style={styles.modalButtonsContainer}>
                  <Pressable
                    style={styles.verifyButton}
                    onPress={handleVerification}
                  >
                    <Text style={styles.verifiyText}>{t("verifyButton")}</Text>
                  </Pressable>
                  <View style={styles.buttonSpacer} />
                  <Pressable
                    onPress={() => setShowVerificationModal(false)}
                    style={[styles.verifyButton, { backgroundColor: "gray" }]}
                  >
                    <Text style={styles.verifiyText}>{t("cancelButton")}</Text>
                  </Pressable>

                  <View style={styles.buttonSpacer} />
                  <Pressable
                    onPress={resendVerificationCode}
                    style={styles.resendButton}
                  >
                    <ThemedText style={styles.resendText}>
                      {t("resendCodeButton")}
                    </ThemedText>
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  contentContainer: {
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 50,
    borderRadius: 20,
  },
  title: {
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
  },
  error: {
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
  signUpButton: {
    width: "100%",
    backgroundColor: "#057958",
    alignSelf: "center",
    justifyContent: "center",
    borderRadius: 7,
  },
  signUpText: {
    color: "#fff",
    fontSize: 18,
    padding: 10,
    textAlign: "center",
  },
  logInContainer: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    fontSize: 16,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  modalButtonsContainer: {
    flexDirection: "column",
    marginTop: 16,
    gap: 5,
  },
  verifyButton: {
    width: "100%",
    backgroundColor: "#057958",
    alignSelf: "center",
    justifyContent: "center",
    borderRadius: 7,
  },
  verifiyText: {
    color: "#fff",
    fontSize: 18,
    padding: 10,
    textAlign: "center",
  },
  resendButton: {
    alignSelf: "flex-end",
  },
  resendText: {
    textDecorationLine: "underline",
  },
  buttonSpacer: {
    width: 16,
  },
  modalButton: {
    marginTop: 16,
  },
});
