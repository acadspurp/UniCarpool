import { useEffect, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import { useAuthStore } from "../store/authStore";
import { sendMessage, subscribeToChat } from "../services/chat";
import { ChatMessage } from "../types/models";
import { TextField } from "../components/ui/TextField";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { colors } from "../theme/colors";

export function ChatScreen({ route }: any) {
  const { user } = useAuthStore();
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatId = route.params?.chatId;

  useEffect(() => {
    if (!chatId) return;
    const unsub = subscribeToChat(chatId, setMessages);
    return () => unsub();
  }, [chatId]);

  const onSend = async () => {
    if (!user || !chatId || !text.trim()) return;
    await sendMessage(chatId, user.uid, text.trim());
    setText("");
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FlatList
        data={messages}
        keyExtractor={(item, index) => item.id ?? `${index}`}
        contentContainerStyle={styles.list}
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
      <View style={styles.composer}>
        <TextField
          placeholder="Type a message..."
          value={text}
          onChangeText={setText}
          style={styles.input}
        />
        <PrimaryButton label="SEND" onPress={onSend} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16, flexGrow: 1 },
  empty: { textAlign: "center", color: colors.textMuted, marginTop: 40, lineHeight: 20 },
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
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: { marginBottom: 10 },
});
