import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../store/authStore";
import { sendMessage, subscribeToChat } from "../services/chat";
import { ChatMessage } from "../types/models";
import { TextField } from "../components/ui/TextField";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { colors } from "../theme/colors";

export function ChatScreen({ route }: any) {
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatId = route.params?.chatId;

  useEffect(() => {
    if (!chatId) return;
    const unsub = subscribeToChat(chatId, setMessages);
    return () => unsub();
  }, [chatId]);

  useEffect(() => {
    if (messages.length === 0) return;
    const timer = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 50);
    return () => clearTimeout(timer);
  }, [messages.length, messages[messages.length - 1]?.id]);

  const onSend = async () => {
    if (!user || !chatId || !text.trim()) return;
    await sendMessage(chatId, user.uid, text.trim());
    setText("");
  };

  return (
    <SafeAreaView style={styles.root} edges={["left", "right", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 56 : 0}
      >
        <View style={styles.messagesWrap}>
          <FlatList
            ref={listRef}
            style={styles.list}
            data={messages}
            keyExtractor={(item, index) => item.id ?? `${index}`}
            contentContainerStyle={[
              styles.listContent,
              messages.length === 0 && styles.listContentEmpty,
            ]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <Text style={styles.empty}>No messages yet. Say hello to coordinate pickup.</Text>
            }
            renderItem={({ item }) => {
              const mine = item.senderId === user?.uid;
              return (
                <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleOther]}>
                  <Text style={[styles.bubbleText, mine && styles.bubbleTextMine]}>{item.text}</Text>
                </View>
              );
            }}
          />
        </View>

        <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TextField
            placeholder="Type a message..."
            value={text}
            onChangeText={setText}
            style={styles.input}
          />
          <PrimaryButton label="SEND" onPress={onSend} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    ...(Platform.OS === "web" ? { minHeight: 0, height: "100%" as const } : {}),
  },
  flex: {
    flex: 1,
    minHeight: 0,
  },
  messagesWrap: {
    flex: 1,
    minHeight: 0,
  },
  list: {
    flex: 1,
    ...(Platform.OS === "web"
      ? {
          overflow: "scroll" as "scroll",
          WebkitOverflowScrolling: "touch",
        }
      : {}),
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    flexGrow: 1,
  },
  listContentEmpty: {
    justifyContent: "center",
  },
  empty: {
    textAlign: "center",
    color: colors.textMuted,
    lineHeight: 20,
    paddingHorizontal: 24,
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  bubbleMine: { alignSelf: "flex-end", backgroundColor: colors.primary },
  bubbleOther: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  bubbleText: { color: colors.text, fontSize: 14 },
  bubbleTextMine: { color: colors.textOnPrimary },
  composer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: { marginBottom: 10 },
});
