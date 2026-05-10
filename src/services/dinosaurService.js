import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";

export const getDinosaurs = async () => {
  const snapshot = await getDocs(collection(db, "dinosaurios"));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const updateDinosaur = async (id, fields) => {
  await updateDoc(doc(db, "dinosaurios", id), fields);
};

export const uploadDinosaurImage = async (id, localUri) => {
  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => resolve(xhr.response);
    xhr.onerror = () => reject(new Error("Error al leer la imagen"));
    xhr.responseType = "blob";
    xhr.open("GET", localUri, true);
    xhr.send(null);
  });
  const storageRef = ref(storage, `dinosaurios/${id}.jpg`);
  await uploadBytes(storageRef, blob);
  blob.close?.();
  return await getDownloadURL(storageRef);
};
