import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
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

export function subscribeProfile(uid: string, cb: (profile: Profile | null) => void) {
  const profileRef = doc(db, "users", uid);
  return onSnapshot(profileRef, (snapshot) => {
    if (!snapshot.exists()) {
      cb(null);
      return;
    }
    cb({ uid, ...(snapshot.data() as Profile) });
  });
}
