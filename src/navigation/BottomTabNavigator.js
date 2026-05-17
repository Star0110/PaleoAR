import React, { useContext, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
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
  const { role: realRole } = useContext(AuthContext);
  const [debugRole, setDebugRole] = useState(null);
  const role = debugRole ?? realRole;
  const isAdmin = role === "admin";

  return (
    <View style={{ flex: 1 }}>
      {isAdmin ? <AdminTabs /> : <UserTabs />}

      <View style={styles.debugContainer}>
        <Text style={styles.debugLabel}>DEBUG — rol: {role ?? "ninguno"}</Text>
        <View style={styles.debugToggle}>
          <TouchableOpacity
            style={[styles.debugBtn, !isAdmin && styles.debugBtnActive]}
            onPress={() => setDebugRole("user")}
            activeOpacity={0.7}
          >
            <Text style={[styles.debugBtnText, !isAdmin && styles.debugBtnTextActive]}>User</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.debugBtn, isAdmin && styles.debugBtnActive]}
            onPress={() => setDebugRole("admin")}
            activeOpacity={0.7}
          >
            <Text style={[styles.debugBtnText, isAdmin && styles.debugBtnTextActive]}>Admin</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  debugContainer: {
    position: "absolute",
    bottom: 80,
    alignSelf: "center",
    alignItems: "center",
    gap: 6,
  },
  debugLabel: { fontSize: 10, color: "#aaa", letterSpacing: 0.5 },
  debugToggle: {
    flexDirection: "row",
    backgroundColor: COLORS.border,
    borderRadius: 20,
    padding: 3,
  },
  debugBtn: { paddingVertical: 5, paddingHorizontal: 18, borderRadius: 17 },
  debugBtnActive: { backgroundColor: COLORS.primary },
  debugBtnText: { fontSize: 12, fontWeight: "600", color: "#888" },
  debugBtnTextActive: { color: "#fff" },
});