import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import Constants from "expo-constants";
import {
  collection, addDoc, getDocs, doc, updateDoc,
  query, orderBy, serverTimestamp, onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

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

  // ✅ projectId obligatorio en SDK 49+
  const token = (
    await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    })
  ).data;

  return token;
};

export const saveUserToken = async (userId, token) => {
  if (!token) return;
  await updateDoc(doc(db, "users", userId), { expoPushToken: token });
};

export const sendPushNotification = async (token, titulo, cuerpo) => {
  const res = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to: token, title: titulo, body: cuerpo, sound: "default" }),
  });
  const data = await res.json();
  if (data?.data?.status === "error") {
    console.warn("Push error:", data.data.message);
  }
};

export const createNotificacion = async ({ titulo, cuerpo, userId = null }) => {
  await addDoc(collection(db, "notificaciones"), {
    titulo,
    cuerpo,
    userId,
    timestamp: serverTimestamp(),
    leida: false,
  });
};

export const subscribeToNotificaciones = (userId, callback) => {
  const q = query(collection(db, "notificaciones"), orderBy("timestamp", "desc"));
  return onSnapshot(q, (snap) => {
    const items = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((n) => n.userId === null || n.userId === userId);
    callback(items);
  });
};

export const marcarLeida = async (notifId) => {
  await updateDoc(doc(db, "notificaciones", notifId), { leida: true });
};

export const getAllUserTokens = async () => {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs
    .map((d) => d.data())
    .filter((u) => u.role === "user" && u.expoPushToken)
    .map((u) => ({ uid: u.uid, name: u.name, token: u.expoPushToken }));
};