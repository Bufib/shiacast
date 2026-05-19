import React, { ReactNode } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import i18n from "../../utils/i18n";

type Props = {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
};

type State = {
  error: Error | null;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  private reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;

    if (this.props.fallback) {
      return this.props.fallback(this.state.error, this.reset);
    }

    return <DefaultErrorFallback error={this.state.error} reset={this.reset} />;
  }
}

function DefaultErrorFallback({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const title = i18n.t("errorTitle") || "Error";
  const retryLabel = i18n.t("retry") || "Retry";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView style={styles.messageContainer}>
        <Text style={styles.message}>{error.message}</Text>
        {__DEV__ && error.stack ? (
          <Text style={styles.stack}>{error.stack}</Text>
        ) : null}
      </ScrollView>
      <TouchableOpacity
        style={styles.button}
        onPress={reset}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>{retryLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
    marginBottom: 16,
  },
  messageContainer: {
    maxHeight: 240,
    width: "100%",
    marginBottom: 24,
  },
  message: {
    fontSize: 15,
    color: "#444",
    textAlign: "center",
    marginBottom: 12,
  },
  stack: {
    fontSize: 11,
    color: "#888",
    fontFamily: "Menlo",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
