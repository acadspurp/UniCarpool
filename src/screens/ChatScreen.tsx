import { useEffect, useState } from "react";
import { Button, FlatList, Text, TextInput, View } from "react-native";
import { ScreenContainer } from "../components/ScreenContainer";
import { useAuthStore } from "../store/authStore";
import { sendMessage, subscribeToChat } from "../services/chat";
import { ChatMessage } from "../types/models";

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
    <ScreenContainer>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => item.id ?? `${index}`}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 6 }}>
            <Text style={{ fontWeight: item.senderId === user?.uid ? "700" : "400" }}>
              {item.text}
            </Text>
          </View>
        )}
      />
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Type message..."
        style={{ borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, padding: 10 }}
      />
      <Button title="Send" onPress={onSend} />
    </ScreenContainer>
  );
}
