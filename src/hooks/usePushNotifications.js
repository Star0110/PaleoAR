import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { useNavigation } from "@react-navigation/native";
import {
  registerForPushNotifications,
  saveUserToken,
} from "../services/notificationsService";

export default function usePushNotifications(user) {
  const navigation = useNavigation();
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    if (!user) return;

    // Registrar y guardar token
    registerForPushNotifications().then((token) => {
      if (token) saveUserToken(user.uid, token);
    });

    // Listener: notificación llega con app abierta
    notificationListener.current = Notifications.addNotificationReceivedListener(() => {
      // El handler ya la muestra; solo se puede disparar lógica adicional aquí
    });

    // Listener: usuario toca la notificación
    responseListener.current = Notifications.addNotificationResponseReceivedListener(() => {
      navigation.navigate("Notifications");
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, [user]);
}
