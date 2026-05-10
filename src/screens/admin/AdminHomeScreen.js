import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "../../components/Header";
import { COLORS } from "../../styles/colors";

const MENU = [
  {
    route: "EditDinosaurs",
    icon: "layers-outline",
    label: "Editar Dinosaurios",
    desc: "Actualiza info, imágenes y ubicaciones",
  },
  {
    route: "Players",
    icon: "people-outline",
    label: "Progreso de Jugadores",
    desc: "Monitorea qué fósiles ha escaneado cada usuario",
  },
  {
    route: "SendNotification",
    icon: "notifications-outline",
    label: "Enviar Notificación",
    desc: "Manda avisos a todos los jugadores",
  },
  {
    route: "AddAdmin",
    icon: "person-add-outline",
    label: "Agregar Administrador",
    desc: "Crea una cuenta con permisos de admin",
  },
];

export default function AdminHomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <Header />
      <View style={styles.container}>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Panel de control</Text>
          <Text style={styles.title}>¿Qué deseas{"\n"}administrar?</Text>
        </View>

        <View style={styles.menu}>
          {MENU.map((item) => (
            <TouchableOpacity
              key={item.route}
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => navigation.navigate(item.route)}
            >
              <View style={styles.iconBox}>
                <Ionicons name={item.icon} size={24} color={COLORS.primary} />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardLabel}>{item.label}</Text>
                <Text style={styles.cardDesc}>{item.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.mutedLight} />
            </TouchableOpacity>
          ))}
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  hero: {
    paddingVertical: 24,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primaryLight,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: COLORS.foreground,
    lineHeight: 38,
  },
  menu: {
    gap: 12,
    marginTop: 8,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    gap: 14,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.primarySurface,
    justifyContent: "center",
    alignItems: "center",
  },
  cardText: { flex: 1 },
  cardLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  cardDesc: {
    fontSize: 12,
    color: COLORS.muted,
    lineHeight: 17,
  },
});
