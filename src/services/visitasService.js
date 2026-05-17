import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export const getPlayers = async () => {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((u) => u.role === "user");
};

export const getPlayerVisitas = async (userId) => {
  try {
    const registrosRef = collection(db, "visitas", userId, "registros");
    const snap = await getDocs(registrosRef);
    if (snap.empty) return [];
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.log("Error getPlayerVisitas:", e);
    return [];
  }
};
