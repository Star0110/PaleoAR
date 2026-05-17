import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  writeBatch,
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import {
  db,
  storage,
} from "./firebase";

// =========================
// OBTENER DINOSAURIOS
// =========================

export const getDinosaurs = async () => {

  const snapshot =
    await getDocs(
      collection(db, "dinosaurios")
    );

  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
};

// =========================
// ACTUALIZAR DINOSAURIO
// =========================

export const updateDinosaur =
  async (id, fields) => {

    await updateDoc(
      doc(db, "dinosaurios", id),
      fields
    );
  };

// =========================
// SUBIR IMAGEN O VIDEO
// =========================

export const uploadDinosaurMedia =
  async (id, localUri) => {

    try {

      const blob =
        await new Promise(
          (resolve, reject) => {

            const xhr =
              new XMLHttpRequest();

            xhr.onload = () =>
              resolve(xhr.response);

            xhr.onerror = () =>
              reject(
                new Error(
                  "Error leyendo archivo"
                )
              );

            xhr.responseType = "blob";

            xhr.open(
              "GET",
              localUri,
              true
            );

            xhr.send(null);
          }
        );

      const extension =
        localUri
          .split(".")
          .pop()
          ?.toLowerCase() || "jpg";

      // ✅ SIN CARPETAS
      const storageRef =
        ref(
          storage,
          `${id}.${extension}`
        );

      await uploadBytes(
        storageRef,
        blob
      );

      blob.close?.();

      const downloadURL =
        await getDownloadURL(
          storageRef
        );

      return downloadURL;
    }
    catch (e) {

      console.log(
        "Error subiendo archivo:",
        e
      );

      throw e;
    }
  };

// =========================
// RESET ESCANEOS
// SOLO PARA EDITABLES
// CUANDO CAMBIA EL NOMBRE
// =========================

export const resetEditableScans = async (
  editableId,   // editable_uno
  oldNombre,
  newNombre
) => {
  try {
    // 🔥 SOLO EDITABLES
    if (!editableId?.startsWith("editable_")) {
      console.log("No es editable, no se hace reset");
      return;
    }

    // 🔥 si no cambió el nombre
    if (oldNombre?.trim() === newNombre?.trim()) {
      console.log("Nombre no cambió");
      return;
    }

    console.log("🔴 Reset escaneos:", editableId);

    const visitasSnapshot = await getDocs(
      collection(db, "visitas")
    );

    for (const visitaDoc of visitasSnapshot.docs) {
      const userId = visitaDoc.id;

      const registrosRef = collection(
        db,
        "visitas",
        userId,
        "registros"
      );

      const registrosSnap = await getDocs(registrosRef);

      const batch = writeBatch(db);
      let cambios = 0;

      for (const reg of registrosSnap.docs) {

        // 🔥 AQUÍ ESTA EL FIX IMPORTANTE
        if (reg.id === editableId) {
          batch.delete(reg.ref);
          cambios++;

          console.log(
            "🗑 Eliminado:",
            reg.id,
            "user:",
            userId
          );
        }
      }

      if (cambios > 0) {
        await batch.commit();
      }
    }

    console.log("✅ Reset completo");
  } catch (error) {
    console.log("❌ Error resetEditableScans:", error);
  }
};

// =========================
// OBTENER DINOSAURIO
// =========================

export const getDinosaurById =
  async (id) => {

    const refDoc =
      doc(
        db,
        "dinosaurios",
        id
      );

    const snapshot =
      await getDoc(refDoc);

    if (!snapshot.exists())
      return null;

    return {
      id: snapshot.id,
      ...snapshot.data(),
    };
  };