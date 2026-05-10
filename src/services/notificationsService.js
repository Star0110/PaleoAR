import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";

// Configura cómo se muestran las notificaciones cuando la app está abierta
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Registra el dispositivo y devuelve el Expo Push Token
export const registerForPushNotifications = async () => {
  if (!Device.isDevice) return null;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return null;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "PaleoAR",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#1a4d2e",
    });
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
};

// Guarda el token en el documento del usuario
export const saveUserToken = async (userId, token) => {
  if (!token) return;
  await updateDoc(doc(db, "users", userId), { expoPushToken: token });
};

// Envía una notificación push a un token vía Expo
export const sendPushNotification = async (token, titulo, cuerpo) => {
  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: token,
      title: titulo,
      body: cuerpo,
      sound: "default",
    }),
  });
};

// Guarda una notificación en Firestore (para historial in-app)
export const createNotificacion = async ({ titulo, cuerpo, userId = null }) => {
  await addDoc(collection(db, "notificaciones"), {
    titulo,
    cuerpo,
    userId, // null = global, string = personal
    timestamp: serverTimestamp(),
    leida: false,
  });
};

// Suscripción en tiempo real a las notificaciones del usuario
export const subscribeToNotificaciones = (userId, callback) => {
  const q = query(
    collection(db, "notificaciones"),
    orderBy("timestamp", "desc")
  );
  return onSnapshot(q, (snap) => {
    const items = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((n) => n.userId === null || n.userId === userId);
    callback(items);
  });
};

// Marca una notificación como leída
export const marcarLeida = async (notifId) => {
  await updateDoc(doc(db, "notificaciones", notifId), { leida: true });
};

// Obtiene todos los tokens de usuarios (para envío masivo)
export const getAllUserTokens = async () => {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs
    .map((d) => d.data())
    .filter((u) => u.role === "user" && u.expoPushToken)
    .map((u) => ({ uid: u.uid, name: u.name, token: u.expoPushToken }));
};
