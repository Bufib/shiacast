import React, { useState, useEffect, useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  View,
  Alert,
  Modal,
  FlatList,
  useColorScheme,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { supabase } from "../../../utils/supabase";
import { useAuthStore } from "../../../stores/authStore";
import { Colors } from "@/constants/Colors";
import { router } from "expo-router";
import { askQuestionQuestionSendSuccess } from "@/constants/messages";
import DonationAlert from "@/components/DonationAlert";
import { useConnectionStatus } from "../../../hooks/useConnectionStatus";
import { askQuestionSuggestionsType, QuestionType } from "@/constants/Types";
import { useLanguage } from "../../../contexts/LanguageContext";
import { searchQuestions } from "../../../db/search";
import { useTranslation } from "react-i18next";

/* -------------------------- types -------------------------- */

type QuestionFormData = {
  title: string;
  marja: {
    sistani: boolean;
    khamenei: boolean;
    keineRechtsfrage: boolean;
  };
  question: string;
  age: string;
  gender: {
    männlich: boolean;
    weiblich: boolean;
  };
  username?: string;
};

type SubmitQuestionData = {
  title: string;
  marja: {
    sistani: boolean;
    khamenei: boolean;
    keineRechtsfrage: boolean;
  };
  question: string;
  age: number;
  gender: {
    männlich: boolean;
    weiblich: boolean;
  };
  username?: string;
};

/* -------------------------- helpers -------------------------- */

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

const CustomCheckbox = ({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (newVal: boolean) => void;
}) => (
  <Pressable
    style={styles.marjaContainer}
    onPress={() => onValueChange(!value)}
  >
    <View style={[styles.checkbox, value && styles.checkboxChecked]}>
      {value && <ThemedText style={styles.checkmark}>✓</ThemedText>}
    </View>
    <ThemedText style={styles.checkboxLabel}>{label}</ThemedText>
  </Pressable>
);

const CustomInput = ({
  label,
  error,
  multiline,
  numberOfLines,
  style,
  ...props
}: {
  label: string;
  error?: string;
  multiline?: boolean;
  numberOfLines?: number;
  style?: any;
  [key: string]: any;
}) => (
  <View style={styles.inputContainer}>
    <ThemedText style={styles.label}>{label}</ThemedText>
    <TextInput
      style={[
        styles.input,
        multiline && styles.textArea,
        error && styles.inputError,
        style,
      ]}
      placeholderTextColor="#666"
      numberOfLines={numberOfLines}
      multiline={multiline}
      {...props}
    />
    {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
  </View>
);

function mapToSearchResult(row: QuestionType): askQuestionSuggestionsType {
  return {
    id: row.id,
    title: row.title,
    question: row.question,
    category_name: row.question_category_name,
    subcategory_name: row.question_subcategory_name,
  };
}

/* -------------------------- schema factory -------------------------- */

function createQuestionSchema(t: (key: string) => string) {
  return z.object({
    title: z.string().trim().min(1, t("askQuestion.errors.titleRequired")),

    marja: z
      .object({
        sistani: z.boolean(),
        khamenei: z.boolean(),
        keineRechtsfrage: z.boolean(),
      })
      .refine((val) => val.sistani || val.khamenei || val.keineRechtsfrage, {
        message: t("askQuestion.errors.marjaRequired"),
      }),

    question: z
      .string()
      .trim()
      .min(1, t("askQuestion.errors.questionRequired")),
    age: z
      .string()
      .trim()
      .min(1, t("askQuestion.errors.ageRequired"))
      .refine((val) => /^\d+$/.test(val), {
        message: t("askQuestion.errors.ageRequired"),
      }),

    gender: z
      .object({
        männlich: z.boolean(),
        weiblich: z.boolean(),
      })
      .refine((val) => val.männlich || val.weiblich, {
        message: t("askQuestion.errors.genderRequired"),
      }),

    username: z.string().optional(),
  });
}

/* -------------------------- component -------------------------- */

export default function AskQuestionScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const session = useAuthStore.getState().session;
  const username = useAuthStore.getState().username;
  const hasInternet = useConnectionStatus();
  const [isDonationVisible, setDonationVisible] = useState(false);
  const [showSimilarModal, setShowSimilarModal] = useState(false);
  const [similarQuestions, setSimilarQuestions] = useState<
    askQuestionSuggestionsType[]
  >([]);
  const [pendingFormData, setPendingFormData] =
    useState<SubmitQuestionData | null>(null);

  const { lang } = useLanguage();
  const { t } = useTranslation();

  const QuestionSchema = useMemo(() => createQuestionSchema(t), [t]);
  const colorScheme = useColorScheme() || "light";

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<QuestionFormData>({
    resolver: zodResolver(QuestionSchema),
    defaultValues: {
      title: "",
      marja: {
        sistani: false,
        khamenei: false,
        keineRechtsfrage: false,
      },
      question: "",
      age: "",
      gender: {
        männlich: false,
        weiblich: false,
      },
      username: "",
    },
  });

  const titleValue = watch("title");
  const debouncedTitle = useDebounce(titleValue, 500);

  useEffect(() => {
    let isActive = true;

    const run = async () => {
      if (debouncedTitle && debouncedTitle.trim().length >= 3) {
        try {
          const result = await searchQuestions(lang, debouncedTitle, {
            limit: 20,
            offset: 0,
          });

          if (!isActive) return;

          const mapped = result.rows.map(mapToSearchResult);
          setSimilarQuestions(mapped);
        } catch (err) {
          console.error("Debounced search error:", err);
          if (isActive) setSimilarQuestions([]);
        }
      } else {
        if (isActive) setSimilarQuestions([]);
      }
    };

    run();

    return () => {
      isActive = false;
    };
  }, [debouncedTitle, lang]);

  async function submitQuestion(data: SubmitQuestionData) {
    if (!session?.user.id) {
      setError(t("askQuestion.mustBeLoggedIn"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let selectedMarja = "Keine Rechtsfrage";
      if (data.marja.sistani) selectedMarja = "Sayid as-Sistani";
      else if (data.marja.khamenei) selectedMarja = "Sayid al-Khamenei";

      let selectedGender = "";
      if (data.gender.männlich) selectedGender = "Männlich";
      else if (data.gender.weiblich) selectedGender = "Weiblich";

      const { error: submissionError } = await supabase
        .from("user_questions")
        .insert([
          {
            user_id: session.user.id,
            username: data.username ?? username,
            title: data.title,
            marja: selectedMarja,
            question: data.question,
            age: data.age,
            gender: selectedGender,
          },
        ]);

      if (submissionError) throw submissionError;

      reset();
      askQuestionQuestionSendSuccess();
      setDonationVisible(true);
    } catch (err: any) {
      setError(err.message);
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  const handleAskQuestion = async (formData: QuestionFormData) => {
    if (!hasInternet) {
      Alert.alert(
        t("askQuestion.noInternetTitle"),
        t("askQuestion.noInternetMessage"),
      );
      return;
    }

    const submitData: SubmitQuestionData = {
      ...formData,
      age: Number(formData.age),
    };

    try {
      const result = await searchQuestions(lang, submitData.title, {
        limit: 20,
        offset: 0,
      });

      const mapped = result.rows.map(mapToSearchResult);

      if (mapped.length > 0) {
        setSimilarQuestions(mapped);
        setPendingFormData(submitData);
        setShowSimilarModal(true);
      } else {
        submitQuestion(submitData);
      }
    } catch (err: any) {
      console.error("Search error:", err);
      submitQuestion(submitData);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, Colors[colorScheme].background]}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      enabled
    >
      <ScrollView
        style={styles.scrollViewStyle}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {error && (
          <ThemedView style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </ThemedView>
        )}

        <View style={[styles.formContainer, Colors[colorScheme].contrast]}>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <CustomInput
                label={t("askQuestion.titleLabel")}
                value={value}
                onChangeText={onChange}
                error={errors.title?.message}
                placeholder={t("askQuestion.titlePlaceholder")}
                style={Colors[colorScheme].text}
                autoCapitalize="none"
                autoCorrect={true}
              />
            )}
          />

          <View style={styles.checkBoxContainer}>
            <ThemedText style={styles.label}>
              {t("askQuestion.marjaLabel")}
            </ThemedText>

            <Controller
              control={control}
              name="marja"
              render={({ field: { onChange, value } }) => (
                <View>
                  <CustomCheckbox
                    label={t("askQuestion.marjaSistani")}
                    value={value.sistani}
                    onValueChange={() =>
                      onChange({
                        sistani: true,
                        khamenei: false,
                        keineRechtsfrage: false,
                      })
                    }
                  />
                  <CustomCheckbox
                    label={t("askQuestion.marjaKhamenei")}
                    value={value.khamenei}
                    onValueChange={() =>
                      onChange({
                        sistani: false,
                        khamenei: true,
                        keineRechtsfrage: false,
                      })
                    }
                  />
                  <CustomCheckbox
                    label={t("askQuestion.marjaNoFiqh")}
                    value={value.keineRechtsfrage}
                    onValueChange={() =>
                      onChange({
                        sistani: false,
                        khamenei: false,
                        keineRechtsfrage: true,
                      })
                    }
                  />
                  {errors.marja?.message && (
                    <ThemedText style={styles.errorText}>
                      {errors.marja.message}
                    </ThemedText>
                  )}
                </View>
              )}
            />
          </View>

          <Controller
            control={control}
            name="question"
            render={({ field: { onChange, value } }) => (
              <CustomInput
                label={t("askQuestion.questionLabel")}
                value={value}
                onChangeText={onChange}
                error={errors.question?.message}
                multiline
                numberOfLines={4}
                placeholder={t("askQuestion.questionPlaceholder")}
                style={Colors[colorScheme].text}
                autoCapitalize="none"
                autoCorrect={true}
              />
            )}
          />

          <Controller
            control={control}
            name="age"
            render={({ field: { onChange, value } }) => (
              <CustomInput
                label={t("askQuestion.ageLabel")}
                value={value ?? ""}
                onChangeText={(txt: string) => onChange(txt)}
                keyboardType="numeric"
                error={errors.age?.message}
                placeholder={t("askQuestion.agePlaceholder")}
                style={Colors[colorScheme].text}
              />
            )}
          />

          <View>
            <ThemedText style={styles.label}>
              {t("askQuestion.genderLabel")}
            </ThemedText>

            <Controller
              control={control}
              name="gender"
              render={({
                field: {
                  onChange,
                  value = { männlich: false, weiblich: false },
                },
              }) => (
                <View>
                  <CustomCheckbox
                    label={t("askQuestion.genderMale")}
                    value={value.männlich}
                    onValueChange={() =>
                      onChange({
                        männlich: true,
                        weiblich: false,
                      })
                    }
                  />
                  <CustomCheckbox
                    label={t("askQuestion.genderFemale")}
                    value={value.weiblich}
                    onValueChange={() =>
                      onChange({
                        männlich: false,
                        weiblich: true,
                      })
                    }
                  />
                  {errors.gender?.message && (
                    <ThemedText style={styles.errorText}>
                      {errors.gender.message}
                    </ThemedText>
                  )}
                </View>
              )}
            />
          </View>
        </View>

        <Pressable
          style={[
            styles.submitButton,
            (loading || !hasInternet) && styles.disabledButton,
          ]}
          onPress={handleSubmit(handleAskQuestion)}
          disabled={loading || !hasInternet}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <ThemedText style={styles.submitButtonText}>
              {t("askQuestion.submitButton")}
            </ThemedText>
          )}
        </Pressable>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent
        visible={showSimilarModal}
        onRequestClose={() => setShowSimilarModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, Colors[colorScheme].contrast]}>
            <ThemedText style={styles.modalTitle}>
              {t("askQuestion.similarModalTitle")}
            </ThemedText>

            <FlatList
              data={similarQuestions}
              keyExtractor={(item) => item.id.toString()}
              style={styles.modalScroll}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.modalQuestionItem}
                  onPress={() => {
                    setShowSimilarModal(false);
                    router.push({
                      pathname: "/questionDetailScreen",
                      params: {
                        category: item.category_name,
                        subcategory: item.subcategory_name,
                        questionId: item.id.toString(),
                        questionTitle: item.title,
                      },
                    });
                  }}
                >
                  <ThemedText style={styles.modalQuestionTitle}>
                    {item.title}
                  </ThemedText>
                  <ThemedText
                    style={styles.modalQuestionText}
                    numberOfLines={2}
                  >
                    {item.question}
                  </ThemedText>
                </Pressable>
              )}
            />

            <View style={styles.modalButtonContainer}>
              <Pressable
                style={styles.modalButtonCancel}
                onPress={() => {
                  setShowSimilarModal(false);
                  setPendingFormData(null);
                }}
              >
                <ThemedText style={styles.modalButtonText}>
                  {t("askQuestion.modalCancel")}
                </ThemedText>
              </Pressable>

              <Pressable
                style={styles.modalButtonSubmit}
                onPress={() => {
                  if (pendingFormData) {
                    submitQuestion(pendingFormData);
                    setPendingFormData(null);
                  }
                  setShowSimilarModal(false);
                }}
              >
                <ThemedText style={styles.modalButtonText}>
                  {t("askQuestion.modalSubmitAnyway")}
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <DonationAlert
        isVisible={isDonationVisible}
        onClose={() => {
          setDonationVisible(false);
          router.replace("/home");
        }}
      />
    </KeyboardAvoidingView>
  );
}

/* -------------------------- styles -------------------------- */

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  scrollViewStyle: { flex: 1, paddingTop: 20 },
  scrollViewContent: {},
  errorContainer: {
    backgroundColor: "#FFE5E5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: { color: Colors.universal.error, fontSize: 14 },
  formContainer: {
    flex: 1,
    borderWidth: 1,
    padding: 10,
    borderRadius: 20,
  },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  inputContainer: { marginBottom: 16 },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#888",
  },
  textArea: {
    height: 120,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: "top",
  },
  inputError: { borderColor: Colors.universal.error },
  checkBoxContainer: { marginBottom: 16 },
  marjaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#057958",
    borderRadius: 4,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: { backgroundColor: "#057958" },
  checkmark: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  checkboxLabel: { fontSize: 16 },
  submitButton: {
    backgroundColor: "#057958",
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 40,
  },
  disabledButton: { opacity: 0.5 },
  submitButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    borderRadius: 12,
    padding: 20,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 15,
    textAlign: "center",
    color: Colors.universal.primary,
  },
  modalScroll: {
    maxHeight: 250,
    marginBottom: 20,
  },
  modalQuestionItem: {
    marginBottom: 15,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  modalQuestionTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 5,
  },
  modalQuestionText: {
    fontSize: 14,
    color: "#666",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  modalButtonCancel: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#888",
    justifyContent: "center",
  },
  modalButtonSubmit: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#057958",
    justifyContent: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
    textAlign: "center",
  },
});
