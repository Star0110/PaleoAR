import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator, Modal, ScrollView, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { getPlayers, getPlayerVisitas } from "../../services/visitasService";
import { getDinosaurs } from "../../services/dinosaurService";
import Header from "../../components/Header";
import { COLORS } from "../../styles/colors";
import { calcularNivel, PUNTOS_POR_FOSIL } from "../../services/gamificationService";

function LevelBadge({ level }) {
  return (
    <View style={styles.levelBadge}>
      <Ionicons name="trophy" size={11} color={COLORS.accent} />
      <Text style={styles.levelText}>Nivel {level}</Text>
    </View>
  );
}

function StatPill({ icon, value, label }) {
  return (
    <View style={styles.statPill}>
      <Ionicons name={icon} size={14} color={COLORS.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function PlayersScreen() {
  const [players, setPlayers] = useState([]);
  const [dinosaurs, setDinosaurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [visitas, setVisitas] = useState([]);
  const [loadingVisitas, setLoadingVisitas] = useState(false);

  useEffect(() => {
    Promise.all([getPlayers(), getDinosaurs()])
      .then(([p, d]) => { setPlayers(p); setDinosaurs(d); })
      .finally(() => setLoading(false));
  }, []);

  const openPlayer = async (player) => {
    setSelected(player);
    setLoadingVisitas(true);
    const v = await getPlayerVisitas(player.id);
    setVisitas(v);
    setLoadingVisitas(false);
  };

  const confirmDeletePlayer = (player) => {
    Alert.alert(
      "Eliminar jugador",
      `¿Seguro que deseas eliminar a ${player.name}? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => deletePlayer(player.id) },
      ]
    );
  };

  const deletePlayer = async (id) => {
    try {
      await deleteDoc(doc(db, "users", id));
      setPlayers((prev) => prev.filter((p) => p.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (e) {
      Alert.alert("Error", "No se pudo eliminar el jugador.");
    }
  };

  const dinoMap = Object.fromEntries(dinosaurs.map((d) => [d.id, d]));
  const totalDinos = dinosaurs.length;

  // ── Usa exactamente la misma función que useGamification ──────────────────
  const nivelCalculado = calcularNivel(visitas.length, totalDinos);
  const puntosCalculados = visitas.length * PUNTOS_POR_FOSIL;
  // ─────────────────────────────────────────────────────────────────────────

  const renderPlayer = useCallback(({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => openPlayer(item)} activeOpacity={0.8}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name?.[0]?.toUpperCase() ?? "?"}</Text>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardEmail}>{item.email}</Text>
      </View>
      <View style={styles.cardRight}>
        {/* nivel en la lista usa el guardado en Firestore (sincronizado por useGamification) */}
        <LevelBadge level={item.level ?? 0} />
        <Text style={styles.cardPoints}>{(item.points ?? 0)} pts</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => confirmDeletePlayer(item)}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="trash-outline" size={16} color="#EF4444" />
      </TouchableOpacity>
      <Ionicons name="chevron-forward" size={16} color={COLORS.mutedLight} style={{ marginLeft: 4 }} />
    </TouchableOpacity>
  ), []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <Header showBack />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Header showBack />
      <FlatList
        data={players}
        keyExtractor={(item) => item.id}
        renderItem={renderPlayer}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>Jugadores</Text>
            <View style={styles.totalPill}>
              <Text style={styles.totalText}>{players.length} registrados</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color={COLORS.border} />
            <Text style={styles.emptyText}>Sin jugadores registrados</Text>
          </View>
        }
      />

      <Modal visible={!!selected} animationType="slide" onRequestClose={() => setSelected(null)}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelected(null)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color={COLORS.foreground} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{selected?.name}</Text>
            <TouchableOpacity
              onPress={() => selected && confirmDeletePlayer(selected)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.modalDeleteBtn}
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>

            {/* Stats — nivel y puntos calculados con la lógica real de gamification */}
            <View style={styles.statsRow}>
              <StatPill icon="trophy-outline" value={loadingVisitas ? "…" : nivelCalculado}   label="Nivel"      />
              <StatPill icon="star-outline"   value={loadingVisitas ? "…" : puntosCalculados} label="Puntos"     />
              <StatPill icon="eye-outline"    value={loadingVisitas ? "…" : visitas.length}   label="Escaneados" />
              <StatPill icon="layers-outline" value={totalDinos}                              label="Total"      />
            </View>

            {/* Progreso */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Progreso de colección</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: totalDinos > 0 ? `${Math.min((visitas.length / totalDinos) * 100, 100)}%` : "0%" },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {visitas.length} de {totalDinos} fósiles escaneados
              </Text>
            </View>

            {/* Fósiles descubiertos */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Fósiles descubiertos</Text>
              {loadingVisitas ? (
                <ActivityIndicator color={COLORS.primary} style={{ marginTop: 16 }} />
              ) : visitas.length === 0 ? (
                <View style={styles.emptyVisitas}>
                  <Ionicons name="scan-outline" size={32} color={COLORS.border} />
                  <Text style={styles.emptyVisitasText}>Aún no ha escaneado ningún fósil</Text>
                </View>
              ) : (
                visitas.map((v, i) => {
                  const dino = dinoMap[v.dinosaurId] ?? {};
                  return (
                    <View key={i} style={styles.visitaRow}>
                      <View style={styles.visitaIcon}>
                        <Ionicons name="checkmark" size={14} color={COLORS.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.visitaNombre}>{v.nombre ?? dino.nombre ?? "Desconocido"}</Text>
                        {v.timestamp && (
                          <Text style={styles.visitaFecha}>
                            {new Date(v.timestamp?.seconds * 1000).toLocaleDateString("es-MX")}
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                })
              )}
            </View>

            {/* Fósiles pendientes */}
            {!loadingVisitas && visitas.length < totalDinos && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Fósiles pendientes</Text>
                {dinosaurs
                  .filter((d) => !visitas.some((v) => v.dinosaurId === d.id))
                  .map((d) => (
                    <View key={d.id} style={[styles.visitaRow, styles.visitaPending]}>
                      <View style={[styles.visitaIcon, styles.visitaIconPending]}>
                        <Ionicons name="ellipse-outline" size={14} color={COLORS.mutedLight} />
                      </View>
                      <Text style={styles.visitaNombrePending}>{d.nombre}</Text>
                    </View>
                  ))}
              </View>
            )}

          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { padding: 16, paddingBottom: 32 },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 26, fontWeight: "900", color: COLORS.foreground },
  totalPill: {
    backgroundColor: COLORS.primarySurface,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  totalText: { fontSize: 12, fontWeight: "600", color: COLORS.primary },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: { fontSize: 18, fontWeight: "900", color: COLORS.surface },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: "700", color: COLORS.textPrimary },
  cardEmail: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  cardRight: { alignItems: "flex-end", gap: 4, marginRight: 8 },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF7ED",
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#FCEAE1",
  },
  levelText: { fontSize: 11, fontWeight: "700", color: COLORS.accent },
  cardPoints: { fontSize: 11, color: COLORS.muted },
  deleteBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FECACA",
    marginRight: 4,
  },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14, color: COLORS.muted },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: { fontSize: 17, fontWeight: "700", color: COLORS.textPrimary },
  modalDeleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  modalContent: { padding: 20, paddingBottom: 40 },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  statPill: {
    flex: 1,
    backgroundColor: COLORS.primarySurface,
    borderRadius: 14,
    padding: 10,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  statValue: { fontSize: 18, fontWeight: "900", color: COLORS.primary },
  statLabel: { fontSize: 10, color: COLORS.muted, fontWeight: "600" },
  section: { marginBottom: 24 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primary,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  progressBar: {
    height: 10,
    backgroundColor: COLORS.primarySurface,
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: { height: "100%", backgroundColor: COLORS.primary, borderRadius: 5 },
  progressText: { fontSize: 12, color: COLORS.muted },
  visitaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  visitaPending: { opacity: 0.5 },
  visitaIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primarySurface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  visitaIconPending: { backgroundColor: COLORS.background, borderColor: COLORS.border },
  visitaNombre: { fontSize: 14, fontWeight: "600", color: COLORS.textPrimary },
  visitaNombrePending: { fontSize: 14, color: COLORS.muted },
  visitaFecha: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  emptyVisitas: { alignItems: "center", paddingVertical: 24, gap: 10 },
  emptyVisitasText: { fontSize: 13, color: COLORS.muted },
});