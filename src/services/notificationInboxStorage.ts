import { Platform } from "react-native";

export type NotificationInboxState = {
  readIds: string[];
  deletedIds: string[];
};

const memoryStore = new Map<string, string>();

function storageKey(uid: string) {
  return `unicarpool:notifications:${uid}`;
}

async function getRaw(key: string): Promise<string | null> {
  if (Platform.OS === "web" && typeof localStorage !== "undefined") {
    return localStorage.getItem(key);
  }
  return memoryStore.get(key) ?? null;
}

async function setRaw(key: string, value: string): Promise<void> {
  if (Platform.OS === "web" && typeof localStorage !== "undefined") {
    localStorage.setItem(key, value);
    return;
  }
  memoryStore.set(key, value);
}

export async function loadNotificationInbox(uid: string): Promise<NotificationInboxState> {
  try {
    const raw = await getRaw(storageKey(uid));
    if (!raw) return { readIds: [], deletedIds: [] };
    const parsed = JSON.parse(raw) as NotificationInboxState;
    return {
      readIds: Array.isArray(parsed.readIds) ? parsed.readIds : [],
      deletedIds: Array.isArray(parsed.deletedIds) ? parsed.deletedIds : [],
    };
  } catch {
    return { readIds: [], deletedIds: [] };
  }
}

export async function saveNotificationInbox(
  uid: string,
  state: NotificationInboxState,
): Promise<void> {
  await setRaw(storageKey(uid), JSON.stringify(state));
}
