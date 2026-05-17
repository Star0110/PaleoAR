import React, { useContext } from "react";
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, Alert, ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import { auth } from "../../services/firebase";
import { AuthContext } from "../../context/AuthContext";
import Header from "../../components/Header";
import { COLORS } from "../../styles/colors";

const INFO_ROWS = [
  { icon: "shield-checkmark-outline", label: "Rol", key: "role", format: () => "Administrador" },
  { icon: "mail-outline", label: "Correo", key: "email" },
  { icon: "id-card-outline", label: "UID", key: "uid", truncate: true },
];

export default function AdminProfileScreen() {
  const { user } = useContext(AuthContext);

  const handleLogout = () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Seguro que deseas salir?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Salir", style: "destructive", onPress: () => signOut(auth) },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header />
      <ScrollView contentContainerStyle={styles.content}>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.displayName?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "A"}
              </Text>
            </View>
          </View>
          <Text style={styles.name}>{user?.displayName ?? "Administrador"}</Text>
          <View style={styles.adminBadge}>
            <Ionicons name="shield-checkmark" size={13} color={COLORS.primary} />
            <Text style={styles.adminBadgeText}>Administrador del sistema</Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Información de cuenta</Text>
          {INFO_ROWS.map((row) => (
            <View key={row.key} style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name={row.icon} size={18} color={COLORS.primary} />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>{row.label}</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {row.format
                    ? row.format(user?.[row.key])
                    : row.truncate
                    ? (user?.[row.key] ?? "—").substring(0, 20) + "…"
                    : user?.[row.key] ?? "—"}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Acciones rápidas */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Acciones</Text>
          <TouchableOpacity style={styles.actionRow} onPress={handleLogout} activeOpacity={0.7}>
            <View style={[styles.infoIconBox, styles.dangerIcon]}>
              <Ionicons name="log-out-outline" size={18} color="#EF4444" />
            </View>
            <Text style={styles.dangerText}>Cerrar sesión</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.mutedLight} style={{ marginLeft: "auto" }} />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 48 },
  avatarSection: { alignItems: "center", paddingVertical: 28 },
  avatarRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: COLORS.primaryBorder,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    backgroundColor: COLORS.primarySurface,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 32, fontWeight: "900", color: "#fff" },
  name: { fontSize: 22, fontWeight: "900", color: COLORS.foreground, marginBottom: 8 },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.primarySurface,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  adminBadgeText: { fontSize: 12, fontWeight: "700", color: COLORS.primary },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primary,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primarySurface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  dangerIcon: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  infoText: { flex: 1 },
  infoLabel: { fontSize: 11, color: COLORS.muted, fontWeight: "600" },
  infoValue: { fontSize: 14, fontWeight: "700", color: COLORS.textPrimary, marginTop: 2 },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
  },
  dangerText: { fontSize: 15, fontWeight: "600", color: "#EF4444" },
});