import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import {
  registerForPushNotifications,
  saveUserToken,
} from "../services/notificationsService";

export default function usePushNotifications(user, navigation) {
  const notificationListener = useRef(null);
  const responseListener = useRef(null);

  useEffect(() => {
    if (!user) return;

    // Registrar token
    registerForPushNotifications().then((token) => {
      if (token) {
        saveUserToken(user.uid, token);
      }
    });

    // Notificación recibida
    notificationListener.current =
      Notifications.addNotificationReceivedListener(() => {
        // lógica opcional
      });

    // Usuario toca notificación
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(() => {
        navigation?.navigate("Notifications");
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }

      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [user]);
}