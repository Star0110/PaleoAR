import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { registerUser, logoutUser } from "../../services/authService";
import { COLORS } from "../../styles/colors";

export default function RegisterScreen({ navigation }) {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert("Campos incompletos", "Por favor llena todos los campos.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Contraseña corta", "La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setLoading(true);
    try {
      await registerUser(name.trim(), email.trim(), password);
      await logoutUser();
      Alert.alert(
        "¡Cuenta creada!",
        "Tu cuenta ha sido registrada. Inicia sesión para continuar.",
        [{ text: "Ir a inicio de sesión", onPress: () => navigation.navigate("Login") }]
      );
    } catch (error) {
      Alert.alert("Error al registrarse", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar} />

        {/* HERO */}
        <View style={styles.hero}>
          <View style={styles.iconCircle} accessible={false}>
            <Ionicons name="person-add" size={32} color={COLORS.surface} />
          </View>
          <Text style={styles.title}>
            Crear<Text style={styles.titleAccent}> cuenta</Text>
          </Text>
          <Text style={styles.subtitle}>
            Únete y empieza a explorar el museo de fósiles con realidad aumentada
          </Text>
        </View>

        {/* CARD */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Datos de registro</Text>

          {/* Nombre */}
          <Text style={styles.fieldLabel}>Nombre completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Tu nombre"
            placeholderTextColor={COLORS.mutedLight}
            autoComplete="name"
            textContentType="name"
            value={name}
            onChangeText={setName}
            accessibilityLabel="Nombre completo"
          />

          {/* Email */}
          <Text style={styles.fieldLabel}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="tu@correo.com"
            placeholderTextColor={COLORS.mutedLight}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            value={email}
            onChangeText={setEmail}
            accessibilityLabel="Correo electrónico"
          />

          {/* Password */}
          <Text style={styles.fieldLabel}>Contraseña</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.inputFlex]}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={COLORS.mutedLight}
              secureTextEntry={!showPass}
              autoComplete="new-password"
              textContentType="newPassword"
              value={password}
              onChangeText={setPassword}
              accessibilityLabel="Contraseña"
            />
            <Pressable
              style={styles.eyeBtn}
              onPress={() => setShowPass((v) => !v)}
              hitSlop={8}
              accessibilityLabel={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              <Ionicons
                name={showPass ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={COLORS.muted}
              />
            </Pressable>
          </View>

          {/* Helper text */}
          <Text style={styles.helperText}>La contraseña debe tener al menos 6 caracteres.</Text>

          {/* Botón */}
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Registrarse"
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Crear cuenta</Text>
            }
          </Pressable>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes cuenta?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Login")}
              activeOpacity={0.7}
              hitSlop={8}
            >
              <Text style={styles.footerLink}>Iniciar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1 },
  topBar: { width: "100%", height: 4, backgroundColor: COLORS.primary },

  hero: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 24,
    gap: 12,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: COLORS.foreground,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  titleAccent: { color: COLORS.primary },
  subtitle: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 28,
    width: "88%",
    alignSelf: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.5,
    textTransform: "uppercase",
    color: COLORS.primary,
    marginBottom: 22,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  inputFlex: { flex: 1, marginBottom: 0 },
  eyeBtn: { position: "absolute", right: 14, padding: 4 },
  helperText: {
    fontSize: 11,
    color: COLORS.muted,
    marginBottom: 18,
    marginTop: 2,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 8,
    minHeight: 52,
    justifyContent: "center",
  },
  buttonPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "700", letterSpacing: 0.5 },

  divider: { flexDirection: "row", alignItems: "center", marginVertical: 16, gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { fontSize: 11, color: COLORS.mutedLight, letterSpacing: 1 },

  footer: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6 },
  footerText: { color: COLORS.muted, fontSize: 13 },
  footerLink: { color: COLORS.primary, fontSize: 13, fontWeight: "700", textDecorationLine: "underline" },
});
