import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../context/AuthContext";
import { subscribeToNotificaciones, marcarLeida } from "../../services/notificationsService";
import Header from "../../components/Header";
import { COLORS } from "../../styles/colors";

function timeAgo(timestamp) {
  if (!timestamp?.seconds) return "";
  const diff = Math.floor((Date.now() - timestamp.seconds * 1000) / 1000);
  if (diff < 60) return "Hace un momento";
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  return `Hace ${Math.floor(diff / 86400)} d`;
}

export default function NotificationsScreen() {
  const { user } = useContext(AuthContext);
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToNotificaciones(user.uid, setNotifs);
    return unsub;
  }, [user]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, !item.leida && styles.cardUnread]}
      activeOpacity={0.8}
      onPress={() => marcarLeida(item.id)}
    >
      <View style={[styles.iconBox, !item.leida && styles.iconBoxUnread]}>
        <Ionicons
          name="notifications"
          size={18}
          color={item.leida ? COLORS.muted : COLORS.primary}
        />
      </View>
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={[styles.titulo, !item.leida && styles.tituloUnread]}>
            {item.titulo}
          </Text>
          {!item.leida && <View style={styles.dot} />}
        </View>
        <Text style={styles.cuerpo}>{item.cuerpo}</Text>
        <Text style={styles.time}>{timeAgo(item.timestamp)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <Header showBack />
      <FlatList
        data={notifs}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={styles.title}>Notificaciones</Text>}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={52} color={COLORS.border} />
            <Text style={styles.emptyText}>Sin notificaciones</Text>
            <Text style={styles.emptySub}>Te avisaremos cuando haya novedades.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },
  list: { padding: 16, paddingBottom: 32 },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: COLORS.foreground,
    marginBottom: 16,
  },
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  cardUnread: {
    backgroundColor: COLORS.primarySurface,
    borderColor: COLORS.primaryBorder,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconBoxUnread: {
    backgroundColor: "#fff",
    borderColor: COLORS.primaryBorder,
  },
  content: { flex: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  titulo: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
    flex: 1,
  },
  tituloUnread: {
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  cuerpo: {
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 19,
    marginBottom: 6,
  },
  time: {
    fontSize: 11,
    color: COLORS.mutedLight,
  },
  empty: {
    alignItems: "center",
    paddingTop: 80,
    gap: 10,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.muted,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.mutedLight,
    textAlign: "center",
  },
});
