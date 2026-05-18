import React, { useContext } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { AuthContext } from "../context/AuthContext";
import { COLORS } from "../styles/colors";

import HomeScreen from "../screens/user/HomeScreen";
import ScanScreen from "../screens/user/ScanScreen";
import DinosaurListScreen from "../screens/user/DinosaurListScreen";
import MapScreen from "../screens/user/MapScreen";
import ProfileScreen from "../screens/user/ProfileScreen";
import AdminHomeScreen from "../screens/admin/AdminHomeScreen";
import AdminProfileScreen from "../screens/admin/AdminProfileScreen";

const Tab = createBottomTabNavigator();

const tabScreenOptions = ({ route }) => ({
  headerShown: false,
  tabBarActiveTintColor: COLORS.primary,
  tabBarInactiveTintColor: COLORS.mutedLight,
  tabBarStyle: {
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    height: 64,
    paddingBottom: 10,
    paddingTop: 6,
  },
  tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
  tabBarIcon: ({ color, focused }) => {
    const icons = {
      Inicio:      focused ? "home"    : "home-outline",
      Dinosaurios: focused ? "layers"  : "layers-outline",
      Mapa:        focused ? "map"     : "map-outline",
      Escanear:    focused ? "scan"    : "scan-outline",
      Perfil:      focused ? "person"  : "person-outline",
    };
    return <Ionicons name={icons[route.name]} size={22} color={color} />;
  },
});

function UserTabs() {
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen name="Inicio"      component={HomeScreen} />
      <Tab.Screen name="Dinosaurios" component={DinosaurListScreen} />
      <Tab.Screen name="Mapa"        component={MapScreen} />
      <Tab.Screen name="Escanear"    component={ScanScreen} />
      <Tab.Screen name="Perfil"      component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AdminTabs() {
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen name="Inicio" component={AdminHomeScreen} />
      <Tab.Screen name="Perfil" component={AdminProfileScreen} />
    </Tab.Navigator>
  );
}

export default function BottomTabNavigator() {
  const { role } = useContext(AuthContext);

  return role === "admin" ? <AdminTabs /> : <UserTabs />;
}