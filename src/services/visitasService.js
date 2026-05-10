import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export const getPlayers = async () => {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((u) => u.role === "user");
};

export const getPlayerVisitas = async (userId) => {
  const snap = await getDoc(doc(db, "visitas", userId));
  if (!snap.exists()) return [];
  const data = snap.data();
  // Soporta array "registros" o mapa de dinoId -> info
  if (Array.isArray(data.registros)) return data.registros;
  return Object.values(data);
};
