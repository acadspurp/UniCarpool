import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";
import { auth } from "./firebase";

export async function confirmCampusEmailServerSide() {
  const callable = httpsCallable(functions, "confirmCampusEmail");
  const result = await callable();
  return result.data as { success: boolean; message: string };
}

export async function reloadAuthAfterCampusVerify() {
  await auth.currentUser?.reload();
  return auth.currentUser;
}
