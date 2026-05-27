import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { Profile } from "../types/models";

export async function createOrUpdateProfile(userData: Partial<Profile> & { uid: string }) {
  const profileRef = doc(db, "users", userData.uid);
  return setDoc(
    profileRef,
    {
      ...userData,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
}
