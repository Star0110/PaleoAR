import {
  doc,
  updateDoc,
  onSnapshot,
  collection,
} from "firebase/firestore";

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

export const calcularNivel = (
  escaneados,
  total
) => {

  if (
    escaneados >= total &&
    total > 0
  ) {
    return 3;
  }

  if (escaneados >= 3) {
    return 2;
  }

  if (escaneados >= 1) {
    return 1;
  }

  return 0;
};

export const calcularProgreso = (
  escaneados,
  total
) => {

  const nivel =
    calcularNivel(
      escaneados,
      total
    );

  if (nivel === 3) {
    return {
      actual: total,
      siguiente: total,
      porcentaje: 1,
    };
  }

  const siguiente =
    nivel === 0
      ? 1
      : nivel === 1
      ? 3
      : total;

  const base =
    nivel === 0
      ? 0
      : nivel === 1
      ? 1
      : 3;

  const porcentaje =
    (escaneados - base) /
    (siguiente - base);

  return {
    actual: escaneados,
    siguiente,
    porcentaje: Math.min(
      porcentaje,
      1
    ),
  };
};

export const sincronizarNivel =
  async (
    userId,
    escaneados,
    total
  ) => {

    try {

      const nivel =
        calcularNivel(
          escaneados,
          total
        );

      const points =
        escaneados *
        PUNTOS_POR_FOSIL;

      await updateDoc(
        doc(
          db,
          "users",
          userId
        ),
        {
          level: nivel,
          points,
        }
      );

      console.log(
        "Nivel sincronizado"
      );
    }
    catch (error) {

      console.log(
        "Error sincronizando nivel:",
        error
      );
    }
  };

export const subscribeToVisitas = (
  userId,
  callback
) => {


  const registrosRef = collection(
    db,
    "visitas",
    userId,
    "registros"
  );

  return onSnapshot(
    registrosRef,

    (snapshot) => {

      const visitas =
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

      console.log(
        "Escaneados:",
        visitas.length
      );

      callback(visitas);
    },

    (error) => {

      console.log(
        "Error visitas:",
        error
      );

      callback([]);
    }
  );
};