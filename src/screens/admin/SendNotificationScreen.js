import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Alert, ActivityIndicator, Modal, FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  createNotificacion, sendPushNotification,
} from "../../services/notificationsService";
import Header from "../../components/Header";
import { COLORS } from "../../styles/colors";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../services/firebase";

const TIPOS = [
  { key: "global",   label: "Todos",           icon: "earth-outline"    },
  { key: "grupo",    label: "Por grupo",        icon: "people-outline"   },
  { key: "personal", label: "Un usuario",       icon: "person-outline"   },
];

const GRUPOS = [
  { key: "user",  label: "Usuarios",       icon: "happy-outline",  color: "#2563EB" },
  { key: "admin", label: "Administradores", icon: "shield-outline", color: "#D97706" },
];

export default function SendNotificationScreen() {
  const [tipo, setTipo] = useState("global");
  const [titulo, setTitulo] = useState("");
  const [cuerpo, setCuerpo] = useState("");
  const [sending, setSending] = useState(false);

  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  // Carga usuarios al cambiar a grupo o personal
  useEffect(() => {
    if ((tipo === "personal" || tipo === "grupo") && usuarios.length === 0) {
      setLoadingUsuarios(true);
      getDocs(collection(db, "users"))
        .then((snap) => {
          setUsuarios(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        })
        .finally(() => setLoadingUsuarios(false));
    }
    if (tipo === "global")   { setUsuarioSeleccionado(null); setGrupoSeleccionado(null); }
    if (tipo === "grupo")    { setUsuarioSeleccionado(null); }
    if (tipo === "personal") { setGrupoSeleccionado(null); }
  }, [tipo]);

  const usuariosFiltrados = usuarios.filter(
    (u) =>
      u.expoPushToken &&
      (u.name?.toLowerCase().includes(busqueda.toLowerCase()) ||
       u.email?.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const handleSend = async () => {
    if (!titulo.trim() || !cuerpo.trim()) {
      Alert.alert("Campos incompletos", "Escribe un título y un mensaje.");
      return;
    }
    if (tipo === "personal" && !usuarioSeleccionado) {
      Alert.alert("Falta usuario", "Selecciona a quién enviar la notificación.");
      return;
    }
    if (tipo === "grupo" && !grupoSeleccionado) {
      Alert.alert("Falta grupo", "Selecciona un grupo destinatario.");
      return;
    }

    setSending(true);
    try {
      const t = titulo.trim();
      const c = cuerpo.trim();

      if (tipo === "global") {
        await createNotificacion({ titulo: t, cuerpo: c, userId: null });
        const targets = usuarios.filter((u) => u.expoPushToken);
        await Promise.all(targets.map((u) => sendPushNotification(u.expoPushToken, t, c)));
        Alert.alert("Enviado ✓", `Notificación enviada a ${targets.length} usuario(s).`);

      } else if (tipo === "grupo") {
        await createNotificacion({ titulo: t, cuerpo: c, userId: null, grupo: grupoSeleccionado });
        const targets = usuarios.filter((u) => u.role === grupoSeleccionado && u.expoPushToken);
        await Promise.all(targets.map((u) => sendPushNotification(u.expoPushToken, t, c)));
        const label = GRUPOS.find((g) => g.key === grupoSeleccionado)?.label;
        Alert.alert("Enviado ✓", `Notificación enviada a ${targets.length} ${label}.`);

      } else {
        const uid = usuarioSeleccionado.id ?? usuarioSeleccionado.uid;
        if (!uid) throw new Error("Usuario sin ID");
        await createNotificacion({ titulo: t, cuerpo: c, userId: uid });
        await sendPushNotification(usuarioSeleccionado.expoPushToken, t, c);
        Alert.alert("Enviado ✓", `Notificación enviada a ${usuarioSeleccionado.name}.`);
      }

      setTitulo("");
      setCuerpo("");
      setUsuarioSeleccionado(null);
      setGrupoSeleccionado(null);
    } catch (e) {
      Alert.alert("Error", "No se pudo enviar la notificación.");
    } finally {
      setSending(false);
    }
  };

  // ── Resumen del destinatario para mostrar debajo de las pestañas ──
  const renderDestinatario = () => {
    if (tipo === "global") return (
      <View style={styles.destinatarioBox}>
        <Ionicons name="earth" size={16} color="#2563EB" />
        <Text style={styles.destinatarioText}>Se enviará a <Text style={styles.bold}>todos los usuarios</Text></Text>
      </View>
    );

    if (tipo === "grupo") return (
      <View style={styles.grupoRow}>
        {loadingUsuarios ? <ActivityIndicator color={COLORS.primary} /> :
          GRUPOS.map((g) => {
            const count = usuarios.filter((u) => u.role === g.key && u.expoPushToken).length;
            const active = grupoSeleccionado === g.key;
            return (
              <TouchableOpacity
                key={g.key}
                style={[styles.grupoCard, active && { borderColor: g.color, backgroundColor: `${g.color}12` }]}
                onPress={() => setGrupoSeleccionado(active ? null : g.key)}
                activeOpacity={0.8}
              >
                <Ionicons name={g.icon} size={22} color={active ? g.color : COLORS.muted} />
                <Text style={[styles.grupoLabel, active && { color: g.color }]}>{g.label}</Text>
                <View style={[styles.countPill, { backgroundColor: active ? g.color : COLORS.border }]}>
                  <Text style={styles.countText}>{count}</Text>
                </View>
                {active && (
                  <View style={[styles.checkBadge, { backgroundColor: g.color }]}>
                    <Ionicons name="checkmark" size={10} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        }
      </View>
    );

    if (tipo === "personal") return (
      <View style={{ marginBottom: 20 }}>
        {loadingUsuarios ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 12 }} />
        ) : (
          <TouchableOpacity
            style={styles.userSelector}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            {usuarioSeleccionado ? (
              <View style={styles.userSelected}>
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>
                    {usuarioSeleccionado.name?.[0]?.toUpperCase() ?? "?"}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.userSelectedName}>{usuarioSeleccionado.name}</Text>
                  <Text style={styles.userSelectedEmail}>{usuarioSeleccionado.email}</Text>
                </View>
                <TouchableOpacity onPress={() => setUsuarioSeleccionado(null)}>
                  <Ionicons name="close-circle" size={20} color={COLORS.muted} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.userPlaceholder}>
                <Ionicons name="person-add-outline" size={18} color={COLORS.mutedLight} />
                <Text style={styles.userPlaceholderText}>Seleccionar usuario…</Text>
                <Ionicons name="chevron-down" size={16} color={COLORS.mutedLight} />
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header showBack />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.eyebrow}>Administrar</Text>
        <Text style={styles.title}>Enviar Notificación</Text>

        {/* Pestañas */}
        <Text style={styles.fieldLabel}>Destinatarios</Text>
        <View style={styles.tipoRow}>
          {TIPOS.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.tipoBtn, tipo === t.key && styles.tipoBtnActive]}
              onPress={() => setTipo(t.key)}
              activeOpacity={0.8}
            >
              <Ionicons name={t.icon} size={15} color={tipo === t.key ? COLORS.surface : COLORS.muted} />
              <Text style={[styles.tipoBtnText, tipo === t.key && styles.tipoBtnTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Selector dinámico */}
        {renderDestinatario()}

        {/* Título */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Título</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. ¡Nueva exhibición disponible!"
            placeholderTextColor={COLORS.mutedLight}
            value={titulo}
            onChangeText={setTitulo}
            maxLength={60}
          />
          <Text style={styles.counter}>{titulo.length}/60</Text>
        </View>

        {/* Mensaje */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Mensaje</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="Escribe el contenido de la notificación…"
            placeholderTextColor={COLORS.mutedLight}
            value={cuerpo}
            onChangeText={setCuerpo}
            multiline
            numberOfLines={4}
            maxLength={200}
          />
          <Text style={styles.counter}>{cuerpo.length}/200</Text>
        </View>

        {/* Preview */}
        {(titulo || cuerpo) ? (
          <View style={styles.preview}>
            <Text style={styles.previewLabel}>Vista previa</Text>
            <View style={styles.previewCard}>
              <Ionicons name="notifications" size={16} color={COLORS.primary} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.previewTitle}>{titulo || "Título"}</Text>
                <Text style={styles.previewBody}>{cuerpo || "Mensaje"}</Text>
              </View>
            </View>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.sendBtn, sending && { opacity: 0.6 }]}
          onPress={handleSend}
          disabled={sending}
          activeOpacity={0.8}
        >
          {sending ? (
            <ActivityIndicator color={COLORS.surface} />
          ) : (
            <>
              <Ionicons name="send" size={18} color={COLORS.surface} />
              <Text style={styles.sendBtnText}>Enviar notificación</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Modal selector de usuario */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleccionar usuario</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color={COLORS.foreground} />
            </TouchableOpacity>
          </View>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={16} color={COLORS.muted} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nombre o email…"
              placeholderTextColor={COLORS.mutedLight}
              value={busqueda}
              onChangeText={setBusqueda}
              autoFocus
            />
            {busqueda.length > 0 && (
              <TouchableOpacity onPress={() => setBusqueda("")}>
                <Ionicons name="close-circle" size={16} color={COLORS.muted} />
              </TouchableOpacity>
            )}
          </View>
          <FlatList
            data={usuariosFiltrados}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16 }}
            ListEmptyComponent={
              <View style={styles.emptyModal}>
                <Ionicons name="people-outline" size={40} color={COLORS.border} />
                <Text style={styles.emptyModalText}>Sin resultados</Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.userRow}
                onPress={() => { setUsuarioSeleccionado(item); setModalVisible(false); setBusqueda(""); }}
                activeOpacity={0.8}
              >
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>{item.name?.[0]?.toUpperCase() ?? "?"}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.userRowName}>{item.name}</Text>
                  <Text style={styles.userRowEmail}>{item.email}</Text>
                </View>
                <View style={[styles.rolePill, { backgroundColor: item.role === "admin" ? "#FEF3C7" : "#EFF6FF" }]}>
                  <Text style={[styles.roleText, { color: item.role === "admin" ? "#D97706" : "#2563EB" }]}>
                    {item.role}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },
  container: { padding: 20, paddingBottom: 40 },
  eyebrow: {
    fontSize: 12, fontWeight: "700", color: COLORS.primaryLight,
    letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4,
  },
  title: { fontSize: 28, fontWeight: "900", color: COLORS.foreground, marginBottom: 28 },
  tipoRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  tipoBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 5, paddingVertical: 11, borderRadius: 14, borderWidth: 1.5,
    borderColor: COLORS.border, backgroundColor: COLORS.surface,
  },
  tipoBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tipoBtnText: { fontSize: 12, fontWeight: "600", color: COLORS.muted },
  tipoBtnTextActive: { color: COLORS.surface },
  destinatarioBox: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#EFF6FF", borderRadius: 12, padding: 12,
    marginBottom: 20, borderWidth: 1, borderColor: "#BFDBFE",
  },
  destinatarioText: { fontSize: 13, color: "#1E40AF" },
  bold: { fontWeight: "700" },

  // Grupos
  grupoRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  grupoCard: {
    flex: 1, alignItems: "center", gap: 6, padding: 16,
    borderRadius: 16, borderWidth: 1.5, borderColor: COLORS.border,
    backgroundColor: COLORS.surface, position: "relative",
  },
  grupoLabel: { fontSize: 12, fontWeight: "700", color: COLORS.muted, textAlign: "center" },
  countPill: {
    borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2,
  },
  countText: { fontSize: 11, fontWeight: "700", color: "#fff" },
  checkBadge: {
    position: "absolute", top: 8, right: 8,
    width: 18, height: 18, borderRadius: 9,
    justifyContent: "center", alignItems: "center",
  },

  // User selector
  field: { marginBottom: 20 },
  fieldLabel: {
    fontSize: 12, fontWeight: "700", color: COLORS.textSecondary,
    letterSpacing: 0.3, marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.background, borderRadius: 14, borderWidth: 1.5,
    borderColor: COLORS.border, paddingVertical: 13, paddingHorizontal: 16,
    fontSize: 15, color: COLORS.textPrimary,
  },
  multiline: { minHeight: 110, textAlignVertical: "top" },
  counter: { fontSize: 11, color: COLORS.mutedLight, textAlign: "right", marginTop: 4 },
  userSelector: {
    borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.border,
    backgroundColor: COLORS.background, overflow: "hidden",
  },
  userPlaceholder: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingVertical: 13, paddingHorizontal: 16,
  },
  userPlaceholderText: { flex: 1, fontSize: 15, color: COLORS.mutedLight },
  userSelected: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 10, paddingHorizontal: 14,
  },
  userAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.primary, justifyContent: "center", alignItems: "center",
  },
  userAvatarText: { fontSize: 15, fontWeight: "900", color: COLORS.surface },
  userSelectedName: { fontSize: 14, fontWeight: "700", color: COLORS.textPrimary },
  userSelectedEmail: { fontSize: 11, color: COLORS.muted, marginTop: 1 },

  // Preview
  preview: { marginBottom: 24 },
  previewLabel: {
    fontSize: 11, fontWeight: "700", color: COLORS.primary,
    letterSpacing: 1, textTransform: "uppercase", marginBottom: 10,
  },
  previewCard: {
    flexDirection: "row", alignItems: "flex-start", backgroundColor: COLORS.primarySurface,
    borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.primaryBorder,
  },
  previewTitle: { fontSize: 14, fontWeight: "700", color: COLORS.textPrimary, marginBottom: 3 },
  previewBody: { fontSize: 13, color: COLORS.muted, lineHeight: 18 },

  // Send button
  sendBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 18,
  },
  sendBtnText: { color: COLORS.surface, fontSize: 16, fontWeight: "700" },

  // Modal
  modalHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  modalTitle: { fontSize: 17, fontWeight: "700", color: COLORS.textPrimary },
  searchContainer: {
    flexDirection: "row", alignItems: "center", margin: 16,
    backgroundColor: COLORS.background, borderRadius: 12,
    borderWidth: 1.5, borderColor: COLORS.border,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.textPrimary },
  userRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  userRowName: { fontSize: 14, fontWeight: "700", color: COLORS.textPrimary },
  userRowEmail: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  rolePill: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  roleText: { fontSize: 11, fontWeight: "700" },
  emptyModal: { alignItems: "center", paddingTop: 48, gap: 12 },
  emptyModalText: { fontSize: 14, color: COLORS.muted },
});