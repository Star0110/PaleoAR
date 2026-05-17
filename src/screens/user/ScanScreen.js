import React, {
  useState,
  useCallback,
  useContext,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  SafeAreaView,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import Header from "../../components/Header";
import { COLORS } from "../../styles/colors";
import useGamification from "../../hooks/useGamification";

import { AuthContext } from "../../context/AuthContext";

export default function ScanScreen() {

  const [lanzando, setLanzando] =
    useState(false);

  const {
    visitas,
    totalFosiles,
    nivel,
  } = useGamification();

  const { user } =
    useContext(AuthContext);

  useFocusEffect(
    useCallback(() => {
      setLanzando(false);
    }, [])
  );

  const abrirAR = async () => {

    if (!user?.uid) {

      Alert.alert(
        "Error",
        "No se encontró el usuario."
      );

      return;
    }

    setLanzando(true);

    try {

      const deepLink =
        `paleoar_unity://open?userId=${user.uid}`;

      console.log(
        "Deep Link:",
        deepLink
      );

      await Linking.openURL(deepLink);
    }
    catch (error) {

      console.log(error);

      Alert.alert(
        "Error",
        "No se pudo abrir la aplicación AR."
      );
    }
    finally {

      setLanzando(false);
    }
  };

  const fosilesPendientes =
    totalFosiles - visitas.length;

  return (
    <SafeAreaView style={styles.safe}>
      <Header />

      <View style={styles.container}>

        <View style={styles.iconCircle}>
          <Ionicons
            name="scan"
            size={56}
            color={COLORS.surface}
          />
        </View>

        <Text style={styles.title}>
          Escanear Fósil
        </Text>

        <Text style={styles.subtitle}>
          Apunta la cámara al marcador para activar
          la experiencia de Realidad Aumentada.
        </Text>

        <View style={styles.statsRow}>

          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {visitas.length}
            </Text>

            <Text style={styles.statLabel}>
              Escaneados
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {fosilesPendientes}
            </Text>

            <Text style={styles.statLabel}>
              Pendientes
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {nivel}
            </Text>

            <Text style={styles.statLabel}>
              Nivel
            </Text>
          </View>

        </View>

        <View style={styles.steps}>

          {[
            {
              icon: "location-outline",
              text: "Acércate a una vitrina",
            },
            {
              icon: "scan-outline",
              text: "Abre el escáner AR",
            },
            {
              icon: "layers-outline",
              text: "Descubre dinosaurios en AR",
            },
          ].map((s, i) => (
            <View key={i} style={styles.step}>

              <View style={styles.stepIcon}>
                <Ionicons
                  name={s.icon}
                  size={18}
                  color={COLORS.primary}
                />
              </View>

              <Text style={styles.stepText}>
                {s.text}
              </Text>

            </View>
          ))}

        </View>

        <TouchableOpacity
          style={[
            styles.scanBtn,
            lanzando && styles.scanBtnDisabled,
          ]}
          activeOpacity={0.85}
          disabled={lanzando}
          onPress={abrirAR}
        >
          <Ionicons
            name="camera"
            size={22}
            color={COLORS.surface}
          />

          <Text style={styles.scanBtnText}>
            {lanzando
              ? "Abriendo AR..."
              : "Iniciar AR"}
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  safe: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,

    elevation: 6,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },

  title: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.foreground,
    marginBottom: 10,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
    marginBottom: 28,
  },

  statsRow: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 14,
    width: "100%",
    marginBottom: 28,
  },

  statBox: {
    flex: 1,
    alignItems: "center",
  },

  statValue: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.primary,
  },

  statLabel: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 2,
    fontWeight: "600",
  },

  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },

  steps: {
    width: "100%",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 14,
    marginBottom: 28,
  },

  step: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  stepIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primarySurface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },

  stepText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },

  scanBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    paddingVertical: 18,
    width: "100%",

    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  scanBtnDisabled: {
    opacity: 0.6,
  },

  scanBtnText: {
    color: COLORS.surface,
    fontSize: 17,
    fontWeight: "800",
  },
});