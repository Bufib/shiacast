import React, { useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  Pressable,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { router, Stack } from "expo-router";
import { useFetchUserQuestions } from "../../../hooks/useFetchUserQuestions";
import { useAuthStore } from "../../../stores/authStore";
import { formatDate } from "../../../utils/formatDate";
import { Colors } from "../../constants/Colors";
import getStatusColor from "../../../utils/getStatusColor";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { userQuestionErrorLoadingQuestions } from "@/constants/messages";
import { NoInternet } from "@/components/NoInternet";
import { QuestionsFromUserType } from "@/constants/Types";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useConnectionStatus } from "../../../hooks/useConnectionStatus";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { useDataVersionStore } from "../../../stores/dataVersionStore";
import { useQueryClient } from "@tanstack/react-query";

export default function Index() {
  // 1. Check auth state from the store
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const session = useAuthStore.getState().session;
  const userId = session?.user?.id ?? null;
  // Track connection status
  const hasInternet = useConnectionStatus();
  const userQuestionVersion = useDataVersionStore((s) => s.userQuestionVersion);
  const colorScheme = useColorScheme() || "light";
  console.log(userQuestionVersion);
  // 2. If not logged in, redirect to login
  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/(auth)/login");
    }
  }, [isLoggedIn]);

  // 3. Use our hook to fetch data
  const {
    data: questions,
    isLoading,
    refetch,
    isError,
  } = useFetchUserQuestions();

  // /**
  //  * 5. Optionally refetch on screen focus
  //  *    This ensures we always have fresh data when user returns.
  //  */
  // useFocusEffect(
  //   useCallback(() => {
  //     // Only refetch if connected and we have a session
  //     if (hasInternet && session) {
  //       refetch();
  //     }
  //   }, [hasInternet, session])
  // );

  // 6. Render item (memoized for performance)
  const renderQuestion = useCallback(
    ({ item }: { item: QuestionsFromUserType }) => (
      <Pressable
        style={[styles.questionCard, Colors[colorScheme].contrast]}
        onPress={() =>
          router.push({
            pathname: "/(askQuestion)/questionDetailScreen",
            params: { questionId: item.id },
          })
        }
      >
        <ThemedText style={styles.questionTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.questionText} numberOfLines={2}>
          {item.question}
        </ThemedText>
        <View style={styles.questionFooter}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        <Text style={styles.createdAtText}>{formatDate(item.created_at)}</Text>
      </Pressable>
    ),

    [colorScheme],
  );

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <LoadingIndicator size="large" />
        <ThemedText style={styles.loadingText}>{t("loading")}</ThemedText>
      </ThemedView>
    );
  }

  // 8. Show error if fetch fails
  if (isError) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centered}>
          <NoInternet showToast={true} showUI={true} />
          <ThemedText style={styles.errorText}>
            {userQuestionErrorLoadingQuestions}
          </ThemedText>
          <Pressable
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => refetch()}
          >
            <ThemedText style={styles.retryButtonText}>{t("retry")}</ThemedText>
          </Pressable>
        </View>
        <Toast />
      </ThemedView>
    );
  }

  // 9. Main UI
  return (
    <ThemedView
      style={[styles.container, Colors[colorScheme].backgroundColor]}
    >
      {/* If offline, show your "No Internet" banner at top */}
      {!hasInternet && <NoInternet showUI={true} showToast={false} />}

      {/* Show update available button
      {hasUpdate && (
        <Pressable style={styles.updateButton} onPress={handleRefresh}>
          <Text style={styles.updateButtonText}>Aktualisieren</Text>
        </Pressable>
      )} */}

      <Stack.Screen
        options={{
          headerTitle: t("yourQuestions"),
          headerBackButtonMenuEnabled: false,
        }}
      />
      <FlatList
        data={questions}
        renderItem={renderQuestion}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        extraData={userQuestionVersion}
        contentContainerStyle={[
          styles.listContainer,
          questions?.length === 0 && !isLoading && styles.emptyListContainer,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={async () => {
              if (!hasInternet) {
                Toast.show({
                  type: "error",
                  text1: t("noInternetTitle"),
                });
                return;
              }

              await queryClient.invalidateQueries({
                queryKey: ["questionsFromUser", userId],
              });
            }}
          />
        }
        ListEmptyComponent={
          <ThemedView style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
              Du hast noch keine Fragen!
              {"\n"}
              Klicke unten auf den Button um eine zu stellen.
            </ThemedText>
          </ThemedView>
        }
      />

      <Pressable
        style={[styles.askQuestionButton, !hasInternet && styles.disabled]}
        onPress={() => router.push("/(askQuestion)/ask")}
        disabled={!hasInternet}
      >
        <AntDesign name="plus" size={35} color="#fff" />
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: Colors.universal.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    transform: [{ scale: 1 }],
  },
  buttonPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  updateButton: {
    backgroundColor: Colors.universal.link,
    padding: 10,
    margin: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  questionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  questionText: {
    fontSize: 14,
    color: Colors.universal.primary,
    marginBottom: 12,
  },
  questionFooter: {
    alignSelf: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  createdAtText: {
    color: Colors.universal.grayedOut,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
  askQuestionButton: {
    position: "absolute",
    bottom: 80,
    right: 30,
    padding: 15,
    backgroundColor: "#057958",
    borderRadius: 99,
  },
  disabled: {
    opacity: 0.5,
  },
  askQuestionButtonText: {
    fontWeight: "600",
    color: "#fff",
  },
});
