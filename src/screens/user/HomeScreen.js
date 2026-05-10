import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../context/AuthContext";
import Header from "../../components/Header";
import { COLORS } from "../../styles/colors";

export default function HomeScreen() {
  const { role } = useContext(AuthContext);

  return (
    <SafeAreaView style={styles.safe}>
      <Header />
      <View style={styles.container}>

        <View style={styles.hero}>
          <Text style={styles.greeting}>Bienvenido, Explorador</Text>
          <Text style={styles.heroTitle}>Descubre el{"\n"}pasado jurásico</Text>
          <Text style={styles.heroSub}>
            Escanea fósiles, explora el mapa y colecciona dinosaurios en AR.
          </Text>
        </View>

        <View style={styles.grid}>
          <TouchableOpacity style={[styles.card, styles.cardPrimary]} activeOpacity={0.85}>
            <Ionicons name="scan" size={28} color={COLORS.surface} />
            <Text style={styles.cardLabelLight}>Escanear Fósil</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.card, styles.cardSurface]} activeOpacity={0.85}>
            <Ionicons name="layers-outline" size={28} color={COLORS.primary} />
            <Text style={styles.cardLabel}>Mi Colección</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.card, styles.cardSurface]} activeOpacity={0.85}>
            <Ionicons name="map-outline" size={28} color={COLORS.primary} />
            <Text style={styles.cardLabel}>Mapa AR</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.card, styles.cardAccent]} activeOpacity={0.85}>
            <Ionicons name="trophy-outline" size={28} color={COLORS.surface} />
            <Text style={styles.cardLabelLight}>Logros</Text>
          </TouchableOpacity>
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
  greeting: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.primaryLight,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: "900",
    color: COLORS.foreground,
    lineHeight: 40,
    marginBottom: 12,
  },
  heroSub: {
    fontSize: 14,
    color: COLORS.muted,
    lineHeight: 22,
    maxWidth: 280,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
  },
  card: {
    width: "47%",
    borderRadius: 20,
    padding: 20,
    justifyContent: "space-between",
    minHeight: 120,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },
  cardPrimary: {
    backgroundColor: COLORS.primary,
  },
  cardSurface: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardAccent: {
    backgroundColor: COLORS.accent,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.foreground,
    marginTop: 16,
  },
  cardLabelLight: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.surface,
    marginTop: 16,
  },
});
