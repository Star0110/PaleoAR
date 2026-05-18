import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, StyleSheet,
  SafeAreaView, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "../../components/Header";
import { COLORS } from "../../styles/colors";
import { getAdminStats } from "../../services/visitasService";
import { getDinosaurs } from "../../services/dinosaurService";

function SummaryCard({ icon, value, label, accent }) {
  return (
    <View style={[styles.summaryCard, accent && styles.summaryCardAccent]}>
      <Ionicons name={icon} size={20} color={accent ? COLORS.accent : COLORS.primary} />
      <Text style={[styles.summaryValue, accent && styles.summaryValueAccent]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function DinoRow({ rank, nombre, count, maxCount }) {
  const pct = maxCount > 0 ? count / maxCount : 0;
  const isTop = rank === 1;
  const isZero = count === 0;

  return (
    <View style={styles.dinoRow}>
      <Text style={[styles.rank, isTop && styles.rankTop]}>#{rank}</Text>
      <View style={styles.dinoInfo}>
        <View style={styles.dinoNameRow}>
          <Text style={[styles.dinoName, isZero && styles.dinoNameMuted]} numberOfLines={1}>
            {nombre}
          </Text>
          {isTop && <Ionicons name="flame" size={13} color={COLORS.accent} style={{ marginLeft: 4 }} />}
        </View>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${pct * 100}%` }, isZero && styles.barFillZero]} />
        </View>
      </View>
      <Text style={[styles.dinoCount, isZero && styles.dinoCountMuted]}>
        {count}
      </Text>
    </View>
  );
}

function PlayerRow({ rank, name, count }) {
  const isTop = rank === 1;
  return (
    <View style={styles.playerRow}>
      <View style={[styles.playerRank, isTop && styles.playerRankTop]}>
        <Text style={[styles.playerRankText, isTop && styles.playerRankTextTop]}>
          {rank}
        </Text>
      </View>
      <Text style={styles.playerName} numberOfLines={1}>{name}</Text>
      <View style={styles.playerPill}>
        <Text style={styles.playerCount}>{count} escaneos</Text>
      </View>
    </View>
  );
}

export default function StatsScreen() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [dinoRanking, setDinoRanking] = useState([]);

  useEffect(() => {
    Promise.all([getAdminStats(), getDinosaurs()]).then(([s, dinos]) => {
      if (!s) { setLoading(false); return; }

      const dinoMap = Object.fromEntries(dinos.map((d) => [d.targetName, d]));

      const ranking = dinos.map((d) => ({
        targetName: d.targetName,
        nombre: d.nombre ?? d.targetName,
        count: s.dinoCounts[d.targetName] || 0,
      }));

      // include dinos with scans that may not exist in dinosaurios collection
      for (const [targetName, count] of Object.entries(s.dinoCounts)) {
        if (!dinoMap[targetName]) {
          ranking.push({ targetName, nombre: targetName, count });
        }
      }

      ranking.sort((a, b) => b.count - a.count);
      setDinoRanking(ranking);
      setStats(s);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <Header showBack />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando estadísticas…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!stats) {
    return (
      <SafeAreaView style={styles.safe}>
        <Header showBack />
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.border} />
          <Text style={styles.emptyText}>No se pudieron cargar las estadísticas</Text>
        </View>
      </SafeAreaView>
    );
  }

  const avgScans = stats.totalPlayers > 0
    ? (stats.totalScans / stats.totalPlayers).toFixed(1)
    : "0";
  const maxCount = dinoRanking[0]?.count ?? 0;
  const topDino = dinoRanking[0];
  const bottomDino = [...dinoRanking].reverse().find((d) => d.count > 0) ?? dinoRanking[dinoRanking.length - 1];
  const unscannedCount = dinoRanking.filter((d) => d.count === 0).length;

  return (
    <SafeAreaView style={styles.safe}>
      <Header showBack />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Panel de control</Text>
          <Text style={styles.title}>Estadísticas</Text>
        </View>

        {/* Summary cards */}
        <View style={styles.summaryRow}>
          <SummaryCard icon="scan-outline"   value={stats.totalScans}   label="Escaneos" accent />
          <SummaryCard icon="people-outline" value={stats.totalPlayers} label="Jugadores" />
          <SummaryCard icon="layers-outline" value={dinoRanking.length} label="Fósiles" />
          <SummaryCard icon="stats-chart-outline" value={avgScans} label="Promedio" />
        </View>

        {/* Highlight strip */}
        <View style={styles.highlightRow}>
          <View style={[styles.highlight, styles.highlightGreen]}>
            <Ionicons name="flame" size={16} color={COLORS.accent} />
            <View style={{ flex: 1 }}>
              <Text style={styles.highlightLabel}>Más visitado</Text>
              <Text style={styles.highlightValue} numberOfLines={1}>{topDino?.nombre ?? "—"}</Text>
            </View>
            <Text style={styles.highlightCount}>{topDino?.count ?? 0}</Text>
          </View>

          <View style={[styles.highlight, styles.highlightMuted]}>
            <Ionicons name="snow-outline" size={16} color={COLORS.muted} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.highlightLabel, { color: COLORS.muted }]}>Menos visitado</Text>
              <Text style={[styles.highlightValue, { color: COLORS.textSecondary }]} numberOfLines={1}>
                {bottomDino?.nombre ?? "—"}
              </Text>
            </View>
            <Text style={[styles.highlightCount, { color: COLORS.muted }]}>{bottomDino?.count ?? 0}</Text>
          </View>
        </View>

        {unscannedCount > 0 && (
          <View style={styles.unscannedBanner}>
            <Ionicons name="alert-circle-outline" size={15} color={COLORS.muted} />
            <Text style={styles.unscannedText}>
              {unscannedCount} {unscannedCount === 1 ? "fósil sin" : "fósiles sin"} ningún escaneo
            </Text>
          </View>
        )}

        {/* Dino ranking */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Ranking de fósiles</Text>
          {dinoRanking.map((d, i) => (
            <DinoRow
              key={d.targetName}
              rank={i + 1}
              nombre={d.nombre}
              count={d.count}
              maxCount={maxCount}
            />
          ))}
        </View>

        {/* Player ranking */}
        {stats.playerRanking.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Top jugadores</Text>
            {stats.playerRanking.map((p, i) => (
              <PlayerRow key={i} rank={i + 1} name={p.name} count={p.count} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },
  scroll: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 48 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { fontSize: 14, color: COLORS.muted },
  emptyText: { fontSize: 14, color: COLORS.muted, marginTop: 8 },

  hero: { paddingVertical: 24 },
  eyebrow: {
    fontSize: 12, fontWeight: "700", color: COLORS.primaryLight,
    letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8,
  },
  title: { fontSize: 32, fontWeight: "900", color: COLORS.foreground, lineHeight: 38 },

  // Summary
  summaryRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  summaryCard: {
    flex: 1, backgroundColor: COLORS.primarySurface, borderRadius: 14,
    padding: 10, alignItems: "center", gap: 4,
    borderWidth: 1, borderColor: COLORS.primaryBorder,
  },
  summaryCardAccent: {
    backgroundColor: COLORS.accentSurface, borderColor: "#FCEAE1",
  },
  summaryValue: { fontSize: 18, fontWeight: "900", color: COLORS.primary },
  summaryValueAccent: { color: COLORS.accent },
  summaryLabel: { fontSize: 9, fontWeight: "600", color: COLORS.muted, textTransform: "uppercase" },

  // Highlights
  highlightRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  highlight: {
    flex: 1, flexDirection: "row", alignItems: "center",
    borderRadius: 14, padding: 12, gap: 8,
    borderWidth: 1,
  },
  highlightGreen: { backgroundColor: COLORS.accentSurface, borderColor: "#FCEAE1" },
  highlightMuted: { backgroundColor: COLORS.surface, borderColor: COLORS.border },
  highlightLabel: {
    fontSize: 10, fontWeight: "700", color: COLORS.accent,
    textTransform: "uppercase", letterSpacing: 0.5,
  },
  highlightValue: { fontSize: 13, fontWeight: "700", color: COLORS.textPrimary, marginTop: 1 },
  highlightCount: {
    fontSize: 22, fontWeight: "900", color: COLORS.accent,
  },

  // Unscanned banner
  unscannedBanner: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: COLORS.surface, borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 16,
  },
  unscannedText: { fontSize: 12, color: COLORS.muted },

  // Section
  section: { marginBottom: 28 },
  sectionLabel: {
    fontSize: 11, fontWeight: "700", color: COLORS.primary,
    letterSpacing: 1, textTransform: "uppercase", marginBottom: 12,
  },

  // Dino row
  dinoRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  rank: { width: 28, fontSize: 12, fontWeight: "700", color: COLORS.muted, textAlign: "center" },
  rankTop: { color: COLORS.accent },
  dinoInfo: { flex: 1 },
  dinoNameRow: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  dinoName: { fontSize: 14, fontWeight: "600", color: COLORS.textPrimary, flexShrink: 1 },
  dinoNameMuted: { color: COLORS.mutedLight },
  barTrack: {
    height: 5, backgroundColor: COLORS.primarySurface,
    borderRadius: 3, overflow: "hidden",
  },
  barFill: { height: "100%", backgroundColor: COLORS.primary, borderRadius: 3 },
  barFillZero: { backgroundColor: COLORS.border },
  dinoCount: { width: 28, fontSize: 14, fontWeight: "800", color: COLORS.primary, textAlign: "right" },
  dinoCountMuted: { color: COLORS.mutedLight },

  // Player row
  playerRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  playerRank: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.primarySurface, justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: COLORS.primaryBorder,
  },
  playerRankTop: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  playerRankText: { fontSize: 12, fontWeight: "800", color: COLORS.primary },
  playerRankTextTop: { color: COLORS.surface },
  playerName: { flex: 1, fontSize: 14, fontWeight: "600", color: COLORS.textPrimary },
  playerPill: {
    backgroundColor: COLORS.primarySurface, borderRadius: 10,
    paddingVertical: 3, paddingHorizontal: 8,
    borderWidth: 1, borderColor: COLORS.primaryBorder,
  },
  playerCount: { fontSize: 11, fontWeight: "700", color: COLORS.primary },
});
