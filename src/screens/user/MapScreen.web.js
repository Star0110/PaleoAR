import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🗺</Text>
      <Text style={styles.title}>Mapa no disponible en web</Text>
      <Text style={styles.sub}>Usa la app móvil para ver el mapa AR.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8F7F4" },
  icon: { fontSize: 52, marginBottom: 16 },
  title: { fontSize: 18, fontWeight: "700", color: "#1a4d2e", marginBottom: 8 },
  sub: { fontSize: 13, color: "#7A7468" },
});
