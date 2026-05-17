import React, {
  useContext,
  useMemo,
} from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  AuthContext,
} from "../../context/AuthContext";

import {
  logoutUser,
} from "../../services/authService";

import Header from "../../components/Header";

import {
  COLORS,
} from "../../styles/colors";

import useGamification
  from "../../hooks/useGamification";

import {
  NIVELES,
} from "../../services/gamificationService";

function BadgeCard({
  insignia,
  desbloqueada,
}) {

  const iconColor =
    desbloqueada
      ? insignia.color
      : COLORS.mutedLight;

  const bgColor =
    desbloqueada
      ? `${insignia.color}18`
      : COLORS.background;

  return (
    <View
      style={[
        styles.badgeCard,
        !desbloqueada &&
        styles.badgeCardLocked,
      ]}
    >

      <View
        style={[
          styles.badgeIconCircle,
          {
            backgroundColor:
              bgColor,

            borderColor:
              `${iconColor}40`,
          },
        ]}
      >

        <Ionicons
          name={insignia.icon}
          size={22}
          color={iconColor}
        />

        {!desbloqueada && (

          <View style={styles.lockBadge}>

            <Ionicons
              name="lock-closed"
              size={9}
              color={COLORS.surface}
            />

          </View>
        )}

      </View>

      <Text
        style={[
          styles.badgeName,
          !desbloqueada &&
          styles.badgeNameLocked,
        ]}
      >
        {insignia.nombre}
      </Text>

      <Text style={styles.badgeDesc}>
        {insignia.descripcion}
      </Text>

    </View>
  );
}

export default function ProfileScreen() {

  const {
    user,
  } = useContext(AuthContext);

  const {

    visitas,

    dinosaurios,

    totalFosiles,

    nivel,

    progreso,

    insigniaActual,

    loading,

  } = useGamification();

  const initial =
    user?.email?.[0]?.toUpperCase() ?? "?";

  const points =
    visitas.length * 100;

  const dinosauriosMap =
    useMemo(() => {

      const map = {};

      if (
        !Array.isArray(
          dinosaurios
        )
      ) {
        return map;
      }

      dinosaurios.forEach((dino) => {

        map[dino.targetName] =
          dino.nombre;

      });

      return map;

    }, [dinosaurios]);

  return (

    <SafeAreaView style={styles.safe}>

      <Header />

      <ScrollView
        contentContainerStyle={
          styles.scroll
        }
      >

        {/* HERO */}
        <View style={styles.hero}>

          <View style={styles.avatar}>

            <Text style={styles.avatarText}>
              {initial}
            </Text>

          </View>

          <Text style={styles.name}>
            {user?.displayName ??
              user?.email}
          </Text>

          {insigniaActual && (

            <View
              style={[
                styles.nivelPill,
                {
                  borderColor:
                    `${insigniaActual.color}50`,

                  backgroundColor:
                    `${insigniaActual.color}12`,
                },
              ]}
            >

              <Ionicons
                name={insigniaActual.icon}
                size={13}
                color={insigniaActual.color}
              />

              <Text
                style={[
                  styles.nivelNombre,
                  {
                    color:
                      insigniaActual.color,
                  },
                ]}
              >
                {insigniaActual.nombre}
              </Text>

            </View>
          )}

        </View>

        {/* STATS */}
        <View style={styles.statsRow}>

          <View style={styles.statBox}>

            <Text style={styles.statValue}>
              {nivel}
            </Text>

            <Text style={styles.statLabel}>
              Nivel
            </Text>

          </View>

          <View style={styles.statDivider} />

          <View style={styles.statBox}>

            <Text style={styles.statValue}>
              {points}
            </Text>

            <Text style={styles.statLabel}>
              Puntos
            </Text>

          </View>

          <View style={styles.statDivider} />

          <View style={styles.statBox}>

            <Text style={styles.statValue}>
              {visitas.length}/
              {totalFosiles}
            </Text>

            <Text style={styles.statLabel}>
              Fósiles
            </Text>

          </View>

        </View>

        {/* PROGRESO */}
        {nivel < 3 && (

          <View style={styles.section}>

            <View style={styles.sectionHeader}>

              <Text style={styles.sectionTitle}>
                Progreso
              </Text>

              <Text style={styles.sectionSub}>
                {progreso.actual} /
                {progreso.siguiente}
              </Text>

            </View>

            <View style={styles.progressTrack}>

              <View
                style={[
                  styles.progressFill,
                  {
                    width:
                      `${progreso.porcentaje * 100}%`,
                  },
                ]}
              />

            </View>

          </View>
        )}

        {/* INSIGNIAS */}
        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            Insignias
          </Text>

          <View style={styles.badgesGrid}>

            {NIVELES.map((ins) => (

              <BadgeCard
                key={ins.nivel}
                insignia={ins}
                desbloqueada={
                  nivel >= ins.nivel
                }
              />

            ))}

          </View>

        </View>

        {/* DINOSAURIOS */}
        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            Fósiles descubiertos
          </Text>

          {loading ? (

            <ActivityIndicator
              color={COLORS.primary}
              style={{
                marginTop: 12,
              }}
            />

          ) : visitas.length === 0 ? (

            <View style={styles.emptyFosiles}>

              <Ionicons
                name="scan-outline"
                size={36}
                color={COLORS.border}
              />

              <Text style={styles.emptyText}>
                Aún no has escaneado
                ningún fósil.
              </Text>

            </View>

          ) : (

            visitas.map((v, i) => {

              // ✅ BUSCA EL NOMBRE REAL
              const nombreReal =
                dinosauriosMap[
                  v.targetName
                ] ??
                v.targetName;

              return (

                <View
                  key={i}
                  style={styles.visitaRow}
                >

                  <View style={styles.visitaDot}>

                    <Ionicons
                      name="checkmark"
                      size={13}
                      color={COLORS.surface}
                    />

                  </View>

                  <View style={{ flex: 1 }}>

                    <Text style={styles.visitaNombre}>
                      {nombreReal}
                    </Text>

                    {v.timestamp && (

                      <Text style={styles.visitaFecha}>

                        {new Date(
                          v.timestamp.seconds *
                          1000
                        ).toLocaleDateString(
                          "es-MX",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}

                      </Text>
                    )}

                  </View>

                </View>
              );
            })

          )}

        </View>

        {/* LOGOUT */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={logoutUser}
        >

          <Ionicons
            name="log-out-outline"
            size={20}
            color={COLORS.error}
          />

          <Text style={styles.logoutText}>
            Cerrar sesión
          </Text>

        </TouchableOpacity>

      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  safe: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },

  scroll: {
    padding: 20,
    paddingBottom: 48,
  },

  hero: {
    alignItems: "center",
    paddingVertical: 28,
  },

  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  avatarText: {
    fontSize: 36,
    fontWeight: "900",
    color: COLORS.surface,
  },

  name: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 10,
  },

  nivelPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
  },

  nivelNombre: {
    fontSize: 12,
    fontWeight: "700",
  },

  statsRow: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 16,
    marginBottom: 20,
  },

  statBox: {
    flex: 1,
    alignItems: "center",
  },

  statValue: {
    fontSize: 24,
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

  section: {
    marginBottom: 24,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.foreground,
    marginBottom: 10,
  },

  sectionSub: {
    fontSize: 12,
    color: COLORS.muted,
  },

  progressTrack: {
    height: 10,
    backgroundColor: COLORS.primarySurface,
    borderRadius: 5,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
  },

  badgesGrid: {
    flexDirection: "row",
    gap: 10,
  },

  badgeCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    gap: 6,
  },

  badgeCardLocked: {
    opacity: 0.55,
  },

  badgeIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
  },

  lockBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.muted,
    justifyContent: "center",
    alignItems: "center",
  },

  badgeName: {
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
  },

  badgeNameLocked: {
    color: COLORS.muted,
  },

  badgeDesc: {
    fontSize: 9,
    color: COLORS.muted,
    textAlign: "center",
  },

  emptyFosiles: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 10,
  },

  emptyText: {
    fontSize: 13,
    color: COLORS.muted,
    textAlign: "center",
  },

  visitaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  visitaDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  visitaNombre: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },

  visitaFecha: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 2,
  },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 8,
  },

  logoutText: {
    color: COLORS.error,
    fontSize: 15,
    fontWeight: "700",
  },
});