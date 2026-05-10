import React, { useContext } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AuthContext } from "../context/AuthContext";
import BottomTabNavigator from "./BottomTabNavigator";
import EditDinosaursScreen from "../screens/admin/EditDinosaursScreen";
import AddAdminScreen from "../screens/admin/AddAdminScreen";
import LocationPickerScreen from "../screens/admin/LocationPickerScreen";
import PlayersScreen from "../screens/admin/PlayersScreen";
import SendNotificationScreen from "../screens/admin/SendNotificationScreen";
import NotificationsScreen from "../screens/user/NotificationsScreen";
import usePushNotifications from "../hooks/usePushNotifications";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user } = useContext(AuthContext);
  usePushNotifications(user);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="EditDinosaurs" component={EditDinosaursScreen} />
      <Stack.Screen name="LocationPicker" component={LocationPickerScreen} />
      <Stack.Screen name="Players" component={PlayersScreen} />
      <Stack.Screen name="SendNotification" component={SendNotificationScreen} />
      <Stack.Screen
        name="AddAdmin"
        component={AddAdminScreen}
        options={{ headerShown: true, title: "Nuevo administrador" }}
      />
    </Stack.Navigator>
  );
}
