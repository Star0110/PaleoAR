import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function LocationPickerScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📍</Text>
      <Text style={styles.title}>Selector de ubicación no disponible en web</Text>
      <Text style={styles.sub}>Usa la app móvil para asignar ubicaciones AR.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8F7F4" },
  icon: { fontSize: 52, marginBottom: 16 },
  title: { fontSize: 18, fontWeight: "700", color: "#1a4d2e", marginBottom: 8, textAlign: "center" },
  sub: { fontSize: 13, color: "#7A7468" },
});
