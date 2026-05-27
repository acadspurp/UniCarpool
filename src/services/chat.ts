import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { ChatMessage } from "../types/models";

export async function ensureChat(
  chatId: string,
  rideId: string,
  bookingId: string,
  members: string[],
) {
  return setDoc(
    doc(db, "chats", chatId),
    {
      rideId,
      bookingId,
      members,
      lastMessage: "",
      lastMessageAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function sendMessage(chatId: string, senderId: string, text: string) {
  await addDoc(collection(db, "chats", chatId, "messages"), {
    senderId,
    text,
    createdAt: serverTimestamp(),
    readBy: [senderId],
  });
  await setDoc(
    doc(db, "chats", chatId),
    { lastMessage: text, lastMessageAt: serverTimestamp() },
    { merge: true },
  );
}

export function subscribeToChat(chatId: string, cb: (messages: ChatMessage[]) => void) {
  const messagesQuery = query(
    collection(db, "chats", chatId, "messages"),
    orderBy("createdAt", "asc"),
  );
  return onSnapshot(messagesQuery, (snapshot) => {
    cb(snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as ChatMessage) })));
  });
}
