import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  createNotificacion,
  getAllUserTokens,
  sendPushNotification,
} from "../../services/notificationsService";
import Header from "../../components/Header";
import { COLORS } from "../../styles/colors";

const TIPOS = [
  { key: "global", label: "Todos los usuarios", icon: "people-outline" },
  { key: "personal", label: "Usuario específico", icon: "person-outline" },
];

export default function SendNotificationScreen() {
  const [tipo, setTipo] = useState("global");
  const [titulo, setTitulo] = useState("");
  const [cuerpo, setCuerpo] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!titulo.trim() || !cuerpo.trim()) {
      Alert.alert("Campos incompletos", "Escribe un título y un mensaje.");
      return;
    }
    setSending(true);
    try {
      // 1. Guardar en Firestore (historial in-app)
      await createNotificacion({
        titulo: titulo.trim(),
        cuerpo: cuerpo.trim(),
        userId: tipo === "global" ? null : null, // se puede extender para personal
      });

      // 2. Enviar push a todos los tokens
      const tokens = await getAllUserTokens();
      await Promise.all(
        tokens.map((u) => sendPushNotification(u.token, titulo.trim(), cuerpo.trim()))
      );

      Alert.alert("Enviado", `Notificación enviada a ${tokens.length} usuario(s).`);
      setTitulo("");
      setCuerpo("");
    } catch (e) {
      Alert.alert("Error", "No se pudo enviar la notificación.");
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header showBack />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.eyebrow}>Administrar</Text>
        <Text style={styles.title}>Enviar Notificación</Text>

        {/* Selector tipo */}
        <Text style={styles.fieldLabel}>Destinatarios</Text>
        <View style={styles.tipoRow}>
          {TIPOS.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.tipoBtn, tipo === t.key && styles.tipoBtnActive]}
              onPress={() => setTipo(t.key)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={t.icon}
                size={16}
                color={tipo === t.key ? COLORS.surface : COLORS.muted}
              />
              <Text style={[styles.tipoBtnText, tipo === t.key && styles.tipoBtnTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },
  container: { padding: 20, paddingBottom: 40 },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primaryLight,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.foreground,
    marginBottom: 28,
  },
  tipoRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  tipoBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  tipoBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tipoBtnText: { fontSize: 13, fontWeight: "600", color: COLORS.muted },
  tipoBtnTextActive: { color: COLORS.surface },
  field: { marginBottom: 20 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textSecondary,
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingVertical: 13,
    paddingHorizontal: 16,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  multiline: {
    minHeight: 110,
    textAlignVertical: "top",
  },
  counter: {
    fontSize: 11,
    color: COLORS.mutedLight,
    textAlign: "right",
    marginTop: 4,
  },
  preview: { marginBottom: 24 },
  previewLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primary,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  previewCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.primarySurface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  previewBody: { fontSize: 13, color: COLORS.muted, lineHeight: 18 },
  sendBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 18,
  },
  sendBtnText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: "700",
  },
});
