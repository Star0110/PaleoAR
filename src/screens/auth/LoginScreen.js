import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Pressable,
  Alert,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { loginUser } from "../../services/authService";
import { COLORS } from "../../styles/colors";

export default function LoginScreen({ navigation }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Campos incompletos", "Ingresa tu correo y contraseña.");
      return;
    }
    setLoading(true);
    try {
      await loginUser(email.trim(), password);
    } catch (error) {
      Alert.alert("Error al iniciar sesión", error.message);
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
          <Image
            source={require("../../assets/PaleoAR_icono.png")}
            style={styles.logo}
            resizeMode="contain"
            accessible={false}
          />
          <Text style={styles.title}>
            Paleo<Text style={styles.titleAccent}>AR</Text>
          </Text>
          <Text style={styles.subtitle}>
            Un viaje moderno por el museo de fósiles
          </Text>
          <View style={styles.pillRow}>
            <View style={styles.pill}><Text style={styles.pillText}>AR</Text></View>
            <View style={styles.pill}><Text style={styles.pillText}>Museo de Fósiles</Text></View>
          </View>
        </View>

        {/* CARD */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Inicio de sesión</Text>

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
              placeholder="••••••••"
              placeholderTextColor={COLORS.mutedLight}
              secureTextEntry={!showPass}
              autoComplete="password"
              textContentType="password"
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

          <TouchableOpacity activeOpacity={0.7} style={styles.forgotRow}>
            <Text style={styles.forgot}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          {/* Botón */}
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Iniciar sesión"
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Iniciar sesión</Text>
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
            <Text style={styles.footerText}>¿No tienes cuenta?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Register")}
              activeOpacity={0.7}
              hitSlop={8}
            >
              <Text style={styles.footerLink}>Crear una</Text>
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
    paddingTop: 28,
    paddingBottom: 24,
  },
  logo: { width: 220, height: 80, marginBottom: 4 },
  title: {
    fontSize: 40,
    fontWeight: "900",
    color: COLORS.foreground,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  titleAccent: { color: COLORS.primary },
  subtitle: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 260,
    marginBottom: 16,
  },
  pillRow: { flexDirection: "row", gap: 8 },
  pill: {
    backgroundColor: COLORS.primarySurface,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 14,
  },
  pillText: { fontSize: 11, fontWeight: "700", color: COLORS.primary, letterSpacing: 0.5 },

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
    marginBottom: 14,
  },
  inputFlex: { flex: 1, marginBottom: 0 },
  eyeBtn: {
    position: "absolute",
    right: 14,
    padding: 4,
  },
  forgotRow: { alignItems: "center", marginBottom: 16 },
  forgot: {
    fontSize: 12.5,
    color: COLORS.muted,
    textDecorationLine: "underline",
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
