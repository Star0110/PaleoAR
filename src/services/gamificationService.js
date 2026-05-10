import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

export const NIVELES = [
  {
    nivel: 1,
    nombre: "Recolector Prehistórico",
    requisito: 1,
    icon: "ribbon",
    color: "#15803D",
    descripcion: "Escanea tu primer fósil",
  },
  {
    nivel: 2,
    nombre: "Paleontólogo Junior",
    requisito: 3,
    icon: "search",
    color: "#2563EB",
    descripcion: "Escanea 3 fósiles",
  },
  {
    nivel: 3,
    nombre: "Leyenda del Museo",
    requisito: Infinity,
    icon: "trophy",
    color: "#D97706",
    descripcion: "Escanea todos los fósiles",
  },
];

export const PUNTOS_POR_FOSIL = 100;

export const calcularNivel = (escaneados, total) => {
  if (escaneados >= total && total > 0) return 3;
  if (escaneados >= 3) return 2;
  if (escaneados >= 1) return 1;
  return 0;
};

export const calcularProgreso = (escaneados, total) => {
  const nivel = calcularNivel(escaneados, total);
  if (nivel === 3) return { actual: total, siguiente: total, porcentaje: 1 };
  const siguiente = nivel === 0 ? 1 : nivel === 1 ? 3 : total;
  const base = nivel === 0 ? 0 : nivel === 1 ? 1 : 3;
  const porcentaje = (escaneados - base) / (siguiente - base);
  return { actual: escaneados, siguiente, porcentaje: Math.min(porcentaje, 1) };
};

// Actualiza nivel y puntos del usuario en Firestore si cambió
export const sincronizarNivel = async (userId, escaneados, total) => {
  const nivel = calcularNivel(escaneados, total);
  const points = escaneados * PUNTOS_POR_FOSIL;
  await updateDoc(doc(db, "users", userId), { level: nivel, points });
};

// Listener en tiempo real de visitas del usuario
export const subscribeToVisitas = (userId, callback) => {
  return onSnapshot(doc(db, "visitas", userId), (snap) => {
    if (!snap.exists()) { callback([]); return; }
    const data = snap.data();
    if (Array.isArray(data.registros)) callback(data.registros);
    else callback(Object.values(data));
  });
};
