import { collection, collectionGroup, getDocs } from "firebase/firestore";
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

export const getAdminStats = async () => {
  try {
    const [playersSnap, registrosSnap] = await Promise.all([
      getDocs(collection(db, "users")),
      getDocs(collectionGroup(db, "registros")),
    ]);

    const players = playersSnap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((u) => u.role === "user");

    const dinoCounts = {};
    const playerCounts = {};

    for (const reg of registrosSnap.docs) {
      const userId = reg.ref.parent.parent.id;
      const { targetName } = reg.data();
      playerCounts[userId] = (playerCounts[userId] || 0) + 1;
      if (targetName) dinoCounts[targetName] = (dinoCounts[targetName] || 0) + 1;
    }

    const totalScans = Object.values(dinoCounts).reduce((a, b) => a + b, 0);

    const playerRanking = players
      .map((p) => ({ name: p.name, count: playerCounts[p.id] || 0 }))
      .sort((a, b) => b.count - a.count);

    return {
      totalPlayers: players.length,
      totalScans,
      dinoCounts,
      playerRanking,
    };
  } catch (e) {
    console.log("Error getAdminStats:", e);
    return null;
  }
};
