import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  TextInput,
  Alert,
  StyleSheet,
  Text,
  Pressable,
  useColorScheme,
  ActivityIndicator,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Feather from "@expo/vector-icons/Feather";
import { supabase } from "../../utils/supabase";
import { useLocalSearchParams, router } from "expo-router";
import { Colors } from "@/constants/Colors";
import { NoInternet } from "./NoInternet";
import { useConnectionStatus } from "../../hooks/useConnectionStatus";
import { signUpUserPasswordFormat } from "@/constants/messages";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";

const createSchema = (t: TFunction) =>
  z
    .object({
      code: z.string().trim().min(1, t("resetPasswordCodeRequired")),

      newPassword: z
        .string()
        .min(1, t("resetPasswordNewPasswordRequired"))
        .min(8, t("resetPasswordNewPasswordMinLength"))
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=\-\[\]{};\:"\\|'<>?,./~]).{8,}$/,
          signUpUserPasswordFormat
        ),

      confirmPassword: z
        .string()
        .min(1, t("resetPasswordConfirmPasswordRequired"))
        .min(8, t("resetPasswordConfirmPasswordMinLength")),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("resetPasswordPasswordsDoNotMatch"),
      path: ["confirmPassword"],
    });

type ResetPasswordFormValues = z.infer<ReturnType<typeof createSchema>>;

export function ResetPassword() {
  const { t } = useTranslation();
  const schema = useMemo(() => createSchema(t), [t]);

  const params = useLocalSearchParams();
  const email = Array.isArray(params.email) ? params.email[0] : params.email;

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendCount, setResendCount] = useState(0);

  const colorScheme = useColorScheme() || "light";
  const hasInternet = useConnectionStatus();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleUpdatePassword = async (data: ResetPasswordFormValues) => {
    if (!email) {
      Alert.alert(t("errorTitle"), t("resetPasswordEmailRequired"));
      return;
    }

    if (!hasInternet) {
      Alert.alert(
        t("noInternetConnectionTitle"),
        t("noInternetConnectionMessage")
      );
      return;
    }

    try {
      setLoading(true);

      const { data: verifyData, error: verifyError } =
        await supabase.auth.verifyOtp({
          email,
          token: data.code,
          type: "recovery",
        });

      if (verifyError) throw verifyError;

      if (!verifyData.session) {
        throw new Error(t("resetPasswordSessionError"));
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (updateError) throw updateError;
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes("Invalid or expired token")) {
          Alert.alert(t("errorTitle"), t("resetPasswordInvalidOrExpiredCode"));
        } else {
          Alert.alert(t("errorTitle"), error.message);
        }
      } else {
        Alert.alert(t("errorTitle"), t("unexpectedErrorMessage"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendToken = async () => {
    if (!email) {
      Alert.alert(t("errorTitle"), t("resetPasswordEmailRequired"));
      return;
    }

    if (resendCount >= 3) {
      Alert.alert(t("errorTitle"), t("resetPasswordMaxResendReachedMessage"));
      return;
    }

    if (!hasInternet) {
      Alert.alert(
        t("noInternetConnectionTitle"),
        t("noInternetConnectionMessage")
      );
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;

      Alert.alert(t("successTitle"), t("resetPasswordResendSuccessMessage"));
      setResendCount((prev) => prev + 1);
    } catch (error: unknown) {
      if (error instanceof Error) {
        Alert.alert(t("errorTitle"), error.message);
      } else {
        Alert.alert(t("errorTitle"), t("unexpectedErrorMessage"));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "USER_UPDATED") {
        await supabase.auth.signOut();

        Alert.alert(t("successTitle"), t("resetPasswordSuccessMessage"), [
          {
            text: t("ok"),
            onPress: () => router.replace("/login"),
          },
        ]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [t]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.container, Colors[colorScheme].background]}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        enabled
      >
        {!hasInternet && <NoInternet />}

        <Controller
          control={control}
          name="code"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[
                styles.input,
                Colors[colorScheme].contrast,
                Colors[colorScheme].text,
              ]}
              placeholder={t("resetPasswordCodePlaceholder")}
              onChangeText={onChange}
              value={value}
              keyboardType="number-pad"
            />
          )}
        />
        {errors.code && <Text style={styles.error}>{errors.code.message}</Text>}

        <Controller
          control={control}
          name="newPassword"
          render={({ field: { onChange, value } }) => (
            <View
              style={[
                styles.passwordContainer,
                Colors[colorScheme].contrast,
              ]}
            >
              <TextInput
                style={[styles.passwordInput, Colors[colorScheme].text]}
                placeholder={t("resetPasswordNewPasswordPlaceholder")}
                onChangeText={onChange}
                value={value}
                secureTextEntry={!showPassword}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                {showPassword ? (
                  <Feather
                    name="eye"
                    size={24}
                    color={colorScheme === "dark" ? "#fff" : "#000"}
                  />
                ) : (
                  <Feather
                    name="eye-off"
                    size={24}
                    color={colorScheme === "dark" ? "#fff" : "#000"}
                  />
                )}
              </Pressable>
            </View>
          )}
        />
        {errors.newPassword && (
          <Text style={styles.error}>{errors.newPassword.message}</Text>
        )}

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, value } }) => (
            <View
              style={[
                styles.passwordContainer,
                Colors[colorScheme].contrast,
              ]}
            >
              <TextInput
                style={[styles.passwordInput, Colors[colorScheme].text]}
                placeholder={t("resetPasswordConfirmPasswordPlaceholder")}
                onChangeText={onChange}
                value={value}
                secureTextEntry={!showConfirmPassword}
              />
              <Pressable
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                {showConfirmPassword ? (
                  <Feather
                    name="eye"
                    size={24}
                    color={colorScheme === "dark" ? "#fff" : "#000"}
                  />
                ) : (
                  <Feather
                    name="eye-off"
                    size={24}
                    color={colorScheme === "dark" ? "#fff" : "#000"}
                  />
                )}
              </Pressable>
            </View>
          )}
        />
        {errors.confirmPassword && (
          <Text style={styles.error}>{errors.confirmPassword.message}</Text>
        )}

        {loading ? (
          <ActivityIndicator
            style={styles.loadingIndicator}
            color={Colors.universal.primary}
          />
        ) : (
          <Pressable
            disabled={loading || !hasInternet}
            style={({ pressed }) => [
              styles.resetButton,
              pressed && styles.buttonPressed,
              (loading || !hasInternet) && styles.disable,
            ]}
            onPress={handleSubmit(handleUpdatePassword)}
          >
            <Text style={styles.resetButtonText}>
              {t("resetPasswordSubmitButton")}
            </Text>
          </Pressable>
        )}

        <Pressable
          style={styles.resendButton}
          onPress={handleResendToken}
          disabled={resendCount >= 3 || loading || !hasInternet}
        >
          <Text
            style={[
              styles.resendButtonText,
              resendCount >= 3 && styles.disabledButton,
              (loading || !hasInternet) && styles.disable,
            ]}
          >
            {resendCount >= 3
              ? t("resetPasswordResendDisabledText")
              : t("resetPasswordResendButton")}
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  input: {
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderRadius: 6,
  },
  error: {
    color: Colors.universal.error,
    marginBottom: 12,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
  },
  eyeIcon: {
    padding: 10,
  },
  resetButton: {
    marginTop: 5,
    alignSelf: "center",
    padding: 10,
    borderRadius: 7,
    backgroundColor: Colors.universal.primary,
  },
  buttonPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },
  resetButtonText: {
    fontSize: 16,
    color: "#fff",
  },
  resendButton: {
    opacity: 1,
    marginTop: 15,
    alignSelf: "center",
  },
  resendButtonText: {
    fontSize: 16,
    textAlign: "center",
    color: Colors.universal.primary,
    textDecorationLine: "underline",
  },
  disable: {
    opacity: 0.5,
  },
  disabledButton: {
    color: Colors.universal.error,
    textDecorationLine: "none",
    lineHeight: 23,
  },
  loadingIndicator: {
    marginVertical: 16,
  },
});

export default ResetPassword;