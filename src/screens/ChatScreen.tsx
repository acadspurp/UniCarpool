import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../store/authStore";
import { sendMessage, subscribeToChat } from "../services/chat";
import { ChatMessage } from "../types/models";
import { TextField } from "../components/ui/TextField";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { colors } from "../theme/colors";

/** Space for docked composer (input + send button + padding). */
const COMPOSER_HEIGHT = 148;

export function ChatScreen({ route }: any) {
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { height: windowHeight } = useWindowDimensions();
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatId = route.params?.chatId;

  const bottomInset = Math.max(insets.bottom, Platform.OS === "web" ? 8 : 12);
  const listBottomPad = COMPOSER_HEIGHT + bottomInset;

  const containerHeight =
    Platform.OS === "web" ? Math.max(windowHeight - headerHeight, 320) : undefined;

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

  const body = (
    <>
      <FlatList
        ref={listRef}
        style={styles.list}
        data={messages}
        keyExtractor={(item, index) => item.id ?? `${index}`}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: listBottomPad },
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

      <View style={[styles.composer, { paddingBottom: bottomInset }]}>
        <TextField
          placeholder="Type a message..."
          value={text}
          onChangeText={setText}
          style={styles.input}
        />
        <PrimaryButton label="SEND" onPress={onSend} />
      </View>
    </>
  );

  if (Platform.OS === "ios") {
    return (
      <KeyboardAvoidingView
        style={[styles.root, containerHeight != null && { height: containerHeight }]}
        behavior="padding"
        keyboardVerticalOffset={headerHeight}
      >
        {body}
      </KeyboardAvoidingView>
    );
  }

  return (
    <View
      style={[
        styles.root,
        containerHeight != null && { height: containerHeight, maxHeight: containerHeight },
      ]}
    >
      {body}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: "hidden",
    position: "relative",
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
    flexGrow: 1,
  },
  listContentEmpty: {
    justifyContent: "center",
    minHeight: 120,
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
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: { marginBottom: 8 },
});
