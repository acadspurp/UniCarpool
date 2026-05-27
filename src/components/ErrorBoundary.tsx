import { Component, ErrorInfo, PropsWithChildren } from "react";
import { StyleSheet, Text, View } from "react-native";

type State = { error: Error | null };

export class ErrorBoundary extends Component<PropsWithChildren, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("UniCarpool render error:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>{this.state.error.message}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: "100vh" as unknown as number,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f8fafc",
  },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  message: { color: "#334155" },
});
